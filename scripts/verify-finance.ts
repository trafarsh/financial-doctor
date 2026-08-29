// ============================================================
// FINANCIAL DOCTOR (finX) — Verification Test Suite
// Verifies deterministic finance math against docs/11_TEST_PLAN.md
// ============================================================

import {
  computeNetWorth,
  computeDiversification,
  computeRiskScore,
  generateAnomalyFlags,
  projectNetWorth,
} from "../lib/finance";
import { Asset, Liability } from "../lib/types";

function runTests() {
  console.log("============================================================");
  console.log("RUNNING FINANCIAL DOCTOR DETERMINISTIC MATH VERIFICATION");
  console.log("============================================================");

  // Benchmark portfolio from docs/11_TEST_PLAN.md §1
  const testAssets: Asset[] = [
    { id: "1", userId: "test", type: "bank", name: "HDFC", value: 200000, lastUpdated: "" },
    { id: "2", userId: "test", type: "stock", name: "Reliance", value: 600000, lastUpdated: "" },
    { id: "3", userId: "test", type: "gold", name: "Coins", value: 200000, lastUpdated: "" },
  ];

  const testLiabilities: Liability[] = [
    { id: "1", userId: "test", type: "loan", name: "Car", amount: 500000 },
  ];

  // 1. Net Worth Test
  const { totalAssets, totalLiabilities, netWorth } = computeNetWorth(testAssets, testLiabilities);
  console.log(`[TEST 1] Net Worth: TotalAssets=${totalAssets}, TotalLiabilities=${totalLiabilities}, NetWorth=${netWorth}`);
  if (totalAssets !== 1000000 || totalLiabilities !== 500000 || netWorth !== 500000) {
    throw new Error(`FAIL: Net worth mismatch! Expected 1M / 500k / 500k, got ${totalAssets} / ${totalLiabilities} / ${netWorth}`);
  }
  console.log("  ✓ Net Worth matches worked example (500,000)");

  // 2. Diversification Score Test
  const { diversificationScore, hhi } = computeDiversification(testAssets);
  console.log(`[TEST 2] Diversification: HHI=${hhi}, Score=${diversificationScore}`);
  if (diversificationScore !== 67) {
    throw new Error(`FAIL: Diversification mismatch! Expected 67, got ${diversificationScore}`);
  }
  console.log("  ✓ Diversification score matches worked example (67)");

  // 3. Risk Score Test
  const riskResult = computeRiskScore(testAssets, testLiabilities);
  console.log(`[TEST 3] Risk Score: ${riskResult.riskScore}/100 (${riskResult.band})`);
  if (riskResult.riskScore !== 54) {
    throw new Error(`FAIL: Risk score mismatch! Expected 54, got ${riskResult.riskScore}`);
  }
  console.log("  ✓ Risk score matches worked example (54 - Moderate Risk)");

  // 4. Anomaly Flags Test
  const flags = generateAnomalyFlags(testAssets, testLiabilities);
  console.log(`[TEST 4] Generated ${flags.length} Anomaly Flags:`);
  flags.forEach((f) => console.log(`   - [${f.severity.toUpperCase()}] ${f.type}: ${f.message}`));
  const hasConcentration = flags.some((f) => f.type === "concentration" && f.severity === "medium");
  const hasDebt = flags.some((f) => f.type === "high_debt_ratio" && f.severity === "high");
  if (!hasConcentration || !hasDebt) {
    throw new Error("FAIL: Expected concentration medium & high debt ratio flags!");
  }
  console.log("  ✓ Anomaly flags match worked example");

  // 5. Compound Projection Test
  const sim = projectNetWorth(500000, {
    monthlyInvestment: 5000,
    annualReturnPct: 10,
    years: 10,
  });
  console.log(`[TEST 5] 10-Yr Compound Projection: Final Value = ₹${sim.projectedNetWorth.toLocaleString("en-IN")}`);
  if (sim.yearlyPoints.length !== 10 || sim.projectedNetWorth <= 500000) {
    throw new Error("FAIL: Compound projection calculation error!");
  }
  console.log("  ✓ Compound projection test passed");

  console.log("============================================================");
  console.log("ALL MATHEMATICAL BENCHMARKS VERIFIED SUCCESSFULLY (100% PASS)");
  console.log("============================================================");
}

runTests();
