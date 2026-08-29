export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { portfolioService } from "@/services/portfolio";
import { alertsService } from "@/services/alerts";
import { computeRiskScore, computeDiversification, generateAnomalyFlags } from "@/lib/finance";
import { callLLM } from "@/lib/openrouter";
import { z } from "zod";
import { RiskAnalysis } from "@/lib/types";
import { DEMO_USER_ID } from "@/lib/config";

const riskLLMSchema = z.object({
  explanation: z.string().min(1),
});

export async function GET(req: NextRequest) {
  try {
    const userId = DEMO_USER_ID;
    const { assets, liabilities } = await portfolioService.getHoldings(userId);

    const { diversificationScore } = computeDiversification(assets);
    const riskMetrics = computeRiskScore(assets, liabilities);
    const flags = generateAnomalyFlags(assets, liabilities);

    const systemPrompt = `
Explain these already-computed financial numbers to a retail investor in 2–4 sentences.
Rules:
- Reference the active risk score (${riskMetrics.riskScore}/100, ${riskMetrics.band}), diversification score (${diversificationScore}/100), and flags in plain language.
- Never tell the user to buy, sell, or allocate specific percentages.
- End with one or two questions the user could raise with a registered adviser.
- Output JSON: { "explanation": string }
`;

    const userPrompt = `
RISK SCORE: ${riskMetrics.riskScore}/100 (${riskMetrics.band})
DIVERSIFICATION SCORE: ${diversificationScore}/100
CONCENTRATION RISK: ${riskMetrics.concentrationRisk}/100
DEBT RISK: ${riskMetrics.debtRisk}/100
LIQUIDITY RISK: ${riskMetrics.liquidityRisk}/100
ACTIVE FLAGS: ${flags.map((f) => `[${f.severity.toUpperCase()}] ${f.message}`).join(", ") || "None"}
`;

    const fallbackExplanation = `Your Financial Risk Indicator is scored at ${riskMetrics.riskScore}/100 (${riskMetrics.band}), with a diversification score of ${diversificationScore}/100. ${
      flags.length > 0 ? flags[0].message : "Your holdings show a moderate spread across tracked categories."
    } You might consider asking a SEBI-registered advisor about how your current liquidity buffer aligns with your emergency goals.`;

    const { data } = await callLLM<{ explanation: string }>({
      systemPrompt,
      userPrompt,
      schema: riskLLMSchema,
      route: "/api/risk/analyze",
      userId,
      fallbackData: { explanation: fallbackExplanation },
    });

    const analysis: RiskAnalysis = {
      id: `risk_${Date.now()}`,
      userId,
      riskScore: riskMetrics.riskScore,
      diversificationScore,
      band: riskMetrics.band,
      volatilityScore: riskMetrics.volatilityScore,
      concentrationScore: riskMetrics.concentrationRisk,
      debtScore: riskMetrics.debtRisk,
      liquidityScore: riskMetrics.liquidityRisk,
      correlationScore: riskMetrics.correlationScore,
      sectorScore: riskMetrics.sectorScore,
      factors: riskMetrics.factors,
      flags,
      explanation: data.explanation,
      computedAt: new Date().toISOString(),
    };

    await alertsService.syncAlertsFromRiskAnalysis(userId, analysis);

    return NextResponse.json({ analysis });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to analyze risk" }, { status: 500 });
  }
}