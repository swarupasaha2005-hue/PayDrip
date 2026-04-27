import React, { useEffect, useState } from 'react';
import { usePredictiveEngine } from '../../hooks/usePredictiveEngine';
import { Sparkles, AlertTriangle, Info, ShieldAlert, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PredictiveBanner() {
  const { suggestions } = usePredictiveEngine();
  const navigate = useNavigate();
  const [activeSuggestion, setActiveSuggestion] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

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
      icon: <ShieldAlert size={18} color="var(--error)" />,
      badge: 'Action Required'
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
        onClick={() => navigate(activeSuggestion?.actionRoute)}
        style={{
          background: themeConfig.border, // dynamically maps to the severity color
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
    </div>
  );
}
