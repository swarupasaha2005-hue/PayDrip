import React, { useState, useCallback, useEffect } from 'react';
import { AppContext } from './ContextObjects';
import { loadLS, saveLS } from '../utils/storage';

export function AppProvider({ children }) {
  const [transactions, setTransactions] = useState(() => loadLS('pd_transactions', []));
  const [schedules, setSchedules]       = useState(() => loadLS('pd_schedules', []));

  // Sync to localStorage whenever state changes
  useEffect(() => saveLS('pd_transactions', transactions), [transactions]);
  useEffect(() => saveLS('pd_schedules', schedules), [schedules]);

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
      fiatAmount:  s.fiatAmount || '0',
      asset:       s.asset || 'XLM',
      frequency:   s.frequency || 'One-time',
      releaseAt:   s.releaseAt,           // ISO date string
      note:        s.note || '',
      date:        new Date().toISOString(),
      status:      'Locked',              // 'Locked' | 'Due' | 'Paid'
      txHash:      s.hash || '',
    };
    setSchedules(prev => [entry, ...prev]);
  }, []);

  /** Update an existing schedule (e.g., mark as Paid) */
  const updateSchedule = useCallback((id, updates) => {
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  /** Combined activity feed sorted newest first */
  const activityFeed = [...transactions, ...schedules].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <AppContext.Provider value={{ 
      transactions, schedules, activityFeed, 
      addTransaction, addSchedule, updateSchedule 
    }}>
      {children}
    </AppContext.Provider>
  );
}

