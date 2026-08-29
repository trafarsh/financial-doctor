# financial-doctor — Screen List

Every screen/route in the prototype, its purpose, the APIs it touches, and its
states. `(auth)` routes are public; everything else is behind the auth guard.

## Legend
- **Auth:** 🔓 public · 🔒 requires session
- Every screen inherits the persistent **Disclaimer banner** and top nav.

## Screen inventory

| # | Route | Auth | Purpose | Calls | Key components |
|---|---|---|---|---|---|
| 1 | `/` (landing) | 🔓 | One-screen pitch + "what this is / isn't" + CTA to sign up | — | Hero, DisclaimerBanner, CTA |
| 2 | `/login` | 🔓 | Email/password sign in | Supabase Auth | AuthForm |
| 3 | `/signup` | 🔓 | Create account | Supabase Auth | AuthForm |
| 4 | `/onboarding` | 🔒 | First-run fork: "Import what I have" vs "Start from zero" | — | ChoiceCards |
| 5 | `/import` | 🔒 | Manual entry + CSV/Excel upload of assets/liabilities | `POST /api/portfolio/import` | Tabs, AssetRowForm, LiabilityRowForm, FileDropzone, RowErrorList, NetWorthPreview |
| 6 | `/networth` | 🔒 | Guided net-worth builder wizard (zero-asset path) | `POST /api/portfolio/import` | WizardStep, EstimateInput, ProgressBar, ReviewList |
| 7 | `/dashboard` | 🔒 | Net worth, trend, risk + diversification, anomalies, explanation | `GET /api/risk/analyze`, `GET /api/portfolio/networth-history` | NetWorthCard, NetWorthTrend, ScoreGauge×2, AnomalyChip, ExplanationPanel, BasisPopover |
| 8 | `/holdings` | 🔒 | View/edit/delete the list of assets & liabilities; export to Excel | `POST /api/portfolio/import` (re-import) | HoldingsTable, EditRow, DeleteConfirm, ExportButton |
| 9 | `/scam-check` | 🔒 | Paste a claim → verdict + cited sources | `POST /api/ai/scam-check` | ClaimInput, VerdictBadge, ExplanationPanel, SourceList |
| 10 | `/simulator` | 🔒 | What-if projection with sliders | `POST /api/ai/simulate` | AssumptionSliders, ProjectionChart, IllustrativeLabel, ExplanationPanel |
| 11 | `/audit` (optional) | 🔒 | The user's own AI-call history (compliance showcase) | reads `ai_audit_log` | AuditTable |
| 12 | `/settings` (optional) | 🔒 | Sign out, delete account/data | Supabase | DangerZone |
| — | `not-found` / `error` | 🔓 | 404 and error boundary | — | Friendly fallback |

## Minimum demo set (if you cut)
Must ship: **2, 3, 4, (5 or 6), 7, 9, 10**. Nice: 1, 8, 11. Optional: 12.

## Per-screen states (build all four where data is involved)
- **loading** — skeletons, never a blank flash.
- **empty** — new user with no data → a friendly prompt to the next action
  (dashboard with no holdings points to /import or /networth).
- **error** — API/LLM failure → plain message + retry; never a stack trace, never
  an uncited AI sentence.
- **success** — the populated view.

## Navigation flow
```
landing → signup → onboarding ─┬─ import ──┐
                               └─ networth ─┴─→ dashboard ⇄ holdings
                                                  ├→ scam-check
                                                  ├→ simulator
                                                  └→ audit (optional)
```

## Notes
- `/holdings` re-imports the full edited set through the same import endpoint so
  every change appends a fresh net-worth snapshot (keeps the trend honest).
- `/holdings` export is client-side only (SheetJS `writeFile` on already-fetched
  data) — no new API route, no audit-log row (not an AI action, no money math).
- `/audit` is a strong judging moment — it makes the compliance story visible —
  but it only reads existing rows, so it's cheap to add last.
