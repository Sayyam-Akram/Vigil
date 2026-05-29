# VendorSentinel — Frontend Generation Prompt
# Give this entire document to any AI coding tool (Cursor, Claude, GPT-4, v0, etc.)
# It contains everything needed to generate the complete frontend system.

---

## WHO YOU ARE

You are a Senior UI/UX Designer with 15+ years of experience building enterprise security dashboards, 
combined with a Senior Full-Stack Engineer who thinks about backend integration, environment 
management, and API contracts from day one. You write production-grade code that a real 
security team would trust with their vendor portfolio.

You have studied Reef (reef-mcp-registry.vercel.app) — a winning hackathon security project — 
and understand what makes its UI feel like a real production system: dense live data, 
dramatic visual moments, technical identifiers everywhere, monospace data + bold serif headlines, 
and honest "Phase 2" roadmapping.

VendorSentinel matches that caliber. Different problem domain. Same production energy.

---

## PROJECT CONTEXT

**Product:** VendorSentinel — AI-powered third-party vendor risk intelligence system  
**Tagline:** "Know before it becomes news."  
**Problem:** Companies trust vendors with sensitive data. Vendors get breached. Warning signals 
are always public on the web weeks before a breach goes public — but nobody watches them at scale.  
**Solution:** Continuously monitor the public web for early warning signals across a vendor 
portfolio using Bright Data infrastructure, run a layered AI pipeline over every signal, 
deliver evidence-backed risk alerts before threats become headlines.  
**Market:** $7.5B Third-Party Risk Management industry. DORA (EU, mandatory Jan 2025) legally 
requires this capability for financial institutions.  
**Key stat:** Industry average breach detection time: 197 days. VendorSentinel: under 2 hours.

**Reference project for vibe/energy:** reef-mcp-registry.vercel.app  
Do NOT copy Reef's design. Match its production energy and data density with VendorSentinel's 
own visual identity.

---

## TECH STACK — NON-NEGOTIABLE

```
Framework:      React 18 + Vite 5
Styling:        Tailwind CSS v3
Icons:          Lucide React
HTTP Client:    Axios
Font:           JetBrains Mono (Google Fonts) — monospace throughout for data
                + Instrument Serif (Google Fonts) — bold italic for hero headlines only
Hosting target: Vercel (frontend) + Render (FastAPI backend — not built yet)
Node version:   18+
```

**File structure to generate:**
```
vendorsentinel/
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── index.css
│   ├── components/
│   │   ├── Hero.jsx
│   │   ├── LiveSignalFeed.jsx
│   │   ├── PipelineVisualizer.jsx
│   │   ├── BreachValidation.jsx
│   │   ├── SignalSourceCatalog.jsx
│   │   ├── ComplianceWall.jsx
│   │   ├── EvidenceArtifact.jsx
│   │   ├── PhaseTwo.jsx
│   │   ├── NavBar.jsx
│   │   └── Footer.jsx
│   ├── data/
│   │   └── mockData.js          ← all mock data centralized here
│   └── config/
│       └── api.js               ← API base URL + all endpoint definitions
├── integration/
│   └── BACKEND_CONTRACT.md      ← generated alongside code, see spec below
├── .env.example
├── .env.local                   ← gitignored
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

---

## DESIGN SYSTEM

### Colors
```css
--bg-primary:     #08090d;    /* near black, slightly blue-tinted */
--bg-surface:     #0f1117;    /* card/panel background */
--bg-elevated:    #161820;    /* hover states, elevated panels */
--border:         rgba(255,255,255,0.06);
--border-active:  rgba(255,255,255,0.12);

