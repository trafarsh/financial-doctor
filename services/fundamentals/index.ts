// ============================================================
// FINANCIAL DOCTOR (finX) — Fundamentals Data Service
// Company valuation, financial ratios, balance sheet metrics
// ============================================================

import { AssetFundamental } from "@/lib/types";

const DEMO_FUNDAMENTALS: Record<string, AssetFundamental> = {
  RELIANCE: {
    symbol: "RELIANCE",
    name: "Reliance Industries Ltd",
    marketCap: 2015000, // ₹ Cr
    peRatio: 28.4,
    eps: 104.9,
    revenue: 892000,
    netIncome: 69800,
    totalDebt: 312000,
    dividendYield: 0.35,
    sector: "Energy & Conglomerate",
    industry: "Oil, Gas & Retail",
    updatedAt: new Date().toISOString(),
  },
  TCS: {
    symbol: "TCS",
    name: "Tata Consultancy Services Ltd",
    marketCap: 1490000,
    peRatio: 31.8,
    eps: 129.5,
    revenue: 240800,
    netIncome: 46800,
    totalDebt: 7900,
    dividendYield: 1.25,
    sector: "Information Technology",
    industry: "IT Services & Consulting",
    updatedAt: new Date().toISOString(),
  },
  HDFCBANK: {
    symbol: "HDFCBANK",
    name: "HDFC Bank Ltd",
    marketCap: 1102000,
    peRatio: 17.6,
    eps: 82.4,
    revenue: 215000,
    netIncome: 60300,
    totalDebt: 750000,
    dividendYield: 1.32,
    sector: "Financial Services",
    industry: "Private Banking",
    updatedAt: new Date().toISOString(),
  },
  INFY: {
    symbol: "INFY",
    name: "Infosys Ltd",
    marketCap: 675000,
    peRatio: 26.3,
    eps: 61.8,
    revenue: 153600,
    netIncome: 26200,
    totalDebt: 8200,
    dividendYield: 2.15,
    sector: "Information Technology",
    industry: "IT Consulting & Software",
    updatedAt: new Date().toISOString(),
  },
  TATAMOTORS: {
    symbol: "TATAMOTORS",
    name: "Tata Motors Ltd",
    marketCap: 365000,
    peRatio: 11.4,
    eps: 87.2,
    revenue: 437900,
    netIncome: 31800,
    totalDebt: 107000,
    dividendYield: 0.60,
    sector: "Automobile",
    industry: "Commercial & Passenger Vehicles",
    updatedAt: new Date().toISOString(),
  },
};

export class FundamentalsService {
  async getFundamentals(symbol: string): Promise<AssetFundamental | null> {
    const clean = symbol.toUpperCase().trim();
    return DEMO_FUNDAMENTALS[clean] || null;
  }

  async getAllFundamentals(): Promise<AssetFundamental[]> {
    return Object.values(DEMO_FUNDAMENTALS);
  }
}

export const fundamentalsService = new FundamentalsService();
