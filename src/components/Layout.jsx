import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import NotificationPanel from './NotificationPanel';
import { SlideTabs } from './ui/slide-tabs';
import PredictiveBanner from './ui/PredictiveBanner';
import { useUser } from '../hooks/useUser';
import { useWallet } from '../hooks/useWallet';
import { useApp } from '../hooks/useApp';
import { useTheme } from './ThemeProvider';
import { Sun, Moon, Plus } from 'lucide-react';
import GeometricSphere from './ui/geometric-sphere';

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

  const gen = gender ? gender.toLowerCase() : '';
  
  let baseColor = '#E947F5';
  if (gen === 'male') baseColor = '#2F4BA2';
  else if (gen === 'other' || gen === 'others') baseColor = '#10B981';

  let logoGradient = ['#E947F5', '#FF8AFB'];
  if (gen === 'male') {
    logoGradient = ['#2F4BA2', '#4BA5FA'];
  } else if (gen === 'other' || gen === 'others') {
    logoGradient = ['#10B981', '#34D399'];
  }

  const themeGradients = {
    male: {
      start: '#94b9ff',
      end: '#5c8eff',
      glow: 'rgba(92, 142, 255, 0.15)'
    },
    female: {
      start: '#ff9eb5',
      end: '#f472b6',
      glow: 'rgba(244, 114, 182, 0.15)'
    },
    other: {
      start: '#86efac',
      end: '#10b981',
      glow: 'rgba(16, 185, 129, 0.15)'
    },
    others: {
      start: '#86efac',
      end: '#10b981',
      glow: 'rgba(16, 185, 129, 0.15)'
    },
    default: {
      start: '#F1F5F9',
      end: '#94A3B8',
      glow: 'rgba(255, 255, 255, 0.05)'
    }
  };

  const curGrad = themeGradients[gen] || themeGradients.default;

  const headerBlur = scrollY > 20;

  return (
    <>
      {/* Ambient Background — always visible */}
      <div className="ambient-bg" />
      <GeometricSphere />

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh', 
        width: '100vw', 
        position: 'relative', 
        zIndex: 1,
        '--h-grad-start': curGrad.start,
        '--h-grad-end': curGrad.end,
        '--h-glow': curGrad.glow
      }}>
        <main style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: 0 }}>
          
          {/* Header */}
          <header style={{ 
            padding: '20px 48px', 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            background: headerBlur ? 'rgba(5, 10, 24, 0.7)' : 'rgba(5, 10, 24, 0.3)',
            backdropFilter: 'blur(40px) saturate(140%)',
            WebkitBackdropFilter: 'blur(40px) saturate(140%)',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            transition: 'background 0.4s ease'
          }}>
            {/* Left: Logo */}
            <div style={{ 
              width: '160px', 
              height: '36px',
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
              filter: `drop-shadow(0 0 14px ${logoGradient[0]}44)`
            }} />

            {/* Center: SlideTabs */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <SlideTabs />
            </div>

            {/* Right: Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {address ? (
                  <div style={{ 
                    background: 'rgba(255, 255, 255, 0.04)', 
                    backdropFilter: 'blur(12px)', 
                    padding: '8px 16px', 
                    borderRadius: 100, 
                    border: '1px solid rgba(255,255,255,0.06)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 12,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.2)'
                  }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: baseColor }}>
                        {parseFloat(internalWalletBalance||0).toFixed(2)} <span style={{fontSize: 10, opacity: 0.5}}>XLM</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => addInternalFunds(500)}
                      style={{ 
                        background: 'rgba(255,255,255,0.08)', 
                        border: 'none', 
                        borderRadius: '50%', 
                        width: 24, height: 24, 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        cursor: 'pointer', color: '#fff',
                        transition: 'background 0.2s ease'
                      }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                ) : (
                  <button className="pd-btn pd-btn-primary" style={{ padding: '10px 24px', fontSize: 13 }}>
                    Connect
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button 
                  onClick={toggleTheme} 
                  style={{ 
                    background: 'rgba(255,255,255,0.04)', 
                    border: '1px solid rgba(255,255,255,0.06)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    cursor: 'pointer',
                    width: 36, height: 36,
                    borderRadius: '50%',
                    color: 'var(--text-3)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {themeMode === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                </button>
                
                <NotificationPanel />
              </div>

            </div>
          </header>

          <PredictiveBanner />

          <div style={{ flex: 1, width: '100%', paddingTop: 120, paddingBottom: 80, paddingLeft: 48, paddingRight: 48, margin: '0 auto', maxWidth: 1500 }}>
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
}
