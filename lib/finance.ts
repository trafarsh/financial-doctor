// ============================================================
// FINANCIAL DOCTOR (finX) — Pure Financial Math & Analytics Engine
// 100% Pure TypeScript. Zero external dependencies. Zero AI hallucination.
// ============================================================

import {
  Asset,
  Liability,
  AssetType,
  AnomalyFlag,
  RiskAnalysis,
  RiskFactor,
  SimulationAssumption,
  SimulationYearlyPoint,
  DebtComparisonInput,
  FormalLoanBenchmark,
} from "./types";
import { APP_CONFIG } from "./config";

// Publicly published benchmark rates for formal rural credit (illustrative,
// re-verify against current RBI/NABARD circulars before external use).
export const FORMAL_DEBT_BENCHMARKS: FormalLoanBenchmark[] = [
  {
    name: "Kisan Credit Card (KCC)",
    annualRatePct: 7,
    sourceNote: "Interest subvention scheme effective rate for prompt repayment, up to ₹3 lakh",
  },
  {
    name: "Cooperative Bank Crop Loan",
    annualRatePct: 11,
    sourceNote: "Typical published rate for short-term cooperative agricultural credit",
  },
  {
    name: "SHG / JLG Group Lending",
    annualRatePct: 14,
    sourceNote: "Typical rotating-credit rate reported within NABARD-linked SHG programs",
  },
];

/**
 * 1. Computes aggregate asset value, liability value, and net worth
 */
export function computeNetWorth(assets: Asset[], liabilities: Liability[]): {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
} {
  const totalAssets = assets.reduce((sum, a) => sum + (Number(a.value) || 0), 0);
  const totalLiabilities = liabilities.reduce((sum, l) => sum + (Number(l.amount) || 0), 0);
  const netWorth = totalAssets - totalLiabilities;

  return {
    totalAssets: Math.round(totalAssets * 100) / 100,
    totalLiabilities: Math.round(totalLiabilities * 100) / 100,
    netWorth: Math.round(netWorth * 100) / 100,
  };
}

/**
 * 2. Computes Herfindahl-Hirschman Index (HHI) and 0-100 Diversification Score
 * Across the 6 canonical asset categories (stock/etf, mutual_fund, bank, real_estate, gold, other)
 */
export function computeDiversification(assets: Asset[]): {
  diversificationScore: number;
  hhi: number;
  sharesByType: Record<string, number>;
} {
  const totalAssets = assets.reduce((sum, a) => sum + (Number(a.value) || 0), 0);

  if (totalAssets <= 0) {
    return {
      diversificationScore: 0,
      hhi: 1.0,
      sharesByType: {},
    };
  }

  // Canonical 6 asset groups (map 'etf' to 'stock' for canonical HHI partition or track evenly)
  const canonicalTypes: AssetType[] = [
    "stock",
    "mutual_fund",
    "bank",
    "real_estate",
    "gold",
    "other",
  ];

  const typeSums: Record<string, number> = {};
  for (const t of canonicalTypes) {
    typeSums[t] = 0;
  }

  for (const asset of assets) {
    const rawType = asset.type;
    const mappedType: AssetType = rawType === "etf" ? "stock" : rawType;
    typeSums[mappedType] = (typeSums[mappedType] || 0) + (Number(asset.value) || 0);
  }

  const sharesByType: Record<string, number> = {};
  let hhi = 0;

  for (const t of canonicalTypes) {
    const share = typeSums[t] / totalAssets;
    sharesByType[t] = Math.round(share * 10000) / 10000;
    hhi += share * share;
  }

  // Normalization: 6 asset classes => min HHI = 1/6, max HHI = 1
  // Formula: round( (1 - HHI) / (1 - 1/6) * 100 )
  const minHHI = 1 / 6;
  const rawScore = ((1 - hhi) / (1 - minHHI)) * 100;
  const diversificationScore = Math.max(0, Math.min(100, Math.round(rawScore)));

  return {
    diversificationScore,
    hhi: Math.round(hhi * 10000) / 10000,
    sharesByType,
  };
}

/**
 * 3. Computes 0-100 Deterministic Risk Score (Financial Risk Indicator)
 * Weighted sum: 40% Concentration + 40% Debt Risk + 20% Liquidity Risk
 */
