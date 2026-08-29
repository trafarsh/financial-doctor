import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId } from "@/lib/supabase/server";
import { retrieveContext } from "@/lib/rag/retrieve";
import { callOpenRouter, OpenRouterInvalidResponseError } from "@/lib/openrouter";
import { writeAuditLog } from "@/lib/audit";
import type { ScamCheckResult } from "@/lib/types";

const requestSchema = z.object({
  claimText: z.string().min(1).max(2000),
});

const responseSchema = z.object({
  verdict: z.enum(["likely_credible", "unverifiable", "likely_misleading", "likely_scam"]),
  explanation: z.string().min(1),
  sources: z.array(
    z.object({
      title: z.string(),
      url: z.string(),
      snippet: z.string().optional(),
    })
  ),
});

// docs/07_LLM_PROMPTS.md §0 - prepended verbatim to every system prompt.
const SHARED_COMPLIANCE_CLAUSE = `You are part of a financial-literacy and decision-support tool. You are NOT a
registered investment adviser. Absolute rules:
- Never tell the user to buy, sell, hold, or allocate any specific asset, amount,
  or percentage. No personalized investment directives of any kind.
- Frame everything as education, explanation, and questions the user could raise
  with a licensed adviser.
- Never invent figures. Use only numbers explicitly provided to you.
- Respond with ONLY the JSON object specified. No prose, no markdown, no code
  fences.`;

// docs/07_LLM_PROMPTS.md §2 - scam / claim check prompt, verbatim.
const SCAM_CHECK_PROMPT = `You assess whether a financial CLAIM is credible, using ONLY the provided sources.
Rules:
- If the sources do not support an assessment, set verdict to "unverifiable".
- You may never output "likely_credible", "likely_misleading", or "likely_scam"
  unless at least one provided source substantiates it.
- Cite the sources you used in the sources array (copy from those provided; do not
  fabricate URLs).
- Explanation is neutral and educational, not a directive.
Verdict ∈ ["likely_credible","unverifiable","likely_misleading","likely_scam"].
Output JSON:
{ "verdict": string, "explanation": string,
  "sources": [{ "title": string, "url": string, "snippet": string }] }`;

const SYSTEM_PROMPT = `${SHARED_COMPLIANCE_CLAUSE}\n\n${SCAM_CHECK_PROMPT}`;

const ROUTE = "/api/ai/scam-check";

export async function POST(req: Request) {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let claimText: string;
  try {
    const body = await req.json();
    ({ claimText } = requestSchema.parse(body));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const retrievedSources = await retrieveContext(claimText);

    // A5/A0 guard: if retrieval found nothing, the LLM is skipped entirely and
    // the verdict is forced to "unverifiable" IN CODE - the model never gets a
    // chance to police this itself. A check still happened, so it still gets
    // an audit row.
    if (retrievedSources.length === 0) {
      const result: ScamCheckResult = {
        claimText,
        verdict: "unverifiable",
        explanation:
          "We couldn't find a supporting source, so this claim is marked unverifiable rather than judged.",
        sources: [],
      };

      await writeAuditLog({
        userId,
        route: ROUTE,
        model: "n/a (no sources retrieved - LLM skipped)",
        prompt: claimText,
        response: JSON.stringify(result),
        sources: [],
      });

      return NextResponse.json({ result });
    }

    const userPrompt = `Claim to assess: "${claimText}"\n\nRetrieved sources (use ONLY these; do not invent others):\n${JSON.stringify(
      retrievedSources,
      null,
      2
    )}`;

    const aiResult = await callOpenRouter({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
      schema: responseSchema,
      route: ROUTE,
      userId,
      sources: retrievedSources,
    });

    // A5/step 5 post-validate: drop any source URL the model returned that
    // wasn't actually in the retrieved set (exact URL equality). If that
    // empties the array, re-guard by forcing "unverifiable".
    const retrievedUrls = new Set(retrievedSources.map((s) => s.url));
    let verdict = aiResult.verdict;
    let sources = aiResult.sources.filter((s) => retrievedUrls.has(s.url));
    let explanation = aiResult.explanation;

    if (sources.length === 0) {
      verdict = "unverifiable";
      sources = [];
      if (aiResult.sources.length > 0) {
        // The model cited sources but none were in the retrieved set -
        // fabricated/repaired away. Replace with a safe, accurate explanation.
        explanation =
          "The AI's cited sources could not be verified against retrieved evidence, so this claim is marked unverifiable.";
      }
    }

    const result: ScamCheckResult = {
      claimText,
      verdict,
      explanation,
      sources,
    };

    return NextResponse.json({ result });
  } catch (error) {
    if (error instanceof OpenRouterInvalidResponseError) {
      const result: ScamCheckResult = {
        claimText,
        verdict: "unverifiable",
        explanation:
          "We couldn't generate a reliable assessment right now, so this claim is marked unverifiable.",
        sources: [],
      };
      return NextResponse.json({ result });
    }
    console.error("[scam-check] unexpected error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
