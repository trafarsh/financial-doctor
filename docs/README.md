# financial-doctor — Documentation Index

AI Investor / financial-doctor: an AI-powered financial-literacy and
decision-support copilot for retail investors. This folder is the complete
planning set for a **solo prototype build in Claude Code**. Read in order; the
numbered docs are meant to be handed to the coding agent as the source of truth.

## What financial-doctor is (and is not)
A tool that helps a retail investor understand their own financial picture — net
worth, risk, diversification, anomalies — run illustrative what-if projections,
and sanity-check suspicious financial claims, with every AI statement source-cited
and audit-logged. It is **not** a registered investment adviser, **not** an
autonomous trading system, and **never** gives personalized buy/sell directives.

## Document map

| # | Doc | Purpose | Hand to agent? |
|---|---|---|---|
| — | `README.md` (this) | Index + how the docs fit together | Context |
| 00 | `00_MASTER_PROMPT.md` | The prompt you paste into Claude Code | **Yes — the driver** |
| 01 | `01_ARCHITECTURE.md` | System diagram, layering rules, flows | Yes |
| 02 | `02_DATA_MODEL.md` | Types, DB schema, SQL migration, CSV contract | **Yes — source of truth** |
| 03 | `03_RISK_RULES.md` | Deterministic scoring + thresholds | **Yes — source of truth** |
| 04 | `04_API_CONTRACTS.md` | Every route's request/response | **Yes — source of truth** |
| 05 | `05_RUNBOOK.md` | Setup, phase checklist, seed data, demo script | Context |
| 06 | `06_PRD.md` | Scope, user stories, acceptance, out-of-scope | Context |
| 07 | `07_LLM_PROMPTS.md` | The actual system prompts (compliance lives here) | **Yes — source of truth** |
| 08 | `08_COMPLIANCE_CHECKLIST.md` | The guardrails to verify before "done" | Context / gate |
| 09 | `09_UI_SPEC.md` | Screens, components, states, copy | Yes |
| 10 | `10_ENV_CONFIG.md` | Env vars, accounts, model config | Context |
| 11 | `11_TEST_PLAN.md` | Manual + automated checks per phase | Context / gate |

## How to run the build
1. Set up accounts and env (`10_ENV_CONFIG.md`, `05_RUNBOOK.md` §0).
2. Open Claude Code in an empty repo. Paste `00_MASTER_PROMPT.md`.
3. Also paste, or point the agent at, the four "source of truth" docs
   (02, 03, 04, 07) and tell it they override any assumptions.
4. Let it stop after Phase 0 → fill `.env.local` → continue phase by phase.
5. Gate each phase with `11_TEST_PLAN.md`; gate the finish with
   `08_COMPLIANCE_CHECKLIST.md`.

## The four rules that override everything
1. No personalized buy/sell/invest directives — ever.
2. No uncited AI claim reaches the UI.
3. All money math in TypeScript; the LLM only explains numbers.
4. Every user table has RLS; `userId` always comes from the session.
