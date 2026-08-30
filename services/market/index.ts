// ============================================================
// FINANCIAL DOCTOR (finX) — Market Data Service
// Provider abstraction supporting live market adapters and high-fidelity demo data
// ============================================================

import { AssetPrice, MarketIndex, MarketEvent } from "@/lib/types";

export interface IMarketProvider {
  getQuote(symbol: string): Promise<AssetPrice | null>;
  getAllQuotes(): Promise<AssetPrice[]>;
  getIndices(): Promise<MarketIndex[]>;
  getMarketEvents(): Promise<MarketEvent[]>;
}

// ------------------------------------------------------------
// High-Fidelity Indian Equities & Indices Dataset
// ------------------------------------------------------------
const DEMO_QUOTES: AssetPrice[] = [
  {
    symbol: "RELIANCE",
    name: "Reliance Industries Ltd",
    price: 2980.50,
    change24h: 34.20,
    change24hPct: 1.16,
    high24h: 3010.00,
    low24h: 2952.10,
    volume: 8420000,
    updatedAt: new Date().toISOString(),
    source: "NSE (Demo Feed)",
  },
  {
    symbol: "TCS",
    name: "Tata Consultancy Services Ltd",
    price: 4120.00,
    change24h: -28.50,
    change24hPct: -0.69,
    high24h: 4165.00,
    low24h: 4102.30,
    volume: 2150000,
    updatedAt: new Date().toISOString(),
    source: "NSE (Demo Feed)",
  },
  {
    symbol: "HDFCBANK",
    name: "HDFC Bank Ltd",
    price: 1450.75,
    change24h: 12.30,
    change24hPct: 0.86,
    high24h: 1462.00,
    low24h: 1438.50,
    volume: 12400000,
    updatedAt: new Date().toISOString(),
    source: "NSE (Demo Feed)",
  },
  {
    symbol: "INFY",
    name: "Infosys Ltd",
    price: 1625.30,
    change24h: -14.20,
    change24hPct: -0.87,
    high24h: 1648.00,
    low24h: 1618.00,
    volume: 5300000,
    updatedAt: new Date().toISOString(),
    source: "NSE (Demo Feed)",
  },
  {
    symbol: "ICICIBANK",
    name: "ICICI Bank Ltd",
    price: 1115.60,
    change24h: 18.40,
    change24hPct: 1.68,
    high24h: 1122.00,
    low24h: 1098.00,
    volume: 9100000,
    updatedAt: new Date().toISOString(),
    source: "NSE (Demo Feed)",
  },
  {
    symbol: "TATAMOTORS",
    name: "Tata Motors Ltd",
    price: 995.20,
    change24h: 22.80,
    change24hPct: 2.34,
    high24h: 1005.00,
    low24h: 978.50,
    volume: 14300000,
    updatedAt: new Date().toISOString(),
    source: "NSE (Demo Feed)",
  },
  {
    symbol: "NIFTYBEES",
    name: "Nippon India Nifty 50 BeES ETF",
    price: 254.20,
    change24h: 1.45,
    change24hPct: 0.57,
    high24h: 255.10,
    low24h: 253.00,
    volume: 3400000,
    updatedAt: new Date().toISOString(),
    source: "NSE (Demo Feed)",
  },
  {
    symbol: "GOLDBEES",
    name: "Nippon India ETF Gold BeES",
    price: 64.80,
    change24h: 0.35,
    change24hPct: 0.54,
    high24h: 65.10,
    low24h: 64.30,
    volume: 1900000,
    updatedAt: new Date().toISOString(),
    source: "NSE (Demo Feed)",
  },
];

