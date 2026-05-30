import React, { useState, useEffect, useRef } from 'react';

export default function Hero({ onScanVendor, isLoading, vendorData, replayMode }) {
  const [targetInput, setTargetInput] = useState('');
  const [radarDots, setRadarDots] = useState([]);
  
  // Generate random dots on the radar circles
  useEffect(() => {
    const addRandomDot = () => {
      const severities = ['critical', 'high', 'medium'];
      const randomSeverity = severities[Math.floor(Math.random() * severities.length)];
      
      const centerX = 120;
      const centerY = 120;
      const angle = Math.random() * Math.PI * 2;
      const radius = 25 + Math.random() * 85; 
      
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      const newDot = {
        id: `dot_${Date.now()}_${Math.random()}`,
        x,
        y,
        severity: randomSeverity,
        timestamp: Date.now()
      };

      setRadarDots(prev => [...prev.filter(d => Date.now() - d.timestamp < 8000), newDot]);
    };

    const timeouts = [];
    for (let i = 0; i < 4; i++) {
      timeouts.push(setTimeout(addRandomDot, i * 1500));
    }

    const interval = setInterval(addRandomDot, 2000);
    return () => {
      clearInterval(interval);
      timeouts.forEach(clearTimeout);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (replayMode) return;
    if (!targetInput.trim() || isLoading) return;
    onScanVendor(targetInput.trim());
  };

  const getStatsColor = (tier) => {
    if (tier === 'CRITICAL') return 'text-brand-red';
    if (tier === 'HIGH') return 'text-brand-orange';
    return 'text-brand-yellow';
  };

  return (
    <section id="hero" className="relative min-h-screen flex flex-col justify-between pt-[52px] border-b border-white/5 overflow-hidden terminal-grid">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-brand-green/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-brand-orange/5 blur-3xl pointer-events-none" />

      {/* Main content grid */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 grid grid-cols-1 lg:grid-cols-12 items-center gap-12 py-12 z-10">
        
        {/* Left Side (60%) */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          <div className="flex items-center gap-2 text-brand-green uppercase tracking-widest text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
            ● VIGIL ACTIVE · VENDOR SECURITY PLATFORM
          </div>

          <h1 className="font-serif italic font-bold text-5xl sm:text-6xl lg:text-7xl text-text-primary leading-[1.05] tracking-tight">
            Know before<br />
            it becomes <span className="text-brand-green">news.</span>
          </h1>

          <p className="font-mono text-xs text-text-secondary max-w-xl leading-relaxed">
            Continuous threat intelligence that detects third-party security vulnerabilities before public disclosure. Powered by a collaborative swarm of 6 specialized autonomous cognitive agents.
          </p>

          {/* Multi-Agent Pill Indicators */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <span className="font-mono text-[9px] text-text-tertiary uppercase tracking-wider">
              Autonomous Swarm:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <span className="bg-white/5 border border-white/5 rounded-full px-2.5 py-0.5 font-mono text-[9px] text-text-secondary flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-brand-green" />
                Sentinel
              </span>
              <span className="bg-white/5 border border-white/5 rounded-full px-2.5 py-0.5 font-mono text-[9px] text-text-secondary flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-brand-blue" />
                Scout
              </span>
              <span className="bg-white/5 border border-white/5 rounded-full px-2.5 py-0.5 font-mono text-[9px] text-text-secondary flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-brand-yellow" />
                Extractor
              </span>
              <span className="bg-white/5 border border-white/5 rounded-full px-2.5 py-0.5 font-mono text-[9px] text-text-secondary flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-brand-orange" />
                Browser
              </span>
              <span className="bg-white/5 border border-white/5 rounded-full px-2.5 py-0.5 font-mono text-[9px] text-text-secondary flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-brand-red" />
                Analyst
              </span>
              <span className="bg-white/5 border border-white/5 rounded-full px-2.5 py-0.5 font-mono text-[9px] text-text-secondary flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-purple-500" />
                Compliance
              </span>
            </div>
          </div>

          {/* Interactive Search Console Input */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md w-full pt-2">
            <input 
              type="text" 
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              placeholder="Search vendor (e.g. Snowflake, Okta)..." 
              className="bg-bg-surface border border-white/10 rounded-lg px-4 py-3 font-mono text-xs text-text-primary focus:outline-none focus:border-brand-green/40 focus:ring-1 focus:ring-brand-green/20 flex-1 transition-all"
              disabled={isLoading}
            />
            <button 
              type="submit"
              disabled={isLoading || replayMode}
              className="bg-brand-green hover:bg-[#02e68f] text-bg-primary font-bold font-mono text-xs px-6 py-3 rounded-lg transition-all duration-200 disabled:opacity-50 hover:-translate-y-0.5"
            >
              {replayMode ? <span className="animate-pulse">REPLAYING TIMELINE...</span> : isLoading ? 'ANALYZING...' : 'ANALYZE VENDOR →'}
            </button>
          </form>

          {/* Inline guides */}
          <div className="font-mono text-[10px] text-text-tertiary leading-relaxed space-y-1 max-w-md">
            <div className="flex items-start gap-1.5">
              <span className="text-brand-green mt-0.5">🔍</span>
              <span><strong>Monitored Studies:</strong> Enter <span className="text-text-primary underline cursor-pointer hover:text-brand-green" onClick={() => setTargetInput('Snowflake')}>Snowflake</span> or <span className="text-text-primary underline cursor-pointer hover:text-brand-green" onClick={() => setTargetInput('Okta')}>Okta</span> to replay historical prediction timelines.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-brand-orange mt-0.5">⚡</span>
              <span><strong>Live Scan Swarm:</strong> Enter any other vendor to deploy the 6-agent real-time intelligence pipeline.</span>
            </div>
          </div>

          {/* Core Stats dynamically updated based on active vendor data */}
          <div className="flex items-center gap-8 py-4 border-t border-white/5 max-w-md">
            <div className="flex flex-col space-y-1">
              <span className="font-mono text-[10px] text-text-tertiary uppercase tracking-wider">
                ACTIVE TARGET:
              </span>
              <span className="font-mono font-bold text-sm text-text-primary">
                {vendorData.vendor || 'Snowflake'}
              </span>
            </div>

            <div className="h-8 w-[1px] bg-white/10" />

            <div className="flex flex-col space-y-1">
              <span className="font-mono text-[10px] text-text-tertiary uppercase tracking-wider">
                DYNAMIC RISK SCORE:
              </span>
              <span className={`font-mono font-bold text-sm ${getStatsColor(vendorData.risk_tier)}`}>
                {vendorData.risk_score || '8.1'} / 10
              </span>
            </div>

            <div className="h-8 w-[1px] bg-white/10" />

            <div className="flex flex-col space-y-1">
              <span className="font-mono text-[10px] text-text-tertiary uppercase tracking-wider">
                EVALUATION TIER:
              </span>
              <span className={`font-mono font-bold text-sm ${getStatsColor(vendorData.risk_tier)}`}>
                {vendorData.risk_tier || 'CRITICAL'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side (40%) - The Signal Radar */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-[300px] h-[300px] bg-bg-surface border border-white/5 rounded-full p-4 flex items-center justify-center shadow-[0_0_40px_rgba(0,0,0,0.5)]">
            
            {/* Concentric rings */}
            <div className="absolute inset-4 border border-white/5 rounded-full" />
            <div className="absolute inset-16 border border-white/5 rounded-full" />
            <div className="absolute inset-28 border border-white/5 rounded-full" />
            
            {/* Crosshairs */}
            <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-white/5" />
            <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-white/5" />

            {/* SVG sweep and dots overlay */}
            <svg 
              viewBox="0 0 240 240" 
              className="absolute inset-0 w-full h-full pointer-events-none"
            >
              <g className="origin-center animate-radar-sweep">
                <path 
                  d="M 120 120 L 120 0 A 120 120 0 0 1 204.85 204.85 Z" 
                  fill="url(#radarSweepGradient)" 
                  opacity="0.15"
                />
                <line x1="120" y1="120" x2="120" y2="0" stroke="var(--green)" strokeWidth="1.5" />
              </g>

              {radarDots.map((dot) => {
                const color = 
                  dot.severity === 'critical' ? 'var(--red)' : 
                  dot.severity === 'high' ? 'var(--orange)' : 
                  'var(--yellow)';
                  
                const age = Date.now() - dot.timestamp;
                const opacity = Math.max(0, 1 - age / 8000);

                return (
                  <g key={dot.id} style={{ opacity }}>
                    <circle 
                      cx={dot.x} 
                      cy={dot.y} 
                      r="7" 
                      fill="none" 
                      stroke={color} 
                      strokeWidth="1.5" 
                      className="animate-ping origin-center"
                      style={{ animationDuration: '2s' }}
                    />
                    <circle 
                      cx={dot.x} 
                      cy={dot.y} 
                      r="4.5" 
                      fill={color} 
                    />
                  </g>
                );
              })}

              <defs>
                <radialGradient id="radarSweepGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="var(--green)" stopOpacity="1" />
                  <stop offset="100%" stopColor="var(--green)" stopOpacity="0" />
                </radialGradient>
              </defs>
            </svg>

            <div className="w-1.5 h-1.5 rounded-full bg-brand-green z-20 shadow-[0_0_8px_var(--green)]" />
          </div>

          {/* Radar Legend */}
          <div className="mt-6 flex flex-col items-center space-y-2 text-center">
            <div className="flex items-center gap-4 text-[10px] uppercase font-bold tracking-widest font-mono">
              <span className="flex items-center gap-1.5 text-brand-red">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-red animate-pulse" />
                3 CRITICAL
              </span>
              <span className="flex items-center gap-1.5 text-brand-orange">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
                7 HIGH
              </span>
              <span className="flex items-center gap-1.5 text-brand-yellow">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow animate-pulse" />
                12 MEDIUM
              </span>
            </div>
            
            <div className="font-mono text-[9px] text-text-tertiary uppercase tracking-[0.18em]">
              MONITORING 6 SOURCES · CONTINUOUS SIGNAL INTELLIGENCE
            </div>
          </div>
        </div>

      </div>

      {/* Scrolling breach ticker */}
      <div className="w-full bg-bg-surface/50 border-t border-white/5 py-3 overflow-hidden select-none whitespace-nowrap">
        <div className="inline-flex animate-marquee">
          <div className="font-mono text-[11px] text-text-tertiary uppercase tracking-widest flex items-center shrink-0 pr-8">
            SNOWFLAKE · BREACH CONFIRMED JUN 2024 · 11 SIGNALS DETECTED 49 DAYS PRIOR
            <span className="mx-6 text-brand-green font-bold">··</span>
            OKTA · BREACH CONFIRMED OCT 2023 · SIGNALS VISIBLE ON TELEGRAM DAYS BEFORE
            <span className="mx-6 text-brand-green font-bold">··</span>
            SOLARWINDS · 9 MONTHS UNDETECTED · GITHUB PASSWORD EXPOSED NOV 2019
            <span className="mx-6 text-brand-green font-bold">··</span>
            CHANGE HEALTHCARE · 110M RECORDS · VENDOR RISK UNMONITORED
            <span className="mx-6 text-brand-green font-bold">··</span>
          </div>
          <div className="font-mono text-[11px] text-text-tertiary uppercase tracking-widest flex items-center shrink-0 pr-8">
            SNOWFLAKE · BREACH CONFIRMED JUN 2024 · 11 SIGNALS DETECTED 49 DAYS PRIOR
            <span className="mx-6 text-brand-green font-bold">··</span>
            OKTA · BREACH CONFIRMED OCT 2023 · SIGNALS VISIBLE ON TELEGRAM DAYS BEFORE
            <span className="mx-6 text-brand-green font-bold">··</span>
            SOLARWINDS · 9 MONTHS UNDETECTED · GITHUB PASSWORD EXPOSED NOV 2019
            <span className="mx-6 text-brand-green font-bold">··</span>
            CHANGE HEALTHCARE · 110M RECORDS · VENDOR RISK UNMONITORED
            <span className="mx-6 text-brand-green font-bold">··</span>
          </div>
        </div>
      </div>
    </section>
  );
}
