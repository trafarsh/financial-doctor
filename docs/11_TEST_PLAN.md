# financial-doctor — Test Plan

Gate each phase with the relevant section. Money math and security get worked
examples because those are the features most likely to be wrong-but-plausible.

## 1. Worked example (use to verify `/lib/finance.ts`)
Holdings:
- bank "HDFC" 200,000
- stock "Reliance" 600,000
- gold "Coins" 200,000
- loan "Car" 500,000

Totals: totalAssets = 1,000,000 · totalLiabilities = 500,000 · **netWorth = 500,000**

Shares by type: bank .20, stock .60, gold .20 → HHI = .04+.36+.04 = **0.44**
- diversificationScore = round((1−0.44)/(1−1/6)*100) = round(0.56/0.8333*100) = **67**
- concentrationRisk = 44 · debtRisk = min(100, 500000/1000000*100)=50 ·
  liquidityRisk = 100 − 20 = 80
- riskScore = round(.40*44 + .40*50 + .20*80) = round(17.6+20+16) = **54** (moderate band)

Flags expected:
- stock 60% → concentration **medium** (50–69% band)
- debt ratio 0.5 → high_debt_ratio **high**

If the app disagrees with 500,000 / 67 / 54 / these flags, the engine is wrong.

## 2. Per-phase checks

**P1 DB+Auth**
- Sign up, sign in, sign out work.
- Anonymous hit on /dashboard → redirect to /login.
- RLS: as user A create an asset; as user B, query assets → returns none.

**P2 Import**
- Manual add of the four holdings above → net-worth preview shows 500,000.
- CSV with one bad row (e.g. value = "abc") → that row flagged by number, others
  still importable.
- Each successful import inserts exactly one net_worth_snapshots row.
- Guided wizard (zero-asset start) produces holdings + a snapshot.

**P3 Risk+Dashboard**
- Scores/flags match §1.
- Two imports → trend line shows 2 points.
- Explanation contains no buy/sell/allocation language; shows its basis.

**P4 Scam-check**
- "guaranteed to double your money in 30 days" → likely_scam or likely_misleading
  with ≥1 source.
- Random gibberish → unverifiable.
- Force zero retrieved sources → verdict is unverifiable regardless of model output.
- Each check writes an ai_audit_log row.

**P5 Simulator**
- monthlyInvestment 5,000, annualReturnPct 10, years 10 → curve rises, end value
  computed in TS (hand-check compound formula), explanation is non-advisory.

**P6 Compliance** — run `08_COMPLIANCE_CHECKLIST.md` top to bottom.

## 3. Edge cases to try
- Empty portfolio (totalAssets 0): diversification 0, "no assets tracked" flag,
  no divide-by-zero.
- All assets in one type: diversification 0, concentration high flag.
- Liabilities > assets: negative net worth renders correctly.
- Very large numbers: no formatting/overflow breakage.
- LLM returns malformed JSON: one retry, then safe fallback (no crash, no uncited
  claim shown).
- OpenRouter rate-limited/429: user sees a friendly error, app doesn't hang.

## 4. Optional automated tests
- Unit-test `/lib/finance.ts` against §1 (computeNetWorth, diversificationScore,
  riskScore, flag generation, projectNetWorth).
- A zod round-trip test per API schema.
These are "should," not "must," for a 48h prototype — but the finance unit tests
are the highest-value ones if you write any.

## 5. Definition of done
All P1–P6 checks pass, §1 matches exactly, and the compliance checklist is fully
green.
