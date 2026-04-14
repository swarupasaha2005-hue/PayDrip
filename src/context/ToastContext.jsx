import React, { useState, useCallback } from 'react';
import { CheckCircle2, XCircle, Info } from 'lucide-react';
import { ToastContext } from './ContextObjects';

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), duration);
  }, [removeToast]);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error:   (msg) => addToast(msg, 'error'),
    info:    (msg) => addToast(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`toast toast-${t.type}`}
            style={{ borderLeftColor: COLORS[t.type], cursor: 'pointer' }}
            onClick={() => removeToast(t.id)}
          >
            <div style={{ flexShrink: 0, marginTop: 1 }}>{ICONS[t.type]}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1E1B4B', marginBottom: 2 }}>
                {t.type === 'success' ? 'Success' : t.type === 'error' ? 'Error' : 'Info'}
              </div>
              <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>{t.message}</div>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

const ICONS = {
  success: <CheckCircle2 size={18} color="#10B981" />,
  error:   <XCircle size={18} color="#EF4444" />,
  info:    <Info size={18} color="#6366F1" />,
};

const COLORS = {
  success: '#10B981',
  error:   '#EF4444',
  info:    '#6366F1',
};

