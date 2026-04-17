import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Target, TrendingUp, AlertTriangle, CheckCircle, Flame } from 'lucide-react';
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

    let feasibilityLevel = { label: 'Moderate', color: 'var(--warning-text)', bg: 'var(--warning)', desc: 'Balanced flow configuration.' };
    
    if (income > 0) {
      const weeklyIncome = income / 4.33;
      const burden = baseWeekly / weeklyIncome;
      if (burden > 0.35) {
        feasibilityLevel = { label: 'Turbulent', color: 'var(--error-text)', bg: 'var(--error)', desc: 'High momentum needed. Accelerated streams might fracture.' };
      } else if (burden < 0.1) {
        feasibilityLevel = { label: 'Tranquil', color: 'var(--success-text)', bg: 'var(--success)', desc: 'Effortless stream mapping based on reserves.' };
      }
    }

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
      safe: { key: 'safe', label: 'Safe Plan', duration: safeDuration, amount: safeWeekly, icon: CheckCircle, color: '#10B981', desc: 'Easier to maintain.' },
      balanced: { key: 'balanced', label: 'Balanced Plan', duration: duration, amount: balancedWeekly, icon: TrendingUp, color: '#F59E0B', desc: 'Steady pace.' },
      fast: { key: 'fast', label: 'Rapid Plan', duration: fastDuration, amount: fastWeekly, icon: Flame, color: '#EF4444', desc: 'Aggressive timeline.' }
    });
  };

  const applyPlan = (planProfile) => {
    addNotification('insight', `Initializing ${planProfile.label} for ₹${planProfile.amount}/week.`);
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
    padding: '16px 20px', borderRadius: '999px', border: '1px solid var(--border)',
    background: 'rgba(255,255,255,0.05)', fontSize: '15px', color: 'white', 
    outline: 'none', width: '100%', boxShadow: 'inset 0 2px 10px rgba(255,255,255,0.05), 0 0 10px var(--border-glow)'
  };

  return (
    <div className="spatial-spread fade-up">
      <div style={{ position: 'relative', zIndex: 10, paddingLeft: 12, marginBottom: 40 }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 8px', letterSpacing: '-1px' }}>Smart Planner</h1>
        <p style={{ color: 'var(--text-2)', fontSize: '16px' }}>Plan your financial goals and automate your savings.</p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '48px', alignItems: 'stretch' }}>
        
        {/* Input Parameters - Vertical Blob */}
        <div className="module" style={{ flex: '1 1 350px', borderRadius: 32, background: 'linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', boxShadow: '0 0 40px rgba(255, 0, 255, 0.15)', color: 'white', padding: '60px 48px', minHeight: 600 }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Target size={22} /> Goal Details
          </h3>
          <form onSubmit={generatePlan} style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
            
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, opacity: 0.8, marginBottom: 8, display: 'block', textTransform:'uppercase' }}>Target Amount (₹)</label>
              <input type="number" style={fieldStyle} placeholder="e.g. 50000" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} required min="100"/>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 700, opacity: 0.8, marginBottom: 8, display: 'block', textTransform:'uppercase' }}>Timeline (Weeks)</label>
              <input type="number" style={fieldStyle} placeholder="e.g. 12" value={durationWeeks} onChange={e => setDurationWeeks(e.target.value)} required min="2" />
            </div>

            <div style={{ height: 1, background: 'rgba(255,255,255,0.2)', margin: '16px 0' }} />

            <div>
              <label style={{ fontSize: 13, fontWeight: 700, opacity: 0.8, marginBottom: 8, display: 'block', textTransform:'uppercase' }}>Current Savings (₹)</label>
              <input type="number" style={fieldStyle} placeholder="Optional" value={currentSavings} onChange={e => setCurrentSavings(e.target.value)} min="0" />
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 700, opacity: 0.8, marginBottom: 8, display: 'block', textTransform:'uppercase' }}>Monthly Income (₹)</label>
              <input type="number" style={fieldStyle} placeholder="Optional" value={monthlyIncome} onChange={e => setMonthlyIncome(e.target.value)} min="0" />
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 700, opacity: 0.8, marginBottom: 8, display: 'block', textTransform:'uppercase' }}>Risk Preference</label>
              <select style={{...fieldStyle, appearance: 'none' }} value={riskPreference} onChange={e => setRiskPreference(e.target.value)}>
                <option value="conservative">Conservative</option>
                <option value="moderate">Moderate</option>
                <option value="aggressive">Aggressive</option>
              </select>
            </div>

            <button type="submit" className="btn" style={{ marginTop: '24px', padding: '16px', background: 'white', color: 'var(--primary-dark)', border: 'none', borderRadius: '999px', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
              <Sparkles size={18} /> Generate Plans
            </button>
          </form>
        </div>

        {/* Output Area - Floating cluster */}
        <div style={{ flex: '2 1 500px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {!plans ? (
            <div className="module" style={{ height: '100%', flex: 1, minHeight: 400, justifyContent: 'center', flexDirection: 'column', textAlign: 'center', background: 'linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', boxShadow: '0 0 40px rgba(255, 0, 255, 0.15)', borderRadius: 32, padding: '40px' }}>
              <div style={{ padding: '24px', background: 'var(--surface)', borderRadius: '50%', marginBottom: '16px', boxShadow: 'var(--shadow-sm)' }}>
                <TrendingUp size={32} color="var(--primary)" />
              </div>
              <h3 style={{ color: 'var(--text)', fontSize: '22px', fontWeight: 800, marginBottom: '12px' }}>Analysis</h3>
              <p style={{ color: 'var(--text-3)', fontSize: '15px', lineHeight: 1.6, maxWidth: '320px' }}>
                Enter your details on the left. We will calculate Safe, Balanced, and Rapid savings plans for your goal.
              </p>
            </div>
          ) : (
            <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              <div className="module-pill" style={{ background: feasibility.bg, padding: '20px 32px', display: 'flex', gap: '20px', alignItems: 'center', width: '100%' }}>
                <AlertTriangle size={28} color={feasibility.color} />
                <div>
                  <h4 style={{ color: feasibility.color, fontWeight: 800, margin: '0 0 6px 0', fontSize: '16px', textTransform:'uppercase', letterSpacing:1 }}>Diagnosis: {feasibility.label}</h4>
                  <p style={{ color: 'white', margin: 0, fontSize: '14px', opacity: 0.9 }}>{feasibility.desc}</p>
                </div>
              </div>

              {/* Glowing Neon Trajectory Graph embedded above plans */}
              <div className="module" style={{ padding: 40, position: 'relative', overflow: 'hidden' }}>
                <h4 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-3)', letterSpacing: 2, marginBottom: 24, textTransform: 'uppercase' }}>Savings Simulation Graph</h4>
                <svg width="100%" height="160" viewBox="0 0 800 160" style={{ filter: 'drop-shadow(0 0 16px var(--primary))' }}>
                  {/* Grid lines */}
                  <line x1="0" y1="40" x2="800" y2="40" stroke="var(--border)" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="0" y1="80" x2="800" y2="80" stroke="var(--border)" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="0" y1="120" x2="800" y2="120" stroke="var(--border)" strokeWidth="1" strokeDasharray="4 4" />
                  
                  {/* Rapid Plan Line */}
                  <path d="M0,140 Q 200,120 400,60 T 800,20" fill="none" stroke="#EF4444" strokeWidth="4" filter="drop-shadow(0 0 8px #EF4444)" strokeLinecap="round" />
                  
                  {/* Balanced Plan Line */}
                  <path d="M0,140 Q 200,130 400,90 T 800,40" fill="none" stroke="#F59E0B" strokeWidth="4" filter="drop-shadow(0 0 8px #F59E0B)" strokeLinecap="round" />
                  
                  {/* Safe Plan Line */}
                  <path d="M0,140 Q 200,140 400,110 T 800,70" fill="none" stroke="#10B981" strokeWidth="4" filter="drop-shadow(0 0 8px #10B981)" strokeLinecap="round" />
                  
                  <circle cx="800" cy="20" r="6" fill="#EF4444" filter="drop-shadow(0 0 10px #EF4444)" />
                  <circle cx="800" cy="40" r="6" fill="#F59E0B" filter="drop-shadow(0 0 10px #F59E0B)" />
                  <circle cx="800" cy="70" r="6" fill="#10B981" filter="drop-shadow(0 0 10px #10B981)" />
                </svg>
              </div>

              <div className="organic-cluster" style={{ padding: 0 }}>
                {[plans.safe, plans.balanced, plans.fast].map((plan, i) => {
                  const Icon = plan.icon;
                  return (
                    <div key={plan.key} className="module fade-up" style={{ borderRadius: 24, flex: '1 1 250px', background: 'linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))', border: `1px solid ${plan.color}80`, backdropFilter: 'blur(20px)', boxShadow: '0 0 40px rgba(255, 0, 255, 0.15)', padding: '40px 32px', transform: `translateY(${i % 2 !== 0 ? '24px' : '0'})` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: `${plan.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon size={20} color={plan.color} />
                        </div>
                      </div>

                      <div style={{ marginBottom: '24px' }}>
                         <div style={{ fontSize: '11px', color: 'var(--text-3)', fontWeight: 700, letterSpacing: '1px', marginBottom: '6px' }}>PLAN PREVIEW</div>
                         <div style={{ fontSize: '36px', fontWeight: 800, color: plan.color, letterSpacing: '-1px' }}>₹{plan.amount}</div>
                      </div>

                      <div style={{ background: 'var(--surface-2)', borderRadius: '24px', padding: '16px', marginBottom: '32px' }}>
                         <div style={{ fontSize: '14px', color: 'var(--text)', fontWeight: 700 }}>{plan.duration} Weeks</div>
                         <div style={{ fontSize: '13px', color: 'var(--text-2)', marginTop: '6px' }}>{plan.desc}</div>
                      </div>

                      <button onClick={() => applyPlan(plan)} className="btn" style={{ width: '100%', background: plan.color, color: 'white', border: 'none', boxShadow: `0 8px 24px ${plan.color}40` }}>
                        Select {plan.label} <ArrowRight size={16} />
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
