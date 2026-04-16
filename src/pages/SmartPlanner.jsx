import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Target, CalendarDays, TrendingUp } from 'lucide-react';
import { inrToXlm } from '../utils/formatters';

export default function SmartPlanner() {
  const navigate = useNavigate();
  const [targetAmount, setTargetAmount] = useState('');
  const [durationMonths, setDurationMonths] = useState('');
  const [plan, setPlan] = useState(null);

  const generatePlan = (e) => {
    e.preventDefault();
    if (!targetAmount || !durationMonths) return;

    const target = parseFloat(targetAmount);
    const months = parseInt(durationMonths);
    if (isNaN(target) || isNaN(months) || months <= 0) return;

    const monthlyAmount = target / months;
    const weeklyAmount = target / (months * 4.33); // avg weeks per month

    setPlan({
      target,
      months,
      monthlyAmount: monthlyAmount.toFixed(2),
      weeklyAmount: weeklyAmount.toFixed(2),
      xlmEquivalent: inrToXlm(weeklyAmount) // using weekly as default for demonstration
    });
  };

  const applyPlan = () => {
    if (!plan) return;
    // Navigate to subscriptions with pre-filled state
    navigate('/subscriptions', {
      state: {
        prefill: {
          service: 'Custom Goal',
          amount: plan.xlmEquivalent,
          fiatAmount: '', // We focus on INR amount via the UI logic in target page, but sending both
          inrAmount: plan.weeklyAmount,
          frequency: 'Weekly',
          note: `Smart Plan for ₹${plan.target} over ${plan.months} months`
        }
      }
    });
  };

  return (
    <div className="fade-up" style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.5px' }}>Smart Planner</h1>
          <p style={{ color: 'var(--text-2)', fontSize: '15px' }}>Let AI help you achieve your financial discipline goals.</p>
        </div>
        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sparkles size={24} />
        </div>
      </div>

      <div className="grid-2-1">
        {/* Input Form */}
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={18} color="var(--primary)" /> Define Your Goal
          </h3>
          <form onSubmit={generatePlan} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="field">
              <label>Target Amount (₹)</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--text-3)', fontWeight: 600 }}>₹</span>
                <input 
                  type="number" 
                  style={{ paddingLeft: '32px' }}
                  placeholder="e.g. 50000" 
                  value={targetAmount}
                  onChange={e => setTargetAmount(e.target.value)}
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="field">
              <label>Duration (Months)</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--text-3)' }}><CalendarDays size={18} /></span>
                <input 
                  type="number" 
                  style={{ paddingLeft: '42px' }}
                  placeholder="e.g. 6" 
                  value={durationMonths}
                  onChange={e => setDurationMonths(e.target.value)}
                  min="1"
                  max="120"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '8px', padding: '14px' }}>
              <Sparkles size={16} /> Generate Plan
            </button>
          </form>
        </div>

        {/* Output Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {!plan ? (
            <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', background: 'var(--bg)', borderStyle: 'dashed' }}>
              <div style={{ padding: '16px', background: 'var(--surface)', borderRadius: '50%', marginBottom: '16px' }}>
                <TrendingUp size={24} color="var(--text-3)" />
              </div>
              <p style={{ color: 'var(--text-2)', fontSize: '14px', lineHeight: 1.5, maxWidth: '200px' }}>
                Enter your target amount and timeline to generate a savings plan.
              </p>
            </div>
          ) : (
            <div className="card fade-up" style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
              
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--primary)' }} />
              
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '16px 0 24px', color: 'var(--text)' }}>AI Recommendation</h3>
              
              <div className="timeline-item">
                <div style={{ fontSize: '12px', color: 'var(--text-2)', fontWeight: 600 }}>WEEKLY DEPOSIT</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', margin: '4px 0' }}>₹{plan.weeklyAmount}</div>
                <div style={{ fontSize: '12px', color: 'var(--info-text)', background: 'var(--info)', padding: '4px 8px', borderRadius: '4px', display: 'inline-block' }}>~{plan.xlmEquivalent} XLM / week</div>
              </div>
              
              <div className="timeline-item">
                <div style={{ fontSize: '12px', color: 'var(--text-2)', fontWeight: 600 }}>MILESTONE</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', margin: '4px 0' }}>Reach ₹{plan.target.toLocaleString()}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-2)' }}>In {plan.months} months</div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '24px' }}>
                <button onClick={applyPlan} className="btn btn-primary" style={{ width: '100%' }}>
                  Apply Plan <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
