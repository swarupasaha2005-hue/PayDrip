import React from 'react';
import { useWallet } from '../hooks/useWallet';
import { Activity, ShieldCheck, Zap, ArrowUpRight, Clock, Plus, Settings } from 'lucide-react';

export default function Dashboard() {
  const { balance } = useWallet();
  const xlm = parseFloat(balance || 0);

  const logs = [
    { id: 1, time: '10:42 AM', action: 'Vault Threshold Validated', tag: 'System' },
    { id: 2, time: '09:15 AM', action: 'Intent Agent Adjusted Drift', tag: 'Agent' },
    { id: 3, time: 'Yesterday', action: 'Smart Drip Deployed', tag: 'Execution' },
    { id: 4, time: 'Yesterday', action: 'Yield Strategy Optimized', tag: 'System' }
  ];

  return (
    <div className="spatial-spread fade-up">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 4px', letterSpacing: '-0.5px' }}>Dashboard</h1>
          <p style={{ color: 'var(--text-3)', fontSize: 16 }}>Financial overview and agent telemetry.</p>
        </div>
        <button className="btn btn-ghost" onClick={() => window.location.href='/subscriptions'}>
          <Plus size={16} /> New Intent
        </button>
      </div>

      <div className="stitch-layout-grid">
        
        {/* Left Column: Agent Log */}
        <div style={{ gridColumn: 'span 3', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="stitch-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={16} /> Agent Log
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {logs.map(log => (
                <div key={log.id} style={{ display: 'flex', flexDirection: 'column', gap: 4, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{log.time}</span>
                    <span style={{ fontSize: 10, background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: 4, color: 'var(--text-2)' }}>{log.tag}</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>
                    {log.action}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Column: Yield Performance */}
        <div style={{ gridColumn: 'span 6', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="stitch-panel stitch-panel-hover" style={{ flex: 1, padding: 0, position: 'relative' }}>
            <div style={{ padding: '32px 32px 0' }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-2)' }}>Yield Performance</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 12 }}>
                <span style={{ fontSize: 48, fontWeight: 700 }}>+4.2%</span>
                <span style={{ fontSize: 14, color: 'var(--success-text)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ArrowUpRight size={14} /> APY Delta
                </span>
              </div>
            </div>
            {/* Wavy Chart Area */}
            <svg style={{ width: '100%', height: 200, display: 'block', marginTop: 'auto' }} viewBox="0 0 400 150" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0"/>
                </linearGradient>
              </defs>
              <path d="M0,150 L0,80 Q50,40 100,70 T200,60 T300,90 T400,20 L400,150 Z" fill="url(#chartGrad)"/>
              <path d="M0,80 Q50,40 100,70 T200,60 T300,90 T400,20" fill="none" stroke="var(--primary)" strokeWidth="3" vectorEffect="non-scaling-stroke"/>
            </svg>
          </div>
        </div>

        {/* Right Column: Quick Actions & Spotlight */}
        <div style={{ gridColumn: 'span 3', display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          <div className="stitch-panel">
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, color: 'var(--text-2)' }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="stitch-card" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }} onClick={() => window.location.href='/vault'}>
                <div style={{ background: 'var(--surface)', padding: 10, borderRadius: 12, border: '1px solid var(--border)' }}>
                  <ShieldCheck size={20} color="var(--success-text)" />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Access Vault</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Review Approvals</div>
                </div>
              </div>
              <div className="stitch-card" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }} onClick={() => window.location.href='/planner'}>
                <div style={{ background: 'var(--surface)', padding: 10, borderRadius: 12, border: '1px solid var(--border)' }}>
                  <Zap size={20} color="var(--error-text)" />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Intent Flow</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Agent Trajectory</div>
                </div>
              </div>
            </div>
          </div>

          <div className="stitch-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
            <Activity size={32} color="var(--primary)" style={{ marginBottom: 16 }} />
            <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{xlm.toFixed(2)}</div>
            <div style={{ fontSize: 13, color: 'var(--text-3)' }}>Available XLM</div>
          </div>

        </div>
      </div>
    </div>
  );
}
