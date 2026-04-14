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
    <div style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 0', borderBottom:'1px solid var(--border)' }}>
      <div style={{ width:44, height:44, borderRadius:'50%', background:meta.iconBg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Icon size={18} color={meta.iconColor} />
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
          <div style={{ fontSize:14, fontWeight:600, color:'var(--text)' }}>
            {item.service ? `${item.service} Bill` : meta.label} · {item.asset}
          </div>
          {item.hash && (
            <div style={{ display:'flex', gap:6 }}>
              <a href={explorerUrl} target="_blank" rel="noreferrer" style={{ color:'var(--text-3)', display:'flex', alignItems:'center' }} title="View on Explorer">
                <ExternalLink size={10} />
              </a>
              <button 
                onClick={copyHash}
                style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', display:'flex', alignItems:'center', padding:0 }}
                title="Copy Hash"
              >
                <Copy size={10} />
              </button>
            </div>
          )}
        </div>
        <div style={{ fontSize:12, color:'var(--text-3)' }}>
          {item.frequency ? `${item.frequency} Plan` : item.to ? `To: ${item.to.slice(0,10)}…` : item.from ? `From: ${item.from.slice(0,10)}…` : ''}
          {item.releaseAt ? ` · Due: ${new Date(item.releaseAt).toLocaleDateString()}` : ''}
        </div>
      </div>
      <div style={{ textAlign:'right', flexShrink:0 }}>
        <div style={{ fontSize:14, fontWeight:700, color: isPositive ? '#059669' : 'var(--text)', marginBottom:4 }}>
          {isPositive ? '+' : '-'}{item.amount} {item.asset}
        </div>
        <span className={STATUS_CLASS[item.status] || 'badge badge-info'}>{item.status}</span>
        <div style={{ fontSize:10, color:'var(--text-3)', marginTop:4 }}>{formatDate(item.date)}</div>
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
