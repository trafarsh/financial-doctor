export type AssetType =
  | "stock"
  | "mutual_fund"
  | "bank"
  | "real_estate"
  | "gold"
  | "other";

export type LiabilityType =
  | "loan"
  | "credit_card"
  | "mortgage"
  | "other";

export interface Asset {
  id: string;
  userId: string;
  type: AssetType;
  name: string;
  value: number;
  quantity?: number;
  lastUpdated: string;
}

export interface Liability {
  id: string;
  userId: string;
  type: LiabilityType;
  name: string;
  amount: number;
  interestRate?: number;
}

export interface NetWorthSnapshot {
  id: string;
  userId: string;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  computedAt: string;
}

export interface RiskAnalysis {
  id: string;
  userId: string;
  riskScore: number;
  diversificationScore: number;
  explanation: string;
  flags: AnomalyFlag[];
  computedAt: string;
}

export type AnomalyType =
  | "concentration"
  | "unusual_activity"
  | "high_debt_ratio"
  | "low_liquidity"
  | "other";

export interface AnomalyFlag {
  type: AnomalyType;
  severity:
    | "low"
    | "medium"
    | "high";
  message: string;
}

export interface Source {
  title: string;
  url: string;
  snippet?: string;
}

export type ScamVerdict =
  | "likely_credible"
  | "unverifiable"
  | "likely_misleading"
  | "likely_scam";

export interface ScamCheckResult {
  claimText: string;
  verdict: ScamVerdict;
  explanation: string;
  sources: Source[]; // if empty, verdict MUST be "unverifiable"
}

export interface SimulationScenario {
  userId: string;
  baselineNetWorth: number;
  assumptions: Record<string, number>;
  projectedNetWorth: number;
  projectionYears: number;
  yearlyPoints: { year: number; value: number }[];
  explanation: string;
}
