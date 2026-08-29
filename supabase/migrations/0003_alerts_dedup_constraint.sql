-- ============================================================
-- FINANCIAL DOCTOR (finX) — Migration 0003
-- Prevent duplicate alerts under concurrent risk-analysis requests.
-- A partial unique index (only over non-dismissed rows) lets the same
-- alert reappear later if it was previously dismissed and recurs.
-- ============================================================

create unique index if not exists uniq_active_alert_per_user
  on public.alerts (user_id, type, message)
  where dismissed = false;
