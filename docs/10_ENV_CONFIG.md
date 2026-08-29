# financial-doctor — Environment & Config

## Accounts to create (one-time)
1. **Supabase** — new project. From Settings → API copy: Project URL, `anon`
   public key, `service_role` secret key.
2. **OpenRouter** — account + API key. Pick a current free model from
   openrouter.ai/models (filter for free); the free list changes, so store the ID
   in an env var. Note a cheap paid model ID as a demo-day fallback.

## `.env.local` (never commit; git-ignored)
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>   # SERVER ONLY — never client

# OpenRouter
OPENROUTER_API_KEY=<key>
OPENROUTER_MODEL=<free model id>               # e.g. a free Llama/Gemini-Flash variant
# OPENROUTER_MODEL_FALLBACK=<cheap paid id>    # optional standby
```

`.env.example` mirrors these keys with empty values and IS committed.

## Which key goes where
| Key | Used in | Exposed to browser? |
|---|---|---|
| NEXT_PUBLIC_SUPABASE_URL | client + server | Yes (safe) |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | client + server | Yes (safe, RLS-guarded) |
| SUPABASE_SERVICE_ROLE_KEY | server (API routes) only | **NO — never** |
| OPENROUTER_API_KEY | server only | **NO** |
| OPENROUTER_MODEL | server | fine either way |

Only `NEXT_PUBLIC_*` vars reach the browser in Next.js. Keep everything else out
of client components.

## OpenRouter request essentials
- Endpoint: `https://openrouter.ai/api/v1/chat/completions`
- Headers: `Authorization: Bearer $OPENROUTER_API_KEY`, `Content-Type: application/json`.
  (Optionally `HTTP-Referer` / `X-Title` for OpenRouter analytics.)
- Body: `{ model: process.env.OPENROUTER_MODEL, messages, temperature: 0.2,
  response_format: { type: "json_object" } }` (fall back to strict-prompt JSON if
  the chosen model ignores response_format).

## Local run
```
npm install
# put .env.local in place
# run 0001_init.sql in the Supabase SQL editor, then seed reference_snippets
npm run dev   # http://localhost:3000
```

## Deploy (optional, for a hosted demo)
- Vercel: import the repo, add all env vars in Project Settings (mark server-only
  ones as such), deploy. Supabase already hosted. Verify env vars are present in
  the deployment, not just locally.
