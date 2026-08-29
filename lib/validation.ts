// ============================================================
// FINANCIAL DOCTOR (finX) — Validation Schemas (Zod)
// Strict runtime type validation for all API inputs and outputs
// ============================================================

import { z } from "zod";

// ------------------------------------------------------------
// 1. Asset & Liability Schemas
// ------------------------------------------------------------
export const assetTypeSchema = z.enum([
  "stock",
  "etf",
  "mutual_fund",
  "bank",
  "real_estate",
  "gold",
  "other",
]);

export const liabilityTypeSchema = z.enum([
  "loan",
  "credit_card",
  "mortgage",
  "other",
]);

export const assetInputSchema = z.object({
  type: assetTypeSchema,
  name: z.string().min(1, "Asset name is required").max(100),
  symbol: z.string().optional(),
  sector: z.string().optional(),
  value: z.number().nonnegative("Asset value must be 0 or positive"),
  quantity: z.number().positive().optional(),
  purchasePrice: z.number().nonnegative().optional(),
});

export const liabilityInputSchema = z.object({
  type: liabilityTypeSchema,
  name: z.string().min(1, "Liability name is required").max(100),
  amount: z.number().nonnegative("Liability amount must be 0 or positive"),
  interestRate: z.number().min(0).max(100).optional(),
  monthlyPayment: z.number().nonnegative().optional(),
});

export const portfolioImportSchema = z.object({
  assets: z.array(assetInputSchema),
  liabilities: z.array(liabilityInputSchema),
});

// CSV / Excel Row Schema
export const fileImportRowSchema = z.object({
  kind: z.enum(["asset", "liability"]),
  type: z.string().min(1),
  name: z.string().min(1),
  value: z.union([z.number(), z.string()]),
  quantity: z.union([z.number(), z.string(), z.undefined()]).optional(),
  interest_rate: z.union([z.number(), z.string(), z.undefined()]).optional(),
  sector: z.string().optional(),
});

// ------------------------------------------------------------
// 2. Scam / Claim Check Schemas
// ------------------------------------------------------------
export const scamCheckRequestSchema = z.object({
  claimText: z
    .string()
    .min(3, "Claim text must be at least 3 characters")
    .max(2000, "Claim text must not exceed 2000 characters"),
});

export const scamVerdictSchema = z.enum([
  "likely_credible",
  "unverifiable",
  "likely_misleading",
  "likely_scam",
]);

export const sourceSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  url: z.string(),
  snippet: z.string().optional(),
  publishedAt: z.string().optional(),
});

export const scamLLMOutputSchema = z.object({
  verdict: scamVerdictSchema,
  riskScore: z.number(),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  detectedSignals: z.array(z.string()),
  explanation: z.string().min(1),
  sources: z.array(sourceSchema),
});

export const scamCheckResponseSchema = z.object({
  claimText: z.string(),
  verdict: scamVerdictSchema,
  riskScore: z.number(),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  detectedSignals: z.array(z.string()),
  explanation: z.string().min(1),
  sources: z.array(sourceSchema),
});

// ------------------------------------------------------------
// 3. AI Copilot Schemas
// ------------------------------------------------------------
export const copilotRequestSchema = z.object({
  message: z.string().min(1, "Question cannot be empty").max(2000),
  conversationId: z.string().optional(),
});

export const copilotLLMResponseSchema = z.object({
  summary: z.string(),
  explanation: z.string(),
  risk_level: z.string().optional(),
  factors: z.array(z.string()).optional(),
  citations: z.array(sourceSchema).optional(),
  confidence: z.number().optional(),
});

// ------------------------------------------------------------
// 4. Simulation Schemas
// ------------------------------------------------------------
export const simulationRequestSchema = z.object({
  assumptions: z.object({
    monthlyInvestment: z.number().min(0).max(10000000),
    annualReturnPct: z.number().min(-50).max(100),
    years: z.number().int().min(1).max(50),
    inflationPct: z.number().min(0).max(30).optional().default(6),
    marketShockPct: z.number().min(-90).max(100).optional().default(0),
    sectorShock: z
      .object({
        sector: z.string(),
        dropPct: z.number().min(0).max(100),
      })
      .optional(),
  }),
});

export const simulationLLMResponseSchema = z.object({
  explanation: z.string().min(1),
});

// ------------------------------------------------------------
// 5. Auth Schemas
// ------------------------------------------------------------
export const authCredentialsSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