--green:          #00ff9d;    /* LIVE / safe / active */
--green-dim:      rgba(0,255,157,0.08);
--red:            #ff3d3d;    /* CRITICAL risk */
--red-dim:        rgba(255,61,61,0.08);
--orange:         #ff6b00;    /* HIGH risk */
--orange-dim:     rgba(255,107,0,0.08);
--yellow:         #ffc700;    /* MEDIUM risk */
--yellow-dim:     rgba(255,199,0,0.08);
--blue:           #4d9eff;    /* informational / Phase 2 */
--white-primary:  rgba(255,255,255,0.90);
--white-secondary:rgba(255,255,255,0.45);
--white-tertiary: rgba(255,255,255,0.18);
--white-muted:    rgba(255,255,255,0.08);
```

### Typography Rules
```
Hero headlines:   Instrument Serif, bold italic, 52-72px, white/90
Section labels:   JetBrains Mono, 10-11px, uppercase, letter-spacing: 0.15em, white/30
Data values:      JetBrains Mono, 13-14px, white/80
Body text:        JetBrains Mono, 13px, white/45, line-height: 1.7
Technical IDs:    JetBrains Mono, 11px, white/25 (hashes, timestamps, violation codes)
Status badges:    JetBrains Mono, 10px, uppercase, letter-spacing: 0.12em
```

### Component Patterns
```
Cards:            bg-surface, border, rounded-xl, padding 20-24px
Live badges:      green dot (animate-pulse) + "LIVE" text in green, 10px uppercase
Severity tags:    pill shape, color-matched border + bg, monospace
Section dividers: full-width border-t border/6, margin 80-100px vertical
Labels above sections: "SECTION NAME · SUBSECTION" style, white/20, 10px uppercase
```

### The VendorSentinel Identity Mark
Every section header should follow this pattern:
```
● VENDOR SENTINEL · SECTION NAME
Large headline here in Instrument Serif italic
Subtext in JetBrains Mono, white/40
```
The ● should be green and pulse on "live" sections, static on informational ones.

---

## SECTION 1 — HERO

**Goal:** Hit like a gut punch in 3 seconds. The visitor must feel the weight of the problem.

**Layout:** Full viewport height. Dark background with subtle animated grain texture overlay.

**Left side (60%):**
- Small label: `● SENTINEL ACTIVE · THIRD-PARTY RISK INTELLIGENCE` in green, pulsing dot
- Large headline in Instrument Serif bold italic, two lines:
  ```
  Know before
  it becomes news.
  ```
  "news." should render in --green color
- Subtext: `The vendor questionnaire is dead. This is what replaces it.`
- Two stats side by side, separated by a vertical line:
  ```
  197 days          <2 hours
  Industry avg      VendorSentinel
  detection time    detection time
  ```
  "197 days" in red/dim, "<2 hours" in green — visual contrast tells the story
- CTA button: `Run Live Scan →` — green background, black text, monospace, hover lifts slightly

**Right side (40%) — THE COOL VISUAL: Signal Radar**
Build a live signal radar visualization (SVG-based):
- Circular radar with sweeping green line rotating continuously (CSS animation, 4s rotation)
- Dark background with concentric rings in --border color
- Signal dots appear at random positions as the sweep passes them:
  - Red dots = critical signals
  - Orange dots = high signals  
  - Yellow dots = medium signals
- Each dot fades in on sweep contact, persists for ~8 seconds, then fades out
- Dots pulse gently while visible
- Below the radar: small live legend
  ```
  ● 3 CRITICAL  ● 7 HIGH  ● 12 MEDIUM
  MONITORING 4 SOURCES · UPDATING EVERY 30s
  ```
- This runs on mock data — random signal generation on a timer
- The radar is pure CSS/SVG animation — no backend needed
- It should feel like a real security monitoring system is running

**Bottom of hero:** Full-width ticker/marquee scrolling right-to-left:
```
SNOWFLAKE · BREACH CONFIRMED JUN 2024 · 11 SIGNALS DETECTED 49 DAYS PRIOR  
··  OKTA · BREACH CONFIRMED OCT 2023 · SIGNALS VISIBLE ON TELEGRAM DAYS BEFORE  
··  SOLARWINDS · 9 MONTHS UNDETECTED · GITHUB PASSWORD EXPOSED NOV 2019  
··  CHANGE HEALTHCARE · 110M RECORDS · VENDOR RISK UNMONITORED
```
This scrolls continuously. Monospace, white/20, very subtle. Like a threat feed.

---

## SECTION 2 — LIVE SIGNAL FEED

**Label:** `● SIGNAL FEED · LIVE TAIL · UPDATES EVERY 5s`

**Headline:** `*Live intelligence.* Signals as they surface.` (Instrument Serif italic for the first two words)

**The table:** A dark terminal-style table that updates every 5 seconds with new mock signals cycling in from the top. New entries animate in from the top with a brief green flash on the row.

Table columns:
```
TIME          VENDOR       SIGNAL TYPE        SEVERITY    SOURCE              ACTION
14:23:07      Snowflake    Credential leak    CRITICAL    Paste site          ALERT SENT
14:21:44      Okta         Exec departure     HIGH        LinkedIn signals    MONITORING
14:19:12      Stripe       Security hiring    MEDIUM      Job board           FLAGGED
14:17:55      GitHub       News mention       MEDIUM      SERP / News         LOGGED
14:15:03      Twilio       Regulatory filing  HIGH        SEC EDGAR           ALERT SENT
```

Severity column uses colored pills (CRITICAL=red, HIGH=orange, MEDIUM=yellow, LOW=white/30)
Action column: ALERT SENT in green, MONITORING in blue, FLAGGED in yellow, LOGGED in white/30

New rows animate in: slide down from top + green background flash fading to transparent over 1.5s

Below table: Three stats in a row:
```
847          23           <2 hrs
Raw signals  Survived     Alert
processed    filter       delivery
(last hour)  (2.7%)
```
The "2.7%" survival rate through the filter is a key technical credibility marker — shows the layered filtering pipeline is doing its job.

**Mock data:** Generate 20+ realistic signal entries cycling through on a 5-second interval. Each entry should have plausible timestamps, real vendor names (Snowflake, Okta, Stripe, GitHub, Twilio, Salesforce, AWS, Cloudflare, MongoDB, Datadog), realistic signal types.

---

## SECTION 3 — HOW IT WORKS (PIPELINE VISUALIZER)

**Label:** `● ARCHITECTURE · INTELLIGENCE PIPELINE`

**Headline:** `Six layers. *Zero noise* reaching the analyst.`

**THE COOL VISUAL: Animated Pipeline Flow**

Build a horizontal pipeline visualization showing data flowing through 6 stages. This is the equivalent of Reef's propagation grid — it shows the system working.

Each stage is a rectangular node:
```
[SCOUT] → [FILTER] → [ANALYST] → [SCORER] → [PACKAGER] → [ALERT]
```

Visual specs:
- Dark panels connected by animated dashed lines
- Animated dots travel along the connecting lines from left to right (CSS keyframe animation)
- Multiple dots at different positions simultaneously — makes it feel live
- Each node has:
  - Stage name in green, uppercase, 11px
  - Icon (Lucide React)
  - 2-line description
  - A small "throughput" counter that ticks up slowly

Stage definitions:
```
SCOUT         Globe icon
              "Bright Data infrastructure"
              "4 sources · bypassing blocks"
              Powered by: [BRIGHT DATA] badge in amber/gold
              Throughput: ~847/hr

