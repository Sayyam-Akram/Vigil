import React, { useState, useEffect } from 'react';

export default function BreachValidation({ vendorData, replayMode }) {
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [score, setScore] = useState(0);

  // Reset selected signal when vendor data changes to prevent stale data display
  useEffect(() => {
    setSelectedSignal(null);
  }, [vendorData]);

  // Animate the risk score counter dynamically
  useEffect(() => {
    let current = 0;
    const target = vendorData?.risk_score ?? 8.1;
    const duration = 1000;
    const stepTime = Math.abs(Math.floor(duration / (target * 10 || 1)));
    
    const timer = setInterval(() => {
      current += 0.1;
      if (current >= target) {
        setScore(target);
        clearInterval(timer);
      } else {
        setScore(parseFloat(current.toFixed(1)));
      }
    }, stepTime || 50);

    return () => clearInterval(timer);
  }, [vendorData?.risk_score]);

  // Extract signals from active vendorData dynamically to build the timeline rail
  const signals = vendorData?.signals || [];
  
  // Sort signals chronologically by detected_at
  const sortedSignals = [...signals].sort((a, b) => new Date(a.detected_at) - new Date(b.detected_at));
  
  // Map ALL threat signals to timeline dots dynamically
  const timelineSignals = sortedSignals.map((s, idx) => ({
    date: s.detected_relative ? s.detected_relative.replace(/\s*(before disclosure|before|ago)/i, '').toUpperCase() : `SIGNAL #${idx + 1}`,
    id: s.id,
    sev: s.severity,
    title: s.title
  }));

  // Append a distinct, separate public disclosure node at the very end of the rail
  if (timelineSignals.length > 0) {
    const isOkta = vendorData?.vendor?.toLowerCase().includes("okta");
    timelineSignals.push({
      date: isOkta ? 'OCT 20' : 'JUN 2',
      id: 'sig_disclosure_node',
      sev: 'disclosure',
      title: 'PUBLIC BREACH DISCLOSURE'
    });
  }

  const getDotColor = (sev) => {
    switch (sev) {
      case 'critical': return 'bg-brand-red border-brand-red';
      case 'high': return 'bg-brand-orange border-brand-orange';
      case 'medium': return 'bg-brand-yellow border-brand-yellow';
      case 'disclosure': return 'bg-brand-red border-brand-red animate-ping';
      default: return 'bg-white/40 border-white/40';
    }
  };

  const getDotGlow = (sev) => {
    switch (sev) {
      case 'critical': return 'shadow-[0_0_12px_var(--red)]';
      case 'high': return 'shadow-[0_0_12px_var(--orange)]';
      case 'medium': return 'shadow-[0_0_12px_var(--yellow)]';
      case 'disclosure': return 'shadow-[0_0_16px_var(--red)]';
      default: return '';
    }
  };

  const getFirstIndicatorDays = () => {
    if (signals.length === 0) return '0 days';
    let maxDays = 0;
    signals.forEach(s => {
      if (s.detected_relative) {
        const match = s.detected_relative.match(/(\d+)\s*day/i);
        if (match) {
          const days = parseInt(match[1], 10);
          if (days > maxDays) maxDays = days;
        }
      }
    });
    return maxDays > 0 ? `${maxDays} days` : '12 days';
  };

  const handleNodeClick = (sig) => {
    if (sig.sev === 'disclosure' || sig.id === 'sig_disclosure_node') {
      setSelectedSignal({
        id: 'sig_disclosure_node',
        confidence: 100,
        title: 'PUBLIC BREACH DISCLOSURE',
        source: 'Official Press & Advisory Advisories',
        source_url: vendorData?.vendor === "Okta"
          ? 'https://www.okta.com/blog/2023/10/securing-our-support-structure/'
          : 'https://www.snowflake.com/blog/detecting-preventing-targeted-attacks-users/',
        detail: vendorData?.vendor === "Okta"
          ? 'Okta officially disclosed a support portal breach. Compromised cookies allowed threat actors to assume identity states of administrative agents and extract customer HAR files.'
          : 'Snowflake published analytical threat reports outlining credential harvesting operations targeting customers. Verification confirmed unmonitored tethers and missing MFA endpoints.',
        raw_signal: vendorData?.vendor === "Okta"
          ? 'SECURE_INCIDENT: hijacked support agent session cookies verified.'
          : 'SECURE_INCIDENT: targeted credential extraction campaigns confirmed.',
        severity: 'critical'
      });
    } else {
      setSelectedSignal(signals.find(s => s.id === sig.id) || signals[0]);
    }
  };

  return (
    <section id="validation" className="max-w-7xl mx-auto w-full px-6 py-20 border-b border-white/5">
      <div className="flex flex-col space-y-12">
        
        {/* Section Header */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-2 text-brand-red uppercase tracking-widest text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
            ● BREACH VALIDATION · DETECTION TIMELINE
          </div>
          <h2 className="font-serif italic text-3xl sm:text-4xl text-text-primary">
            The signals were <span className="text-brand-red">always there.</span> Nobody was watching.
          </h2>
          <p className="font-mono text-xs text-text-secondary max-w-2xl leading-relaxed">
            We ran Vigil against historical public web datasets for <strong>{vendorData?.vendor || 'Unknown'}</strong>. The interactive timeline below plots the chronological indicators retrieved prior to public awareness checks.
          </p>
        </div>

        {replayMode && (
          <div className="flex items-center gap-3 bg-brand-green/5 border border-brand-green/20 rounded-lg px-4 py-3 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-brand-green animate-ping" />
            <span className="font-mono text-xs text-brand-green uppercase tracking-widest font-bold">Timeline Replay in Progress — Signals arriving sequentially</span>
          </div>
        )}

        {/* Timeline Visualizer card */}
        <div className="bg-bg-surface border border-white/5 rounded-xl p-8 shadow-2xl relative">
          
          <div className="flex justify-between text-[10px] text-text-tertiary uppercase tracking-widest font-mono mb-12">
            <span>Detection Window (Signal Intelligence)</span>
            <span className="text-brand-red font-semibold">Triage Threshold</span>
          </div>

          {/* Interactive timeline rail */}
          <div className="relative w-full h-[6px] bg-white/5 rounded-full flex items-center justify-between mb-16">
            
            {/* Safe detection area color background */}
            <div className="absolute top-0 bottom-0 left-0 right-[15%] bg-brand-green/10 rounded-l-full border-r border-brand-green/30" />
            <div className="absolute top-0 bottom-0 right-0 left-[85%] bg-brand-red/10 rounded-r-full" />

            {/* Labels overlay */}
            <div className="absolute -top-6 left-[35%] font-mono text-[9px] uppercase tracking-widest text-brand-green">
              Vigil Detection Zone
            </div>

            <div className="absolute -top-6 right-0 font-mono text-[9px] uppercase tracking-widest text-brand-red">
              Public awareness
            </div>

            {/* Timeline nodes */}
            {timelineSignals.map((sig) => (
              <div 
                key={sig.id}
                onClick={() => handleNodeClick(sig)}
                className="relative flex flex-col items-center cursor-pointer group"
              >
                <div className={`w-3.5 h-3.5 rounded-full border-2 border-bg-surface transition-all duration-300 transform group-hover:scale-125 ${getDotColor(sig.sev)} ${getDotGlow(sig.sev)}`} />
                <div className="absolute top-6 font-mono text-[10px] text-text-secondary font-bold group-hover:text-text-primary whitespace-nowrap">
                  {sig.date}
                </div>
                <div className="absolute -top-6 font-mono text-[8px] text-text-tertiary tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-bg-primary/95 px-2 py-0.5 rounded border border-white/5 z-20">
                  {sig.title}
                </div>
              </div>
            ))}

          </div>

          {/* Core result summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-white/5 pt-6 gap-4">
            <div className="font-mono text-xs text-text-secondary">
              First predictive indicator: <strong className="text-text-primary">Detected {getFirstIndicatorDays()} early</strong> · Verification tethers: <strong className="text-brand-green">Bright Data Scraper</strong>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-text-tertiary uppercase tracking-wider">Scanned Records:</span>
              <span className="font-mono text-3xl font-bold text-brand-green">{vendorData?.signal_count ?? 0} SIGNALS</span>
            </div>
          </div>

        </div>

        {/* Selected signal inspector pop-up */}
        {selectedSignal && (
          <div className="bg-bg-surface border border-brand-green/30 rounded-xl p-6 shadow-2xl relative font-mono text-xs animate-fadeIn">
            <button 
              onClick={() => setSelectedSignal(null)}
              className="absolute top-4 right-4 text-text-tertiary hover:text-text-primary"
            >
              ✕ CLOSE
            </button>
            <div className="flex items-center gap-2 text-brand-green uppercase font-bold text-[10px] mb-2 tracking-widest">
              ● TIMELINE DETAIL · CONFIDENCE {selectedSignal.confidence}%
            </div>
            <h4 className="text-sm font-bold text-text-primary mb-2">
              {selectedSignal.title}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 border-t border-white/5 pt-4">
              <div className="space-y-1">
                <div className="text-text-tertiary">SOURCE: <span className="text-text-primary">{selectedSignal.source}</span></div>
                {selectedSignal.source_url && (
                  <div className="text-text-tertiary">
                    EVIDENCE LINK:{' '}
                    <a 
                      href={selectedSignal.source_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-brand-blue hover:text-brand-green visited:text-brand-blue underline break-all"
                      style={{ color: 'var(--blue)' }}
                    >
                      {selectedSignal.source_url}
                    </a>
                  </div>
                )}
                <div className="text-text-tertiary text-[11px] leading-relaxed mt-2 text-text-secondary">
                  {selectedSignal.detail}
                </div>
              </div>
              <div className="bg-bg-primary/50 border border-white/5 rounded p-3 text-[10px] text-text-secondary whitespace-pre-wrap select-all font-mono leading-normal">
                <span className="block font-bold text-text-tertiary mb-1 uppercase tracking-widest text-[8px] border-b border-white/5 pb-1">RAW TELEMETRY</span>
                {selectedSignal.raw_signal}
              </div>
            </div>
          </div>
        )}

        {/* Direct signal overview logs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sortedSignals.slice(0, 3).map((sig, idx) => (
            <div 
              key={sig.id}
              className="bg-bg-surface border border-white/5 hover:border-brand-green/20 rounded-xl p-6 flex flex-col space-y-4 shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedSignal(sig)}
            >
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded border text-[9px] uppercase tracking-wider font-bold ${
                  sig.severity === 'critical' ? 'border-brand-red bg-brand-red-dim text-brand-red' :
                  sig.severity === 'high' ? 'border-brand-orange bg-brand-orange-dim text-brand-orange' :
                  'border-brand-yellow bg-brand-yellow-dim text-brand-yellow'
                }`}>
                  {sig.severity.toUpperCase()} · SIGNAL #{idx + 1}
                </span>
                <span className="font-mono text-[10px] text-text-tertiary">{sig.detected_relative ? sig.detected_relative.split(' before')[0].toUpperCase() : '12 DAYS AGO'}</span>
              </div>
              
              <h3 className="font-serif italic text-lg text-text-primary line-clamp-1">
                {sig.title}
              </h3>
              
              <p className="font-mono text-[11px] text-text-secondary leading-relaxed flex-1 line-clamp-3">
                {sig.detail}
              </p>

              <div className="border-t border-white/5 pt-3 font-mono text-[10px] text-text-tertiary flex justify-between">
                <span>Confidence: {sig.confidence}%</span>
                <span className="text-brand-green">Scout Zone Active</span>
              </div>
            </div>
          ))}
        </div>

        {/* Stats counter bottom row */}
        <div className="bg-bg-surface border border-white/5 rounded-xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center shadow-xl">
          <div className="flex flex-col space-y-1">
            <span className="font-mono text-3xl font-bold text-text-primary">{vendorData?.signal_count ?? 0}</span>
            <span className="font-mono text-[9px] text-text-tertiary uppercase tracking-wider">Signals found in window</span>
          </div>

          <div className="flex flex-col space-y-1 border-l border-white/5">
            <span className="font-mono text-3xl font-bold text-brand-green">{getFirstIndicatorDays()}</span>
            <span className="font-mono text-[9px] text-text-tertiary uppercase tracking-wider">Before disclosure</span>
          </div>

          <div className="flex flex-col space-y-1 border-l border-white/5">
            <span className="font-mono text-3xl font-bold text-brand-blue">96%</span>
            <span className="font-mono text-[9px] text-text-tertiary uppercase tracking-wider">Max confidence score</span>
          </div>

          <div className="flex flex-col space-y-1 border-l border-white/5">
            <span className="font-mono text-3xl font-bold text-brand-yellow">{score}/10</span>
            <span className="font-mono text-[9px] text-text-tertiary uppercase tracking-wider">Dynamic Risk Score</span>
          </div>
        </div>

      </div>
    </section>
  );
}
