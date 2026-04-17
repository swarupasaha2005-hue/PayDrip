import React from 'react';
import { CheckCircle2, XCircle, Copy } from 'lucide-react';
import { useToast } from '../hooks/useToast';

export default function FeedbackModal({ isOpen, type, message, txHash, onClose, onSimulate }) {
  const toast = useToast();
  if (!isOpen) return null;

  const isSuccess = type === 'success';

  const copyHash = () => {
    navigator.clipboard.writeText(txHash);
    toast.success('Transaction hash copied!');
  };

  return (
    <div
      style={{ position:'fixed', inset:0, zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(30,27,75,0.3)', backdropFilter:'blur(6px)', padding:24 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="fade-up" style={{ background:'white', borderRadius:28, padding:36, width:'100%', maxWidth:420, textAlign:'center', boxShadow:'0 32px 80px rgba(0,0,0,0.18)' }}>
        {/* Icon ring */}
        <div style={{ width:80, height:80, borderRadius:'50%', background: isSuccess ? '#D1FAE5' : '#FFE4E6', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
          {isSuccess
            ? <CheckCircle2 size={40} color="#059669" />
            : <XCircle     size={40} color="#E11D48" />}
        </div>

        <h3 style={{ fontSize:21, marginBottom:8, color:'var(--text)' }}>
          {isSuccess ? '🎉 Transaction Sent!' : 'Transaction Failed'}
        </h3>
        <p style={{ fontSize:14, color:'var(--text-2)', lineHeight:1.6, marginBottom: txHash ? 20 : 28 }}>
          {message}
        </p>

        {txHash && (
          <div style={{ background:'var(--bg)', borderRadius:14, padding:'14px 16px', marginBottom:24, textAlign:'left' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
              <span style={{ fontSize:11, fontWeight:700, color:'var(--text-2)' }}>TRANSACTION HASH</span>
              <button onClick={copyHash} className="btn btn-ghost" style={{ padding:'4px 10px', fontSize:11, gap:4 }}>
                <Copy size={11} /> Copy
              </button>
            </div>
            <div style={{ fontSize:11, color:'var(--text-3)', wordBreak:'break-all', fontFamily:'monospace', lineHeight:1.6 }}>{txHash}</div>
          </div>
        )}

        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          {!isSuccess && onSimulate && (
            <button
              onClick={onSimulate}
              className="btn btn-outline"
              style={{ width:'100%', padding:16, fontSize:15, border: '2px solid var(--primary)', color: 'var(--primary)', fontWeight: 800 }}
            >
              Skip & Simulate
            </button>
          )}
          <button
            onClick={onClose}
            className="btn btn-primary"
            style={{ width:'100%', padding:16, fontSize:15 }}
          >
            {isSuccess ? 'Awesome!' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
