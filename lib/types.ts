// ============================================================
// FINANCIAL DOCTOR (finX) — Shared Master Types & Contracts
// Single Source of Truth: All modules & APIs share these types
// ============================================================

// ------------------------------------------------------------
// 1. User & Profile Types
// ------------------------------------------------------------
export interface User {
  id: string;
  email: string;
  created_at?: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name?: string;
  currency: string;
  risk_tolerance?: "conservative" | "moderate" | "aggressive";
  created_at: string;
  updated_at: string;
}

// ------------------------------------------------------------
// 2. Asset & Liability Types (Canonical & User Holdings)
// ------------------------------------------------------------
export type AssetType =
  | "stock"
  | "etf"
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
  symbol?: string;
  isin?: string;
  exchange?: string;
  sector?: string;
  value: number;            // current value in INR (₹)
  quantity?: number;
  purchasePrice?: number;
  lastUpdated: string;      // ISO string
}

export interface AssetInput {
  type: AssetType;
  name: string;
  symbol?: string;
  sector?: string;
  value: number;
  quantity?: number;
  purchasePrice?: number;
}

export interface Liability {
  id: string;
  userId: string;
  type: LiabilityType;
  name: string;
  amount: number;           // outstanding principal in ₹
  interestRate?: number;    // annual percentage %
  monthlyPayment?: number;
}

export interface LiabilityInput {
  type: LiabilityType;
  name: string;
  amount: number;
  interestRate?: number;
  monthlyPayment?: number;
}

export interface Portfolio {
  id: string;
  userId: string;
  name: string;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  updatedAt: string;
}

export interface PortfolioHolding {
  id: string;
  portfolioId: string;
  userId: string;
  assetId?: string;
  name: string;
  type: AssetType | LiabilityType;
  category: "asset" | "liability";
  value: number;
  quantity?: number;
  allocationPct: number;
  sector?: string;
  lastUpdated: string;
}

export interface Transaction {
  id: string;
  userId: string;
  portfolioId?: string;
  type: "buy" | "sell" | "deposit" | "withdrawal" | "dividend" | "interest";
  assetName: string;
  amount: number;
  quantity?: number;
  date: string;
}

// ------------------------------------------------------------
// 3. Time Series & Net Worth Snapshots
// ------------------------------------------------------------
export interface NetWorthSnapshot {
  id: string;
  userId: string;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  computedAt: string;       // ISO date
}

// ------------------------------------------------------------
// 4. Market Data & Fundamentals
// ------------------------------------------------------------
export interface AssetPrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  change24hPct: number;
  high24h: number;
  low24h: number;
  volume: number;
  updatedAt: string;
  source: string;
}

export interface AssetFundamental {
  symbol: string;
  name: string;
  marketCap: number;
  peRatio?: number;
  eps?: number;
  revenue?: number;
  netIncome?: number;
  totalDebt?: number;
  dividendYield?: number;
  sector: string;
  industry?: string;
  updatedAt: string;
}

export interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePct: number;
  trend: "up" | "down" | "flat";
  historicalPoints?: { time: string; value: number }[];
}

export interface MarketEvent {
  id: string;
  title: string;
  category: "monetary_policy" | "corporate_earnings" | "inflation" | "macro";
  impact: "low" | "medium" | "high";
  date: string;
  description: string;
}

// ------------------------------------------------------------
// 5. News & Sentiment
// ------------------------------------------------------------
export interface NewsSource {
  id: string;
  name: string;
  url: string;
  credibilityScore: number;
}

export interface NewsArticle {
  id: string;
  title: string;
  url: string;
  source: string;
  summary: string;
  publishedAt: string;
  ticker?: string;
  sentiment: "positive" | "neutral" | "negative";
  sentimentScore: number;   // -1.0 to 1.0
}

// ------------------------------------------------------------
// 6. Risk, Diversification & Anomaly Engine
// ------------------------------------------------------------
export type AnomalyType =
  | "concentration"
  | "unusual_activity"
  | "high_debt_ratio"
  | "low_liquidity"
  | "volatility_spike"
  | "other";

export interface AnomalyFlag {
  type: AnomalyType;
  severity: "low" | "medium" | "high";
  message: string;
}

export interface RiskFactor {
  name: string;
  weight: number;
  score: number;           // 0 - 100
  impact: "low" | "medium" | "high";
  explanation: string;
}

export interface RiskAnalysis {
  id: string;
  userId: string;
  riskScore: number;            // 0 - 100, higher = riskier (Financial Risk Indicator)
  diversificationScore: number; // 0 - 100, higher = better spread
  band: "Lower Risk" | "Moderate Risk" | "Higher Risk";
  volatilityScore: number;
  concentrationScore: number;
  debtScore: number;
  liquidityScore: number;
  correlationScore: number;
  sectorScore: number;
  factors: RiskFactor[];
  flags: AnomalyFlag[];
  explanation: string;          // Literacy-framed non-advisory educational commentary
  computedAt: string;
}

// ------------------------------------------------------------
// 7. RAG & Citations
// ------------------------------------------------------------
export interface Source {
  id?: string;
  title: string;
  url: string;
  snippet?: string;
  publishedAt?: string;
}

