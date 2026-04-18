import { ArrowUpRight, ArrowDownLeft, Clock, Lock, Inbox, ExternalLink, Copy } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { formatDate } from '../utils/formatters';


const TYPE_META = {
  sent:      { icon: ArrowUpRight,  iconColor:'#BE185D', iconBg:'#FFE4E6', label:'Sent' },
  received:  { icon: ArrowDownLeft, iconColor:'white',   iconBg:'var(--primary)', label:'Received' },
  locked:    { icon: Lock,          iconColor:'white',   iconBg:'#60A5FA', label:'Locked' },
  scheduled: { icon: Clock,         iconColor:'#92400E', iconBg:'var(--secondary)', label:'Scheduled' },
};

const STATUS_CLASS = {
  Completed: 'badge badge-success',
  Locked:    'badge badge-info',
  Scheduled: 'badge badge-warn',
  Pending:   'badge badge-warn',
  Failed:    'badge badge-error',
};

// ─── Single row ───────────────────────────────────────────────────────────────
function ActivityRow({ item }) {
  const meta = TYPE_META[item.type] || TYPE_META.sent;
  const Icon = meta.icon;
  const isPositive = item.type === 'received';
  const explorerUrl = `https://stellar.expert/explorer/testnet/tx/${item.hash}`;
  const toast = useToast();

  const copyHash = () => {
    if (!item.hash) return;
    navigator.clipboard.writeText(item.hash);
    toast.success('Transaction hash copied!');
  };

  return (
    <div style={{ display:'flex', alignItems:'center', gap:20, padding:'20px 24px', marginBottom: '24px', background: 'var(--surface-2)', borderRadius: '999px', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)', transition: 'all 0.4s' }} className="module-pill">
      <div style={{ width:48, height:48, borderRadius:'50%', background:meta.iconBg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow: `0 0 20px ${meta.iconColor}40` }}>
        <Icon size={20} color={meta.iconColor} />
      </div>
      <div style={{ flex:1, minWidth:0, textAlign: 'left' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
          <div style={{ fontSize:15, fontWeight:700, color:'var(--text)', letterSpacing: 0.5 }}>
            {item.service ? `${item.service} Bill` : meta.label} · {item.asset}
          </div>
          {item.hash && (
            <div style={{ display:'flex', gap:8 }}>
              <a href={explorerUrl} target="_blank" rel="noreferrer" style={{ color:'var(--text-3)', display:'flex', alignItems:'center', background:'rgba(255,255,255,0.1)', padding:'4px', borderRadius:'50%' }} title="View on Explorer">
                <ExternalLink size={12} color="var(--primary)" />
              </a>
              <button 
                onClick={copyHash}
                style={{ background:'rgba(255,255,255,0.1)', border:'none', color:'var(--text-3)', cursor:'pointer', display:'flex', alignItems:'center', padding:'4px', borderRadius:'50%' }}
                title="Copy Hash"
              >
                <Copy size={12} color="var(--primary)" />
              </button>
            </div>
          )}
        </div>
        <div style={{ fontSize:12, color:'var(--text-3)', fontWeight: 600 }}>
          {item.frequency ? `${item.frequency} Plan` : item.to ? `To: ${item.to.slice(0,10)}…` : item.from ? `From: ${item.from.slice(0,10)}…` : ''}
          {item.releaseAt ? ` · Due: ${new Date(item.releaseAt).toLocaleDateString()}` : ''}
        </div>
      </div>
      <div style={{ textAlign:'right', flexShrink:0 }}>
        <div style={{ fontSize:16, fontWeight:800, color: isPositive ? 'var(--success-text)' : 'var(--text)', marginBottom:6, textShadow: isPositive ? '0 0 10px var(--success-text)' : 'none' }}>
          {isPositive ? '+' : '-'}{item.amount} {item.asset}
        </div>
        <span className={STATUS_CLASS[item.status] || 'badge badge-info'}>{item.status}</span>
        <div style={{ fontSize:10, color:'var(--text-3)', marginTop:6, fontWeight: 700 }}>{formatDate(item.date)}</div>
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
export function EmptyActivity() {
  return (
    <div className="empty-state">
      <div className="empty-icon"><Inbox size={28} color="var(--text-3)" /></div>
      <div style={{ fontWeight:600, color:'var(--text-2)', fontSize:15 }}>No recent activity</div>
      <div style={{ fontSize:13, color:'var(--text-3)', maxWidth:240 }}>
        Your transactions and scheduled payments will appear here.
      </div>
    </div>
  );
}

// ─── List ─────────────────────────────────────────────────────────────────────
export default function ActivityList({ items, limit }) {
  const shown = limit ? items.slice(0, limit) : items;
  if (!shown.length) return <EmptyActivity />;
  return (
    <div>
      {shown.map(item => <ActivityRow key={item.id} item={item} />)}
    </div>
  );
}
