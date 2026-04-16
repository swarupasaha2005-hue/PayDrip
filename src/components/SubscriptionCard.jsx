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
    <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'var(--bg)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-dark)'
          }}>
            <Icon size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '15px' }}>{sub.service}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-2)', marginTop: '2px' }}>{sub.frequency} • Due: {releaseDateStr}</div>
          </div>
        </div>
        <div className={`badge ${STATUS_BADGE[sub.status] || 'badge-purple'}`}>
          {sub.status}
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '4px' }}>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Amount</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)' }}>
            ₹{sub.inrAmount}
            <span style={{ fontSize: '12px', color: 'var(--text-2)', marginLeft: '4px', fontWeight: 500 }}>
              (~{Number(sub.amount).toFixed(2)} XLM)
            </span>
          </div>
        </div>
        
        {isDue && onPayNow && (
          <button 
            className="btn btn-primary" 
            style={{ padding: '8px 14px', fontSize: '13px' }}
            onClick={() => onPayNow(sub)}
          >
            Pay Now <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
