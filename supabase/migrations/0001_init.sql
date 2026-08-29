-- ============================================================
-- FINANCIAL DOCTOR (finX) — Database Migration 0001
-- PostgreSQL Schema with Row Level Security (RLS) & pgvector
-- ============================================================

-- Extensions
create extension if not exists "pgcrypto";
create extension if not exists "vector";

-- ------------------------------------------------------------
-- 1. PROFILES
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text,
  currency text not null default 'INR',
  risk_tolerance text check (risk_tolerance in ('conservative', 'moderate', 'aggressive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 2. PORTFOLIOS
-- ------------------------------------------------------------
create table if not exists public.portfolios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Primary Portfolio',
  total_assets numeric not null default 0,
  total_liabilities numeric not null default 0,
  net_worth numeric not null default 0,
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 3. ASSETS (User-owned holdings)
-- ------------------------------------------------------------
create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('stock', 'etf', 'mutual_fund', 'bank', 'real_estate', 'gold', 'other')),
  name text not null,
  symbol text,
  isin text,
  exchange text,
  sector text,
  value numeric not null check (value >= 0),
  quantity numeric,
  purchase_price numeric,
  last_updated timestamptz not null default now()
);
create index if not exists idx_assets_user on public.assets(user_id);

-- ------------------------------------------------------------
-- 4. LIABILITIES (User-owned debts)
-- ------------------------------------------------------------
create table if not exists public.liabilities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('loan', 'credit_card', 'mortgage', 'other')),
  name text not null,
  amount numeric not null check (amount >= 0),
  interest_rate numeric,
  monthly_payment numeric
);
create index if not exists idx_liabilities_user on public.liabilities(user_id);

-- ------------------------------------------------------------
-- 5. PORTFOLIO HOLDINGS (Normalized join table)
-- ------------------------------------------------------------
create table if not exists public.portfolio_holdings (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid references public.portfolios(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  asset_id uuid references public.assets(id) on delete set null,
  name text not null,
  type text not null,
  category text not null check (category in ('asset', 'liability')),
  value numeric not null,
  quantity numeric,
  allocation_pct numeric default 0,
  sector text,
  last_updated timestamptz not null default now()
);
create index if not exists idx_holdings_user on public.portfolio_holdings(user_id);

-- ------------------------------------------------------------
-- 6. TRANSACTIONS
-- ------------------------------------------------------------
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  portfolio_id uuid references public.portfolios(id) on delete set null,
  type text not null check (type in ('buy', 'sell', 'deposit', 'withdrawal', 'dividend', 'interest')),
  asset_name text not null,
  amount numeric not null,
  quantity numeric,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 7. NET WORTH SNAPSHOTS (Append-only time series for trend)
-- ------------------------------------------------------------
create table if not exists public.net_worth_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  total_assets numeric not null,
  total_liabilities numeric not null,
  net_worth numeric not null,
  computed_at timestamptz not null default now()
);
create index if not exists idx_snapshots_user_time on public.net_worth_snapshots(user_id, computed_at asc);

-- ------------------------------------------------------------
-- 8. ASSET PRICES & FUNDAMENTALS (Global / Shared Cache)
-- ------------------------------------------------------------
create table if not exists public.asset_prices (
  symbol text primary key,
  name text not null,
  price numeric not null,
  change_24h numeric not null default 0,
  change_24h_pct numeric not null default 0,
  high_24h numeric,
  low_24h numeric,
  volume numeric default 0,
  updated_at timestamptz not null default now(),
  source text not null default 'market_adapter'
);

create table if not exists public.asset_fundamentals (
  symbol text primary key,
  name text not null,
  market_cap numeric not null default 0,
  pe_ratio numeric,
  eps numeric,
  revenue numeric,
  net_income numeric,
  total_debt numeric,
  dividend_yield numeric,
  sector text not null,
  industry text,
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 9. MARKET INDICES & EVENTS
-- ------------------------------------------------------------
create table if not exists public.market_indices (
  symbol text primary key,
  name text not null,
  value numeric not null,
  change numeric not null default 0,
  change_pct numeric not null default 0,
  trend text check (trend in ('up', 'down', 'flat')),
  historical_points jsonb default '[]',
  updated_at timestamptz not null default now()
);

create table if not exists public.market_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null check (category in ('monetary_policy', 'corporate_earnings', 'inflation', 'macro')),
  impact text check (impact in ('low', 'medium', 'high')),
  date timestamptz not null default now(),
  description text not null
);