FILTER        Filter icon  
              "Keyword + rule engine"
              "Drops 97.3% of noise"
              Throughput: ~23/hr

ANALYST       Brain icon
              "Groq · Llama 3.1 70B"
              "Signal classification"
              Throughput: ~23/hr

SCORER        Activity icon
              "Dynamic risk weighting"
              "0-10 vendor score"
              Throughput: ~23/hr

PACKAGER      FileText icon
              "Evidence artifact"
              "Signed PDF + compliance map"
              Throughput: ~8/hr (only scored 5+ triggers full report)

ALERT         Bell icon
              "Slack · Email · Webhook"
              "< 2hr from signal to alert"
              Throughput: ~8/hr
```

Below the pipeline: The SCOUT node has a special callout box:
```
┌─────────────────────────────────────────────────────┐
│  ● BRIGHT DATA INFRASTRUCTURE                        │
│  Web Unlocker · SERP API · Scraping Browser         │
│  Required: bypasses bot detection, geo-blocks,      │
│  CAPTCHAs, and JS-rendering on all 4 source types.  │
│  Without this layer, the pipeline does not work.    │
└─────────────────────────────────────────────────────┘
```
This is a green-bordered callout — explicitly credits Bright Data as load-bearing.

Below pipeline: a small technical note:
```
Model: Llama 3.1 70B via Groq · Free tier · ~500 tok/s inference
Filter: Keyword layer → Rule-based scorer → LLM only on survivors
Context window management: 97.3% filtered before LLM contact
```

---

## SECTION 4 — BREACH VALIDATION

**Label:** `● BREACH VALIDATION · HISTORICAL PROOF`

**Headline:** `The signals were *always there.* Nobody was watching.`

**Intro text:** 
`We ran VendorSentinel against historical public web data from April–May 2024 for Snowflake. 
The breach became public on June 2, 2024. Here is what we found.`

**THE COOL VISUAL: Breach Timeline**

A horizontal timeline visualization:

```
APR 14 ──────────── APR 28 ──── MAY 3 ──── MAY 19 ──────────────── JUN 2
   ↑                    ↑          ↑           ↑                        ↑
