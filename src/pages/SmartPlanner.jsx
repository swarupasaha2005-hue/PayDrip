import React, { useState } from 'react';
import { Target, Activity, Zap, Cpu, ArrowRight, TrendingUp, BarChart3, Gauge } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp';

export default function SmartPlanner() {
  const navigate = useNavigate();
  const { inrRate, startDripFlow } = useApp();

  const [currencyMode, setCurrencyMode] = useState('XLM'); // 'XLM' or 'INR'
  const [intent, setIntent] = useState({
    target: '',
    timeline: 12,
    risk: 'balanced',
    flexibility: 15
  });

  const strategiesValid = [
    { id: 'conservative', label: 'Conservative', icon: Target, desc: 'Low drift. Fixed schedule tracking.', accent: 'var(--success)' },
    { id: 'balanced', label: 'Balanced', icon: Activity, desc: 'Moderate yield seeking within 15% range.', accent: 'var(--primary)' },
    { id: 'aggressive', label: 'Aggressive', icon: Zap, desc: 'High variance. Maximum extraction targets.', accent: 'var(--error)' }
  ];

  const pushIntent = async () => {
    const finalAmountXLM = currencyMode === 'INR' 
      ? (parseFloat(intent.target) / inrRate).toFixed(2)
      : intent.target;

    const success = await startDripFlow({
      ...intent,
      target: finalAmountXLM
    });

    if (success) {
      navigate('/activity');
    }
  };

  return (
    <div className="spatial-spread fade-up">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 4px', letterSpacing: '-0.5px' }}>Smart Planner</h1>
        <p style={{ color: 'var(--text-3)', fontSize: 16 }}>Configure automated payment schedules and risk bounds.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
        
        {/* Top Configuration Module */}
        <div className="pd-card-v2" style={{ background: 'var(--bg)', borderStyle: 'dashed' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <div style={{ background: 'var(--primary)', padding: '10px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(var(--primary-rgb), 0.2)' }}>
              <Cpu size={22} color="white" />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700 }}>Plan Parameters</h3>
          </div>
          
          <div className="stitch-layout-grid">
            <div style={{ gridColumn: 'span 4' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <label className="pd-field-label" style={{ paddingLeft: 0 }}>Target Yield ({currencyMode})</label>
                <div 
                  onClick={() => setCurrencyMode(prev => prev === 'XLM' ? 'INR' : 'XLM')}
                  style={{ 
                    fontSize: 10, fontWeight: 800, color: 'var(--primary)', cursor: 'pointer', 
                    padding: '4px 10px', background: 'var(--surface)', borderRadius: '12px', 
                    border: '1px solid var(--border)', textTransform: 'uppercase', letterSpacing: '0.5px' 
                  }}
                >
                  {currencyMode === 'XLM' ? '→ INR' : '→ XLM'}
                </div>
              </div>
              <div className="pd-field" style={{ padding: '16px 20px' }}>
                <input 
                  type="number" 
                  className="pd-input" 
                  placeholder={currencyMode === 'XLM' ? 'e.g. 500' : 'e.g. 4500'} 
                  value={intent.target} 
                  onChange={e => setIntent({ ...intent, target: e.target.value })} 
                />
              </div>
              <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-3)', fontWeight: 600, paddingLeft: 4 }}>
                {intent.target && currencyMode === 'INR' && `Estimated: ${(parseFloat(intent.target) / inrRate).toFixed(2)} XLM`}
                {intent.target && currencyMode === 'XLM' && `Estimated: ₹${(parseFloat(intent.target) * inrRate).toLocaleString()}`}
              </div>
            </div>
            
            <div style={{ gridColumn: 'span 4' }}>
              <label className="pd-field-label" style={{ display: 'block', marginBottom: 12, paddingLeft: 0 }}>Timeline Strategy</label>
              <div className="pd-field" style={{ padding: '16px 20px', flexDirection: 'column', alignItems: 'stretch', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{intent.timeline} Weeks</span>
                  <TrendingUp size={14} color="var(--primary)" />
                </div>
                <input 
                  type="range" 
                  style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }} 
                  min="1" max="52" 
                  value={intent.timeline} 
                  onChange={e => setIntent({ ...intent, timeline: e.target.value })} 
                />
              </div>
            </div>

            <div style={{ gridColumn: 'span 4' }}>
              <label className="pd-field-label" style={{ display: 'block', marginBottom: 12, paddingLeft: 0 }}>Drift Flexibility</label>
              <div className="pd-field" style={{ padding: '16px 20px', flexDirection: 'column', alignItems: 'stretch', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>± {intent.flexibility}% Range</span>
                  <BarChart3 size={14} color="var(--accent)" />
                </div>
                <input 
                  type="range" 
                  style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }} 
                  min="0" max="100" 
                  value={intent.flexibility} 
                  onChange={e => setIntent({ ...intent, flexibility: e.target.value })} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Risk Matrices Row */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Gauge size={20} color="var(--text-3)" />
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-2)', letterSpacing: '-0.3px' }}>Execution Protocol</h3>
          </div>
          <div className="stitch-layout-grid">
            {strategiesValid.map(strategy => {
              const isSelected = intent.risk === strategy.id;
              const Icon = strategy.icon;
              return (
                <div 
                  key={strategy.id} 
                  onClick={() => setIntent({ ...intent, risk: strategy.id })}
                  className="pd-card-v2" 
                  style={{ 
                    gridColumn: 'span 4', 
                    cursor: 'pointer',
                    borderColor: isSelected ? strategy.accent : 'var(--border)',
                    background: isSelected ? `rgba(var(--primary-rgb), 0.03)` : 'var(--surface)',
                    boxShadow: isSelected ? `0 8px 30px rgba(0,0,0,0.1)` : 'none'
                  }}
                >
                  <div style={{ 
                    width: '44px', height: '44px', borderRadius: '14px', 
                    background: isSelected ? strategy.accent : 'var(--surface-2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 20, transition: 'all 0.3s ease'
                  }}>
                    <Icon size={24} color={isSelected ? 'white' : 'var(--text-3)'} />
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>{strategy.label}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.6 }}>{strategy.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* How It Works Layer */}
        <div style={{ marginTop: 8 }}>
          <h3 className="pd-field-label" style={{ marginBottom: 24, paddingLeft: 0 }}>Engine Workflow</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
            {[
              { t: 'Goal Anchor', d: 'Choose total extraction target' },
              { t: 'Velocity Map', d: 'Define pay-over-time constraints' },
              { t: 'Drift Bounds', d: 'Set adjustment flexibility buffers' },
              { t: 'Risk Profile', d: 'Select execution strategy' },
              { t: 'Live Streaming', d: 'Autonomous drip sequences' }
            ].map((step, i) => (
              <div key={i} className="pd-field" style={{ 
                flexDirection: 'column', alignItems: 'flex-start', padding: '20px', 
                gap: 12, background: 'var(--surface)', borderRadius: '22px', borderStyle: 'solid' 
              }}>
                <div style={{ width: 24, height: 24, borderRadius: '8px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>
                  0{i + 1}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{step.t}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.5 }}>{step.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Row */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button className="pd-btn pd-btn-primary" onClick={pushIntent} style={{ padding: '20px 60px', borderRadius: '30px', fontSize: 16 }}>
            Deploy Auto Plan <ArrowRight size={20} />
          </button>
        </div>

      </div>
    </div>
  );
}
