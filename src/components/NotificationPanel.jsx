import React, { useState, useRef, useEffect, useContext } from 'react';
import { Bell, CheckCircle2, Clock, Zap, X } from 'lucide-react';
import { AppContext } from '../context/ContextObjects';
import { formatDate } from '../utils/formatters';

const ICONS = {
  success: <CheckCircle2 size={16} style={{ color: 'var(--success-text)' }} />,
  time: <Clock size={16} style={{ color: 'var(--info-text)' }} />,
  insight: <Zap size={16} style={{ color: 'var(--warning-text)' }} />,
};

const BGS = {
  success: 'var(--success)',
  time: 'var(--info)',
  insight: 'var(--warning)',
};

export default function NotificationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);
  
  // Safe extraction just in case AppProvider isn't mocking it correctly in some states
  const context = useContext(AppContext) || {};
  const notifications = context.notifications || [];
  const markAllRead = context.markAllRead || (() => {});
  const clearNotification = context.clearNotification || (() => {});

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      markAllRead();
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={panelRef}>
      <button 
        onClick={handleToggle}
        className="btn-icon" 
        style={{ position: 'relative', border: 'none' }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <div style={{
            position: 'absolute', top: '0', right: '0',
            background: 'var(--error-text)', color: 'white',
            fontSize: '10px', fontWeight: 'bold',
            width: '18px', height: '18px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--surface)'
          }}>
            {unreadCount}
          </div>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute', top: '100%', right: '0', marginTop: '8px',
          width: '320px', maxHeight: '400px', overflowY: 'auto',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)',
          zIndex: 100, display: 'flex', flexDirection: 'column'
        }} className="fade-up">
          <div style={{ 
            padding: '16px', borderBottom: '1px solid var(--border)', 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'var(--surface-2)', borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)'
          }}>
            <h3 style={{ fontSize: '15px', color: 'var(--text)', margin: 0 }}>Notifications</h3>
          </div>
          
          <div style={{ padding: '8px', flex: 1 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-3)', fontSize: '13px' }}>
                You're all caught up!
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} style={{
                  display: 'flex', gap: '12px', padding: '12px', borderRadius: 'var(--radius-md)',
                  background: n.read ? 'transparent' : 'var(--bg)',
                  transition: 'background 0.2s', position: 'relative'
                }}>
                  <div style={{ flexShrink: 0, width: '32px', height: '32px', borderRadius: '50%', background: BGS[n.type] || BGS.time, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {ICONS[n.type] || ICONS.time}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 500, lineHeight: 1.4 }}>{n.message}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '4px' }}>{formatDate(n.date)}</div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); clearNotification(n.id); }}
                    style={{ position: 'absolute', top: '8px', right: '8px', background: 'transparent', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: '4px' }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
