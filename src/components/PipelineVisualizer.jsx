import React, { useState, useEffect } from 'react';
import { Globe, Filter, Brain, Activity, FileText, Bell, HelpCircle } from 'lucide-react';
import { PIPELINE_NODES } from '../data/mockData';

const iconMap = {
  Globe,
  Filter,
  Brain,
  Activity,
  FileText,
  Bell
};

export default function PipelineVisualizer() {
  const [nodes, setNodes] = useState(PIPELINE_NODES);

  // Slowly increment throughput counts to make it feel live
  useEffect(() => {
    const interval = setInterval(() => {
      setNodes(prev =>
        prev.map(node => {
          const delta = Math.random() > 0.7 ? 1 : 0;
          return {
            ...node,
            throughput: node.throughput + delta
          };
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="pipeline" className="max-w-7xl mx-auto w-full px-6 py-20 border-b border-white/5">
      <div className="flex flex-col space-y-12">
        
        {/* Section Header */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-2 text-white/30 uppercase tracking-widest text-[10px] font-bold">
            <span>● ARCHITECTURE · INTELLIGENCE PIPELINE</span>
          </div>
          <h2 className="font-serif italic text-3xl sm:text-4xl text-text-primary">
            Six layers. <span className="text-brand-green">Zero noise</span> reaching the analyst.
          </h2>
        </div>

        {/* The Pipeline flow visualizer */}
        <div className="relative w-full overflow-x-auto pb-4">
          <div className="min-w-[1000px] flex items-center justify-between relative py-6">
            
            {/* SVG Background Connecting Flow Lines */}
            <div className="absolute top-1/2 left-0 right-0 h-4 -translate-y-1/2 pointer-events-none z-0">
              <svg className="w-full h-4 overflow-visible" xmlns="http://www.w3.org/2000/svg">
                <line 
                  x1="0" 
                  y1="8" 
                  x2="100%" 
                  y2="8" 
                  stroke="rgba(255,255,255,0.06)" 
                  strokeWidth="2" 
                />
                <line 
                  x1="0" 
                  y1="8" 
                  x2="100%" 
                  y2="8" 
                  stroke="var(--green)" 
                  strokeWidth="2" 
                  className="animated-connector" 
                  opacity="0.6"
                />
              </svg>
            </div>

            {/* Nodes */}
            {nodes.map((node, index) => {
              const IconComponent = iconMap[node.icon] || HelpCircle;
              
              return (
                <div 
                  key={node.id} 
                  className="relative z-10 w-[145px] flex flex-col items-center text-center bg-bg-surface border border-white/5 rounded-xl p-4 shadow-xl hover:border-brand-green/30 hover:bg-bg-elevated transition-all duration-300 group"
                >
                  {/* Badge */}
                  <span className="absolute -top-2.5 px-2 py-0.5 rounded bg-bg-primary border border-white/10 text-[8px] tracking-widest text-text-tertiary font-bold uppercase group-hover:border-brand-green/20 group-hover:text-brand-green">
                    {node.badge}
                  </span>

                  {/* Icon Panel */}
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-text-secondary border border-white/10 group-hover:border-brand-green/30 group-hover:text-brand-green transition-colors mb-3">
                    <IconComponent className="w-5 h-5" />
                  </div>

                  {/* Node details */}
                  <h3 className="font-mono font-bold text-xs text-brand-green uppercase tracking-wider mb-1">
                    {node.name}
                  </h3>
                  <div className="font-mono text-[10px] text-text-primary font-semibold leading-tight min-h-[30px] flex items-center justify-center">
                    {node.tech}
                  </div>
                  <p className="font-mono text-[9px] text-text-tertiary mt-2 leading-relaxed min-h-[36px] flex items-center justify-center border-t border-white/5 pt-2">
                    {node.description}
                  </p>

                  {/* Counter */}
                  <div className="mt-3 font-mono text-[10px] text-text-muted bg-white/5 px-2 py-0.5 rounded border border-white/10">
                    ~{node.throughput}/hr
                  </div>
                </div>
              );
            })}

          </div>
        </div>

        {/* Details & Callouts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Scout Callout Box (7 cols) */}
          <div className="lg:col-span-7 bg-bg-surface border border-brand-green/30 rounded-xl p-6 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-brand-green/5 blur-2xl pointer-events-none" />
            <div className="flex items-center gap-2 text-brand-green font-bold text-[11px] uppercase tracking-widest mb-3">
              <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
              ● BRIGHT DATA INFRASTRUCTURE
            </div>
            
            <div className="font-mono text-[11px] text-text-primary font-semibold mb-2">
              Web Unlocker · SERP API · Scraping Browser
            </div>
            
            <p className="font-mono text-xs text-text-secondary leading-relaxed space-y-2">
              Required core infrastructure: seamlessly bypasses bot detection mechanisms, geo-blocks, advanced CAPTCHAs, and heavy client-side JavaScript rendering on all 4 intelligence sources.
              <strong className="block text-brand-green mt-2">Without this load-bearing layer, continuous third-party risk analysis is impossible.</strong>
            </p>
          </div>

          {/* Technical spec sheets (5 cols) */}
          <div className="lg:col-span-5 bg-bg-surface border border-white/5 rounded-xl p-6 font-mono text-xs text-text-secondary space-y-3 shadow-xl">
            <div className="text-[10px] uppercase font-bold text-text-tertiary tracking-widest border-b border-white/5 pb-2">
              Pipeline Technical Parameters
            </div>
            
            <div className="flex justify-between">
              <span className="text-text-tertiary">ANALYSIS MODEL:</span>
              <span className="text-text-primary font-bold">Llama 3.1 70B via Groq</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-text-tertiary">INFERENCE LATENCY:</span>
              <span className="text-brand-green font-bold">~500 tokens/sec</span>
            </div>

            <div className="flex justify-between">
              <span className="text-text-tertiary">FILTER METHODOLOGY:</span>
              <span className="text-text-primary">Keyword → Rule-based → LLM</span>
            </div>

            <div className="flex justify-between">
              <span className="text-text-tertiary">CONTEXT REDUCTION:</span>
              <span className="text-brand-blue font-bold">97.3% filtered pre-LLM</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
