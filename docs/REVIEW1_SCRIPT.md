# Financial Doctor (finX) — Review 1 Presentation Script

A spoken walkthrough for presenting the project to judges. Keep each section to ~30–60 seconds unless noted. Pulled from the actual codebase — no invented claims.

---

## 1. Opening (30s)

> "Good [morning/afternoon], we're presenting **Financial Doctor (finX)** — an AI-powered financial intelligence and decision-support platform built for retail investors. It combines deterministic financial math, live market data, and a grounded AI copilot that is designed to **never hallucinate numbers or sources**."

---

## 2. The Problem (45s)

> "Retail investors — especially in India — face three real problems:
> 1. They have **no objective visibility** into their own portfolio risk: concentration, debt burden, liquidity.
> 2. **Investment scams are rampant** — guaranteed-return schemes, WhatsApp/Telegram tip groups — and there's no fast way for an ordinary person to check a claim against SEBI or RBI rules.
> 3. **Generic AI chatbots are dangerous here** — an LLM that hallucinates a number or a regulation, or casually says 'buy this stock,' creates real legal and financial risk in a regulated market."

---

## 3. The Solution (45s)

> "finX is a non-advisory, educational decision-support tool with seven integrated modules: a Portfolio & Net Worth Engine, a Deterministic Risk Engine, a Scam Detector, an AI Research Copilot, a What-If Simulator, Live Market Intelligence, and an AI Compliance Audit Trail.
>
> The single most important design decision in this product: **the AI never does the math, and never invents facts.** All financial calculations run in pure, testable TypeScript. The LLM is only ever used to explain verified numbers in plain language, or to pick from a pre-retrieved, verified list of sources."

---

## 4. Tech Stack (60s — have this as a slide)

```
Frontend       Next.js 14 (App Router) · TypeScript · Tailwind CSS
               Recharts (charts) · Lucide Icons · Framer Motion

Backend        Next.js Route Handlers · Service Layer Pattern (/services)

Database       Supabase (PostgreSQL) · pgvector embeddings
               Row Level Security (RLS) on every table

AI Gateway     OpenRouter API — JSON mode, temperature 0.2, auto-retry
               Default model: Llama 3.3 70B (free tier)

Data Sources   Yahoo Finance (live indices/quotes, no API key needed)
               GNews.io (news + sentiment, free tier)

Parsing        Papa Parse (CSV) · SheetJS/xlsx (Excel import & export)
Validation     Zod runtime schemas on every API boundary
State/Fetch    TanStack Query (React Query)
```

> "Everything runs on a free-tier stack — OpenRouter's free model, Yahoo Finance with no key, GNews free tier — so the whole system is runnable at **zero cost**, which matters for a literacy tool aimed at everyday investors."

---

## 5. Architecture (45s — show the diagram)

```
Next.js 14 App Router (TypeScript, Tailwind)
   Client Pages (19 routes) → Route Handlers (/api/*) → Service Layer
                                        │
        ┌───────────────────┬──────────┴──────────┐
        ▼                   ▼                     ▼
 Deterministic        AI Gateway            External Data
 Finance Engine       (OpenRouter,          (Yahoo Finance,
 (lib/finance.ts,     JSON mode,             GNews.io)
 pure TS, zero deps)  temp 0.2)
        │                   │
        └─────────┬─────────┘
                   ▼
        Supabase PostgreSQL
        (pgvector + Row Level Security)
```

> "Requests flow from the client through Next.js route handlers into a service layer, which either calls our pure-TypeScript finance engine, the AI gateway, or external market/news APIs — all backed by Supabase Postgres with row-level security."

---

## 6. Deterministic Risk Engine — the Math (60s)

> "This is the core differentiator, so I want to show the actual formula, not just describe it."

```
Net Worth = Total Assets − Total Liabilities

Diversification Score (0–100):
  HHI = Σ(share_i²)  across 6 asset classes
  Score = round( (1 − HHI) / (1 − 1/6) × 100 )

Financial Risk Indicator (0–100):
  Risk = 0.40 × Concentration + 0.40 × Debt Ratio + 0.20 × Liquidity Risk

Risk bands: ≤33 Lower · 34–66 Moderate · ≥67 Higher Risk
```

> "Worked example: Bank ₹2L, Stock ₹6L, Gold ₹2L, Loan ₹5L → Net Worth ₹5L, Diversification 67/100, Risk Score 54/100 — Moderate Risk, with flags for stock concentration and high debt ratio. All of this is computed in `lib/finance.ts` — zero external dependencies, fully unit-testable, and the AI never touches these numbers."

