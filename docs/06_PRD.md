# financial-doctor — Product Requirements (PRD)

## 1. Problem
Retail investors lack a plain-language, trustworthy way to see their whole
financial picture and to sanity-check the flood of financial "tips" they receive.
Existing tools either give unlicensed advice or bury users in jargon.

## 2. Goal (prototype)
Ship a demo where a brand-new user can, in one sitting: build their net worth from
zero, see an explainable risk/diversification read, check a suspicious claim, and
run an illustrative projection — with every AI statement cited and no personalized
advice given.

## 3. Target user
A non-expert retail investor (primary market: India) who holds a mix of bank
balances, stocks/mutual funds, gold, maybe property, and some debt, and who
encounters finfluencer tips they can't evaluate.

## 4. User stories & acceptance criteria

**US1 — Auth**
As a user I can sign up and sign in so my data is private to me.
- ✅ email/password signup + login + logout
- ✅ protected pages redirect anonymous users to /login
- ✅ one user cannot read another's rows (RLS verified)

**US2 — Import my picture**
As a user I can enter assets/liabilities manually or via CSV.
- ✅ manual add/edit of assets and liabilities
- ✅ CSV upload validates and reports bad rows by number (no silent drops)
- ✅ importing records a net-worth snapshot

**US3 — Start from zero**
As a user with nothing tracked I can be guided through a net-worth builder.
- ✅ step-by-step plain-language questions, rough estimates allowed
- ✅ produces the same asset/liability shapes and a snapshot

**US4 — Understand my risk**
As a user I can see a risk score, diversification score, anomalies, and a
plain-language explanation.
- ✅ scores match `03_RISK_RULES.md` on a hand-checked example
- ✅ anomalies flagged per the threshold table
- ✅ explanation is literacy-framed with zero directives, and shows its basis

**US5 — See my trend**
As a returning user I can see my net worth over time.
- ✅ trend line renders from ≥2 snapshots

**US6 — Check a claim**
As a user I can paste a financial claim and get a verdict with sources.
- ✅ verdict + ≥1 cited source, OR "unverifiable" when no source found
- ✅ the check is audit-logged

**US7 — Run a what-if**
As a user I can adjust assumptions and see an illustrative projection.
- ✅ projection computed in TS (not the LLM), plotted as a curve
- ✅ labeled "illustrative, not a guarantee or advice"

## 5. Priority (MoSCoW)
- **Must:** US1, US2 (at least one import path), US4, US6, US7, persistent
  disclaimer, audit log.
- **Should:** US3 guided builder, US5 trend, CSV path.
- **Could:** edit/delete holdings, multiple chart types, live web retrieval.
- **Won't (this build):** real bank/brokerage linking, mobile app, multi-currency,
  real risk modeling, notifications, sharing.

## 6. Explicitly out of scope / non-goals
- No personalized investment advice or allocations.
- No trade execution.
- No storage of bank credentials or real account numbers.
- No claim of regulatory registration.

## 7. Success criteria for the demo
All five flows (US2/3 → US4/5 → US6 → US7) work end-to-end for a fresh user in a
~3-minute run, with the compliance checklist (`08`) fully green.
