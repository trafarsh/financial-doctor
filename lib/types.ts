export interface Asset {
  id: string;
  userId: string;
  type:
    | "stock"
    | "mutual_fund"
    | "bank"
    | "real_estate"
    | "gold"
    | "other";
  name: string;
  value: number;
  quantity?: number;
  lastUpdated: string;
}

export interface Liability {
  id: string;
  userId: string;
  type:
    | "loan"
    | "credit_card"
    | "mortgage"
    | "other";
  name: string;
  amount: number;
  interestRate?: number;
}

export interface NetWorthSnapshot {
  userId: string;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  computedAt: string;
}

export interface RiskAnalysis {
  userId: string;
  riskScore: number;
  diversificationScore: number;
  explanation: string;
  flags: AnomalyFlag[];
}

export interface AnomalyFlag {
  type:
    | "concentration"
    | "unusual_activity"
    | "high_debt_ratio"
    | "other";
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

export interface ScamCheckResult {
  claimText: string;
  verdict:
    | "likely_credible"
    | "unverifiable"
    | "likely_misleading"
    | "likely_scam";
  explanation: string;
  sources: Source[];
}

export interface SimulationScenario {
  userId: string;
  baselineNetWorth: number;
  assumptions: Record<string, number>;
  projectedNetWorth: number;
  projectionYears: number;
}
