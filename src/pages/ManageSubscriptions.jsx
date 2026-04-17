import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { useApp } from '../hooks/useApp';
import { useToast } from '../hooks/useToast';
import { lockFundsOnChain } from '../utils/stellar';
import { xlmToInr, inrToXlm, XLM_INR_RATE } from '../utils/formatters';
import FeedbackModal from '../components/FeedbackModal';
import { 
  CreditCard, 
  ArrowLeft, 
  Loader2, 
  Tv, 
  Music, 
  Home, 
  BookOpen, 
  CircleEllipsis,
  AlertCircle
} from 'lucide-react';

const SERVICES = [
  { id: 'netflix', label: 'Netflix', icon: Tv, color: '#E50914' },
  { id: 'spotify', label: 'Spotify', icon: Music, color: '#1DB954' },
  { id: 'rent',    label: 'Rent',    icon: Home,  color: '#6366F1' },
  { id: 'tuition', label: 'Tuition', icon: BookOpen, color: '#F59E0B' },
  { id: 'other',   label: 'Custom',  icon: CircleEllipsis, color: '#94A3B8' },
];

const FREQUENCIES = [
  { id: 'one-time', label: 'One-time' },
  { id: 'weekly',   label: 'Weekly' },
  { id: 'monthly',  label: 'Monthly' },
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
  const [releaseAt, setReleaseAt]             = useState('');
  const [note, setNote]                       = useState('');
  const [isLocking, setIsLocking]             = useState(false);
  const [modal, setModal]                     = useState({ open:false, type:'success', message:'', txHash:'' });

  const walletBalance = parseFloat(balance || 0);
  const xlmValue = parseFloat(amountXLM || 0);
  const isInsufficient = xlmValue > walletBalance;

  // Handle prefill from Smart Planner
  useEffect(() => {
    if (location.state?.prefill) {
      const p = location.state.prefill;
      setSelectedService(SERVICES.find(s => s.id === 'other'));
      setCustomService(p.service);
      setAmountXLM(p.amount);
      setAmountINR(p.inrAmount);
      setFrequency(p.frequency.toLowerCase());
      setNote(p.note);
      
      // Auto-set release date to 1 week from now if not specified
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      setReleaseAt(nextWeek.toISOString().split('T')[0]);
      
      // Clear state so reload doesn't keep prefilling
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
    if (!address) {
       toast.error("Please connect your wallet first.");
       return;
    }
    if (isInsufficient) {
       toast.error("Insufficient XLM balance.");
       return;
    }
    if (!amountXLM || parseFloat(amountXLM) <= 0) {
       toast.error("Amount must be greater than 0 XLM.");
       return;
    }
    if (!releaseAt) {
       toast.error("Please specify a due date.");
       return;
    }

    const releaseTimestamp = Math.floor(new Date(releaseAt).getTime() / 1000);
    const now = Math.floor(Date.now() / 1000);
    
    if (releaseTimestamp <= now) { 
      toast.error('Payment date must be in the future.'); 
      return; 
    }

    setIsLocking(true);
    try {
      // Step 1: Lock funds on-chain
      const response = await lockFundsOnChain(address, amountXLM, releaseTimestamp);
      
      // Step 2: Save intent to AppContext
      addSchedule({
        service: selectedService.id === 'other' ? customService : selectedService.label,
        amount: amountXLM,
        inrAmount: amountINR,
        frequency: frequency,
        releaseAt,
        note,
        hash: response.hash
      });
      
      await updateBalance(address);
      setModal({ 
        open:true, 
        type:'success', 
        message:`Successfully locked ${amountXLM} XLM for ${selectedService.label}. We'll notify you on the due date!`,
        txHash: response.hash
      });
    } catch (err) {
      console.error("ManageSubscriptions Submit Error:", err);
      // Safely serialize unknown errors to prevent "undefined" toasts
      const errorMsg = err?.message || (typeof err === 'string' ? err : JSON.stringify(err)) || 'Failed to setup payment intent';
      setModal({
         open: true,
         type: 'error',
         message: errorMsg,
         txHash: ''
      });
    } finally {
      setIsLocking(false);
    }
  };

  const handleSimulate = () => {
    // Skip blockchain entirely
    addSchedule({
      service: selectedService.id === 'other' ? customService : selectedService.label,
      amount: amountXLM,
      inrAmount: amountINR,
      frequency: frequency,
      releaseAt,
      note,
      hash: 'simulated_tx_' + Date.now()
    });
    setModal({ open: false, type: 'success', message: '', txHash: '' });
    toast.success('Simulation successful. Plan added.');
    navigate('/dashboard');
  };

  const fieldStyle = {
    padding:'14px 18px', borderRadius:14, border:'2px solid var(--border)',
    background:'var(--surface-2)', fontSize:15, fontFamily:'Inter,sans-serif',
    color:'var(--text)', outline:'none', width:'100%', transition:'all 0.2s',
  };

  return (
    <div className="fade-up">
      <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:28 }}>
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-icon"><ArrowLeft size={17} /></button>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, letterSpacing:'-0.5px' }}>Setup Smart Payment</h1>
          <p style={{ color:'var(--text-2)', fontSize:13 }}>Lock funds for a future subscription or expense</p>
        </div>
      </div>

      <div className="grid-2-1" style={{ gap:24 }}>
        <div className="card" style={{ padding:28 }}>
          {!address ? (
            <div className="empty-state">
              <div className="empty-icon">🔑</div>
              <div style={{ fontWeight:600, color:'var(--text-2)' }}>Connect your wallet first</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:24 }}>
              
              {/* Service Selection */}
              <div className="field">
                <label>Select Service</label>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(100px, 1fr))', gap:12 }}>
                  {SERVICES.map(s => (
                    <div 
                      key={s.id}
                      onClick={() => setSelectedService(s)}
                      style={{
                        padding: '12px',
                        borderRadius: 12,
                        border: `2px solid ${selectedService.id === s.id ? s.color : 'var(--border)'}`,
                        background: selectedService.id === s.id ? `${s.color}10` : 'var(--bg)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s'
                      }}
                    >
                      <s.icon size={20} color={selectedService.id === s.id ? s.color : 'var(--text-3)'} style={{ marginBottom:8 }} />
                      <div style={{ fontSize:11, fontWeight:700, color: selectedService.id === s.id ? 'var(--text)' : 'var(--text-3)' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedService.id === 'other' && (
                <div className="field">
                  <label>Custom Service Name</label>
                  <input 
                    value={customService} onChange={e => setCustomService(e.target.value)}
                    placeholder="e.g. Electricity Bill" style={fieldStyle} required
                  />
                </div>
              )}

              {/* Amount - Dual Input */}
              <div style={{ display:'flex', flexDirection:'column', gap:4, marginBottom: 8 }}>
                <div style={{ fontSize:12, color:'var(--text-3)', fontWeight:500, textAlign:'right' }}>1 XLM ≈ ₹{XLM_INR_RATE}</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                  <div className="field">
                    <label>Amount (INR)</label>
                    <div style={{ position:'relative' }}>
                      <input
                        type="number" value={amountINR} onChange={e => handleInrChange(e.target.value)}
                        placeholder="0.00" style={{...fieldStyle, paddingLeft: 30}}
                      />
                      <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontWeight:700, color:'var(--text-3)', fontSize:14 }}>₹</span>
                    </div>
                  </div>
                  <div className="field">
                    <label>Amount (XLM)</label>
                    <div style={{ position:'relative' }}>
                      <input
                        type="number" value={amountXLM} onChange={e => handleXLMChange(e.target.value)}
                        placeholder="0.00" required style={{ ...fieldStyle, borderColor: isInsufficient ? 'var(--error-text)' : 'var(--border)' }}
                      />
                      <span style={{ position:'absolute', right:18, top:'50%', transform:'translateY(-50%)', fontWeight:700, color:'var(--primary)', fontSize:13 }}>XLM</span>
                    </div>
                  </div>
                </div>
              </div>
              {isInsufficient && (
                <p style={{ color:'var(--error-text)', fontSize:11, fontWeight:600, marginTop:-16 }}>
                   ⚠️ Insufficient balance (Available: {walletBalance.toFixed(2)} XLM)
                </p>
              )}

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                <div className="field">
                  <label>Frequency</label>
                  <select 
                    value={frequency} onChange={e => setFrequency(e.target.value)}
                    style={fieldStyle}
                  >
                    {FREQUENCIES.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Due Date</label>
                  <input
                    type="date" value={releaseAt} onChange={e => setReleaseAt(e.target.value)}
                    required style={fieldStyle} min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="field">
                <label>Note <span style={{ fontWeight:400, color:'var(--text-3)' }}>(optional)</span></label>
                <input
                  value={note} onChange={e => setNote(e.target.value)}
                  placeholder="e.g. Standard 4K Plan" maxLength={28} style={fieldStyle}
                />
              </div>

              <button
                type="submit" disabled={isLocking || isInsufficient}
                className="btn btn-primary"
                style={{ padding:'16px', fontSize:15, borderRadius:99, marginTop:8 }}
              >
                {isLocking
                  ? <><Loader2 size={16} className="spinning" /> Locking Funds…</>
                  : <><CreditCard size={16} /> Setup Payment Intent</>
                }
              </button>
            </form>
          )}
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="card" style={{ background:'linear-gradient(135deg,#F0EDFF,#FFF0F5)', border:'none' }}>
            <div style={{ fontSize:12, fontWeight:700, color:'var(--primary-dark)', letterSpacing:.5, marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
              <AlertCircle size={14} /> HOW IT WORKS
            </div>
            <p style={{ fontSize:13, color:'var(--text-2)', lineHeight:1.6, marginBottom:16 }}>
              PayDrip isn't just a wallet—it's a <strong>financial discipline layer</strong>. 
            </p>
            <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:12 }}>
              {[
                'Lock funds specifically for your upcoming bill.',
                'The XLM stays in a smart contract and cannot be spent elsewhere.',
                'On the due date, we notify you to execute the payment.',
                'Ensures your subscription budget is always protected.'
              ].map((t, i) => (
                <li key={i} style={{ fontSize:12, color:'var(--text-2)', display:'flex', gap:10 }}>
                  <span style={{ color:'var(--primary)', fontWeight:800 }}>{i+1}.</span> {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <FeedbackModal
        isOpen={modal.open} type={modal.type} message={modal.message} txHash={modal.txHash}
        onSimulate={modal.type === 'error' ? handleSimulate : undefined}
        onClose={() => { setModal(m => ({ ...m, open:false })); if (modal.type==='success') navigate('/dashboard'); }}
      />
    </div>
  );
}
