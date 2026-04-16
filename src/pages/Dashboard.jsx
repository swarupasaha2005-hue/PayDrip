import React from 'react';
import { useWallet } from '../hooks/useWallet';
import { useApp } from '../hooks/useApp';
import { useUser } from '../hooks/useUser';
import WalletButton from '../components/WalletButton';
import ActivityList from '../components/ActivityList';
import SubscriptionCard from '../components/SubscriptionCard';
import { CalendarClock, RefreshCw, TrendingUp, ListOrdered } from 'lucide-react';
import { SkeletonCard, SkeletonBox } from '../components/UXHelpers';

export default function Dashboard() {
  const { address, balance, updateBalance, isConnecting } = useWallet();
  const { activityFeed, schedules, updateSchedule } = useApp();
  const { name } = useUser();

  const xlm = parseFloat(balance || 0);

  // Filter for active (not paid) subscriptions
  const activeSubs = (schedules || [])
    .filter(s => s.status !== 'Paid')
    .sort((a, b) => new Date(a.releaseAt) - new Date(b.releaseAt));

  const totalLocked = activeSubs.reduce((acc, s) => acc + parseFloat(s.amount), 0);

  // Execution simulation
  const handlePayNow = async (sub) => {
    // In a real app, this would trigger a contract release and potentially an external payment
    updateSchedule(sub.id, { status: 'Paid' });
    // Simulate some feedback
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3'); 
    audio.play().catch(() => {}); // Optional sound if possible
  };

  const getStatus = (releaseAt) => {
    const now = new Date();
    const target = new Date(releaseAt);
    const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return { label: 'Due Today', color: '#EF4444', isDue: true };
    if (diffDays <= 2) return { label: `Due in ${diffDays}d`, color: '#F59E0B', isDue: true };
    return { label: `Locked (${diffDays}d left)`, color: 'var(--text-3)', isDue: false };
  };

  // Advanced UX: Show skeletons during initial fetch
  if (address && balance === '0' && !isConnecting) {
    return (
      <div className="fade-up" style={{ padding: '32px' }}>
        <div style={{ marginBottom: 28 }}>
          <SkeletonBox width="200px" height="32px" />
        </div>
        <div className="grid-stack grid-stack-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="fade-up">
      {/* Page title row */}
      <div className="grid-stack" style={{ marginBottom:28, alignItems:'center' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <div>
            <h1 style={{ fontSize:26, fontWeight:800, letterSpacing:'-0.5px', marginBottom:4 }}>My Finances</h1>
            <p style={{ color:'var(--text-2)', fontSize:14 }}>{name ? `Welcome back, ${name} 👋` : 'Welcome back, Master Explorer 👋'}</p>
          </div>
          {address && (
            <button
              className="btn btn-ghost btn-icon"
              onClick={() => updateBalance(address)}
              title="Refresh balances"
            >
              <RefreshCw size={16} />
            </button>
          )}
        </div>
      </div>

      {!address ? (
        <div className="grid-stack">
          <div className="card-gradient">
            <div style={{ position:'relative', zIndex:1 }}>
              <p style={{ opacity:.8, fontSize:13, marginBottom:8 }}>Connect your wallet to begin</p>
              <h2 style={{ fontSize:36, fontWeight:800, letterSpacing:'-1px', marginBottom:24 }}>
                0.0000 <span style={{ fontSize:18, opacity:.7 }}>XLM</span>
              </h2>
              <WalletButton />
            </div>
          </div>
        </div>
      ) : (
        <div className="grid-stack">
          {/* Top Stats Cards */}
          <div className="grid-stack grid-stack-3" style={{ marginBottom:24 }}>
            <div className="card-gradient" style={{ gridColumn: 'span 2' }}>
              <div style={{ position:'relative', zIndex:1 }}>
                <p style={{ opacity:.8, fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>Spending Power (XLM)</p>
                <div style={{ fontSize:44, fontWeight:800, letterSpacing:'-2px', marginBottom:6 }}>
                  {xlm.toFixed(4)}
                </div>
                <div style={{ display:'flex', gap:16, marginTop:12 }}>
                  <div style={{ background:'rgba(0,0,0,0.1)', padding:'6px 12px', borderRadius:8, fontSize:12 }}>
                    <span style={{ opacity:.6 }}>Locked:</span> <span style={{ fontWeight:700 }}>{totalLocked.toFixed(2)}</span>
                  </div>
                  <div style={{ background:'rgba(0,0,0,0.1)', padding:'6px 12px', borderRadius:8, fontSize:12 }}>
                    <span style={{ opacity:.6 }}>Available:</span> <span style={{ fontWeight:700 }}>{(xlm - totalLocked).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card" style={{ background: 'var(--surface)', borderColor: 'var(--primary)', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:-10, right:-10, width:60, height:60, background:'var(--primary-dark)', opacity:0.1, borderRadius:'50%' }} />
              <div style={{ fontSize:11, color:'var(--text-2)', fontWeight:800, letterSpacing:.5, marginBottom:16 }}>DRIP STATUS</div>
              <div style={{ fontSize:22, fontWeight:800, color:'var(--primary-dark)' }}>Level {xlm > 10 ? 'Elite' : 'Starter'}</div>
              <div style={{ fontSize:11, color:'var(--text-3)', marginTop:6 }}>Reward Multiplier: 1.2x 🚀</div>
            </div>
          </div>

          {/* Active Subscriptions Section */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <h3 style={{ fontSize:18, fontWeight:800 }}>Upcoming Expenses</h3>
              <div style={{ fontSize:12, color:'var(--text-3)', fontWeight:600 }}>{activeSubs.length} Active Intents</div>
            </div>

            {activeSubs.length === 0 ? (
              <div className="card" style={{ padding: '40px', textAlign: 'center', background: 'var(--surface-2)', border: '1px dashed var(--border)' }}>
                 <CalendarClock size={32} style={{ opacity:0.2, marginBottom:16, margin: '0 auto' }} />
                 <p style={{ fontSize:14, color:'var(--text-2)' }}>No upcoming payments scheduled.</p>
                 <p style={{ fontSize:12, color:'var(--text-3)', marginTop:4 }}>Start by adding a subscription in the Payments tab.</p>
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:20 }}>
                {activeSubs.map(sub => (
                  <SubscriptionCard 
                    key={sub.id} 
                    sub={{
                      ...sub,
                      status: getStatus(sub.releaseAt).isDue ? 'Due' : sub.status,
                      fiatAmount: sub.inrAmount || sub.fiatAmount // Fallback for old data
                    }}
                    onPayNow={handlePayNow}
                  />
                ))}
              </div>
            )}
          </div>

          {/* New Onboarding / Educational Flow */}
          <div className="card" style={{ background: 'var(--bg)', border: '2px solid var(--primary)', marginBottom: 32, padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ padding: 10, background: 'var(--primary)', borderRadius: 12 }}>
                <RefreshCw size={20} color="white" />
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 800 }}>Smart Financial Discipline</h3>
            </div>
            <div className="grid-stack grid-stack-3" style={{ gap: 24 }}>
              {[
                { title: 'Lock Budget', desc: 'Seal funds specifically for recurring bills so you never overspend.' },
                { title: 'Auto-Detect', desc: 'Our smart contracts track due dates and alert you when payment is near.' },
                { title: 'Proof of Pay', desc: 'Securely release and verify payments on the Steller public ledger.' },
              ].map((s, i) => (
                <div key={i}>
                  <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 6, color: 'var(--primary-dark)' }}>{s.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5 }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize:17, fontWeight:800, marginBottom:20, display:'flex', alignItems:'center', gap:10 }}>
              <ListOrdered size={18} color="var(--primary)" /> 
              Recent Activity
            </h3>
            <ActivityList items={activityFeed} limit={5} />
          </div>
        </div>
      )}
    </div>
  );
}

