import React, { useState, useEffect } from 'react';
import { X, Smartphone, ShieldCheck, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

export default function UPISimulationModal({ 
  isOpen, 
  onClose, 
  amountINR, 
  amountXLM, 
  recipient, 
  onConfirm 
}) {
  const [status, setStatus] = useState('idle'); // idle, processing, success, error
  const toast = useToast();

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => setStatus('idle'), 300);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSimulate = async () => {
    setStatus('processing');
    try {
      // Small simulated delay for UPI connection realism
      await new Promise(r => setTimeout(r, 1500));
      
      // Execute the real blockchain intent callback passed from parent
      await onConfirm();
      
      setStatus('success');
      
      // Auto close after success
      setTimeout(() => {
        onClose();
      }, 2500);
      
    } catch (err) {
      console.error(err);
      setStatus('error');
      toast.error('Payment simulation failed.');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const handleDeepLink = () => {
    // Graceful attempt to trigger deep-link upi intent on mobile devices.
    // On desktops, this will typically just fail softly, so we seamlessly handoff to the simulation anyway.
    const upiURI = `upi://pay?pa=paydrip@ybl&pn=PayDrip&am=${amountINR}&cu=INR&tn=Payment to ${recipient}`;
    window.location.href = upiURI;
    
    toast.info("Attempting to open native UPI App...");
    
    // Auto-fallback execution if device doesn't catch the URI scheme
    setTimeout(() => {
      handleSimulate();
    }, 1200);
  };

  return (
    <div 
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(5, 5, 10, 0.7)', backdropFilter: 'blur(10px)',
        padding: '24px'
      }}
      onClick={(e) => { if (e.target === e.currentTarget && status === 'idle') onClose(); }}
    >
      <div 
        className="fade-up" 
        style={{
          background: 'var(--bg)', borderRadius: '32px', width: '100%', maxWidth: '400px',
          overflow: 'hidden', border: '1px solid var(--border)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
          position: 'relative'
        }}
      >
        {/* Dynamic Header Gradient */}
        <div style={{ height: '140px', background: 'linear-gradient(135deg, #2F4BA2, #4BA5FA)', position: 'relative' }}>
           {status === 'idle' && (
             <button 
               onClick={onClose}
               style={{ position: 'absolute', top: 16, left: 16, background: 'rgba(0,0,0,0.3)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}
             >
               <X size={18} />
             </button>
           )}
           <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.3)', padding: '6px 12px', borderRadius: '50px', color: 'white', fontSize: '11px', fontWeight: 600 }}>
             <ShieldCheck size={14} /> Secured by PayDrip
           </div>
        </div>

        {/* User Card Overlapping Context */}
        <div style={{ position: 'relative', marginTop: '-40px', padding: '0 24px 32px', textAlign: 'center' }}>
          
          <div style={{ width: 80, height: 80, background: 'var(--card-bg)', borderRadius: '24px', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', boxShadow: '0 12px 32px rgba(0,0,0,0.2)' }}>
             {/* Initials avatar logic */}
             <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)' }}>
               {recipient ? recipient.substring(0, 2).toUpperCase() : 'PD'}
             </span>
          </div>

          <h3 style={{ fontSize: 20, color: 'var(--text)', marginBottom: 6, fontWeight: 700 }}>Paying {recipient || 'Merchant'}</h3>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 24, fontFamily: 'monospace' }}>Verified Request</p>

          <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: '20px', border: '1px solid var(--border)', marginBottom: 24 }}>
             <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--text)', marginBottom: 8, letterSpacing: '-1px' }}>
                ₹{Number(amountINR).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
             </div>
             <div style={{ fontSize: 14, color: 'var(--text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                Gasless Web3 Escrow <ArrowRight size={14} /> {Number(amountXLM).toLocaleString()} XLM
             </div>
          </div>

          {status === 'idle' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button 
                onClick={handleDeepLink}
                className="btn btn-primary"
                style={{ width: '100%', padding: '18px', fontSize: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: '#4BA5FA', color: 'white', border: 'none' }}
              >
                <Smartphone size={20} /> Open UPI App
              </button>
              
              <button 
                onClick={handleSimulate}
                className="btn btn-ghost"
                style={{ width: '100%', padding: '16px', fontSize: '15px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                Continue via Blockchain
              </button>
            </div>
          )}

          {status === 'processing' && (
            <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0' }}>
               <Loader2 className="spin" size={40} color="#4BA5FA" style={{ marginBottom: 16 }} />
               <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>Processing Payment...</div>
               <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 8 }}>Securely locking on Stellar Testnet</div>
            </div>
          )}

          {status === 'success' && (
            <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0' }}>
               <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#10B98122', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                 <CheckCircle2 size={32} color="#10B981" />
               </div>
               <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>Payment Successful</div>
               <div style={{ fontSize: 14, color: 'var(--text-2)', marginTop: 8 }}>Funds securely locked on-chain</div>
            </div>
          )}

          {status === 'error' && (
            <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0' }}>
               <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#EF444422', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                 <X size={32} color="#EF4444" />
               </div>
               <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>Payment Failed</div>
               <div style={{ fontSize: 14, color: 'var(--text-2)', marginTop: 8 }}>Unable to execute transaction</div>
               <button onClick={() => setStatus('idle')} className="btn btn-outline" style={{ marginTop: 24, width: '100%' }}>Try Again</button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
