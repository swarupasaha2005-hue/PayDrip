import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { useApp } from '../hooks/useApp';
import { useToast } from '../hooks/useToast';
import { lockFundsOnChain } from '../utils/stellar';
import { xlmToInr, inrToXlm } from '../utils/formatters';
import FeedbackModal from '../components/FeedbackModal';
import { CreditCard, ArrowLeft, Loader2, Tv, Music, Home, BookOpen, CircleEllipsis, Info, Zap, Wallet, Landmark } from 'lucide-react';

const SERVICES = [
  { id: 'netflix', label: 'Netflix', icon: Tv, color: '#E50914' },
  { id: 'spotify', label: 'Spotify', icon: Music, color: '#1DB954' },
  { id: 'rent',    label: 'Rent',    icon: Home,  color: '#6366F1' },
  { id: 'other',   label: 'Custom',  icon: CircleEllipsis, color: '#94A3B8' },
];

export default function ManageSubscriptions() {
  const { address, balance, updateBalance } = useWallet();
  const { addSchedule } = useApp();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedService, setSelectedService] = useState(SERVICES[0]);
  const [customService, setCustomService]     = useState('');
  const [amountXLM, setAmountXLM]             = useState('');
  const [amountINR, setAmountINR]             = useState('');
  const [frequency, setFrequency]             = useState('monthly');
  const [source, setSource]                   = useState('Wallet');
  const [releaseAt, setReleaseAt]             = useState('');
  const [note, setNote]                       = useState('');
  const [isLocking, setIsLocking]             = useState(false);
  const [modal, setModal]                     = useState({ open:false, type:'success', message:'', txHash:'' });

  const walletBalance = parseFloat(balance || 0);
  const xlmValue = parseFloat(amountXLM || 0);
  const isInsufficient = xlmValue > walletBalance;

  useEffect(() => {
    if (location.state?.prefill) {
      const p = location.state.prefill;
      setSelectedService(SERVICES.find(s => s.id === 'other') || SERVICES[0]);
      setCustomService(p.service);
      setAmountXLM(p.amount);
      setAmountINR(p.inrAmount);
      setFrequency(p.frequency.toLowerCase());
      setNote(p.note);
      setSource('Intent Agent');
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      setReleaseAt(nextWeek.toISOString().split('T')[0]);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handleInrChange = (val) => {
    setAmountINR(val);
    if (val) setAmountXLM(inrToXlm(val));
    else setAmountXLM('');
  };

  const handleXLMChange = (val) => {
    setAmountXLM(val);
    if (val) setAmountINR(xlmToInr(val));
    else setAmountINR('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!address) { toast.error("Please connect your wallet first."); return; }
    if (source === 'Wallet' && isInsufficient) { toast.error("Insufficient XLM balance."); return; }
    if (!amountXLM || parseFloat(amountXLM) <= 0) { toast.error("Amount must be greater than 0 XLM."); return; }
    if (!releaseAt) { toast.error("Please specify a due date."); return; }

    const releaseTimestamp = Math.floor(new Date(releaseAt).getTime() / 1000);
    const now = Math.floor(Date.now() / 1000);
    
    if (releaseTimestamp <= now) { toast.error('Payment date must be in the future.'); return; }

    setIsLocking(true);
    try {
      if (source === 'Wallet') {
        const response = await lockFundsOnChain(address, amountXLM, releaseTimestamp);
        await updateBalance(address);
        setModal({ open:true, type:'success', message:`Successfully locked ${amountXLM} XLM for ${selectedService.label}.`, txHash: response.hash });
      } else {
        setModal({ open:true, type:'success', message:`Intent registered. Standing by for Vault/Agent execution.`, txHash: 'simulated_tx_' + Date.now() });
      }
      
      addSchedule({
        service: selectedService.id === 'other' ? customService : selectedService.label,
        amount: amountXLM,
        inrAmount: amountINR,
        frequency,
        releaseAt,
        note,
        source,
        hash: 'tx_' + Date.now()
      });
      
    } catch (err) {
      setModal({ open: true, type: 'error', message: err.message || 'Failed processing request', txHash: '' });
    } finally {
      setIsLocking(false);
    }
  };

  return (
    <div className="spatial-spread fade-up">
      <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:32 }}>
        <button onClick={() => navigate(-1)} className="btn-icon"><ArrowLeft size={18} /></button>
        <div>
          <h1 style={{ fontSize:32, fontWeight:700, margin:'0 0 4px', letterSpacing:'-0.5px' }}>Construct Payment</h1>
          <p style={{ color:'var(--text-3)', fontSize:16 }}>Schedule and lock funds for upcoming drips.</p>
        </div>
      </div>

      <div className="stitch-layout-grid">
        <div style={{ gridColumn: 'span 8' }}>
          <form onSubmit={handleSubmit} className="pd-card-v2" style={{ borderTop: '4px solid var(--primary)' }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 32, letterSpacing: '-0.5px' }}>Payment Configuration</h3>
            
            {/* Service Target - Custom Row */}
            <div style={{ marginBottom: 32 }}>
              <label className="pd-field-label">Service Target</label>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
                {SERVICES.map(s => {
                  const Icon = s.icon;
                  const isSelected = selectedService.id === s.id;
                  return (
                    <div 
                      key={s.id}
                      onClick={() => setSelectedService(s)}
                      style={{
                        padding: '12px 20px',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        background: isSelected ? 'var(--primary)' : 'var(--surface-2)',
                        color: isSelected ? '#FFFFFF' : 'var(--text-2)',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: 14,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: isSelected ? '0 4px 12px rgba(var(--primary-rgb), 0.3)' : 'none',
                        border: '1px solid transparent',
                        borderColor: isSelected ? 'var(--primary-dark)' : 'var(--border)'
                      }}
                    >
                      <Icon size={18} /> {s.label}
                    </div>
                  );
                })}
              </div>
              {selectedService.id === 'other' && (
                <div className="pd-field" style={{ marginTop: 16 }}>
                  <input 
                    value={customService} onChange={e => setCustomService(e.target.value)}
                    placeholder="Enter service name..." className="pd-input" required
                  />
                </div>
              )}
            </div>

            {/* Funding Source - Segmented Control */}
            <div style={{ marginBottom: 32 }}>
              <label className="pd-field-label">Funding Source</label>
              <div style={{ 
                display: 'flex', 
                background: 'var(--surface-2)', 
                borderRadius: '24px', 
                padding: '6px', 
                marginTop: 12,
                boxShadow: 'inset 1px 2px 5px rgba(0,0,0,0.1)'
              }}>
                {[
                  { id: 'Wallet', icon: Wallet },
                  { id: 'Vault', icon: Landmark },
                  { id: 'Intent Agent', icon: Zap }
                ].map(fs => (
                  <div 
                    key={fs.id} 
                    onClick={() => setSource(fs.id)}
                    style={{ 
                      flex: 1, 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: '12px', 
                      borderRadius: '18px', 
                      cursor: 'pointer', 
                      fontSize: 13, 
                      fontWeight: 700,
                      background: source === fs.id ? 'var(--surface)' : 'transparent', 
                      color: source === fs.id ? 'var(--primary)' : 'var(--text-3)', 
                      transition: 'all 0.2s ease',
                      boxShadow: source === fs.id ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
                    }}
                  >
                    <fs.icon size={14} /> {fs.id}
                  </div>
                ))}
              </div>
            </div>

            {/* Double Field Row: Amounts */}
            <div className="stitch-layout-grid" style={{ marginBottom: 32, gap: 24 }}>
              <div style={{ gridColumn: 'span 6' }} className="pd-field-container">
                <label className="pd-field-label">Amount INR (Optional)</label>
                <div className="pd-field">
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-3)' }}>₹</span>
                  <input type="number" value={amountINR} onChange={e => handleInrChange(e.target.value)} placeholder="0.00" className="pd-input" />
                </div>
              </div>
              <div style={{ gridColumn: 'span 6' }} className="pd-field-container">
                <label className="pd-field-label">Amount XLM</label>
                <div className="pd-field" style={{ borderColor: isInsufficient && source==='Wallet' ? 'var(--error)' : 'var(--border)' }}>
                  <input type="number" value={amountXLM} onChange={e => handleXLMChange(e.target.value)} placeholder="0.00" required className="pd-input" />
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>XLM</span>
                </div>
                {isInsufficient && source === 'Wallet' && (
                  <p style={{ color:'var(--error-text)', fontSize:11, paddingLeft: 12 }}>Insufficient Balance</p>
                )}
              </div>
            </div>

            {/* Double Field Row: Schedule */}
            <div className="stitch-layout-grid" style={{ marginBottom: 32, gap: 24 }}>
              <div style={{ gridColumn: 'span 6' }} className="pd-field-container">
                <label className="pd-field-label">Frequency</label>
                <div className="pd-field">
                  <select value={frequency} onChange={e => setFrequency(e.target.value)} className="pd-input" style={{ appearance: 'none', cursor: 'pointer' }}>
                    <option value="one-time">One-time</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
              <div style={{ gridColumn: 'span 6' }} className="pd-field-container">
                <label className="pd-field-label">Lock Release Date</label>
                <div className="pd-field">
                  <input type="date" value={releaseAt} onChange={e => setReleaseAt(e.target.value)} required className="pd-input" min={new Date().toISOString().split('T')[0]} />
                </div>
              </div>
            </div>

            {/* Note Field */}
            <div className="pd-field-container" style={{ marginBottom: 40 }}>
              <label className="pd-field-label">Description Note</label>
              <div className="pd-field">
                <input value={note} onChange={e => setNote(e.target.value)} placeholder="Brief description..." maxLength={40} className="pd-input" />
              </div>
            </div>

            <button type="submit" disabled={isLocking || (source==='Wallet' && isInsufficient)} className="pd-btn pd-btn-primary" style={{ width: '100%', padding: '18px', borderRadius: '22px' }}>
              {isLocking ? <><Loader2 size={18} className="spinning" /> Processing Intent...</> : <><CreditCard size={18} /> Authorize & Secure Funds</>}
            </button>
          </form>
        </div>

        <div style={{ gridColumn: 'span 4' }}>
          <div className="pd-card-v2" style={{ height: '100%', background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <div style={{ background: 'var(--primary-dark)', padding: '8px', borderRadius: '12px' }}>
                <Info size={20} color="white" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>Telemetry Insights</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <p style={{ color: 'var(--text-2)', fontSize: 14, lineHeight: 1.7 }}>
                By scheduling a Smart Drip, you are actively time-locking liquidity. This guarantees that your required funds are natively escrowed.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { t: 'Guaranteed execution', d: 'Deterministic on-chain triggers' },
                  { t: 'Immutable time-locks', d: 'Enhanced security layers' },
                  { t: 'Atomic Settlements', d: 'Trustless value transfer' }
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{ background: 'var(--surface)', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, border: '1px solid var(--border)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                      {i+1}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{item.t}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{item.d}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 'auto', padding: '20px', borderRadius: '18px', background: 'rgba(var(--primary-rgb), 0.05)', border: '1px dashed var(--primary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Landmark size={14} color="var(--primary)" />
                  <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)' }}>Vault Status</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-2)' }}>
                  Signer Threshold: <span style={{ fontWeight: 700, color: 'var(--text)' }}>Verified</span>
                </div>
              </div>
            </div>
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
