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
    if (isInsufficient) { toast.error("Insufficient XLM balance."); return; }
    if (!amountXLM || parseFloat(amountXLM) <= 0) { toast.error("Amount must be greater than 0 XLM."); return; }
    if (!releaseAt) { toast.error("Please specify a due date."); return; }

    const releaseTimestamp = Math.floor(new Date(releaseAt).getTime() / 1000);
    const now = Math.floor(Date.now() / 1000);
    
    if (releaseTimestamp <= now) { toast.error('Payment date must be in the future.'); return; }

    setIsLocking(true);
    try {
      const response = await lockFundsOnChain(address, amountXLM, releaseTimestamp);
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
      setModal({ open:true, type:'success', message:`Successfully locked ${amountXLM} XLM for ${selectedService.label}.`, txHash: response.hash });
    } catch (err) {
      const errorMsg = err?.message || (typeof err === 'string' ? err : JSON.stringify(err)) || 'Failed to setup payment intent';
      setModal({ open: true, type: 'error', message: errorMsg, txHash: '' });
    } finally {
      setIsLocking(false);
    }
  };

  const handleSimulate = () => {
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
    padding:'16px 20px', borderRadius:'999px', border:'none',
    background:'var(--bg)', fontSize:15, fontFamily:'Inter,sans-serif',
    color:'var(--text)', outline:'none', width:'100%', transition:'all 0.4s',
    boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.04)'
  };

  return (
    <div className="spatial-spread fade-up">
      <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:40, position:'relative', zIndex: 10 }}>
        <button onClick={() => navigate(-1)} className="btn-icon"><ArrowLeft size={18} /></button>
        <div>
          <h1 style={{ fontSize:28, fontWeight:800, letterSpacing:'-0.5px' }}>Construct Payment</h1>
          <p style={{ color:'var(--text-2)', fontSize:14 }}>Secure funds for upcoming payments</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40, alignItems: 'flex-start' }}>
        
        {/* Abstract Configuration Panel */}
        <div className="module" style={{ flex: '1 1 400px', padding: '48px', alignItems:'stretch', borderRadius: 32, background: 'linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', boxShadow: '0 0 40px rgba(255, 0, 255, 0.15)' }}>
          {!address ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.8 }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>🔑</div>
              <div style={{ fontWeight:700, color:'var(--text)' }}>Wallet not connected</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:28 }}>
              
              {/* Floating Service Clusters */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, opacity: 0.6, marginBottom: 12, display: 'block', textTransform:'uppercase' }}>Select Service</label>
                <div className="organic-cluster" style={{ padding: 0, justifyContent: 'flex-start', gap: 12 }}>
                  {SERVICES.map(s => (
                    <div 
                      key={s.id}
                      onClick={() => setSelectedService(s)}
                      style={{
                        padding: '12px 20px',
                        borderRadius: '999px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        background: selectedService.id === s.id ? `${s.color}15` : 'var(--bg)',
                        color: selectedService.id === s.id ? s.color : 'var(--text-3)',
                        cursor: 'pointer',
                        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                        transform: selectedService.id === s.id ? 'scale(1.05)' : 'scale(1)',
                        boxShadow: selectedService.id === s.id ? `0 8px 24px ${s.color}25` : 'none'
                      }}
                    >
                      <s.icon size={18} />
                      <div style={{ fontSize:14, fontWeight:700 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedService.id === 'other' && (
                <div>
                  <input 
                    value={customService} onChange={e => setCustomService(e.target.value)}
                    placeholder="e.g. Electric Node" style={fieldStyle} required
                  />
                </div>
              )}

              {/* Amount Fluid Inputs */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, opacity: 0.6, marginBottom: 12, display: 'block', textTransform:'uppercase' }}>Amount</label>
                <div style={{ display:'flex', flexWrap: 'wrap', gap:16 }}>
                  <div style={{ flex: 1, position:'relative' }}>
                    <input
                      type="number" value={amountINR} onChange={e => handleInrChange(e.target.value)}
                      placeholder="0.00" style={{...fieldStyle, paddingLeft: 40}}
                    />
                    <span style={{ position:'absolute', left:18, top:'50%', transform:'translateY(-50%)', fontWeight:800, color:'var(--text-3)' }}>₹</span>
                  </div>
                  <div style={{ flex: 1, position:'relative' }}>
                    <input
                      type="number" value={amountXLM} onChange={e => handleXLMChange(e.target.value)}
                      placeholder="0.00" required style={{ ...fieldStyle, background: isInsufficient ? 'var(--error)' : 'var(--bg)', paddingRight: 50 }}
                    />
                    <span style={{ position:'absolute', right:20, top:'50%', transform:'translateY(-50%)', fontWeight:800, color:'var(--primary)' }}>XLM</span>
                  </div>
                </div>
                {isInsufficient && (
                  <p style={{ color:'var(--error-text)', fontSize:12, fontWeight:700, marginTop:12, marginLeft: 16 }}>
                     ⚠️ Volume exceeds limits (Avail: {walletBalance.toFixed(2)} XLM)
                  </p>
                )}
              </div>

              <div style={{ display:'flex', flexWrap: 'wrap', gap:16 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, opacity: 0.6, marginBottom: 8, display: 'block', textTransform:'uppercase' }}>Frequency</label>
                  <select value={frequency} onChange={e => setFrequency(e.target.value)} style={fieldStyle}>
                    {FREQUENCIES.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, opacity: 0.6, marginBottom: 8, display: 'block', textTransform:'uppercase' }}>Due Date</label>
                  <input
                    type="date" value={releaseAt} onChange={e => setReleaseAt(e.target.value)}
                    required style={fieldStyle} min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div>
                <input
                  value={note} onChange={e => setNote(e.target.value)}
                  placeholder="Note (Optional)" maxLength={40} style={{...fieldStyle, background: 'transparent', borderBottom: '2px solid rgba(255,255,255,0.4)', borderRadius: 0, boxShadow: 'none', paddingLeft: 4}}
                />
              </div>

              <button
                type="submit" disabled={isLocking || isInsufficient}
                className="btn-primary"
                style={{ 
                  padding:'20px 32px', fontSize:16, border:'none',
                  borderRadius:'999px', marginTop:24, width: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                  boxShadow: '0 20px 48px rgba(139,92,246,0.25)' 
                }}
              >
                {isLocking
                  ? <><Loader2 size={20} className="spinning" /> Channeling Funds…</>
                  : <><CreditCard size={20} /> Setup Payment</>
                }
              </button>
            </form>
          )}
        </div>

        {/* Educational Module */}
        <div className="module" style={{ flex: '1 1 300px', background: 'linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))', color: 'white', borderRadius: 32, border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', boxShadow: '0 0 40px rgba(255, 0, 255, 0.15)', padding: '40px' }}>
          <div style={{ fontSize:13, fontWeight:800, letterSpacing:1, marginBottom:24, display:'flex', alignItems:'center', gap:10, opacity: 0.9 }}>
            <AlertCircle size={18} /> HOW IT WORKS
          </div>
          <p style={{ fontSize:15, lineHeight:1.6, marginBottom:24, opacity: 0.9 }}>
            PayDrip secures your budget. We time-lock funds so you don't accidentally spend money meant for bills.
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:16, opacity: 0.8 }}>
            {[
              'Set aside funds strictly for a specific bill',
              'The required XLM is securely escrowed on the Stellar blockchain',
              'Funds are automatically unlocked on the due date'
            ].map((t, i) => (
              <div key={i} style={{ fontSize:13, display:'flex', gap:12, alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent:'center', flexShrink: 0, fontWeight: 700, fontSize: 10 }}>{i+1}</div>
                <div style={{ paddingTop: 3 }}>{t}</div>
              </div>
            ))}
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
