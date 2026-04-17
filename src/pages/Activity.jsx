import React, { useState } from 'react';
import { useApp } from '../hooks/useApp';
import { useWallet } from '../hooks/useWallet';
import ActivityList from '../components/ActivityList';
import { Filter } from 'lucide-react';

const FILTERS = ['All', 'Sent', 'Received', 'Scheduled'];

export default function Activity() {
  const { activityFeed } = useApp();
  const { address } = useWallet();
  const [filter, setFilter] = useState('All');

  const filtered = activityFeed.filter(item => {
    if (filter === 'All') return true;
    if (filter === 'Sent')      return item.type === 'sent';
    if (filter === 'Received')  return item.type === 'received';
    if (filter === 'Scheduled') return item.type === 'scheduled';
    return true;
  });

  return (
    <div className="spatial-spread fade-up">
      <div style={{ position:'relative', zIndex: 10, paddingLeft: 12, marginBottom:40 }}>
        <h1 style={{ fontSize:32, fontWeight:800, letterSpacing:'-1px', marginBottom:8 }}>Activity Stream</h1>
        <p style={{ color:'var(--text-2)', fontSize:16 }}>Observe the flow of your digital assets</p>
      </div>

      {/* Floating abstract filter clusters */}
      <div style={{ display:'flex', alignItems: 'center', gap: 24, marginBottom: 48, flexWrap: 'wrap' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, background: 'var(--surface-2)', padding: '12px 24px', borderRadius: '999px', boxShadow: 'var(--shadow-sm)' }}>
          <Filter size={16} color="var(--primary)" />
          <span style={{ fontSize:13, color:'var(--text)', fontWeight:800, textTransform: 'uppercase', letterSpacing: 1 }}>FILTER</span>
        </div>
        
        <div className="organic-cluster" style={{ padding: 0, justifyContent: 'flex-start', flex: 1 }}>
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding:'14px 28px', fontSize:14, borderRadius: '40% 60% 50% 50% / 50% 50% 60% 40%',
                background: filter===f ? 'var(--primary-dark)' : 'var(--surface)',
                color: filter===f ? 'white' : 'var(--text)',
                border: filter===f ? 'none' : '1px solid var(--border)',
                boxShadow: filter===f ? '0 12px 24px rgba(139,92,246,0.2)' : 'var(--shadow-sm)',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                transform: filter===f ? 'scale(1.1) translateY(-4px)' : 'scale(1)'
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {!address ? (
        <div className="module module-blob" style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', minHeight: 400 }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🔌</div>
          <div style={{ fontWeight:700, color:'var(--text)', fontSize: 18 }}>Connect your wallet to observe the stream</div>
        </div>
      ) : (
        <div className="module organic-panel" style={{ padding: '0', borderRadius: '40px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'32px 40px 16px', background: 'rgba(255,255,255,0.2)', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize:14, fontWeight:800, color:'var(--text-2)', textTransform: 'uppercase', letterSpacing: 1 }}>
              {filtered.length} {filtered.length===1 ? 'Stream' : 'Streams'} Detected
            </span>
          </div>
          <div style={{ padding: '24px 40px 40px' }}>
            <ActivityList items={filtered} />
          </div>
        </div>
      )}
    </div>
  );
}