Signal #1           Signal #4   Signal #7   Signal #11          BREACH PUBLIC
Credentials on      Sec engineers Job postings News coverage      Confirmed
paste site          departing    spike 4x     references          by Snowflake
[CRITICAL]          [HIGH]       [MEDIUM]     investigation       [TOO LATE]
```

Visual specs:
- Dark horizontal timeline bar with a vertical line at "JUN 2" in red
- Signal markers as colored dots above the line (red/orange/yellow based on severity)
- Each dot is clickable/hoverable — shows a tooltip with signal details
- The area to the left of JUN 2 is labeled "VendorSentinel Detection Window" in green
- The JUN 2 line is labeled "Public Disclosure" in red
- Below the timeline: "First signal: April 14 · Public disclosure: June 2 · Gap closed: **49 days**"
- "49 days" renders large, in green

**Below the timeline: Signal Cards**

Three representative signal cards (the most dramatic ones):

Card 1 — CRITICAL:
```
● CRITICAL · SIGNAL #1 · APR 14 2024
Credential exposure on public paste site
Source: Paste site monitoring via Bright Data Web Unlocker
Detail: Emails matching @snowflake.com domain found in public 
        credential dump alongside plaintext passwords
Confidence: 96%    Detected: 14 Apr 2024, 03:17 UTC
```

Card 2 — HIGH:
```
● HIGH · SIGNAL #4 · APR 28 2024  
Senior security engineers departing
Source: LinkedIn public signals
Detail: 3 security-titled roles show departure activity.
        VP of Security confirmed role change publicly.
Confidence: 84%    Detected: 28 Apr 2024, 11:42 UTC
```

Card 3 — HIGH:
```
● HIGH · SIGNAL #8 · MAY 12 2024
SEC filing references unauthorized access investigation
Source: SERP / News monitoring · SEC EDGAR
Detail: Routine 10-Q filing contains language referencing 
        ongoing investigation into unauthorized data access.
Confidence: 91%    Detected: 12 May 2024, 16:08 UTC
```

**Bottom stat row:**
```
11              49 days          96%              3
Signals found   Before public    Max confidence   Severity levels
in window       disclosure       score            detected
```

**Note at bottom (important for credibility):**
`All signals sourced from public web data only. Retrospective analysis uses publicly 
archived content. No private systems accessed. Validation methodology available in GitHub.`

---

## SECTION 5 — SIGNAL SOURCE CATALOG

**Label:** `● SCOUT LAYER · SIGNAL SOURCE CATALOG`

**Headline:** `Four sources. *Every block bypassed.* Bright Data infrastructure.`

Build 4 source cards in a 2x2 grid:

**Card 1: SERP / News Monitoring**
```
Status: ● LIVE
Source type: SERP API · Google · Bing · Yandex
Bright Data tool: SERP API
What it finds: News articles, press releases, journalist investigations,
               regulatory announcements mentioning vendor
Signal types: News mention · Regulatory filing · Enforcement action
Last signal: 6 minutes ago
Rate: ~312 queries/hr
Example signal: "Reuters: Snowflake investigating unauthorized access"
Why Bright Data: Real-time structured SERP results, bypasses rate limits
```

**Card 2: Paste Site Scanning**
```
Status: ● LIVE  
Source type: Public paste sites · Credential dumps · Data leak forums
Bright Data tool: Web Unlocker
What it finds: Leaked credentials, internal emails, API keys,
               database exports containing vendor domain names
