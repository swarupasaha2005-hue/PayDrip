import React from 'react';
import { useWallet } from '../hooks/useWallet';
import { useApp } from '../hooks/useApp';
import { ShieldCheck, Zap, ArrowUpRight, Clock, Plus, TrendingUp, BarChart3, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UPISimulationModal from '../components/ui/UPISimulationModal';

export default function Dashboard() {
  const { balance } = useWallet();
  const { productionLogs, schedules, updateSchedule } = useApp();
  const navigate = useNavigate();
  const [upiConfig, setUpiConfig] = React.useState(null);
  
  const xlm = parseFloat(balance || 0);

  return (
    <div className="fade-up" style={{ width: '100%' }}>
      {/* Top Row: Header + Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 56 }}>
        <div>
          <h1 style={{ color: 'white', marginBottom: 12 }}>Dashboard</h1>
          <p style={{ color: 'var(--text-3)', fontSize: 18, fontWeight: 500, maxWidth: 500 }}>Your autonomous agent fleet is performing at peak efficiency.</p>
        </div>
        <button 
          className="pd-btn pd-btn-primary" 
          style={{ padding: '18px 36px', fontSize: 15 }} 
          onClick={() => navigate('/subscriptions')}
        >
          <Plus size={20} /> Construct Plan
        </button>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 28, marginBottom: 28 }}>
        
        {/* Agent Log Card */}
        <div className="glass-panel" style={{ height: '460px', padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '28px 28px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'rgba(var(--primary-rgb), 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={18} color="var(--primary)" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Agent Log</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', padding: '0 24px 24px', flex: 1 }}>
            {productionLogs.slice(0, 8).map(log => (
              <div key={log.id} style={{ 
                padding: '14px 16px', 
                borderRadius: 'var(--radius-sm)', 
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.04)',
                transition: 'background 0.2s ease'
              }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-2)' }}>{log.message}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Yield Performance Card */}
        <div className="glass-panel" style={{ height: '460px', padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '36px 40px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Fleet Performance</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                <span style={{ fontSize: 64, fontWeight: 800, letterSpacing: '-0.04em', color: 'white' }}>+4.2%</span>
              </div>
            </div>
            <div style={{ background: 'rgba(var(--primary-rgb), 0.08)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(var(--primary-rgb), 0.15)' }}>
              <TrendingUp size={28} color="var(--primary)" />
            </div>
          </div>
          <div style={{ flex: 1, position: 'relative', minHeight: '100px', marginTop: 20 }}>
            <svg style={{ width: '100%', height: '100%', display: 'block', position: 'absolute', bottom: 0 }} viewBox="0 0 400 150" preserveAspectRatio="none">
              <path d="M0,150 L0,100 Q50,60 100,90 T200,80 T300,110 T400,40 L400,150 Z" fill="url(#chartGrad)" opacity="0.12"/>
              <path d="M0,100 Q50,60 100,90 T200,80 T300,110 T400,40" fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke"/>
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4"/>
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 28 }}>
        
        {/* Available XLM Card */}
        <div className="glass-panel" style={{ padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, background: 'rgba(var(--primary-rgb), 0.08)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, border: '1px solid rgba(var(--primary-rgb), 0.12)' }}>
            <BarChart3 size={24} color="var(--primary)" />
          </div>
          <div style={{ fontSize: 40, fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>{xlm.toFixed(2)}</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 6 }}>Available XLM</div>
        </div>

        {/* Action Required Card */}
        <div className="glass-panel" style={{ padding: '40px', background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.04), rgba(255,255,255,0.02))', border: '1px solid rgba(236, 72, 153, 0.12)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
            <div style={{ background: 'rgba(236, 72, 153, 0.08)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
              <AlertCircle size={20} color="var(--accent)" />
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent)' }}>Action Required</h3>
          </div>
          <div style={{ color: 'var(--text-3)', fontSize: 14, fontWeight: 500, lineHeight: 1.7 }}>
            No critical system alerts. Fleet is operating autonomously.
          </div>
        </div>

        {/* Operations Card */}
        <div className="glass-panel" style={{ padding: '40px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 24 }}>Operations</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
            <div className="pd-field" style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.02)', cursor: 'pointer' }}>
              <ShieldCheck size={20} color="var(--success)" />
              <div style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>Secure Vault</div>
              <ArrowUpRight size={16} color="var(--text-muted)" />
            </div>
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
