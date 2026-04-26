import React from 'react';
import { useApp } from '../hooks/useApp';
import { Users, BarChart3, Activity, Terminal, ShieldAlert, TrendingUp, Cpu, Network, Database } from 'lucide-react';

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
        <div style={{ gridColumn: 'span 4' }} className="pd-card-v2">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <div style={{ background: 'var(--primary)', padding: '8px', borderRadius: '12px' }}>
              <TrendingUp size={20} color="white" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>System Usage</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="pd-field" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '20px' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-3)', marginBottom: 8, textTransform: 'uppercase' }}>Daily Active Users (DAU)</div>
              <div style={{ fontSize: 32, fontWeight: 800, display: 'flex', alignItems: 'baseline', gap: 10 }}>
                {activeUsers} <span style={{ fontSize: 14, color: 'var(--text-3)', fontWeight: 800 }}>LIVE</span>
              </div>
            </div>

            <div className="pd-field" style={{ flexDirection: 'column', alignItems: 'stretch', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase' }}>User Retention Rate</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--primary)' }}>{retentionRate}%</div>
              </div>
              <div style={{ width: '100%', height: 8, background: 'var(--surface-2)', borderRadius: 4, position: 'relative', overflow: 'hidden' }}>
                <div style={{ width: `${retentionRate}%`, height: '100%', background: 'var(--primary)', borderRadius: 4, transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="pd-field" style={{ flexDirection: 'column', padding: '16px' }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 4 }}>Locked Drips</div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{totalDrips}</div>
              </div>
              <div className="pd-field" style={{ flexDirection: 'column', padding: '16px' }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 4 }}>System Txs</div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{totalTxs}</div>
              </div>
            </div>
          </div>
        </div>

        {/* User Onboarding List */}
        <div style={{ gridColumn: 'span 8' }} className="pd-card-v2">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Users size={20} color="var(--primary)" />
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>Registry Analytics</h3>
            </div>
            <div className="badge" style={{ padding: '6px 12px', borderRadius: '10px' }}>{onboardedUsers.length} TOTAL USERS</div>
          </div>

          <div style={{ maxHeight: 380, overflowY: 'auto', display: 'grid', gridTemplateColumns: onboardedUsers.length === 0 ? '1fr' : '1fr 1fr', gap: 16 }}>
            {onboardedUsers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', background: 'var(--surface-2)', borderRadius: '24px', border: '1px solid var(--border)' }}>
                <div style={{ background: 'var(--surface)', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <Users size={32} color="var(--text-3)" />
                </div>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-3)' }}>No active sessions recorded in this shard.</p>
                <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Telemetry will synchronize upon live wallet connection.</p>
              </div>
            ) : (
              onboardedUsers.map(user => (
                <div key={user.id} className="pd-field" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderStyle: 'solid' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ 
                      width: 36, height: 36, borderRadius: 10, background: 'var(--surface-2)', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      fontSize: 14, fontWeight: 800, color: 'var(--primary)', border: '1px solid var(--border)' 
                    }}>
                      {user.name ? user.name.charAt(0).toUpperCase() : user.address.charAt(1).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{user.name || 'Unnamed Session'}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'monospace' }}>{user.address.slice(0, 12)}...</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase' }}>Enrolled</div>
                    <div style={{ fontSize: 11, fontWeight: 600 }}>{new Date(user.joinedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Production Logs / Monitoring */}
        <div style={{ gridColumn: 'span 12' }} className="pd-card-v2">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Terminal size={20} color="var(--primary)" />
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>System Event Diagnostics</h3>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div className="badge" style={{ gap: 6 }}><Database size={12} /> SHARDS: 3</div>
              <div className="badge" style={{ gap: 6 }}><Network size={12} /> TESTNET: ACTIVE</div>
            </div>
          </div>
          
          <div style={{ 
            background: 'var(--bg)', borderRadius: '20px', border: '1px solid var(--border)', 
            padding: '24px', fontFamily: 'monospace', fontSize: 13, height: 260, overflowY: 'auto',
            boxShadow: 'inset 4px 8px 16px rgba(0,0,0,0.15)'
          }}>
            {productionLogs.length === 0 ? (
              <div style={{ color: 'var(--text-3)', textAlign: 'center', paddingTop: 80, fontSize: 15 }}>
                <Cpu size={32} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                Initializing Telemetry Handlers...
              </div>
            ) : (
              productionLogs.map(log => (
                <div key={log.id} style={{ marginBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 8, display: 'flex', gap: 16 }}>
                   <span style={{ color: 'var(--text-3)', minWidth: '85px' }}>[{new Date(log.timestamp).toLocaleTimeString()}]</span>{' '}
                   <span style={{ 
                     color: log.type === 'SECURITY' ? 'var(--error)' : log.type === 'VAULT' ? 'var(--info)' : 'var(--success)', 
                     fontWeight: 800, minWidth: '80px', fontSize: 11, textTransform: 'uppercase'
                   }}>{log.type}</span>
                   <span style={{ color: 'var(--text-2)' }}>{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
