import React, { useState } from 'react';
import { useApp } from '../hooks/useApp';
import { ArrowLeft, ExternalLink, Calendar, Search, Filter, Layers, History, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UPISimulationModal from '../components/ui/UPISimulationModal';

export default function Activity() {
  const { schedules, dripFlows, dripLogs, updateSchedule } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [upiConfig, setUpiConfig] = useState(null);
  const [now] = useState(() => Date.now());

  const tabs = ['All', 'Smart Drips', 'Manual', 'Locked'];

  return (
    <div className="spatial-spread fade-up">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
        <button onClick={() => navigate(-1)} className="btn-icon"><ArrowLeft size={18} /></button>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 4px', letterSpacing: '-0.5px' }}>Activity Log</h1>
          <p style={{ color: 'var(--text-3)', fontSize: 16 }}>Historical records and execution traces.</p>
        </div>
      </div>

      {dripFlows.some(f => f.status === 'active') && (
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <Layers size={18} color="var(--primary)" />
            <h3 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '1px' }}>Active Drip Streams</h3>
          </div>
          <div className="stitch-layout-grid" style={{ gap: 20 }}>
            {dripFlows.filter(f => f.status === 'active').map(flow => {
              const progress = ((flow.ticksCompleted / (flow.timelineWeeks * 7)) * 100).toFixed(0);
              return (
                <div key={flow.id} className="pd-card-v2" style={{ gridColumn: 'span 4', padding: '24px', position: 'relative', overflow: 'hidden', borderStyle: 'dashed' }}>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, height: 4, background: 'var(--primary)', width: `${progress}%`, transition: 'width 1s ease-in-out' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-3)' }}>STREAM #{flow.id.slice(-4)}</div>
                    <div style={{ padding: '4px 10px', borderRadius: '10px', background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)', fontSize: 11, fontWeight: 800 }}>{progress}% ACTIVE</div>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>{flow.remainingAmount} / {flow.totalAmount} XLM</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>STRATEGY: <span style={{ color: 'var(--primary)' }}>{flow.strategy.toUpperCase()}</span></div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="pd-card-v2" style={{ padding: '32px' }}>
        
        {/* Filters and Search - Styled as Control Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 20 }}>
          <div className="pd-field" style={{ padding: '6px', borderRadius: '18px', background: 'var(--surface-2)', borderStyle: 'solid' }}>
            {tabs.map(t => (
              <button 
                key={t}
                onClick={() => setFilter(t)}
                className="pd-btn"
                style={{ 
                  borderRadius: '12px', padding: '8px 16px', fontSize: 12, fontWeight: 700,
                  background: filter === t ? 'var(--surface)' : 'transparent',
                  color: filter === t ? 'var(--primary)' : 'var(--text-3)',
                  boxShadow: filter === t ? '0 2px 6px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {t}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="pd-field" style={{ padding: '8px 16px', borderRadius: '15px' }}>
              <Search size={16} color="var(--text-3)" />
              <input placeholder="Filter events..." className="pd-input" style={{ fontSize: 13, width: '120px' }} />
            </div>
          </div>
        </div>

        {/* List Structure */}
        {((filter === 'Smart Drips' ? dripLogs : schedules)).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', opacity: 0.5 }}>
            <div style={{ background: 'var(--surface-2)', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <History size={32} color="var(--text-3)" />
            </div>
            <p style={{ fontSize: 15, fontWeight: 600 }}>Chronicle synchronized. No entries found.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filter === 'Smart Drips' ? (
              dripLogs.map((log, i) => (
                <div key={i} className="pd-field" style={{ justifyContent: 'space-between', padding: '16px 20px', borderStyle: 'solid', background: 'var(--bg)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 8px var(--primary)' }} />
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{log.message}</div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 700, fontFamily: 'monospace' }}>
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            ) : (
              schedules.map((s, i) => {
                const daysToDue = (new Date(s.releaseAt).getTime() - now) / (1000 * 60 * 60 * 24);
                let badgeText = s.status;
                let badgeColor = 'var(--text-3)';
                let badgeBg = 'var(--surface-2)';
                let showUpiBtn = false;
                
                if (s.status === 'Paid via UPI') {
                   badgeText = 'Paid via UPI';
                   badgeColor = '#10B981';
                   badgeBg = 'rgba(16, 185, 129, 0.1)';
                } else if (s.status === 'Executed via App') {
                   badgeText = 'Executed via App';
                   badgeColor = 'var(--primary)';
                   badgeBg = 'rgba(var(--primary-rgb), 0.1)';
                } else {
                   if (daysToDue > 2) {
                      badgeText = 'Upcoming';
                   } else if (daysToDue <= 2 && daysToDue > 0) {
                      badgeText = 'Due Soon';
                      badgeColor = '#F59E0B';
                      badgeBg = 'rgba(245, 158, 11, 0.1)';
                      showUpiBtn = true;
                   } else if (daysToDue <= 0) {
                      badgeText = 'Processing Fallback...';
                   }
                }

                return (
                  <div key={i} className="pd-field" style={{ justifyContent: 'space-between', padding: '20px 24px', borderStyle: 'solid', background: 'var(--bg)', flexWrap: 'wrap', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                      <div style={{ padding: 12, background: 'var(--surface)', borderRadius: '16px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', border: '1px solid var(--border)' }}>
                        <Calendar size={20} color="var(--primary)" />
                      </div>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>
                          {s.service}
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                          {s.frequency} • {new Date(s.releaseAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: 10, fontWeight: 800, background: badgeBg, color: badgeColor, border: `1px solid ${badgeColor}22`, display: 'inline-block' }}>
                          {badgeText}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, textAlign: 'right' }}>
                      {showUpiBtn && (
                        <button 
                          className="btn" 
                          style={{ background: '#3b82f6', color: 'white', padding: '10px 16px', fontSize: 12, borderRadius: '12px', fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                          onClick={() => {
                            setUpiConfig({
                              amountINR: s.inrAmount,
                              amountXLM: s.amount,
                              recipient: s.service,
                              onConfirm: async () => {
                                updateSchedule(s.id, { status: 'Paid via UPI' });
                              }
                            });
                          }}
                        >
                          Pay Now <ExternalLink size={14} />
                        </button>
                      )}
                      
                      <div style={{ background: 'var(--surface-2)', padding: '10px 18px', borderRadius: '14px', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>{s.amount} <span style={{ fontSize: 11, color: 'var(--primary)' }}>XLM</span></div>
                        {s.inrAmount && <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 700 }}>₹{s.inrAmount}</div>}
                      </div>

                      {s.hash && s.status !== 'Paid via UPI' && (
                        <a 
                          href={`https://testnet.stellarchain.io/transactions/${s.hash}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="pd-btn pd-btn-ghost" 
                          style={{ padding: '10px', borderRadius: '12px' }}
                          title="View Ledger Trace"
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      <UPISimulationModal 
        isOpen={!!upiConfig} 
        onClose={() => setUpiConfig(null)} 
        amountINR={upiConfig?.amountINR} 
        amountXLM={upiConfig?.amountXLM} 
        recipient={upiConfig?.recipient} 
        onConfirm={upiConfig?.onConfirm} 
      />
    </div>
  );
}
