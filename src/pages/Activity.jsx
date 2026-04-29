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
    <div className="fade-up" style={{ maxWidth: '1000px', margin: '0 auto', paddingTop: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 64 }}>
        <button onClick={() => navigate(-1)} className="pd-btn pd-btn-ghost" style={{ width: 48, height: 48, padding: 0, borderRadius: '50%' }}><ArrowLeft size={20} /></button>
        <div>
          <h1 style={{ color: 'white' }}>Activity Log</h1>
          <p style={{ color: 'var(--text-3)', fontSize: 20, fontWeight: 500 }}>Historical records and execution traces.</p>
        </div>
      </div>

      {dripFlows.some(f => f.status === 'active') && (
        <div style={{ marginBottom: 80 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 12px var(--primary)' }} />
            <h3 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '2px' }}>Active Drip Streams</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {dripFlows.filter(f => f.status === 'active').map(flow => {
              const progress = ((flow.ticksCompleted / (flow.timelineWeeks * 7)) * 100).toFixed(0);
              return (
                <div key={flow.id} className="glass-panel" style={{ padding: '32px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, height: 4, background: 'var(--primary)', width: `${progress}%`, transition: 'width 1s ease-in-out' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.1em' }}>STREAM #{flow.id.slice(-4)}</div>
                    <div style={{ padding: '4px 10px', borderRadius: '10px', background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)', fontSize: 10, fontWeight: 800 }}>{progress}% ACTIVE</div>
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'white', marginBottom: 8 }}>{flow.remainingAmount} / {flow.totalAmount} XLM</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600 }}>STRATEGY: <span style={{ color: 'var(--primary)' }}>{flow.strategy.toUpperCase()}</span></div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="dark-form" style={{ padding: '48px' }}>
        
        {/* Filters and Search */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48, flexWrap: 'wrap', gap: 24 }}>
          <div style={{ display: 'flex', gap: 8, background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '100px', border: '1px solid var(--glass-border)' }}>
            {tabs.map(t => (
              <button 
                key={t}
                onClick={() => setFilter(t)}
                className="pd-btn"
                style={{ 
                  borderRadius: '100px', padding: '10px 24px', fontSize: 12, fontWeight: 700,
                  background: filter === t ? 'white' : 'transparent',
                  color: filter === t ? 'black' : 'var(--text-3)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {t}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="dark-field" style={{ padding: '10px 20px', borderRadius: '25px' }}>
              <Search size={18} color="#666" />
              <input placeholder="Search events..." className="dark-input" style={{ fontSize: 14, width: '160px' }} />
            </div>
          </div>
        </div>

        {/* List Structure */}
        {((filter === 'Smart Drips' ? dripLogs : schedules)).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 0', opacity: 0.4 }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', width: 80, height: 80, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '1px solid var(--glass-border)' }}>
              <History size={32} color="var(--text-3)" />
            </div>
            <p style={{ fontSize: 18, fontWeight: 500 }}>Chronicle synchronized. No entries found.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filter === 'Smart Drips' ? (
              dripLogs.map((log, i) => (
                <div key={i} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary)' }} />
                    <div style={{ fontSize: 15, fontWeight: 500, color: 'white' }}>{log.message}</div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600 }}>
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            ) : (
              schedules.map((s, i) => {
                const daysToDue = (new Date(s.releaseAt).getTime() - now) / (1000 * 60 * 60 * 24);
                let badgeText = s.status;
                let badgeColor = 'var(--text-3)';
                let badgeBg = 'rgba(255, 255, 255, 0.05)';
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
                  <div key={i} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 32px', flexWrap: 'wrap', gap: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                      <div style={{ padding: 14, background: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
                        <Calendar size={22} color="var(--primary)" />
                      </div>
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 6 }}>
                          {s.service}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {new Date(s.releaseAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span style={{ padding: '4px 12px', borderRadius: '100px', fontSize: 10, fontWeight: 800, background: badgeBg, color: badgeColor, border: `1px solid ${badgeColor}33` }}>
                            {badgeText}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: 'white' }}>{s.amount} <span style={{ fontSize: 12, color: 'var(--primary)', opacity: 0.8 }}>XLM</span></div>
                        {s.inrAmount && <div style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600, marginTop: 2 }}>₹{s.inrAmount}</div>}
                      </div>

                      {showUpiBtn && (
                        <button 
                          className="pd-btn pd-btn-primary" 
                          style={{ padding: '12px 24px', fontSize: 13 }}
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
                          Settle <ExternalLink size={14} />
                        </button>
                      )}
                      
                      {s.hash && s.status !== 'Paid via UPI' && (
                        <a 
                          href={`https://testnet.stellarchain.io/transactions/${s.hash}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="pd-btn pd-btn-ghost" 
                          style={{ width: 44, height: 44, padding: 0, borderRadius: '50%' }}
                        >
                          <ExternalLink size={18} />
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
