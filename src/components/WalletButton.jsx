import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { Wallet, LogOut, Loader2, Link as LinkIcon, Radio, Sparkles } from 'lucide-react';

export default function WalletButton() {
  const { address, provider, connect, disconnect, isConnecting, error } = useWallet();
  const [showModal, setShowModal] = useState(false);

  const short = (a) => a ? `${a.slice(0,6)}…${a.slice(-4)}` : '';

  if (address) {
    return (
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <div style={{ flex:1, display:'flex', alignItems:'center', gap:10, background:'rgba(255,255,255,0.08)', borderRadius:99, padding:'10px 20px', backdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,0.15)', boxShadow:'0 0 20px rgba(16, 185, 129, 0.2)' }}>
          <div style={{ position:'relative', width:10, height:10 }}>
             <div style={{ width:10, height:10, borderRadius:'50%', background:'#10B981', position:'absolute', top:0, left:0 }} />
             <div style={{ width:10, height:10, borderRadius:'50%', background:'#10B981', position:'absolute', top:0, left:0, animation:'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite', opacity: 0.7 }} />
          </div>
          <span style={{ fontSize:14, fontWeight:700, color:'white', fontFamily:'monospace', letterSpacing:1 }}>{short(address)}</span>
          <span style={{ fontSize:10, color:'var(--text-3)', textTransform:'uppercase', marginLeft: 8 }}>{provider}</span>
        </div>
        <button
          onClick={disconnect}
          title="Disconnect Node"
          style={{ width:42, height:42, borderRadius:'50%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.15)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(12px)', flexShrink:0, transition:'all 0.2s', color: 'var(--text-2)' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(239, 68, 68, 0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <LogOut size={16} />
        </button>
      </div>
    );
  }

  const handleConnect = async (selectedProvider) => {
    await connect(selectedProvider);
    setShowModal(false);
  };

  return (
    <>
      <div style={{ display:'flex', flexDirection:'column', gap:8, alignItems:'center' }}>
        <button
          onClick={() => setShowModal(true)} disabled={isConnecting}
          style={{
            display:'flex', alignItems:'center', justifyItems:'center', gap:10,
            padding:'16px 32px', borderRadius:99,
            background:'linear-gradient(135deg, var(--primary), var(--accent))',
            border:'1px solid rgba(255,255,255,0.2)',
            color:'white', fontSize:15, fontWeight:800, letterSpacing:1,
            cursor: isConnecting ? 'not-allowed' : 'pointer',
            boxShadow:'0 8px 32px rgba(99, 102, 241, 0.4)', transition:'transform 0.2s, box-shadow 0.2s, background 0.2s',
            opacity: isConnecting ? 0.7 : 1, textTransform: 'uppercase'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(99, 102, 241, 0.6)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(99, 102, 241, 0.4)'; }}
        >
          {isConnecting
            ? <Loader2 size={18} style={{ animation:'spin 0.8s linear infinite' }} />
            : <Sparkles size={18} />
          }
          {isConnecting ? 'Establishing Link…' : 'Connect Wallet'}
        </button>
        {error && <p style={{ fontSize:12, color:'#FFE4E6', textAlign:'center', marginTop: 8 }}>{error}</p>}
      </div>

      {showModal && (
        <div style={{ position:'fixed', inset:0, zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(5, 5, 10, 0.6)', backdropFilter:'blur(16px)', padding: 24 }} onClick={(e) => { if(e.target===e.currentTarget) setShowModal(false); }}>
          <div className="module module-blob fade-up" style={{ width:'100%', maxWidth:400, padding: 40, border: '1px solid rgba(255,255,255,0.1)', background: 'linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))' }}>
             <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, textAlign: 'center', letterSpacing: '-1px' }}>Initialize Session</h3>
             <p style={{ color:'var(--text-3)', fontSize:14, textAlign:'center', marginBottom:32 }}>Select your secure identity node provider to authenticate.</p>
             
             <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
               {[
                 { id: 'freighter', name: 'Freighter Vault', icon: Wallet, desc: 'Stellar Native Wallet' },
                 { id: 'walletconnect', name: 'WalletConnect', icon: LinkIcon, desc: 'Cross-chain compatibility' },
                 { id: 'albedo', name: 'Albedo Identity', icon: Radio, desc: 'Lightweight web linker' }
               ].map(opt => (
                 <button
                   key={opt.id}
                   onClick={() => handleConnect(opt.id)}
                   style={{
                     display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderRadius: 24,
                     background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                     color: 'white', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left'
                   }}
                   onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(99, 102, 241, 0.2)'; }}
                   onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
                 >
                   <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <opt.icon size={20} color="white" />
                   </div>
                   <div>
                     <div style={{ fontSize: 16, fontWeight: 700 }}>{opt.name}</div>
                     <div style={{ fontSize: 13, color: 'var(--text-3)' }}>{opt.desc}</div>
                   </div>
                 </button>
               ))}
             </div>
             
             <button onClick={() => setShowModal(false)} style={{ background:'transparent', border:'none', color:'var(--text-3)', fontSize:13, margin:'24px auto 0', display:'block', cursor:'pointer' }}>
               Cancel Session
             </button>
          </div>
        </div>
      )}
    </>
  );
}
