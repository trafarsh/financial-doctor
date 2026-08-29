# Financial Doctor (finX) — Presentation Context Pack

Use this document as the single source of truth for generating a pitch/demo deck. Each section maps to one or more slides. Facts here are pulled directly from the codebase — nothing invented.

---

## 1. One-Line Pitch (Title Slide)

**Financial Doctor (finX)** — an AI-powered financial intelligence and decision-support platform for retail investors, combining deterministic math, live market data, and a grounded (zero-hallucination) AI copilot.

**Tagline:** AI Investor & Financial Literacy Copilot

---

## 2. The Problem (Slide: Problem Statement)

Retail investors in India face three compounding problems:
1. **No visibility into real portfolio risk** — most people don't know their concentration, debt burden, or liquidity risk in objective terms.
2. **Rampant investment scams** — "guaranteed returns," WhatsApp/Telegram tip groups, and pump-and-dump schemes prey on retail investors who have no fast way to fact-check a claim against SEBI/RBI rules.
3. **Generic AI advice is dangerous** — AI chatbots that hallucinate financial facts or implicitly give buy/sell advice create real legal and financial risk, especially in a regulated market.

---

## 3. The Solution (Slide: What finX Does)

finX is a **non-advisory, educational decision-support tool** with 7 integrated modules:

| Module | What it does | Route |
|---|---|---|
| Portfolio & Net Worth Engine | Manual entry, CSV/Excel import, guided 6-step wizard, historical net-worth snapshots | `/import`, `/dashboard`, `/networth` |
| Deterministic Risk Engine | Pure TypeScript risk scoring — no AI involved in the math | `/dashboard`, `/portfolio/overview` |
| Scam & Misinformation Detector | RAG-grounded claim verification against SEBI/RBI/AMFI sources | `/scam-detector` |
| AI Research Copilot | Context-aware Q&A fusing portfolio + market + regulatory data | `/copilot` |
| What-If Scenario Simulator | Compound growth projection + stress tests | `/simulator` |
| Live Market Intelligence | Indices, equities, fundamentals, news sentiment | `/markets/overview` |
| AI Compliance Audit Trail | Immutable log of every AI prompt/response/citation | `/audit` |

**Key differentiator — the core design principle:** *The AI never does math, and never invents facts.* All financial calculations run in pure, testable TypeScript. The LLM is only ever used to translate verified numbers into plain-language explanation, or to select from a pre-retrieved, verified source list. This is the single most important architectural decision in the product and should be a dedicated slide.

---

## 4. How It's Different from "Just ChatGPT for Finance" (Slide: Differentiation)

| Typical AI Finance Chatbot | Financial Doctor (finX) |
|---|---|
| LLM computes risk scores → can hallucinate numbers | 100% deterministic TypeScript math (`lib/finance.ts`) — LLM never touches numbers |
| May cite made-up sources | **Hard code-level guard**: if zero regulatory sources are retrieved, the verdict is programmatically forced to `"Unverifiable"` — this cannot be overridden by the LLM |
| Gives direct "buy/sell/allocate X%" advice | System prompt and hard-coded compliance clause explicitly forbid personalized directives — frames everything as questions to bring to a SEBI-registered adviser |
| No audit trail | Every AI interaction (prompt, response, model ID, sources, hashes) is logged immutably (`/audit`) |
| Black-box scoring | Dashboard has a "How this is computed" modal showing the exact formula (e.g. `Risk = 0.40×Concentration + 0.40×Debt + 0.20×Liquidity`) |

---

## 5. Architecture (Slide: Technical Architecture)

```
┌─────────────────────────────────────────────────────┐
│  Next.js 14 App Router (TypeScript, Tailwind CSS)    │
│  ┌───────────────┐  ┌────────────────────────────┐  │
│  │ Client Pages  │  │ Route Handlers (/api/*)     │  │
│  │ (19 routes)   │→│  → Service Layer             │  │
│  └───────────────┘  └────────────────────────────┘  │
└───────────────────────────┬───────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                     ▼
┌───────────────┐   ┌─────────────────┐   ┌──────────────────┐
│ Deterministic  │   │  AI Gateway      │   │  External Data    │
│ Finance Engine │   │  (OpenRouter)    │   │  Providers         │
│ (lib/finance.ts│   │  JSON mode,      │   │  Yahoo Finance     │
│  pure TS, 0    │   │  temp 0.2,       │   │  (live quotes)     │
│  dependencies) │   │  auto-retry      │   │  GNews.io (news)   │
└───────────────┘   └─────────────────┘   └──────────────────┘
        │                    │
        └──────────┬─────────┘
                    ▼
        ┌────────────────────────┐
        │ Supabase (PostgreSQL)  │
        │ pgvector + Row Level   │
        │ Security (RLS)         │
        └────────────────────────┘
```