Signal types: Credential leak · Data exposure · API key exposure
Last signal: 23 minutes ago
Rate: ~48 scans/hr per vendor
Example signal: "@snowflake.com emails in public credential dump"
Why Bright Data: Paste sites aggressively block scrapers. 
                 Web Unlocker with residential proxies is required.
```

**Card 3: Job Board Signals**
```
Status: ● LIVE
Source type: LinkedIn · Indeed · Glassdoor · Lever · Greenhouse
Bright Data tool: Web Scraper API (pre-built scrapers)
What it finds: Sudden security hiring spikes, urgent role postings,
               executive departures visible in role change activity
Signal types: Security hiring spike · Executive departure · Team attrition
Last signal: 2 hours ago
Rate: ~24 scans/hr per vendor
Example signal: "4 urgent security engineer postings in 14 days (4× baseline)"
Why Bright Data: LinkedIn blocks all scraping. 
                 660+ pre-built scrapers handle auth walls.
```

**Card 4: GitHub Public Scanning**
```
Status: ● LIVE
Source type: GitHub public repositories · Commit history · Issues
Bright Data tool: GitHub API (free) + Web Unlocker for extended coverage
What it finds: Exposed API keys in commits, security advisories,
               public issue discussions about vulnerabilities
Signal types: API key exposure · Security advisory · Vulnerability mention
Last signal: 41 minutes ago
Rate: ~96 scans/hr per vendor
Example signal: "AWS key committed to snowflake-internal-tools repo"
Why Bright Data: Extended coverage beyond API rate limits requires proxy layer
```

Each card: dark surface, colored status dot, mono font throughout, technical stats in smaller text, "Why Bright Data" section in a subtle callout box at card bottom.

---

## SECTION 6 — COMPLIANCE WALL

**Label:** `● COMPLIANCE · REGULATORY COVERAGE`

**Headline:** `Built for the *mandates that already exist.*`

**Intro:** `DORA became mandatory for EU financial institutions in January 2025. 
SOC 2 Type II requires continuous third-party risk monitoring. 
VendorSentinel maps every signal and every report to these frameworks.`

Build a compliance grid. Each item has: Framework name · Article/control · Status badge · One-line description

**Status types:**
- `FULL` — green badge
- `PARTIAL` — yellow badge  
- `PHASE 2` — blue badge, slightly dimmed

```
FRAMEWORK           CONTROL              STATUS    DESCRIPTION
DORA                Article 28           FULL      ICT third-party risk monitoring
DORA                Article 30           FULL      Contractual arrangements with ICT providers
SOC 2 Type II       CC9.2                FULL      Vendor risk management controls
ISO 27001           Annex A.15           FULL      Supplier relationships security
SEC Cyber Rule      Item 1.05            PARTIAL   Material cybersecurity incident disclosure
NIS2 Directive      Article 21           PARTIAL   Supply chain security measures
NIST CSF            ID.SC-2              FULL      Supplier risk identification
OWASP               Third-party risks    FULL      Dependency and vendor risk monitoring
EU AI Act           Article 28           PHASE 2   Third-party AI system oversight
CCPA / CPRA         Section 1798.150     PHASE 2   Vendor data breach notification
```

Layout: 2-column grid on desktop, stacked on mobile. Each row is a subtle card with left-border color matching status. Full=green, Partial=yellow, Phase 2=blue.

Below the grid:
```
Coverage summary:
8 full  ·  2 partial  ·  2 Phase 2

