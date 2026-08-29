// ============================================================
// FINANCIAL DOCTOR (finX) — Scenario Simulation Service
// Deterministic compound mathematics + AI non-advisory explanation
// ============================================================

import { SimulationAssumption, SimulationScenario } from "@/lib/types";
import { projectNetWorth } from "@/lib/finance";
import { callLLM } from "@/lib/openrouter";
import { simulationLLMResponseSchema } from "@/lib/validation";
import { APP_CONFIG } from "@/lib/config";

export class SimulationService {
  async runScenario(
    userId: string,
    baselineNetWorth: number,
    assumptions: SimulationAssumption
  ): Promise<SimulationScenario> {
    // 1. Deterministic pure TS calculations (never in the LLM)
    const { projectedNetWorth, yearlyPoints, stressTestResults } = projectNetWorth(
      baselineNetWorth,
      assumptions
    );

    // 2. Call LLM for non-advisory educational explanation
    const systemPrompt = `
Explain this illustrative financial projection in 2–3 sentences for a retail investor.
Rules:
- State clearly that this is an illustrative compound projection based strictly on the assumed annual return of ${assumptions.annualReturnPct}% and monthly contribution of ₹${assumptions.monthlyInvestment.toLocaleString("en-IN")}.
- Emphasize that actual market performance fluctuates and this is not a guarantee, prediction, or recommendation.
- Never tell the user to change their contribution or pick a specific fund.
- Output JSON: { "explanation": string }
`;

    const userPrompt = `
BASELINE NET WORTH: ₹${baselineNetWorth.toLocaleString("en-IN")}
MONTHLY CONTRIBUTION: ₹${assumptions.monthlyInvestment.toLocaleString("en-IN")}
ANNUAL RETURN ASSUMPTION: ${assumptions.annualReturnPct}%
HORIZON: ${assumptions.years} years
PROJECTED NET WORTH: ₹${projectedNetWorth.toLocaleString("en-IN")}
TOTAL CONTRIBUTIONS: ₹${yearlyPoints[yearlyPoints.length - 1]?.contributions.toLocaleString("en-IN")}
ESTIMATED COMPOUND GROWTH: ₹${yearlyPoints[yearlyPoints.length - 1]?.interestEarned.toLocaleString("en-IN")}
`;

    const fallbackExplanation = `Over a ${assumptions.years}-year horizon with a monthly contribution of ₹${assumptions.monthlyInvestment.toLocaleString("en-IN")} and an illustrative ${assumptions.annualReturnPct}% annual return, the compound projection totals approximately ₹${projectedNetWorth.toLocaleString("en-IN")}. This is a mathematical simulation for educational purposes and does not account for real-time market volatility or taxes.`;

    const { data } = await callLLM<{ explanation: string }>({
      systemPrompt,
      userPrompt,
      schema: simulationLLMResponseSchema,
      route: "/api/simulator",
      userId,
      fallbackData: { explanation: fallbackExplanation },
    });

    return {
      userId,
      baselineNetWorth,
      assumptions,
      projectedNetWorth,
      projectionYears: assumptions.years,
      yearlyPoints,
      stressTestResults,
      explanation: `${data.explanation}\n\n*${APP_CONFIG.disclaimer.simulation}*`,
    };
  }
}

export const simulationService = new SimulationService();
