import React, { useState, useEffect } from 'react';
import { Globe, Filter, Brain, Activity, FileText, Bell, HelpCircle, Cpu, Radar, Download, AppWindow, Shield } from 'lucide-react';
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

        {/* Multi-Agent Orchestration Core Grid */}
        <div className="flex flex-col space-y-6 border-t border-white/5 pt-12 mt-12">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-2 text-brand-green uppercase tracking-widest text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-green" />
              ● AGENTIC ORCHESTRATION · 6 AUTONOMOUS MODULES
            </div>
            <h3 className="font-serif italic text-2xl text-text-primary">
              Parallel execution by <span className="text-brand-green">specialized cognitive agents.</span>
            </h3>
            <p className="font-mono text-xs text-text-secondary max-w-3xl leading-relaxed">
              Vigil deploys a swarm of 6 specialized autonomous agents that collaborate in parallel to extract, analyze, and map third-party vulnerability markers before they reach the public awareness threshold.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Agent 1: Sentinel */}
            <div className="bg-bg-surface border border-white/5 hover:border-brand-green/20 rounded-xl p-5 flex flex-col space-y-3 shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-green/5 border border-brand-green/20 flex items-center justify-center text-brand-green">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-mono font-bold text-xs text-text-primary uppercase tracking-wider">Sentinel Agent</h4>
                  <span className="font-mono text-[9px] text-text-tertiary uppercase tracking-widest">Master Orchestrator</span>
                </div>
              </div>
              <p className="font-mono text-[10px] text-text-secondary leading-relaxed flex-1">
                Coordinates execution lifecycles, spawns discovery crawls in parallel, handles SQLite database transactions, and manages the Server-Sent Events (SSE) active state telemetry.
              </p>
            </div>

            {/* Agent 2: Scout */}
            <div className="bg-bg-surface border border-white/5 hover:border-brand-green/20 rounded-xl p-5 flex flex-col space-y-3 shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-green/5 border border-brand-green/20 flex items-center justify-center text-brand-green">
                  <Radar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-mono font-bold text-xs text-text-primary uppercase tracking-wider">Scout Agent</h4>
                  <span className="font-mono text-[9px] text-text-tertiary uppercase tracking-widest">Discovery Engine</span>
                </div>
              </div>
              <p className="font-mono text-[10px] text-text-secondary leading-relaxed flex-1">
                Performs time-targeted sweeps using the Bright Data SERP zone and queries direct code-search APIs in parallel to isolate potential vendor credentials leakage.
              </p>
            </div>

            {/* Agent 3: Extractor */}
            <div className="bg-bg-surface border border-white/5 hover:border-brand-green/20 rounded-xl p-5 flex flex-col space-y-3 shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-green/5 border border-brand-green/20 flex items-center justify-center text-brand-green">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-mono font-bold text-xs text-text-primary uppercase tracking-wider">Extractor Agent</h4>
                  <span className="font-mono text-[9px] text-text-tertiary uppercase tracking-widest">Static Web Unlocker</span>
                </div>
              </div>
              <p className="font-mono text-[10px] text-text-secondary leading-relaxed flex-1">
                Crawls and scrapes static text dumps, pastebins, and security news portals in parallel using Bright Data's Web Unlocker proxy networks to secure raw text intelligence.
              </p>
            </div>

            {/* Agent 4: Browser */}
            <div className="bg-bg-surface border border-white/5 hover:border-brand-green/20 rounded-xl p-5 flex flex-col space-y-3 shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-green/5 border border-brand-green/20 flex items-center justify-center text-brand-green">
                  <AppWindow className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-mono font-bold text-xs text-text-primary uppercase tracking-wider">Browser Agent</h4>
                  <span className="font-mono text-[9px] text-text-tertiary uppercase tracking-widest">Dynamic Scraping Browser</span>
                </div>
              </div>
              <p className="font-mono text-[10px] text-text-secondary leading-relaxed flex-1">
                Launches Chromium connected over CDP to Bright Data's Scraping Browser to render dynamic elements on JS-heavy security advisories (e.g. NVD CVE cards, status dashboards).
              </p>
            </div>

            {/* Agent 5: Analyst */}
            <div className="bg-bg-surface border border-white/5 hover:border-brand-green/20 rounded-xl p-5 flex flex-col space-y-3 shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-green/5 border border-brand-green/20 flex items-center justify-center text-brand-green">
                  <Brain className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-mono font-bold text-xs text-text-primary uppercase tracking-wider">Analyst Agent</h4>
                  <span className="font-mono text-[9px] text-text-tertiary uppercase tracking-widest">LLM Threat Classifier</span>
                </div>
              </div>
              <p className="font-mono text-[10px] text-text-secondary leading-relaxed flex-1">
                Runs high-speed parallel LLM analysis (Llama-3.3-70B) on raw text chunks to validate security markers, identify affected components, and extract active credentials.
              </p>
            </div>

            {/* Agent 6: Compliance */}
            <div className="bg-bg-surface border border-white/5 hover:border-brand-green/20 rounded-xl p-5 flex flex-col space-y-3 shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-green/5 border border-brand-green/20 flex items-center justify-center text-brand-green">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-mono font-bold text-xs text-text-primary uppercase tracking-wider">Compliance Agent</h4>
                  <span className="font-mono text-[9px] text-text-tertiary uppercase tracking-widest">Scoring & Regulation</span>
                </div>
              </div>
              <p className="font-mono text-[10px] text-text-secondary leading-relaxed flex-1">
                Computes a diminishing-return risk score based on cumulative evidence and maps vulnerabilities directly to **DORA Article 28**, **SOC 2 CC9.2**, and **ISO A.15** frameworks.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
