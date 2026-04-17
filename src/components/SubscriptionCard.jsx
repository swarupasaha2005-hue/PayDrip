import React from 'react';
import { PlayCircle, Home, Music, Zap, MoreHorizontal, ArrowRight } from 'lucide-react';

const SERVICE_ICONS = {
  Netflix: PlayCircle,
  Rent: Home,
  Spotify: Music,
  Utility: Zap,
  Custom: MoreHorizontal,
};

const STATUS_BADGE = {
  'Locked': 'badge-locked',
  'Scheduled': 'badge-scheduled',
  'Due': 'badge-warn',
  'Paid': 'badge-paid',
};

export default function SubscriptionCard({ sub, onPayNow }) {
  const Icon = SERVICE_ICONS[sub.service] || SERVICE_ICONS.Custom;
  const isDue = sub.status === 'Due';
  
  // Format release date nicely
  const releaseDateStr = sub.releaseAt ? new Date(sub.releaseAt).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric'
  }) : 'TBD';

  return (
    <div style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '32px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            width: '48px', height: '48px', borderRadius: '50%',
            background: 'var(--bg)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-dark)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <Icon size={24} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 800, color: 'var(--text)', fontSize: '16px' }}>{sub.service}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-2)', marginTop: '2px' }}>{sub.frequency} • {releaseDateStr}</div>
          </div>
        </div>
        <div className={`badge ${STATUS_BADGE[sub.status] || 'badge-purple'}`}>
          {sub.status}
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Amount</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)' }}>
            ₹{sub.inrAmount}
            <span style={{ fontSize: '12px', color: 'var(--text-2)', marginLeft: '6px', fontWeight: 500 }}>
              (~{Number(sub.amount).toFixed(2)} XLM)
            </span>
          </div>
        </div>
        
        {isDue && onPayNow && (
          <button 
            className="btn btn-primary" 
            style={{ padding: '12px 20px', fontSize: '14px' }}
            onClick={() => onPayNow(sub)}
          >
            Pay Now <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