const DEMO_INDICES: MarketIndex[] = [
  {
    symbol: "NIFTY_50",
    name: "NIFTY 50",
    value: 22450.80,
    change: 125.40,
    changePct: 0.56,
    trend: "up",
    historicalPoints: [
      { time: "09:15", value: 22340 },
      { time: "10:30", value: 22390 },
      { time: "12:00", value: 22420 },
      { time: "13:30", value: 22405 },
      { time: "15:30", value: 22450.8 },
    ],
  },
  {
    symbol: "SENSEX",
    name: "BSE SENSEX",
    value: 73890.15,
    change: 380.20,
    changePct: 0.52,
    trend: "up",
    historicalPoints: [
      { time: "09:15", value: 73520 },
      { time: "11:00", value: 73710 },
      { time: "13:00", value: 73800 },
      { time: "15:30", value: 73890.15 },
    ],
  },
  {
    symbol: "BANK_NIFTY",
    name: "BANK NIFTY",
    value: 47680.90,
    change: -95.30,
    changePct: -0.20,
    trend: "down",
  },
  {
    symbol: "GOLD_MCX",
    name: "Gold (10g INR)",
    value: 71200.00,
    change: 310.00,
    changePct: 0.44,
    trend: "up",
  },
  {
    symbol: "IN_10Y_BOND",
    name: "India 10Y Yield",
    value: 7.08,
    change: -0.02,
    changePct: -0.28,
    trend: "down",
  },
  {
    symbol: "NASDAQ",
    name: "NASDAQ",
    value: 16166.87,
    change: 180.20,
    changePct: 1.12,
    trend: "up",
  },
  {
    symbol: "CRUDE_OIL",
    name: "Crude Oil",
    value: 78.54,
    change: 0.65,
    changePct: 0.83,
    trend: "up",
  },
  {
    symbol: "BRENT_CRUDE",
    name: "Brent Crude",
    value: 82.35,
    change: 0.55,
    changePct: 0.67,
    trend: "up",
  },
  {
    symbol: "WTI_CRUDE",
    name: "WTI Crude",
    value: 78.54,
    change: 0.70,
    changePct: 0.90,
    trend: "up",
  },
];

const DEMO_EVENTS: MarketEvent[] = [
  {
    id: "evt_1",
    title: "RBI Monetary Policy Committee Meeting",
    category: "monetary_policy",
    impact: "high",
    date: new Date(Date.now() + 86400000 * 3).toISOString(),
    description: "RBI MPC decision on benchmark repo rate policy stance.",
  },
  {
    id: "evt_2",
    title: "India Q3 GDP Growth Release",
    category: "macro",
    impact: "high",
    date: new Date(Date.now() + 86400000 * 7).toISOString(),
    description: "Official CSO release of quarterly gross domestic product numbers.",
  },
];

const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_API_KEY || "QBKYIHU7C18I02I8";

