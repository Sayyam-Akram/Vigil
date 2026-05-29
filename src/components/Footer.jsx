import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full bg-bg-primary py-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center justify-center space-y-3 text-center font-mono text-[10px] text-text-tertiary select-none">
        
        {/* Row 1 */}
        <div className="font-semibold uppercase tracking-wider text-text-secondary">
          VendorSentinel <span className="text-white/10">·</span> Third-Party Risk Intelligence <span className="text-white/10">·</span> v0.1.0
        </div>

        {/* Row 2 */}
        <div className="leading-relaxed opacity-75 max-w-2xl space-y-1">
          <div>
            Built at the Bright Data Hackathon 2026 <span className="text-white/10">·</span> Powered by Bright Data Infrastructure
          </div>
          <div>
            All telemetry and risk indicators are compiled exclusively from public web sources <span className="text-white/10">·</span> No private servers, staging repositories, or internal customer systems were accessed.
          </div>
        </div>

      </div>
    </footer>
  );
}
