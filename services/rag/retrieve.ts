// ============================================================
// FINANCIAL DOCTOR (finX) — RAG Context Retrieval Engine
// Queries regulatory snippets (SEBI, AMFI, RBI, NSE) with FTS and keyword matching
// ============================================================

import { Source, ReferenceSnippet } from "@/lib/types";
import { createServiceClient } from "@/lib/supabase/server";

// Fallback seed knowledge base for instant offline operation
const SEED_REGULATORY_SNIPPETS: ReferenceSnippet[] = [
  // ---------------- SEBI ----------------
  {
    id: "snip_1",
    topic: "guaranteed returns assured profit fixed return",
    title: "SEBI Prohibition on Assured Return Schemes",
    url: "https://www.sebi.gov.in/legal/regulations/sebi-investment-advisers-regulations-2013.html",
    snippet:
      "Under SEBI (Investment Advisers) Regulations, registered intermediaries cannot guarantee or assure fixed returns on market-linked financial products. Any promise of zero-risk guaranteed profits is an explicit regulatory violation.",
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
    id: "snip_6",
    topic: "fake sebi registration certificate rbi license verification",
    title: "SEBI Intermediary Verification Portal Guidance",
    url: "https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRecognisedFpi=yes",
    snippet:
      "Fraudulent apps frequently display fabricated SEBI registration certificates. Retail investors should cross-check certificate registration numbers directly on the official SEBI directory before transferring funds.",
  },
  {
    id: "snip_7",
    topic: "algo trading unregistered bot signal seller subscription profit",
    title: "SEBI Circular on Unauthorized Algorithmic Trading & Signal Sellers",
    url: "https://www.sebi.gov.in/legal/circulars/algo-trading-framework.html",
    snippet:
      "SEBI has flagged unregistered entities selling algorithmic trading bots or paid trading signals with promised win rates. Such offerings are not sanctioned or audited by SEBI and carry no investor protection.",
  },
  {
    id: "snip_8",
    topic: "ipo allotment guaranteed listing gain grey market premium scam",
    title: "SEBI Caution on Fake IPO Allotment & Listing-Gain Guarantees",
    url: "https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doPmr=yes",
    snippet:
      "SEBI warns investors against intermediaries promising guaranteed IPO allotment or assured listing-day gains. All IPO allotments are processed via registered registrars using a disclosed, rule-based basis of allotment; no agent can guarantee shares.",
  },
  // ---------------- AMFI ----------------
  {
    id: "snip_9",
    topic: "mutual fund guaranteed nav fixed return sip assured scheme",
    title: "AMFI Guidance: Mutual Funds Are Subject to Market Risk",
    url: "https://www.amfiindia.com/investor-corner/knowledge-center/mutual-fund-basics.html",
    snippet:
      "AMFI reiterates that mutual fund investments are subject to market risk and NAV can fluctuate based on underlying securities. No mutual fund distributor, registered or otherwise, can guarantee a fixed return or assured NAV appreciation to investors.",
  },
  {
    id: "snip_10",
    topic: "unregistered mutual fund distributor commission arn code",
    title: "AMFI Requirement: ARN Registration for Mutual Fund Distributors",
    url: "https://www.amfiindia.com/distributor-corner/become-a-mutual-fund-distributor",
    snippet:
      "Any individual or entity distributing or advising on mutual fund products must hold a valid AMFI Registration Number (ARN). Investors should verify a distributor's ARN status on the AMFI website before investing through them.",
  },
  {
    id: "snip_11",
    topic: "fake mutual fund app clone nav fraud portfolio scam",
    title: "AMFI Advisory on Fraudulent Mutual Fund Apps and Portals",
    url: "https://www.amfiindia.com/investor-corner/knowledge-center/investor-alerts.html",
    snippet:
      "AMFI has cautioned investors about fraudulent mobile apps and websites mimicking legitimate mutual fund platforms to collect payments outside regulated channels. Transactions should only be made through AMC websites, RTAs (CAMS/KFintech), or ARN-verified distributors.",
  },
  {
    id: "snip_12",
    topic: "smart sip high return scheme exclusive mutual fund plan",
    title: "AMFI Clarification on 'Exclusive' or 'High-Return' SIP Plans",
    url: "https://www.amfiindia.com/investor-corner",
    snippet:
      "There is no such thing as an 'exclusive' or 'special access' mutual fund SIP plan offering above-market guaranteed returns. All mutual fund schemes and their scheme information documents (SID) are publicly available and identical for every investor.",
  },
  // ---------------- RBI ----------------
  {
    id: "snip_2",
    topic: "double money doubling schemes 30 days fast wealth",
    title: "RBI Public Caution on High Yield Doubling Schemes",
    url: "https://www.rbi.org.in/scripts/BS_PressReleaseDisplay.aspx",
    snippet:
      "The Reserve Bank of India cautions the public against unauthorized schemes promising to double or multiply money in unrealistic short timeframes, often operating as illegal Ponzi or multi-level marketing pyramids.",
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
    id: "snip_13",
    topic: "unlicensed nbfc deposit scheme fixed interest chit fund",
    title: "RBI Alert on Unauthorized Deposit-Taking Entities",
    url: "https://www.rbi.org.in/scripts/BS_PressReleaseDisplay.aspx?prid=unauthorized-deposits",
    snippet:
      "RBI advises the public to deal only with NBFCs and deposit-taking institutions that appear on its official list of registered entities. Unlicensed entities offering fixed high-interest deposit schemes are operating illegally and offer no depositor protection.",
  },
  {
    id: "snip_14",
    topic: "instant loan app harassment predatory lending digital lending fraud",
    title: "RBI Guidelines on Digital Lending and Loan App Fraud",
    url: "https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=digital-lending-guidelines",
    snippet:
      "RBI's digital lending guidelines require all loans to be disbursed and serviced only by RBI-regulated entities or their registered lending service providers. Apps that bypass this framework, charge undisclosed fees, or use coercive recovery tactics are unauthorized and should be reported.",
  },
  {
    id: "snip_15",
    topic: "forex trading binary options unregistered broker guaranteed profit",
    title: "RBI Caution on Unauthorized Forex Trading Platforms",
    url: "https://www.rbi.org.in/scripts/BS_PressReleaseDisplay.aspx?prid=forex-trading-caution",
    snippet:
      "RBI has repeatedly cautioned that online forex trading platforms and mobile apps offering trading in currency pairs outside authorized exchanges (NSE/BSE/MCX-SX) are illegal under FEMA. Guaranteed-profit forex or binary-options schemes are a common fraud vector.",
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
