import React from 'react';
import { COMPLIANCE_ITEMS } from '../data/mockData';

export default function ComplianceWall() {
  const fullCount = COMPLIANCE_ITEMS.filter(item => item.status === 'FULL').length;
  const partialCount = COMPLIANCE_ITEMS.filter(item => item.status === 'PARTIAL').length;
  const phase2Count = COMPLIANCE_ITEMS.filter(item => item.status === 'PHASE 2').length;

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'FULL':
        return 'border-brand-green bg-brand-green-dim text-brand-green';
      case 'PARTIAL':
        return 'border-brand-yellow bg-brand-yellow-dim text-brand-yellow';
      default: // PHASE 2
        return 'border-brand-blue bg-white/5 text-brand-blue opacity-80';
    }
  };

  const getBorderColor = (status) => {
    switch (status) {
      case 'FULL':
        return 'border-l-brand-green';
      case 'PARTIAL':
        return 'border-l-brand-yellow';
      default: // PHASE 2
        return 'border-l-brand-blue';
    }
  };

  return (
    <section id="compliance" className="max-w-7xl mx-auto w-full px-6 py-20 border-b border-white/5">
      <div className="flex flex-col space-y-12">
        
        {/* Section Header */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-2 text-white/30 uppercase tracking-widest text-[10px] font-bold">
            <span>● COMPLIANCE · REGULATORY COVERAGE</span>
          </div>
          <h2 className="font-serif italic text-3xl sm:text-4xl text-text-primary">
            Built for the <span className="text-brand-blue">mandates that already exist.</span>
          </h2>
          <p className="font-mono text-xs text-text-secondary max-w-2xl leading-relaxed">
            DORA became mandatory for EU financial institutions in January 2025. SOC 2 Type II requires continuous third-party risk monitoring. VendorSentinel maps every signal and report straight to these frameworks.
          </p>
        </div>

        {/* 2-column compliance grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {COMPLIANCE_ITEMS.map((item, index) => (
            <div 
              key={`${item.framework}-${item.control}-${index}`}
              className={`bg-bg-surface border border-white/5 border-l-4 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl hover:bg-bg-elevated transition-colors duration-200 ${getBorderColor(item.status)}`}
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-xs text-text-primary font-bold">{item.framework}</span>
                  <span className="text-[10px] text-text-tertiary">{item.control}</span>
                </div>
                <p className="font-mono text-[11px] text-text-secondary leading-relaxed truncate">
                  {item.description}
                </p>
              </div>

              {/* Status pill */}
              <div className="shrink-0 flex items-center">
                <span className={`px-2 py-0.5 rounded border text-[9px] font-bold tracking-widest uppercase font-mono ${getStatusBadgeStyle(item.status)}`}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Honest coverage summary footer */}
        <div className="bg-bg-surface border border-white/5 rounded-xl p-6 font-mono text-xs text-text-secondary flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
          <div className="space-y-1">
            <span className="text-[10px] text-text-tertiary uppercase tracking-widest font-bold block">COVERAGE METRIC INDEX</span>
            <div className="flex gap-4">
              <span className="text-brand-green font-bold">{fullCount} FULL MAPPINGS</span>
              <span className="text-brand-yellow font-bold">{partialCount} PARTIAL REGISTERS</span>
              <span className="text-brand-blue font-bold">{phase2Count} ROADMAPPED TIER II</span>
            </div>
          </div>
          
          <div className="max-w-md text-[10px] leading-relaxed text-text-tertiary border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
            We maintain total transparency regarding regulatory tracking gaps: identical compliance states are compiled directly into the cryptographic Evidence RIA PDF. Partial and Phase 2 items are clearly scheduled, never claimed as complete.
          </div>
        </div>

      </div>
    </section>
  );
}