**Stack:**
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Recharts, Lucide Icons
- **Backend:** Next.js Route Handlers, Service Layer Pattern (`/services/*`)
- **Database:** Supabase PostgreSQL, pgvector embeddings, Row Level Security
- **AI Gateway:** OpenRouter API (JSON mode, temperature 0.2, automatic retries, free-tier Llama 3.3 70B by default)
- **Parsers:** Papa Parse (CSV), SheetJS/xlsx (Excel import & export)
- **Validation:** Zod runtime schemas on every API boundary

---

## 6. Deterministic Risk Engine — The Math (Slide: Under the Hood)

All formulas live in `lib/finance.ts`, zero external dependencies, fully unit-testable.

**Net Worth:**
```
Net Worth = Total Assets − Total Liabilities
```

**Diversification Score (0–100)** — Herfindahl-Hirschman Index across 6 canonical asset classes (stock, mutual_fund, bank, real_estate, gold, other):
```
HHI = Σ(share_i²)
Diversification Score = round( (1 − HHI) / (1 − 1/6) × 100 )
```

**Financial Risk Indicator (0–100)** — weighted blend of three components:
```
Risk Score = 0.40 × Concentration(HHI×100) + 0.40 × DebtRatio + 0.20 × LiquidityRisk
```
- Concentration Risk = HHI × 100
- Debt Risk = (Total Liabilities / Total Assets) × 100
- Liquidity Risk = 100 − (Bank/Cash share of assets × 100)

**Risk bands:** ≤33 = Lower Risk · 34–66 = Moderate Risk · ≥67 = Higher Risk

**Anomaly flags** (rule-based, deterministic thresholds from `lib/config.ts`):
- Single-category concentration ≥70% → High severity flag; ≥50% → Medium
- Debt-to-asset ratio ≥50% → High; ≥30% → Medium
- Bank/cash share <5% of assets → Low-liquidity flag

**Worked example (from test plan):** Bank ₹2L + Stock ₹6L + Gold ₹2L, Loan ₹5L → Net Worth ₹5L, Diversification 67/100, Risk Score 54/100 (Moderate), flags: Stock Concentration (Medium, 60%), High Debt Ratio (High, 50%).

---

## 7. Scam Detector — RAG with a Hard Safety Guard (Slide: Scam Detection Flow)

```
User submits claim
      │
      ▼
Rule-based heuristic scan (detectSuspiciousSignals)
  → flags: guaranteed returns, "double your money", WhatsApp/Telegram
    tip groups, zero-risk claims, insider tips, urgency tactics
      │
      ▼
RAG retrieval against regulatory knowledge base (SEBI/RBI/AMFI)
      │
      ├─► 0 sources found → HARD-CODED "Unverifiable" verdict
      │                      (cannot be overridden by the LLM — this
      │                       check happens in code, before the LLM
      │                       is ever called)
      │
      └─► sources found → LLM classifies verdict using ONLY the
                           retrieved sources, with citations
                           post-validated against the original
                           retrieval set (any fabricated URL is
                           stripped before it reaches the user)
```

**Verdicts:** `likely_credible` · `unverifiable` · `likely_misleading` · `likely_scam`
**Risk levels:** LOW · MEDIUM · HIGH · CRITICAL

**Seeded regulatory knowledge base** (`supabase/migrations/0001_init.sql`) currently covers: guaranteed-return prohibitions, doubling/chit-fund schemes, unregistered WhatsApp/Telegram advisers, pump-and-dump surveillance, crypto scheme warnings, and fake SEBI badge verification.

---

## 8. AI Copilot — Grounded, Context-Fused Q&A (Slide: Copilot)

Every copilot answer is built from four fused context sources before the LLM ever runs:
1. **User's live portfolio** — holdings, net worth, computed risk/diversification scores, active anomaly flags
2. **Live market snapshot** — current index values and % change
3. **RAG-retrieved regulatory sources** — relevant to the user's question
4. **Strict system prompt** — forbids personalized buy/sell/hold/allocate directives; requires distinguishing verified facts from general principles; requires citations

Output is structured JSON (summary, explanation, risk level, factors, citations) — never freeform prose the app has to parse heuristically.

---

## 9. Live Data Integrations (Slide: Real-World Data, Not Mocked)

| Data | Source | Fallback |
|---|---|---|
| Stock quotes & indices (NIFTY 50, SENSEX, BANK NIFTY, Gold, 10Y Bond) | Yahoo Finance public chart API (live, no key required) | High-fidelity static demo dataset if the live call fails |
| Financial news + sentiment | GNews.io free tier (100 req/day), India-filtered, keyword-tagged per ticker | Curated demo articles if no API key is configured |
| Regulatory knowledge base | Seeded Supabase table (`reference_snippets`) — SEBI/RBI/AMFI sourced | N/A — always available |
| Auth, portfolio storage, audit logs | Supabase PostgreSQL with Row Level Security | N/A |

Sentiment scoring for news is a lightweight deterministic keyword-weight model (not an LLM call) — fast and free.

---

## 10. Database Schema (Slide: Data Model)