Honest about gaps — the same 3-state system appears in the evidence report PDF.
Partial and Phase 2 items are roadmapped, not claimed.
```

---

## SECTION 7 — EVIDENCE ARTIFACT

**Label:** `● EVIDENCE ARTIFACT · RISK REPORT`

**Headline:** `Not a dashboard export. *A document your CISO hands legal.*`

**Layout:** Dark background. Centered. Reef's "insurance artifact" energy but for vendor risk.

Center piece — a rendered "document preview" card (like a book/document mockup):
```
┌─────────────────────────────────────────────┐
│  VENDORSENTINEL RISK INTELLIGENCE REPORT     │
│  v0.1.0 · Generated: 2026-05-25T14:23:07Z   │
│                                             │
│  Vendor:        Snowflake Inc.              │
│  Risk Tier:     ■ CRITICAL                  │
│  Risk Score:    8.1 / 10                    │
│                                             │
│  Signals:       11 detected                 │
│  Window:        Apr 14 – Jun 2 2024         │
│  Sources:       4 active monitors           │
│                                             │
│  Frameworks:    DORA Art.28 · SOC2 CC9.2   │
│                 ISO27001 A.15 · NIST ID.SC  │
│                                             │
│  Recommended:   Suspend write access        │
│                 Request emergency           │
│                 attestation within 24hrs    │
│                                             │
│  ─────────────────────────────────────────  │
│  Report hash:   sha256:c4d18a7e2f63...      │
│  Signed:        ed25519 · vendorsentinel    │
│  Pages:         5                           │
└─────────────────────────────────────────────┘
```
This card should look like an actual document. Slight shadow, subtle border, monospace throughout, red color for the CRITICAL tier.

**Risk Tier Legend** (below the document):
```
CRITICAL (8-10)  HIGH (6-7.9)  MODERATE (4-5.9)  LOW (0-3.9)
```
Color-coded pills.

**Download button:**
```
[ ↓ Download Sample Report (PDF) ]
sha256: c4d18a7e2f63b891d4a7...392817
signature verified · ed25519
```
Button: white border, white text, monospace. On click: show a toast "Report generation requires backend. Sample PDF available on GitHub." (since backend not built yet)

**Three report feature callouts below:**
```
5-page structured report          Evidence chain included          Compliance-mapped
Executive summary · Signals       Source URL · Timestamp          DORA · SOC 2 · ISO
Recommendations · Risk score      Confidence score · Hash         framework references
```

---

## SECTION 8 — PHASE 2

**Label:** `● ROADMAP · PHASE 2 COMMITMENTS`

**Headline:** `v0.1.0 ships today. *Here is what Phase 2 looks like.*`

**Intro (this section builds trust — be honest):**
`This is v0.1.0 — built during the Bright Data Hackathon, May 2026. The pipeline works. 
The signals are real. The validation against Snowflake is reproducible. 
What follows are honest Phase 2 commitments — not claims.`

**Two columns:**

Left — "Ships in v0.1.0":
```
✓ SERP / news signal monitoring
✓ Paste site credential scanning
✓ Job board departure signals
✓ GitHub public repo scanning
✓ Layered filter pipeline (keyword → rule → LLM)
✓ Groq / Llama 3.1 70B risk scoring
✓ 0-10 vendor risk score
✓ PDF evidence report generation
✓ DORA / SOC 2 / ISO 27001 compliance mapping
✓ Retrospective Snowflake validation
✓ React frontend + FastAPI backend
✓ Bright Data infrastructure integration
```

Right — "Phase 2 (roadmapped, not claimed)":
```
○ Multi-tenant vendor portfolio management
○ Real-time Slack / Teams / webhook alert delivery
○ CRM integration (Salesforce, HubSpot)
○ Dark web monitoring layer (legal review required)
○ SEC EDGAR structured filing parser
○ NIS2 / EU AI Act compliance mapping
○ Historical trend scoring (30/60/90 day windows)
○ API access for enterprise integration
○ Vendor self-attestation portal
○ Broker/underwriter API integration
```

**Bottom of section — version stamp:**
```
VendorSentinel v0.1.0
Built at Bright Data Web Data UNLOCKED Hackathon · May 2026
Powered by Bright Data · Groq · FastAPI · React
MIT Licensed · Source on GitHub
```

---

## NAVBAR

Fixed top. Dark background with blur backdrop. Height: 52px.

Left: Shield icon (Lucide) in green + "VENDORSENTINEL" in monospace uppercase + "v0.1.0" in white/20

Center (desktop only): Navigation dots/anchors for each section — just dots, no text. Active dot = green, others = white/15

Right: 
- `● SENTINEL ACTIVE` badge (green pulse dot)
- `Run Live Scan →` button (small, green outline)

On scroll past hero: navbar gets a subtle green line on bottom border.

---

## FOOTER

Dark, minimal. Two rows:
```
Row 1: VendorSentinel · Third-Party Risk Intelligence · v0.1.0
Row 2: Built at Bright Data Hackathon 2026 · Powered by Bright Data Infrastructure
       All signals sourced from public web only · No private systems accessed
