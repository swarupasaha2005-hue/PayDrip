import React from 'react';
import { useWallet } from '../hooks/useWallet';
import { useApp } from '../hooks/useApp';
import { useUser } from '../hooks/useUser';
import WalletButton from '../components/WalletButton';
import ActivityList from '../components/ActivityList';
import { CalendarClock, RefreshCw, TrendingUp } from 'lucide-react';
import { SkeletonCard, SkeletonBox } from '../components/UXHelpers';

export default function Dashboard() {
  const { address, balance, updateBalance, isConnecting } = useWallet();
  const { activityFeed } = useApp();
  const { name } = useUser();

  const xlm = parseFloat(balance || 0);

  
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
            <h1 style={{ fontSize:26, fontWeight:800, letterSpacing:'-0.5px', marginBottom:4 }}>Dashboard</h1>
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
          {/* Main Balance Card */}
          <div className="grid-stack grid-stack-3" style={{ marginBottom:24 }}>
            <div className="card-gradient" style={{ gridColumn: 'span 2' }}>
              <div style={{ position:'relative', zIndex:1 }}>
                <p style={{ opacity:.8, fontSize:12, letterSpacing:1, textTransform:'uppercase', marginBottom:6 }}>Total Balance</p>
                <div style={{ fontSize:44, fontWeight:800, letterSpacing:'-2px', marginBottom:6 }}>
                  {xlm.toFixed(4)}
                  <span style={{ fontSize:18, opacity:.7, marginLeft:8 }}>XLM</span>
                </div>
                <p style={{ opacity:.7, fontSize:13 }}>Stellar Testnet · Rewards Active 🚀</p>
              </div>
            </div>

            <div className="card" style={{ background: 'var(--surface)', borderColor: 'var(--primary)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <span style={{ fontSize:12, color:'var(--text-2)', fontWeight:600, letterSpacing:.5 }}>DRIP REWARDS</span>
                <TrendingUp size={15} color="#B8A8FF" />
              </div>
              <div style={{ fontSize:22, fontWeight:800, color:'var(--primary-dark)' }}>{xlm > 0 ? (xlm * 0.1).toFixed(0) : '0'}</div>
              <div style={{ fontSize:11, color:'var(--text-3)', marginTop:2 }}>Loyalty Points · Minted on Claim</div>
            </div>
          </div>

          {/* How it Works / Onboarding */}
          <div className="card" style={{ background: 'var(--surface-2)', border: '1px dashed var(--primary)', marginBottom: 24, padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ padding: 8, background: 'var(--bg)', borderRadius: 10 }}>
                <CalendarClock size={20} color="var(--primary-dark)" />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>New to PayDrip? Get started in 3 steps</h3>
            </div>
            <div className="grid-stack grid-stack-3" style={{ gap: 16 }}>
              {[
                { step: 1, title: 'Schedule', desc: 'Lock XLM in our vault for a specific date.' },
                { step: 2, title: 'Monitor', desc: 'Track your time-locked vault in real-time.' },
                { step: 3, title: 'Claim', desc: 'Release funds back to your wallet once mature.' },
              ].map(s => (
                <div key={s.step} style={{ display: 'flex', gap: 12 }}>
                  <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 18, opacity: 0.6 }}>0{s.step}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{s.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-2)', lineHeight: 1.4 }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Section */}

          <div className="grid-stack grid-stack-2-1" style={{ gap:24 }}>
            <div className="card">
              <h3 style={{ fontSize:17, fontWeight:700, marginBottom:16 }}>Activity Timeline</h3>
              <ActivityList items={activityFeed} limit={5} />
            </div>
            <div className="card" style={{ background: 'var(--surface-2)' }}>
              <div style={{ fontSize:14, fontWeight:700, marginBottom:16 }}>Your Yield Goal</div>
              <div style={{ height:8, width:'100%', background: 'white', borderRadius:99, overflow:'hidden', marginBottom:12 }}>
                <div style={{ height:'100%', width:'82%', background:'var(--primary)', borderRadius:99 }} />
              </div>
              <div style={{ fontSize:12, color:'var(--text-3)' }}>
                Target reached: <span style={{ fontWeight:700, color:'var(--primary)' }}>82%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

