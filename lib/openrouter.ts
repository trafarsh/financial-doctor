import { z } from "zod";
import { writeAuditLog } from "@/lib/audit";
import type { Source } from "@/lib/types";

/**
 * Thrown when OpenRouter returns content that fails JSON.parse or zod
 * validation on both the initial attempt and the one repair retry. The
 * failure is audit-logged before this is thrown, so every call - success or
 * failure - leaves exactly one ai_audit_log row.
 */
export class OpenRouterInvalidResponseError extends Error {}

const JSON_REPAIR_NUDGE =
  "\n\nReturn valid JSON only, matching the schema, no prose, no markdown code fences.";

interface CallOpenRouterParams<T> {
  systemPrompt: string;
  userPrompt: string;
  schema: z.ZodSchema<T>;
  route: string;
  userId: string | null;
  sources?: Source[];
}

async function requestCompletion(
  systemPrompt: string,
  userPrompt: string,
  model: string,
  apiKey: string
): Promise<string> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("OpenRouter response missing message content");
  }
  return content;
}

/**
 * Calls OpenRouter, validates the JSON response against `schema`, retries
 * once with a JSON-repair nudge on failure, and writes exactly one
 * ai_audit_log row before the result reaches the caller - on success it logs
 * the validated response; on final failure it logs the failure and throws
 * OpenRouterInvalidResponseError. Callers never need to remember to audit.
 */
export async function callOpenRouter<T>(params: CallOpenRouterParams<T>): Promise<T> {
  const { systemPrompt, userPrompt, schema, route, userId, sources } = params;
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }
  if (!model) {
    throw new Error("OPENROUTER_MODEL is not set");
  }

  let lastRawContent = "";
  let lastErrorMessage = "";

  for (let attempt = 0; attempt < 2; attempt++) {
    const prompt = attempt === 0 ? userPrompt : userPrompt + JSON_REPAIR_NUDGE;
    try {
      const rawContent = await requestCompletion(systemPrompt, prompt, model, apiKey);
      lastRawContent = rawContent;

      let parsedJson: unknown;
      try {
        parsedJson = JSON.parse(rawContent);
      } catch {
        lastErrorMessage = "Response was not valid JSON";
        continue;
      }

      const validated = schema.safeParse(parsedJson);
      if (!validated.success) {
        lastErrorMessage = `Response failed schema validation: ${validated.error.message}`;
        continue;
      }

      await writeAuditLog({
        userId,
        route,
        model,
        prompt: userPrompt,
        response: JSON.stringify(validated.data),
        sources,
      });

      return validated.data;
    } catch (err) {
      lastErrorMessage = err instanceof Error ? err.message : String(err);
    }
  }

  await writeAuditLog({
    userId,
    route,
    model,
    prompt: userPrompt,
    response: `[OpenRouter call failed after 2 attempts] ${lastErrorMessage}${
      lastRawContent ? ` | last raw content: ${lastRawContent}` : ""
    }`,
    sources,
  });

  throw new OpenRouterInvalidResponseError(
    `OpenRouter call for ${route} failed after 2 attempts: ${lastErrorMessage}`
  );
}
