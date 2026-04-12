import React from 'react';
import { useWallet } from '../context/WalletContext';
import { Wallet, LogOut, Loader2, Zap } from 'lucide-react';

export default function WalletButton() {
  const { address, connect, disconnect, isConnecting, error } = useWallet();

  const short = (a) => a ? `${a.slice(0,6)}…${a.slice(-4)}` : '';

  if (address) {
    return (
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <div style={{ flex:1, display:'flex', alignItems:'center', gap:10, background:'rgba(255,255,255,0.25)', borderRadius:99, padding:'10px 16px', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,0.4)' }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:'#10B981', flexShrink:0 }} />
          <span style={{ fontSize:13, fontWeight:600, color:'white', fontFamily:'monospace' }}>{short(address)}</span>
        </div>
        <button
          onClick={disconnect}
          title="Disconnect"
          style={{ width:38, height:38, borderRadius:'50%', background:'rgba(255,255,255,0.2)', border:'1px solid rgba(255,255,255,0.3)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(8px)', flexShrink:0 }}
        >
          <LogOut size={15} color="white" />
        </button>
      </div>
    );
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      <button
        onClick={connect} disabled={isConnecting}
        style={{
          display:'flex', alignItems:'center', justifyContent:'center', gap:10,
          padding:'14px 24px', borderRadius:99, border:'none',
          background:'rgba(255,255,255,0.25)', backdropFilter:'blur(8px)',
          border:'1px solid rgba(255,255,255,0.4)',
          color:'white', fontSize:15, fontWeight:700,
          cursor: isConnecting ? 'not-allowed' : 'pointer',
          fontFamily:'Inter,sans-serif', transition:'all 0.2s',
          opacity: isConnecting ? 0.7 : 1,
        }}
      >
        {isConnecting
          ? <Loader2 size={16} style={{ animation:'spin 0.8s linear infinite' }} />
          : <Wallet size={16} />
        }
        {isConnecting ? 'Connecting…' : 'Connect Wallet'}
      </button>
      {error && <p style={{ fontSize:12, color:'#FFE4E6', textAlign:'center' }}>{error}</p>}
    </div>
  );
}
