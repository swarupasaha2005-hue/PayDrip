import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useApp } from '../hooks/useApp';
import { useUser } from '../hooks/useUser';
import WalletButton from '../components/WalletButton';
import ActivityList from '../components/ActivityList';
import SubscriptionCard from '../components/SubscriptionCard';
import { CalendarClock, RefreshCw, Smartphone, CheckCircle2, Copy, Droplets, Zap, ShieldCheck } from 'lucide-react';
import { SkeletonCard, SkeletonBox } from '../components/UXHelpers';
import { useToast } from '../hooks/useToast';

export default function Dashboard() {
  const { address, balance, updateBalance, isConnecting } = useWallet();
  const { activityFeed, schedules, updateSchedule, addNotification } = useApp();
  const { name } = useUser();
  const toast = useToast();

  const [upiModal, setUpiModal] = useState({ open: false, sub: null, loading: false });

  const xlm = parseFloat(balance || 0);

  // Filter for active (not paid) subscriptions
  const activeSubs = (schedules || [])
    .filter(s => s.status !== 'Paid')
    .sort((a, b) => new Date(a.releaseAt) - new Date(b.releaseAt));

  const totalLocked = activeSubs.reduce((acc, s) => acc + parseFloat(s.amount), 0);

  // Execution simulation via UPI Redirection
  const handlePayNow = (sub) => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const upiLink = `upi://pay?pa=merchant@upi&pn=${encodeURIComponent(sub.service)}&am=${sub.inrAmount}&cu=INR`;

    if (isMobile) {
      window.location.href = upiLink;
      setTimeout(() => {
        updateSchedule(sub.id, { status: 'Paid', type: 'sent' });
        addNotification('success', `Payment for ${sub.service} completed via UPI.`);
      }, 1500);
    } else {
      setUpiModal({ open: true, sub, loading: false });
    }
  };

  const simulateDesktopPayment = async () => {
    setUpiModal(prev => ({ ...prev, loading: true }));
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    updateSchedule(upiModal.sub.id, { status: 'Paid', type: 'sent' });
    addNotification('success', `Simulated Payment for ${upiModal.sub.service} completed successfully.`);
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3'); 
    audio.play().catch(() => {});
    
    setUpiModal({ open: false, sub: null, loading: false });
  };

  const copyUpiLink = () => {
    if (!upiModal.sub) return;
    const upiLink = `upi://pay?pa=merchant@upi&pn=${encodeURIComponent(upiModal.sub.service)}&am=${upiModal.sub.inrAmount}&cu=INR`;
    navigator.clipboard.writeText(upiLink);
    toast.success('UPI Link Copied! Send this to your mobile.');
  };

  const getStatus = (releaseAt) => {
    const now = new Date();
    const target = new Date(releaseAt);
    const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return { label: 'Due Today', color: '#EF4444', isDue: true };
    if (diffDays <= 2) return { label: `Due in ${diffDays}d`, color: '#F59E0B', isDue: true };
    return { label: `Locked (${diffDays}d left)`, color: 'var(--text-3)', isDue: false };
  };

  if (address && balance === '0' && !isConnecting) {
    return (
      <div className="fade-up" style={{ padding: '32px' }}>
        <div style={{ marginBottom: 28 }}>
          <SkeletonBox width="200px" height="32px" />
        </div>
        <div className="organic-cluster">
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="spatial-spread fade-up">
      {/* Title & Greeting - Organic Float */}
      <div style={{ position: 'absolute', top: 0, left: 40, zIndex: 10 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1px' }}>Dashboard</h1>
        <p style={{ color: 'var(--text-2)', fontSize: 16 }}>{name ? `Welcome back, ${name} 👋` : 'Master Explorer 👋'}</p>
      </div>

      {!address ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
          <div className="module module-blob" style={{ textAlign: 'center' }}>
             <p style={{ opacity: .8, fontSize: 13, marginBottom: 8 }}>Ready to connect</p>
             <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-1px', marginBottom: 24 }}>
                0.0000 <span style={{ fontSize: 18, opacity: .7 }}>XLM</span>
             </h2>
             <WalletButton />
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 80, position: 'relative' }}>
          
          {/* Main Balance Context wrapped densely */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 60 }}>
            
            {/* The primary focal point: Central balance blob */}
            <div className="module module-blob" style={{ width: 420, height: 420, position:'relative', zIndex: 5, overflow: 'hidden' }}>
              
              {/* Animated Wave Background Injection */}
              <svg width="100%" height="40%" viewBox="0 0 1440 320" style={{ position: 'absolute', bottom: 0, left: 0, zIndex: -1, opacity: 0.8, filter: 'drop-shadow(0 -10px 20px rgba(255,255,255,0.4))' }}>
                <path fill="var(--primary)" fillOpacity="0.3" d="M0,192L48,202.7C96,213,192,235,288,234.7C384,235,480,213,576,202.7C672,192,768,192,864,208C960,224,1056,256,1152,261.3C1248,267,1344,245,1392,234.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                <path fill="none" stroke="var(--accent)" strokeWidth="4" filter="drop-shadow(0 0 8px var(--accent))" d="M0,192L48,202.7C96,213,192,235,288,234.7C384,235,480,213,576,202.7C672,192,768,192,864,208C960,224,1056,256,1152,261.3C1248,267,1344,245,1392,234.7L1440,224"></path>
              </svg>

              <p style={{ opacity: 0.9, fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8, textShadow: '0 0 10px rgba(255,255,255,0.5)' }}>Spending Power</p>
              <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: '-3px', marginBottom: 12, textShadow: '0 0 20px rgba(255,255,255,0.8)' }}>
                {xlm.toFixed(4)} <span style={{ fontSize: 24, opacity: 0.9 }}>XLM</span>
              </div>
              <div style={{ background:'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)', padding:'10px 20px', borderRadius:24, fontSize:14, border: '1px solid rgba(255,255,255,0.2)' }}>
                Locked: <strong style={{ color: 'white' }}>{totalLocked.toFixed(2)}</strong> &middot; Free: <strong style={{color:'white'}}>{(xlm - totalLocked).toFixed(2)}</strong>
              </div>
              
              {/* Refresh Floating Action */}
              <button
                className="btn-icon"
                style={{ position: 'absolute', bottom: 20, right: 40, boxShadow: 'var(--shadow-lg)', border: '1px solid var(--primary)' }}
                onClick={() => updateBalance(address)}
                title="Refresh balances"
              >
                <RefreshCw size={20} />
              </button>
            </div>

            {/* Adjacent status bubbles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              <div className="module module-bubble" style={{ background: 'var(--primary-dark)', color: 'white' }}>
                <Zap size={28} style={{ marginBottom: 10, opacity: 0.8 }} />
                <div style={{ fontSize:11, opacity:0.8, fontWeight:800, letterSpacing:1 }}>DRIP STATUS</div>
                <div style={{ fontSize:18, fontWeight:800 }}>{xlm > 10 ? 'Elite' : 'Starter'}</div>
              </div>
              
              <div className="module module-bubble" style={{ background: 'var(--success)' }}>
                <ShieldCheck size={28} color="var(--success-text)" style={{ marginBottom: 10, opacity: 0.8 }} />
                <div style={{ fontSize:11, color: 'var(--success-text)', fontWeight:800, letterSpacing:1 }}>NETWORK</div>
                <div style={{ fontSize:18, fontWeight:800, color: 'var(--success-text)' }}>Testnet</div>
              </div>
            </div>

          </div>

          {/* Organic flow section: Active Subscriptions drifting as Pills */}
          <div style={{ marginBottom: 60, display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center' }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-2)', letterSpacing: 0.5 }}>Current Obligations ({activeSubs.length})</h3>
            
            {activeSubs.length === 0 ? (
              <div className="module module-pill" style={{ opacity: 0.6 }}>
                 <CalendarClock size={24} />
                 <p style={{ fontSize:14, fontWeight: 600 }}>No upcoming payments drifting nearby.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center' }}>
                {activeSubs.map((sub, i) => (
                  <div key={sub.id} style={{ transform: `translateY(${i % 2 === 0 ? '0' : '20px'})` }}>
                    {/* We still use SubscriptionCard but let's assume it inherits transparent padding if not, we wrap it. */}
                    <div className="module module-pill">
                      <SubscriptionCard 
                        sub={{
                          ...sub,
                          status: getStatus(sub.releaseAt).isDue ? 'Due' : sub.status,
                          fiatAmount: sub.inrAmount || sub.fiatAmount
                        }}
                        onPayNow={handlePayNow}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity flow spreading flat at the bottom */}
          <div className="module organic-panel" style={{ width: '100%', maxWidth: 800, margin: '0 auto' }}>
            <h3 style={{ fontSize:17, fontWeight:800, marginBottom:24, display:'flex', alignItems:'center', gap:10 }}>
              <Droplets size={20} color="var(--primary)" /> 
              Recent Drips
            </h3>
            <ActivityList items={activityFeed} limit={5} />
          </div>

        </div>
      )}

      {/* UPI Desktop Fallback Modal */}
      {upiModal.open && upiModal.sub && (
        <div
          style={{ position:'fixed', inset:0, zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(30,27,75,0.4)', backdropFilter:'blur(8px)', padding:24 }}
          onClick={(e) => { if (e.target === e.currentTarget && !upiModal.loading) setUpiModal({ open: false, sub: null, loading: false }); }}
        >
          <div className="module module-blob fade-up" style={{ background:'white', color:'var(--text)', padding:48, width:'100%', maxWidth:420, minHeight:'auto' }}>
            <div style={{ width:64, height:64, borderRadius:'50%', background: 'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', color: 'var(--primary)' }}>
              <Smartphone size={32} />
            </div>
            <h3 style={{ fontSize:22, marginBottom:8, fontWeight: 800, letterSpacing: '-0.5px' }}>
              UPI Redirection
            </h3>
            <p style={{ fontSize:14, color:'var(--text-3)', lineHeight:1.6, marginBottom: 24 }}>
              Automatic deep-linking is optimal on mobile. How to proceed for <strong>{upiModal.sub.service}</strong>?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
              <button onClick={simulateDesktopPayment} disabled={upiModal.loading} className="btn btn-primary" style={{ padding:16, fontSize:15 }}>
                {upiModal.loading ? <RefreshCw className="spinning" size={18} /> : <><CheckCircle2 size={18} /> Simulate Flow</>}
              </button>
              <button onClick={copyUpiLink} disabled={upiModal.loading} className="btn btn-ghost" style={{ padding:16, fontSize:15 }}>
                <Copy size={18} /> Copy UPI Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
