// ============================================================
// FINANCIAL DOCTOR (finX) — Scam & Misinformation Detector Service
// Evaluates financial tips, promises, and claims against regulatory ground truth
// ============================================================

import { ScamCheckResult, ScamVerdict, ScamRiskLevel, Source } from "@/lib/types";
import { scamLLMOutputSchema } from "@/lib/validation";
import { retrieveSources } from "../rag/retrieve";
import { callLLM } from "@/lib/openrouter";
import { APP_CONFIG } from "@/lib/config";

// Rule-based heuristic pattern matcher for immediate suspicious signal detection
export function detectSuspiciousSignals(claim: string): {
  signals: string[];
  heuristicRiskScore: number;
} {
  const lower = claim.toLowerCase();
  const signals: string[] = [];
  let score = 20; // baseline

  if (lower.includes("guarantee") || lower.includes("assured return") || lower.includes("fixed 100%")) {
    signals.push("Promising Guaranteed/Assured Market Returns");
    score += 40;
  }
  if (lower.includes("double") || lower.includes("2x") || lower.includes("3x in") || lower.includes("30 days")) {
    signals.push("Unrealistic Quick Doubling Horizon");
    score += 35;
  }
  if (lower.includes("whatsapp") || lower.includes("telegram") || lower.includes("vip group") || lower.includes("dm for tips")) {
    signals.push("Unregulated Social Messaging Channel");
    score += 25;
  }
  if (lower.includes("zero risk") || lower.includes("no loss") || lower.includes("risk free")) {
    signals.push("Claiming Zero-Risk on Investment");
    score += 30;
  }
  if (lower.includes("insider") || lower.includes("secret operator") || lower.includes("pump")) {
    signals.push("Potential Market Manipulation / Insider Tip");
    score += 30;
  }
  if (lower.includes("urgent") || lower.includes("act now") || lower.includes("limited slots")) {
    signals.push("High-Pressure Urgency Tactics");
    score += 15;
  }

  return {
    signals,
    heuristicRiskScore: Math.min(100, score),
  };
}

export class ScamDetectorService {
  async evaluateClaim(claimText: string, userId?: string): Promise<ScamCheckResult> {
    const trimmed = claimText.trim();
    const { signals, heuristicRiskScore } = detectSuspiciousSignals(trimmed);

    // 1. Retrieve regulatory grounding context
    const sources = await retrieveSources(trimmed, 3);

    // 2. HARD CODE-LEVEL GUARD: If retrieval yields 0 sources, force "unverifiable"
    if (sources.length === 0) {
      return {
        claimText: trimmed,
        verdict: "unverifiable",
        riskScore: Math.min(heuristicRiskScore, 50),
        riskLevel: "LOW",
        detectedSignals: signals,
        explanation:
          APP_CONFIG.disclaimer.scamZeroSource,
        sources: [],
      };
    }

    // 3. System Prompt for strict Grounded Classification
    const systemPrompt = `
You assess whether a retail financial CLAIM is credible, misleading, or a potential scam, using ONLY the provided regulatory sources.
Rules:
- If the sources do not support an assessment, set verdict to "unverifiable".
- You may never output "likely_credible", "likely_misleading", or "likely_scam" unless at least one provided source substantiates it.
- Copy citations directly from the provided sources array (do not fabricate URLs).
- Frame the explanation in a neutral, educational tone. Highlight what regulations say without issuing personalized directives.
- Verdict MUST be one of: "likely_credible", "unverifiable", "likely_misleading", "likely_scam".
- Output strict JSON with format:
{
  "verdict": string,
  "riskScore": number,
  "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "detectedSignals": string[],
  "explanation": string,
  "sources": [{ "title": string, "url": string, "snippet": string }]
}
`;

    const userPrompt = `
CLAIM TO EVALUATE:
"${trimmed}"

RETRIEVED REGULATORY SOURCES:
${JSON.stringify(sources, null, 2)}

SUSPICIOUS SIGNALS DETECTED:
${JSON.stringify(signals)}
`;

    // Determine deterministic fallback in case LLM is offline
    let fallbackVerdict: ScamVerdict = "unverifiable";
    let fallbackRiskLevel: ScamRiskLevel = "MEDIUM";
    if (heuristicRiskScore >= 75) {
      fallbackVerdict = "likely_scam";
      fallbackRiskLevel = "CRITICAL";
    } else if (heuristicRiskScore >= 50) {
      fallbackVerdict = "likely_misleading";
      fallbackRiskLevel = "HIGH";
    }

    const fallbackData: {
      verdict: ScamVerdict;
      riskScore: number;
      riskLevel: ScamRiskLevel;
      detectedSignals: string[];
      explanation: string;
      sources: Source[];
    } = {
      verdict: fallbackVerdict,
      riskScore: heuristicRiskScore,
      riskLevel: fallbackRiskLevel,
      detectedSignals: signals,
      explanation: `Based on regulatory standards (e.g. SEBI/RBI regulations), claims promising guaranteed returns or rapid money multiplication violate statutory investment adviser rules.`,
      sources,
    };

    const { data } = await callLLM<{
      verdict: ScamVerdict;
      riskScore: number;
      riskLevel: ScamRiskLevel;
      detectedSignals: string[];
      explanation: string;
      sources: Source[];
    }>({
      systemPrompt,
      userPrompt,
      schema: scamLLMOutputSchema,
      route: "/api/ai/scam-check",
      userId,
      sources,
      fallbackData,
    });

    // 4. Post-validate: Ensure returned sources are only those that were retrieved
    const validUrls = new Set(sources.map((s) => s.url));
    const sanitizedSources = (data.sources || []).filter((s: any) => validUrls.has(s.url));

    // If all sources were stripped, force unverifiable
    if (sanitizedSources.length === 0) {
      return {
        claimText: trimmed,
        verdict: "unverifiable",
        riskScore: data.riskScore || 50,
        riskLevel: "LOW",
        detectedSignals: signals,
        explanation: "No verifiable cited source matched the claim. Marked as unverifiable.",
        sources: [],
      };
    }

    return {
      claimText: trimmed,
      verdict: data.verdict,
      riskScore: data.riskScore,
      riskLevel: data.riskLevel,
      detectedSignals: data.detectedSignals && data.detectedSignals.length > 0 ? data.detectedSignals : signals,
      explanation: data.explanation,
      sources: sanitizedSources,
    };
  }
}

export const scamDetectorService = new ScamDetectorService();
