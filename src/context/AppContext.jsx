import React, { useState, useCallback, useEffect } from 'react';
import { AppContext } from './ContextObjects';
import { loadLS, saveLS } from '../utils/storage';
import { XLM_INR_RATE as DEFAULT_RATE } from '../utils/formatters';

export function AppProvider({ children }) {
  const [transactions, setTransactions] = useState(() => loadLS('pd_transactions', []));
  const [schedules, setSchedules]       = useState(() => loadLS('pd_schedules', []));
  const [notifications, setNotifications] = useState(() => loadLS('pd_notifications', []));
  const [inrRate, setInrRate] = useState(DEFAULT_RATE);

  // Sync to localStorage whenever state changes
  useEffect(() => { saveLS('pd_transactions', transactions) }, [transactions]);
  useEffect(() => { saveLS('pd_schedules', schedules) }, [schedules]);
  useEffect(() => { saveLS('pd_notifications', notifications) }, [notifications]);

  /** Notification Helpers */
  const addNotification = useCallback((type, message) => {
    setNotifications(prev => [{
      id: Date.now().toString() + Math.random(),
      type, // 'success' | 'time' | 'insight'
      message,
      date: new Date().toISOString(),
      read: false
    }, ...prev]);
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  /** Add a completed/sent transaction */
  const addTransaction = useCallback((tx) => {
    const entry = {
      id:     Date.now().toString(),
      type:   tx.type || 'sent',      // 'sent' | 'received'
      amount: tx.amount,
      asset:  tx.asset || 'XLM',
      to:     tx.to || '',
      from:   tx.from || '',
      hash:   tx.hash || '',
      date:   new Date().toISOString(),
      status: 'Completed',
    };
    setTransactions(prev => [entry, ...prev]);
  }, []);

  /** Add a scheduled subscription/payment intent */
  const addSchedule = useCallback((s) => {
    const entry = {
      id:          Date.now().toString(),
      type:        'scheduled',
      service:     s.service || 'Custom',
      amount:      s.amount,
      fiatAmount:  s.fiatAmount || '0',  // Kept for backward compatibility if needed, but we focus on inrAmount
      inrAmount:   s.inrAmount || '0', 
      asset:       s.asset || 'XLM',
      frequency:   s.frequency || 'One-time',
      releaseAt:   s.releaseAt,           // ISO date string
      note:        s.note || '',
      date:        new Date().toISOString(),
      status:      'Locked',              // 'Locked' | 'Due' | 'Paid'
      txHash:      s.hash || '',
    };
    setSchedules(prev => [entry, ...prev]);
    addNotification('success', `Funds secured for ${entry.service} (₹${entry.inrAmount})`);
  }, [addNotification]);

  /** Update an existing schedule (e.g., mark as Paid) */
  const updateSchedule = useCallback((id, updates) => {
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  /** Auto-pay simulation loop */
  useEffect(() => {
    const interval = setInterval(() => {
      setSchedules(prev => {
        let changed = false;
        const now = new Date();
        const updated = prev.map(s => {
          if ((s.status === 'Locked' || s.status === 'Due') && new Date(s.releaseAt) <= now) {
            changed = true;
            // Schedule notification to be added outside of render loop
            setTimeout(() => addNotification('time', `Autopay successful for ${s.service} (₹${s.inrAmount})`), 0);
            return { ...s, status: 'Paid' };
          }
          return s;
        });
        return changed ? updated : prev;
      });
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [addNotification]);

  /** Combined activity feed sorted newest first */
  const activityFeed = [...transactions, ...schedules].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <AppContext.Provider value={{ 
      transactions, schedules, notifications, activityFeed, inrRate, setInrRate,
      addTransaction, addSchedule, updateSchedule,
      addNotification, markAllRead, clearNotification
    }}>
      {children}
    </AppContext.Provider>
  );
}

