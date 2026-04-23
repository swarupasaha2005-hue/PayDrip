import React from 'react';
import { useApp } from '../hooks/useApp';
import { Users, BarChart3, Activity, Terminal, ShieldAlert, TrendingUp } from 'lucide-react';

export default function Metrics() {
  const { onboardedUsers, transactions, schedules, productionLogs } = useApp();

  const totalDrips = schedules.length;
  const totalTxs = transactions.length;
  const activeUsers = onboardedUsers.filter(u => u.activeRecently).length;
  const retentionRate = Math.round((activeUsers / Math.max(1, onboardedUsers.length)) * 100);

  return (
    <div className="spatial-spread fade-up">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 4px', letterSpacing: '-0.5px' }}>Production Metrics</h1>
        <p style={{ color: 'var(--text-3)', fontSize: 16 }}>Live system telemetry and user retention monitoring.</p>
      </div>

      <div className="stitch-layout-grid">
        
        {/* Analytics Summary */}
        <div style={{ gridColumn: 'span 4' }} className="stitch-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <TrendingUp size={20} color="var(--primary)" />
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>System Usage</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 4 }}>Daily Active Users (DAU)</div>
              <div style={{ fontSize: 24, fontWeight: 700, display: 'flex', alignItems: 'baseline', gap: 8 }}>
                {activeUsers} <span style={{ fontSize: 14, color: 'var(--success-text)', fontWeight: 500 }}>+12%</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 4 }}>User Retention Rate</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{retentionRate}%</div>
              <div style={{ width: '100%', height: 6, background: 'var(--surface-2)', borderRadius: 3, marginTop: 8 }}>
                <div style={{ width: `${retentionRate}%`, height: '100%', background: 'var(--primary)', borderRadius: 3 }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase' }}>Locked Streams</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{totalDrips}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase' }}>Total Txs</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{totalTxs}</div>
              </div>
            </div>
          </div>
        </div>

        {/* User Onboarding List */}
        <div style={{ gridColumn: 'span 8' }} className="stitch-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Users size={20} color="var(--primary)" />
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>Onboarded Users ({onboardedUsers.length})</h3>
            </div>
            <span className="badge">Production Index</span>
          </div>

          <div style={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {onboardedUsers.map(user => (
              <div key={user.id} className="stitch-card" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{user.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'monospace' }}>{user.address}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Joined</div>
                  <div style={{ fontSize: 12 }}>{new Date(user.joinedAt).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Production Logs / Monitoring */}
        <div style={{ gridColumn: 'span 12' }} className="stitch-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <Terminal size={20} color="var(--primary)" />
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>System Event Logs (Monitoring)</h3>
          </div>
          
          <div style={{ background: 'var(--bg)', borderRadius: 12, border: '1px solid var(--border)', padding: 16, fontFamily: 'monospace', fontSize: 13, height: 240, overflowY: 'auto' }}>
            {productionLogs.length === 0 ? (
              <div style={{ color: 'var(--text-3)', textAlign: 'center', paddingTop: 80 }}>Listening for system events...</div>
            ) : (
              productionLogs.map(log => (
                <div key={log.id} style={{ marginBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: 4 }}>
                   <span style={{ color: 'var(--text-3)' }}>[{new Date(log.timestamp).toLocaleTimeString()}]</span>{' '}
                   <span style={{ color: log.type === 'SECURITY' ? 'var(--error)' : log.type === 'VAULT' ? 'var(--info)' : 'var(--success-text)', fontWeight: 700 }}>{log.type}</span>:{' '}
                   <span style={{ color: 'var(--text)' }}>{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