```
White/15 text. Centered.

---

## ENVIRONMENT VARIABLES — GENERATE THESE FILES

### .env.example
```bash
# ── VendorSentinel Environment Variables ──────────────────────────────────

# Backend API URL
# Local:      http://localhost:8000
# Production: https://your-render-app.onrender.com
VITE_API_URL=http://localhost:8000

# App environment
VITE_APP_ENV=development

# Feature flags (set to 'true' to enable)
VITE_USE_MOCK_DATA=true      # true = mock data, false = real backend
VITE_SHOW_DEBUG_PANEL=false  # shows API response panel for development
```

### src/config/api.js — GENERATE THIS FILE
```javascript
// ── API Configuration ─────────────────────────────────────────────────────
// All backend endpoints defined here. When backend is ready,
// set VITE_API_URL in .env.local and VITE_USE_MOCK_DATA=false

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA !== 'false'

export const API = {
  BASE_URL,
  USE_MOCK,
  
  ENDPOINTS: {
    // POST /analyze
    // Body: { vendor: string }
    // Returns: AnalysisResult (see BACKEND_CONTRACT.md)
    ANALYZE: `${BASE_URL}/analyze`,
    
    // GET /report?vendor=Snowflake
    // Returns: PDF blob (application/pdf)
    REPORT: `${BASE_URL}/report`,
    
    // GET /signals/live
    // Returns: LiveSignalFeed[] (see BACKEND_CONTRACT.md)
    // Used by LiveSignalFeed component — polled every 5s
    LIVE_SIGNALS: `${BASE_URL}/signals/live`,
    
    // GET /health
    // Returns: { status: 'ok', version: '0.1.0', uptime: number }
    HEALTH: `${BASE_URL}/health`,
  }
}

export default API
```

---

## BACKEND CONTRACT FILE — GENERATE THIS AS integration/BACKEND_CONTRACT.md

```markdown
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
BRIGHT_DATA_API_KEY=
BRIGHT_DATA_SERP_ZONE=
BRIGHT_DATA_UNLOCKER_ZONE=
GROQ_API_KEY=
SUPABASE_URL=              # optional, SQLite fallback available
SUPABASE_ANON_KEY=         # optional
APP_ENV=development
CORS_ORIGINS=http://localhost:3000,https://your-vercel-app.vercel.app

## CORS
Allow origins from CORS_ORIGINS env var.
Allow methods: GET, POST, OPTIONS
Allow headers: Content-Type, Authorization

## Endpoint 1: POST /analyze

Request:
{
  "vendor": "Snowflake"
}

Response (200):
{
  "vendor": "Snowflake",
  "risk_score": 8.1,
  "risk_tier": "CRITICAL",           // CRITICAL | HIGH | MODERATE | LOW
  "timestamp": "2026-05-25T14:23:07Z",
  "summary": "string (2-3 sentences AI-generated)",
  "signal_count": 11,
  "signals": [
    {
      "id": "sig_001",
      "type": "credential_leak",     // credential_leak | personnel | news | job_signal | regulatory | github
      "severity": "critical",        // critical | high | medium | low
      "title": "string",
      "source": "string",
      "source_url": "string | null",
      "detail": "string",
      "detected_at": "2026-05-25T12:00:00Z",
      "detected_relative": "2 hours ago",
      "confidence": 94,              // 0-100
      "raw_signal": "string | null"  // original scraped text, truncated to 500 chars
    }
  ],
  "recommended_action": "string",
  "compliance_refs": ["DORA Art.28", "SOC 2 CC9.2", "ISO 27001 A.15"],
  "pipeline_stats": {
    "raw_signals_processed": 847,
    "survived_filter": 23,
    "filter_rate_pct": 2.7,
    "processing_time_ms": 4200
  },
  "report_hash": "sha256:c4d18a7e2f63..."
}

## Endpoint 2: GET /report?vendor=Snowflake

Response: PDF file (application/pdf)
Content-Disposition: attachment; filename="Snowflake_risk_report.pdf"

PDF structure (5 pages):
Page 1: Cover — vendor name, risk tier, score, date, hash
Page 2: Executive summary + recommended actions  
Page 3: Signal evidence (all signals with sources, timestamps, confidence)
Page 4: Compliance mapping (DORA, SOC 2, ISO 27001, NIST)
Page 5: Historical context + methodology note

