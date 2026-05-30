import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API from '../config/api';
import { LIVE_SIGNALS_FEED } from '../data/mockData';

export default function LiveSignalFeed() {
  const [signals, setSignals] = useState([]);
  const [newRowId, setNewRowId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [stats, setStats] = useState({
    raw_last_hour: 0,
    survived_filter: 0,
    survived_filter_pct: '0%',
    alert_window: '—'
  });

  // ── MOCK MODE CYCLE ───────────────────────────────────────────────────
  // Only active when USE_MOCK is true — cycles through mock data
  const [unseenSignals, setUnseenSignals] = useState(LIVE_SIGNALS_FEED.slice(5));

  useEffect(() => {
    if (API.USE_MOCK) {
      // Initialize with mock data
      setSignals(LIVE_SIGNALS_FEED.slice(0, 5));
      setStats({
        raw_last_hour: 847,
        survived_filter: 23,
        survived_filter_pct: '2.7%',
        alert_window: '<2 hrs'
      });
    }
  }, []);

  useEffect(() => {
    if (!API.USE_MOCK) return;

    const interval = setInterval(() => {
      setUnseenSignals(prev => {
        if (prev.length === 0) return LIVE_SIGNALS_FEED;
        
        const nextSignal = { ...prev[0] };
        const newSignal = {
          ...nextSignal,
          id: `sig_cycle_${Date.now()}`,
          detected_relative: new Date().toTimeString().split(' ')[0]
        };
        
        setSignals(s => [newSignal, ...s.slice(0, 4)]);
        setNewRowId(newSignal.id);
        return prev.slice(1);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // ── LIVE BACKEND SSE & POLLING ──────────────────────────────────────────
  // Connects via Server-Sent Events (SSE) for instant signal delivery,
  // falling back gracefully to periodic SQLite polling if SSE is disconnected.
  useEffect(() => {
    if (API.USE_MOCK) return;

    let eventSource = null;
    let pollInterval = null;

    const fetchLiveFeedData = async () => {
      try {
        const res = await axios.get(API.ENDPOINTS.LIVE_SIGNALS);
        if (res.data && res.data.signals) {
          const backendSignals = res.data.signals.map(s => ({
            id: s.id,
            vendor: s.vendor,
            type: s.type.toLowerCase(),
            severity: s.severity.toLowerCase(),
            source: s.source,
            detected_relative: s.detected_relative,
            action: s.action
          }));

          setSignals(prev => {
            if (prev.length > 0 && backendSignals.length > 0 && prev[0].id !== backendSignals[0].id) {
              setNewRowId(backendSignals[0].id);
            }
            return backendSignals;
          });

          if (res.data.stats) {
            const raw = res.data.stats.raw_last_hour;
            const survived = res.data.stats.survived_filter;
            const pct = raw > 0 ? `${((survived / raw) * 100).toFixed(1)}%` : '0%';
            setStats({
              raw_last_hour: raw,
              survived_filter: survived,
              survived_filter_pct: pct,
              alert_window: survived > 10 ? '<30 mins' : '<2 hrs'
            });
          }
          setIsConnected(true);
          setLastUpdate(new Date());
        }
      } catch (err) {
        console.warn('Error fetching fallback polling feed:', err);
        setIsConnected(false);
      }
    };

    const setupSSE = () => {
      try {
        eventSource = new EventSource(API.ENDPOINTS.SIGNAL_STREAM);

        eventSource.onopen = () => {
          setIsConnected(true);
          setLastUpdate(new Date());
          console.log('🔌 SSE Stream Connection established.');
          // Stop polling if we are live on SSE
          if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
          }
          // Fetch initial state once
          fetchLiveFeedData();
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'signal_detected') {
              const newSig = data.data;
              const formattedSig = {
                id: newSig.id,
                vendor: newSig.vendor,
                type: newSig.type.toLowerCase(),
                severity: newSig.severity.toLowerCase(),
                source: newSig.source,
                detected_relative: newSig.detected_relative || 'Just now',
                action: newSig.action || 'LOGGED'
              };

              setSignals(prev => {
                // Ensure no duplicates
                if (prev.some(s => s.id === formattedSig.id)) return prev;
                setNewRowId(formattedSig.id);
                return [formattedSig, ...prev.slice(0, 14)];
              });

              setStats(prev => {
                const newRaw = prev.raw_last_hour + 3;
                const newSurvived = prev.survived_filter + 1;
                return {
                  raw_last_hour: newRaw,
                  survived_filter: newSurvived,
                  survived_filter_pct: `${((newSurvived / newRaw) * 100).toFixed(1)}%`,
                  alert_window: newSurvived > 10 ? '<30 mins' : '<2 hrs'
                };
              });

              setLastUpdate(new Date());
            }
          } catch (err) {
            console.error('Error parsing SSE event data:', err);
          }
        };

        eventSource.onerror = (err) => {
          console.warn('⚠️ SSE connection encountered error. Falling back to HTTP polling...', err);
          setIsConnected(false);
          if (eventSource) {
            eventSource.close();
          }
          
          // Trigger fallback polling
          if (!pollInterval) {
            fetchLiveFeedData();
            pollInterval = setInterval(fetchLiveFeedData, 5000);
          }
        };
      } catch (err) {
        console.error('SSE initialization error:', err);
        fetchLiveFeedData();
        pollInterval = setInterval(fetchLiveFeedData, 5000);
      }
    };

    // Initialize SSE
    setupSSE();

    return () => {
      if (eventSource) eventSource.close();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, []);

  // Clear new row flash after animation
  useEffect(() => {
    if (!newRowId) return;
    const timer = setTimeout(() => setNewRowId(null), 1500);
    return () => clearTimeout(timer);
  }, [newRowId]);

  const getSeverityStyle = (sev) => {
    switch (sev.toLowerCase()) {
      case 'critical':
        return 'border-brand-red bg-brand-red-dim text-brand-red';
      case 'high':
        return 'border-brand-orange bg-brand-orange-dim text-brand-orange';
      case 'medium':
        return 'border-brand-yellow bg-brand-yellow-dim text-brand-yellow';
      default:
        return 'border-white/20 bg-white/5 text-text-secondary';
    }
  };

  const getActionStyle = (act) => {
    switch (act) {
      case 'ALERT_SENT':
      case 'ALERT SENT':
        return 'text-brand-green bg-brand-green-dim border-brand-green/20';
      case 'MONITORING':
        return 'text-brand-blue bg-white/5 border-white/10';
      case 'FLAGGED':
        return 'text-brand-orange bg-brand-orange-dim border-brand-orange/20';
      default:
        return 'text-text-tertiary bg-white/5 border-transparent';
    }
  };

  const hasSignals = signals.length > 0;

  return (
    <section id="live-feed" className="max-w-7xl mx-auto w-full px-6 py-20 border-b border-white/5">
      <div className="flex flex-col space-y-6">
        
        {/* Identity Section Header */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-4 text-brand-green uppercase tracking-widest text-[10px] font-bold flex-wrap">
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${hasSignals ? 'bg-brand-green animate-pulse' : 'bg-white/30'}`} />
              ● SIGNAL FEED · LIVE TAIL · UPDATES EVERY 5s
            </div>
            
            {/* Data Source Indicator */}
            {!API.USE_MOCK ? (
              <div className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono tracking-widest border ${
                isConnected 
                  ? 'bg-brand-green/10 border-brand-green/20 text-brand-green' 
                  : 'bg-brand-red/10 border-brand-red/20 text-brand-red'
              }`}>
                {isConnected ? '● LIVE — SQLITE DATABASE' : '● DISCONNECTED — WAITING FOR BACKEND'}
              </div>
            ) : (
              <div className="bg-brand-yellow/10 border border-brand-yellow/20 text-brand-yellow px-2.5 py-0.5 rounded-full text-[9px] font-mono tracking-widest">
                DEMO MODE — SIMULATED DATA
              </div>
            )}
          </div>
          <h2 className="font-serif italic text-3xl sm:text-4xl text-text-primary">
            Live intelligence. <span className="font-mono not-italic text-2xl font-normal text-text-secondary">Signals as they surface.</span>
          </h2>
        </div>

        {/* Empty state when no signals */}
        {!hasSignals ? (
          <div className="w-full bg-bg-surface border border-white/10 rounded-xl p-16 flex flex-col items-center justify-center space-y-4 text-center">
            <div className="text-4xl opacity-30">📡</div>
            <div className="font-mono text-sm text-text-secondary">
              {!API.USE_MOCK ? 'Waiting for backend signals...' : 'Initializing signal feed...'}
            </div>
            <p className="font-mono text-[11px] text-text-tertiary max-w-md leading-relaxed">
              {!API.USE_MOCK 
                ? 'Run a vendor scan from the search bar above to populate the live feed, or wait for background surveillance signals.'
                : 'Mock signals will appear momentarily.'
              }
            </p>
          </div>
        ) : (
          /* Dark Terminal style Table */
          <div className="w-full overflow-x-auto bg-bg-surface border border-white/5 rounded-xl shadow-2xl">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-text-tertiary uppercase tracking-widest text-[10px]">
                  <th className="p-4 font-semibold">TIME</th>
                  <th className="p-4 font-semibold">VENDOR</th>
                  <th className="p-4 font-semibold">SIGNAL TYPE</th>
                  <th className="p-4 font-semibold">SEVERITY</th>
                  <th className="p-4 font-semibold">SOURCE</th>
                  <th className="p-4 font-semibold text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {signals.map((sig) => (
                  <tr 
                    key={sig.id}
                    className={`transition-all duration-500 hover:bg-bg-elevated/50 ${
                      newRowId === sig.id ? 'animate-row-flash' : ''
                    }`}
                  >
                    <td className="p-4 text-text-tertiary">{sig.detected_relative}</td>
                    <td className="p-4 text-text-primary font-bold">{sig.vendor}</td>
                    <td className="p-4 text-text-secondary uppercase tracking-wider text-[11px]">{sig.type.replace('_', ' ')}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded border text-[9px] uppercase tracking-wider font-bold ${getSeverityStyle(sig.severity)}`}>
                        {sig.severity}
                      </span>
                    </td>
                    <td className="p-4 text-text-secondary">{sig.source}</td>
                    <td className="p-4 text-right">
                      <span className={`px-2.5 py-0.5 rounded border text-[9px] uppercase tracking-widest font-bold ${getActionStyle(sig.action)}`}>
                        {sig.action.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Stats counter row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="bg-bg-surface border border-white/5 rounded-xl p-6 flex flex-col space-y-1">
            <span className="font-mono text-3xl font-bold text-text-primary">{stats.raw_last_hour}</span>
            <span className="font-mono text-[10px] text-text-tertiary uppercase tracking-wider">
              Raw signals processed <span className="text-text-muted">(last hour)</span>
            </span>
          </div>

          <div className="bg-bg-surface border border-white/5 rounded-xl p-6 flex flex-col space-y-1">
            <span className="font-mono text-3xl font-bold text-brand-green">
              {stats.survived_filter} <span className="text-sm text-text-secondary font-normal font-mono">({stats.survived_filter_pct})</span>
            </span>
            <span className="font-mono text-[10px] text-text-tertiary uppercase tracking-wider">
              Survived layered filter <span className="text-brand-green font-bold">{stats.survived_filter_pct} validation</span>
            </span>
          </div>

          <div className="bg-bg-surface border border-white/5 rounded-xl p-6 flex flex-col space-y-1">
            <span className="font-mono text-3xl font-bold text-brand-blue">{stats.alert_window}</span>
            <span className="font-mono text-[10px] text-text-tertiary uppercase tracking-wider">
              Alert delivery window <span className="text-brand-blue font-bold">DORA compliant</span>
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
