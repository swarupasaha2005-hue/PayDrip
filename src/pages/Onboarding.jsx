import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Droplets, ShieldCheck, Zap, Globe, User, Check, Sparkles } from 'lucide-react';

const features = [
  { icon: ShieldCheck, title: 'Self-custodial', sub: 'Your keys, your funds via Freighter', color: '#B8A8FF' },
  { icon: Zap,         title: 'Instant & Low-fee', sub: 'Stellar Testnet transactions', color: '#FFB347' },
  { icon: Globe,       title: 'Schedule Payments', sub: 'Lock and release funds by date', color: '#F8BBD0' },
];

const GENDERS = [
  { id: 'female', label: 'Female', emo: '🌸', desc: 'Soft & Elegant Pastel Theme' },
  { id: 'male',   label: 'Male',   emo: '🕶️', desc: 'Bold & Structured Dark Theme' },
  { id: 'other',  label: 'Others', emo: '🌈', desc: 'Balanced & Modern Neutral Theme' }
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
      <div style={{ minHeight:'100vh', background:'linear-gradient(145deg,var(--surface-2) 0%,var(--bg) 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:32 }}>
        <div className="fade-up" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, maxWidth:960, width:'100%', alignItems:'center' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:32 }}>
              <div style={{ width:44, height:44, borderRadius:14, background:'linear-gradient(135deg,var(--primary),var(--primary-dark))', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Droplets size={22} color="white" />
              </div>
              <span style={{ fontWeight:800, fontSize:20, color:'var(--text)' }}>PayDrip</span>
            </div>
            <h1 style={{ fontSize:48, fontWeight:800, lineHeight:1.1, color:'var(--text)', marginBottom:20 }}>
              Automate your<br />
              <span style={{ background:'linear-gradient(135deg,var(--primary),var(--primary-dark))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
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
            {features.map(({ icon: Icon, title, sub, color }) => (
              <div key={title} className="card" style={{ display:'flex', alignItems:'center', gap:18, padding:'20px 22px' }}>
                <div style={{ width:48, height:48, borderRadius:16, background:`${color}22`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Icon size={22} color={color} />
                </div>
                <div>
                  <div style={{ fontWeight:700, fontSize:15 }}>{title}</div>
                  <div style={{ fontSize:13, color:'var(--text-2)' }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', padding:32 }}>
      <div className="card fade-up" style={{ maxWidth:480, width:'100%', padding:40, textAlign:'center' }}>
        <div style={{ margin:'0 auto 24px', width:56, height:56, borderRadius:'50%', background:'var(--surface-2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <User size={24} color="var(--primary)" />
        </div>
        <h2 style={{ fontSize:28, fontWeight:800, marginBottom:8 }}>Personalize Experience</h2>
        <p style={{ color:'var(--text-2)', fontSize:15, marginBottom:32 }}>Tell us a bit about yourself to tailor the UI theme.</p>

        <div style={{ textAlign:'left', marginBottom:28 }}>
          <label style={{ fontSize:13, fontWeight:700, color:'var(--text-3)', marginBottom:8, display:'block', textTransform:'uppercase', letterSpacing:0.5 }}>Your Name</label>
          <input 
            value={name} onChange={e => setName(e.target.value)} 
            placeholder="e.g. Alex" style={fieldStyle}
          />
        </div>

        <div style={{ textAlign:'left', marginBottom:36 }}>
          <label style={{ fontSize:13, fontWeight:700, color:'var(--text-3)', marginBottom:12, display:'block', textTransform:'uppercase', letterSpacing:0.5 }}>Select UI Theme</label>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {GENDERS.map(g => (
              <div 
                key={g.id} 
                onClick={() => setGender(g.id)}
                className={`card ${gender === g.id ? 'active-theme' : ''}`}
                style={{ 
                  display:'flex', alignItems:'center', gap:14, padding:'14px 18px', cursor:'pointer',
                  border: gender === g.id ? '2px solid var(--primary)' : '2px solid transparent',
                  background: gender === g.id ? 'var(--surface-2)' : 'var(--surface)',
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ fontSize:24 }}>{g.emo}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:15 }}>{g.label}</div>
                  <div style={{ fontSize:11, color:'var(--text-3)' }}>{g.desc}</div>
                </div>
                {gender === g.id && <Check size={18} color="var(--primary)" />}
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={() => navigate('/dashboard')}
          disabled={!canContinue}
          className="btn btn-primary"
          style={{ width:'100%', padding:'18px', fontSize:16, borderRadius:16, opacity: canContinue ? 1 : 0.5 }}
        >
          Explore PayDrip <Sparkles size={16} />
        </button>
      </div>
    </div>
  );
}