-- ------------------------------------------------------------
-- 10. NEWS & SENTIMENT
-- ------------------------------------------------------------
create table if not exists public.news_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null,
  credibility_score numeric not null default 1.0
);

create table if not exists public.news_articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null,
  source text not null,
  summary text not null,
  published_at timestamptz not null default now(),
  ticker text,
  sentiment text not null check (sentiment in ('positive', 'neutral', 'negative')),
  sentiment_score numeric not null default 0
);
create index if not exists idx_news_published on public.news_articles(published_at desc);

create table if not exists public.news_embeddings (
  article_id uuid primary key references public.news_articles(id) on delete cascade,
  embedding vector(1536),
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 11. RISK ANALYSES & RISK SCORES
-- ------------------------------------------------------------
create table if not exists public.risk_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  risk_score int not null check (risk_score between 0 and 100),
  diversification_score int not null check (diversification_score between 0 and 100),
  band text not null default 'Moderate Risk',
  volatility_score int default 0,
  concentration_score int default 0,
  debt_score int default 0,
  liquidity_score int default 0,
  correlation_score int default 0,
  sector_score int default 0,
  factors jsonb not null default '[]',
  flags jsonb not null default '[]',
  explanation text not null,
  computed_at timestamptz not null default now()
);
create index if not exists idx_risk_user on public.risk_analyses(user_id, computed_at desc);

-- ------------------------------------------------------------
-- 12. ALERTS & NOTIFICATIONS
-- ------------------------------------------------------------
create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null check (type in ('risk_change', 'concentration_alert', 'scam_warning', 'market_shock', 'info')),
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
  read boolean not null default false,
  dismissed boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_alerts_user on public.alerts(user_id, created_at desc);

-- ------------------------------------------------------------
-- 13. SIMULATIONS & STRESS TESTS
-- ------------------------------------------------------------
create table if not exists public.simulations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  baseline_net_worth numeric not null,
  assumptions jsonb not null,
  projected_net_worth numeric not null,
  projection_years int not null,
  yearly_points jsonb not null default '[]',
  stress_test_results jsonb default '[]',
  explanation text not null,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 14. AI COPILOT CONVERSATIONS & INSIGHTS
-- ------------------------------------------------------------
create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New Research Session',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  citations jsonb default '[]',
  confidence numeric,
  factors jsonb default '[]',
  created_at timestamptz not null default now()
);
create index if not exists idx_messages_conv on public.ai_messages(conversation_id, created_at asc);

create table if not exists public.ai_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('risk_warning', 'diversification_tip', 'market_context', 'anomaly_alert')),
  title text not null,
  description text not null,
  severity text not null check (severity in ('low', 'medium', 'high')),
  action_label text,
  citations jsonb default '[]',
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 15. REFERENCE SNIPPETS (SEBI / RBI Regulatory KB for RAG)
-- ------------------------------------------------------------
create table if not exists public.reference_snippets (
  id uuid primary key default gen_random_uuid(),
  topic text not null,
  title text not null,
  url text not null,
  snippet text not null
);

-- ------------------------------------------------------------
-- 16. SCAM ANALYSES
-- ------------------------------------------------------------
create table if not exists public.scam_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  claim_text text not null,
  verdict text not null check (verdict in ('likely_credible', 'unverifiable', 'likely_misleading', 'likely_scam')),
  risk_score int not null check (risk_score between 0 and 100),
  risk_level text not null check (risk_level in ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  detected_signals jsonb not null default '[]',
  explanation text not null,
  sources jsonb not null default '[]',
  analyzed_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 17. AI AUDIT LOG (Compliance Ledger)
-- ------------------------------------------------------------
create table if not exists public.ai_audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  request_id text,
  action text not null default 'ai_completion',
  route text not null,
  model text not null,
  prompt text not null,
  response text not null,
  sources jsonb not null default '[]',
  input_hash text,
  output_hash text,
  created_at timestamptz not null default now()
);
create index if not exists idx_audit_user on public.ai_audit_log(user_id, created_at desc);

-- ------------------------------------------------------------
-- 18. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------
alter table public.profiles           enable row level security;
alter table public.portfolios         enable row level security;
alter table public.assets             enable row level security;
alter table public.liabilities        enable row level security;
alter table public.portfolio_holdings enable row level security;
alter table public.transactions       enable row level security;
alter table public.net_worth_snapshots enable row level security;
alter table public.risk_analyses      enable row level security;
alter table public.alerts             enable row level security;
alter table public.simulations        enable row level security;
alter table public.ai_conversations   enable row level security;
alter table public.ai_messages        enable row level security;
alter table public.ai_insights        enable row level security;
alter table public.scam_analyses      enable row level security;
alter table public.ai_audit_log       enable row level security;

