import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Target, CalendarDays, TrendingUp, AlertTriangle, CheckCircle, Flame } from 'lucide-react';
import { inrToXlm } from '../utils/formatters';
import { useApp } from '../hooks/useApp';

export default function SmartPlanner() {
  const navigate = useNavigate();
  const { addNotification } = useApp();

  const [targetAmount, setTargetAmount] = useState('');
  const [durationWeeks, setDurationWeeks] = useState('');
  const [currentSavings, setCurrentSavings] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [riskPreference, setRiskPreference] = useState('moderate');
  
  const [plans, setPlans] = useState(null);
  const [feasibility, setFeasibility] = useState(null);

  const roundAmount = (amount) => {
    if (amount <= 500) return Math.ceil(amount / 50) * 50; 
    return Math.ceil(amount / 100) * 100;
  };

  const generatePlan = (e) => {
    e.preventDefault();
    if (!targetAmount || !durationWeeks) return;

    const target = parseFloat(targetAmount) || 0;
    const duration = parseInt(durationWeeks) || 0;
    const savings = parseFloat(currentSavings) || 0;
    const income = parseFloat(monthlyIncome) || 0;

    if (duration <= 0 || target <= savings) return;

    const netTarget = target - savings;
    const baseWeekly = netTarget / duration;

    // Feasibility Analysis
    let feasibilityLevel = { label: 'Moderate', color: 'var(--warning-text)', bg: 'var(--warning)', desc: 'This is a balanced goal.' };
    
    if (income > 0) {
      const weeklyIncome = income / 4.33;
      const burden = baseWeekly / weeklyIncome;
      if (burden > 0.35) {
        feasibilityLevel = { label: 'Challenging', color: 'var(--error-text)', bg: 'var(--error)', desc: 'High percentage of your income. Fast plans might be tough.' };
      } else if (burden < 0.1) {
        feasibilityLevel = { label: 'Easy', color: 'var(--success-text)', bg: 'var(--success)', desc: 'Very feasible target based on your income.' };
      }
    }

    // Dynamic Plan Generation
    let safeDuration = duration + 4;
    let fastDuration = Math.max(1, duration - 2);

    if (riskPreference === 'conservative') safeDuration += 2;
    if (riskPreference === 'aggressive') fastDuration = Math.max(1, duration - 4);

    const safeWeekly = roundAmount(netTarget / safeDuration);
    const balancedWeekly = roundAmount(baseWeekly);
    const fastWeekly = roundAmount(netTarget / fastDuration);

    setFeasibility(feasibilityLevel);
    
    setPlans({
      target: netTarget,
      safe: { key: 'safe', label: 'Safe Plan', duration: safeDuration, amount: safeWeekly, icon: CheckCircle, color: '#10B981', bg: '#D1FAE5', desc: 'Lower weekly burden.' },
      balanced: { key: 'balanced', label: 'Balanced Plan', duration: duration, amount: balancedWeekly, icon: TrendingUp, color: '#F59E0B', bg: '#FEF3C7', desc: 'Your baseline target.' },
      fast: { key: 'fast', label: 'Fast Plan', duration: fastDuration, amount: fastWeekly, icon: Flame, color: '#EF4444', bg: '#FEE2E2', desc: 'Reach your goal faster.' }
    });
  };

  const applyPlan = (planProfile) => {
    addNotification('insight', `AI Applied: Starting the ${planProfile.label} for ₹${planProfile.amount}/week.`);
    navigate('/subscriptions', {
      state: {
        prefill: {
          service: 'Custom Goal',
          amount: inrToXlm(planProfile.amount),
          inrAmount: planProfile.amount,
          frequency: 'Weekly',
          note: `Smart Plan: ₹${plans.target} in ${planProfile.duration} weeks`
        }
      }
    });
  };

  const fieldStyle = {
    padding: '12px 14px', borderRadius: '10px', border: '2px solid var(--border)',
    background: 'var(--surface-2)', fontSize: '14px', width: '100%', outline: 'none'
  };

  return (
    <div className="fade-up" style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.5px' }}>Enhanced Smart Planner</h1>
          <p style={{ color: 'var(--text-2)', fontSize: '15px' }}>Intelligent modeling to map your path to financial targets.</p>
        </div>
        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--primary-dark)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sparkles size={24} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '24px' }} className="grid-stack-adapt">
        
        {/* Input Form */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={18} color="var(--primary)" /> Goal Parameters
          </h3>
          <form onSubmit={generatePlan} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div className="field">
              <label>Target Amount (₹) *</label>
              <input type="number" style={fieldStyle} placeholder="e.g. 50000" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} required min="100"/>
            </div>

            <div className="field">
              <label>Timeline (Weeks) *</label>
              <input type="number" style={fieldStyle} placeholder="e.g. 12" value={durationWeeks} onChange={e => setDurationWeeks(e.target.value)} required min="2" />
            </div>

            <div className="divider" style={{ margin: '8px 0' }} />

            <div className="field">
              <label>Current Savings (₹)</label>
              <input type="number" style={fieldStyle} placeholder="Optional" value={currentSavings} onChange={e => setCurrentSavings(e.target.value)} min="0" />
            </div>

            <div className="field">
              <label>Monthly Income (₹)</label>
              <input type="number" style={fieldStyle} placeholder="Optional" value={monthlyIncome} onChange={e => setMonthlyIncome(e.target.value)} min="0" />
            </div>

            <div className="field">
              <label>Risk Preference</label>
              <select style={fieldStyle} value={riskPreference} onChange={e => setRiskPreference(e.target.value)}>
                <option value="conservative">Conservative</option>
                <option value="moderate">Moderate</option>
                <option value="aggressive">Aggressive</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '12px', padding: '14px' }}>
              <Sparkles size={16} /> Analyze Options
            </button>
          </form>
        </div>

        {/* Output Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {!plans ? (
            <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', background: 'var(--bg)', borderStyle: 'dashed' }}>
              <div style={{ padding: '16px', background: 'var(--surface)', borderRadius: '50%', marginBottom: '16px' }}>
                <TrendingUp size={24} color="var(--text-3)" />
              </div>
              <h3 style={{ color: 'var(--text)', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Awaiting Parameters</h3>
              <p style={{ color: 'var(--text-2)', fontSize: '14px', lineHeight: 1.5, maxWidth: '280px' }}>
                Fill out the metrics on the left. Our AI will compute Safe, Balanced, and Fast trajectories for your goal.
              </p>
            </div>
          ) : (
            <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Feasibility Alert */}
              <div style={{ background: feasibility.bg, borderLeft: `4px solid ${feasibility.color}`, padding: '16px 20px', borderRadius: '12px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <AlertTriangle size={24} style={{ color: feasibility.color }} />
                <div>
                  <h4 style={{ color: feasibility.color, fontWeight: 800, margin: '0 0 4px 0', fontSize: '15px' }}>Feasibility: {feasibility.label}</h4>
                  <p style={{ color: 'var(--text)', margin: 0, fontSize: '13px', opacity: 0.8 }}>{feasibility.desc}</p>
                </div>
              </div>

              {/* Plan Options */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                {[plans.safe, plans.balanced, plans.fast].map(plan => {
                  const Icon = plan.icon;
                  return (
                    <div key={plan.key} className="card fade-up" style={{ borderTop: `4px solid ${plan.color}`, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Icon size={18} color={plan.color} />
                          <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text)' }}>{plan.label}</span>
                        </div>
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                         <div style={{ fontSize: '11px', color: 'var(--text-3)', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '4px' }}>WEEKLY DEPOSIT</div>
                         <div style={{ fontSize: '28px', fontWeight: 800, color: plan.color }}>₹{plan.amount}</div>
                      </div>

                      <div style={{ background: 'var(--bg)', borderRadius: '8px', padding: '10px 12px', marginBottom: '24px' }}>
                         <div style={{ fontSize: '13px', color: 'var(--text-2)' }}><strong>Timeline:</strong> {plan.duration} Weeks</div>
                         <div style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '4px' }}>{plan.desc}</div>
                      </div>

                      <button onClick={() => applyPlan(plan)} className="btn btn-ghost" style={{ marginTop: 'auto', width: '100%', border: `1px solid ${plan.color}`, color: plan.color }}>
                        Apply {plan.label} <ArrowRight size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
