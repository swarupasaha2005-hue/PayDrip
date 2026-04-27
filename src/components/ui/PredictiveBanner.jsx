import React, { useEffect, useState } from 'react';
import { usePredictiveEngine } from '../../hooks/usePredictiveEngine';
import { useApp } from '../../hooks/useApp';
import { useWallet } from '../../hooks/useWallet';
import { Sparkles, AlertTriangle, Info, ShieldCheck, ArrowRight, X, Wallet, ChevronRight, Loader2, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PredictiveBanner() {
  const { suggestions } = usePredictiveEngine();
  const { addInternalFunds } = useApp();
  const { balance } = useWallet();
  const navigate = useNavigate();
  const [activeSuggestion, setActiveSuggestion] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [fundingAmount, setFundingAmount] = useState('50');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (suggestions && suggestions.length > 0) {
      // If we gain a suggestion, slide it in
      requestAnimationFrame(() => {
        setActiveSuggestion(suggestions[0]);
        setIsVisible(true);
      });
    } else {
      // If no suggestions, smoothly slide out before nulling
      requestAnimationFrame(() => {
        setIsVisible(false);
      });
      const timer = setTimeout(() => setActiveSuggestion(null), 300);
      return () => clearTimeout(timer);
    }
  }, [suggestions]);

  if (!activeSuggestion && !isVisible) return null;

  const styleMap = {
    info: {
      border: 'var(--primary)',
      bg: 'rgba(var(--primary-rgb), 0.05)',
      icon: <Info size={18} color="var(--primary)" />,
      badge: 'Insight'
    },
    warning: {
      border: 'var(--warning)',
      bg: 'rgba(245, 158, 11, 0.05)',
      icon: <AlertTriangle size={18} color="var(--warning)" />,
      badge: 'Warning'
    },
    critical: {
      border: 'var(--error)',
      bg: 'rgba(239, 68, 68, 0.05)',
      icon: <ShieldCheck size={18} color="var(--error)" />,
      badge: 'Action Required'
    }
  };

  const handleAction = async () => {
    if (activeSuggestion?.actionType === 'allocate_funds') {
      setShowAllocateModal(true);
      return;
    }
    navigate(activeSuggestion?.actionRoute);
  };

  const executeFunding = async () => {
    setIsProcessing(true);
    try {
      await addInternalFunds(fundingAmount);
      setIsSuccess(true);
      setTimeout(() => {
        setShowAllocateModal(false);
        setIsSuccess(false);
        setIsProcessing(false);
      }, 2000);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  const themeConfig = styleMap[activeSuggestion?.level] || styleMap.info;

  return (
    <div 
      style={{
        margin: '0 auto 32px',
        maxWidth: 1400,
        width: '100%',
        borderRadius: 20,
        background: themeConfig.bg,
        border: `1px solid ${themeConfig.border}`,
        backdropFilter: 'blur(12px)',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 24,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(-10px)',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: `0 8px 32px rgba(0,0,0,0.04)`
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: 'var(--surface)', border: `1px solid ${themeConfig.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {themeConfig.icon}
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Sparkles size={12} color="var(--text-3)" />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Predictive Engine • {themeConfig.badge}
            </span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
            {activeSuggestion?.message}
          </div>
        </div>
      </div>

      <button 
        onClick={handleAction}
        style={{
          background: themeConfig.border, 
          color: '#fff',
          border: 'none',
          padding: '10px 20px',
          borderRadius: 12,
          fontSize: 13,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'transform 0.2s ease, filter 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.02)';
          e.currentTarget.style.filter = 'brightness(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.filter = 'brightness(1)';
        }}
      >
        {activeSuggestion?.actionLabel} <ArrowRight size={14} />
      </button>
      {/* Allocate Funds Modal Concept */}
      {showAllocateModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div className="pd-card-v2 fade-up" style={{ width: '100%', maxWidth: 460, padding: 32, position: 'relative' }}>
            {!isProcessing && !isSuccess && (
              <button 
                onClick={() => setShowAllocateModal(false)}
                style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)' }}
              >
                <X size={20} />
              </button>
            )}

            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ width: 64, height: 64, borderRadius: 22, background: 'rgba(var(--primary-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Wallet size={32} color="var(--primary)" />
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>Allocate Smart Funds</h2>
              <p style={{ fontSize: 14, color: 'var(--text-3)', lineHeight: 1.6 }}>
                Set aside funds from your connected wallet to your automated balance for seamless Smart Plan execution.
              </p>
            </div>

            {isSuccess ? (
              <div className="fade-up" style={{ textAlign: 'center', padding: '20px 0' }}>
                <CheckCircle2 color="var(--success)" size={64} style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>Allocation Successful</h3>
                <p style={{ fontSize: 14, color: 'var(--text-3)', marginTop: 8 }}>Your automated balance has been updated.</p>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 32 }}>
                  <label className="pd-field-label">Amount (XLM)</label>
                  <div className="pd-field">
                    <input 
                      type="number" 
                      value={fundingAmount} 
                      onChange={e => setFundingAmount(e.target.value)}
                      className="pd-input"
                      placeholder="Enter amount..."
                    />
                    <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary)' }}>XLM</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 12 }}>
                    <span style={{ color: 'var(--text-3)' }}>Wallet Balance:</span>
                    <span style={{ fontWeight: 700 }}>{parseFloat(balance || 0).toFixed(2)} XLM</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <button 
                    onClick={executeFunding}
                    disabled={isProcessing || !fundingAmount || parseFloat(fundingAmount) > parseFloat(balance || 0)}
                    className="pd-btn pd-btn-primary" 
                    style={{ width: '100%', padding: '16px', borderRadius: 16 }}
                  >
                    {isProcessing ? <><Loader2 size={18} className="spin" /> Processing...</> : 'Confirm Allocation'}
                  </button>
                  <button 
                    onClick={() => setShowAllocateModal(false)}
                    disabled={isProcessing}
                    className="pd-btn pd-btn-ghost" 
                    style={{ width: '100%', padding: '16px', borderRadius: 16 }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
