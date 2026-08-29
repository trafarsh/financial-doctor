import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId, createServerSupabaseClient } from "@/lib/supabase/server";
import { callOpenRouter, OpenRouterInvalidResponseError } from "@/lib/openrouter";
import { computeNetWorth, projectNetWorth } from "@/lib/finance";
import type { Asset, Liability, SimulationScenario } from "@/lib/types";

// userId is intentionally NOT part of this schema - it is derived from the
// authenticated session via requireUserId(), never trusted from the body.
const requestSchema = z.object({
  assumptions: z.object({
    monthlyInvestment: z.number(),
    annualReturnPct: z.number(),
  }),
  years: z.number().int().min(1).max(40),
});

const responseSchema = z.object({
  explanation: z.string().min(1),
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

// docs/07_LLM_PROMPTS.md §3 - simulation explanation prompt, verbatim.
const SIMULATION_PROMPT = `Explain this illustrative projection in 2–3 sentences for a non-expert. Make clear
it is a simple model based on the stated assumptions, not a prediction, guarantee,
or recommendation. Do not suggest changing the assumptions in any specific
direction. Output JSON: { "explanation": string }`;

const SYSTEM_PROMPT = `${SHARED_COMPLIANCE_CLAUSE}\n\n${SIMULATION_PROMPT}`;

const ROUTE = "/api/ai/simulate";

const FALLBACK_EXPLANATION =
  "This is a simple illustrative projection based on your stated assumptions — not a prediction or guarantee.";

export async function POST(req: Request) {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let assumptions: { monthlyInvestment: number; annualReturnPct: number };
  let years: number;
  try {
    const body = await req.json();
    ({ assumptions, years } = requestSchema.parse(body));
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
    const supabase = await createServerSupabaseClient();

    const [{ data: assetRows, error: assetsError }, { data: liabilityRows, error: liabilitiesError }] =
      await Promise.all([
        supabase.from("assets").select("*").eq("user_id", userId),
        supabase.from("liabilities").select("*").eq("user_id", userId),
      ]);

    if (assetsError || liabilitiesError) {
      console.error("[simulate] failed to load holdings", assetsError, liabilitiesError);
      return NextResponse.json({ error: "Failed to load holdings" }, { status: 500 });
    }

    const assets: Asset[] = (assetRows ?? []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      type: row.type,
      name: row.name,
      value: Number(row.value),
      quantity: row.quantity != null ? Number(row.quantity) : undefined,
      lastUpdated: row.last_updated,
    }));

    const liabilities: Liability[] = (liabilityRows ?? []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      type: row.type,
      name: row.name,
      amount: Number(row.amount),
      interestRate: row.interest_rate != null ? Number(row.interest_rate) : undefined,
    }));

    // All money math runs in /lib/finance.ts - never reimplemented here, never
    // computed by the LLM.
    const { netWorth: baselineNetWorth } = computeNetWorth(assets, liabilities);
    const { projectedNetWorth, yearlyPoints } = projectNetWorth(baselineNetWorth, assumptions, years);

    let explanation = FALLBACK_EXPLANATION;
    try {
      const userPrompt = `Baseline net worth: ${baselineNetWorth}
Assumptions: monthly investment = ${assumptions.monthlyInvestment}, annual return = ${assumptions.annualReturnPct}%
Projection years: ${years}
Computed projected net worth (already calculated - do not recompute): ${projectedNetWorth}

Explain this illustrative projection.`;

      const aiResult = await callOpenRouter({
        systemPrompt: SYSTEM_PROMPT,
        userPrompt,
        schema: responseSchema,
        route: ROUTE,
        userId,
      });
      explanation = aiResult.explanation;
    } catch (error) {
      if (error instanceof OpenRouterInvalidResponseError) {
        explanation = FALLBACK_EXPLANATION;
      } else {
        throw error;
      }
    }

    const scenario: SimulationScenario = {
      userId,
      baselineNetWorth,
      assumptions,
      projectedNetWorth,
      projectionYears: years,
      yearlyPoints,
      explanation,
    };

    return NextResponse.json({ scenario });
  } catch (error) {
    console.error("[simulate] unexpected error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
