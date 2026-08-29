# API Contracts

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