export interface Citation {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt?: string;
  snippet?: string;
}

export interface ReferenceSnippet {
  id: string;
  topic: string;
  title: string;
  url: string;
  snippet: string;
}

// ------------------------------------------------------------
// 8. Scam & Misinformation Detector
// ------------------------------------------------------------
export type ScamVerdict =
  | "likely_credible"
  | "unverifiable"
  | "likely_misleading"
  | "likely_scam";

export type ScamRiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface ScamCheckResult {
  claimText: string;
  verdict: ScamVerdict;
  riskScore: number;        // 0 to 100
  riskLevel: ScamRiskLevel;
  detectedSignals: string[];
  explanation: string;
  sources: Source[];        // If empty, verdict MUST be "unverifiable"
}

export interface ScamAnalysis extends ScamCheckResult {
  id: string;
  userId: string;
  analyzedAt: string;
}

// ------------------------------------------------------------
// 9. Simulation & What-If Engine
// ------------------------------------------------------------
export interface SimulationAssumption {
  monthlyInvestment: number;
  annualReturnPct: number;
  years: number;
  inflationPct?: number;
  marketShockPct?: number;
  sectorShock?: { sector: string; dropPct: number };
}

export interface SimulationYearlyPoint {
  year: number;
  value: number;
  contributions: number;
  interestEarned: number;
}

export interface SimulationScenario {
  userId: string;
  baselineNetWorth: number;
  assumptions: SimulationAssumption;
  projectedNetWorth: number;
  projectionYears: number;
  yearlyPoints: SimulationYearlyPoint[];
  stressTestResults?: {
    scenarioName: string;
    impactAmount: number;
    impactPct: number;
    projectedValue: number;
  }[];
  explanation: string;      // Non-advisory illustrative explanation
}

export interface SimulationResult {
  id: string;
  scenario: SimulationScenario;
  createdAt: string;
}

// ------------------------------------------------------------
// 10. AI Copilot & Conversations
// ------------------------------------------------------------
export interface AIMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  citations?: Citation[];
  confidence?: number;
  factors?: string[];
  riskLevel?: string;
  timestamp: string;
}

export interface AIConversation {
  id: string;
  userId: string;
  title: string;
  messages: AIMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface AIInsight {
  id: string;
  userId: string;
  type: "risk_warning" | "diversification_tip" | "market_context" | "anomaly_alert";
  title: string;
  description: string;
  severity: "low" | "medium" | "high";
  actionLabel?: string;
  citations?: Citation[];
  createdAt: string;
}

// ------------------------------------------------------------
// 11. Alerts & Notifications
// ------------------------------------------------------------
export interface Alert {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "risk_change" | "concentration_alert" | "scam_warning" | "market_shock" | "info";
  severity: "low" | "medium" | "high" | "critical";
  read: boolean;
  dismissed: boolean;
  createdAt: string;
}

// ------------------------------------------------------------
// 12. Audit Trail
// ------------------------------------------------------------
export interface AuditLog {
  id: string;
  userId?: string;
  requestId?: string;
  action: string;
  route: string;
  model: string;
  prompt: string;
  response: string;
  sources: Source[];
  inputHash?: string;
  outputHash?: string;
  createdAt: string;
}

// ------------------------------------------------------------
// 13. Rural Debt Comparison (Informal vs. Formal Lending)
// ------------------------------------------------------------
export type InformalRepaymentUnit = "per_month" | "per_week" | "lump_sum";

export interface DebtComparisonInput {
  principal: number;                    // ₹ borrowed
  informalCharge: number;               // ₹ extra paid per unit period (or total extra for lump_sum)
  chargeUnit: InformalRepaymentUnit;
  termMonths: number;                   // total repayment horizon in months
}

export interface FormalLoanBenchmark {
  name: string;                         // e.g. "Kisan Credit Card (KCC)"
  annualRatePct: number;                // published effective annual rate
  sourceNote: string;                   // where the benchmark rate comes from
}

export interface DebtComparisonResult {
  input: DebtComparisonInput;
  effectiveAnnualRatePct: number;       // computed from the informal arrangement
  totalInformalCost: number;            // ₹ total interest/charges paid over termMonths
  benchmarks: (FormalLoanBenchmark & { totalFormalCost: number; savingsVsInformal: number })[];
  explanation: string;                  // Non-advisory plain-language framing
}

// ------------------------------------------------------------
// 13. Reports
// ------------------------------------------------------------
export interface ComprehensiveReport {
  id: string;
  userId: string;
  generatedAt: string;
  portfolioSummary: {
    totalAssets: number;
    totalLiabilities: number;
    netWorth: number;
    topAsset: string;
  };
  assetAllocation: { type: string; value: number; pct: number }[];
  sectorExposure: { sector: string; value: number; pct: number }[];
  riskOverview: {
    riskScore: number;
    diversificationScore: number;
    band: string;
    flags: AnomalyFlag[];
  };
  holdingsSnapshot: { name: string; type: string; value: number }[];
  marketContext: string;
  aiInsights: string[];
  citations: Citation[];
}
