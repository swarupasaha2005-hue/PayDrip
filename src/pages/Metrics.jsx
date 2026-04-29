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
    <div className="fade-up" style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '40px' }}>
      <div style={{ marginBottom: 64 }}>
        <h1 style={{ color: 'white' }}>System Metrics</h1>
        <p style={{ color: 'var(--text-3)', fontSize: 20, fontWeight: 500 }}>Live system telemetry and user retention monitoring.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 40 }}>
        
        {/* Analytics Summary */}
        <div style={{ gridColumn: 'span 4' }} className="glass-panel" style={{ padding: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
            <div style={{ background: 'rgba(var(--primary-rgb), 0.1)', padding: '10px', borderRadius: '14px', border: '1px solid rgba(var(--primary-rgb), 0.2)' }}>
              <TrendingUp size={20} color="var(--primary)" />
            </div>
            <h3 style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-3)' }}>System Usage</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <div className="glass-card" style={{ padding: '24px', background: 'rgba(255,255,255,0.01)' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-3)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '1px' }}>Daily Active Users</div>
              <div style={{ fontSize: 40, fontWeight: 800, color: 'white', display: 'flex', alignItems: 'baseline', gap: 12 }}>
                {activeUsers} <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 800, letterSpacing: '1px' }}>LIVE</span>
              </div>
            </div>

            <div style={{ padding: '0 8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '1px' }}>Retention Rate</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'white' }}>{retentionRate}%</div>
              </div>
              <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: '100px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ width: `${retentionRate}%`, height: '100%', background: 'var(--primary)', borderRadius: '100px', transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div className="glass-card" style={{ padding: '20px', background: 'rgba(255,255,255,0.01)' }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '1px' }}>Drips</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'white' }}>{totalDrips}</div>
              </div>
              <div className="glass-card" style={{ padding: '20px', background: 'rgba(255,255,255,0.01)' }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '1px' }}>Txs</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'white' }}>{totalTxs}</div>
              </div>
            </div>
          </div>
        </div>

        {/* User Onboarding List */}
        <div style={{ gridColumn: 'span 8' }} className="glass-panel" style={{ padding: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Users size={20} color="var(--primary)" />
              <h3 style={{ fontSize: 20, fontWeight: 700 }}>Registry Analytics</h3>
            </div>
            <div style={{ fontSize: 11, fontWeight: 800, background: 'rgba(255,255,255,0.05)', padding: '6px 16px', borderRadius: '100px', letterSpacing: '1px' }}>{onboardedUsers.length} TOTAL SESSIONS</div>
          </div>

          <div style={{ maxHeight: 380, overflowY: 'auto', display: 'grid', gridTemplateColumns: onboardedUsers.length === 0 ? '1fr' : '1fr 1fr', gap: 16, paddingRight: 8 }}>
            {onboardedUsers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0', background: 'rgba(255,255,255,0.01)', borderRadius: '24px', border: '1px dashed var(--glass-border)' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', width: 80, height: 80, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '1px solid var(--glass-border)' }}>
                  <Users size={32} color="var(--text-3)" />
                </div>
                <p style={{ fontSize: 18, fontWeight: 500, color: 'var(--text-3)' }}>No active sessions recorded.</p>
                <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 8, opacity: 0.6 }}>Telemetry will synchronize upon live connection.</p>
              </div>
            ) : (
              onboardedUsers.map(user => (
                <div key={user.id} className="glass-card" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ 
                      width: 44, height: 44, borderRadius: 14, background: 'rgba(255,255,255,0.03)', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      fontSize: 16, fontWeight: 800, color: 'white', border: '1px solid var(--glass-border)' 
                    }}>
                      {user.name ? user.name.charAt(0).toUpperCase() : user.address.charAt(1).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>{user.name || 'Unnamed Session'}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'monospace', marginTop: 4 }}>{user.address.slice(0, 12)}...</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '1px' }}>Enrolled</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'white', marginTop: 4 }}>{new Date(user.joinedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Production Logs / Monitoring */}
        <div style={{ gridColumn: 'span 12' }} className="glass-panel" style={{ padding: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Terminal size={20} color="var(--primary)" />
              <h3 style={{ fontSize: 20, fontWeight: 700 }}>Event Diagnostics</h3>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 800, background: 'rgba(255,255,255,0.05)', padding: '6px 14px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Database size={12} color="var(--primary)" /> SHARDS: 03
              </div>
              <div style={{ fontSize: 10, fontWeight: 800, background: 'rgba(0,255,100,0.1)', color: '#00ff64', padding: '6px 14px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Network size={12} /> TESTNET: ACTIVE
              </div>
            </div>
          </div>
          
          <div style={{ 
            background: 'rgba(0,0,0,0.2)', borderRadius: '24px', border: '1px solid var(--glass-border)', 
            padding: '32px', fontFamily: 'monospace', fontSize: 13, height: 320, overflowY: 'auto',
          }}>
            {productionLogs.length === 0 ? (
              <div style={{ color: 'var(--text-3)', textAlign: 'center', paddingTop: 100, fontSize: 16, fontWeight: 500 }}>
                <Cpu size={40} style={{ margin: '0 auto 24px', opacity: 0.1 }} />
                Initializing Telemetry Handlers...
              </div>
            ) : (
              productionLogs.map(log => (
                <div key={log.id} style={{ marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: 12, display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                   <span style={{ color: 'rgba(255,255,255,0.2)', minWidth: '90px', fontWeight: 600 }}>[{new Date(log.timestamp).toLocaleTimeString()}]</span>{' '}
                   <span style={{ 
                     color: log.type === 'SECURITY' ? 'var(--error)' : log.type === 'VAULT' ? '#3b82f6' : '#00ff64', 
                     fontWeight: 800, minWidth: '80px', fontSize: 11, textTransform: 'uppercase', letterSpacing: '1.5px'
                   }}>{log.type}</span>
                   <span style={{ color: 'var(--text-2)', lineHeight: 1.5 }}>{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
