import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { useApp } from '../context/AppContext';
import WalletButton from '../components/WalletButton';
import ActivityList from '../components/ActivityList';
import { ArrowUpRight, Lock, CalendarClock, RefreshCw, TrendingUp, Shield } from 'lucide-react';

export default function Dashboard() {
  const { address, balance, updateBalance, isConnecting } = useWallet();
  const { activityFeed, schedules } = useApp();
  const navigate = useNavigate();

  const xlm = parseFloat(balance || 0);
  const lockedTotal = schedules
    .filter(s => s.status === 'Scheduled')
    .reduce((sum, s) => sum + parseFloat(s.amount || 0), 0);
  const available = Math.max(0, xlm - lockedTotal);

  const actions = [
    { label:'Send XLM',    icon:ArrowUpRight,  color:'#B8A8FF', bg:'#F0EDFF', route:'/send'      },
    { label:'Lock Funds',  icon:Lock,          color:'#60A5FA', bg:'#EFF6FF', route:'/scheduler'  },
    { label:'Schedule',    icon:CalendarClock, color:'#F59E0B', bg:'#FFFBEB', route:'/scheduler'  },
  ];

  return (
    <div className="fade-up">
      {/* Page title row */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:800, letterSpacing:'-0.5px', marginBottom:4 }}>Dashboard</h1>
          <p style={{ color:'var(--text-2)', fontSize:14 }}>Welcome back{address ? ', Explorer 👋' : ''}</p>
        </div>
        {address && (
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => updateBalance(address)}
            title="Refresh balance"
          >
            <RefreshCw size={16} />
          </button>
        )}
      </div>

      {!address ? (
        /* ── Not connected ── */
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, alignItems:'start' }}>
          <div className="card-gradient" style={{ gridColumn:'1/-1' }}>
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
        <>
          {/* ── Balance cards row ── */}
          <div className="grid-3" style={{ marginBottom:24 }}>
            <div className="card-gradient" style={{ gridColumn:'span 2', padding:28 }}>
              <div style={{ position:'relative', zIndex:1 }}>
                <p style={{ opacity:.8, fontSize:12, letterSpacing:1, textTransform:'uppercase', marginBottom:6 }}>Total Balance</p>
                <div style={{ fontSize:44, fontWeight:800, letterSpacing:'-2px', marginBottom:6 }}>
                  {xlm.toFixed(4)}
                  <span style={{ fontSize:18, opacity:.7, marginLeft:8 }}>XLM</span>
                </div>
                <p style={{ opacity:.7, fontSize:13 }}>Stellar Testnet · Updated just now</p>
              </div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div className="card" style={{ flex:1 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                  <span style={{ fontSize:12, color:'var(--text-2)', fontWeight:600, letterSpacing:.5 }}>AVAILABLE</span>
                  <TrendingUp size={15} color="#10B981" />
                </div>
                <div style={{ fontSize:22, fontWeight:800, color:'#059669' }}>{available.toFixed(4)}</div>
                <div style={{ fontSize:11, color:'var(--text-3)', marginTop:2 }}>XLM · Spendable</div>
              </div>
              <div className="card" style={{ flex:1 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                  <span style={{ fontSize:12, color:'var(--text-2)', fontWeight:600, letterSpacing:.5 }}>LOCKED</span>
                  <Shield size={15} color="#60A5FA" />
                </div>
                <div style={{ fontSize:22, fontWeight:800, color:'#2563EB' }}>{lockedTotal.toFixed(4)}</div>
                <div style={{ fontSize:11, color:'var(--text-3)', marginTop:2 }}>XLM · Scheduled</div>
              </div>
            </div>
          </div>

          {/* ── Quick Actions ── */}
          <div className="grid-3" style={{ marginBottom:28 }}>
            {actions.map(({ label, icon: Icon, color, bg, route }) => (
              <button
                key={label}
                onClick={() => navigate(route)}
                className="card"
                style={{
                  display:'flex', flexDirection:'column', alignItems:'center', gap:14,
                  padding:'24px 16px', border:'none', cursor:'pointer',
                  background:'var(--surface)', textAlign:'center',
                  transition:'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='var(--shadow-lg)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)';  e.currentTarget.style.boxShadow='var(--shadow-md)'; }}
              >
                <div style={{ width:52, height:52, borderRadius:18, background:bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Icon size={24} color={color} />
                </div>
                <span style={{ fontSize:14, fontWeight:700, color:'var(--text)' }}>{label}</span>
              </button>
            ))}
          </div>

          {/* ── Bottom Section: Activity + Analytics ── */}
          <div className="grid-2-1" style={{ gap:24 }}>
            {/* Recent Activity */}
            <div className="card" style={{ padding:'24px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                <h3 style={{ fontSize:17, fontWeight:700 }}>Recent Activity</h3>
                <button onClick={() => navigate('/activity')} className="btn btn-ghost" style={{ padding:'6px 14px', fontSize:12 }}>
                  View all →
                </button>
              </div>
              <ActivityList items={activityFeed} limit={5} />
            </div>

            {/* Analytics Placeholder */}
            <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
              <div className="card">
                <div style={{ fontSize:14, fontWeight:700, marginBottom:16 }}>Savings Progress</div>
                <div style={{ height:8, width:'100%', background:'var(--bg)', borderRadius:99, overflow:'hidden', marginBottom:12 }}>
                  <div style={{ height:'100%', width:'65%', background:'var(--primary)', borderRadius:99 }} />
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--text-3)' }}>
                  <span>Goal: 10,000 XLM</span>
                  <span style={{ fontWeight:700, color:'var(--primary)' }}>65%</span>
                </div>
              </div>

              <div className="card" style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', textAlign:'center', background:'linear-gradient(135deg, white, #FAF9FD)' }}>
                <div style={{ width:100, height:100, borderRadius:'50%', border:'8px solid var(--bg)', borderTopColor:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16, transform:'rotate(-45deg)' }}>
                  <div style={{ transform:'rotate(45deg)', fontWeight:800, color:'var(--text)' }}>78%</div>
                </div>
                <div style={{ fontSize:13, fontWeight:700 }}>Monthly Target</div>
                <div style={{ fontSize:11, color:'var(--text-3)', marginTop:4 }}>Active schedules tracked</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
