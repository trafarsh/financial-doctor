// ============================================================
// FINANCIAL DOCTOR (finX) — Central Configuration & Constants
// ============================================================

export const APP_CONFIG = {
  name: "Financial Doctor",
  tagline: "AI Investor & Financial Literacy Copilot",
  currency: "INR",
  currencySymbol: "₹",
  locale: "en-IN",

  // Compliance & Disclaimers
  disclaimer: {
    persistent:
      "financial-doctor is a financial-literacy tool, not a registered investment adviser. It does not provide personalized investment advice.",
    simulation:
      "Illustrative scenario based on deterministic models. Not a prediction, guarantee, or investment advice.",
    scamZeroSource:
      "We couldn't find a verified supporting source in our regulatory database, so this claim is marked Unverifiable rather than judged.",
    aiSafetyClause:
      "You are part of a financial-literacy and decision-support tool. You are NOT a registered investment adviser. Never tell the user to buy, sell, hold, or allocate any specific asset, amount, or percentage. Frame everything as education, explanation, and questions the user could raise with a licensed adviser. Never invent figures.",
  },

  // Deterministic Risk Engine Weights (Sum = 1.0)
  riskWeights: {
    volatility: 0.30,
    concentration: 0.20,
    drawdown: 0.15,
    correlation: 0.15,
    liquidity: 0.10,
    sectorExposure: 0.10,
  },

  // Anomaly Thresholds
  anomalyThresholds: {
    singleAssetConcentrationHigh: 0.70,   // >= 70% of total assets in 1 category
    singleAssetConcentrationMed: 0.50,    // 50-69% in 1 category
    debtToAssetHigh: 0.50,                // Liabilities >= 50% of Assets
    debtToAssetMed: 0.30,                 // Liabilities 30-49% of Assets
    lowLiquidityBankShare: 0.05,          // Bank share < 5% of Assets
  },

  // AI Configuration
  ai: {
    defaultModel: process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free",
    temperature: 0.2,
    maxRetries: 1,
    timeoutMs: 25000,
  },
};

// Fixed demo user (a real, pre-confirmed Supabase auth user) used until
// session-based auth is wired through every route. Must be a valid UUID
// since user_id columns are typed uuid and reference auth.users(id).
export const DEMO_USER_ID = "983ea2af-964e-4817-b918-cddc64b3150c";

export function getEnv(key: string, fallback = ""): string {
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key] as string;
  }
  return fallback;
}