export function computeRiskScore(assets: Asset[], liabilities: Liability[]): {
  riskScore: number;
  band: "Lower Risk" | "Moderate Risk" | "Higher Risk";
  concentrationRisk: number;
  debtRisk: number;
  liquidityRisk: number;
  volatilityScore: number;
  correlationScore: number;
  sectorScore: number;
  factors: RiskFactor[];
} {
  const { totalAssets, totalLiabilities } = computeNetWorth(assets, liabilities);
  const { hhi, sharesByType } = computeDiversification(assets);

  if (totalAssets <= 0 && totalLiabilities <= 0) {
    return {
      riskScore: 0,
      band: "Lower Risk",
      concentrationRisk: 0,
      debtRisk: 0,
      liquidityRisk: 0,
      volatilityScore: 0,
      correlationScore: 0,
      sectorScore: 0,
      factors: [],
    };
  }

  const effectiveAssets = Math.max(totalAssets, 1);

  // Component 1: Concentration Risk (0 - 100) = HHI * 100
  const concentrationRisk = Math.min(100, Math.round(hhi * 100));

  // Component 2: Debt Risk (0 - 100) = (Total Liabilities / Total Assets) * 100 clamped
  const debtRatio = totalLiabilities / effectiveAssets;
  const debtRisk = Math.min(100, Math.round(debtRatio * 100));

  // Component 3: Liquidity Risk (0 - 100) = 100 - Bank share %
  const bankValue = assets
    .filter((a) => a.type === "bank")
    .reduce((sum, a) => sum + (Number(a.value) || 0), 0);
  const liquidShare = bankValue / effectiveAssets;
  const liquidityRisk = Math.max(0, Math.min(100, Math.round(100 - liquidShare * 100)));

  // Secondary factors for extended analytics (volatility, correlation, sector)
  const equityShare = (sharesByType["stock"] || 0) + (sharesByType["mutual_fund"] || 0);
  const volatilityScore = Math.min(100, Math.round(equityShare * 80 + debtRisk * 0.2));
  const correlationScore = Math.min(100, Math.round(concentrationRisk * 0.9));
  const sectorScore = Math.min(100, Math.round(concentrationRisk * 0.75));

  // Core formula: 40% concentration + 40% debt + 20% liquidity
  const rawRisk = 0.4 * concentrationRisk + 0.4 * debtRisk + 0.2 * liquidityRisk;
  const riskScore = Math.max(0, Math.min(100, Math.round(rawRisk)));

  let band: "Lower Risk" | "Moderate Risk" | "Higher Risk" = "Moderate Risk";
  if (riskScore <= 33) {
    band = "Lower Risk";
  } else if (riskScore >= 67) {
    band = "Higher Risk";
  }

  const factors: RiskFactor[] = [
    {
      name: "Portfolio Concentration",
      weight: 0.4,
      score: concentrationRisk,
      impact: concentrationRisk >= 60 ? "high" : concentrationRisk >= 35 ? "medium" : "low",
      explanation: `Asset distribution concentration is indexed at ${concentrationRisk}/100.`,
    },
    {
      name: "Debt Burden",
      weight: 0.4,
      score: debtRisk,
      impact: debtRisk >= 50 ? "high" : debtRisk >= 30 ? "medium" : "low",
      explanation: `Outstanding obligations represent ${(debtRatio * 100).toFixed(1)}% of tracked asset value.`,
    },
    {
      name: "Liquidity Buffer",
      weight: 0.2,
      score: liquidityRisk,
      impact: liquidityRisk >= 80 ? "high" : liquidityRisk >= 50 ? "medium" : "low",
      explanation: `Liquid cash/bank balances comprise ${(liquidShare * 100).toFixed(1)}% of your portfolio.`,
    },
  ];

  return {
    riskScore,
    band,
    concentrationRisk,
    debtRisk,
    liquidityRisk,
    volatilityScore,
    correlationScore,
    sectorScore,
    factors,
  };
}

/**
 * 4. Deterministic Anomaly & Health Flag Generator
 */
