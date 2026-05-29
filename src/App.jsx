import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import API from './config/api';

// Components
import NavBar from './components/NavBar';
import Hero from './components/Hero';
import VendorDirectory from './components/VendorDirectory';
import LiveSignalFeed from './components/LiveSignalFeed';
import PipelineVisualizer from './components/PipelineVisualizer';
import BreachValidation from './components/BreachValidation';
import SignalSourceCatalog from './components/SignalSourceCatalog';
import ComplianceWall from './components/ComplianceWall';
import EvidenceArtifact from './components/EvidenceArtifact';
import PhaseTwo from './components/PhaseTwo';
import Footer from './components/Footer';

// Seed Mock Datasets
import { SNOWFLAKE_ANALYSIS, OKTA_ANALYSIS } from './data/mockData';

// ── Risk scoring constants (mirrors backend sev_map) ──
const SEV_MAP = { critical: 9.5, high: 7.8, medium: 5.2, low: 2.5 };

function calculateRiskScore(signals) {
  if (signals.length === 0) return { score: 0, tier: 'LOW' };
  const total = signals.reduce((sum, s) => sum + (SEV_MAP[s.severity?.toLowerCase()] || 4.0), 0);
  const score = Math.round(Math.min(10.0, Math.max(0.0, total / signals.length)) * 10) / 10;
  const tier = score >= 8.0 ? 'CRITICAL' : score >= 6.0 ? 'HIGH' : score >= 4.0 ? 'MODERATE' : 'LOW';
  return { score, tier };
}

