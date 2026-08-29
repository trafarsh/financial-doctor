# financial-doctor — RAG Model & Tech Stack

The scam-check (and any "explain a market claim") feature is Retrieval-Augmented
Generation: **retrieve grounding sources first, then let the LLM classify/explain
using only those sources.** This doc pins down the pipeline the original plan left
vague, and lists the full stack.

═══════════════════════════════════════════════════════════════════
PART A — RAG PIPELINE
═══════════════════════════════════════════════════════════════════

## A0. Design rule (the whole point)
The model may only assert credibility or fraud from retrieved evidence. If
retrieval returns nothing usable, the verdict is forced to `"unverifiable"` **in
code** — the LLM is never trusted to police that itself. Sources shown in the UI
are exactly the ones retrieved; fabricated URLs are rejected server-side.

## A1. Pipeline stages
```
claimText
   │
   ▼
[1] Normalize      lowercase, trim, strip URLs/emojis, cap length (2000 chars)
   │
   ▼
[2] Retrieve       retrieveContext(claim) → Source[]   ← the swappable seam
   │                 (Tier 1 local KB  ± Tier 2 web search)
   ▼
[3] Guard          if sources.length === 0  → return {verdict:"unverifiable"} NOW
   │                 (skip the LLM entirely)
   ▼
[4] Generate       LLM classifies verdict + explanation, citing ONLY those sources
   │                 strict JSON, zod-validated, 1 retry on bad JSON
   ▼
[5] Post-validate   drop any source URL not in the retrieved set;
   │                 if that empties sources → force "unverifiable"
   ▼
[6] Audit + return  write ai_audit_log, return ScamCheckResult
```

## A2. Retrieval tiers (build Tier 1; Tier 2 is the flex upgrade)

**Tier 1 — Local knowledge base (default, always works, no external dep)**
A seeded `reference_snippets` table of regulator/education content (SEBI, RBI
guidance, common-fraud patterns). Retrieval = keyword/similarity match of the
claim against snippet `topic` + `snippet` text.
- *Simplest:* Postgres full-text search (`to_tsvector`/`plainto_tsquery`) or
  `ILIKE` keyword overlap. Zero extra infra. **Recommended for the 48h build.**
- *Upgrade:* pgvector embeddings for semantic match (see A3) if time allows.

**Tier 2 — Live web search (optional, behind the same function)**
If a web-search API/tool is available, call it, take the top N results
(title/url/snippet), and merge with Tier 1. Same `Source[]` shape out, so nothing
downstream changes. If it errors or is rate-limited, fall back to Tier 1 silently.

`retrieveContext(claim)` is ONE function with this contract — swapping tiers never
touches the route:
```ts
async function retrieveContext(claim: string): Promise<Source[]>
```

## A3. Optional semantic retrieval (pgvector) — only if ahead of schedule
- Enable `vector` extension in Supabase.
- Add `embedding vector(N)` to `reference_snippets`; embed each snippet once at
  seed time.
- At query time: embed the claim, `ORDER BY embedding <=> queryEmbedding LIMIT k`,
  keep matches above a similarity threshold.
- Embeddings via an OpenRouter/other embeddings endpoint. **If this adds risk,
  skip it — keyword FTS is a perfectly good demo.**

## A4. What gets retrieved (seed the KB with these categories)
guaranteed/assured returns · "double your money" schemes · unregistered advisers ·
pump-and-dump / hot tips · Ponzi/chain patterns · fake SEBI/RBI registration
claims · crypto "risk-free" claims. (Seed rows in `05_RUNBOOK.md` §2 — expand to
~15–20 snippets for a convincing demo.)

## A5. Grounding & anti-hallucination rules
- LLM prompt says: use ONLY provided sources; if unsupported → "unverifiable"
  (see `07_LLM_PROMPTS.md` §2).
- Code enforces the empty-source guard **before and after** generation.
- Every returned source must be a member of the retrieved set (URL equality check).
- Low temperature (≈0.2). One JSON-repair retry, then safe default.

## A6. Audit (RAG-specific)
Each scam-check writes: claimText, retrieved sources, model, full prompt,
raw response, final verdict, userId, timestamp → `ai_audit_log`. This is the
"show your work" artifact for judges and the compliance story.

## A7. Failure modes → behavior
| Failure | Behavior |
|---|---|
| No sources retrieved | verdict "unverifiable", LLM skipped |
| Web search down (Tier 2) | silent fallback to Tier 1 |
| LLM returns bad JSON | retry once → safe default "unverifiable" |
| LLM cites a URL not retrieved | strip it; re-guard for empty |
| OpenRouter 429/timeout | friendly error to UI; nothing hangs |

═══════════════════════════════════════════════════════════════════
PART B — TECH STACK
═══════════════════════════════════════════════════════════════════

## B1. Application
| Concern | Choice | Notes |
|---|---|---|
| Framework | **Next.js 14+ (App Router)** | UI + API routes in one repo |
| Language | **TypeScript** | strict mode |
| Styling | **Tailwind CSS** | fast, consistent |
| Charts | **recharts** | trend line, projection curve, gauges |
| CSV parse | **Papa Parse** | client-side parse + preview |
| Excel parse/write | **SheetJS (`xlsx`)** | `.xlsx`/`.xls` import (first sheet → same row shape as CSV) and client-side `.xlsx` export on `/holdings` |
| Validation | **zod** | every API body + every LLM JSON output |

## B2. Backend / data
| Concern | Choice | Notes |
|---|---|---|
| Database | **Supabase Postgres** | tables per `02_DATA_MODEL.md` |
| Auth | **Supabase Auth** | email/password |
| Access control | **Row Level Security** | `user_id = auth.uid()` on every user table |
| Server access | **@supabase/supabase-js** | anon client (browser) + service-role (server) |
| Full-text search | **Postgres FTS / ILIKE** | Tier-1 retrieval, no extra infra |
| (Optional) vectors | **pgvector** | Tier-3 semantic retrieval if time allows |

## B3. AI / RAG
| Concern | Choice | Notes |
|---|---|---|
| LLM gateway | **OpenRouter** | `/api/v1/chat/completions` |
| Model | **free-tier via `OPENROUTER_MODEL`** | swappable; paid fallback noted |
| Output mode | **JSON** (`response_format` or strict prompt) | zod-validated |
| Retrieval (Tier 1) | **local KB (`reference_snippets`)** | always available |
| Retrieval (Tier 2) | **web search API** *(optional)* | behind `retrieveContext()` |
| Embeddings (opt) | **OpenRouter/other embeddings** | only for pgvector path |
| Audit | **`ai_audit_log` table** | every call logged |

## B4. Dev / ops
| Concern | Choice |
|---|---|
| Package manager | npm |
| Lint/format | ESLint + Prettier |
| Secrets | `.env.local` (git-ignored), `.env.example` committed |
| Hosting (optional) | Vercel (app) + Supabase (managed DB) |
| Version control | Git, phase-per-commit |

## B5. The RAG seam in code (so the stack choice stays swappable)
```
/lib/rag/retrieve.ts   → retrieveContext(claim): Promise<Source[]>
                          ├─ tier1_localKB(claim)      (Postgres FTS)
                          └─ tier2_webSearch(claim)?   (optional)
/lib/openrouter.ts     → callLLM(system, user): validated JSON  (audited)
/app/api/ai/scam-check → orchestrates: retrieve → guard → generate → post-validate → audit
```
Everything the RAG feature depends on sits behind two functions
(`retrieveContext`, `callLLM`), so you can change model, add web search, or add
vectors without touching the route or the UI.
