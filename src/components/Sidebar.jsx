import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { LayoutDashboard, CreditCard, ListOrdered, LogOut, Zap, Database, Cpu, ShieldCheck, Sun, Moon, BarChart3 } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useApp } from '../hooks/useApp';
import { Plus } from 'lucide-react';

const navItems = [
  { to: '/dashboard',     label: 'Dashboard', icon: LayoutDashboard },
  { to: '/subscriptions', label: 'Payments',  icon: CreditCard },
  { to: '/planner',       label: 'Agent Intent', icon: Cpu },
  { to: '/vault',         label: 'Security Vault', icon: ShieldCheck },
  { to: '/activity',      label: 'Activity',  icon: ListOrdered },
  { to: '/metrics',       label: 'Metrics',   icon: BarChart3 },
  { to: '/contract-view', label: 'Contract',  icon: Database },
];

export default function Sidebar() {
  const { address, balance } = useWallet();
  const { themeMode, toggleTheme } = useTheme();
  const { internalWalletBalance, addInternalFunds } = useApp();
  const navigate = useNavigate();

  const short = (a) => a ? `${a.slice(0,6)}…${a.slice(-4)}` : '';

  return (
    <aside className="sidebar">
      {/* Brand Node */}
      <div style={{ display:'flex', alignItems:'center', gap:12, paddingBottom: 32, marginBottom:16, borderBottom: '1px solid var(--border)' }}>
        <div style={{ width: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img 
            src="/logo.png" 
            alt="PayDrip Logo" 
            style={{ 
               width: '100%', 
               maxWidth: '200px', 
               objectFit: 'contain'
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
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} style={{ color: isActive ? 'var(--text)' : 'var(--text-3)' }} />
                  <span className="nav-label" style={{ fontWeight: isActive ? 700 : 500, color: isActive ? 'var(--text)' : 'var(--text-3)' }}>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Theme Toggle Module */}
      <div style={{ marginTop:'auto', paddingTop:16, borderTop:'1px solid var(--border)', paddingBottom: 16 }}>
         <button className="btn btn-ghost" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', padding: '12px 16px' }} onClick={toggleTheme}>
           <span style={{ fontSize: 13, fontWeight: 600 }}>{themeMode === 'light' ? 'Light Mode' : 'Dark Mode'}</span>
           {themeMode === 'light' ? <Sun size={16} /> : <Moon size={16} />}
         </button>
      </div>

      {/* Wallet Module */}
      <div>
        {address ? (
          <div className="stitch-card" style={{ padding: '16px', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--success)', flexShrink:0 }} />
              <span style={{ fontSize:11, fontWeight:700, color:'var(--success)', flex: 1, letterSpacing: 0.5 }}>CONNECTED</span>
            </div>

            <div style={{ fontSize:10, color:'var(--text-3)', marginBottom:4, fontWeight: 600 }}>IDENTITY</div>
            <div style={{ fontSize:13, fontWeight:600, color:'var(--text)', marginBottom:12, fontFamily:'monospace' }}>{short(address)}</div>
            
            <div style={{ fontSize:18, fontWeight:700, color:'var(--primary)', marginBottom: 16 }}>
              {parseFloat(balance||0).toFixed(4)} <span style={{fontSize:12, fontWeight:600}}>XLM</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <div style={{ fontSize:10, color:'var(--text-3)', fontWeight: 600 }}>PAYDRIP WALLET</div>
              <button 
                onClick={() => addInternalFunds(500)}
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <Plus size={10} color="var(--primary)" />
              </button>
            </div>
            <div style={{ fontSize:16, fontWeight:700, color:'var(--text)' }}>
              {parseFloat(internalWalletBalance||0).toFixed(2)} <span style={{fontSize:12, fontWeight:600}}>XLM</span>
            </div>
          </div>
        ) : (
          <p style={{fontSize: 12, color: 'var(--text-3)', textAlign: 'center'}}>Identity Node Offline</p>
        )}
      </div>
    </aside>
  );
}
