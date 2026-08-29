// ============================================================
// FINANCIAL DOCTOR (finX) — RAG Context Retrieval Engine
// Queries regulatory snippets (SEBI, RBI, AMFI, NSE) with FTS and keyword matching
// ============================================================

import { Source, ReferenceSnippet } from "@/lib/types";
import { createServiceClient } from "@/lib/supabase/server";

// Fallback seed knowledge base for instant offline operation
const SEED_REGULATORY_SNIPPETS: ReferenceSnippet[] = [
  {
    id: "snip_1",
    topic: "guaranteed returns assured profit fixed return",
    title: "SEBI Prohibition on Assured Return Schemes",
    url: "https://www.sebi.gov.in/legal/regulations/sebi-investment-advisers-regulations-2013.html",
    snippet:
      "Under SEBI (Investment Advisers) Regulations, registered intermediaries cannot guarantee or assure fixed returns on market-linked financial products. Any promise of zero-risk guaranteed profits is an explicit regulatory violation.",
  },
  {
    id: "snip_2",
    topic: "double money doubling schemes 30 days fast wealth",
    title: "RBI Public Caution on High Yield Doubling Schemes",
    url: "https://www.rbi.org.in/scripts/BS_PressReleaseDisplay.aspx",
    snippet:
      "The Reserve Bank of India cautions the public against unauthorized schemes promising to double or multiply money in unrealistic short timeframes, often operating as illegal Ponzi or multi-level marketing pyramids.",
  },
  {
    id: "snip_3",
    topic: "unregistered advisor whatsapp telegram stock tips vip group",
    title: "SEBI Advisory on Unregistered WhatsApp/Telegram Tipsters",
    url: "https://www.sebi.gov.in/enforcement/orders/unregistered-advisory-warnings.html",
    snippet:
      "Investors are advised to verify that any financial advisory entity is registered with SEBI before acting on trading recommendations or stock tips circulated via social messaging apps. Unregistered tipsters operate illegally without investor redressal.",
  },
  {
    id: "snip_4",
    topic: "pump and dump microcap penny stock insider tip operator stock",
    title: "NSE & BSE Market Surveillance on Stock Manipulation",
    url: "https://www.nseindia.com/invest/investor-awareness",
    snippet:
      "Microcap stock recommendations shared aggressively on social channels without fundamental analysis are often part of illicit pump-and-dump operations designed to artificially inflate prices before insiders dump holdings.",
  },
  {
    id: "snip_5",
    topic: "crypto daily return bot arbitrage risk free crypto trading",
    title: "RBI & FIU Guidelines on Virtual Digital Asset Schemes",
    url: "https://www.rbi.org.in",
    snippet:
      "Virtual digital asset offerings promising risk-free high daily yields or automated arbitrage carry extreme capital loss risks, lack sovereign guarantees, and are frequently used in cyber-fraud networks.",
  },
  {
    id: "snip_6",
    topic: "fake sebi registration certificate rbi license verification",
    title: "SEBI Intermediary Verification Portal Guidance",
    url: "https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRecognisedFpi=yes",
    snippet:
      "Fraudulent apps frequently display fabricated SEBI registration certificates. Retail investors should cross-check certificate registration numbers directly on the official SEBI directory before transferring funds.",
  },
];

/**
 * Universal RAG retrieval function.
 * Queries Supabase `reference_snippets` or falls back to local regulatory KB.
 * Extensible seam for live web search tools without touching route handlers.
 */
export async function retrieveSources(query: string, maxResults = 3): Promise<Source[]> {
  const normalizedQuery = query.toLowerCase().trim();
  const words = normalizedQuery
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2);

  if (words.length === 0) {
    return [];
  }

  // 1. Try DB retrieval first
  try {
    const supabase = createServiceClient();
    const { data: dbSnippets } = await supabase
      .from("reference_snippets")
      .select("id, topic, title, url, snippet")
      .limit(15);

    const pool: ReferenceSnippet[] = dbSnippets && dbSnippets.length > 0 ? dbSnippets : SEED_REGULATORY_SNIPPETS;

    // Rank snippets by keyword match frequency
    const scored = pool.map((item) => {
      const corpus = `${item.topic} ${item.title} ${item.snippet}`.toLowerCase();
      let matchScore = 0;

      for (const word of words) {
        if (corpus.includes(word)) {
          matchScore += 1;
        }
      }

      return { item, matchScore };
    });

    const relevant = scored
      .filter((s) => s.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, maxResults)
      .map((s) => ({
        id: s.item.id,
        title: s.item.title,
        url: s.item.url,
        snippet: s.item.snippet,
      }));

    return relevant;
  } catch (err) {
    console.warn("[RAG] DB search failed, using local regulatory snippet pool:", err);

    const scored = SEED_REGULATORY_SNIPPETS.map((item) => {
      const corpus = `${item.topic} ${item.title} ${item.snippet}`.toLowerCase();
      let matchScore = 0;
      for (const word of words) {
        if (corpus.includes(word)) matchScore += 1;
      }
      return { item, matchScore };
    });

    return scored
      .filter((s) => s.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, maxResults)
      .map((s) => ({
        id: s.item.id,
        title: s.item.title,
        url: s.item.url,
        snippet: s.item.snippet,
      }));
  }
}
