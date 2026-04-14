import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { useApp } from '../hooks/useApp';
import { useToast } from '../hooks/useToast';
import { sendPayment } from '../utils/stellar';
import FeedbackModal from '../components/FeedbackModal';
import { Send, ArrowLeft, Loader2 } from 'lucide-react';

export default function SendTransaction() {
  const { address, updateBalance } = useWallet();
  const { addTransaction } = useApp();
  const toast = useToast();
  const navigate = useNavigate();

  const [recipient, setRecipient] = useState('');
  const [amount, setAmount]       = useState('');
  const [memo, setMemo]           = useState('');
  const [isSending, setIsSending] = useState(false);
  const [modal, setModal]         = useState({ open:false, type:'success', message:'', txHash:'' });

  const handleSend = async (e) => {
    e.preventDefault();
    if (!address) return;
    setIsSending(true);
    try {
      const response = await sendPayment(address, recipient, amount);
      // Persist to activity feed via AppContext
      addTransaction({ type:'sent', amount, asset:'XLM', to: recipient, hash: response.hash });
      await updateBalance(address);
      setModal({ open:true, type:'success', message:`Sent ${amount} XLM to ${recipient.slice(0,8)}…`, txHash: response.hash });
    } catch (err) {
      toast.error(err.message || 'Transaction failed');
      setModal({ open:true, type:'error', message: err.message || 'Transaction failed. Please try again.', txHash:'' });
    } finally {
      setIsSending(false);
    }
  };

  const fieldStyle = {
    padding:'14px 18px', borderRadius:14, border:'2px solid var(--border)',
    background:'var(--surface-2)', fontSize:15, fontFamily:'Inter,sans-serif',
    color:'var(--text)', outline:'none', width:'100%', transition:'border-color 0.2s',
  };

  return (
    <div className="fade-up">
      <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:28 }}>
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-icon"><ArrowLeft size={17} /></button>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, letterSpacing:'-0.5px' }}>Send XLM</h1>
          <p style={{ color:'var(--text-2)', fontSize:13 }}>Transfer funds on Stellar Testnet</p>
        </div>
      </div>

      <div className="grid-2-1" style={{ gap:24 }}>
        {/* Form */}
        <div className="card" style={{ padding:28 }}>
          {!address ? (
            <div className="empty-state">
              <div className="empty-icon">🔑</div>
              <div style={{ fontWeight:600, color:'var(--text-2)' }}>Connect your wallet first</div>
            </div>
          ) : (
            <form onSubmit={handleSend} style={{ display:'flex', flexDirection:'column', gap:20 }}>
              <div className="field">
                <label>Recipient Address</label>
                <input
                  value={recipient} onChange={e => setRecipient(e.target.value)}
                  placeholder="GABC...XYZ" required style={fieldStyle}
                  onFocus={e => e.target.style.borderColor='var(--primary)'}
                  onBlur={e => e.target.style.borderColor='var(--border)'}
                />
              </div>
              <div className="field">
                <label>Amount (XLM)</label>
                <div style={{ position:'relative' }}>
                  <input
                    type="number" step="0.0000001" min="0.0000001"
                    value={amount} onChange={e => setAmount(e.target.value)}
                    placeholder="0.00" required
                    style={{ ...fieldStyle, paddingRight:60 }}
                    onFocus={e => e.target.style.borderColor='var(--primary)'}
                    onBlur={e => e.target.style.borderColor='var(--border)'}
                  />
                  <span style={{ position:'absolute', right:18, top:'50%', transform:'translateY(-50%)', fontWeight:700, color:'var(--primary)', fontSize:13 }}>XLM</span>
                </div>
              </div>
              <div className="field">
                <label>Memo <span style={{ fontWeight:400, color:'var(--text-3)' }}>(optional)</span></label>
                <input
                  value={memo} onChange={e => setMemo(e.target.value)}
                  placeholder="Payment for…" maxLength={28}
                  style={fieldStyle}
                  onFocus={e => e.target.style.borderColor='var(--primary)'}
                  onBlur={e => e.target.style.borderColor='var(--border)'}
                />
              </div>
              <button
                type="submit" disabled={isSending}
                className="btn btn-primary"
                style={{ padding:'16px', fontSize:15, borderRadius:99, marginTop:4 }}
              >
                {isSending
                  ? <><Loader2 size={16} className="spinning" /> Sending…</>
                  : <><Send size={16} /> Send Payment</>
                }
              </button>
            </form>
          )}
        </div>

        {/* Info panel */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="card" style={{ background:'linear-gradient(135deg,#F0EDFF,#FFF0F5)', border:'none' }}>
            <div style={{ fontSize:12, fontWeight:700, color:'var(--primary-dark)', letterSpacing:.5, marginBottom:12 }}>WHY STELLAR?</div>
            {[
              ['⚡','Near-instant settlement (3–5s)'],
              ['💸','Ultra-low fees (<0.00001 XLM)'],
              ['🌐','Built for cross-border payments'],
            ].map(([emoji, text]) => (
              <div key={text} style={{ display:'flex', gap:10, marginBottom:10, fontSize:13, color:'var(--text-2)', alignItems:'center' }}>
                <span style={{ fontSize:16 }}>{emoji}</span>{text}
              </div>
            ))}
          </div>
          <div className="card" style={{ padding:'20px 22px' }}>
            <div style={{ fontSize:12, fontWeight:700, color:'var(--text-2)', letterSpacing:.5, marginBottom:12 }}>BEFORE YOU SEND</div>
            <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:8 }}>
              {['Double-check recipient address', 'Ensure account is funded (100 XLM minimum + 1 reserve)', 'Freighter will ask for approval'].map(t => (
                <li key={t} style={{ fontSize:12, color:'var(--text-3)', display:'flex', gap:8, alignItems:'flex-start' }}>
                  <span style={{ color:'var(--primary)', fontWeight:700, flexShrink:0 }}>→</span>{t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <FeedbackModal
        isOpen={modal.open} type={modal.type} message={modal.message} txHash={modal.txHash}
        onClose={() => { setModal(m => ({ ...m, open:false })); if (modal.type==='success') navigate('/dashboard'); }}
      />
    </div>
  );
}