export class DefaultMarketProvider implements IMarketProvider {
  private async fetchAlphaVantageQuote(symbol: string): Promise<AssetPrice | null> {
    try {
      const cleanSymbol = symbol.toUpperCase().replace(".NS", "");
      const res = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${cleanSymbol}&apikey=${ALPHA_VANTAGE_KEY}`);
      if (!res.ok) return null;
      const data = await res.json();
      
      if (data["Note"] || data["Information"] || !data["Global Quote"]) {
        console.warn("[Market API] Alpha Vantage rate limit or error:", data);
        return null;
      }
      
      const quote = data["Global Quote"];
      if (!quote["05. price"]) return null;

      const price = Number(quote["05. price"]);
      const change = Number(quote["09. change"]);
      const changePct = Number(quote["10. change percent"].replace("%", ""));
      const high = Number(quote["03. high"]);
      const low = Number(quote["04. low"]);
      const volume = Number(quote["06. volume"]);
      
      return {
        symbol: cleanSymbol,
        name: cleanSymbol,
        price,
        change24h: Number(change.toFixed(2)),
        change24hPct: Number(changePct.toFixed(2)),
        high24h: Number(high.toFixed(2)),
        low24h: Number(low.toFixed(2)),
        volume,
        updatedAt: new Date().toISOString(),
        source: "Alpha Vantage API Feed",
      };
    } catch (e) {
      console.warn("[Market API] Alpha Vantage fetch error:", e);
      return null;
    }
  }

  private async fetchYahooMeta(ticker: string) {
    try {
      const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.chart.result[0].meta;
    } catch {
      return null;
    }
  }

  async getQuote(symbol: string): Promise<AssetPrice | null> {
    const clean = symbol.toUpperCase().trim();
    
    // 1. Try Alpha Vantage first
    const avQuote = await this.fetchAlphaVantageQuote(clean);
    if (avQuote) return avQuote;

    // 2. Fall back to Yahoo Finance
    const liveMeta = await this.fetchYahooMeta(clean.includes(".") ? clean : `${clean}.NS`);
    if (liveMeta) {
      const prevClose = liveMeta.chartPreviousClose || liveMeta.regularMarketPrice;
      const change = liveMeta.regularMarketPrice - prevClose;
      const pct = (change / (prevClose || 1)) * 100;
      return {
        symbol: clean,
        name: liveMeta.longName || liveMeta.shortName || clean,
        price: liveMeta.regularMarketPrice,
        change24h: Number(change.toFixed(2)),
        change24hPct: Number(pct.toFixed(2)),
        high24h: liveMeta.regularMarketDayHigh || liveMeta.regularMarketPrice,
        low24h: liveMeta.regularMarketDayLow || liveMeta.regularMarketPrice,
        volume: liveMeta.regularMarketVolume || 0,
        updatedAt: new Date().toISOString(),
        source: "Yahoo Finance API Feed (Fallback)",
      };
    }

    const found = DEMO_QUOTES.find(
      (q) => q.symbol === clean || q.name.toUpperCase().includes(clean)
    );
    return found || null;
  }

  async getAllQuotes(): Promise<AssetPrice[]> {
    const symbols = ["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "ICICIBANK.NS", "TATAMOTORS.NS", "NIFTYBEES.NS", "GOLDBEES.NS"];
    const quotes: AssetPrice[] = [];

    for (const sym of symbols) {
      const live = await this.getQuote(sym);
      if (live) {
        // Strip the .NS for presentation consistency matching type systems
        live.symbol = live.symbol.replace(".NS", "");
        quotes.push(live);
      }
    }

    if (quotes.length > 0) return quotes;
    return DEMO_QUOTES;
  }

  async getIndices(): Promise<MarketIndex[]> {
    // Tickers: Nifty 50 (^NSEI), Sensex (^BSESN), Bank Nifty (^NSEBANK), Gold (GC=F), 10Y yield (^TNX), NASDAQ (^IXIC), Crude (CL=F), Brent (BZ=F)
    const indexMappings = [
      { key: "NIFTY_50", name: "NIFTY 50", ticker: "^NSEI" },
      { key: "SENSEX", name: "BSE SENSEX", ticker: "^BSESN" },
      { key: "BANK_NIFTY", name: "BANK NIFTY", ticker: "^NSEBANK" },
      { key: "GOLD_MCX", name: "Gold (USD/oz)", ticker: "GC=F" },
      { key: "IN_10Y_BOND", name: "India 10Y Yield", ticker: "^NSEI" }, // Fallback to NSEI changes
      { key: "NASDAQ", name: "NASDAQ", ticker: "^IXIC" },
      { key: "CRUDE_OIL", name: "Crude Oil", ticker: "CL=F" },
      { key: "BRENT_CRUDE", name: "Brent Crude", ticker: "BZ=F" },
      { key: "WTI_CRUDE", name: "WTI Crude", ticker: "CL=F" },
    ];

    const indices: MarketIndex[] = [];
    for (const item of indexMappings) {
      const meta = await this.fetchYahooMeta(item.ticker);
      if (meta) {
        const changePct = meta.regularMarketChangePercent !== undefined ? meta.regularMarketChangePercent : 0.0;
        const change = meta.regularMarketPrice * (changePct / 100);
        indices.push({
          symbol: item.key,
          name: item.name,
          value: Number(meta.regularMarketPrice.toFixed(2)),
          change: Number(change.toFixed(2)),
          changePct: Number(changePct.toFixed(2)),
          trend: changePct >= 0 ? "up" : "down",
        });
      }
    }

    if (indices.length > 0) return indices;
    return DEMO_INDICES;
  }

  async getMarketEvents(): Promise<MarketEvent[]> {
    return DEMO_EVENTS;
  }
}

export const marketProvider = new DefaultMarketProvider();
