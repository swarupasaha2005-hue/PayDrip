import React, { useState } from 'react';
import { useApp } from '../hooks/useApp';
import { ArrowLeft, ExternalLink, Calendar, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Activity() {
  const { schedules, dripFlows, dripLogs } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');

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
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '1px' }}>Active Drip Streams</h3>
          <div className="stitch-layout-grid" style={{ gap: 16 }}>
            {dripFlows.filter(f => f.status === 'active').map(flow => {
              const progress = ((flow.ticksCompleted / (flow.timelineWeeks * 7)) * 100).toFixed(0);
              return (
                <div key={flow.id} className="stitch-card" style={{ gridColumn: 'span 4', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, height: 2, background: 'var(--primary)', width: `${progress}%`, transition: 'width 0.5s' }} />
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                    <span>Drip #{flow.id.slice(-4)}</span>
                    <span style={{ color: 'var(--primary)' }}>{progress}%</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{flow.remainingAmount} / {flow.totalAmount} XLM Remaining</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Strategy: {flow.strategy.toUpperCase()}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="stitch-panel" style={{ padding: '32px' }}>
        
        {/* Filters and Search */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {tabs.map(t => (
              <button 
                key={t}
                onClick={() => setFilter(t)}
                className="btn"
                style={{ 
                  borderRadius: 999, padding: '8px 16px', fontSize: 13,
                  background: filter === t ? 'var(--surface-2)' : 'transparent',
                  color: filter === t ? 'var(--text)' : 'var(--text-3)',
                  borderColor: filter === t ? 'var(--border)' : 'transparent'
                }}
              >
                {t}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="btn-icon" style={{ borderRadius: 8 }}><Search size={16} /></div>
            <div className="btn-icon" style={{ borderRadius: 8 }}><Filter size={16} /></div>
          </div>
        </div>

        {/* List Structure */}
        {((filter === 'Smart Drips' ? dripLogs : schedules)).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0', opacity: 0.5 }}>
            <Calendar size={48} style={{ margin: '0 auto 16px' }} />
            <p style={{ fontSize: 16 }}>No records found for this view.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filter === 'Smart Drips' ? (
              dripLogs.map((log, i) => (
                <div key={i} className="stitch-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }} />
                    <div style={{ fontSize: 14, color: 'var(--text)' }}>{log.message}</div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'monospace' }}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))
            ) : (
              schedules.map((s, i) => (
                <div key={i} className="stitch-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ padding: 12, background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)' }}>
                      <Calendar size={20} color="var(--primary)" />
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{s.service}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-3)' }}>{s.frequency.charAt(0).toUpperCase() + s.frequency.slice(1)} • {new Date(s.releaseAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 24, textAlign: 'right' }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{s.amount} XLM</div>
                      {s.inrAmount && <div style={{ fontSize: 12, color: 'var(--text-3)' }}>₹{s.inrAmount}</div>}
                    </div>
                    <a href={`https://testnet.stellarchain.io/transactions/${s.hash}`} target="_blank" rel="noreferrer" className="btn-icon" title="View on Explorer">
                      <ExternalLink size={16} />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
