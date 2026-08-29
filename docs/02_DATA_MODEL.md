# financial-doctor — Data Model

This is the single source of truth for shapes. `/lib/types.ts` must match the
TypeScript below exactly; the Supabase schema must match the SQL below exactly.

## 1. TypeScript interfaces (`/lib/types.ts`)

```ts
export type AssetType =
  | "stock" | "mutual_fund" | "bank" | "real_estate" | "gold" | "other";
export type LiabilityType =
  | "loan" | "credit_card" | "mortgage" | "other";

export interface Asset {
  id: string;
  userId: string;
  type: AssetType;
  name: string;
  value: number;            // current value in ₹
  quantity?: number;
  lastUpdated: string;      // ISO
}

export interface Liability {
  id: string;
  userId: string;
  type: LiabilityType;
  name: string;
  amount: number;           // outstanding in ₹
  interestRate?: number;    // annual %
}

export interface NetWorthSnapshot {
  id: string;               // added — snapshots are time-series rows
  userId: string;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  computedAt: string;       // ISO — x-axis of the trend chart
}

export type AnomalyType =
  | "concentration" | "unusual_activity" | "high_debt_ratio" | "low_liquidity" | "other";

export interface AnomalyFlag {
  type: AnomalyType;
  severity: "low" | "medium" | "high";
  message: string;
}

export interface RiskAnalysis {
  id: string;
  userId: string;
  riskScore: number;            // 0-100, higher = riskier
  diversificationScore: number; // 0-100, higher = better spread
  explanation: string;          // LLM, literacy-framed, no directives
  flags: AnomalyFlag[];
  computedAt: string;
}

export interface Source {
  title: string;
  url: string;
  snippet?: string;
}

export type ScamVerdict =
  | "likely_credible" | "unverifiable" | "likely_misleading" | "likely_scam";

export interface ScamCheckResult {
  claimText: string;
  verdict: ScamVerdict;
  explanation: string;
  sources: Source[];        // if empty, verdict MUST be "unverifiable"
}

export interface SimulationScenario {
  userId: string;
  baselineNetWorth: number;
  assumptions: Record<string, number>;  // e.g. { monthlyInvestment, annualReturnPct }
  projectedNetWorth: number;
  projectionYears: number;
  yearlyPoints: { year: number; value: number }[];  // for the chart
  explanation: string;      // LLM, non-advisory, "illustrative" framing
}
```

Three changes vs. the original spec, all required for the demo to actually work:
`NetWorthSnapshot.id` (so snapshots are individual time-series rows, enabling the
trend chart), `SimulationScenario.yearlyPoints` (so the projection can be plotted,
not just stated as one number), and `SimulationScenario.explanation` (the contract
calls for an LLM explanation per `07_LLM_PROMPTS.md` §3 but the original shape had
nowhere to put it).

## 2. Database tables

| Table | Key columns | Notes |
|---|---|---|
| `auth.users` | (Supabase managed) | identity source; do NOT duplicate a users table |
| `assets` | id, user_id, type, name, value, quantity, last_updated | RLS |
| `liabilities` | id, user_id, type, name, amount, interest_rate | RLS |
| `net_worth_snapshots` | id, user_id, total_assets, total_liabilities, net_worth, computed_at | **append-only time series** |
| `risk_analyses` | id, user_id, risk_score, diversification_score, explanation, flags(jsonb), computed_at | RLS |
| `reference_snippets` | id, topic, title, url, snippet | seed data for scam-check fallback retrieval; readable by all authed users |
| `ai_audit_log` | id, user_id, route, model, prompt, response, sources(jsonb), created_at | write-only from server |

## 3. SQL migration (`/supabase/migrations/0001_init.sql`)

