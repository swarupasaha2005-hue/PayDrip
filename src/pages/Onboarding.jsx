import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplets, ShieldCheck, Zap, Globe } from 'lucide-react';

const features = [
  { icon: ShieldCheck, title: 'Self-custodial', sub: 'Your keys, your funds via Freighter', color: '#B8A8FF' },
  { icon: Zap,         title: 'Instant & Low-fee', sub: 'Stellar Testnet transactions', color: '#FFB347' },
  { icon: Globe,       title: 'Schedule Payments', sub: 'Lock and release funds by date', color: '#F8BBD0' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(145deg,#EDE9FF 0%,#FAF9F6 55%,#FFE4F0 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:32 }}>
      <div className="fade-up" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, maxWidth:960, width:'100%', alignItems:'center' }}>

        {/* Left */}
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:32 }}>
            <div style={{ width:44, height:44, borderRadius:14, background:'linear-gradient(135deg,#B8A8FF,#F8BBD0)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Droplets size={22} color="white" />
            </div>
            <span style={{ fontWeight:800, fontSize:20, color:'var(--text)' }}>PayDrip</span>
          </div>

          <h1 style={{ fontSize:48, fontWeight:800, lineHeight:1.1, color:'var(--text)', marginBottom:20, letterSpacing:'-1.5px' }}>
            Automate your<br />
            <span style={{ background:'linear-gradient(135deg,#B8A8FF,#F8BBD0)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              payments
            </span><br />
            effortlessly
          </h1>
          <p style={{ fontSize:16, color:'var(--text-2)', lineHeight:1.7, marginBottom:36, maxWidth:380 }}>
            The next-generation fintech dashboard for Stellar. Send, lock, and schedule XLM with a beautiful, intuitive interface.
          </p>

          <div style={{ display:'flex', gap:12 }}>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn btn-primary"
              style={{ padding:'16px 32px', fontSize:16, borderRadius:99 }}
            >
              Get Started →
            </button>
            <button
              onClick={() => window.open('https://www.freighter.app/', '_blank')}
              className="btn btn-ghost"
              style={{ padding:'16px 24px', fontSize:15, borderRadius:99 }}
            >
              Get Freighter
            </button>
          </div>
        </div>

        {/* Right – feature cards */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {features.map(({ icon: Icon, title, sub, color }) => (
            <div
              key={title}
              className="card"
              style={{ display:'flex', alignItems:'center', gap:18, padding:'20px 22px' }}
            >
              <div style={{ width:48, height:48, borderRadius:16, background:`${color}22`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Icon size={22} color={color} />
              </div>
              <div>
                <div style={{ fontWeight:700, fontSize:15, marginBottom:3 }}>{title}</div>
                <div style={{ fontSize:13, color:'var(--text-2)' }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
