# financial-doctor — UI / Screens Spec

Keep it clean and legible — this is a literacy tool, so plain language and clear
hierarchy beat density. Tailwind. recharts for charts. Every screen inherits the
persistent disclaimer banner.

## Global
- **Root layout:** top nav (logo, nav links when signed in, sign-out), and a slim
  persistent **Disclaimer banner** (see copy below) pinned in the layout.
- **Auth guard:** signed-out users hitting a protected route → /login.
- **Empty states matter:** a brand-new user has no data; every screen needs a
  friendly zero-state that points to the next action.

## Screens

### /login, /signup
- Email + password, submit, link to the other. Inline error text on failure.

### /import
- Two tabs: **Manual** and **File** (CSV or Excel).
- Manual: add-row forms for assets and liabilities (type dropdown, name, value,
  optional quantity / interest rate); editable list; running net-worth preview.
- File: file picker (accepts `.csv`, `.xlsx`, `.xls`) → parse preview table →
  per-row validation badges → "Import" button (disabled until valid rows exist).
  Bad rows listed with row number + reason. Format is detected automatically;
  both parse to the same preview table.
- On success: toast + link to dashboard.

### /networth (guided builder)
- Wizard: one plain-language question per step ("Any savings or bank balance?
  Roughly how much?", "Mutual funds or stocks?", "Gold?", "Property?", "Any loans
  or EMIs?", "Credit-card dues?").
- Each step: quick-estimate input + "skip" + progress indicator. Rough numbers OK.
- Final step: review the built list → "Save" → net-worth snapshot → dashboard.

### /dashboard
- **Net-worth card:** current net worth (assets − liabilities).
- **Trend chart:** line of `net_worth_snapshots` over time (needs ≥2 points; show
  a "come back after another import" hint with 1 point).
- **Score gauges:** risk score and diversification score (0–100), with band label.
- **Anomaly flags list:** severity-colored chips with plain-language messages.
- **Explanation panel:** the LLM plain-language read, with a small "basis / how
  this is computed" affordance next to it (links to the deterministic rules).

### /scam-check
- Textarea ("Paste a financial claim, tip, or message"), submit.
- Result: **verdict badge** (credible / unverifiable / misleading / scam, color
  coded), explanation paragraph, and a **Sources** list of clickable links.
- Zero-source case renders "Unverifiable" with a note that no supporting source
  was found — never a confident verdict.

### /simulator
- Controls: sliders/inputs for `monthlyInvestment` and `annualReturnPct`, and a
  `years` input.
- Output: projected net-worth **curve** (yearlyPoints), the projected end value,
  and the LLM explanation.
- Persistent label under the chart: **"Illustrative projection — not a guarantee
  or personalized advice."**

### /holdings
- Table of current assets/liabilities with edit/delete.
- **"Export to Excel"** button: downloads the current list as `.xlsx`, columns
  matching the import contract, generated client-side (no server round-trip).

## Shared components
`DisclaimerBanner`, `ScoreGauge`, `NetWorthTrend`, `AnomalyChip`, `VerdictBadge`,
`SourceList`, `AssetRowForm`, `LiabilityRowForm`, `WizardStep`, `Toast`,
`ExportButton`.

## Copy blocks (use verbatim)
- **Disclaimer banner:** "financial-doctor is a financial-literacy tool, not a
  registered investment adviser. It does not provide personalized investment
  advice."
- **Simulator label:** "Illustrative projection — not a guarantee or personalized
  advice."
- **Scam zero-source note:** "We couldn't find a supporting source, so this claim
  is marked unverifiable rather than judged."

## States to handle everywhere
loading · empty (new user) · error (API/LLM failure → friendly retry) · success.
Never show a raw stack trace or an uncited AI sentence.