```sql
-- ASSETS
create table public.assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('stock','mutual_fund','bank','real_estate','gold','other')),
  name text not null,
  value numeric not null check (value >= 0),
  quantity numeric,
  last_updated timestamptz not null default now()
);

-- LIABILITIES
create table public.liabilities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('loan','credit_card','mortgage','other')),
  name text not null,
  amount numeric not null check (amount >= 0),
  interest_rate numeric
);

-- NET WORTH SNAPSHOTS (append-only time series)
create table public.net_worth_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  total_assets numeric not null,
  total_liabilities numeric not null,
  net_worth numeric not null,
  computed_at timestamptz not null default now()
);
create index on public.net_worth_snapshots (user_id, computed_at);

-- RISK ANALYSES
create table public.risk_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  risk_score int not null check (risk_score between 0 and 100),
  diversification_score int not null check (diversification_score between 0 and 100),
  explanation text not null,
  flags jsonb not null default '[]',
  computed_at timestamptz not null default now()
);

-- REFERENCE SNIPPETS (scam-check fallback retrieval seed)
create table public.reference_snippets (
  id uuid primary key default gen_random_uuid(),
  topic text not null,
  title text not null,
  url text not null,
  snippet text not null
);

-- AI AUDIT LOG
create table public.ai_audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  route text not null,
  model text not null,
  prompt text not null,
  response text not null,
  sources jsonb not null default '[]',
  created_at timestamptz not null default now()
);

-- ROW LEVEL SECURITY
alter table public.assets              enable row level security;
alter table public.liabilities         enable row level security;
alter table public.net_worth_snapshots enable row level security;
alter table public.risk_analyses       enable row level security;
alter table public.ai_audit_log        enable row level security;
alter table public.reference_snippets  enable row level security;

-- own-rows policies
create policy own_assets      on public.assets              using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_liabilities on public.liabilities         using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_snapshots   on public.net_worth_snapshots using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_risk        on public.risk_analyses       using (user_id = auth.uid()) with check (user_id = auth.uid());

-- audit log: users may read their own; inserts go through service-role (bypasses RLS)
create policy read_own_audit  on public.ai_audit_log for select using (user_id = auth.uid());

-- reference snippets: any authenticated user may read
create policy read_snippets   on public.reference_snippets for select using (auth.role() = 'authenticated');
```

## 4. CSV / Excel import contract

The importer accepts one file — **CSV or Excel (`.xlsx`/`.xls`)** — with a `kind`
column so assets and liabilities can share a file, or two separate files. Header
row required, first worksheet only for Excel. Extra columns ignored.

```
kind,type,name,value,quantity,interest_rate
asset,stock,Reliance,150000,10,
asset,bank,HDFC Savings,220000,,
liability,loan,Car Loan,300000,,9.5
```

Both formats parse to the identical row shape before validation:
- `.csv` → **Papa Parse** (text → rows).
- `.xlsx` / `.xls` → **SheetJS (`xlsx` package)**: read the workbook, take the
  first worksheet, `utils.sheet_to_json` → rows. Same header contract as CSV.
- Detect format by file extension/MIME type at upload; route to the matching
  parser; both feed the same zod validation below and the same
  `POST /api/portfolio/import` call — the API contract does not change.

Rules the importer enforces (zod), identical for both formats:
- `kind` ∈ {asset, liability}.
- asset rows: `type` ∈ AssetType, `value` ≥ 0 required; `quantity` optional.
- liability rows: `type` ∈ LiabilityType, `value` used as `amount` ≥ 0 required;
  `interest_rate` optional.
- Any row that fails validation is surfaced with its row number and reason — never
  silently dropped.

## 4a. Excel export (holdings)

`/holdings` offers "Export to Excel": client-side, generated from the
assets/liabilities already loaded in the browser (no new API route, no audit log —
it's a read-only download of the user's own already-fetched data, not an AI action
or a money-math step). Built with SheetJS `utils.json_to_sheet` +
`utils.book_new`/`writeFile`, using the **same column headers as the import
contract** (`kind,type,name,value,quantity,interest_rate`), so an exported file can
be edited and re-imported without remapping.

## 5. Net-worth math (`/lib/finance.ts`)

```
totalAssets       = Σ asset.value
totalLiabilities  = Σ liability.amount
netWorth          = totalAssets − totalLiabilities
```
Every import appends one `net_worth_snapshots` row → the sequence of rows is the
trend chart.
