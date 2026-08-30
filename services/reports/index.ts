// ============================================================
// FINANCIAL DOCTOR (finX) — Reports Generation Service
// Structured 12-section comprehensive portfolio health & intelligence report
// ============================================================

import { ComprehensiveReport } from "@/lib/types";
import { portfolioService } from "../portfolio";
import { marketProvider } from "../market";
import { analyzeFullRisk } from "@/lib/finance";

export class ReportsService {
  async generatePortfolioReport(userId: string): Promise<ComprehensiveReport> {
    const { assets, liabilities, netWorthSummary } = await portfolioService.getHoldings(userId);
    const riskAnalysis = analyzeFullRisk(userId, assets, liabilities);
    const indices = await marketProvider.getIndices();

    // Compute asset allocation percentages
    const totalAssets = netWorthSummary.totalAssets || 1;
    const allocationMap: Record<string, number> = {};
    for (const a of assets) {
      allocationMap[a.type] = (allocationMap[a.type] || 0) + Number(a.value);
    }
    const assetAllocation = Object.entries(allocationMap).map(([type, val]) => ({
      type: type === "mutual_fund" ? "HFUND" : type.replace("_", " ").toUpperCase(),
      value: val,
      pct: Math.round((val / totalAssets) * 1000) / 10,
    }));

    // Compute sector exposure
    const sectorMap: Record<string, number> = {};
    for (const a of assets) {
      const sector = a.sector || "Unclassified / General";
      sectorMap[sector] = (sectorMap[sector] || 0) + Number(a.value);
    }
    const sectorExposure = Object.entries(sectorMap).map(([sector, val]) => ({
      sector,
      value: val,
      pct: Math.round((val / totalAssets) * 1000) / 10,
    }));

    const topAsset = assets.length > 0
      ? [...assets].sort((a, b) => Number(b.value) - Number(a.value))[0].name
      : "None";

    return {
      id: `rep_${Date.now()}`,
      userId,
      generatedAt: new Date().toISOString(),
      portfolioSummary: {
        totalAssets: netWorthSummary.totalAssets,
        totalLiabilities: netWorthSummary.totalLiabilities,
        netWorth: netWorthSummary.netWorth,
        topAsset,
      },
      assetAllocation,
      sectorExposure,
      riskOverview: {
        riskScore: riskAnalysis.riskScore,
        diversificationScore: riskAnalysis.diversificationScore,
        band: riskAnalysis.band,
        flags: riskAnalysis.flags,
      },
      holdingsSnapshot: assets.map((a) => ({
        name: a.name,
        type: a.type,
        value: Number(a.value),
      })),
      marketContext:
        indices.length > 0
          ? indices.map((i) => `${i.name}: ${i.value.toLocaleString("en-IN")} (${i.changePct >= 0 ? "+" : ""}${i.changePct}%)`).join(" · ")
          : "Live market data unavailable at report generation time.",
      aiInsights: [
        `Portfolio concentration is scored at ${riskAnalysis.concentrationScore}/100.`,
        `Debt-to-asset ratio is ${(
          (netWorthSummary.totalLiabilities / (netWorthSummary.totalAssets || 1)) *
          100
        ).toFixed(1)}%.`,
        "No personalized buy/sell actions are suggested; review your risk band with a SEBI-registered advisor.",
      ],
      citations: [
        {
          id: "cit_1",
          title: "SEBI Investor Education & Risk Guidance",
          url: "https://www.sebi.gov.in/investor-awareness.html",
          source: "SEBI",
        },
        {
          id: "cit_2",
          title: "AMFI HFUND Industry Snapshot",
          url: "https://www.amfiindia.com",
          source: "AMFI",
        },
      ],
    };
  }
}

export const reportsService = new ReportsService();
