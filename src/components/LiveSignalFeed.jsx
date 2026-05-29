import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API from '../config/api';
import { LIVE_SIGNALS_FEED } from '../data/mockData';

export default function LiveSignalFeed() {
  const [signals, setSignals] = useState(LIVE_SIGNALS_FEED.slice(0, 5));
  const [unseenSignals, setUnseenSignals] = useState(LIVE_SIGNALS_FEED.slice(5));
  const [newRowId, setNewRowId] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('');
  const [stats, setStats] = useState({
    raw_last_hour: 847,
    survived_filter: 23,
    survived_filter_pct: '2.7%',
    alert_window: '<2 hrs'
  });
  
  // ── LIVE BACKEND POLLING ───────────────────────────────────────────────
  useEffect(() => {
    if (API.USE_MOCK) return;

    const fetchLiveFeed = async () => {
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

          // Trigger flash if there is a new signal at the top
          setSignals(prev => {
            if (prev.length > 0 && backendSignals.length > 0 && prev[0].id !== backendSignals[0].id) {
              setNewRowId(backendSignals[0].id);
            }
            return backendSignals;
          });
          
          if (res.data.stats) {
            const raw = res.data.stats.raw_last_hour;
            const survived = res.data.stats.survived_filter;
            const pct = raw > 0 ? `${((survived / raw) * 100).toFixed(1)}%` : '2.7%';
            setStats({
              raw_last_hour: raw,
              survived_filter: survived,
              survived_filter_pct: pct,
              alert_window: survived > 10 ? '<30 mins' : '<2 hrs'
            });
          }
        }
      } catch (err) {
        console.warn('Error fetching live signals from backend:', err);
      }
    };

    fetchLiveFeed();
    const interval = setInterval(fetchLiveFeed, 5000);
    return () => clearInterval(interval);
  }, []);

  // ── CUSTOM SCAN TRIGGER LISTENER ───────────────────────────────────────
  useEffect(() => {
    const timeouts = [];
    const handleMockScan = () => {
      setIsScanning(true);
      setScanStatus('Initializing Bright Data Web Scraper API nodes...');
      
      timeouts.push(setTimeout(() => {
        setScanStatus('SERP & Paste sites residential proxies active...');
      }, 700));

      timeouts.push(setTimeout(() => {
        setScanStatus('Running content filtration & Groq Llama 3.3 LLM pipeline...');
      }, 1400));

      timeouts.push(setTimeout(async () => {
        if (!API.USE_MOCK) {
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
              setSignals(backendSignals);
              if (res.data.stats) {
                const raw = res.data.stats.raw_last_hour;
                const survived = res.data.stats.survived_filter;
                const pct = raw > 0 ? `${((survived / raw) * 100).toFixed(1)}%` : '2.7%';
                setStats({
                  raw_last_hour: raw,
                  survived_filter: survived,
                  survived_filter_pct: pct,
                  alert_window: survived > 10 ? '<30 mins' : '<2 hrs'
                });
              }
              setNewRowId(backendSignals[0]?.id || null);
            }
          } catch (err) {
            console.warn('Error fetching live signals during scan:', err);
          }
        } else {
          // Complete scan: add fresh critical signals at the top
          const freshSignals = [
            {
              id: `sig_scan_${Date.now()}_1`,
              vendor: 'Snowflake',
              type: 'credential_leak',
              severity: 'critical',
              source: 'Paste site monitoring',
              detected_relative: '10s ago',
              action: 'ALERT_SENT'
            },
            {
              id: `sig_scan_${Date.now()}_2`,
              vendor: 'Okta',
              type: 'github',
              severity: 'high',
              source: 'GitHub Public Scan',
              detected_relative: '23s ago',
              action: 'ALERT_SENT'
            },
            ...LIVE_SIGNALS_FEED.slice(0, 3)
          ];
          setSignals(freshSignals);
          setNewRowId(freshSignals[0].id);
        }
        setIsScanning(false);
      }, 2200));
    };

    window.addEventListener('trigger-mock-scan', handleMockScan);
    return () => {
      window.removeEventListener('trigger-mock-scan', handleMockScan);
      timeouts.forEach(clearTimeout);
    };
  }, []);

  // ── DYNAMIC MOCK CYCLE (Only active when USE_MOCK is true) ─────────────
  useEffect(() => {
    if (!API.USE_MOCK || isScanning) return;

    const interval = setInterval(() => {
      if (unseenSignals.length === 0) {
        // Recycle mock data
        setUnseenSignals(LIVE_SIGNALS_FEED);
        return;
      }

      const nextSignal = { ...unseenSignals[0] };
      const currentTime = new Date();
      const formattedTime = currentTime.toTimeString().split(' ')[0];
      
      const newSignal = {
        ...nextSignal,
        id: `sig_cycle_${Date.now()}`,
        detected_relative: formattedTime
      };

      setSignals(prev => [newSignal, ...prev.slice(0, 4)]);
      setNewRowId(newSignal.id);
      setUnseenSignals(prev => prev.slice(1));
    }, 5000);

    return () => clearInterval(interval);
  }, [unseenSignals, isScanning]);

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

  return (
    <section id="live-feed" className="max-w-7xl mx-auto w-full px-6 py-20 border-b border-white/5">
      <div className="flex flex-col space-y-6">
        
        {/* Identity Section Header */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-4 text-brand-green uppercase tracking-widest text-[10px] font-bold flex-wrap">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
              ● SIGNAL FEED · LIVE TAIL · UPDATES EVERY 5s
            </div>
            {!API.USE_MOCK && (
              <div className="bg-brand-green/10 border border-brand-green/20 text-brand-green px-2.5 py-0.5 rounded-full text-[9px] font-mono tracking-widest">
                CONNECTED TO SQLITE DATABASE
              </div>
            )}
          </div>
          <h2 className="font-serif italic text-3xl sm:text-4xl text-text-primary">
            Live intelligence. <span className="font-mono not-italic text-2xl font-normal text-text-secondary">Signals as they surface.</span>
          </h2>
        </div>

        {/* Live scanner interactive overlays */}
        {isScanning ? (
          <div className="w-full bg-bg-surface border border-brand-green/30 rounded-xl p-12 flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 rounded-full border-2 border-brand-green/20 border-t-brand-green animate-spin" />
            <div className="font-mono text-xs text-brand-green uppercase tracking-widest animate-pulse">
              {scanStatus}
            </div>
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