-- Publicly readable shared reference data (Authenticated users)
alter table public.asset_prices       enable row level security;
alter table public.asset_fundamentals enable row level security;
alter table public.market_indices     enable row level security;
alter table public.market_events      enable row level security;
alter table public.news_articles      enable row level security;
alter table public.news_sources       enable row level security;
alter table public.reference_snippets enable row level security;

-- Own-rows policies for user tables
create policy own_profiles on public.profiles using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_portfolios on public.portfolios using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_assets on public.assets using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_liabilities on public.liabilities using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_holdings on public.portfolio_holdings using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_transactions on public.transactions using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_snapshots on public.net_worth_snapshots using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_risk on public.risk_analyses using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_alerts on public.alerts using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_simulations on public.simulations using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_conversations on public.ai_conversations using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_messages on public.ai_messages using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_insights on public.ai_insights using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_scam_analyses on public.scam_analyses using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy read_own_audit on public.ai_audit_log for select using (user_id = auth.uid());

-- Shared reference read policies (Any authenticated or public reader)
create policy read_asset_prices on public.asset_prices for select using (true);
create policy read_fundamentals on public.asset_fundamentals for select using (true);
create policy read_indices on public.market_indices for select using (true);
create policy read_market_events on public.market_events for select using (true);
create policy read_news on public.news_articles for select using (true);
create policy read_news_sources on public.news_sources for select using (true);
create policy read_snippets on public.reference_snippets for select using (true);

-- ------------------------------------------------------------
-- 19. SEED DATA FOR REGULATORY KB & MARKETS
-- ------------------------------------------------------------
insert into public.reference_snippets (topic, title, url, snippet) values
('guaranteed returns', 'SEBI Prohibition on Assured Returns', 'https://www.sebi.gov.in/legal/regulations/sebi-investment-advisers-regulations-2013.html', 'Under SEBI regulations, registered investment advisers and market intermediaries are strictly prohibited from promising or guaranteeing assured fixed returns on market-linked investments.'),
('doubling schemes', 'RBI Public Caution on Chit & Doubling Frauds', 'https://www.rbi.org.in/scripts/BS_PressReleaseDisplay.aspx', 'The Reserve Bank of India cautions the public against unauthorized schemes promising to double or multiply money in unrealistic short timeframes, often operating as illegal Ponzi or multi-level marketing pyramids.'),
('unregistered advisor', 'SEBI Advisory on Unregistered WhatsApp/Telegram Tipsters', 'https://www.sebi.gov.in/enforcement/orders/unregistered-advisory-warnings.html', 'Investors are advised to verify that any financial advisory entity is registered with SEBI before acting on trading recommendations or stock tips circulated via social messaging apps.'),
('pump and dump', 'NSE & BSE Market Surveillance Guidelines', 'https://www.nseindia.com/invest/investor-awareness', 'Microcap stock recommendations shared aggressively on social channels without fundamental analysis are often part of illicit pump-and-dump operations designed to artificially inflate prices before insiders exit.'),
('crypto schemes', 'RBI & Financial Intelligence Unit Guidelines', 'https://www.rbi.org.in', 'Virtual digital asset offerings promising risk-free high daily yields or automated arbitrage carry extreme capital loss risks and are not backed by any sovereign guarantee.'),
('fake sebibadge', 'SEBI Intermediary Verification Portal', 'https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRecognisedFpi=yes', 'Fraudsters frequently forge SEBI registration certificates. Retail investors should cross-check certificate registration numbers directly on the official SEBI directory.')
on conflict do nothing;

insert into public.market_indices (symbol, name, value, change, change_pct, trend) values
('NIFTY_50', 'Nifty 50', 22450.80, 125.40, 0.56, 'up'),
('SENSEX', 'BSE Sensex', 73890.15, 380.20, 0.52, 'up'),
('BANK_NIFTY', 'Bank Nifty', 47680.90, -95.30, -0.20, 'down'),
('GOLD_MCX', 'Gold (10g / INR)', 71200.00, 310.00, 0.44, 'up'),
('IN_10Y_BOND', 'India 10Y Bond Yield', 7.08, -0.02, -0.28, 'down')
on conflict do nothing;
