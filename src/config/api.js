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
