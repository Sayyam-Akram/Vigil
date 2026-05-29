# VendorSentinel — Backend Integration Contract
# FastAPI backend must implement these endpoints exactly.
# Frontend is built against this contract and will work when backend matches it.

## Stack
- Python 3.11+
- FastAPI
- Uvicorn
- Bright Data (SERP API, Web Unlocker, Web Scraper API)
- Groq API (Llama 3.1 70B) or Gemini Flash (fallback)
- ReportLab (PDF generation)
- Supabase or SQLite (signal storage)

## Environment Variables (backend)
```bash
BRIGHT_DATA_API_KEY=
BRIGHT_DATA_SERP_ZONE=
BRIGHT_DATA_UNLOCKER_ZONE=
GROQ_API_KEY=
SUPABASE_URL=              # optional, SQLite fallback available
SUPABASE_ANON_KEY=         # optional
APP_ENV=development
CORS_ORIGINS=http://localhost:3000,https://your-vercel-app.vercel.app
```

## CORS
Allow origins from `CORS_ORIGINS` env var.
- Allow methods: `GET, POST, OPTIONS`
- Allow headers: `Content-Type, Authorization`

## Endpoint 1: POST /analyze

Request:
```json
{
  "vendor": "Snowflake"
}
```

Response (200):
```json
{
  "vendor": "Snowflake",
  "risk_score": 8.1,
  "risk_tier": "CRITICAL",           // CRITICAL | HIGH | MODERATE | LOW
  "timestamp": "2026-05-25T14:23:07Z",
  "summary": "Continuous public web monitoring detected early warning signals starting 49 days prior to the public breach announcement on June 2, 2024...",
  "signal_count": 11,
  "signals": [
    {
      "id": "sig_001",
      "type": "credential_leak",     // credential_leak | personnel | news | job_signal | regulatory | github
      "severity": "critical",        // critical | high | medium | low
      "title": "Plaintext corporate credentials on public paste site",
      "source": "Paste site monitoring via Bright Data Web Unlocker",
      "source_url": "https://pastebin.com/archive/leak-sf-77a83d",
      "detail": "14 matching @snowflake.com employee email addresses found in public credential dump...",
      "detected_at": "2024-04-14T03:17:00Z",
      "detected_relative": "49 days before disclosure",
      "confidence": 96,              // 0-100
      "raw_signal": "[DUMP SECTIONS: email_list, plain_pw] ... jsmith@snowflake.com:Winter2023! ..."  // original scraped text
    }
  ],
  "recommended_action": "Immediately restrict active write permissions for federated Snowflake databases...",
  "compliance_refs": ["DORA Art.28", "SOC 2 CC9.2", "ISO 27001 A.15"],
  "pipeline_stats": {
    "raw_signals_processed": 847,
    "survived_filter": 23,
    "filter_rate_pct": 2.7,
    "processing_time_ms": 4200
  },
  "report_hash": "sha256:c4d18a7e2f63..."
}
```

## Endpoint 2: GET /report?vendor=Snowflake

Response: PDF file (`application/pdf`)
`Content-Disposition: attachment; filename="Snowflake_risk_report.pdf"`

PDF structure (5 pages):
- **Page 1:** Cover — vendor name, risk tier, score, date, hash
- **Page 2:** Executive summary + recommended actions  
- **Page 3:** Signal evidence (all signals with sources, timestamps, confidence)
- **Page 4:** Compliance mapping (DORA, SOC 2, ISO 27001, NIST)
- **Page 5:** Historical context + methodology note

## Endpoint 3: GET /signals/live

Response (200):
```json
{
  "signals": [
    {
      "id": "sig_live_001",
      "vendor": "Snowflake",
      "type": "credential_leak",
      "severity": "critical",
      "title": "Plaintext corporate credentials on public paste site",
      "source": "Paste site monitoring",
      "detected_relative": "2 minutes ago",
      "action": "ALERT_SENT"          // ALERT_SENT | MONITORING | FLAGGED | LOGGED
    }
  ],
  "updated_at": "2026-05-25T14:23:07Z",
  "stats": {
    "raw_last_hour": 847,
    "survived_filter": 23,
    "alerts_sent": 8
  }
}
```

## Endpoint 4: GET /health

Response (200):
```json
{
  "status": "ok",
  "version": "0.1.0",
  "uptime_seconds": 3600,
  "bright_data_connected": true,
  "groq_connected": true,
  "sources_active": ["serp", "paste", "jobs", "github"]
}
```

## Pipeline Implementation Notes

### Layer 1 — Keyword Filter (zero LLM cost):
- Vendor name must appear in text
- At least one `RISK_KEYWORD` must appear
- `RISK_KEYWORDS = ["breach", "leak", "hack", "vulnerability", "exposed", "investigation", "unauthorized", "ransomware", "incident", "resign", "layoff", "violation", "penalty", "fine", "departure", "attack", "exploit"]`
- Discard if fails either check

### Layer 2 — Rule-Based Scorer (zero LLM cost):
```python
SIGNAL_WEIGHTS = {
  "credential_leak": 9,
  "regulatory_violation": 8,
  "executive_departure": 6,
  "security_job_spike": 5,
  "news_mention": 4,
  "github_exposure": 8
}
```
Classify by source + keyword pattern. Assign type + base weight.

### Layer 3 — LLM (only signals surviving layers 1+2):
- **Model:** Llama 3.1 70B via Groq
- **Prompt:** Classify signal relevance, assess severity, generate 2-sentence summary.
- **Output:** JSON `{ severity, confidence, summary, signal_type }`
- Keep context window small — pass only the filtered signal text, not raw scrape.
