// ============================================================
// FINANCIAL DOCTOR (finX) — AI Research Copilot Service
// Grounded Q&A, Intent Parsing, Portfolio & Market Context Fusion
// ============================================================

import { AIMessage, Citation } from "@/lib/types";
import { copilotLLMResponseSchema } from "@/lib/validation";
import { portfolioService } from "../portfolio";
import { analyzeFullRisk } from "@/lib/finance";
import { marketProvider } from "../market";
import { retrieveSources } from "../rag/retrieve";
import { callLLM } from "@/lib/openrouter";

export class CopilotService {
  async askCopilot(userId: string, question: string): Promise<AIMessage> {
    const trimmedQuestion = question.trim();

    // 1. Gather User Portfolio & Risk Context
    const { assets, liabilities, netWorthSummary } = await portfolioService.getHoldings(userId);
    const riskAnalysis = analyzeFullRisk(userId, assets, liabilities);

    // 2. Gather Live Market Context
    const indices = await marketProvider.getIndices();
    const marketSummary = indices.map((i) => `${i.name}: ${i.value} (${i.changePct > 0 ? "+" : ""}${i.changePct}%)`).join(", ");

    // 3. RAG Retrieval for relevant regulatory & financial sources
    const retrievedSources = await retrieveSources(trimmedQuestion, 2);

    // 4. Construct Context-Rich Grounded Prompt
    const systemPrompt = `
You are the AI Financial Intelligence Copilot for Financial Doctor.
Absolute Rules:
- You provide educational financial literacy and analytical explanations only.
- You are NOT a registered investment adviser.
- NEVER produce personalized buy, sell, hold, or allocation directives.
- Explain the user's situation by referencing their deterministic metrics (provided below).
- Use citations when referencing regulations, market standards, or principles.
- Distinguish between verified facts, calculations, and general educational principles.
- Output JSON format:
{
  "summary": "1-2 sentence executive takeaway",
  "explanation": "Detailed plain-language educational breakdown",
  "risk_level": "Lower" | "Moderate" | "Higher",
  "factors": ["Key observation 1", "Key observation 2"],
  "citations": [{ "title": string, "url": string, "source": string }]
}
`;

    const userPrompt = `
USER QUESTION:
"${trimmedQuestion}"

USER PORTFOLIO CONTEXT:
- Total Assets: ₹${netWorthSummary.totalAssets.toLocaleString("en-IN")}
- Total Liabilities: ₹${netWorthSummary.totalLiabilities.toLocaleString("en-IN")}
- Net Worth: ₹${netWorthSummary.netWorth.toLocaleString("en-IN")}
- Tracked Holdings: ${assets.map((a) => `${a.name} (${a.type}): ₹${a.value.toLocaleString("en-IN")}`).join(", ") || "None"}
- Liabilities: ${liabilities.map((l) => `${l.name}: ₹${l.amount.toLocaleString("en-IN")}`).join(", ") || "None"}
- Financial Risk Score: ${riskAnalysis.riskScore}/100 (${riskAnalysis.band})
- Diversification Score: ${riskAnalysis.diversificationScore}/100
- Active Flags: ${riskAnalysis.flags.map((f) => f.message).join(" | ") || "None"}

CURRENT MARKET SNAPSHOT:
${marketSummary}

GROUNDING REGULATORY CONTEXT:
${JSON.stringify(retrievedSources, null, 2)}
`;

    // Fallback response if offline
    const fallbackData = {
      summary: `Your portfolio currently holds ₹${netWorthSummary.netWorth.toLocaleString("en-IN")} in net worth with a Risk Indicator of ${riskAnalysis.riskScore}/100 (${riskAnalysis.band}).`,
      explanation: `Regarding your query "${trimmedQuestion}": In retail financial planning, understanding your exposure across asset classes (like your ${riskAnalysis.factors[0]?.name || "equities"} and debt obligations) helps assess vulnerability to volatility. SEBI and RBI regulations emphasize diversification and caution against high leverage. Review your situation with a SEBI-registered financial planner for personalized advice.`,
      risk_level: riskAnalysis.band,
      factors: [
        `Risk Score: ${riskAnalysis.riskScore}/100`,
        `Diversification Score: ${riskAnalysis.diversificationScore}/100`,
        `Debt Ratio: ${((netWorthSummary.totalLiabilities / (netWorthSummary.totalAssets || 1)) * 100).toFixed(0)}%`,
      ],
      citations: [
        {
          title: "SEBI Investor Education Guidelines",
          url: "https://www.sebi.gov.in/investor-awareness.html",
          source: "SEBI",
        },
      ],
    };

    const { data } = await callLLM<{
      summary: string;
      explanation: string;
      risk_level?: string;
      factors?: string[];
      citations?: { title: string; url: string; source?: string }[];
    }>({
      systemPrompt,
      userPrompt,
      schema: copilotLLMResponseSchema,
      route: "/api/ai/copilot",
      userId,
      sources: retrievedSources,
      fallbackData,
    });

    const citations: Citation[] = (data.citations || []).map((c: any, idx: number) => ({
      id: `cit_${Date.now()}_${idx}`,
      title: c.title,
      url: c.url,
      source: c.source || "Regulatory Source",
    }));

    // If empty citations, append regulatory default
    if (citations.length === 0 && retrievedSources.length > 0) {
      citations.push({
        id: `cit_default`,
        title: retrievedSources[0].title,
        url: retrievedSources[0].url,
        source: "SEBI / RBI",
      });
    }

    return {
      id: `msg_${Date.now()}`,
      role: "assistant",
      content: `${data.summary}\n\n${data.explanation}`,
      citations,
      factors: data.factors,
      riskLevel: data.risk_level || riskAnalysis.band,
      confidence: 0.95,
      timestamp: new Date().toISOString(),
    };
  }
}

export const copilotService = new CopilotService();
