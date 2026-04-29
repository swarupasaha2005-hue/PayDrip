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
    <div className="fade-up" style={{ maxWidth: '1100px', margin: '0 auto', paddingTop: '40px' }}>
      <div style={{ marginBottom: 64 }}>
        <h1 style={{ color: 'white' }}>Smart Planner</h1>
        <p style={{ color: 'var(--text-3)', fontSize: 20, fontWeight: 500 }}>Configure automated payment schedules and risk bounds.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 64 }}>
        
        {/* Top Configuration Module */}
        <div className="dark-form" style={{ padding: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
            <div style={{ background: 'rgba(var(--primary-rgb), 0.1)', padding: '12px', borderRadius: '16px', border: '1px solid rgba(var(--primary-rgb), 0.2)' }}>
              <Cpu size={24} color="var(--primary)" />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700 }}>Plan Parameters</h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 32 }}>
            <div style={{ gridColumn: 'span 4' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <label className="pd-field-label" style={{ paddingLeft: 0 }}>Target ({currencyMode})</label>
                <div 
                  onClick={() => setCurrencyMode(prev => prev === 'XLM' ? 'INR' : 'XLM')}
                  style={{ 
                    fontSize: 10, fontWeight: 800, color: 'var(--primary)', cursor: 'pointer', 
                    padding: '4px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '100px', 
                    border: '1px solid var(--glass-border)', textTransform: 'uppercase', letterSpacing: '1px' 
                  }}
                >
                  {currencyMode === 'XLM' ? 'USE INR' : 'USE XLM'}
                </div>
              </div>
              <div className="dark-field" style={{ padding: '16px 20px' }}>
                <input 
                  type="number" 
                  className="dark-input" 
                  placeholder={currencyMode === 'XLM' ? 'e.g. 500' : 'e.g. 4500'} 
                  value={intent.target} 
                  onChange={e => setIntent({ ...intent, target: e.target.value })} 
                />
              </div>
              <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-3)', fontWeight: 600 }}>
                {intent.target && currencyMode === 'INR' && `~ ${(parseFloat(intent.target) / inrRate).toFixed(2)} XLM`}
                {intent.target && currencyMode === 'XLM' && `~ ₹${(parseFloat(intent.target) * inrRate).toLocaleString()}`}
              </div>
            </div>
            
            <div style={{ gridColumn: 'span 4' }}>
              <label className="pd-field-label" style={{ display: 'block', marginBottom: 12 }}>Timeline Strategy</label>
              <div className="dark-field" style={{ padding: '16px 24px', flexDirection: 'column', alignItems: 'stretch', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: 'white' }}>{intent.timeline} Weeks</span>
                  <TrendingUp size={16} color="var(--primary)" />
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
              <label className="pd-field-label" style={{ display: 'block', marginBottom: 12 }}>Drift Flexibility</label>
              <div className="dark-field" style={{ padding: '16px 24px', flexDirection: 'column', alignItems: 'stretch', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: 'white' }}>± {intent.flexibility}% Range</span>
                  <BarChart3 size={16} color="var(--accent)" />
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <Gauge size={20} color="var(--text-3)" />
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '2px' }}>Execution Protocol</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {strategiesValid.map(strategy => {
              const isSelected = intent.risk === strategy.id;
              const Icon = strategy.icon;
              return (
                <div 
                  key={strategy.id} 
                  onClick={() => setIntent({ ...intent, risk: strategy.id })}
                  className="glass-panel" 
                  style={{ 
                    padding: '32px',
                    cursor: 'pointer',
                    borderColor: isSelected ? 'var(--primary)' : 'var(--glass-border)',
                    background: isSelected ? `rgba(var(--primary-rgb), 0.05)` : 'rgba(255,255,255,0.01)',
                  }}
                >
                  <div style={{ 
                    width: '48px', height: '48px', borderRadius: '16px', 
                    background: isSelected ? strategy.accent : 'rgba(255,255,255,0.03)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 24, transition: 'all 0.3s ease'
                  }}>
                    <Icon size={24} color={isSelected ? 'black' : 'var(--text-3)'} />
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: 'white' }}>{strategy.label}</div>
                  <div style={{ fontSize: 14, color: 'var(--text-3)', lineHeight: 1.6, fontWeight: 500 }}>{strategy.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* How It Works Layer */}
        <div>
          <h3 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 24 }}>Engine Workflow</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 20 }}>
            {[
              { t: 'Goal Anchor', d: 'Choose extraction target' },
              { t: 'Velocity Map', d: 'Define time constraints' },
              { t: 'Drift Bounds', d: 'Set flexibility buffers' },
              { t: 'Risk Profile', d: 'Select strategy' },
              { t: 'Sequencing', d: 'Autonomous drips' }
            ].map((step, i) => (
              <div key={i} className="glass-card" style={{ 
                padding: '24px', 
                background: 'rgba(255,255,255,0.01)', borderRadius: '24px' 
              }}>
                <div style={{ width: 28, height: 28, borderRadius: '10px', background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, marginBottom: 16 }}>
                  0{i + 1}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 8 }}>{step.t}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6, fontWeight: 500 }}>{step.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Row */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 80 }}>
          <button className="dark-btn dark-btn-primary" onClick={pushIntent} style={{ padding: '20px 80px', borderRadius: '25px', fontSize: 18 }}>
            Deploy Autonomous Plan <ArrowRight size={20} />
          </button>
        </div>

      </div>
    </div>
  );
}
