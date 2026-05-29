import React from 'react';
import { SOURCE_CATALOG } from '../data/mockData';

export default function SignalSourceCatalog() {
  return (
    <section id="catalog" className="max-w-7xl mx-auto w-full px-6 py-20 border-b border-white/5">
      <div className="flex flex-col space-y-12">
        
        {/* Section Header */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-2 text-brand-green uppercase tracking-widest text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
            ● SCOUT LAYER · SIGNAL SOURCE CATALOG
          </div>
          <h2 className="font-serif italic text-3xl sm:text-4xl text-text-primary">
            Four sources. <span className="text-brand-green">Every block bypassed.</span> Bright Data infrastructure.
          </h2>
        </div>

        {/* 2x2 Grid of Source Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {SOURCE_CATALOG.map((source) => (
            <div 
              key={source.id} 
              className="bg-bg-surface border border-white/5 hover:border-brand-green/20 rounded-xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden transition-all duration-300 group"
            >
              {/* Pulsing Status in Top Corner */}
              <div className="absolute top-6 right-6 flex items-center gap-1.5 text-[9px] font-bold tracking-widest font-mono text-brand-green">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
                {source.status}
              </div>

              {/* Header and Details */}
              <div className="space-y-4">
                <div className="space-y-1 font-mono">
                  <span className="text-[10px] text-text-tertiary uppercase tracking-wider block">SOURCE CLASSIFICATION</span>
                  <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider group-hover:text-brand-green transition-colors">
                    {source.title}
                  </h3>
                </div>

                <div className="font-mono text-xs text-text-secondary leading-relaxed space-y-2">
                  <div>
                    <span className="text-text-tertiary font-semibold uppercase">API PATHWAYS: </span>
                    <span className="text-text-primary font-bold">{source.source_type}</span>
                  </div>
                  <div>
                    <span className="text-text-tertiary font-semibold uppercase">TARGET SIGNALS: </span>
                    <span className="text-brand-blue">{source.signal_types}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-text-secondary pt-2 border-t border-white/5">
                    {source.description}
                  </p>
                </div>
              </div>

              {/* Bottom statistics & custom Bright Data technical boxes */}
              <div className="mt-6 space-y-4">
                {/* Micro tech metrics bar */}
                <div className="grid grid-cols-3 gap-2 font-mono text-[9px] text-text-tertiary border-y border-white/5 py-2">
                  <div>
                    <span className="block font-semibold uppercase">LAST ALERT</span>
                    <span className="text-text-secondary font-bold">{source.last_signal}</span>
                  </div>
                  <div>
                    <span className="block font-semibold uppercase">SCAN FREQUENCY</span>
                    <span className="text-text-secondary font-bold">{source.rate}</span>
                  </div>
                  <div>
                    <span className="block font-semibold uppercase">BRIGHT DATA TOOL</span>
                    <span className="text-brand-yellow font-bold uppercase">{source.bright_data_tool.split(' ')[0]}</span>
                  </div>
                </div>

                {/* Example Output box */}
                <div className="font-mono text-[10px] bg-bg-primary/50 border border-white/5 rounded p-3 text-text-secondary">
                  <span className="block font-bold text-text-tertiary uppercase tracking-widest text-[8px] mb-1">REAL-TIME SIGNAL EXAMPLE</span>
                  "{source.example}"
                </div>

                {/* Why Bright Data Callout Box */}
                <div className="bg-brand-green-dim border border-brand-green/20 rounded p-3 font-mono text-[10px] text-text-secondary leading-normal">
                  <strong className="block text-brand-green text-[9px] uppercase tracking-wider mb-1">LOAD-BEARING SCRAPE VERIFICATION</strong>
                  {source.why_bright_data}
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
