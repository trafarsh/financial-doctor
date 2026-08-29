# Financial Doctor (finX) — AI Investor & Literacy Copilot

**Financial Doctor** is an AI-powered financial intelligence and decision-support platform engineered for retail investors. It calculates deterministic portfolio analytics, models risk and diversification, provides a grounded RAG research copilot, verifies suspicious investment tips against regulatory records, and simulates what-if compound growth scenarios.

---

## 🌟 Key Capabilities

1. **Portfolio & Net Worth Engine:**
   - Manual entry, CSV, and Excel (`.xlsx`/`.xls`) file dropzone with row-by-row Zod validation.
   - 6-step guided wizard for zero-asset starters (Savings, Equities, Gold, Property, Loans, Credit Cards).
   - Client-side SheetJS "Export to Excel" (.xlsx) with matching column headers.
   - Append-only time-series net worth snapshots for historical trend charting.

2. **Deterministic Risk & Diversification Engine:**
   - 100% pure TypeScript financial mathematics in `/lib/finance.ts`.
   - **Financial Risk Indicator (0–100):** Weighted combination of concentration (HHI), debt burden, and liquidity buffers.
   - **Diversification Index (0–100):** Herfindahl-Hirschman spread across 6 canonical asset categories.
   - Automated anomaly detection for extreme concentration, high debt ratios, and low liquidity.

3. **Grounded RAG Scam & Misinformation Detector (`/scam-detector`):**
   - Evaluates financial claims against official SEBI, RBI, and AMFI regulatory frameworks.
   - **Hard Code Guard:** If zero regulatory sources are found, the system strictly marks the claim as `Unverifiable` in code.
   - Emits verified, clickable regulatory citations with zero hallucinated URLs.

4. **AI Research Copilot (`/copilot`):**
   - Context-aware research assistant combining your portfolio holdings, risk scores, live Indian market indices, and regulatory knowledge.
   - Follows strict statutory non-advisory prompts (never gives personalized buy/sell directives).

5. **What-If Scenario Simulator (`/simulator`):**
   - Interactive monthly SIP, expected annual return, and horizon sliders.
   - Recharts wealth accumulation curves and stress-test impact scenarios (-20% market correction, 30% tech shock).

6. **Live Market Intelligence & News Sentiment (`/markets/overview`):**
   - Normalized Indian indices (NIFTY 50, SENSEX, BANK NIFTY, Gold MCX, 10Y Bond Yield).
   - Equities, company fundamentals (P/E, Market Cap, EPS, Dividend Yield), and sentiment-tagged news feeds.

7. **AI Compliance Audit Trail (`/audit`):**
   - Immutable audit ledger recording every prompt, response, model ID, source array, and timestamp.

---

## 🏗️ Architecture & Technology Stack

```
Frontend:       Next.js 14+ (App Router), TypeScript, Tailwind CSS, Recharts, Lucide Icons
Backend:        Next.js Route Handlers, Service Layer Pattern
Database:       Supabase PostgreSQL, pgvector embeddings, Row Level Security (RLS)
AI Gateway:     OpenRouter API (JSON Mode, temperature 0.2, automatic retries)
Parsers:        Papa Parse (CSV), SheetJS xlsx (Excel Import & Export)
Validation:     Zod Runtime Schemas
Design Theme:   Dark Financial Interface (Binance & Bloomberg Inspired)
```

---

## 🚀 Quickstart & Local Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

OPENROUTER_API_KEY=your-openrouter-api-key
OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct:free

# Free tier at https://gnews.io/ (100 requests/day)
GNEWS_API_KEY=your-gnews-api-key
```
*(Note: If no API keys are provided, Financial Doctor automatically operates with high-fidelity local demo datasets and deterministic safe fallbacks. Market quotes fall back to a live Yahoo Finance feed even without a key; news requires a free GNews.io key for live headlines).*

### 3. Database Migration
Run the SQL migration in `supabase/migrations/0001_init.sql` inside your Supabase SQL Editor.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Verification Benchmarks

### Pure TypeScript Worked Example (from `docs/11_TEST_PLAN.md`):
- **Holdings:** Bank: ₹2,00,000 | Stock: ₹6,00,000 | Gold: ₹2,00,000 | Loan: ₹5,00,000
- **Total Assets:** ₹10,00,000
- **Total Liabilities:** ₹5,00,000
- **Net Worth:** ₹5,00,000
- **Diversification Score:** 67 / 100
- **Financial Risk Score:** 54 / 100 (Moderate Risk)
- **Active Flags:** Stock Concentration (Medium: 60%), High Debt Ratio (High: 0.50)

---

## ⚖️ Statutory & Compliance Posture
Financial Doctor is an educational and literacy platform. It is not registered as an investment adviser with SEBI or any regulatory body. It does not provide personalized investment advice or execute transactions. All AI outputs are framed as educational analysis and questions to ask a certified financial planner.