export function generateAnomalyFlags(assets: Asset[], liabilities: Liability[]): AnomalyFlag[] {
  const flags: AnomalyFlag[] = [];
  const { totalAssets, totalLiabilities } = computeNetWorth(assets, liabilities);

  if (totalAssets === 0) {
    flags.push({
      type: "other",
      severity: "low",
      message: "No assets tracked yet — add your holdings to generate full analytics.",
    });
    return flags;
  }

  // Check category concentration
  const categorySums: Record<string, number> = {};
  for (const asset of assets) {
    categorySums[asset.type] = (categorySums[asset.type] || 0) + (Number(asset.value) || 0);
  }

  for (const [type, sum] of Object.entries(categorySums)) {
    const share = sum / totalAssets;
    if (share >= APP_CONFIG.anomalyThresholds.singleAssetConcentrationHigh) {
      flags.push({
        type: "concentration",
        severity: "high",
        message: `70%+ of your assets sit in ${type.replace("_", " ")} — concentrated portfolios move together.`,
      });
    } else if (share >= APP_CONFIG.anomalyThresholds.singleAssetConcentrationMed) {
      flags.push({
        type: "concentration",
        severity: "medium",
        message: `Over half your assets (${Math.round(share * 100)}%) are in ${type.replace("_", " ")} — worth understanding the tradeoff.`,
      });
    }
  }

  // Check debt ratio
  const debtRatio = totalLiabilities / totalAssets;
  if (debtRatio >= APP_CONFIG.anomalyThresholds.debtToAssetHigh) {
    flags.push({
      type: "high_debt_ratio",
      severity: "high",
      message: "Your debts are half or more of your assets — a common topic to discuss with an adviser.",
    });
  } else if (debtRatio >= APP_CONFIG.anomalyThresholds.debtToAssetMed) {
    flags.push({
      type: "high_debt_ratio",
      severity: "medium",
      message: "Debt is a meaningful share of your assets (30%+).",
    });
  }

  // Check liquidity
  const bankValue = categorySums["bank"] || 0;
  const bankShare = bankValue / totalAssets;
  if (bankShare < APP_CONFIG.anomalyThresholds.lowLiquidityBankShare && totalAssets > 0) {
    flags.push({
      type: "low_liquidity",
      severity: "medium",
      message: "Very little is in cash/bank (<5%) — you may have limited immediate liquidity for emergencies.",
    });
  }

  return flags;
}

/**
 * 5. Deterministic Compound Net Worth Projection (What-If Simulator)
 * Pure compound interest math: Baseline*(1+r)^t + PMT*12*(((1+r)^t - 1)/r)
 */
export function projectNetWorth(
  baselineNetWorth: number,
  assumptions: SimulationAssumption
): {
  projectedNetWorth: number;
  yearlyPoints: SimulationYearlyPoint[];
  stressTestResults: {
    scenarioName: string;
    impactAmount: number;
    impactPct: number;
    projectedValue: number;
  }[];
} {
  const { monthlyInvestment, annualReturnPct, years, marketShockPct } = assumptions;
  const r = annualReturnPct / 100;
  const yearlyPoints: SimulationYearlyPoint[] = [];

  const initialPrincipal = Math.max(0, baselineNetWorth);
  let accumulatedValue = initialPrincipal;
  let totalContributions = initialPrincipal;

  for (let t = 1; t <= years; t++) {
    // Annual compound with monthly annuity contributions
    if (r === 0) {
      accumulatedValue = initialPrincipal + monthlyInvestment * 12 * t;
    } else {
      // Future Value of initial sum + Future Value of annuity
      const fvInitial = initialPrincipal * Math.pow(1 + r, t);
      const fvAnnuity = monthlyInvestment * 12 * ((Math.pow(1 + r, t) - 1) / r);
      accumulatedValue = fvInitial + fvAnnuity;
    }

    totalContributions = initialPrincipal + monthlyInvestment * 12 * t;
    const interestEarned = Math.max(0, accumulatedValue - totalContributions);

    yearlyPoints.push({
      year: t,
      value: Math.round(accumulatedValue),
      contributions: Math.round(totalContributions),
      interestEarned: Math.round(interestEarned),
    });
  }

  const projectedNetWorth = yearlyPoints[yearlyPoints.length - 1]?.value || initialPrincipal;

  // Stress tests (e.g. market drop, tech crash)
  const stressTestResults = [
    {
      scenarioName: "20% Market Correction",
      impactAmount: Math.round(projectedNetWorth * -0.2),
      impactPct: -20,
      projectedValue: Math.round(projectedNetWorth * 0.8),
    },
    {
      scenarioName: "30% Tech Sector Drawdown",
      impactAmount: Math.round(projectedNetWorth * -0.12),
      impactPct: -12,
      projectedValue: Math.round(projectedNetWorth * 0.88),
    },
    {
      scenarioName: "High Inflation (8% Drag)",
      impactAmount: Math.round(projectedNetWorth * -0.18),
      impactPct: -18,
      projectedValue: Math.round(projectedNetWorth * 0.82),
    },
  ];

  if (marketShockPct && marketShockPct !== 0) {
    const shockImpact = projectedNetWorth * (marketShockPct / 100);
    stressTestResults.unshift({
      scenarioName: `Custom Market Shock (${marketShockPct > 0 ? "+" : ""}${marketShockPct}%)`,
      impactAmount: Math.round(shockImpact),
      impactPct: marketShockPct,
      projectedValue: Math.round(projectedNetWorth + shockImpact),
    });
  }

  return {
    projectedNetWorth,
    yearlyPoints,
    stressTestResults,
  };
}