// Safe Error Boundary Isolation Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg-primary text-text-primary font-mono text-xs flex flex-col items-center justify-center p-6 space-y-4 border border-brand-red/30">
          <div className="text-brand-red font-bold text-sm">⚠️ CRITICAL EXCEPTION SHIELD ACTIVE</div>
          <p className="text-text-secondary text-center max-w-sm leading-relaxed">
            The Vigil runtime intercepted an uncaught UI layout or state error. The boundary isolated the failure safely.
          </p>
          <div className="bg-white/5 p-4 rounded border border-white/10 text-left max-w-lg overflow-auto max-h-60 select-all whitespace-pre-wrap leading-normal text-[11px]">
            {this.state.error?.toString()}
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="border border-brand-green text-brand-green hover:bg-brand-green-dim transition-all duration-200 px-4 py-2 rounded font-semibold uppercase tracking-wider"
          >
            Restart Application Core
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  const [vendorData, setVendorData] = useState(SNOWFLAKE_ANALYSIS);
  const [isLoading, setIsLoading] = useState(false);
  const [replayMode, setReplayMode] = useState(false);
  const scanTimeoutRef = useRef(null);
  const replayTimersRef = useRef([]);

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
      replayTimersRef.current.forEach(t => clearTimeout(t));
    };
  }, []);

  // ── TIMELINE REPLAY ENGINE ──────────────────────────────────────────────
  // The hero demo feature. Feeds signals one-by-one with delays, making the
  // score climb progressively from LOW → MODERATE → HIGH → CRITICAL.
  // When API.USE_MOCK is false, it uses live backend signals returned by uvicorn.
  const handleReplayVendor = useCallback(async (vendorName) => {
    // Cancel any pending operations
    if (scanTimeoutRef.current) { clearTimeout(scanTimeoutRef.current); scanTimeoutRef.current = null; }
    replayTimersRef.current.forEach(t => clearTimeout(t));
    replayTimersRef.current = [];

    setIsLoading(true);
    setReplayMode(true);

    let sourceAnalysis = null;

    // Live API mode: fetch real-time intelligence from backend
    if (!API.USE_MOCK) {
      try {
        const response = await axios.post(API.ENDPOINTS.ANALYZE, {
          vendor: vendorName
        }, {
          timeout: 30000
        });
        
        if (response.data && response.data.signals && response.data.signals.length > 0) {
          sourceAnalysis = response.data;
        }
      } catch (err) {
        console.warn('Backend live API failed or offline, using mock fallback:', err);
      }
    }

    // Fallback to local mock seed data if mock mode is active or backend fetch failed
    if (!sourceAnalysis) {
      const query_lower = vendorName.toLowerCase();
      if (query_lower.includes('snowflake')) {
        sourceAnalysis = SNOWFLAKE_ANALYSIS;
      } else if (query_lower.includes('okta')) {
        sourceAnalysis = OKTA_ANALYSIS;
      } else {
        // Unknown vendor scan — score CAPPED at 3.0 max (single scan can't confirm a breach)
        const simulatedScore = parseFloat((1.5 + Math.random() * 1.5).toFixed(1));
        const simulatedTier = simulatedScore >= 4.0 ? 'MODERATE' : 'LOW';
        
        sourceAnalysis = {
          vendor: vendorName,
          risk_score: simulatedScore,
          risk_tier: simulatedTier,
          timestamp: new Date().toISOString(),
          summary: `Initial scan complete for ${vendorName}. continuous monitoring required — a single scan cannot validate a breach pattern.`,
          signal_count: 2,
          signals: [
            {
              id: `sig_gen_${Date.now()}_1`,
              type: "news",
              severity: "low",
              title: `Public mentions of ${vendorName} in security contexts`,
              source: "SERP / News via Bright Data",
              source_url: null,
              detail: `Standard security discussion mentions found for ${vendorName}. No confirmed threat indicators at this time.`,
              detected_at: new Date().toISOString(),
              detected_relative: "12 days before",
              confidence: 45,
              raw_signal: `search_result: "${vendorName} security" — general industry mentions only`
            },
            {
              id: `sig_gen_${Date.now()}_2`,
              type: "github",
              severity: "low",
              title: "Public repository keyword scan",
              source: "GitHub Code Search API",
              source_url: null,
              detail: "No high-confidence exposed secrets found in initial scan. Further monitoring recommended.",
              detected_at: new Date(Date.now() + 1000).toISOString(),
              detected_relative: "10 days before",
              confidence: 35,
              raw_signal: `github_api: q=${vendorName.toLowerCase()}+password — 0 critical matches`
            }
          ],
          recommended_action: `No immediate action required. Add ${vendorName} to continuous monitoring.`,
          compliance_refs: ["DORA Art.28", "SOC 2 CC9.2"],
          report_hash: `sha256:${generateMockHash(vendorName + Date.now())}`
        };
      }
    }

    // Sort signals chronologically for the replay timeline
    const allSignals = [...sourceAnalysis.signals].sort(
      (a, b) => new Date(a.detected_at) - new Date(b.detected_at)
    );

    // Initialize with empty state — score starts at 0
    setVendorData({
      ...sourceAnalysis,
      signals: [],
      signal_count: 0,
      risk_score: 0,
      risk_tier: 'LOW',
      summary: `Timeline replay initiated for ${vendorName}. Replaying signal detection chronology...`,
    });

    // Scroll to the validation section where the timeline visual lives
    setTimeout(() => {
      const el = document.getElementById('validation');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 300);

    // Feed signals one at a time with 2-second intervals
    allSignals.forEach((signal, index) => {
      const timer = setTimeout(() => {
        setVendorData(prev => {
          const updatedSignals = [...prev.signals, signal];
          const { score, tier } = calculateRiskScore(updatedSignals);
          const isLast = index === allSignals.length - 1;

          return {
            ...prev,
            signals: updatedSignals,
            signal_count: updatedSignals.length,
            risk_score: isLast ? sourceAnalysis.risk_score : score,
            risk_tier: isLast ? sourceAnalysis.risk_tier : tier,
            summary: isLast
              ? sourceAnalysis.summary
              : `Signal ${index + 1}/${allSignals.length} detected. Risk score: ${score}/10 (${tier}). Monitoring continues...`,
            recommended_action: isLast
              ? sourceAnalysis.recommended_action
              : `${updatedSignals.length} signal(s) accumulated. ${tier === 'LOW' ? 'Passive monitoring active.' : tier === 'MODERATE' ? 'Elevated watch. Additional signals required for escalation.' : 'Threat pattern emerging. Deep triage recommended.'}`,
          };
        });

        // End replay after last signal
        if (index === allSignals.length - 1) {
          setTimeout(() => {
            setIsLoading(false);
            setReplayMode(false);
          }, 1000);
        }
      }, 2000 * (index + 1)); // Each signal arrives 2 seconds after the previous

      replayTimersRef.current.push(timer);
    });
  }, []);

  // ── STANDARD SCAN HANDLER ──────────────────────────────────────────────
  // Delegates directly to handleReplayVendor to run the sequential animation for both mock and live data
  const handleScanVendor = async (vendorName) => {
    handleReplayVendor(vendorName);
  };

  const scrollToFeedSection = () => {
    const el = document.getElementById('live-feed');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // DJB2 hash helper for display purposes
  function generateMockHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash | 0;
    }
    return Math.abs(hash).toString(16).padEnd(32, 'a') + 'ef19';
  }

  return (
    <ErrorBoundary>
      <div className="relative min-h-screen bg-bg-primary text-text-primary antialiased selection:bg-brand-green selection:text-bg-primary overflow-x-hidden">
        
        {/* Sticky top navigation */}
        <NavBar />

        <main className="w-full flex flex-col">
          
          {/* SECTION 1 - HERO AREA */}
          <Hero 
            onScanVendor={handleScanVendor} 
            isLoading={isLoading}
            replayMode={replayMode}
            vendorData={vendorData} 
          />

          {/* SECTION 2 - MONITORED VENDOR DIRECTORY */}
          <VendorDirectory 
            onSelectVendor={handleReplayVendor}
            vendorData={vendorData}
          />

          {/* SECTION 3 - LIVE SIGNAL FEED */}
          <LiveSignalFeed />

          {/* SECTION 4 - HOW IT WORKS ARCHITECTURE */}
          <PipelineVisualizer />

          {/* SECTION 5 - RETROSPECTIVE BREACH VALIDATION */}
          <BreachValidation vendorData={vendorData} replayMode={replayMode} />

          {/* SECTION 6 - SIGNAL SOURCE PORTFOLIO CATALOG */}
          <SignalSourceCatalog />

          {/* SECTION 7 - COMPLIANCE MAPPINGS WALL */}
          <ComplianceWall />

          {/* SECTION 8 - EVIDENCE CRYPTOGRAPHIC ARTIFACT */}
          <EvidenceArtifact vendorData={vendorData} />

          {/* SECTION 9 - ROADMAP */}
          <PhaseTwo />

        </main>

        {/* FOOTER */}
        <Footer />

      </div>
    </ErrorBoundary>
  );
}
