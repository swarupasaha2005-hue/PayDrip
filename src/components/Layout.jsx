import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import NotificationPanel from './NotificationPanel';
import PillNav from './ui/PillNav';
import PredictiveBanner from './ui/PredictiveBanner';
import { useUser } from '../hooks/useUser';
import { useWallet } from '../hooks/useWallet';
import { useApp } from '../hooks/useApp';
import { useTheme } from './ThemeProvider';
import { Sun, Moon, Plus } from 'lucide-react';

export default function Layout() {
  const location = useLocation();
  const { gender } = useUser();
  const { address, balance } = useWallet();
  const { internalWalletBalance, addInternalFunds } = useApp();
  const { themeMode, toggleTheme } = useTheme();

  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const short = (a) => a ? `${a.slice(0,6)}…${a.slice(-4)}` : '';

  const pillItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Payments', href: '/subscriptions' },
    { label: 'Planner', href: '/planner' },
    { label: 'Vault', href: '/vault' },
    { label: 'Activity', href: '/activity' },
    { label: 'Metrics', href: '/metrics' },
    { label: 'Contract', href: '/contract-view' }
  ];

  let baseColor = 'var(--primary)'; // default
  let pillColor = 'var(--bg)';
  const hoverText = '#ffffff';

  const gen = gender ? gender.toLowerCase() : '';
  if (gen === 'male') {
    baseColor = '#2F4BA2';
  } else if (gen === 'female' || !gen) {
    baseColor = '#E947F5';
  } else {
    baseColor = '#10B981';
  }

  pillColor = themeMode === 'light' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(22, 22, 28, 0.6)';

  let logoGradient = ['#E947F5', '#FF8AFB'];
  if (gen === 'male') {
    logoGradient = ['#2F4BA2', '#4BA5FA'];
  } else if (gen === 'other' || gen === 'others') {
    logoGradient = ['#10B981', '#34D399'];
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100vw', position: 'relative' }}>
        <main className="main-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: 0 }}>
          
          {/* PayDrip Dynamic Logo mapped to natural doc flow */}
          <div style={{ 
            position: 'absolute', 
            left: '29px', 
            top: '20px', 
            zIndex: 100,
            width: '140px', 
            height: '40px',
            backgroundColor: logoGradient[0],
            backgroundImage: `linear-gradient(135deg, ${logoGradient[0]}, ${logoGradient[1]})`,
            maskImage: 'url(/logo.png)',
            WebkitMaskImage: 'url(/logo.png)',
            maskSize: 'contain',
            WebkitMaskSize: 'contain',
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
            maskPosition: 'left center',
            WebkitMaskPosition: 'left center',
            transition: 'background 0.8s ease, filter 0.8s ease',
            filter: `drop-shadow(0 4px 16px ${logoGradient[0]}88)`
          }} />
          
          <header style={{ 
            padding: '40px 40px 24px', 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            position: 'relative',
            zIndex: 10
          }}>
            {/* Left side: PillNav mapped smoothly natively into DOM flow */}
            <div style={{
              transform: `scale(${Math.max(0.85, 1 - scrollY * 0.001)}) translateY(${Math.max(-20, -scrollY * 0.5)}px)`,
              opacity: Math.max(0.6, 1 - scrollY * 0.002),
              transformOrigin: 'top left',
              transition: 'transform 0.1s ease-out, opacity 0.1s ease-out'
            }}>
              <PillNav
                logo={null}
                logoAlt="PayDrip"
                items={pillItems}
                activeHref={location.pathname}
                baseColor={baseColor}
                pillColor={pillColor}
                hoveredPillTextColor={hoverText}
                pillTextColor={themeMode === 'light' ? '#000' : '#fff'}
                initialLoadAnimation={true}
              />
            </div>

            {/* Right side controls, Wallet natively incorporated inside flow */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {address ? (
                  <div style={{ background: themeMode === 'light' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(30, 30, 36, 0.7)', backdropFilter: 'blur(10px)', padding: '12px 20px', borderRadius: 24, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <div>
                      <div style={{ fontSize:10, color:'var(--text-3)', fontWeight: 600 }}>IDENTITY</div>
                      <div style={{ fontSize:13, fontWeight:600, color:'var(--text)', fontFamily:'monospace' }}>{short(address)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize:10, color:'var(--text-3)', fontWeight: 600 }}>EXTERNAL</div>
                      <div style={{ fontSize:13, fontWeight:700, color:'var(--text)' }}>
                        {parseFloat(balance||0).toFixed(2)} <span style={{fontSize:10}}>XLM</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 16, borderLeft: '1px solid var(--border)' }}>
                       <div>
                         <div style={{ fontSize:10, color:'var(--text-3)', fontWeight: 600 }}>PAYDRIP ENGINE / INTERNAL</div>
                         <div style={{ fontSize:13, fontWeight:700, color: baseColor }}>
                           {parseFloat(internalWalletBalance||0).toFixed(2)} <span style={{fontSize:10}}>XLM</span>
                         </div>
                       </div>
                       <button 
                         onClick={() => addInternalFunds(500)}
                         style={{ background: baseColor, border: 'none', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', marginLeft: 8 }}
                       >
                         <Plus size={14} />
                       </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '8px 16px', borderRadius: 24, background: themeMode === 'light' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(30, 30, 36, 0.7)', backdropFilter: 'blur(10px)' }}>
                    <span style={{fontSize: 12, color: 'var(--text-3)', fontWeight: 500}}>Identity Node Offline</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button 
                  onClick={toggleTheme} 
                  style={{ 
                    background: themeMode === 'light' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(30, 30, 36, 0.7)', 
                    backdropFilter: 'blur(10px)',
                    border: '1px solid var(--border)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    cursor: 'pointer',
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    color: 'var(--text)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                  }}
                >
                  {themeMode === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                </button>
                
                <NotificationPanel />
              </div>

            </div>
          </header>

          <PredictiveBanner />

          <div className="content-grid" style={{ flex: 1, width: '100%', paddingTop: 32, paddingBottom: 40, paddingLeft: 40, paddingRight: 40, margin: '0 auto', maxWidth: 1400 }}>
            <Outlet />
          </div>
        </main>
      </div>

    </>
  );
}
