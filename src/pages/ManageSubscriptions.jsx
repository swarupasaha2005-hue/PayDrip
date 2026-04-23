import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { useApp } from '../hooks/useApp';
import { useToast } from '../hooks/useToast';
import { lockFundsOnChain } from '../utils/stellar';
import { xlmToInr, inrToXlm } from '../utils/formatters';
import FeedbackModal from '../components/FeedbackModal';
import { CreditCard, ArrowLeft, Loader2, Tv, Music, Home, BookOpen, CircleEllipsis, Info } from 'lucide-react';

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
      setSelectedService(SERVICES.find(s => s.id === 'other'));
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
      <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:24 }}>
        <button onClick={() => navigate(-1)} className="btn-icon"><ArrowLeft size={18} /></button>
        <div>
          <h1 style={{ fontSize:32, fontWeight:700, margin:'0 0 4px', letterSpacing:'-0.5px' }}>Construct Payment</h1>
          <p style={{ color:'var(--text-3)', fontSize:16 }}>Schedule and lock funds for upcoming drips.</p>
        </div>
      </div>

      <div className="stitch-layout-grid">
        <div style={{ gridColumn: 'span 8' }}>
          <form onSubmit={handleSubmit} className="stitch-panel">
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 24 }}>Payment Configuration</h3>
            
            {/* Service & Funding Row */}
            <div className="stitch-layout-grid" style={{ marginBottom: 24, gap: 24 }}>
              <div style={{ gridColumn: 'span 6' }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', marginBottom: 8, display: 'block', textTransform:'uppercase' }}>Service Target</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {SERVICES.map(s => (
                    <div 
                      key={s.id}
                      onClick={() => setSelectedService(s)}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        background: selectedService.id === s.id ? 'var(--primary)' : 'var(--surface-2)',
                        color: selectedService.id === s.id ? '#FFFFFF' : 'var(--text-2)',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: 13,
                        transition: 'all 0.2s'
                      }}
                    >
                      <s.icon size={16} /> {s.label}
                    </div>
                  ))}
                </div>
                {selectedService.id === 'other' && (
                  <input 
                    value={customService} onChange={e => setCustomService(e.target.value)}
                    placeholder="Enter service name..." className="stitch-input" style={{ marginTop: 12 }} required
                  />
                )}
              </div>

              <div style={{ gridColumn: 'span 6' }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', marginBottom: 8, display: 'block', textTransform:'uppercase' }}>Funding Source</label>
                <div style={{ display: 'flex', background: 'var(--surface-2)', borderRadius: 12, padding: 4 }}>
                  {['Wallet', 'Vault', 'Intent Agent'].map(fs => (
                    <div 
                      key={fs} 
                      onClick={() => setSource(fs)}
                      style={{ 
                        flex: 1, textAlign: 'center', padding: '10px', 
                        borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                        background: source === fs ? 'var(--surface)' : 'transparent', 
                        color: source === fs ? 'var(--text)' : 'var(--text-3)', transition: 'all 0.2s' 
                      }}
                    >
                      {fs}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Amounts */}
            <div className="stitch-layout-grid" style={{ marginBottom: 24, gap: 24 }}>
              <div style={{ gridColumn: 'span 6' }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', marginBottom: 8, display: 'block', textTransform:'uppercase' }}>Amount INR (Optional)</label>
                <input type="number" value={amountINR} onChange={e => handleInrChange(e.target.value)} placeholder="0.00" className="stitch-input" />
              </div>
              <div style={{ gridColumn: 'span 6' }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', marginBottom: 8, display: 'block', textTransform:'uppercase' }}>Amount XLM</label>
                <input type="number" value={amountXLM} onChange={e => handleXLMChange(e.target.value)} placeholder="0.00" required className="stitch-input" style={{ borderColor: isInsufficient && source==='Wallet' ? 'var(--error)' : 'var(--border)' }} />
                {isInsufficient && source === 'Wallet' && (
                  <p style={{ color:'var(--error-text)', fontSize:12, marginTop:8 }}>Insufficient Wallet Balance</p>
                )}
              </div>
            </div>

            {/* Schedule */}
            <div className="stitch-layout-grid" style={{ marginBottom: 24, gap: 24 }}>
              <div style={{ gridColumn: 'span 6' }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', marginBottom: 8, display: 'block', textTransform:'uppercase' }}>Frequency</label>
                <select value={frequency} onChange={e => setFrequency(e.target.value)} className="stitch-input" style={{ cursor: 'pointer' }}>
                  <option value="one-time">One-time</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div style={{ gridColumn: 'span 6' }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', marginBottom: 8, display: 'block', textTransform:'uppercase' }}>Lock Release Date</label>
                <input type="date" value={releaseAt} onChange={e => setReleaseAt(e.target.value)} required className="stitch-input" min={new Date().toISOString().split('T')[0]} />
              </div>
            </div>

            {/* Note */}
            <div style={{ marginBottom: 32 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', marginBottom: 8, display: 'block', textTransform:'uppercase' }}>Description Note</label>
              <input value={note} onChange={e => setNote(e.target.value)} placeholder="Brief description..." maxLength={40} className="stitch-input" />
            </div>

            <button type="submit" disabled={isLocking || (source==='Wallet' && isInsufficient)} className="btn btn-primary" style={{ width: '100%', padding: '16px' }}>
              {isLocking ? <><Loader2 size={18} className="spinning" /> Processing...</> : <><CreditCard size={18} /> Schedule Payment</>}
            </button>
          </form>
        </div>

        <div style={{ gridColumn: 'span 4' }}>
          <div className="stitch-panel" style={{ height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <Info size={18} color="var(--primary)" />
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>Payment Drips</h3>
            </div>
            <p style={{ color: 'var(--text-2)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
              By scheduling a Smart Drip, you are actively time-locking liquidity. This guarantees that your required funds are natively escrowed and perfectly timed for their release date without manual intervention.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {['Guaranteed execution', 'Immutable time-locks', 'On-chain security'].map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ background: 'var(--surface-2)', width: 24, height: 24, borderRadius: 8, display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{i+1}</div>
                  <span style={{ fontSize: 14 }}>{t}</span>
                </div>
              ))}
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
