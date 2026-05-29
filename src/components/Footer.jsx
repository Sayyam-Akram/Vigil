import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full bg-bg-primary py-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center justify-center space-y-3 text-center font-mono text-[10px] text-text-tertiary select-none">
        
        {/* Row 1 */}
        <div className="font-semibold uppercase tracking-wider text-text-secondary">
          Vigil <span className="text-white/10">·</span> Vendor Security Platform <span className="text-white/10">·</span> v0.1.0
        </div>

        {/* Row 2 */}
        <div className="leading-relaxed opacity-75 max-w-2xl space-y-1">
          <div>
            Built at the Bright Data Hackathon 2026 <span className="text-white/10">·</span> Powered by Bright Data Infrastructure
          </div>
        </div>

        {/* Row 3 */}
        <div className="leading-relaxed opacity-75 max-w-2xl">
          All telemetry and risk indicators are compiled exclusively from public web sources <span className="text-white/10">·</span> No private servers, staging repositories, or internal customer systems were accessed.
        </div>

        {/* Row 4 */}
        <div className="leading-relaxed opacity-60 pt-2 border-t border-white/5">
          © 2026 Sayyam Akram <span className="text-white/10">·</span> Concept, Architecture & Engineering <span className="text-white/10">·</span> All Rights Reserved
        </div>

      </div>
    </footer>
  );
}
