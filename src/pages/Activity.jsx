import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useWallet } from '../context/WalletContext';
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
    <div className="fade-up">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:800, letterSpacing:'-0.5px', marginBottom:4 }}>Activity</h1>
          <p style={{ color:'var(--text-2)', fontSize:14 }}>All your transactions and scheduled payments</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <Filter size={14} color="var(--text-3)" />
          <span style={{ fontSize:12, color:'var(--text-3)', fontWeight:600 }}>FILTER:</span>
        </div>
      </div>

      {/* Filter pills */}
      <div style={{ display:'flex', gap:8, marginBottom:24 }}>
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="btn"
            style={{
              padding:'8px 18px', fontSize:13, borderRadius:99,
              background: filter===f ? 'var(--primary)' : 'var(--surface)',
              color: filter===f ? 'white' : 'var(--text-2)',
              border: filter===f ? 'none' : '1px solid var(--border)',
              boxShadow: filter===f ? '0 4px 14px rgba(184,168,255,0.3)' : 'none',
              fontWeight: filter===f ? 700 : 500,
              transition: 'all 0.2s',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {!address ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">🔌</div>
            <div style={{ fontWeight:600, color:'var(--text-2)' }}>Connect your wallet to see activity</div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding:'8px 24px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 0 4px' }}>
            <span style={{ fontSize:13, fontWeight:600, color:'var(--text-2)' }}>
              {filtered.length} {filtered.length===1 ? 'entry' : 'entries'}
            </span>
          </div>
          <ActivityList items={filtered} />
        </div>
      )}
    </div>
  );
}
