import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import { Droplets, ShieldCheck, Zap, Globe, User, Check, Sparkles } from 'lucide-react';

const features = [
  { icon: ShieldCheck, title: 'Self-custodial', sub: 'Your keys, your funds via Freighter', color: '#B8A8FF' },
  { icon: Zap,         title: 'Instant & Low-fee', sub: 'Stellar Testnet transactions', color: '#FFB347' },
  { icon: Globe,       title: 'Schedule Payments', sub: 'Lock and release funds by date', color: '#F8BBD0' },
];

const GENDERS = [
  { id: 'female', label: 'Female' },
  { id: 'male',   label: 'Male' },
  { id: 'other',  label: 'Others' }
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { name, setName, gender, setGender } = useUser();
  const [step, setStep] = useState(1);

  const canContinue = name.trim().length > 0 && gender;

  const fieldStyle = {
    padding:'16px 20px', borderRadius:14, border:'2px solid var(--border)',
    background:'var(--surface)', fontSize:16, fontFamily:'Inter,sans-serif',
    color:'var(--text)', outline:'none', width:'100%', transition:'border-color 0.2s',
  };

  if (step === 1) {
    return (
      <>
        <div style={{ minHeight:'100vh', background:'transparent', display:'flex', alignItems:'center', justifyContent:'center', padding:32, position: 'relative', zIndex: 10 }}>
          <div className="fade-up" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, maxWidth:960, width:'100%', alignItems:'center' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:32 }}>
              <div style={{ width:44, height:44, borderRadius:14, background:'var(--logo-grad)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Droplets size={22} color="white" />
              </div>
              <span style={{ fontWeight:800, fontSize:20, color:'var(--text)' }}>PayDrip</span>
            </div>
            <h1 style={{ fontSize:48, fontWeight:800, lineHeight:1.1, color:'var(--text)', marginBottom:20 }}>
              Automate your<br />
              <span style={{ background:'var(--logo-grad)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                payments
              </span><br />
              effortlessly
            </h1>
            <p style={{ fontSize:16, color:'var(--text-2)', marginBottom:36, maxWidth:380 }}>
              The next-generation fintech dashboard for Stellar. Send, lock, and schedule XLM with a beautiful interface.
            </p>
            <button onClick={() => setStep(2)} className="btn btn-primary" style={{ padding:'16px 32px', fontSize:16, borderRadius:99 }}>
              Get Started →
            </button>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className={`card-glass ${i % 2 !== 0 ? 'offset-y-1' : ''}`} style={{ display:'flex', alignItems:'center', gap:18, padding:'24px 26px' }}>
                  <div style={{ width:48, height:48, borderRadius:16, background:`${f.color}22`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Icon size={22} color={f.color} />
                  </div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:15 }}>{f.title}</div>
                    <div style={{ fontSize:13, color:'var(--text-2)' }}>{f.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
      <div style={{ minHeight:'100vh', background:'transparent', display:'flex', alignItems:'center', justifyContent:'center', padding:32, position: 'relative', zIndex: 10 }}>
        <div className="card-glass fade-up" style={{ maxWidth:440, width:'100%', padding:40, textAlign:'center' }}>
        <div style={{ margin:'0 auto 24px', width:56, height:56, borderRadius:'50%', background:'var(--surface-2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <User size={24} color="var(--primary)" />
        </div>
        <h2 style={{ fontSize:26, fontWeight:800, marginBottom:8 }}>Setup Profile</h2>
        <p style={{ color:'var(--text-2)', fontSize:14, marginBottom:32 }}>Tailor your dashboard experience.</p>

        <div style={{ textAlign:'left', marginBottom:28 }}>
          <label style={{ fontSize:12, fontWeight:700, color:'var(--text-2)', opacity:0.6, marginBottom:8, display:'block', textTransform:'uppercase', letterSpacing:0.5 }}>Display Name</label>
          <input 
            value={name} onChange={e => setName(e.target.value)} 
            placeholder="e.g. Alex" style={fieldStyle}
          />
        </div>

        <div style={{ textAlign:'left', marginBottom:36 }}>
          <label style={{ fontSize:12, fontWeight:700, color:'var(--text-2)', opacity:0.6, marginBottom:12, display:'block', textTransform:'uppercase', letterSpacing:0.5 }}>UI Aesthetics</label>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {GENDERS.map(g => (
              <div 
                key={g.id} 
                onClick={() => setGender(g.id)}
                className={`card-glass ${gender === g.id ? 'active-theme' : ''}`}
                style={{ 
                  display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', cursor:'pointer',
                  border: gender === g.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                  background: gender === g.id ? 'var(--surface)' : 'transparent',
                  transition: 'all 0.2s', borderRadius:14
                }}
              >
                <div style={{ fontWeight:700, fontSize:15, color:'var(--text)' }}>{g.label}</div>
                {gender === g.id && <Check size={18} color="var(--primary)" />}
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={() => navigate('/dashboard')}
          disabled={!canContinue}
          className="btn btn-primary"
          style={{ width:'100%', padding:'18px', fontSize:15, borderRadius:16, opacity: canContinue ? 1 : 0.5 }}
        >
          Explore Dashboard <Sparkles size={14} style={{ marginLeft:6 }} />
        </button>
      </div>
    </div>
    </>
  );
}