23 tables in Supabase Postgres, all with Row Level Security enabled (own-row policies for user data, public-read for shared reference data):

- **User data (RLS: own-row only):** `profiles`, `portfolios`, `assets`, `liabilities`, `portfolio_holdings`, `transactions`, `net_worth_snapshots`, `risk_analyses`, `alerts`, `simulations`, `ai_conversations`, `ai_messages`, `ai_insights`, `scam_analyses`, `ai_audit_log`
- **Shared reference data (RLS: public read):** `asset_prices`, `asset_fundamentals`, `market_indices`, `market_events`, `news_articles`, `news_sources`, `reference_snippets`, `news_embeddings`
- **Vector search:** `news_embeddings` uses `pgvector` (1536-dim) for future semantic news retrieval

---

## 11. Compliance & Safety Posture (Slide: Regulatory Guardrails — important for judges/stakeholders)

Financial Doctor explicitly positions itself as **not** a registered investment adviser (SEBI or otherwise). Concrete guardrails baked into the code, not just the UI copy:

- Hard-coded AI safety clause injected into every LLM system prompt (`APP_CONFIG.disclaimer.aiSafetyClause`): never tells the user to buy/sell/hold/allocate; frames everything as education and questions for a licensed adviser
- Persistent disclaimer banner on every page (`DisclaimerBanner` component)
- Zero-source scam claims are **code-forced** to "Unverifiable," not left to LLM discretion
- Citation post-validation strips any URL the LLM didn't actually receive from retrieval — no hallucinated links ever reach the user
- Full audit ledger of every AI call: prompt, response, model ID, source array, input/output hash, timestamp

---

## 12. Screens / User Journey (Slide: Product Walkthrough — use as a click-through outline)

1. **Landing (`/`)** — pitch, feature preview cards, compliance boundaries, module grid
2. **Onboarding (`/onboarding`)** → **Import (`/import`)** — manual entry or CSV/Excel upload with row-level Zod validation and live net-worth preview
3. **Dashboard (`/dashboard`)** — net worth, risk/diversification gauges, historical trend chart, AI plain-language explanation, anomaly flags, market snapshot
4. **Portfolio Overview / Holdings** — detailed breakdown
5. **Markets Overview (`/markets/overview`)** — live indices, equities + fundamentals table, economic calendar
6. **Scam Detector (`/scam-detector`)** — paste a claim, get a grounded verdict + citations
7. **AI Copilot (`/copilot`)** — conversational research assistant
8. **Simulator (`/simulator`)** — SIP/return/horizon sliders, wealth curve, stress tests
9. **Reports (`/reports`)** — 12-section portfolio intelligence report
10. **Audit Log (`/audit`)** — transparency ledger of all AI activity
11. **Alerts (`/alerts`)** — risk-change and concentration notifications

---

## 13. Demo Script Suggestion (Slide: Live Demo Plan)

Use the two sample portfolios in `/excelsheets` to show contrast live:
1. Upload `person1_financially_stable.xlsx` → show Dashboard: Moderate/Lower risk score, high diversification, no high-severity flags
2. Upload `person2_financially_unstable.xlsx` → show Dashboard: negative net worth, high concentration + high debt ratio flags, low liquidity warning
3. Ask the Copilot the same question ("Am I in good financial shape?") for both — show how the answer changes based on real computed metrics, not generic advice
4. Paste a scam claim ("Guaranteed 30% monthly return from algorithmic forex bot") into Scam Detector → show CRITICAL verdict with SEBI citation
5. Open Simulator → run a 15-year SIP projection with a -20% market shock stress test

---

## 14. Metrics/Numbers Worth Putting on a Slide

- **7** integrated product modules
- **23** database tables, all RLS-protected
- **6** canonical asset categories for diversification math
- **100%** deterministic math for risk/net-worth (zero AI in the calculation path)
- **0** hallucinated sources possible by design (hard-coded zero-source guard + citation post-validation)
- Free-tier stack: OpenRouter free LLM model, Yahoo Finance (no key), GNews.io free tier (100 req/day) — **fully runnable at $0 cost**

---

## 15. Roadmap / Future Work (Slide: What's Next, optional closing slide)

- Semantic news retrieval using the already-provisioned `news_embeddings` pgvector column
- Broker/bank account aggregation (read-only) instead of manual import
- Push notifications for real-time alert delivery
- Multi-currency support beyond INR
- Expanded regulatory knowledge base (more SEBI/RBI/AMFI circulars)

---

## Source Files Referenced

`README.md`, `CONTRACTS.md`, `lib/finance.ts`, `lib/config.ts`, `lib/types.ts`, `services/scam/index.ts`, `services/ai/copilot.ts`, `services/market/index.ts`, `services/news/index.ts`, `supabase/migrations/0001_init.sql`, `supabase/migrations/0002_news_embeddings_rls.sql`, `package.json`, `app/*/page.tsx` (19 routes), `docs/*.md`