/**
 * 6. Effective Annual Rate & Cost Comparison for Informal Rural Debt
 * Converts an informal repayment arrangement (e.g. "₹500 extra per ₹5,000 per
 * month") into a standardized effective annual interest rate, then compares
 * total cost against published formal-lending benchmarks over the same term
 * and principal. Pure TS — no LLM involved in any of these numbers.
 */
export function computeDebtComparison(
  input: DebtComparisonInput,
  benchmarks: FormalLoanBenchmark[] = FORMAL_DEBT_BENCHMARKS
): {
  effectiveAnnualRatePct: number;
  totalInformalCost: number;
  benchmarks: (FormalLoanBenchmark & { totalFormalCost: number; savingsVsInformal: number })[];
} {
  const { principal, informalCharge, chargeUnit, termMonths } = input;

  if (principal <= 0 || termMonths <= 0) {
    return { effectiveAnnualRatePct: 0, totalInformalCost: 0, benchmarks: [] };
  }

  // Normalize the informal charge into a total cost paid over the full term,
  // then annualize it as simple interest on the principal (the standard way
  // rural moneylender terms are converted for comparison purposes).
  let totalInformalCost: number;
  if (chargeUnit === "per_month") {
    totalInformalCost = informalCharge * termMonths;
  } else if (chargeUnit === "per_week") {
    const weeksInTerm = (termMonths * 52) / 12;
    totalInformalCost = informalCharge * weeksInTerm;
  } else {
    totalInformalCost = informalCharge;
  }

  const years = termMonths / 12;
  const effectiveAnnualRatePct = years > 0 ? (totalInformalCost / principal / years) * 100 : 0;

  const benchmarkResults = benchmarks.map((b) => {
    const totalFormalCost = principal * (b.annualRatePct / 100) * years;
    return {
      ...b,
      totalFormalCost: Math.round(totalFormalCost),
      savingsVsInformal: Math.round(totalInformalCost - totalFormalCost),
    };
  });

  return {
    effectiveAnnualRatePct: Math.round(effectiveAnnualRatePct * 10) / 10,
    totalInformalCost: Math.round(totalInformalCost),
    benchmarks: benchmarkResults,
  };
}

/**
 * 7. Combined Full Financial Health Assessment
 */
export function analyzeFullRisk(
  userId: string,
  assets: Asset[],
  liabilities: Liability[],
  customExplanation?: string
): RiskAnalysis {
  const { diversificationScore } = computeDiversification(assets);
  const riskResult = computeRiskScore(assets, liabilities);
  const flags = generateAnomalyFlags(assets, liabilities);

  return {
    id: `risk_${Date.now()}`,
    userId,
    riskScore: riskResult.riskScore,
    diversificationScore,
    band: riskResult.band,
    volatilityScore: riskResult.volatilityScore,
    concentrationScore: riskResult.concentrationRisk,
    debtScore: riskResult.debtRisk,
    liquidityScore: riskResult.liquidityRisk,
    correlationScore: riskResult.correlationScore,
    sectorScore: riskResult.sectorScore,
    factors: riskResult.factors,
    flags,
    explanation:
      customExplanation ||
      `Your Financial Risk Indicator is ${riskResult.riskScore}/100 (${riskResult.band}). Diversification index is ${diversificationScore}/100. Consider discussing your concentration and debt allocation with a certified financial adviser.`,
    computedAt: new Date().toISOString(),
  };
}
