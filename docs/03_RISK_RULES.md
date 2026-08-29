# financial-doctor — Risk & Diversification Rules

These fix the vague, self-contradicting thresholds in the original spec. All of
this runs as pure functions in `/lib/finance.ts`. The LLM never computes these
numbers — it only explains the ones produced here. Values are demo-grade
heuristics, and the UI must say so.

## 1. Inputs

```
assets: Asset[]        liabilities: Liability[]
totalAssets      = Σ asset.value
totalLiabilities = Σ liability.amount
netWorth         = totalAssets − totalLiabilities
```

## 2. Diversification score (0–100, higher = better spread)

Group assets by `type`, compute each type's share of `totalAssets`, then use a
Herfindahl-style concentration measure:

```
shares      = for each type: (Σ value in type) / totalAssets      // 0..1
HHI         = Σ shares²                                            // 1/n .. 1
diversificationScore = round( (1 − HHI) / (1 − 1/6) * 100 )        // 6 asset types
```
- All money in one type → HHI = 1 → score 0.
- Perfectly even across all 6 types → score 100.
- If `totalAssets = 0` → score 0 and a `low_liquidity`/`other` flag.

## 3. Risk score (0–100, higher = riskier)

Weighted sum of three explainable components, each 0–100, then clamp:

```
concentrationRisk = HHI * 100                                     // weight 0.40
debtRisk          = min(100, (totalLiabilities / max(totalAssets,1)) * 100)  // weight 0.40
liquidityRisk     = 100 − liquidShare*100                         // weight 0.20
  where liquidShare = (Σ value of type 'bank') / max(totalAssets,1)

riskScore = round( 0.40*concentrationRisk + 0.40*debtRisk + 0.20*liquidityRisk )
```

Interpretation bands (for UI labels only): 0–33 lower · 34–66 moderate · 67–100 higher.

## 4. Anomaly flags (fixed thresholds)

| Condition | flag.type | severity | message (literacy-framed) |
|---|---|---|---|
| any single asset type ≥ 70% of assets | concentration | high | "70%+ of your assets sit in one category — concentrated portfolios move together." |
| any single asset type 50–69% of assets | concentration | medium | "Over half your assets are in one category — worth understanding the tradeoff." |
| totalLiabilities / totalAssets ≥ 0.5 | high_debt_ratio | high | "Your debts are half or more of your assets — a common thing to discuss with an adviser." |
| totalLiabilities / totalAssets 0.3–0.49 | high_debt_ratio | medium | "Debt is a meaningful share of your assets." |
| bank share < 5% and totalAssets > 0 | low_liquidity | medium | "Very little is in cash/bank — you may have limited quick access to funds." |
| totalAssets = 0 | other | low | "No assets tracked yet — add some to see your analysis." |

Thresholds are constants at the top of `/lib/finance.ts` so they are easy to tune
and easy to point at during judging.

## 5. The LLM's only job here

Given `{riskScore, diversificationScore, flags, band}`, produce 2–4 sentences that:
- restate what the scores mean in plain language,
- reference the flags,
- give "questions to ask a registered adviser",
- contain NO buy/sell/allocation directive.

System-prompt clause to reuse verbatim:

> You explain a user's already-computed financial numbers for educational
> purposes only. You are not a registered investment adviser. Never tell the user
> to buy, sell, hold, or allocate to any specific asset, amount, or percentage.
> Frame everything as explanation and as questions they could raise with a
> licensed adviser. Do not invent numbers; use only those provided.
