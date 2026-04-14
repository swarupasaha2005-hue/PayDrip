import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useApp } from '../hooks/useApp';
import { useToast } from '../hooks/useToast';
import { lockFundsOnChain, VAULT_CONTRACT_ID } from '../utils/stellar';
import { CalendarClock, Lock, Loader2, ExternalLink, Info } from 'lucide-react';
import FeedbackModal from '../components/FeedbackModal';

export default function Scheduler() {
  const { address, balance, updateBalance } = useWallet();
  const { addTransaction } = useApp();
  const toast = useToast();

  const [amount, setAmount]   = useState('');
  const [recipient, setRecipient] = useState('');
  const [releaseAt, setReleaseAt] = useState('');
  const [note, setNote]       = useState('');
  const [isLocking, setIsLocking] = useState(false);
  const [modal, setModal]     = useState({ open:false, type:'success', message:'', txHash:'' });

  const walletBalance = parseFloat(balance || 0);
  const lockAmount = parseFloat(amount || 0);
  const isInsufficient = lockAmount > walletBalance;
  const isInvalidAmount = lockAmount <= 0;

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!address || isInsufficient || isInvalidAmount) return;
    
    const releaseTimestamp = Math.floor(new Date(releaseAt).getTime() / 1000);
    const now = Math.floor(Date.now() / 1000);
    
    if (releaseTimestamp <= now) { 
      toast.error('Release date must be in the future.'); 
      return; 
    }

    setIsLocking(true);
    try {
      const response = await lockFundsOnChain(address, amount, releaseTimestamp);
      
      // Add to activity feed
      addTransaction({ 
        type:'locked', 
        amount, 
        asset:'XLM', 
        to: recipient, 
        releaseAt, 
        hash: response.hash,
        status: 'Scheduled'
      });
      
      await updateBalance(address);
      setModal({ 
        open:true, 
        type:'success', 
        message:`Successfully locked ${amount} XLM until ${new Date(releaseAt).toLocaleDateString()}.`,
        txHash: response.hash
      });
    } catch (err) {
      console.error('Lock failed', err);
      toast.error(err.message || 'Failed to lock funds on-chain');
    } finally {
      setIsLocking(false);
    }
  };

  const fieldStyle = {
    padding:'14px 18px', borderRadius:14, border:'2px solid var(--border)',
    background:'var(--surface-2)', fontSize:15, fontFamily:'Inter,sans-serif',
    color:'var(--text)', outline:'none', width:'100%', transition:'all 0.2s',
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
                    style={{ 
                      ...fieldStyle, 
                      paddingRight:60,
                      borderColor: isInsufficient ? 'var(--error-text)' : 'var(--border)' 
                    }}
                  />
                  <span style={{ position:'absolute', right:18, top:'50%', transform:'translateY(-50%)', fontWeight:700, color:'var(--primary)', fontSize:13 }}>XLM</span>
                </div>
                {isInsufficient && (
                  <p style={{ color:'var(--error-text)', fontSize:11, fontWeight:600, marginTop:4 }}>
                     ⚠️ Insufficient balance (Available: {walletBalance.toFixed(2)} XLM)
                  </p>
                )}
              </div>

              <div className="field">
                <label>Recipient Address</label>
                <input
                  value={recipient} onChange={e => setRecipient(e.target.value)}
                  placeholder="GABC...XYZ (optional)" style={fieldStyle}
                />
              </div>

              <div className="field">
                <label>Release Date</label>
                <input
                  type="date" min={today}
                  value={releaseAt} onChange={e => setReleaseAt(e.target.value)}
                  required style={fieldStyle}
                />
              </div>

              <div className="field">
                <label>Note <span style={{ fontWeight:400, color:'var(--text-3)' }}>(optional)</span></label>
                <input
                  value={note} onChange={e => setNote(e.target.value)}
                  placeholder="e.g. Rent for April…" maxLength={100}
                  style={fieldStyle}
                  onBlur={e => e.target.style.borderColor='var(--border)'}
                />
              </div>

              <button 
                type="submit" 
                disabled={isLocking} 
                className="btn btn-primary" 
                style={{ padding:'16px', fontSize:15, borderRadius:99 }}
              >
                {isLocking ? (
                  <><Loader2 size={16} className="spinning" /> Processing…</>
                ) : (
                  <><Lock size={16} /> Lock &amp; Schedule</>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Info panel */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="card" style={{ background:'linear-gradient(135deg,#EFF6FF,#F0FDFB)', border:'none' }}>
            <div style={{ display:'flex', gap:10, marginBottom:12, alignItems:'center' }}>
              <CalendarClock size={18} color="#3B82F6" />
              <span style={{ fontWeight:700, fontSize:14, color:'var(--text)' }}>Smart Contract Info</span>
            </div>
            
            <div style={{ background:'white', padding:12, borderRadius:12, marginBottom:16, border:'1px solid var(--border)' }}>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', marginBottom:4 }}>CONTRACT ID</div>
              <div style={{ fontSize:11, fontFamily:'monospace', wordBreak:'break-all', color:'var(--primary-dark)', display:'flex', alignItems:'center', gap:4 }}>
                {VAULT_CONTRACT_ID.slice(0, 16)}...
                <a 
                  href={`https://stellar.expert/explorer/testnet/contract/${VAULT_CONTRACT_ID}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color:'inherit' }}
                >
                  <ExternalLink size={10} />
                </a>
              </div>
            </div>

            {[
              'Funds are locked in a Soroban Smart Contract',
              'Only you can claim them back after the release date',
              'Everything is on-chain on Stellar Testnet',
              'Real-time status tracking via Soroban RPC',
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
