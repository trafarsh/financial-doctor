# financial-doctor — Architecture

## 1. System overview

```
┌──────────────────────────────────────────────────────────────────┐
│                        BROWSER (Next.js client)                    │
│  /login /signup   /import /networth   /dashboard  /scam-check      │
│                    /simulator                                      │
│  - anon Supabase client (auth session only)                        │
│  - recharts, Papa Parse (client-side CSV parse)                    │
│  - persistent Disclaimer banner in root layout                     │
└───────────────┬──────────────────────────────────────────────────┘
                │  fetch() — session cookie carries auth
                ▼
┌──────────────────────────────────────────────────────────────────┐
│                 NEXT.JS SERVER (App Router API routes)             │
│  /api/portfolio/import          /api/risk/analyze                  │
│  /api/portfolio/networth-history/api/ai/scam-check                 │
│                                 /api/ai/simulate                   │
│                                                                    │
│  Every route:                                                      │
│   1. resolve userId from server session (NOT from the body)        │
│   2. zod-validate input                                            │
│   3. do money math in /lib/finance.ts (never the LLM)              │
│   4. call LLM via /lib/openrouter.ts (explanation only)            │
│   5. write ai_audit_log via /lib/audit.ts                          │
│   6. return typed JSON                                             │
└───────┬───────────────────────────────┬──────────────────────────┘
        │ service-role client            │ https
        ▼                                ▼
┌────────────────────────┐   ┌──────────────────────────────────────┐
│   SUPABASE (Postgres)  │   │        OPENROUTER (LLM)              │
│  auth.users            │   │  free-tier model, JSON output        │
│  assets, liabilities   │   │  swappable via OPENROUTER_MODEL      │
│  net_worth_snapshots ⏱ │   └──────────────────────────────────────┘
│  risk_analyses         │
│  reference_snippets    │   ⏱ = time-series (append-only) → trend
│  ai_audit_log          │
│  RLS on every table    │
└────────────────────────┘
```

## 2. Layering rules (what may import what)

| Layer | May import | Must NOT import |
|---|---|---|
| Client components | `/lib/supabase/client.ts`, `/lib/types.ts` | service-role client, `/lib/openrouter.ts`, `/lib/audit.ts` |
| API routes / server | `/lib/supabase/server.ts`, `/lib/finance.ts`, `/lib/openrouter.ts`, `/lib/audit.ts`, `/lib/types.ts` | anon client for privileged writes |
| `/lib/finance.ts` | nothing (pure functions) | supabase, openrouter |
| `/lib/openrouter.ts` | `/lib/audit.ts`, `/lib/types.ts` | supabase browser client |

Keeping `/lib/finance.ts` dependency-free is what makes the money math testable and
keeps the LLM out of arithmetic.

## 3. Auth & data-isolation model

- Supabase Auth issues a session cookie. Server components and API routes read the
  user via the server client; **`userId` is always `auth.uid()` server-side.**
- RLS policy on every user table: `USING (user_id = auth.uid())` for select,
  `WITH CHECK (user_id = auth.uid())` for insert/update.
- The service-role key bypasses RLS, so it lives only in `/lib/supabase/server.ts`
  and is only used in server code. Even then, routes still filter by the
  session userId — service-role is for writes the anon policy can't express, not a
  license to skip scoping.

## 4. The five request flows

**Import** — client parses CSV / collects form → `POST /api/portfolio/import`
→ validate → insert assets+liabilities → `computeNetWorth()` → **append** snapshot
→ return snapshot.

**Dashboard** — `GET /api/risk/analyze` computes scores+flags in TS → LLM writes
explanation → store + audit → client also calls `/api/portfolio/networth-history`
for the trend line.

**Scam-check** — `POST /api/ai/scam-check` → `retrieveContext(claim)` → if 0
sources ⇒ verdict forced to `unverifiable` in code → else LLM classifies →
zod-validate → audit → return.

**Simulator** — `POST /api/ai/simulate` → `projectNetWorth()` in TS → LLM explains
the numbers → audit → return scenario.

**Auth** — standard Supabase email/password; layout guard redirects anon users.

## 5. LLM call contract (every call, no exceptions)

```
system prompt  →  includes the compliance clause (no personalized directives,
                  literacy framing) EVERY time
output         →  strict JSON, zod-validated, one retry on invalid JSON
side effect    →  audit row written before the result is returned
math           →  never in the LLM; numbers are computed in TS and passed in
```

## 6. Deliberate scope cuts (prototype, 48h solo)

- Retrieval for scam-check ships against a seeded `reference_snippets` table by
  default; live web search is behind the same `retrieveContext()` seam and can be
  swapped in if a search tool is available. **This is the one "flex" feature** —
  everything else is real.
- Risk heuristics are simple and explainable by design (see RISK_RULES.md), not a
  real risk model. The UI says so.
- No real brokerage / bank connections — manual + CSV only.
