import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import { Droplets, ShieldCheck, Zap, Globe, User, Check, Sparkles, UserCircle } from 'lucide-react';

const features = [
  { icon: ShieldCheck, title: 'Self-custodial', sub: 'Your keys, your funds via Freighter', color: '#B8A8FF' },
  { icon: Zap,         title: 'Instant & Low-fee', sub: 'Stellar Testnet transactions', color: '#FFB347' },
  { icon: Globe,       title: 'Schedule Payments', sub: 'Lock and release funds by date', color: '#F8BBD0' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { name, setName, gender, setGender } = useUser();
  const [step, setStep] = useState(1);

  const handleFinish = (e) => {
    e.preventDefault();
    if (name.trim() && gender) {
      navigate('/dashboard');
    }
  };

  if (step === 1) {
    return (
      <div style={{ minHeight:'100vh', background:'transparent', display:'flex', alignItems:'center', justifyContent:'center', padding:32, position: 'relative', zIndex: 10 }}>
        <div className="fade-up" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, maxWidth:960, width:'100%', alignItems:'center' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', marginBottom:32 }}>
               <div style={{ 
                width: '140px', 
                height: '40px',
                backgroundColor: gender === 'male' ? '#2F4BA2' : (gender === 'other' ? '#10B981' : '#E947F5'),
                backgroundImage: `linear-gradient(135deg, ${gender === 'male' ? '#2F4BA2' : (gender === 'other' ? '#10B981' : '#E947F5')}, ${gender === 'male' ? '#4BA5FA' : (gender === 'other' ? '#34D399' : '#FF8AFB')})`,
                maskImage: 'url(/logo.png)',
                WebkitMaskImage: 'url(/logo.png)',
                maskSize: 'contain',
                WebkitMaskSize: 'contain',
                maskRepeat: 'no-repeat',
                WebkitMaskRepeat: 'no-repeat',
                maskPosition: 'left center',
                WebkitMaskPosition: 'left center',
                transition: 'background 0.8s ease, filter 0.8s ease',
                filter: `drop-shadow(0 4px 16px ${gender === 'male' ? '#2F4BA2' : (gender === 'other' ? '#10B981' : '#E947F5')}88)`
              }} />
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
    );
  }

  return (
    <div className="onboarding-container fade-up">
      <form className="form" onSubmit={handleFinish}>
        <p id="heading">Initialize Identity</p>
        
        <div className="field">
          <User className="input-icon" />
          <input 
            autoComplete="off" 
            placeholder="Legal Name" 
            className="input-field" 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div style={{ marginTop: '20px' }}>
          <p style={{ color: 'white', fontSize: '13px', textAlign: 'center', marginBottom: '15px', opacity: 0.7 }}>SELECT GENDER</p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button 
              type="button"
              className="button1" 
              style={{ background: gender === 'male' ? 'var(--primary)' : '#252525', border: gender === 'male' ? '1px solid white' : 'none' }}
              onClick={() => setGender('male')}
            >
              Male
            </button>
            <button 
              type="button"
              className="button2" 
              style={{ background: gender === 'female' ? 'var(--primary)' : '#252525', border: gender === 'female' ? '1px solid white' : 'none' }}
              onClick={() => setGender('female')}
            >
              Female
            </button>
          </div>
        </div>

        <button 
          type="button"
          className="button3" 
          style={{ 
            marginTop: '15px',
            background: gender === 'other' ? 'var(--primary)' : '#252525', 
            border: gender === 'other' ? '1px solid white' : 'none',
            marginBottom: '10px'
          }}
          onClick={() => setGender('other')}
        >
          Non-Binary / Others
        </button>

        <div className="btn">
          <button 
            type="submit" 
            className="button2" 
            style={{ width: '100%', padding: '12px', background: 'var(--primary)', color: 'white', opacity: (name.trim() && gender) ? 1 : 0.5 }}
            disabled={!name.trim() || !gender}
          >
            Finalize Profile
          </button>
        </div>
      </form>

      <style jsx="true">{`
        .onboarding-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: transparent;
          position: relative;
          z-index: 10;
        }

        /* From Uiverse.io by Praashoo7 */ 
        .form {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding-left: 2em;
          padding-right: 2em;
          padding-bottom: 2em;
          background-color: #171717;
          border-radius: 25px;
          transition: .4s ease-in-out;
          width: 1000px;
          max-width: 400px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5);
          border: 1px solid rgba(255,255,255,0.05);
        }

        .form:hover {
          transform: scale(1.02);
          border-color: var(--primary);
        }

        #heading {
          text-align: center;
          margin: 2em;
          color: rgb(255, 255, 255);
          font-size: 1.5em;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .field {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.8em;
          border-radius: 25px;
          padding: 1em;
          border: none;
          outline: none;
          color: white;
          background-color: #171717;
          box-shadow: inset 2px 5px 10px rgb(5, 5, 5);
          border: 1px solid rgba(255,255,255,0.05);
        }

        .input-icon {
          height: 1.3em;
          width: 1.3em;
          color: var(--primary);
        }

        .input-field {
          background: none;
          border: none;
          outline: none;
          width: 100%;
          color: #d3d3d3;
          font-family: inherit;
        }

        .form .btn {
          display: flex;
          justify-content: center;
          flex-direction: row;
          margin-top: 1em;
        }

        .button1, .button2, .button3 {
          font-family: inherit;
          cursor: pointer;
        }

        .button1 {
          padding: 0.8em;
          padding-left: 1.5em;
          padding-right: 1.5em;
          border-radius: 12px;
          border: none;
          outline: none;
          transition: .4s ease-in-out;
          background-color: #252525;
          color: white;
        }

        .button1:hover {
          background-color: black;
          color: var(--primary);
        }

        .button2 {
          padding: 0.8em;
          padding-left: 1.5em;
          padding-right: 1.5em;
          border-radius: 12px;
          border: none;
          outline: none;
          transition: .4s ease-in-out;
          background-color: #252525;
          color: white;
        }

        .button2:hover {
          background-color: black;
          color: var(--primary);
        }

        .button3 {
          padding: 0.8em;
          border-radius: 12px;
          border: none;
          outline: none;
          transition: .4s ease-in-out;
          background-color: #252525;
          color: white;
          width: 100%;
        }

        .button3:hover {
          background-color: #2e2e2e;
          border-color: var(--primary);
        }
      `}</style>
    </div>
  );
}
