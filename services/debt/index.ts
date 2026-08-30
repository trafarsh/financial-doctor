// ============================================================
// FINANCIAL DOCTOR (finX) — Rural Debt Comparison Service
// Deterministic effective-rate math + AI non-advisory explanation
// ============================================================

import { DebtComparisonInput, DebtComparisonResult } from "@/lib/types";
import { computeDebtComparison, FORMAL_DEBT_BENCHMARKS } from "@/lib/finance";
import { callLLM } from "@/lib/openrouter";
import { debtComparisonLLMResponseSchema } from "@/lib/validation";
import { APP_CONFIG } from "@/lib/config";

export class DebtComparisonService {
  async compare(userId: string, input: DebtComparisonInput): Promise<DebtComparisonResult> {
    // 1. Deterministic pure TS calculation (never in the LLM)
    const { effectiveAnnualRatePct, totalInformalCost, benchmarks } = computeDebtComparison(input);

    const cheapestBenchmark = benchmarks.reduce(
      (best, b) => (b.savingsVsInformal > best.savingsVsInformal ? b : best),
      benchmarks[0]
    );

    // 2. Call LLM for a non-advisory, plain-language framing of the comparison
    const systemPrompt = `
Explain this rural debt cost comparison in 2-3 short sentences for someone with limited financial literacy.
Rules:
- State the informal arrangement's effective annual rate of ${effectiveAnnualRatePct}% plainly.
- Compare it to the cheapest formal option's rate, "${cheapestBenchmark?.name}" at ${cheapestBenchmark?.annualRatePct}%.
- Never tell the user to switch lenders or take a specific action — describe the cost difference only.
- Use simple words, avoid jargon like "annualized" or "amortization."
- Output JSON: { "explanation": string }
`;

    const userPrompt = `
LOAN PRINCIPAL: ₹${input.principal.toLocaleString("en-IN")}
REPAYMENT TERM: ${input.termMonths} months
INFORMAL ARRANGEMENT EFFECTIVE RATE: ${effectiveAnnualRatePct}% per year
TOTAL COST UNDER INFORMAL ARRANGEMENT: ₹${totalInformalCost.toLocaleString("en-IN")}
CHEAPEST FORMAL BENCHMARK: ${cheapestBenchmark?.name} at ${cheapestBenchmark?.annualRatePct}% (total cost ₹${cheapestBenchmark?.totalFormalCost.toLocaleString("en-IN")})
ESTIMATED DIFFERENCE: ₹${cheapestBenchmark?.savingsVsInformal.toLocaleString("en-IN")}
`;

    const fallbackExplanation = `The informal arrangement works out to about ${effectiveAnnualRatePct}% per year. A formal option like ${cheapestBenchmark?.name} at ${cheapestBenchmark?.annualRatePct}% would cost roughly ₹${Math.abs(cheapestBenchmark?.savingsVsInformal || 0).toLocaleString("en-IN")} ${((cheapestBenchmark?.savingsVsInformal || 0) >= 0) ? "less" : "more"} over the same period. This is an illustrative comparison only.`;

    const { data } = await callLLM<{ explanation: string }>({
      systemPrompt,
      userPrompt,
      schema: debtComparisonLLMResponseSchema,
      route: "/api/debt/compare",
      userId,
      fallbackData: { explanation: fallbackExplanation },
    });

    return {
      input,
      effectiveAnnualRatePct,
      totalInformalCost,
      benchmarks,
      explanation: `${data.explanation}\n\n*${APP_CONFIG.disclaimer.simulation}*`,
    };
  }
}

export const debtComparisonService = new DebtComparisonService();
export { FORMAL_DEBT_BENCHMARKS };
