# financial-doctor — Build Runbook

## 0. One-time setup (you, before pasting the prompt)
1. Create a Supabase project → copy Project URL, anon key, service-role key.
2. Create an OpenRouter account → copy an API key. Pick a current free model ID
   (the free list changes; check openrouter.ai/models and filter free). Put the ID
   in `OPENROUTER_MODEL` so it's swappable if the model gets rate-limited on
   demo day. Have a cheap paid model ID on standby as fallback.
3. Open Claude Code in an empty folder. Paste `00_MASTER_PROMPT.md`.
4. When the agent stops after Phase 0, create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
OPENROUTER_API_KEY=...
OPENROUTER_MODEL=...          # e.g. a free Llama/Gemini-Flash variant
```
5. Feed the agent `02_DATA_MODEL.md`, `03_RISK_RULES.md`, `04_API_CONTRACTS.md`
   when it reaches the phase that needs them (or paste all four reference docs up
   front and tell it to treat them as the source of truth).

## 1. Phase checklist (tick before moving on)
- [ ] **P0 Scaffold** — app boots, disclaimer banner visible, `.env.local` filled.
- [ ] **P1 DB+Auth** — migration run in Supabase; can sign up, sign in, sign out;
      anon users redirected from protected pages; RLS on all tables.
- [ ] **P2 Import** — manual add works; CSV import works and reports bad rows;
      guided wizard produces holdings; a snapshot row appears each import.
- [ ] **P3 Risk+Dashboard** — scores match RISK_RULES by hand-check; trend line
      renders from ≥2 snapshots; anomaly flags show; explanation has no directives.
- [ ] **P4 Scam-check** — returns verdict + ≥1 source; empty-source case forces
      "unverifiable"; row lands in ai_audit_log.
- [ ] **P5 Simulator** — projection curve renders; math verified by hand; labeled
      illustrative.
- [ ] **P6 Hardening** — grep of system prompts clean; no client import of
      service-role key; full new-user smoke test passes.

## 2. Seed data for `reference_snippets` (scam-check fallback)
Insert a handful so the checker has something to cite in the demo:
```sql
insert into public.reference_snippets (topic,title,url,snippet) values
('guaranteed returns','SEBI on guaranteed-return schemes','https://www.sebi.gov.in',
 'Registered advisers cannot promise guaranteed or assured returns on market-linked products.'),
('doubling money','RBI caution on doubling schemes','https://www.rbi.org.in',
 'Schemes promising to double money in a fixed short period are a common fraud pattern.'),
('unregistered advisor','Check SEBI registration','https://www.sebi.gov.in',
 'Investment advisers in India must be registered with SEBI; verify before acting.');
```
(For the demo, retrieval matches claim keywords to `topic`/`snippet`. Swap in real
web search behind `retrieveContext()` if a search tool is available.)

## 3. Manual verification snippets
- **RLS check:** sign in as user A, note an asset id; sign in as user B, try to
  fetch it — must return nothing.
- **Risk check:** put 100% in one asset type → diversificationScore 0,
  concentration high flag. Add a 50%-of-assets loan → high_debt_ratio flag.
- **Scam check:** paste "guaranteed to double your money in 30 days" → should
  return likely_scam/likely_misleading with a cited source; paste gibberish →
  unverifiable.
- **Audit:** after any AI action, confirm a new `ai_audit_log` row.

## 4. Demo script (5 flows in ~3 minutes)
1. Sign up as a fresh user.
2. Guided net-worth builder — zero-asset path, rough estimates → land on dashboard.
3. Dashboard — point at the risk/diversification scores and one anomaly flag;
   note the citation on the explanation.
4. Scam-check — paste a finfluencer-style "guaranteed returns" claim → show verdict
   + sources.
5. Simulator — drag monthly-investment slider → show the projected curve and the
   "illustrative, not advice" label.
6. Close on the persistent disclaimer + mention the audit log for compliance.

## 5. If you run out of time — cut order
Cut in this order (last-to-first priority), never removing a whole flow's entry point:
1. live web search → keep the seeded-snippet fallback.
2. CSV import → keep manual + wizard entry.
3. multiple chart types → keep one gauge + one trend line.
4. edit/delete of holdings → keep add-only.
Keep: auth, one import path, dashboard with real scores, scam-check, simulator.
