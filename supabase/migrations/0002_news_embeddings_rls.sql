-- ============================================================
-- FINANCIAL DOCTOR (finX) — Migration 0002
-- Enable RLS on news_embeddings (missed in 0001_init.sql)
-- ============================================================

alter table public.news_embeddings enable row level security;

create policy read_news_embeddings on public.news_embeddings for select using (true);
