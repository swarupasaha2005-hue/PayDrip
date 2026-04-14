import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { Droplets, LayoutDashboard, CreditCard, ListOrdered, LogOut, Zap, Database } from 'lucide-react';

const navItems = [
  { to: '/dashboard',     label: 'Dashboard', icon: LayoutDashboard },
  { to: '/subscriptions', label: 'Payments',  icon: CreditCard },
  { to: '/activity',      label: 'Activity',  icon: ListOrdered },
  { to: '/contract-view', label: 'Contract',  icon: Database },
];

import { useUser } from '../hooks/useUser';

export default function Sidebar() {
  const { address, balance, disconnect } = useWallet();
  const { name } = useUser();
  const navigate = useNavigate();


  const short = (a) => a ? `${a.slice(0,6)}…${a.slice(-4)}` : '';

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'4px 6px 20px', borderBottom:'1px solid var(--border)', marginBottom:8 }}>
        <div style={{ width:36, height:36, borderRadius:12, background:'var(--logo-grad)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <Droplets size={18} color="white" />
        </div>
        <div>
          <div style={{ fontWeight:800, fontSize:15, color:'var(--text)', letterSpacing:'-0.3px' }}>PayDrip</div>
          <div style={{ fontSize:10, color:'var(--text-2)', opacity:0.6, fontWeight:500 }}>STELLAR TESTNET</div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ display:'flex', flexDirection:'column', gap:4, flex:1 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              style={({ isActive }) => ({
                background: isActive ? 'var(--nav-active)' : 'transparent',
                color: isActive ? 'var(--primary-dark)' : 'var(--text-2)',
                borderColor: isActive ? 'var(--primary)' : 'transparent'
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={17} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="nav-label" style={{ fontWeight: isActive ? 700 : 500 }}>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Wallet widget */}
      <div style={{ marginTop:'auto', paddingTop:16, borderTop:'1px solid var(--border)' }}>
        {address ? (
          <div style={{ background:'var(--bg)', borderRadius:'var(--radius-md)', padding:'14px 12px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:'#10B981', flexShrink:0 }} />
              <span style={{ fontSize:12, fontWeight:600, color:'var(--text)', flex: 1 }}>Connected</span>
            </div>
            {name && <div style={{ fontSize:15, fontWeight:800, color:'var(--text)', marginBottom:12 }}>{name}</div>}

            <div style={{ fontSize:11, color:'var(--text-3)', marginBottom:4 }}>Address</div>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text)', marginBottom:8, fontFamily:'monospace' }}>{short(address)}</div>
            <div style={{ fontSize:11, color:'var(--text-3)', marginBottom:2 }}>Balance</div>
            <div style={{ fontSize:16, fontWeight:700, color:'var(--primary-dark)', marginBottom:12 }}>
              {parseFloat(balance||0).toFixed(4)} <span style={{fontSize:11, fontWeight:500}}>XLM</span>
            </div>
            <button
              onClick={disconnect}
              className="btn btn-ghost"
              style={{ width:'100%', fontSize:12, padding:'8px 12px', gap:6 }}
            >
              <LogOut size={13} />
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-primary"
            style={{ width:'100%', fontSize:13, padding:'12px' }}
          >
            <Zap size={15} />
            Connect Wallet
          </button>
        )}
      </div>
    </aside>
  );
}
