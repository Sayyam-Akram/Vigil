import React from 'react';

export default function PhaseTwo() {
  const currentFeatures = [
    'Continuous vendor threat monitoring engine',
    'Monitored vendor directory with risk profiles',
    'Signal accumulation scoring (multi-day intelligence)',
    'Timeline replay for retrospective breach validation',
    'Layered AI pipeline (keyword → rule → LLM)',
    'Groq / Llama 3.3 70B deep risk analysis',
    'Live scan for unknown vendors',
    'Cryptographic PDF evidence report (Ed25519)',
    'DORA / SOC 2 / ISO 27001 compliance mapping',
    'Bright Data SERP + GitHub API + HIBP integration',
    'Retrospective Snowflake & Okta breach validation',
    'React 19 + FastAPI full-stack architecture'
  ];

  const plannedFeatures = [
    'Vendor onboarding & subscription management',
    'Organization dashboard (multi-vendor portfolio)',
    'Real-time Slack / Teams / Email alert delivery',
    'Dark web monitoring layer',
    'Historical trend scoring (30/60/90 day windows)',
    'API access for enterprise integration',
    'Vendor self-attestation portal',
    'CRM integration (Salesforce, HubSpot)',
    'NIS2 / EU AI Act compliance mapping',
    'Automated weekly vendor health digest'
  ];

  return (
    <section id="roadmap" className="max-w-7xl mx-auto w-full px-6 py-20 border-b border-white/5">
      <div className="flex flex-col space-y-12">
        
        {/* Section Header */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-2 text-brand-blue uppercase tracking-widest text-[10px] font-bold">
            <span>● ROADMAP · PHASE 2 COMMITMENTS</span>
          </div>
          <h2 className="font-serif italic text-3xl sm:text-4xl text-text-primary">
            v0.1.0 ships today. <span className="text-brand-blue">Here is what comes next.</span>
          </h2>
          <p className="font-mono text-xs text-text-secondary max-w-2xl leading-relaxed">
            This is v0.1.0 — built during the Bright Data Hackathon, May 2026. The detection engine works. The signals are real. The Snowflake retrospective validation is reproducible. What follows are honest commitments.
          </p>
        </div>

        {/* The Two-Column Feature Sheet */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* Ships in v0.1.0 */}
          <div className="bg-bg-surface border border-brand-green/10 rounded-xl p-6 shadow-xl space-y-6">
            <h3 className="font-mono text-xs font-bold text-brand-green uppercase tracking-widest border-b border-white/5 pb-3">
              ✓ Ships in v0.1.0
            </h3>
            
            <ul className="space-y-3 font-mono text-xs text-text-secondary">
              {currentFeatures.map((feat, idx) => (
                <li key={`v1-${idx}`} className="flex items-start gap-2.5">
                  <span className="text-brand-green font-bold shrink-0">✓</span>
                  <span className="leading-relaxed">{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Phase 2 Commitments */}
          <div className="bg-bg-surface border border-brand-blue/10 rounded-xl p-6 shadow-xl space-y-6">
            <h3 className="font-mono text-xs font-bold text-brand-blue uppercase tracking-widest border-b border-white/5 pb-3">
              ○ Phase 2 Commitments (Roadmapped)
            </h3>
            
            <ul className="space-y-3 font-mono text-xs text-text-secondary">
              {plannedFeatures.map((feat, idx) => (
                <li key={`v2-${idx}`} className="flex items-start gap-2.5">
                  <span className="text-brand-blue font-bold shrink-0">○</span>
                  <span className="leading-relaxed">{feat}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Version Stamp Metadata */}
        <div className="text-center font-mono text-[10px] text-text-tertiary pt-8 space-y-2 border-t border-white/5">
          <div className="text-text-secondary font-bold">Vigil v0.1.0</div>
          <div className="leading-relaxed">
            Built for the Bright Data Web Data UNLOCKED Hackathon · May 2026<br />
            Powered by Bright Data Infrastructure · Groq · FastAPI · React 19 · Tailwind CSS v3
          </div>
        </div>

      </div>
    </section>
  );
}
