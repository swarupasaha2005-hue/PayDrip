import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { useApp } from '../hooks/useApp';
import { useToast } from '../hooks/useToast';
import { lockFundsOnChain } from '../utils/stellar';
import { xlmToInr, inrToXlm } from '../utils/formatters';
import FeedbackModal from '../components/FeedbackModal';
import UPISimulationModal from '../components/ui/UPISimulationModal';
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
  const [upiConfig, setUpiConfig]             = useState(null);

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
      setSource('Smart Planner');
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

  const handleExecute = async (mode) => {
    if (!address) { toast.error("Please connect your wallet first."); return; }
    if (source === 'Wallet' && isInsufficient) { toast.error("Insufficient XLM balance."); return; }
    if (!amountXLM || parseFloat(amountXLM) <= 0) { toast.error("Amount must be greater than 0 XLM."); return; }
    if (!releaseAt) { toast.error("Please specify a due date."); return; }

    const releaseTimestamp = Math.floor(new Date(releaseAt).getTime() / 1000);
    const now = Math.floor(Date.now() / 1000);
    
    if (releaseTimestamp <= now) { toast.error('Payment date must be in the future.'); return; }

    if (mode === 'upi') {
      setUpiConfig({
        amountINR: amountINR || xlmToInr(amountXLM),
        amountXLM,
        recipient: selectedService.id === 'other' ? customService : selectedService.label,
        onConfirm: async () => {
          setTimeout(() => {
            setModal({ open:true, type:'success', message:`Payment completed instantly via UPI Bridge.`, txHash: 'simulated_upi_tx_' + Date.now() });
          }, 800);
          addSchedule({
            service: selectedService.id === 'other' ? customService : selectedService.label,
            amount: amountXLM,
            inrAmount: amountINR,
            frequency,
            releaseAt,
            note,
            source,
            hash: 'upi_tx_' + Date.now(),
            statusOverride: 'Paid via UPI'
          });
        }
      });
      return;
    }

    setIsLocking(true);
    try {
      if (source === 'Wallet') {
        const response = await lockFundsOnChain(address, amountXLM, releaseTimestamp);
        await updateBalance(address);
        setModal({ open:true, type:'success', message:`Successfully locked ${amountXLM} XLM for ${selectedService.id === 'other' ? customService : selectedService.label}.`, txHash: response.hash });
      } else {
        setModal({ open:true, type:'success', message:`Payment scheduled. Standing by for Smart Planner execution.`, txHash: 'simulated_tx_' + Date.now() });
      }
      
      addSchedule({
        service: selectedService.id === 'other' ? customService : selectedService.label,
        amount: amountXLM,
        inrAmount: amountINR,
        frequency,
        releaseAt,
        note,
        source,
        hash: 'tx_' + Date.now(),
        statusOverride: 'Locked'
      });
      
    } catch (err) {
      setModal({ open: true, type: 'error', message: err.message || 'Failed processing request', txHash: '' });
    } finally {
      setIsLocking(false);
    }
  };

  return (
    <div className="fade-up" style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '40px' }}>
      <div style={{ marginBottom: 64 }}>
        <button onClick={() => navigate(-1)} className="pd-btn pd-btn-ghost" style={{ width: 48, height: 48, padding: 0, borderRadius: '50%', marginBottom: 32 }}><ArrowLeft size={20} /></button>
        <div>
          <h1 style={{ color: 'white' }}>Construct Plan</h1>
          <p style={{ color: 'var(--text-3)', fontSize: 20, fontWeight: 500 }}>Schedule and lock funds for upcoming drips.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 40 }}>
        <div style={{ gridColumn: 'span 8' }}>
          <form onSubmit={(e) => e.preventDefault()} className="dark-form" style={{ padding: '48px' }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 40 }}>Payment Configuration</h3>
            
            {/* Service Target - Custom Row */}
            <div style={{ marginBottom: 40 }}>
              <label className="pd-field-label" style={{ marginBottom: 12, display: 'block' }}>Service Target</label>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {SERVICES.map(s => {
                  const Icon = s.icon;
                  const isSelected = selectedService.id === s.id;
                  return (
                    <div 
                      key={s.id}
                      onClick={() => setSelectedService(s)}
                      style={{
                        padding: '14px 24px',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        background: isSelected ? 'white' : 'rgba(255,255,255,0.03)',
                        color: isSelected ? 'black' : 'var(--text-3)',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: 14,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        border: '1px solid',
                        borderColor: isSelected ? 'white' : 'var(--glass-border)'
                      }}
                    >
                      <Icon size={18} /> {s.label}
                    </div>
                  );
                })}
              </div>
              {selectedService.id === 'other' && (
                <div className="dark-field" style={{ marginTop: 20 }}>
                  <input 
                    value={customService} onChange={e => setCustomService(e.target.value)}
                    placeholder="Enter service name..." className="dark-input" required
                  />
                </div>
              )}
            </div>

            {/* Funding Source - Segmented Control */}
            <div style={{ marginBottom: 40 }}>
              <label className="pd-field-label" style={{ marginBottom: 12, display: 'block' }}>Funding Source</label>
              <div style={{ 
                display: 'flex', 
                background: 'rgba(255,255,255,0.03)', 
                borderRadius: '100px', 
                padding: '6px', 
                border: '1px solid var(--glass-border)'
              }}>
                {[
                  { id: 'Wallet', icon: Wallet },
                  { id: 'Secure Funds', icon: Landmark },
                  { id: 'Smart Planner', icon: Zap }
                ].map(fs => (
                  <div 
                    key={fs.id} 
                    onClick={() => setSource(fs.id)}
                    style={{ 
                      flex: 1, 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 10,
                      padding: '12px', 
                      borderRadius: '100px', 
                      cursor: 'pointer', 
                      fontSize: 12, 
                      fontWeight: 800,
                      background: source === fs.id ? 'white' : 'transparent', 
                      color: source === fs.id ? 'black' : 'var(--text-3)', 
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    <fs.icon size={14} /> {fs.id.toUpperCase()}
                  </div>
                ))}
              </div>
            </div>

            {/* Double Field Row: Amounts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 40 }}>
              <div className="pd-field-container">
                <label className="pd-field-label">Amount INR (Optional)</label>
                <div className="dark-field">
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#666' }}>₹</span>
                  <input type="number" value={amountINR} onChange={e => handleInrChange(e.target.value)} placeholder="0.00" className="dark-input" />
                </div>
              </div>
              <div className="pd-field-container">
                <label className="pd-field-label">Amount XLM</label>
                <div className="dark-field" style={{ borderColor: isInsufficient && source==='Wallet' ? 'var(--error)' : 'transparent' }}>
                  <input type="number" value={amountXLM} onChange={e => handleXLMChange(e.target.value)} placeholder="0.00" required className="dark-input" />
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>XLM</span>
                </div>
                {isInsufficient && source === 'Wallet' && (
                  <p style={{ color:'var(--error)', fontSize:11, paddingLeft: 12, marginTop: 4 }}>Insufficient Balance</p>
                )}
              </div>
            </div>

            {/* Double Field Row: Schedule */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 40 }}>
              <div className="pd-field-container">
                <label className="pd-field-label">Frequency</label>
                <div className="dark-field">
                  <select value={frequency} onChange={e => setFrequency(e.target.value)} className="dark-input" style={{ appearance: 'none', cursor: 'pointer' }}>
                    <option value="one-time">One-time</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
              <div className="pd-field-container">
                <label className="pd-field-label">Lock Release Date</label>
                <div className="dark-field">
                  <input type="date" value={releaseAt} onChange={e => setReleaseAt(e.target.value)} required className="dark-input" min={new Date().toISOString().split('T')[0]} />
                </div>
              </div>
            </div>

            {/* Note Field */}
            <div className="pd-field-container" style={{ marginBottom: 48 }}>
              <label className="pd-field-label">Description Note</label>
              <div className="dark-field">
                <input value={note} onChange={e => setNote(e.target.value)} placeholder="Brief description..." maxLength={40} className="dark-input" />
              </div>
            </div>

            <div className="dark-btn-group">
              <button type="button" onClick={() => handleExecute('upi')} disabled={isLocking || (source==='Wallet' && isInsufficient)} className="dark-btn" style={{ flex: 1, padding: '20px', borderRadius: '25px' }}>
                Settle via UPI
              </button>
              <button type="button" onClick={() => handleExecute('lock')} disabled={isLocking || (source==='Wallet' && isInsufficient)} className="dark-btn dark-btn-primary" style={{ flex: 1, padding: '20px', borderRadius: '25px' }}>
                {isLocking ? <><Loader2 size={18} className="spinning" /> Processing...</> : <><CreditCard size={18} /> Confirm & Lock</>}
              </button>
            </div>
          </form>
        </div>

        <div style={{ gridColumn: 'span 4' }}>
          <div className="glass-panel" style={{ height: '100%', padding: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
              <div style={{ background: 'rgba(var(--primary-rgb), 0.1)', padding: '10px', borderRadius: '14px', border: '1px solid rgba(var(--primary-rgb), 0.2)' }}>
                <Info size={20} color="var(--primary)" />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700 }}>Insights</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              <p style={{ color: 'var(--text-3)', fontSize: 15, lineHeight: 1.7, fontWeight: 500 }}>
                By scheduling a Smart Drip, you are actively time-locking liquidity. This guarantees that your required funds are natively escrowed.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {[
                  { t: 'Guaranteed execution', d: 'Deterministic triggers' },
                  { t: 'Immutable time-locks', d: 'Native network escrow' },
                  { t: 'Atomic Settlements', d: 'Trustless value transfer' }
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, border: '1px solid var(--glass-border)', color: 'var(--primary)' }}>
                      {i+1}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{item.t}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>{item.d}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 'auto', padding: '24px', borderRadius: '20px', background: 'rgba(var(--primary-rgb), 0.05)', border: '1px solid rgba(var(--primary-rgb), 0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <Landmark size={16} color="var(--primary)" />
                  <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '1px' }}>System Status</span>
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-2)', fontWeight: 500 }}>
                  Escrow Protocol: <span style={{ fontWeight: 800, color: 'var(--success)' }}>ONLINE</span>
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
      
      <UPISimulationModal 
        isOpen={!!upiConfig} 
        onClose={() => setUpiConfig(null)} 
        amountINR={upiConfig?.amountINR} 
        amountXLM={upiConfig?.amountXLM} 
        recipient={upiConfig?.recipient} 
        onConfirm={upiConfig?.onConfirm} 
      />
    </div>
  );
}
