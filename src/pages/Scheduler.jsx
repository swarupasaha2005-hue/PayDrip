import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { CalendarClock, Lock, CheckCircle2, Info } from 'lucide-react';
import FeedbackModal from '../components/FeedbackModal';

export default function Scheduler() {
  const { address } = useWallet();
  const { addSchedule } = useApp();
  const toast = useToast();

  const [amount, setAmount]   = useState('');
  const [recipient, setRecipient] = useState('');
  const [releaseAt, setReleaseAt] = useState('');
  const [note, setNote]       = useState('');
  const [modal, setModal]     = useState({ open:false, type:'success', message:'' });

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!address) return;
    if (releaseAt < today) { toast.error('Release date must be in the future.'); return; }

    addSchedule({ amount, to: recipient, releaseAt, note, asset:'XLM' });
    toast.success(`Scheduled ${amount} XLM to be released on ${new Date(releaseAt).toLocaleDateString()}`);
    setModal({ open:true, type:'success', message:`${amount} XLM scheduled for release on ${new Date(releaseAt).toLocaleDateString()}. It will appear in your Activity tab immediately.` });
  };

  const fieldStyle = {
    padding:'14px 18px', borderRadius:14, border:'2px solid var(--border)',
    background:'var(--surface-2)', fontSize:15, fontFamily:'Inter,sans-serif',
    color:'var(--text)', outline:'none', width:'100%', transition:'border-color 0.2s',
  };

  return (
    <div className="fade-up">
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:26, fontWeight:800, letterSpacing:'-0.5px', marginBottom:4 }}>Schedule Payment</h1>
        <p style={{ color:'var(--text-2)', fontSize:14 }}>Lock funds and set an automatic release date</p>
      </div>

      <div className="grid-2-1" style={{ gap:24 }}>
        {/* Form */}
        <div className="card" style={{ padding:28 }}>
          {!address ? (
            <div className="empty-state">
              <div className="empty-icon">🔒</div>
              <div style={{ fontWeight:600, color:'var(--text-2)' }}>Connect your wallet to schedule payments</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:20 }}>
              <div className="field">
                <label>Amount to Lock (XLM)</label>
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
                <label>Recipient Address</label>
                <input
                  value={recipient} onChange={e => setRecipient(e.target.value)}
                  placeholder="GABC...XYZ (optional)" style={fieldStyle}
                  onFocus={e => e.target.style.borderColor='var(--primary)'}
                  onBlur={e => e.target.style.borderColor='var(--border)'}
                />
              </div>

              <div className="field">
                <label>Release Date</label>
                <input
                  type="date" min={today}
                  value={releaseAt} onChange={e => setReleaseAt(e.target.value)}
                  required style={fieldStyle}
                  onFocus={e => e.target.style.borderColor='var(--primary)'}
                  onBlur={e => e.target.style.borderColor='var(--border)'}
                />
              </div>

              <div className="field">
                <label>Note <span style={{ fontWeight:400, color:'var(--text-3)' }}>(optional)</span></label>
                <input
                  value={note} onChange={e => setNote(e.target.value)}
                  placeholder="e.g. Rent for April…" maxLength={100}
                  style={fieldStyle}
                  onFocus={e => e.target.style.borderColor='var(--primary)'}
                  onBlur={e => e.target.style.borderColor='var(--border)'}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding:'16px', fontSize:15, borderRadius:99 }}>
                <Lock size={16} /> Lock &amp; Schedule
              </button>
            </form>
          )}
        </div>

        {/* Info panel */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="card" style={{ background:'linear-gradient(135deg,#EFF6FF,#F0FDFB)', border:'none' }}>
            <div style={{ display:'flex', gap:10, marginBottom:12, alignItems:'center' }}>
              <CalendarClock size={18} color="#3B82F6" />
              <span style={{ fontWeight:700, fontSize:14, color:'var(--text)' }}>How it works</span>
            </div>
            {[
              'Specify an amount and a future release date',
              'Funds are tracked in your PayDrip account',
              'On release date, send the transaction manually',
              'Everything is saved locally — no data lost on refresh',
            ].map((t, i) => (
              <div key={i} style={{ display:'flex', gap:10, marginBottom:8, alignItems:'flex-start' }}>
                <span style={{ background:'rgba(184,168,255,0.2)', color:'var(--primary-dark)', fontWeight:700, fontSize:11, borderRadius:'50%', width:20, height:20, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>{i+1}</span>
                <span style={{ fontSize:13, color:'var(--text-2)', lineHeight:1.5 }}>{t}</span>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding:'18px 20px', display:'flex', gap:12, alignItems:'flex-start' }}>
            <Info size={16} color="#6366F1" style={{ flexShrink:0, marginTop:2 }} />
            <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.6 }}>
              Schedules are saved in your browser's localStorage and will persist across sessions.
              They appear immediately in the <strong>Activity</strong> feed.
            </p>
          </div>
        </div>
      </div>

      <FeedbackModal
        isOpen={modal.open} type={modal.type} message={modal.message}
        onClose={() => setModal(m => ({ ...m, open:false }))}
      />
    </div>
  );
}
