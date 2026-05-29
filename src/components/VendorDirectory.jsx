import React from 'react';

const MONITORED_VENDORS = [
  {
    name: 'Snowflake',
    risk_score: 8.1,
    risk_tier: 'CRITICAL',
    signal_count: 11,
    monitoring_since: 'Apr 2024',
    status: 'MONITORED',
    breach_context: 'Credential-stuffing breach affecting 165 companies'
  },
  {
    name: 'Okta',
    risk_score: 6.8,
    risk_tier: 'HIGH',
    signal_count: 8,
    monitoring_since: 'Sep 2023',
    status: 'MONITORED',
    breach_context: 'Support system breach via session token theft'
  }
];

const TIER_COLORS = {
  CRITICAL: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  HIGH: { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
};

export default function VendorDirectory({ onSelectVendor, vendorData }) {
  return (
    <section id="directory" className="max-w-7xl mx-auto w-full px-6 py-20 border-b border-white/5">
      <div className="flex flex-col space-y-12">

        {/* Section Header */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-2 text-brand-green uppercase tracking-widest text-[10px] font-bold">
            <span>● VENDOR DIRECTORY · MONITORED VENDORS</span>
          </div>
          <h2 className="font-serif italic text-3xl sm:text-4xl text-text-primary">
            Verified vendors. Continuously <span className="text-brand-green">watched.</span>
          </h2>
          <p className="font-mono text-xs text-text-secondary max-w-2xl leading-relaxed">
            These vendors are actively monitored by Vigil. Signals are tracked continuously and escalated when threat patterns emerge.
          </p>
        </div>

        {/* Vendor Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Monitored Vendor Cards */}
          {MONITORED_VENDORS.map((vendor) => {
            const tierColor = TIER_COLORS[vendor.risk_tier] || TIER_COLORS.HIGH;
            return (
              <div
                key={vendor.name}
                className="group bg-bg-surface border border-white/5 rounded-xl p-6 shadow-xl flex flex-col justify-between space-y-5 transition-all duration-300 hover:-translate-y-1 hover:border-brand-green/30 hover:shadow-brand-green/5"
              >
                {/* Header: Name + Status Badge */}
                <div className="flex items-start justify-between">
                  <h3 className="font-serif italic text-2xl text-text-primary">{vendor.name}</h3>
                  <div className="flex items-center gap-1.5 bg-brand-green/10 border border-brand-green/20 rounded-full px-2.5 py-0.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-green"></span>
                    </span>
                    <span className="font-mono text-[9px] font-bold text-brand-green uppercase tracking-wider">
                      {vendor.status}
                    </span>
                  </div>
                </div>

                {/* Breach Context */}
                <p className="font-mono text-[11px] text-text-tertiary leading-relaxed">
                  {vendor.breach_context}
                </p>

                {/* Metrics Row */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Risk Score */}
                  <div className="bg-bg-primary/50 rounded-lg p-3 border border-white/5">
                    <div className="font-mono text-[9px] text-text-tertiary uppercase tracking-wider mb-1">Risk Score</div>
                    <div className={`font-mono text-xl font-bold ${tierColor.text}`}>{vendor.risk_score}</div>
                  </div>
                  {/* Risk Tier */}
                  <div className="bg-bg-primary/50 rounded-lg p-3 border border-white/5">
                    <div className="font-mono text-[9px] text-text-tertiary uppercase tracking-wider mb-1">Risk Tier</div>
                    <span className={`inline-block font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${tierColor.bg} ${tierColor.text} ${tierColor.border} border`}>
                      {vendor.risk_tier}
                    </span>
                  </div>
                  {/* Signal Count */}
                  <div className="bg-bg-primary/50 rounded-lg p-3 border border-white/5">
                    <div className="font-mono text-[9px] text-text-tertiary uppercase tracking-wider mb-1">Signals</div>
                    <div className="font-mono text-xl font-bold text-text-primary">{vendor.signal_count}</div>
                  </div>
                  {/* Monitoring Period */}
                  <div className="bg-bg-primary/50 rounded-lg p-3 border border-white/5">
                    <div className="font-mono text-[9px] text-text-tertiary uppercase tracking-wider mb-1">Monitoring</div>
                    <div className="font-mono text-xs text-text-secondary">Since {vendor.monitoring_since}</div>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => onSelectVendor?.(vendor.name)}
                  className="w-full mt-auto font-mono text-xs font-bold uppercase tracking-wider py-2.5 rounded-lg border border-brand-green/20 text-brand-green bg-brand-green/5 hover:bg-brand-green/10 transition-colors duration-200 cursor-pointer"
                >
                  View Timeline →
                </button>
              </div>
            );
          })}

          {/* Placeholder Card */}
          <div className="bg-bg-surface/50 border-2 border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center justify-center space-y-4 text-center min-h-[320px]">
            <span className="text-4xl opacity-40">🔒</span>
            <h3 className="font-serif italic text-xl text-text-tertiary">Your Vendor</h3>
            <p className="font-mono text-[11px] text-text-tertiary/60 leading-relaxed max-w-[200px]">
              Coming in V2 — Vendors can onboard for continuous monitoring
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
