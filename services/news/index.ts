// ============================================================
// FINANCIAL DOCTOR (finX) — Financial News & Sentiment Service
// Live feed via GNews.io (free tier), with local sentiment tagging
// and a high-fidelity offline fallback when no API key is configured.
// ============================================================

import { NewsArticle } from "@/lib/types";
import { getEnv } from "@/lib/config";

const GNEWS_BASE_URL = "https://gnews.io/api/v4/search";

const DEMO_NEWS: NewsArticle[] = [
  {
    id: "news_1",
    title: "RBI Governor Highlights Financial Stability & Inflation Trajectory",
    url: "https://www.rbi.org.in/scripts/BS_PressReleaseDisplay.aspx",
    source: "RBI Bulletin",
    summary: "The central bank emphasized robust domestic macro fundamentals while advising retail investors to remain disciplined regarding leverage.",
    publishedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    sentiment: "positive",
    sentimentScore: 0.65,
  },
  {
    id: "news_2",
    title: "SEBI Mandates Enhanced Disclosures for High-Risk Derivative Trading",
    url: "https://www.sebi.gov.in/enforcement/orders.html",
    source: "SEBI Press",
    summary: "New regulatory framework requires brokers to surface explicit risk warnings regarding F&O loss probabilities for retail participants.",
    publishedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    sentiment: "neutral",
    sentimentScore: 0.10,
  },
  {
    id: "news_3",
    title: "Reliance Retail & Green Energy Expansion Receives Institutional Upgrades",
    url: "https://www.nseindia.com/market-data/company-news",
    source: "Market Wire",
    summary: "Analysts highlight robust EBITDA growth across telecom and retail verticals with capital expenditure moderating.",
    publishedAt: new Date(Date.now() - 3600000 * 9).toISOString(),
    ticker: "RELIANCE",
    sentiment: "positive",
    sentimentScore: 0.78,
  },
  {
    id: "news_4",
    title: "IT Sector Faces Near-Term Discretionary Spending Headwinds",
    url: "https://www.nseindia.com/market-data/company-news",
    source: "Tech Finance",
    summary: "Global client enterprise budgets remain cautious, leading to modest sequential revenue growth for tier-1 IT exporters.",
    publishedAt: new Date(Date.now() - 3600000 * 14).toISOString(),
    ticker: "INFY",
    sentiment: "negative",
    sentimentScore: -0.45,
  },
  {
    id: "news_5",
    title: "Indian Mutual Fund SIP Inflows Cross Record ₹20,000 Crore Mark in Monthly Inflows",
    url: "https://www.amfiindia.com/research-information/other-data/mf-industry-data",
    source: "AMFI India",
    summary: "Systematic Investment Plans demonstrate sustained domestic retail participation across equity index and multicap funds.",
    publishedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    sentiment: "positive",
    sentimentScore: 0.85,
  },
];

interface GNewsArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  image: string;
  publishedAt: string;
  source: { name: string; url: string };
}

export class NewsService {
  private buildQuery(ticker?: string): string {
    if (ticker) return `${ticker} stock India NSE`;
    return "Indian stock market OR NSE OR BSE OR SEBI OR RBI";
  }

  async getLatestNews(ticker?: string): Promise<NewsArticle[]> {
    const apiKey = getEnv("GNEWS_API_KEY");
    if (!apiKey) {
      return ticker
        ? DEMO_NEWS.filter((n) => n.ticker === ticker.toUpperCase().trim())
        : DEMO_NEWS;
    }

    try {
      const params = new URLSearchParams({
        q: this.buildQuery(ticker),
        lang: "en",
        country: "in",
        max: "10",
        apikey: apiKey,
      });

      const res = await fetch(`${GNEWS_BASE_URL}?${params.toString()}`, {
        next: { revalidate: 900 },
      });

      if (!res.ok) throw new Error(`GNews responded ${res.status}`);

      const json = await res.json();
      const articles: GNewsArticle[] = json.articles || [];

      if (articles.length === 0) {
        return ticker ? DEMO_NEWS.filter((n) => n.ticker === ticker.toUpperCase().trim()) : DEMO_NEWS;
      }

      const withSentiment = await Promise.all(
        articles.map(async (a, idx) => {
          const text = `${a.title} ${a.description || ""}`;
          const { sentiment, score } = await this.analyzeSentiment(text);
          return {
            id: `gnews_${idx}_${Buffer.from(a.url).toString("base64").slice(0, 12)}`,
            title: a.title,
            url: a.url,
            source: a.source?.name || "GNews",
            summary: a.description || a.content?.slice(0, 200) || "",
            publishedAt: a.publishedAt,
            ticker: ticker?.toUpperCase().trim(),
            sentiment,
            sentimentScore: score,
          } as NewsArticle;
        })
      );

      return withSentiment;
    } catch (err) {
      console.warn("[NewsService] Live GNews fetch failed, using offline dataset:", err);
      return ticker ? DEMO_NEWS.filter((n) => n.ticker === ticker.toUpperCase().trim()) : DEMO_NEWS;
    }
  }

  async analyzeSentiment(text: string): Promise<{
    sentiment: "positive" | "neutral" | "negative";
    score: number;
  }> {
    const lower = text.toLowerCase();
    const positiveWords = ["growth", "record", "upgrade", "robust", "expansion", "profit", "gain", "surplus", "rally", "surge", "beat"];
    const negativeWords = ["headwind", "decline", "risk", "loss", "caution", "fraud", "scam", "fall", "drop", "crash", "slump"];

    let posCount = 0;
    let negCount = 0;

    for (const w of positiveWords) {
      if (lower.includes(w)) posCount++;
    }
    for (const w of negativeWords) {
      if (lower.includes(w)) negCount++;
    }

    if (posCount > negCount) {
      return { sentiment: "positive", score: Math.min(1.0, 0.3 + posCount * 0.2) };
    } else if (negCount > posCount) {
      return { sentiment: "negative", score: Math.max(-1.0, -0.3 - negCount * 0.2) };
    }
    return { sentiment: "neutral", score: 0 };
  }
}

export const newsService = new NewsService();
