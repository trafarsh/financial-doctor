# financial-doctor — API Contracts

All routes are server-side (App Router route handlers). **`userId` is always taken
from the authenticated session, never from the request** — it is shown below only
to describe what the row belongs to. All bodies are zod-validated. All responses
are `application/json`.

---

### `POST /api/portfolio/import`
Import/replace the user's holdings and record a net-worth snapshot.
```
Request:  { assets: AssetInput[], liabilities: LiabilityInput[] }
          // *Input = same shape minus id/userId/lastUpdated (server sets these)
Response: { snapshot: NetWorthSnapshot }
Errors:   400 invalid rows (returns { errors: {row:number, reason:string}[] })
          401 not authenticated
Side fx:  inserts assets + liabilities; APPENDS one net_worth_snapshots row
```

### `GET /api/portfolio/networth-history`
```
Response: { snapshots: NetWorthSnapshot[] }   // ordered by computedAt asc
```

---

### `GET /api/risk/analyze`
Compute (or recompute) the user's risk analysis.
```
Response: { analysis: RiskAnalysis }
Notes:    scores + flags computed in /lib/finance.ts; explanation from LLM;
          row stored in risk_analyses; LLM call audit-logged.
```

---

### `POST /api/ai/scam-check`
```
Request:  { claimText: string }              // 1..2000 chars
Response: { result: ScamCheckResult }
Hard rule: sources.length === 0  ⇒  verdict === "unverifiable" (enforced in code)
Side fx:  audit-logs the LLM call
```

---

### `POST /api/ai/simulate`
```
Request:  { assumptions: { monthlyInvestment: number, annualReturnPct: number },
            years: number }                  // years 1..40
Response: { scenario: SimulationScenario }   // includes yearlyPoints[]
Notes:    projection math in /lib/finance.ts; LLM writes explanation only;
          audit-logged. Response labeled illustrative in the UI.
```

---

## Shared error envelope
```
{ error: string, details?: unknown }   // non-2xx
```

## Zod schemas live next to the routes
Each route imports its request schema from a colocated `schema.ts` and its output
types from `/lib/types.ts`. If a shape needs to change, change `/lib/types.ts` and
this file together — never a private per-route shape.
