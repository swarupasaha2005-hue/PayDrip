import React, { useState, useCallback, useEffect } from 'react';
import { AppContext } from './ContextObjects';

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

  /** Add a scheduled payment */
  const addSchedule = useCallback((s) => {
    const entry = {
      id:        Date.now().toString(),
      type:      'scheduled',
      amount:    s.amount,
      asset:     s.asset || 'XLM',
      to:        s.to || '',
      releaseAt: s.releaseAt,           // ISO date string
      note:      s.note || '',
      date:      new Date().toISOString(),
      status:    'Scheduled',
    };
    setSchedules(prev => [entry, ...prev]);
  }, []);

  /** Combined activity feed sorted newest first */
  const activityFeed = [...transactions, ...schedules].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <AppContext.Provider value={{ transactions, schedules, activityFeed, addTransaction, addSchedule }}>
      {children}
    </AppContext.Provider>
  );
}

