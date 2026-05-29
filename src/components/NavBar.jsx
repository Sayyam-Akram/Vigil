import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';

const SECTIONS = [
  'hero',
  'live-feed',
  'pipeline',
  'validation',
  'catalog',
  'compliance',
  'evidence',
  'roadmap'
];

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      // Check if scrolled past hero (approx 300px)
      if (window.scrollY > 80) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      // Check active section
      for (const section of SECTIONS) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom >= 120) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScanClick = () => {
    const el = document.getElementById('live-feed');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      // Dispatch a custom event to trigger scanner loading state in LiveSignalFeed
      window.dispatchEvent(new CustomEvent('trigger-mock-scan'));
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 h-[52px] flex items-center justify-between px-6 transition-all duration-300 backdrop-blur-md border-b bg-bg-primary/80 ${
      scrolled ? 'border-brand-green/30' : 'border-white/5'
    }`}>
      {/* Brand */}
      <div className="flex items-center gap-2">
        <Shield className="w-5 h-5 text-brand-green fill-brand-green/10" />
        <span className="font-mono text-sm font-bold tracking-widest text-text-primary">
          VENDORSENTINEL
        </span>
        <span className="font-mono text-[10px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-text-tertiary">
          v0.1.0
        </span>
      </div>

      {/* Center navigation dots */}
      <div className="hidden md:flex items-center gap-3">
        {SECTIONS.map((sec) => (
          <a
            key={sec}
            href={`#${sec}`}
            title={sec.toUpperCase().replace('-', ' ')}
            aria-label={`Scroll to ${sec.replace('-', ' ')}`}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 border ${
              activeSection === sec
                ? 'bg-brand-green border-brand-green scale-110 shadow-[0_0_8px_var(--green)]'
                : 'bg-white/10 border-transparent hover:bg-white/30'
            }`}
          />
        ))}
      </div>

      {/* Right side widgets */}
      <div className="flex items-center gap-4">
        {/* Pulse Badge */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-brand-green/20 bg-brand-green-dim text-[10px] text-brand-green font-bold tracking-widest uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
          SENTINEL ACTIVE
        </div>

        {/* Action Button */}
        <button
          onClick={handleScanClick}
          className="font-mono text-[11px] font-semibold text-brand-green border border-brand-green/40 hover:border-brand-green hover:bg-brand-green-dim px-3 py-1 rounded transition-all duration-200"
        >
          Run Live Scan →
        </button>
      </div>
    </nav>
  );
}
