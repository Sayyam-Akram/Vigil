# VendorSentinel — Project Guide

> **AI-Powered Third-Party Vendor Risk Intelligence Platform**
> *"Know before it becomes news."*
> Built for the Bright Data "Web Data UNLOCKED" Hackathon · May 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Directory Structure](#2-directory-structure)
3. [Architecture & Data Flow](#3-architecture--data-flow)
4. [Frontend Deep Dive](#4-frontend-deep-dive)
5. [Backend Deep Dive](#5-backend-deep-dive)
6. [Pipeline Execution Flow](#6-pipeline-execution-flow)
7. [API Contract](#7-api-contract)
8. [Configuration Reference](#8-configuration-reference)
9. [Running the Project](#9-running-the-project)
10. [Known Issues & Risks](#10-known-issues--risks)

---

## 1. Project Overview

VendorSentinel continuously monitors the public web for early warning signals of security breaches at third-party vendors. It uses a **layered AI pipeline** (keyword → rule scorer → LLM) to filter noise and generate evidence-backed risk alerts with cryptographic PDF reports.

### Core Philosophy

> "The vendor questionnaire is dead. Static certifications fail to detect live breaches. This is what replaces it."

The system validates its approach by retrospectively analyzing historical breaches (Snowflake, Okta) — demonstrating that warning signals were detectable **49 days before** public disclosure in Snowflake's case.

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, Tailwind CSS v3, Axios, Lucide React |
| Backend | Python FastAPI, SQLite, ReportLab, Cryptography |
| AI/LLM | Groq (Llama 3.3 70B), Google Gemini Flash (fallback) |
| Scraping | Bright Data SERP API, GitHub Code Search API, HaveIBeenPwned API |
| Storage | SQLite (WAL mode), Ed25519-signed PDF reports |

---

## 2. Directory Structure

```
Vendor Sentinel/
│
├── index.html                          # Vite entry HTML (OG tags, fonts)
├── package.json                        # Frontend deps: React 19, Vite 8, Tailwind 3
├── vite.config.js                      # Vite config (React plugin)
├── tailwind.config.js                  # Tailwind: custom colors/fonts/animations
├── postcss.config.js                   # PostCSS: Tailwind + Autoprefixer
├── eslint.config.js                    # ESLint flat config
├── .env.example                        # Env template (VITE_API_URL, etc.)
├── .env.local                          # Local overrides (mock mode ON)
├── .gitignore
│
├── VENDORSENTINEL_FRONTEND_PROMPT.md   # 913-line design spec (AI prompt doc)
│
├── public/
│   ├── favicon.svg
│   └── icons.svg
│
├── src/                                # ── FRONTEND ──
│   ├── main.jsx                        # Entry: React 19 createRoot
│   ├── index.css                       # Global styles, CSS vars, animations
│   ├── App.jsx                         # Root component, ErrorBoundary, state
│   │
│   ├── config/
│   │   └── api.js                      # API URLs, mock toggle
│   │
│   ├── data/
│   │   └── mockData.js                 # All mock data (550 lines)
│   │
│   ├── assets/
│   │   ├── hero.png
│   │   ├── react.svg                   # (unused)
│   │   └── vite.svg                    # (unused)
│   │
│   └── components/
│       ├── NavBar.jsx                  # Fixed navbar, nav dots, scan trigger
│       ├── Hero.jsx                    # Radar animation, search form, marquee
│       ├── LiveSignalFeed.jsx          # Terminal table, 5s cycle, scan overlay
│       ├── PipelineVisualizer.jsx      # 6-node pipeline, SVG connectors
│       ├── BreachValidation.jsx        # Timeline, signal inspector, risk counter
│       ├── SignalSourceCatalog.jsx     # 4 source cards (2x2 grid)
│       ├── ComplianceWall.jsx          # 10 compliance items grid
│       ├── EvidenceArtifact.jsx        # PDF preview, download, crypto info
│       ├── PhaseTwo.jsx                # Roadmap (v0.1.0 vs Phase 2)
│       └── Footer.jsx                  # Attribution
│
├── backend/                            # ── BACKEND ──
│   ├── .env                            # API keys, CORS origins
│   ├── .env.example
│   ├── requirements.txt                # Python deps (unpinned)
│   │
│   ├── keys/
│   │   └── signing_key.pem             # Ed25519 private key (auto-generated)
│   │
│   └── app/
│       ├── __init__.py
│       ├── config.py                   # Pydantic Settings (env vars)
│       ├── database.py                 # SQLite init, CRUD, seed data
│       ├── main.py                     # FastAPI app, 4 endpoints (423 lines)
│       ├── schemas.py                  # Pydantic request/response models
│       ├── vendorsentinel.db           # SQLite file
│       │
│       ├── pipeline/
│       │   ├── __init__.py
│       │   ├── filter.py               # Layer 1: keyword, Layer 2: rule scorer
│       │   └── analyzer.py             # Layer 3: LLM (Groq/Gemini/mock)
│       │
│       └── utils/
│           ├── __init__.py
│           ├── scraper.py              # Bright Data API + mock fallback
│           └── pdf_generator.py        # ReportLab 5-page PDF + Ed25519 signing
│
├── integration/
│   └── BACKEND_CONTRACT.md             # API contract document
│
└── dist/                               # Production build output
    ├── index.html
    ├── favicon.svg
    ├── icons.svg
    └── assets/
        ├── index-4Gg8ccdm.css
        └── index-CWE6caP0.js
```

---

## 3. Architecture & Data Flow

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────┐
│                   FRONTEND (React 19 SPA)                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  │
│  │  NavBar  │ │   Hero   │ │LiveSignal│ │ Pipeline   │  │
│  │ (scroll) │ │ (search) │ │  Feed    │ │ Visualizer │  │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  │
│  │ Breach   │ │ Source   │ │Compliance│ │ Evidence   │  │
│  │Validation│ │ Catalog  │ │  Wall    │ │ Artifact   │  │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘  │
│        │                                                  │
│        ▼ axios (or mock fallback)                         │
└──────────────────────────────────────────────────────────┘
         │
         ▼ HTTP
┌──────────────────────────────────────────────────────────┐
│                BACKEND (FastAPI / Python)                  │
│                                                           │
│  POST /analyze ───► 5-Layer Pipeline:                     │
│                      1. Bright Data Scraping (6 targets)  │
│                      2. Keyword Filter (Layer 1)           │
│                      3. Rule Scorer (Layer 2)              │
│                      4. LLM Analyzer (Layer 3)             │
│                      5. Risk Scoring + DB Persist          │
│                                                           │
│  GET /report    ───► 5-page PDF + Ed25519 signature       │
│  GET /signals/live ─► Live feed from SQLite               │
│  GET /health    ───► System status                        │
│                                                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  │
│  │  SQLite  │ │  Bright  │ │ Groq LLM │ │ ReportLab  │  │
│  │  (WAL)   │ │  Data    │ │ (70B)    │ │  PDF Gen   │  │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### Data Flow: User Clicks "Run Live Scan"

```
1. User enters "Snowflake" in Hero.jsx search bar
2. Hero calls onScanVendor("Snowflake") in App.jsx
3. App.jsx checks API.USE_MOCK:
   │
   ├── LIVE: axios.post('/analyze', { vendor: "Snowflake" })
   │         → Backend runs 5-layer pipeline
   │         → Returns AnalysisResult
   │         → setVendorData(response.data)
   │
   └── MOCK: Lookup in SNOWFLAKE_ANALYSIS (from mockData.js)
             → setTimeout(1500ms) to simulate delay
             → setVendorData(mockData)
4. Re-renders: Hero → BreachValidation → EvidenceArtifact
5. NavBar dispatches 'trigger-mock-scan' custom event
   → LiveSignalFeed shows scanning overlay → 2.2s → new signals
```

### Component Tree & Data Dependencies

```
App.jsx
├── vendorData (state, passed as props)
├── isLoading (state)
│
├── <ErrorBoundary>                     # Class-based error boundary
├── <NavBar />                          # No props, reads DOM for scroll pos
├── <Hero
│     onScanVendor={handleScanVendor}
│     isLoading={isLoading}
│     vendorData={vendorData} />        # Displays risk score/tier
├── <LiveSignalFeed />                  # Own state: local signals + scan overlay
├── <PipelineVisualizer />              # Own state: throughput counters
├── <BreachValidation vendorData={vendorData} />  # Timeline + signals
├── <SignalSourceCatalog />             # Reads from mockData.js directly
├── <ComplianceWall />                  # Reads from mockData.js directly
├── <EvidenceArtifact vendorData={vendorData} />  # PDF download + crypto
├── <PhaseTwo />                        # Static feature lists
└── <Footer />
```

---

## 4. Frontend Deep Dive

### 4.1 Entry & Root (`main.jsx` / `App.jsx`)

- **main.jsx**: Standard React 19 createRoot
- **App.jsx** (212 lines):
  - Class-based `ErrorBoundary` catches rendering errors with crash UI
  - `handleScanVendor()` — central scan handler with live/mock branching
  - `generateMockHash()` — DJB2-based hash for display (non-cryptographic)
  - Scrolls to `#live-feed` after scan via `scrollIntoView`

### 4.2 Component Details

#### NavBar (104 lines)
- Fixed position, 52px height, backdrop blur
- Navigation dots track active section via scroll listener
- "Run Live Scan" button dispatches `trigger-mock-scan` custom event
- Bottom border turns green when scrolled past hero

#### Hero (256 lines)
- Full-viewport dark section with terminal grid background
- **SVG Radar**: Concentric circles + rotating sweep (CSS `animate-radar-sweep`)
- **Radar Dots**: Randomly generated with severity colors, fade out over 8s
- **Marquee ticker**: Scrolling breach examples (Snowflake, Okta, SolarWinds, Change Healthcare)
- Stats show active vendor name, risk score, and tier

#### LiveSignalFeed (214 lines)
- Terminal-style table with 5 columns: TIME, VENDOR, TYPE, SEVERITY, ACTION
- **Cycle mechanism**: New signal every 5s from `LIVE_SIGNALS_FEED` pool
- **Scan overlay**: Listens for `trigger-mock-scan`, shows 3-stage progress messages
- **Row flash animation**: New rows get green highlight via `animate-row-flash`
- Stats counters: 847 raw, 23 survived (2.7%), <2hr alert window

#### PipelineVisualizer (170 lines)
- 6 horizontal nodes with animated SVG connector line
- Each node shows: badge, icon, name, tech, description, throughput counter
- Nodes: SCOUT → FILTER → ANALYST → SCORER → PACKAGER → ALERT
- Bright Data callout box and technical parameters panel

#### BreachValidation (279 lines)
- Interactive timeline with signal dots on a horizontal rail
- Dots color-coded by severity; disclosure event has ping animation
- Click a dot → opens signal inspector popup with full details
- Risk score counter animates from 0 to target value (1s duration)
- 3 signal cards + stats row (signals found, days early, confidence, score)

#### SignalSourceCatalog (95 lines)
- 2×2 grid of source cards: SERP, Paste, Jobs, GitHub
- Each card shows: status LED, API pathways, target signals, metrics
- Example signal output + "Why Bright Data" callout

#### ComplianceWall (94 lines)
- 10 compliance frameworks in 2-column grid
- Color-coded status: FULL (green), PARTIAL (yellow), PHASE 2 (blue)
- Coverage metric index footer

#### EvidenceArtifact (209 lines)
- PDF preview mockup with vendor data fields
- Risk tier legend (color-coded ranges)
- Download button: live backend or mock fallback toast
- Toast notification system with 4s auto-dismiss
- Feature highlights grid (5-page report, evidence chain, compliance-mapped)

#### PhaseTwo (99 lines)
- Two-column comparison: v0.1.0 shipped (17 items) vs Phase 2 (10 items)
- Version stamp with attribution

### 4.3 Styling System

- **CSS Variables** in `:root`: dark palette (bg, border, brand colors, text)
- **Tailwind**: Custom colors map to CSS variables (e.g., `bg-primary`, `brand-green`)
- **Fonts**: JetBrains Mono (mono), Instrument Serif (serif)
- **Animations**: `radar-sweep`, `pulse-fast`, `marquee`, `pipeline-flow`
- **Noise overlay**: SVG fractal noise at 0.02 opacity across body
- **Custom scrollbars**: Thin, green on hover

### 4.4 Mock Data (`src/data/mockData.js`)

| Dataset | Lines | Contents |
|---|---|---|
| `SNOWFLAKE_ANALYSIS` | 163 | 11 signals (credential_leak, github, personnel, job_signal, news, regulatory) |
| `OKTA_ANALYSIS` | 71 | 8 signals (fewer details, 4 in sub-object) |
| `LIVE_SIGNALS_FEED` | 181 | 20 entries across various vendors |
| `SOURCE_CATALOG` | 52 | 4 source definitions with metrics |
| `PIPELINE_NODES` | 60 | 6 pipeline stages with icons/counters |
| `COMPLIANCE_ITEMS` | 11 | 10 compliance framework mappings |

---

## 5. Backend Deep Dive

### 5.1 FastAPI Server (`backend/app/main.py`)

- **423 lines**, livespan handler initializes SQLite on startup
- CORS configured for `localhost:5173`, `localhost:3000`, `127.0.0.1:5173`
- 4 endpoints (see API Contract)

### 5.2 Configuration (`config.py`)

```python
# Key settings (from backend/.env)
BRIGHT_DATA_API_KEY   # Empty → mock scrapes
GROQ_API_KEY          # Empty → tries Gemini → mock
GEMINI_API_KEY        # Empty → mock
CORS_ORIGINS          # Comma-separated origin list
```

`use_mock_pipeline` property is `True` when both Groq **and** Gemini keys are missing.

### 5.3 Database (`database.py`)

- **SQLite** with WAL mode, 10s timeout
- **`signals`** table: id, vendor, type, severity, title, source, source_url, detail, detected_at, detected_relative, confidence, raw_signal, action
- **Seed data**: 4 Snowflake signals + 2 Okta signals on first init
- **CRUD**: fetch_signals_by_vendor, fetch_latest_signals, insert_new_signal, get_db_stats

### 5.4 Pipeline (`pipeline/`)

#### filter.py — Layer 1 & 2

- **Layer 1** (`verify_layer1_keyword_filter`): Checks vendor name + risk keyword present in text
- **Layer 2** (`evaluate_layer2_rule_scorer`): Classifies signal type from source/text patterns → assigns base weight → maps severity + confidence

Signal type classification rules:
| Source/Text Pattern | Signal Type | Base Weight | Severity |
|---|---|---|---|
| paste, credential, email_list | credential_leak | 9 | critical |
| github, commit, exposed api | github_exposure | 8 | high |
| sec, 10-q, 10-k, violation | regulatory_violation | 8 | high |
| linkedin, resign, depart | executive_departure | 6 | medium |
| job, hiring, recruit | security_job_spike | 5 | medium |
| crt.sh, cert, shadow, subdomain | shadow_it | 7 | high |
| default | news_mention | 4 | low |

#### analyzer.py — Layer 3

- `run_layer3_llm_analyzer()`: Routes to Groq → Gemini → local programmatic mock.
  - Enforces `ANALYST_PROMPT_TEMPLATE` with 8 precise security dimensions.
  - Injects `VENDOR_BREACH_CONTEXT` for retrospective analysis of known demo targets.
  - Returns a detailed data contract including the `risk_indicators_found` list.
- Groq uses `llama-3.3-70b-versatile` with JSON response format.
- Gemini uses `gemini-1.5-flash` with JSON MIME type.
- Mock fallback generates context-aware summaries per signal type, boosting confidence (+15) for demo vendors with known breach contexts.
- Confidence calculated as `70 + (base_weight × 2.5)` in heuristic scorer.

### 5.5 Scraper (`utils/scraper.py`)

- `generate_scrape_targets()`: Dynamically checks `DEMO_VENDORS` context. If the target is a demo vendor, overrides queries to date-target their historical breach year (e.g. 2024 for Snowflake, 2023 for Okta). Returns 6 targets:
  1. Google Search: Credential leaks (Paste site monitoring) - time-targeted.
  2. Google Search: Security incidents/CVEs (SERP / News) - time-targeted.
  3. Google Search: Unauthorized access incident coverage - time-targeted.
  4. Google Search: Security hiring spikes (Job boards).
  5. GitHub Code Search API: Checks for leaked developer secrets directly via structured REST calls (replaces broken direct page scraping).
  6. HaveIBeenPwned API: Queries verified breach databases directly for domain threats (replaces crt.sh scraping).
- `query_bright_data_api()`: Async httpx handler that routes standard SERP searches through Bright Data, but hits GitHub API and HIBP API directly for speed. Gracefully falls back to mock payload on API key absence or timeout.
- `get_mock_scrape_payload()`: Returns realistic mock text per source type, including high-fidelity mock payloads with realistic JSON structure mocks for the GitHub Code Search and HIBP APIs.

### 5.6 PDF Generator (`utils/pdf_generator.py`)

- **5-page ReportLab PDF**: Cover → Executive Summary → Signal Register → Compliance Mapping → Methodology
- **Ed25519 signing**: Loads/generates keypair from `keys/signing_key.pem`
- SHA-256 hash of PDF bytes is signed with private key
- Response headers include `X-Cryptographic-Signature: ed25519:<public_key_hex>` and `X-Document-Hash`

---

## 6. Pipeline Execution Flow

### POST /analyze — Full Pipeline

```
┌────────────────────────────────────────────────────────────────────┐
│  POST /analyze { vendor: "Snowflake" }                            │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ LAYER 1: DATA ACQUISITION (Parallel Scrape / API Calls)      │ │
│  │                                                              │ │
│  │  generate_scrape_targets(vendor) → 6 URLs                     │ │
│  │  asyncio.gather(*[query_bright_data_api(...)])               │ │
│  │  -> Concurrently fires 6 requests (~30s down to ~6s)         │ │
│  │                                                              │ │
│  │  Output: raw_chars_total, scraped_results[]                   │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                               ▼                                   │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ LAYER 2: HEURISTIC FILTER (filter.py)                        │ │
│  │                                                              │ │
│  │  For each scraped result:                                    │ │
│  │    evaluate_layer2_rule_scorer(text, source_type)             │ │
│  │      → signal_type, base_weight, severity, confidence        │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                               ▼                                   │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ LAYER 3: LLM ANALYSIS (analyzer.py)                          │ │
│  │                                                              │ │
│  │  For each scraped result:                                    │ │
│  │    run_layer3_llm_analyzer(vendor, text, source)             │ │
│  │      → Groq (Llama 70B) or Gemini or Programmatic Mock      │ │
│  │      → severity, confidence, summary, signal_type            │ │
│  │                                                              │ │
│  │  Build SignalItem records with action derived from severity   │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                               ▼                                   │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ LAYER 4: DATABASE PERSISTENCE                                │ │
│  │                                                              │ │
│  │  insert_new_signal(signal) for each analyzed signal          │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                               ▼                                   │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ LAYER 5: RISK SCORING & DEMO CLAMPING                        │ │
│  │                                                              │ │
│  │  sev_map = { critical: 9.5, high: 7.8, medium: 5.2, low: 2.5}│
│  │  risk_score = mean signal severity, clamped [0.0, 10.0]      │ │
│  │  If demo vendor: clamp score to historical breach ranges     │ │
│  │  risk_tier: ≥8.0=CRITICAL, ≥6.0=HIGH, ≥4.0=MODERATE, else LOW│
│  │  Pre-render PDF → stamp report_hash                          │ │
│  │  Return AnalysisResult                                       │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                               ▼                                   │
│  Return JSON response to frontend                                 │
└────────────────────────────────────────────────────────────────────┘
```

### Risk Scoring Severity Map

| Severity | Numeric Value |
|---|---|
| critical | 9.5 |
| high | 7.8 |
| medium | 5.2 |
| low | 2.5 |

### Tier Thresholds

| Score Range | Tier |
|---|---|
| 8.0 – 10.0 | CRITICAL |
| 6.0 – 7.9 | HIGH |
| 4.0 – 5.9 | MODERATE |
| 0.0 – 3.9 | LOW |

---

## 7. API Contract

### POST /analyze
- **Request**: `{ "vendor": "string" }`
- **Response**: `AnalysisResult` — vendor, risk_score, risk_tier, timestamp, summary, signal_count, signals[], recommended_action, compliance_refs[], pipeline_stats, report_hash
- **Error**: 400 if vendor empty

### GET /report?vendor=X
- **Response**: PDF file (application/pdf)
- **Headers**: `X-Cryptographic-Signature`, `X-Document-Hash`, `Content-Disposition: attachment`
- **Error**: 404 if no signals found, 500 on PDF generation failure

### GET /signals/live
- **Response**: `{ signals: LiveSignalItem[], updated_at, stats: LiveFeedStats }`
- Fallback to 5 hardcoded mock signals if DB empty

### GET /health
- **Response**: `{ status, version: "0.1.0", uptime_seconds, bright_data_connected, groq_connected, sources_active }`

---

## 8. Configuration Reference

### Frontend (.env.local)

```ini
VITE_API_URL=http://localhost:8000
VITE_APP_ENV=development
VITE_USE_MOCK_DATA=true           # false = live backend calls
VITE_SHOW_DEBUG_PANEL=false
```

### Backend (.env)

```ini
APP_ENV=development
PORT=8000
HOST=0.0.0.0
BRIGHT_DATA_API_KEY=              # Empty = mock scrapes
BRIGHT_DATA_SERP_ZONE=            # Bright Data zone name
BRIGHT_DATA_UNLOCKER_ZONE=        # Bright Data zone name
GROQ_API_KEY=                     # Empty = tries Gemini → mock
GEMINI_API_KEY=                   # Empty = local programmatic mock
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173
```

### Gitignore

Ignores: `node_modules/`, `dist/`, `*.local`, `venv/`, `__pycache__/`, `*.db`, `backend/.env`, `backend/keys/`

---

## 9. Running the Project

### Frontend

```bash
npm install
npm run dev               # Vite dev server on :5173
npm run build             # Production build → dist/
npm run preview           # Preview production build
npm run lint              # ESLint
```

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate     # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Mock Mode (default, no setup needed)

Both frontend and backend work fully in mock mode with zero API keys. The frontend defaults to `VITE_USE_MOCK_DATA=true` and the backend auto-detects missing keys.

### Live Mode

1. Set `VITE_USE_MOCK_DATA=false` in frontend `.env.local`
2. Set `BRIGHT_DATA_API_KEY`, `GROQ_API_KEY` (or `GEMINI_API_KEY`) in `backend/.env`
3. Run both servers

---

## 10. Known Issues & Risks

### Critical
| Issue | Location | Detail |
|---|---|---|
| **No auth on API** | `backend/app/main.py` | All 4 endpoints are publicly accessible |
| **Private key on disk** | `backend/keys/signing_key.pem` | Ed25519 key in plaintext; anyone with FS access can forge PDFs |

### Medium
| Issue | Location | Detail |
|---|---|---|
| **No input sanitization** | `backend/app/schemas.py:6` | Vendor name not sanitized for XSS/SQLi |
| **SQLite no pooling** | `backend/app/database.py:11` | New connection per query in async context |
| **No rate limiting** | `backend/app/main.py` | POST /analyze can be spammed |
| **Zero tests** | Entire project | No unit, integration, or e2e tests |
| **Unpinned deps** | `backend/requirements.txt` | `>=` versions = non-reproducible builds |

### Low
| Issue | Location | Detail |
|---|---|---|
| **Hardcoded radar stats** | `src/components/Hero.jsx:206-218` | "3 CRITICAL" etc not derived from data |
| **Broken DJB2 hash** | `src/App.jsx:157-163` | `hash & hash` is a no-op; padding creates collisions |
| **Dead assets** | `src/assets/` | hero.png, react.svg, vite.svg never referenced |
| **Unused TS types** | `package.json` | `@types/react`, `@types/react-dom` with no TypeScript files |
| **Duplicate mock data** | Frontend mockData.js vs backend database.py | Both have similar Snowflake/Okta signal data |
| **No migrations** | `backend/app/database.py` | `CREATE TABLE IF NOT EXISTS` is the only DDL |

### [RESOLVED BUGS IN V0.1.1]
| Issue | Location | Resolution Details |
|---|---|---|
| **setTimeout leak** | `src/App.jsx:86-145` | **[FIXED]** Added a `useRef` to store fallback setTimeout instances, added cleanup hook on component unmount, and cleared pending scans before running new ones. |
| **Axios no timeout** | `src/App.jsx:70` | **[FIXED]** Added `timeout: 30000` to the Axios POST call to prevent indefinite hanging on server offline conditions. |
| **Race in BreachValidation** | `src/components/BreachValidation.jsx` | **[FIXED]** Added a `useEffect` hook to reset `selectedSignal` state to `null` whenever `vendorData` changes, preventing stale vendor signal details from persisting. |

---

*Generated by deep analysis of the VendorSentinel codebase — 28 source files, ~3,900 lines of code across frontend, backend, and configuration.*
