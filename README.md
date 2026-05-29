# 🛡️ VendorSentinel

> **AI-Powered Third-Party Vendor Risk Intelligence Platform**
> *“Know before it becomes news.”*
> Built for the Bright Data "Web Data UNLOCKED" Hackathon · May 2026

VendorSentinel continuously monitors the public web for early warning threat signals of cybersecurity breaches at third-party vendors. By deploying a layered AI filtering pipeline (Keyword Filtering → Rule Scorer → Large Language Model Analysis), it cuts through public noise to generate evidence-backed risk profiles and cryptographic, Ed25519-signed PDF risk reports.

---

## 🏗️ System Architecture & Data Flow

```
┌──────────────────────────────────────────────────────────┐
│                   FRONTEND (React 19 SPA)                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  │
│  │  NavBar  │ │   Hero   │ │LiveSignal│ │ Pipeline   │  │
│  │ (scroll) │ │ (search) │ │  Feed    │ │ Visualizer │  │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘  │
│        │                                                  │
│        ▼ Axios requests (with circuit-breaker fallback)   │
└──────────────────────────────────────────────────────────┘
         │
         ▼ HTTP API Calls
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
└──────────────────────────────────────────────────────────┘
```

---

## ⚡ Quick Start (Local Development)

Both frontend and backend are pre-configured to run fully in **Mock Mode** out of the box with zero external API key requirements.

### 1. Backend Setup (FastAPI)
```bash
# Navigate to the backend directory
cd backend

# Create and activate a Python virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI developer server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
*The database (`vendorsentinel.db`) and Ed25519 signing keys (`keys/signing_key.pem`) will auto-initialize on first run.*

### 2. Frontend Setup (React + Vite)
```bash
# Install dependencies from the root directory
npm install

# Start the local development server
npm run dev
```
*Open `http://localhost:5173` in your browser.*

---

## 🌐 Production Deployment Guide

To deploy VendorSentinel as a live system for demo or production, configure the frontend on **Vercel** and the backend on **Render**.

### 🚀 Frontend Deployment: Vercel

Vercel is optimal for hosting the React SPA.

1. **Import Project:** Connect your Vercel account to GitHub and import this repository.
2. **Configure Build Settings:**
   - **Framework Preset:** `Vite` (automatically detected)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
3. **Environment Variables:** Add the following variable in Vercel settings:
   - `VITE_API_URL`: Set this to your live **Render Backend URL** (e.g., `https://vendorsentinel-backend.onrender.com`).
   - `VITE_USE_MOCK_DATA`: Set to `false` to route queries directly to the active live backend pipeline, or `true` to keep frontend-isolated mock simulation.

---

### 🛡️ Backend Deployment: Render

Render is optimal for hosting Python FastAPI servers.

1. **Create Web Service:** Choose **Web Service** on Render and link your GitHub repository.
2. **Configure Build Settings:**
   - **Language:** `Python`
   - **Build Command:** `pip install -r backend/requirements.txt`
   - **Start Command:** `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. **Persistent Disk (Optional):**
   - SQLite writes to `backend/app/vendorsentinel.db`. By default, Render Web Services have ephemeral filesystems. 
   - To keep signal history persistent across backend restarts, add a **Render Disk** mounted at `/data` and update `DATABASE_URL` in env parameters to point to `/data/vendorsentinel.db`.
4. **Environment Variables:**
   Add these environment keys under the Render "Environment" tab:
   - `APP_ENV`: `production`
   - `PORT`: `10000` (Render binds the host port automatically via `$PORT`)
   - `CORS_ORIGINS`: Set to your live Vercel URL (e.g., `https://vendorsentinel.vercel.app`) to authorize API requests.
   
   #### For Active Scraping & LLM Risk Intelligence (Optional):
   - `BRIGHT_DATA_API_KEY`: Your Bright Data API key (scrapes live Paste sites, GitHub commits, cert logs).
   - `BRIGHT_DATA_SERP_ZONE`: Bright Data SERP zone name.
   - `BRIGHT_DATA_UNLOCKER_ZONE`: Bright Data Web Unlocker zone name.
   - `GROQ_API_KEY`: Groq API key (uses `llama-3.3-70b-versatile` for high-speed analysis).
   - `GEMINI_API_KEY`: Google Gemini API key (acts as fallback LLM).
   *(If these variables are omitted, the backend pipeline automatically activates its programmatic mock fallback, making it 100% stable for demos with zero setup costs!)*

---

## 🔒 Security & Data Integrity

- **Environment Separation:** API keys are never written to disk or committed to Git. All configuration variables are handled using secure, ignored environment configurations (`.env`) locally and encrypted platform secrets in production.
- **Evidence Chain Security:** Generated PDF reports are hashed using SHA-256 and signed with an automated Ed25519 public-key signature system. The public keys are returned via response headers for verification.
