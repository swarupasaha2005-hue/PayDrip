import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { LayoutDashboard, CreditCard, ListOrdered, LogOut, Zap, Database, Sparkles } from 'lucide-react';

const navItems = [
  { to: '/dashboard',     label: 'Dashboard', icon: LayoutDashboard },
  { to: '/subscriptions', label: 'Payments',  icon: CreditCard },
  { to: '/planner',       label: 'Smart Planner', icon: Sparkles },
  { to: '/activity',      label: 'Activity',  icon: ListOrdered },
  { to: '/contract-view', label: 'Contract',  icon: Database },
];

export default function Sidebar() {
  const { address, balance, disconnect } = useWallet();
  const navigate = useNavigate();

  const short = (a) => a ? `${a.slice(0,6)}…${a.slice(-4)}` : '';

  return (
    <aside className="sidebar" style={{ background: 'rgba(5, 5, 10, 0.6)', borderRight: '1px solid var(--border)', backdropFilter: 'blur(40px)', padding: '40px 24px', boxShadow: '10px 0 30px rgba(0,0,0,0.5)' }}>
      {/* Brand Node */}
      <div style={{ display:'flex', alignItems:'center', gap:12, paddingBottom: 32, marginBottom:16, borderBottom: '1px solid var(--border)' }}>
        
        {/* Main Uploaded Logo Lockup */}
        <div className="logo-float" style={{ width: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img 
            src="/logo.png" 
            alt="PayDrip Logo" 
            style={{ 
               width: '100%', 
               maxWidth: '220px', 
               objectFit: 'contain', 
               filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.4))'
            }} 
          />
        </div>
      </div>

      {/* Nav Link Tree */}
      <div style={{ display:'flex', flexDirection:'column', gap:8, flex:1 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} style={{ color: isActive ? 'white' : 'var(--text-3)' }} />
                  <span className="nav-label" style={{ fontWeight: isActive ? 800 : 600, color: isActive ? 'white' : 'var(--text-2)', letterSpacing: 0.5 }}>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Wallet Module */}
      <div style={{ marginTop:'auto', paddingTop:24, borderTop:'1px solid var(--border)' }}>
        {address ? (
          <div className="module" style={{ background:'var(--surface-2)', padding:'20px', borderRadius:'24px', border: '1px solid var(--border-glow)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
              <div style={{ width:10, height:10, borderRadius:'50%', background:'var(--success)', flexShrink:0, boxShadow: '0 0 12px var(--success-text)' }} />
              <span style={{ fontSize:12, fontWeight:800, color:'var(--success-text)', flex: 1, letterSpacing: 1 }}>CONNECTED</span>
            </div>

            <div style={{ fontSize:10, color:'var(--text-3)', marginBottom:4, fontWeight: 700, letterSpacing: 1 }}>IDENTITY NODE</div>
            <div style={{ fontSize:13, fontWeight:600, color:'white', marginBottom:16, fontFamily:'monospace' }}>{short(address)}</div>
            
            <div style={{ fontSize:10, color:'var(--text-3)', marginBottom:2, fontWeight: 700, letterSpacing: 1 }}>LIQUIDITY</div>
            <div style={{ fontSize:20, fontWeight:800, color:'var(--primary)', marginBottom:24, textShadow: '0 0 16px var(--border-glow)' }}>
              {parseFloat(balance||0).toFixed(4)} <span style={{fontSize:12, fontWeight:600}}>XLM</span>
            </div>
            
            <button
              onClick={disconnect}
              className="btn"
              style={{ width:'100%', fontSize:12, padding:'10px', gap:8, border: '1px solid var(--error-text)', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error-text)' }}
            >
              <LogOut size={14} />
              DISCONNECT
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-primary"
            style={{ width:'100%', fontSize:13, padding:'16px' }}
          >
            <Zap size={16} />
            ACTIVATE WALLET
          </button>
        )}
      </div>
    </aside>
  );
}
