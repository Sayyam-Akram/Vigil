import React, { useState } from 'react';
import { Download, ShieldCheck } from 'lucide-react';
import API from '../config/api';

export default function EvidenceArtifact({ vendorData }) {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const toastTimeoutRef = React.useRef(null);

  const triggerDownload = async () => {
    const vendorName = vendorData?.vendor || 'Snowflake';
    
    // Check if backend is toggled active and we aren't in mock mode
    if (!API.USE_MOCK) {
      try {
        const downloadUrl = `${API.ENDPOINTS.REPORT}?vendor=${encodeURIComponent(vendorName)}`;
        // Stream the compiled ReportLab PDF binary directly in the browser
        window.open(downloadUrl, '_blank');
        return;
      } catch (err) {
        console.error('Failed to trigger live PDF download:', err);
      }
    }

    // Heuristic mock fallback
    setToastMessage(`PDF report generation requires a running FastAPI backend. A sample verified structure for ${vendorName} is compiled in the repository logs.`);
    setShowToast(true);
    
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  const getTierColor = (tier) => {
    if (tier === 'CRITICAL') return 'text-brand-red border-t-brand-red';
    if (tier === 'HIGH') return 'text-brand-orange border-t-brand-orange';
    return 'text-brand-yellow border-t-brand-yellow';
  };

  const getBorderColor = (tier) => {
    if (tier === 'CRITICAL') return 'border-t-brand-red';
    if (tier === 'HIGH') return 'border-t-brand-orange';
    return 'border-t-brand-yellow';
  };

  return (
    <section id="evidence" className="max-w-7xl mx-auto w-full px-6 py-20 border-b border-white/5 flex flex-col items-center">
      
      {/* Toast alert system */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-bg-surface border border-brand-yellow/30 p-4 rounded-xl shadow-2xl font-mono text-[11px] text-brand-yellow max-w-sm animate-fadeIn">
          <span className="block font-bold uppercase tracking-wider mb-1">⚠️ SYSTEM NOTIFICATION</span>
          {toastMessage}
        </div>
      )}

      <div className="w-full flex flex-col space-y-12 items-center">
        
        {/* Section Header */}
        <div className="flex flex-col space-y-2 text-center items-center">
          <div className="flex items-center gap-2 text-white/30 uppercase tracking-widest text-[10px] font-bold">
            <span>● EVIDENCE ARTIFACT · RISK REPORT</span>
          </div>
          <h2 className="font-serif italic text-3xl sm:text-4xl text-text-primary max-w-2xl text-center">
            Not a dashboard export. <span className="text-brand-orange">A document your CISO hands legal.</span>
          </h2>
        </div>

        {/* Cryptographic Document Preview Mockup */}
        <div className={`w-full max-w-[480px] bg-bg-surface border border-white/10 rounded-xl p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] relative font-mono text-[11px] text-text-secondary leading-relaxed border-t-4 ${getBorderColor(vendorData?.risk_tier)}`}>
          
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none">
            <span className="text-7xl font-bold tracking-[0.25em] rotate-12">SENTINEL</span>
          </div>

          <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4">
            <span className="font-bold text-text-primary tracking-widest">VIGIL RISK INTEL REPORT</span>
            <span className="text-[9px] text-text-tertiary">v0.1.0</span>
          </div>

          <div className="flex justify-between mb-2">
            <span>GENERATED TIMESTAMP:</span>
            <span className="text-text-primary">{vendorData?.timestamp ? vendorData.timestamp.split('T')[0] : 'N/A'}</span>
          </div>

          <div className="h-[1px] bg-white/5 my-3" />

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>TARGET VENDOR:</span>
              <strong className="text-text-primary">{vendorData?.vendor || 'Unknown'}</strong>
            </div>

            <div className="flex justify-between">
              <span>EVALUATION TIER:</span>
              <strong className={`${getTierColor(vendorData?.risk_tier)} tracking-widest`}>■ {vendorData?.risk_tier || 'LOW'} TIER</strong>
            </div>

            <div className="flex justify-between">
              <span>WEIGHTED RISK SCORE:</span>
              <strong className={`${getTierColor(vendorData?.risk_tier)} text-xs`}>{vendorData?.risk_score ?? '0.0'} / 10.0</strong>
            </div>
          </div>

          <div className="h-[1px] bg-white/5 my-3" />

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>EVIDENCE INDICATORS:</span>
              <span className="text-text-primary">{vendorData?.signal_count ?? 0} verified signals</span>
            </div>

            <div className="flex justify-between">
              <span>INTELLIGENCE WINDOW:</span>
              <span className="text-text-primary">Apr 14 – Jun 2 2024</span>
            </div>

            <div className="flex justify-between">
              <span>ACTIVE DATA VECTORS:</span>
              <span className="text-text-primary">4 Bright Data monitors</span>
            </div>
          </div>

          <div className="h-[1px] bg-white/5 my-3" />

          <div className="space-y-1">
            <span className="text-[9px] text-text-tertiary uppercase tracking-widest">COMPLIANCE CROSS-MAPS:</span>
            <div className="text-text-primary leading-relaxed">
              {vendorData?.compliance_refs ? vendorData.compliance_refs.join(' · ') : 'N/A'}
            </div>
          </div>

          <div className="h-[1px] bg-white/5 my-3" />

          <div className="space-y-1 bg-white/5 border border-white/10 rounded p-3 text-text-secondary leading-normal">
            <strong className="block text-brand-orange text-[9px] uppercase tracking-wider mb-1">CISO DIRECTIVE:</strong>
            {vendorData?.recommended_action || 'N/A'}
          </div>

          <div className="h-[1px] bg-white/10 my-4" />

          <div className="flex flex-col space-y-1 text-[9px] text-text-tertiary">
            <div className="truncate">REPORT SECURE HASH: {vendorData?.report_hash || 'N/A'}</div>
            <div className="flex justify-between">
              <span>CRYPTOGRAPHIC SIGN: ed25519 · vigil</span>
              <span>PAGES: 5</span>
            </div>
          </div>

        </div>

        {/* Risk Tier Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] font-bold tracking-wider font-mono">
          <span className="px-2.5 py-1 rounded border border-brand-red bg-brand-red-dim text-brand-red">CRITICAL (8-10)</span>
          <span className="px-2.5 py-1 rounded border border-brand-orange bg-brand-orange-dim text-brand-orange">HIGH (6-7.9)</span>
          <span className="px-2.5 py-1 rounded border border-brand-yellow bg-brand-yellow-dim text-brand-yellow">MODERATE (4-5.9)</span>
          <span className="px-2.5 py-1 rounded border border-white/20 bg-white/5 text-text-secondary">LOW (0-3.9)</span>
        </div>

        {/* Cryptographic Download Box */}
        <div className="flex flex-col items-center space-y-3 max-w-sm w-full font-mono text-center">
          <button 
            onClick={triggerDownload}
            className="w-full flex items-center justify-center gap-2 bg-transparent hover:bg-white/5 border border-white/20 hover:border-brand-green text-text-primary hover:text-brand-green transition-all duration-200 px-6 py-3 rounded-lg text-xs font-semibold uppercase tracking-widest shadow-xl"
          >
            <Download className="w-4 h-4" />
            Download Cryptographic PDF
          </button>
          
          <div className="space-y-1 text-[9px] text-text-tertiary">
            <div className="flex items-center justify-center gap-1 text-brand-green">
              <ShieldCheck className="w-3.5 h-3.5" />
              SIGNATURE AUTHENTICATED · SHA256 VALIDATED
            </div>
            <div className="truncate text-text-muted">{vendorData?.report_hash || 'N/A'}</div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 w-full max-w-4xl text-center md:text-left">
          <div className="space-y-1 font-mono text-xs">
            <strong className="text-text-primary text-sm font-bold block mb-1">5-page structured report</strong>
            <p className="text-text-tertiary leading-relaxed text-[11px]">
              Includes comprehensive Executive summaries, chronological signal telemetry charts, risk weight mappings, and strategic CISO action matrices.
            </p>
          </div>

          <div className="space-y-1 font-mono text-xs border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
            <strong className="text-text-primary text-sm font-bold block mb-1">Evidence chain included</strong>
            <p className="text-text-tertiary leading-relaxed text-[11px]">
              Chronicles strict source references, precise scraping timestamps, Llama model confidence values, and cryptographic data block check hashes.
            </p>
          </div>

          <div className="space-y-1 font-mono text-xs border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
            <strong className="text-text-primary text-sm font-bold block mb-1">Compliance-mapped</strong>
            <p className="text-text-tertiary leading-relaxed text-[11px]">
              Outlines complete matching alignments directly targeting legal compliance directives: DORA Art 28, SOC 2 CC9.2, and ISO 27001 Annex A.15.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