## Endpoint 3: GET /signals/live

Response (200):
{
  "signals": [
    {
      "id": "sig_live_001",
      "vendor": "Snowflake",
      "type": "credential_leak",
      "severity": "critical",
      "title": "string",
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

## Endpoint 4: GET /health

Response (200):
{
  "status": "ok",
  "version": "0.1.0",
  "uptime_seconds": 3600,
  "bright_data_connected": true,
  "groq_connected": true,
  "sources_active": ["serp", "paste", "jobs", "github"]
}

## Pipeline Implementation Notes

Layer 1 — Keyword Filter (zero LLM cost):
  - vendor name must appear in text
  - at least one RISK_KEYWORD must appear
  - RISK_KEYWORDS = ["breach", "leak", "hack", "vulnerability", "exposed",
    "investigation", "unauthorized", "ransomware", "incident", "resign",
    "layoff", "violation", "penalty", "fine", "departure", "attack", "exploit"]
  - Discard if fails either check

Layer 2 — Rule-Based Scorer (zero LLM cost):
  SIGNAL_WEIGHTS = {
    "credential_leak": 9,
    "regulatory_violation": 8,
    "executive_departure": 6,
    "security_job_spike": 5,
    "news_mention": 4,
    "github_exposure": 8
  }
  Classify by source + keyword pattern. Assign type + base weight.

Layer 3 — LLM (only signals surviving layers 1+2):
  Model: Llama 3.1 70B via Groq
  Prompt: Classify signal relevance, assess severity, generate 2-sentence summary.
  Output: JSON { severity, confidence, summary, signal_type }
  Keep context window small — pass only the filtered signal text, not raw scrape.
```

---

## MOCK DATA — src/data/mockData.js

Generate comprehensive mock data in this file that exactly matches the backend contract above. 
Include:
- 1 complete AnalysisResult for "Snowflake" with 11 signals
- 1 complete AnalysisResult for "Okta" with 8 signals
- 20+ LiveSignal entries for the live feed (cycling on timer)
- Pipeline stats
- Source catalog status data

All mock data shapes must exactly match the backend contract types above.
When VITE_USE_MOCK_DATA=true, all API calls return from this file instead of hitting the network.

---

## ANIMATIONS & MICRO-INTERACTIONS

Required animations:
1. Signal radar sweep (Hero) — CSS rotation, 4s infinite
2. Signal dots on radar — JS timer, random position generation, fade in/out
3. Pipeline data flow (Section 3) — CSS dots traveling along connection lines
4. Live feed new row — slide in from top + green flash on row background
5. Risk score counter — count up animation from 0 to final score over 1.5s
6. Ticker/marquee (Hero bottom) — CSS infinite scroll animation
7. Navbar active section dot — smooth color transition on scroll
8. Compliance wall items — staggered fade-in on scroll into view (IntersectionObserver)
9. Timeline dots (Section 4) — sequential reveal left to right with delay
10. Pipeline throughput counters — slow increment animation on scroll into view

---

## QUALITY REQUIREMENTS

- Works on Chrome, Firefox, Safari, Edge (latest versions)
- Responsive: looks correct at 1440px, 1280px, 1024px (mobile not priority)
- No console errors in production build
- `npm run build` must succeed with zero errors
- All API calls wrapped in try/catch with mock data fallback
- No hardcoded strings that appear in multiple places — use mockData.js as single source
- All colors from CSS variables or Tailwind config — no inline hex colors
- Every section must be reachable by anchor link (id attribute on section elements)
- Lighthouse performance score target: >85 (no heavy unoptimized assets)

---

## FINAL INSTRUCTION

Generate the complete project. Every file. Working code. 
The frontend must:
1. Run with `npm install && npm run dev` with zero setup beyond that
2. Show the full UI with mock data immediately — no backend required
3. Be ready for backend integration by swapping VITE_USE_MOCK_DATA=false and setting VITE_API_URL
4. Feel like a real production security intelligence system — not a hackathon project
5. Match the caliber of reef-mcp-registry.vercel.app in professionalism and data density

This is a competition submission. It needs to win.
```
