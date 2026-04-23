import React, { useState } from 'react';
import { Target, Activity, Zap, Cpu, ArrowRight } from 'lucide-react';
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
    { id: 'conservative', label: 'Conservative', icon: Target, desc: 'Low drift. Fixed schedule tracking.' },
    { id: 'balanced', label: 'Balanced', icon: Activity, desc: 'Moderate yield seeking within 15% range.' },
    { id: 'aggressive', label: 'Aggressive', icon: Zap, desc: 'High variance. Maximum extraction targets.' }
  ];

  const pushIntent = () => {
    const finalAmountXLM = currencyMode === 'INR' 
      ? (parseFloat(intent.target) / inrRate).toFixed(2)
      : intent.target;

    const success = startDripFlow({
      ...intent,
      target: finalAmountXLM
    });

    if (success) {
      navigate('/activity');
    }
  };

  return (
    <div className="spatial-spread fade-up">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 4px', letterSpacing: '-0.5px' }}>Smart Planner</h1>
        <p style={{ color: 'var(--text-3)', fontSize: 16 }}>Configure automated intent schedules and risk bounds.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        
        {/* Top Configuration Module */}
        <div className="stitch-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <Cpu size={24} color="var(--primary)" />
            <h3 style={{ fontSize: 18, fontWeight: 600 }}>Intent Core Parameters</h3>
          </div>
          
          <div className="stitch-layout-grid">
            <div style={{ gridColumn: 'span 4' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase' }}>Target Extraction ({currencyMode})</label>
                <div 
                  onClick={() => setCurrencyMode(prev => prev === 'XLM' ? 'INR' : 'XLM')}
                  style={{ fontSize: 10, fontWeight: 700, color: 'var(--primary)', cursor: 'pointer', padding: '2px 6px', background: 'var(--surface-2)', borderRadius: 4, border: '1px solid var(--border)' }}
                >
                  SWAP TO {currencyMode === 'XLM' ? 'INR' : 'XLM'}
                </div>
              </div>
              <input 
                type="number" 
                className="stitch-input" 
                placeholder={currencyMode === 'XLM' ? 'e.g. 500' : 'e.g. 4500'} 
                value={intent.target} 
                onChange={e => setIntent({ ...intent, target: e.target.value })} 
              />
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>
                {intent.target && currencyMode === 'INR' && `≈ ${(parseFloat(intent.target) / inrRate).toFixed(2)} XLM`}
                {intent.target && currencyMode === 'XLM' && `≈ ₹${(parseFloat(intent.target) * inrRate).toLocaleString()}`}
                {!intent.target && <span style={{ opacity: 0.5 }}>Real-time conversion active</span>}
              </div>
            </div>
            
            <div style={{ gridColumn: 'span 4' }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-3)', marginBottom: 8, textTransform: 'uppercase' }}>Timeline (Weeks)</label>
              <input 
                type="range" 
                style={{ width: '100%', accentColor: 'var(--primary)', marginTop: 8 }} 
                min="1" max="52" 
                value={intent.timeline} 
                onChange={e => setIntent({ ...intent, timeline: e.target.value })} 
              />
              <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--text-2)', marginTop: 8 }}>{intent.timeline} Weeks</div>
            </div>

            <div style={{ gridColumn: 'span 4' }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-3)', marginBottom: 8, textTransform: 'uppercase' }}>Allowed Flexibility (%)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 14 }}>± {intent.flexibility}%</span>
                <input 
                  type="range" 
                  style={{ width: '100%', accentColor: 'var(--accent)' }} 
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
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--text-2)' }}>Risk Strategy</h3>
          <div className="stitch-layout-grid">
            {strategiesValid.map(strategy => {
              const isSelected = intent.risk === strategy.id;
              const Icon = strategy.icon;
              return (
                <div 
                  key={strategy.id} 
                  onClick={() => setIntent({ ...intent, risk: strategy.id })}
                  className="stitch-card" 
                  style={{ 
                    gridColumn: 'span 4', 
                    cursor: 'pointer',
                    borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                    background: isSelected ? 'var(--surface-2)' : 'var(--surface)',
                    transform: isSelected ? 'translateY(-4px)' : 'none',
                  }}
                >
                  <Icon size={24} color={isSelected ? 'var(--primary)' : 'var(--text-3)'} style={{ marginBottom: 16 }} />
                  <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: 'var(--text)' }}>{strategy.label}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.5 }}>{strategy.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* How It Works Layer */}
        <div style={{ marginTop: 8 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-3)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '1px' }}>How it works</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 20 }}>
            {[
              { t: 'Set Your Goal', d: 'Choose total amount' },
              { t: 'Choose Timeline', d: 'Pay over time' },
              { t: 'Add Flexibility', d: 'Small adjustments' },
              { t: 'Select Strategy', d: 'Define risk profile' },
              { t: 'Automated Flow', d: 'Auto-executions' }
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>{i + 1}</div>
                  {step.t}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.4, paddingLeft: 24 }}>{step.d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Row */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          <button className="btn btn-primary" onClick={pushIntent}>
            Construct Intent <ArrowRight size={16} />
          </button>
        </div>

      </div>
    </div>
  );
}
