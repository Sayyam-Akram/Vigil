import React from 'react';

const AGENT_META = {
  sentinel: {
    title: 'Sentinel Orchestrator',
    description: 'Coordinates agent lifecycle and consolidates findings.',
    icon: '👑',
    color: 'border-brand-green bg-brand-green/5 text-brand-green',
    glow: 'shadow-brand-green/20'
  },
  scout: {
    title: 'Scout Agent',
    description: 'Fires SERP discovery and direct API queries in parallel.',
    icon: '📡',
    color: 'border-brand-blue bg-brand-blue/5 text-brand-blue',
    glow: 'shadow-brand-blue/20'
  },
  extractor: {
    title: 'Extractor Agent',
    description: 'Scrapes static URLs via Bright Data Web Unlocker.',
    icon: '📋',
    color: 'border-brand-yellow bg-brand-yellow/5 text-brand-yellow',
    glow: 'shadow-brand-yellow/20'
  },
  browser: {
    title: 'Browser Agent',
    description: 'Connects to remote Scraping Browser via CDP Playwright.',
    icon: '🌐',
    color: 'border-brand-orange bg-brand-orange/5 text-brand-orange',
    glow: 'shadow-brand-orange/20'
  },
  analyst: {
    title: 'Analyst Agent',
    description: 'Classifies threat signals via Llama 3.3 / Gemini LLM.',
    icon: '🧠',
    color: 'border-brand-red bg-brand-red/5 text-brand-red',
    glow: 'shadow-brand-red/20'
  },
  compliance: {
    title: 'Compliance Agent',
    description: 'Maps threats to DORA, SOC2, NIS2, ISO27001.',
    icon: '⚖️',
    color: 'border-purple-500 bg-purple-500/5 text-purple-400',
    glow: 'shadow-purple-500/20'
  }
};

export default function AgentStatusPanel({ agentStates, vendorName }) {
  const agents = ['sentinel', 'scout', 'extractor', 'browser', 'analyst', 'compliance'];

  return (
    <div className="w-full bg-bg-surface border border-white/10 rounded-xl p-6 shadow-2xl flex flex-col space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse shadow-md shadow-brand-orange" />
            <span className="font-mono text-[10px] tracking-widest text-brand-orange uppercase font-bold">
              ACTIVE INTELLIGENCE SCAN · SSE RUNTIME STATE
            </span>
          </div>
          <h3 className="font-serif italic text-2xl text-text-primary">
            Deploying Autonomous Agents <span className="font-mono not-italic text-lg text-text-secondary font-normal">for '{vendorName}'</span>
          </h3>
        </div>
        
        {/* Connection status */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
          <span className="font-mono text-[9px] text-text-tertiary uppercase tracking-widest">
            Stream Status:
          </span>
          <span className="font-mono text-[9px] text-brand-green uppercase font-bold animate-pulse">
            ● ESTABLISHED
          </span>
        </div>
      </div>

      {/* 6 Agents Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((id) => {
          const meta = AGENT_META[id];
          const state = agentStates[id] || { status: 'idle', message: 'Agent queued, awaiting orchestration.' };
          
          const isIdle = state.status === 'idle';
          const isRunning = state.status === 'running';
          const isComplete = state.status === 'complete';
          const isError = state.status === 'error';

          return (
            <div 
              key={id}
              className={`flex flex-col h-full bg-bg-primary border rounded-lg p-5 transition-all duration-300 ${
                isRunning 
                  ? `${meta.color} border-opacity-100 shadow-lg ${meta.glow}`
                  : isComplete
                    ? 'border-brand-green bg-brand-green/5 border-opacity-40'
                    : isError
                      ? 'border-brand-red bg-brand-red/5 border-opacity-40'
                      : 'border-white/5 opacity-50'
              }`}
            >
              {/* Card Title & Icon */}
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{meta.icon}</span>
                  <div className="flex flex-col">
                    <span className="font-mono text-[11px] font-bold text-text-primary uppercase tracking-wider">
                      {meta.title}
                    </span>
                    <span className="text-[9px] text-text-tertiary">
                      id: {id}_agent
                    </span>
                  </div>
                </div>

                {/* Badge */}
                <span className={`px-2 py-0.5 rounded text-[8px] font-mono tracking-widest font-bold border ${
                  isRunning 
                    ? 'bg-brand-orange/10 border-brand-orange/20 text-brand-orange animate-pulse'
                    : isComplete
                      ? 'bg-brand-green/10 border-brand-green/20 text-brand-green'
                      : isError
                        ? 'bg-brand-red/10 border-brand-red/20 text-brand-red'
                        : 'bg-white/5 border-white/10 text-text-tertiary'
                }`}>
                  {state.status.toUpperCase()}
                </span>
              </div>

              {/* Card Body */}
              <div className="flex-grow pt-4 flex flex-col justify-between space-y-4">
                <p className="text-[11px] text-text-secondary leading-relaxed font-sans">
                  {meta.description}
                </p>

                {/* Live Console Output */}
                <div className="bg-black/40 border border-white/5 rounded p-3 font-mono text-[10px] min-h-[60px] flex flex-col justify-between">
                  <div className="text-text-tertiary uppercase text-[8px] tracking-wider pb-1 border-b border-white/5 mb-1.5 flex justify-between">
                    <span>CONSOLE_LOG</span>
                    {isRunning && <span className="animate-pulse">_</span>}
                  </div>
                  <p className={`leading-normal ${
                    isRunning 
                      ? 'text-text-primary' 
                      : isComplete 
                        ? 'text-text-secondary' 
                        : isError 
                          ? 'text-brand-red' 
                          : 'text-text-muted'
                  }`}>
                    {state.message}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer System Status Log */}
      <div className="bg-bg-primary/50 border border-white/5 rounded-lg p-4 font-mono text-[10px] text-text-tertiary flex flex-col space-y-2">
        <div className="flex justify-between items-center text-[8px] uppercase tracking-widest text-text-muted pb-1 border-b border-white/5">
          <span>Pipeline Diagnostic Vector</span>
          <span className="text-brand-green">OK</span>
        </div>
        <div className="flex flex-col space-y-1">
          <p>📡 <span className="text-text-secondary">Scout Agent:</span> Scanning haveibeenpwned, github API, and 4 Google SERP queries in parallel.</p>
          <p>🌐 <span className="text-text-secondary">Browser Agent:</span> Scraping Browser CDP session connected remotely to brd.superproxy.io:9222.</p>
          <p>🧠 <span className="text-text-secondary">Analyst Agent:</span> Heuristic validation filtering completed. Submitting deep scrapes to LLM payload.</p>
        </div>
      </div>

    </div>
  );
}
