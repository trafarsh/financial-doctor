# Financial Doctor (finX) — API Contracts

All routes are Next.js 14+ App Router Server Handlers.
User sessions are authenticated via Supabase session cookies; `userId` is always extracted from server session (`auth.uid()`).
All responses return `application/json`.

---

## 1. Portfolio & Holdings Endpoints

### `GET /api/portfolio`
- **Description:** Retrieves the authenticated user's current assets, liabilities, and calculated net worth.
- **Request:** None
- **Response (200):**
```json
{
  "assets": [
    { "id": "ast_1", "userId": "usr_1", "type": "stock", "name": "Reliance Industries", "value": 600000, "quantity": 200, "lastUpdated": "2026-08-29T10:00:00Z" }
  ],
  "liabilities": [
    { "id": "lia_1", "userId": "usr_1", "type": "loan", "name": "Car Loan", "amount": 500000, "interestRate": 8.75 }
  ],
  "netWorthSummary": {
    "totalAssets": 1000000,
    "totalLiabilities": 500000,
    "netWorth": 500000
  }
}
```

---

### `POST /api/portfolio/import`
- **Description:** Replaces current user holdings with a new set and appends an immutable `net_worth_snapshots` row.
- **Request Body (Zod validated):**
```json
{
  "assets": [
    { "type": "stock", "name": "Reliance Industries Ltd", "value": 600000, "quantity": 200, "sector": "Energy" }
  ],
  "liabilities": [
    { "type": "loan", "name": "Car Loan", "amount": 500000, "interestRate": 8.75 }
  ]
}
```
- **Response (200):**
```json
{
  "snapshot": {
    "id": "snp_123",
    "userId": "usr_1",
    "totalAssets": 1000000,
    "totalLiabilities": 500000,
    "netWorth": 500000,
    "computedAt": "2026-08-29T10:30:00Z"
  }
}
```

---

### `GET /api/portfolio/networth-history`
- **Description:** Returns the chronological list of net-worth snapshots for trend charts.
- **Response (200):**
```json
{
  "snapshots": [
    { "id": "snp_1", "userId": "usr_1", "totalAssets": 950000, "totalLiabilities": 550000, "netWorth": 400000, "computedAt": "2026-07-29T00:00:00Z" },
    { "id": "snp_2", "userId": "usr_1", "totalAssets": 1000000, "totalLiabilities": 500000, "netWorth": 500000, "computedAt": "2026-08-29T00:00:00Z" }
  ]
}
```

---

## 2. Analytics & Risk Endpoints

### `GET /api/risk/analyze`
- **Description:** Deterministically computes the Financial Risk Indicator (0-100), HHI Diversification (0-100), and anomaly flags, with an audited LLM plain-language educational commentary.
- **Response (200):**
```json
{
  "analysis": {
    "id": "risk_123",
    "userId": "usr_1",
    "riskScore": 54,
    "diversificationScore": 67,
    "band": "Moderate Risk",
    "volatilityScore": 48,
    "concentrationScore": 44,
    "debtScore": 50,
    "liquidityScore": 80,
    "flags": [
      { "type": "concentration", "severity": "medium", "message": "Over half your assets are in stock." }
    ],
    "explanation": "Your Financial Risk Indicator is scored at 54/100 (Moderate Risk)...",
    "computedAt": "2026-08-29T10:35:00Z"
  }
}
```

---

## 3. AI & RAG Endpoints

### `POST /api/ai/scam-check`
- **Description:** Evaluates a financial claim against regulatory sources. If 0 sources are retrieved, strictly forces `unverifiable`.
- **Request:**
```json
{
  "claimText": "Guaranteed 30% monthly return from automated trading bot with zero risk."
}
```
- **Response (200):**
```json
{
  "result": {
    "claimText": "Guaranteed 30% monthly return...",
    "verdict": "likely_scam",
    "riskScore": 95,
    "riskLevel": "CRITICAL",
    "detectedSignals": ["Promising Guaranteed/Assured Market Returns", "Claiming Zero-Risk on Investment"],
    "explanation": "Under SEBI regulations, promising guaranteed fixed returns on market investments is illegal...",
    "sources": [
      {
        "title": "SEBI Prohibition on Assured Returns",
        "url": "https://www.sebi.gov.in/legal/regulations/sebi-investment-advisers-regulations-2013.html",
        "snippet": "Registered advisers cannot guarantee fixed returns on market-linked products."
      }
    ]
  }
}
```

---

### `POST /api/ai/simulate` (Alias: `POST /api/simulator`)
- **Description:** Runs pure TypeScript compound interest simulation and macro stress tests with AI commentary.
- **Request:**
```json
{
  "assumptions": {
    "monthlyInvestment": 15000,
    "annualReturnPct": 12,
    "years": 15,
    "marketShockPct": -20
  }
}
```
- **Response (200):**
```json
{
  "scenario": {
    "userId": "demo-user",
    "baselineNetWorth": 500000,
    "assumptions": { "monthlyInvestment": 15000, "annualReturnPct": 12, "years": 15 },
    "projectedNetWorth": 10245000,
    "projectionYears": 15,
    "yearlyPoints": [
      { "year": 1, "value": 750000, "contributions": 680000, "interestEarned": 70000 }
    ],
    "explanation": "Illustrative compound projection. Not an investment guarantee."
  }
}
```

---

### `POST /api/ai/copilot`
- **Description:** Context-aware research assistant combining portfolio metrics, market quotes, and RAG citations.
- **Request:**
```json
{
  "message": "Why is my portfolio considered moderate risk?"
}
```
- **Response (200):**
```json
{
  "message": {
    "id": "msg_123",
    "role": "assistant",
    "content": "Your portfolio holds ₹5,00,000 in net worth with a Risk Indicator of 54/100...",
    "citations": [
      { "title": "SEBI Investor Education Guidelines", "url": "https://www.sebi.gov.in/investor-awareness.html" }
    ],
    "timestamp": "2026-08-29T10:40:00Z"
  }
}
```

---

## 4. Market & Reports Endpoints
- `GET /api/market/overview`: Returns NIFTY 50, SENSEX, Bank Nifty, Gold, Bonds, stock quotes, fundamentals, and economic calendar.
- `GET /api/news`: Returns normalized news articles with positive/neutral/negative sentiment tags.
- `GET /api/alerts`: Returns user-facing alerts and notification items.
- `GET /api/reports`: Returns full 12-section portfolio intelligence report.
- `GET /api/audit`: Returns immutable audit logs with prompts, responses, model IDs, and hashes.
