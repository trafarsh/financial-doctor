import type { Asset, Liability, AnomalyFlag } from "@/lib/types";

/**
 * All money math lives here as pure functions. The LLM never computes these
 * numbers - it only explains what these functions produce. Thresholds are
 * demo-grade heuristics fixed in docs/03_RISK_RULES.md; keep them as named
 * constants so they stay easy to tune and easy to point at during judging.
 */

// ---- Net worth -------------------------------------------------------

export function computeNetWorth(assets: Asset[], liabilities: Liability[]) {
  const totalAssets = assets.reduce((sum, a) => sum + a.value, 0);
  const totalLiabilities = liabilities.reduce((sum, l) => sum + l.amount, 0);
  const netWorth = totalAssets - totalLiabilities;
  return { totalAssets, totalLiabilities, netWorth };
}

// ---- Diversification ---------------------------------------------------

const ASSET_TYPE_COUNT = 6; // stock, mutual_fund, bank, real_estate, gold, other

export function computeHHI(assets: Asset[], totalAssets: number): number {
  if (totalAssets <= 0) return 1;
  const byType = new Map<string, number>();
  for (const a of assets) {
    byType.set(a.type, (byType.get(a.type) ?? 0) + a.value);
  }
  let hhi = 0;
  for (const value of byType.values()) {
    const share = value / totalAssets;
    hhi += share * share;
  }
  return hhi;
}

export function diversificationScore(assets: Asset[], totalAssets: number): number {
  if (totalAssets <= 0) return 0;
  const hhi = computeHHI(assets, totalAssets);
  const score = ((1 - hhi) / (1 - 1 / ASSET_TYPE_COUNT)) * 100;
  return Math.round(Math.max(0, Math.min(100, score)));
}

// ---- Risk score ----------------------------------------------------------

const RISK_WEIGHTS = { concentration: 0.4, debt: 0.4, liquidity: 0.2 } as const;

export function riskScore(
  assets: Asset[],
  totalAssets: number,
  totalLiabilities: number
): number {
  const hhi = computeHHI(assets, totalAssets);
  const concentrationRisk = hhi * 100;
  const debtRisk = Math.min(100, (totalLiabilities / Math.max(totalAssets, 1)) * 100);
  const bankValue = assets
    .filter((a) => a.type === "bank")
    .reduce((sum, a) => sum + a.value, 0);
  const liquidShare = bankValue / Math.max(totalAssets, 1);
  const liquidityRisk = 100 - liquidShare * 100;

  const score =
    RISK_WEIGHTS.concentration * concentrationRisk +
    RISK_WEIGHTS.debt * debtRisk +
    RISK_WEIGHTS.liquidity * liquidityRisk;
  return Math.round(score);
}

export type RiskBand = "lower" | "moderate" | "higher";

export function riskBand(score: number): RiskBand {
  if (score <= 33) return "lower";
  if (score <= 66) return "moderate";
  return "higher";
}

// ---- Anomaly flags ---------------------------------------------------

const THRESHOLDS = {
  concentrationHigh: 0.7,
  concentrationMedium: 0.5,
  debtRatioHigh: 0.5,
  debtRatioMedium: 0.3,
  lowLiquidity: 0.05,
} as const;

export function generateAnomalyFlags(
  assets: Asset[],
  totalAssets: number,
  totalLiabilities: number
): AnomalyFlag[] {
  const flags: AnomalyFlag[] = [];

  if (totalAssets === 0) {
    flags.push({
      type: "other",
      severity: "low",
      message: "No assets tracked yet - add some to see your analysis.",
    });
    return flags;
  }

  const byType = new Map<string, number>();
  for (const a of assets) {
    byType.set(a.type, (byType.get(a.type) ?? 0) + a.value);
  }
  let maxShare = 0;
  for (const value of byType.values()) {
    maxShare = Math.max(maxShare, value / totalAssets);
  }
  if (maxShare >= THRESHOLDS.concentrationHigh) {
    flags.push({
      type: "concentration",
      severity: "high",
      message:
        "70%+ of your assets sit in one category - concentrated portfolios move together.",
    });
  } else if (maxShare >= THRESHOLDS.concentrationMedium) {
    flags.push({
      type: "concentration",
      severity: "medium",
      message: "Over half your assets are in one category - worth understanding the tradeoff.",
    });
  }

  const debtRatio = totalLiabilities / totalAssets;
  if (debtRatio >= THRESHOLDS.debtRatioHigh) {
    flags.push({
      type: "high_debt_ratio",
      severity: "high",
      message:
        "Your debts are half or more of your assets - a common thing to discuss with an adviser.",
    });
  } else if (debtRatio >= THRESHOLDS.debtRatioMedium) {
    flags.push({
      type: "high_debt_ratio",
      severity: "medium",
      message: "Debt is a meaningful share of your assets.",
    });
  }

  const bankValue = byType.get("bank") ?? 0;
  const bankShare = bankValue / totalAssets;
  if (bankShare < THRESHOLDS.lowLiquidity) {
    flags.push({
      type: "low_liquidity",
      severity: "medium",
      message: "Very little is in cash/bank - you may have limited quick access to funds.",
    });
  }

  return flags;
}

// ---- What-if projection -------------------------------------------------

export interface ProjectionAssumptions {
  monthlyInvestment: number;
  annualReturnPct: number;
}

export interface ProjectionResult {
  projectedNetWorth: number;
  yearlyPoints: { year: number; value: number }[];
}

/**
 * Simple annual-compounding projection: at the start of each year, add that
 * year's contributions, then apply the annual return. LLM never computes this.
 */
export function projectNetWorth(
  baselineNetWorth: number,
  assumptions: ProjectionAssumptions,
  years: number
): ProjectionResult {
  const annualRate = assumptions.annualReturnPct / 100;
  const annualContribution = assumptions.monthlyInvestment * 12;

  let value = baselineNetWorth;
  const yearlyPoints: { year: number; value: number }[] = [{ year: 0, value }];
  for (let year = 1; year <= years; year++) {
    value = (value + annualContribution) * (1 + annualRate);
    yearlyPoints.push({ year, value: Math.round(value * 100) / 100 });
  }

  return { projectedNetWorth: Math.round(value * 100) / 100, yearlyPoints };
}
