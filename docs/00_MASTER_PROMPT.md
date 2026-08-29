# financial-doctor — Claude Code Master Prompt

> Paste everything between the two `═══` rules into Claude Code in an empty repo.
> Everything above/below the rules is guidance for *you*, the human, not the agent.

**How to use:** Open Claude Code in an empty folder. Paste the prompt. Let it run Phase 0–1
first (scaffold + DB), verify Supabase connects, then let it continue phase by phase. Do NOT
paste your real API keys into the chat — put them in `.env.local` yourself when it tells you to.

═══════════════════════════════════════════════════════════════════════════════

You are building **financial-doctor** (AI Investor) — a financial-literacy and
decision-support copilot for retail investors — as a working prototype MVP, solo,
end to end, in this repo. Real Next.js frontend, real Supabase database + auth,
real LLM calls via OpenRouter. Build in the phase order below and do not start a
phase until the previous one runs against the real backend.

────────────────────────────────────────────────────────────
NON-NEGOTIABLE COMPLIANCE CONSTRAINTS (apply to every phase)
────────────────────────────────────────────────────────────
This is a financial-literacy / decision-support tool. It is NOT a registered
investment adviser and NOT a trading system. These are hard rules, not style
preferences:

1. NEVER produce personalized "buy/sell/invest in X" directives. Frame every AI
   output as analysis, plain-language explanation, and financial-literacy
   education ("here is what your numbers show", "questions to ask a registered
   adviser"). Bake this into the SYSTEM PROMPT of every single LLM call, not just
   UI copy.
2. Every AI claim about a market, company, or a claim's credibility must be
   grounded in a retrieved source and must show a visible citation in the UI.
   No bare AI claims anywhere.
3. Every LLM call writes a row to `ai_audit_log` (prompt, response, model,
   sources, userId, timestamp) BEFORE its result is returned to the client.
4. The LLM never does arithmetic that affects money. All net-worth, risk, and
   projection math runs in TypeScript. The LLM only explains numbers it is given.
5. A persistent disclaimer is visible in the app layout at all times.

────────────────────────────────────────────────────────────
SECURITY — TREAT AS PART OF "WORKING", NOT POLISH
────────────────────────────────────────────────────────────
- Enable Row Level Security on every user-data table from the moment it is
  created. Policy: a row is visible/writable only when `user_id = auth.uid()`.
- API routes derive `userId` from the authenticated Supabase session on the
  SERVER. NEVER trust a `userId` sent in a request body or query string.
- The service-role key is used only in server code (API routes / server
  components). It must never be imported into a client component or exposed to
  the browser. If you catch yourself importing it client-side, stop and fix it.
- Validate every API request body and query param with zod before use.

────────────────────────────────────────────────────────────
TECH STACK
────────────────────────────────────────────────────────────
Next.js 14+ (App Router) · TypeScript · Tailwind · @supabase/supabase-js ·
zod · recharts · OpenRouter (free-tier model, ID in one env var so it is
swappable) · Papa Parse for CSV · SheetJS (`xlsx` package) for Excel
import/export.

────────────────────────────────────────────────────────────
PHASE 0 — SCAFFOLD
────────────────────────────────────────────────────────────
- Init Next.js + TS + Tailwind + ESLint. Install the deps above.
- Create this structure (create empty route stubs now, fill later):
    /app/(auth)/login  /app/(auth)/signup
    /app/import  /app/networth  /app/dashboard  /app/scam-check  /app/simulator
    /app/api/portfolio/import  /app/api/portfolio/networth-history
    /app/api/risk/analyze  /app/api/ai/scam-check  /app/api/ai/simulate
    /lib/types.ts  /lib/supabase/client.ts  /lib/supabase/server.ts
    /lib/openrouter.ts  /lib/audit.ts  /lib/finance.ts
    /components (shared UI + the persistent Disclaimer banner)
- Create `/lib/types.ts` from DATA_MODEL.md (I will paste it, or reproduce the
  interfaces given there exactly — do not rename fields).
- Create `.env.example` with: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY, OPENROUTER_API_KEY, OPENROUTER_MODEL.
- Add the persistent disclaimer banner to the root layout now.
- STOP and tell me to fill in `.env.local`. Do not continue until I confirm.

────────────────────────────────────────────────────────────
PHASE 1 — DATABASE + AUTH
────────────────────────────────────────────────────────────
- Produce a single SQL migration (`/supabase/migrations/0001_init.sql`) that
  creates every table in DATA_MODEL.md, enables RLS on each, and adds the
  `user_id = auth.uid()` policies. Include the `net_worth_snapshots` table as a
  TIME SERIES (one row per computation, never overwritten) so a trend can be
  charted. Give me the SQL to run in the Supabase SQL editor.
- `/lib/supabase/client.ts` = browser (anon) client.
  `/lib/supabase/server.ts` = server client + a service-role client for API routes.
- Build /login and /signup with Supabase Auth (email/password). Add a signed-in
  layout guard that redirects anonymous users to /login.
- Verify end to end: sign up, land on an empty dashboard, sign out. Then continue.

────────────────────────────────────────────────────────────
PHASE 2 — IMPORT + GUIDED NET-WORTH BUILDER
────────────────────────────────────────────────────────────
- /app/import: manual add/edit for assets & liabilities, plus file upload
  accepting CSV or Excel (.xlsx/.xls) — Papa Parse for CSV, SheetJS for Excel
  (first worksheet), both converging on the same row shape → validate with zod
  → map to Asset[]/Liability[]. Reject malformed rows with a clear per-row
  error; never silently drop data. Column contract is in DATA_MODEL.md §4.
- /app/holdings: add an "Export to Excel" button that generates a `.xlsx` of the
  current assets/liabilities client-side (SheetJS `writeFile`, same column
  headers as the import contract) — no new API route, no audit-log entry.
- /app/networth: a guided wizard for users with nothing tracked — plain-language
  steps ("Any savings? Roughly how much?", "Any loans or EMIs?"), accepts rough
  estimates, produces the same Asset[]/Liability[] shapes.
- POST /api/portfolio/import: auth-scoped, zod-validated, writes rows, computes a
  NetWorthSnapshot via /lib/finance.ts, INSERTS it into net_worth_snapshots
  (append, never update), returns it.
- GET /api/portfolio/networth-history: returns the user's snapshots ordered by
  time, for the trend chart.
- Verify against the real DB before continuing.

────────────────────────────────────────────────────────────
PHASE 3 — RISK & DIVERSIFICATION ENGINE + DASHBOARD
────────────────────────────────────────────────────────────
- Put ALL scoring logic in /lib/finance.ts as pure, unit-testable functions,
  using the exact thresholds in RISK_RULES.md (do not invent your own). Write a
  few assertions/tests for them.
- GET /api/risk/analyze: pull the user's holdings, compute riskScore,
  diversificationScore, and AnomalyFlag[] in TypeScript, then call the LLM ONLY
  to write the plain-language `explanation`. Store in risk_analyses. Audit-log
  the LLM call.
- /app/dashboard: render score gauges, a net-worth TREND line (from history),
  and the anomaly-flag list. Every AI-written sentence shows its basis.
- Verify, then continue.

────────────────────────────────────────────────────────────
PHASE 4 — SCAM / MISLEADING-CLAIM CHECKER
────────────────────────────────────────────────────────────
- /lib/openrouter.ts: typed wrapper over OpenRouter chat completions. Forces
  JSON output, validates the parse with zod, retries once on invalid JSON, and
  routes every call through /lib/audit.ts.
- POST /api/ai/scam-check: given claimText, RETRIEVE context first, then have the
  model classify verdict + explanation + sources into ScamCheckResult exactly.
  HARD RULE: if retrieval returns zero usable sources, force verdict
  "unverifiable" in code — the model is never allowed to assert credible/scam
  with no source.
  RETRIEVAL: if a web-search tool/API is available in this environment, use it.
  If not, implement it against a small local `reference_snippets` seed table and
  clearly mark this as the fallback. Isolate retrieval behind one function so the
  source can be swapped without touching the route.
- /app/scam-check: paste-a-claim box → verdict badge + explanation + clickable
  cited sources.

────────────────────────────────────────────────────────────
PHASE 5 — WHAT-IF SIMULATOR
────────────────────────────────────────────────────────────
- /lib/finance.ts: `projectNetWorth(assumptions, years)` using a real compound-
  growth formula. The LLM does NOT compute this.
- POST /api/ai/simulate: run the math in TS, pass the resulting numbers to the
  LLM only for a short non-advisory explanation, audit-log it, return
  SimulationScenario.
- /app/simulator: sliders for assumptions → projected net-worth chart +
  explanation, labeled "Illustrative projection — not a guarantee or personalized
  advice."

────────────────────────────────────────────────────────────
PHASE 6 — COMPLIANCE & DEMO HARDENING (do not skip)
────────────────────────────────────────────────────────────
- Grep every LLM system prompt; confirm each forbids personalized buy/sell/invest
  directives and frames output as literacy/education.
- Confirm every AI claim in the UI shows its citation/basis.
- Confirm RLS is on for every user table and no route trusts a client userId.
- Confirm the service-role key never reaches a client bundle.
- Smoke-test as a brand-new user: signup → guided net-worth builder (zero-asset
  path) → dashboard → scam-check → simulator. Fix anything that breaks in that
  path before declaring done.

────────────────────────────────────────────────────────────
WORKING STYLE
────────────────────────────────────────────────────────────
- Go phase by phase. Commit after each phase with a clear message.
- Keep all money math in /lib/finance.ts and all LLM calls behind /lib/openrouter.ts.
- If time is short, cut breadth inside a phase (simpler charts, fewer asset types),
  never skip a phase — the demo needs all five flows present and working.
- When a phase is done, print a one-line "PHASE N COMPLETE — verified: <what you
  tested>" so I can track progress.

═══════════════════════════════════════════════════════════════════════════════
