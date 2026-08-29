// ============================================================
// FINANCIAL DOCTOR (finX) — OpenRouter AI Gateway & Safety Wrapper
// Enforces JSON output, Zod schema validation, safety prompts, and audit logging
// ============================================================

import { z } from "zod";
import { APP_CONFIG } from "./config";
import { logAIOperation } from "./audit";
import { Source } from "./types";

interface CallLLMOptions<T> {
  systemPrompt: string;
  userPrompt: string;
  schema: z.ZodSchema<T>;
  route: string;
  userId?: string;
  sources?: Source[];
  fallbackData: T;
}

export async function callLLM<T>({
  systemPrompt,
  userPrompt,
  schema,
  route,
  userId,
  sources = [],
  fallbackData,
}: CallLLMOptions<T>): Promise<{ data: T; rawText: string; audited: boolean }> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || APP_CONFIG.ai.defaultModel;

  // Enforce mandatory safety clause prepended to all prompts
  const fullSystemPrompt = `${APP_CONFIG.disclaimer.aiSafetyClause}\n\n${systemPrompt}`;

  // If no API key is set, immediately return compliant fallback and log audit
  if (!apiKey || apiKey === "your-openrouter-api-key" || apiKey.trim() === "") {
    console.info(`[OpenRouter] No OPENROUTER_API_KEY configured. Using deterministic safe fallback for ${route}`);
    const rawFallback = JSON.stringify(fallbackData);
    await logAIOperation({
      userId,
      action: "llm_fallback",
      route,
      model: `${model} (offline fallback)`,
      prompt: `${fullSystemPrompt}\n\nUSER: ${userPrompt}`,
      response: rawFallback,
      sources,
    });
    return { data: fallbackData, rawText: rawFallback, audited: true };
  }

  let attempt = 0;
  let lastError: Error | null = null;
  let currentPrompt = userPrompt;

  while (attempt <= APP_CONFIG.ai.maxRetries) {
    attempt++;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), APP_CONFIG.ai.timeoutMs);

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://financial-doctor.local",
          "X-Title": "Financial Doctor Copilot",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: fullSystemPrompt },
            { role: "user", content: currentPrompt },
          ],
          temperature: APP_CONFIG.ai.temperature,
          response_format: { type: "json_object" },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API responded with ${response.status}: ${errorText}`);
      }

      const json = await response.json();
      const rawContent = json?.choices?.[0]?.message?.content || "{}";

      // Clean potential markdown wrappers
      const cleaned = rawContent.replace(/```json/gi, "").replace(/```/g, "").trim();

      const parsedJSON = JSON.parse(cleaned);
      const validationResult = schema.safeParse(parsedJSON);

      if (validationResult.success) {
        // Audit log success
        await logAIOperation({
          userId,
          action: "llm_completion",
          route,
          model,
          prompt: `${fullSystemPrompt}\n\nUSER: ${userPrompt}`,
          response: rawContent,
          sources,
        });

        return { data: validationResult.data, rawText: rawContent, audited: true };
      } else {
        console.warn(`[OpenRouter] Zod validation failed on attempt ${attempt}:`, validationResult.error);
        currentPrompt = `${userPrompt}\n\nIMPORTANT: Your previous response did not match the required JSON schema. Return ONLY a valid JSON object matching the schema without code blocks.`;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`[OpenRouter] Attempt ${attempt} failed:`, err.message);
    }
  }

  // Safe fallback if retries exhausted
  console.warn(`[OpenRouter] Retries exhausted for ${route}. Returning safe fallback.`);
  const fallbackRaw = JSON.stringify(fallbackData);
  await logAIOperation({
    userId,
    action: "llm_error_fallback",
    route,
    model: `${model} (error fallback: ${lastError?.message || "unknown"})`,
    prompt: `${fullSystemPrompt}\n\nUSER: ${userPrompt}`,
    response: fallbackRaw,
    sources,
  });

  return { data: fallbackData, rawText: fallbackRaw, audited: true };
}