---

## 7. Scam Detector — RAG with a Hard Safety Guard (60s)

> "This is our answer to the hallucination problem. A user pastes a claim like 'Guaranteed 30% monthly return from an automated trading bot.'"

```
Claim submitted
   → rule-based heuristic scan (guaranteed returns, urgency, zero-risk language)
   → RAG retrieval against SEBI / RBI / AMFI regulatory knowledge base
       → 0 sources found → verdict is HARD-CODED "Unverifiable" in code
                             (the LLM cannot override this)
       → sources found   → LLM classifies verdict using ONLY those sources,
                             citations are post-validated against retrieval —
                             any fabricated URL is stripped before the user sees it
```

> "Verdicts range from `likely_credible` to `likely_scam`. The key guarantee: **if the system found zero regulatory sources, the code itself forces an 'Unverifiable' result** — this isn't left up to the LLM's judgment."

---

## 8. AI Copilot (30s)

> "The Copilot fuses four things before it ever calls the LLM: the user's live portfolio and risk scores, a live market snapshot, RAG-retrieved regulatory sources, and a strict system prompt that forbids personalized buy/sell/hold directives. Output is structured JSON, not freeform text we have to parse."

---

## 9. Compliance & Safety Posture (45s — important for judges)

> "We explicitly do not position finX as a SEBI-registered investment adviser. The guardrails are in code, not just UI copy:
> - A hard-coded AI safety clause is injected into every system prompt
> - Zero-source scam claims are code-forced to 'Unverifiable'
> - Citation post-validation strips any hallucinated URL
> - Every AI call — prompt, response, model ID, sources, hash — is logged in an immutable audit trail at `/audit`"

---

## 10. Live Demo Plan (2–3 min)

1. Upload `person1_financially_stable.xlsx` → Dashboard shows Moderate/Lower risk, high diversification, no high-severity flags.
2. Upload `person2_financially_unstable.xlsx` → Dashboard shows negative net worth, high concentration + debt flags, low-liquidity warning.
3. Ask the Copilot the same question ("Am I in good financial shape?") for both portfolios — show the answer changes based on real computed metrics.
4. Paste a scam claim into the Scam Detector → show a CRITICAL verdict with a real SEBI citation.
5. Open the Simulator → run a 15-year SIP projection with a -20% market shock stress test.

---

## 11. Numbers Worth Saying Out Loud

- **7** integrated product modules
- **23** database tables, all protected by Row Level Security
- **6** canonical asset categories used in the diversification math
- **100%** deterministic math for risk/net-worth — zero AI in the calculation path
- **0** hallucinated sources possible by design
- **$0** cost to run — fully free-tier stack

---

## 12. Closing / Roadmap (30s)

> "Looking ahead: semantic news retrieval using the pgvector column we've already provisioned, read-only broker/bank aggregation instead of manual import, real-time push alerts, and multi-currency support. But what's live today is a fully working, zero-cost, end-to-end platform — not a mockup."

---

## Anticipated Judge Questions & Answers

**Q: Why not just let the LLM compute the risk score directly?**
A: LLMs can silently misstate arithmetic or drift on repeated calls. Keeping every calculation in pure TypeScript makes the numbers deterministic, testable, and auditable — the AI's only job is explaining them in plain language.

**Q: How do you prevent the scam detector from making up a regulation?**
A: Citation post-validation. Every URL the LLM cites is checked against the actual retrieval set before being shown to the user; anything not in that set is stripped. If retrieval returns zero sources, the verdict is forced to "Unverifiable" in code before the LLM is even called.

**Q: Is this giving financial advice?**
A: No — it's explicitly educational. The system prompt and UI both forbid personalized buy/sell/hold/allocate directives, and every page carries a disclaimer that this isn't a SEBI-registered advisory service.

**Q: What happens without API keys (offline demo risk)?**
A: The app degrades gracefully — high-fidelity local demo datasets and deterministic fallbacks kick in automatically, so a live demo isn't dependent on external API uptime.

**Q: What's the cost to run this in production?**
A: Near-zero at current scale — OpenRouter's free-tier model, Yahoo Finance's public endpoint (no key), and GNews's free tier (100 requests/day) cover the entire stack.

---

*Source of truth: `README.md`, `CONTRACTS.md`, `docs/PPT_CONTEXT.md`, `lib/finance.ts`, `package.json`.*
