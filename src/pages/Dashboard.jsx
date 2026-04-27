import React from 'react';
import { useWallet } from '../hooks/useWallet';
import { useApp } from '../hooks/useApp';
import { Activity, ShieldCheck, Zap, ArrowUpRight, Clock, Plus, Settings, TrendingUp, ChevronRight, BarChart3, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UPISimulationModal from '../components/ui/UPISimulationModal';

export default function Dashboard() {
  const { balance } = useWallet();
  const { productionLogs, schedules, updateSchedule } = useApp();
  const navigate = useNavigate();
  const [upiConfig, setUpiConfig] = React.useState(null);
  
  const xlm = parseFloat(balance || 0);
  const dueSchedules = schedules.filter(s => s.status === 'Due');

  return (
    <div className="spatial-spread fade-up">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 4px', letterSpacing: '-0.5px' }}>Dashboard</h1>
          <p style={{ color: 'var(--text-3)', fontSize: 16 }}>Financial overview and agent telemetry.</p>
        </div>
        <button className="pd-btn pd-btn-primary" onClick={() => navigate('/subscriptions')}>
          <Plus size={16} /> Construct Plan
        </button>
      </div>

      <div className="stitch-layout-grid">
        
        {/* Left Column: Agent Log */}
        <div style={{ gridColumn: 'span 3', display: 'flex', flexDirection: 'column', gap: 32 }}>
          <div className="pd-card-v2" style={{ flex: 1, padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <Clock size={16} color="var(--primary)" />
              <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Agent Log</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {productionLogs.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', fontSize: 13, color: 'var(--text-3)', opacity: 0.6 }}>
                  No automated events recorded.
                </div>
              ) : (
                productionLogs.slice(0, 6).map(log => (
                  <div key={log.id} className="pd-field" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '16px', gap: 8, background: 'var(--bg)', borderStyle: 'solid' }}>
                    <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700 }}>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="badge" style={{ fontSize: 9, background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)', border: '1px solid rgba(var(--primary-rgb), 0.2)' }}>{log.type}</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                      {log.message}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Center Column: Yield Performance */}
        <div style={{ gridColumn: 'span 6', display: 'flex', flexDirection: 'column', gap: 32 }}>
          <div className="pd-card-v2" style={{ flex: 1, padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <label className="pd-field-label" style={{ paddingLeft: 0 }}>Yield Performance</label>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 12 }}>
                    <span style={{ fontSize: 56, fontWeight: 800, letterSpacing: '-2px' }}>+4.2%</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--success)', fontWeight: 800, fontSize: 14, background: 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: '10px' }}>
                      <ArrowUpRight size={16} /> APY
                    </div>
                  </div>
                </div>
                <div style={{ background: 'var(--surface-2)', padding: '12px', borderRadius: '16px' }}>
                  <TrendingUp size={24} color="var(--primary)" />
                </div>
              </div>
            </div>
            
            {/* Wavy Chart Area */}
            <div style={{ flex: 1, position: 'relative', minHeight: '200px' }}>
              <svg style={{ width: '100%', height: '100%', display: 'block', position: 'absolute', bottom: 0 }} viewBox="0 0 400 150" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4"/>
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <path d="M0,150 L0,100 Q50,60 100,90 T200,80 T300,110 T400,40 L400,150 Z" fill="url(#chartGrad)"/>
                <path d="M0,100 Q50,60 100,90 T200,80 T300,110 T400,40" fill="none" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round" vectorEffect="non-scaling-stroke"/>
              </svg>
            </div>

            <div style={{ padding: '24px 32px', background: 'var(--surface-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 13, color: 'var(--text-3)', fontWeight: 600 }}>Active Intent Distribution</div>
              <button className="pd-btn pd-btn-ghost" style={{ padding: '6px 12px', fontSize: 11, borderRadius: '8px' }}>
                Detailed Report <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Quick Actions & Spotlight */}
        <div style={{ gridColumn: 'span 3', display: 'flex', flexDirection: 'column', gap: 32 }}>
          {dueSchedules.length > 0 && (
            <div className="fade-up" style={{ padding: '20px', borderRadius: '24px', border: '2px solid var(--accent)', background: 'linear-gradient(135deg, var(--bg), var(--surface-2))', boxShadow: '0 12px 30px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <AlertCircle size={18} color="var(--accent)" />
                <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--accent)' }}>Action Required</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {dueSchedules.map(s => (
                  <div key={s.id} style={{ background: 'var(--surface)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>{s.service}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 16 }}>Due: ₹{s.inrAmount} ({s.amount} XLM)</div>
                    <button 
                      className="btn" 
                      style={{ background: 'var(--accent)', color: 'white', width: '100%', padding: '12px', fontSize: 13, borderRadius: '12px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
                      onClick={() => {
                        setUpiConfig({
                          amountINR: s.inrAmount,
                          amountXLM: s.amount,
                          recipient: s.service,
                          onConfirm: async () => {
                            updateSchedule(s.id, { status: 'Paid' });
                          }
                        });
                      }}
                    >
                      Pay Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pd-card-v2" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 20, textTransform: 'uppercase', letterSpacing: '1px' }}>Operations</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div 
                className="pd-field" 
                style={{ cursor: 'pointer', padding: '16px', borderStyle: 'solid', background: 'var(--bg)' }} 
                onClick={() => navigate('/vault')}
              >
                <div style={{ background: 'var(--surface)', padding: 10, borderRadius: 14, boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                  <ShieldCheck size={20} color="var(--success)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>Payment Protection</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>Review Approvals</div>
                </div>
                <ChevronRight size={16} color="var(--text-3)" />
              </div>
              
              <div 
                className="pd-field" 
                style={{ cursor: 'pointer', padding: '16px', borderStyle: 'solid', background: 'var(--bg)' }} 
                onClick={() => navigate('/planner')}
              >
                <div style={{ background: 'var(--surface)', padding: 10, borderRadius: 14, boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                  <Zap size={20} color="var(--accent)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>Smart Planner</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>Auto Execution</div>
                </div>
                <ChevronRight size={16} color="var(--text-3)" />
              </div>
            </div>
          </div>

          <div className="pd-card-v2" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%)' }}>
            <div style={{ width: 64, height: 64, background: 'var(--bg)', borderRadius: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, boxShadow: 'inset 2px 4px 8px rgba(0,0,0,0.1)' }}>
              <BarChart3 size={32} color="var(--primary)" />
            </div>
            <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 4, letterSpacing: '-1px' }}>{xlm.toFixed(2)}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '1px' }}>Available XLM</div>
          </div>

        </div>
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
