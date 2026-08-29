# financial-doctor — Compliance & Safety Checklist

Use as the finish gate. Every box must be checked before the build is "done."
This protects the regulatory posture (financial-literacy tool, not an adviser).

## A. No personalized advice
- [ ] Grep every LLM system prompt — each contains the shared compliance clause.
- [ ] No prompt asks for or permits a buy/sell/hold/allocation directive.
- [ ] Spot-check risk explanation, scam explanation, and simulation explanation
      outputs — none tells the user what to invest in or how much.
- [ ] UI copy nowhere says "you should invest / buy / sell".

## B. Citations & grounding
- [ ] Every AI-generated market/company/credibility claim in the UI shows a
      visible source or basis.
- [ ] Scam-check with zero retrieved sources renders "unverifiable" (verified by
      forcing an empty-source case).
- [ ] The model cannot emit a source URL that wasn't in the retrieved set (server
      repairs/rejects fabricated URLs).

## C. Numbers integrity
- [ ] Net-worth, risk, diversification, and projection numbers are computed in
      `/lib/finance.ts`, not by the LLM.
- [ ] A hand-worked example matches the app's scores (see `11_TEST_PLAN.md`).

## D. Audit trail
- [ ] Every LLM call writes an `ai_audit_log` row (prompt, response, model,
      sources, userId, timestamp) before returning.
- [ ] Audit rows are readable by their owner only.

## E. Data isolation & secrets
- [ ] RLS enabled on assets, liabilities, net_worth_snapshots, risk_analyses,
      ai_audit_log.
- [ ] No API route trusts a `userId` from the body/query — all derive it from the
      session.
- [ ] Service-role key is never imported into a client component or shipped to the
      browser bundle.
- [ ] `.env.local` is git-ignored; no secrets committed.

## F. User-facing disclaimer
- [ ] A persistent disclaimer is visible in the app layout at all times:
      "financial-doctor is a financial-literacy tool, not a registered investment
      adviser. It does not provide personalized investment advice."
- [ ] The simulator output is additionally labeled "illustrative projection — not
      a guarantee or advice."

## G. Data minimization
- [ ] No bank credentials, card numbers, or government IDs are collected or stored.
- [ ] CSV import stores only asset/liability descriptors and values.

## H. Final smoke test
- [ ] New-user run passes end to end: signup → guided builder (zero-asset) →
      dashboard → scam-check → simulator, with all of A–G holding throughout.
