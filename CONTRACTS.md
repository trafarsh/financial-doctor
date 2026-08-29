# API Contracts

> **Superseded by `docs/04_API_CONTRACTS.md`.** That doc is now the source of
> truth: `userId` is always derived from the server-side session
> (`requireUserId()` in `lib/supabase/server.ts`), never accepted in a request
> body — the shapes below still show `userId` in some request bodies from an
> earlier draft; ignore that field wherever it appears in a request. Full data
> shapes are in `docs/02_DATA_MODEL.md`.

## POST /api/portfolio/import
**Responsible**: Harish
**Request**:
```json
{
  "userId": "string",
  "assets": "Asset[]",
  "liabilities": "Liability[]"
}
```
**Response**:
```json
{
  "snapshot": "NetWorthSnapshot"
}
```

## GET /api/risk/analyze
**Responsible**: Harish
**Query Parameters**: `userId=string`
**Response**:
```json
{
  "analysis": "RiskAnalysis"
}
```

## POST /api/ai/scam-check
**Responsible**: Arshad
**Request**:
```json
{
  "claimText": "string"
}
```
**Response**:
```json
{
  "result": "ScamCheckResult"
}
```

## POST /api/ai/simulate
**Responsible**: Arshad
**Request**:
```json
{
  "userId": "string",
  "assumptions": "Record<string, number>",
  "years": "number"
}
```
**Response**:
```json
{
  "scenario": "SimulationScenario"
}
```
