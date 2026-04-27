import React, { useState, useCallback, useEffect } from 'react';
import { AppContext } from './ContextObjects';
import { useLoading } from '../hooks/useLoading';
import { useWallet } from '../hooks/useWallet';
import { useUser } from '../hooks/useUser';
import { loadLS, saveLS } from '../utils/storage';
import { XLM_INR_RATE as DEFAULT_RATE } from '../utils/formatters';

export function AppProvider({ children }) {
  const { withLoading } = useLoading();
  const { address } = useWallet();
  const { name, gender } = useUser();
  const [transactions, setTransactions] = useState(() => loadLS('pd_transactions', []));
  const [schedules, setSchedules]       = useState(() => loadLS('pd_schedules', []));
  const [notifications, setNotifications] = useState(() => loadLS('pd_notifications', []));
  const [inrRate, setInrRate] = useState(DEFAULT_RATE);

  // Payment Protection State
  const [trustedContacts, setTrustedContacts] = useState(() => loadLS('pd_trusted_contacts', []));
  const [approvalThreshold, setApprovalThreshold] = useState(() => loadLS('pd_approval_threshold', 2));
  const [protectionRules, setProtectionRules] = useState(() => loadLS('pd_protection_rules', { amountLimit: 500, fallbackDelayHours: 24 }));
  const [pendingApprovals, setPendingApprovals] = useState(() => loadLS('pd_pending_approvals', []));

  // Black Belt Upgrade: Metrics & Production Monitoring
  const [onboardedUsers, setOnboardedUsers] = useState(() => {
    const cached = loadLS('pd_users', []);
    // Automatically purge any phantom/legacy mock users that got trapped in localStorage
    return cached.filter(u => !(u.name && u.name.match(/^User \d+$/)));
  });
  const [productionLogs, setProductionLogs] = useState(() => loadLS('pd_logs', []));

  // Drip Engine Upgrade: Internal Wallet & Automated Flows
  const [internalWalletBalance, setInternalWalletBalance] = useState(() => loadLS('pd_internal_wallet', 0)); 
  const [dripFlows, setDripFlows] = useState(() => loadLS('pd_drip_flows', []));
  const [dripLogs, setDripLogs] = useState(() => loadLS('pd_drip_logs', []));

  // Sync to localStorage whenever state changes
  useEffect(() => { saveLS('pd_transactions', transactions) }, [transactions]);
  useEffect(() => { saveLS('pd_schedules', schedules) }, [schedules]);
  useEffect(() => { saveLS('pd_notifications', notifications) }, [notifications]);
  
  useEffect(() => { saveLS('pd_trusted_contacts', trustedContacts) }, [trustedContacts]);
  useEffect(() => { saveLS('pd_approval_threshold', approvalThreshold) }, [approvalThreshold]);
  useEffect(() => { saveLS('pd_protection_rules', protectionRules) }, [protectionRules]);
  useEffect(() => { saveLS('pd_pending_approvals', pendingApprovals) }, [pendingApprovals]);
  useEffect(() => { saveLS('pd_users', onboardedUsers) }, [onboardedUsers]);
  useEffect(() => { saveLS('pd_logs', productionLogs) }, [productionLogs]);
  useEffect(() => { saveLS('pd_internal_wallet', internalWalletBalance) }, [internalWalletBalance]);
  useEffect(() => { saveLS('pd_drip_flows', dripFlows) }, [dripFlows]);
  useEffect(() => { saveLS('pd_drip_logs', dripLogs) }, [dripLogs]);

  // Shorten helper
  function shorten(a, len = 6) {
    if (!a) return '';
    return `${a.slice(0, len)}...${a.slice(-4)}`;
  }

  /** Production Monitoring Logger */
  const logEvent = useCallback((type, message) => {
    setProductionLogs(prev => {
      const newLog = {
        id: Date.now().toString() + Math.random(),
        timestamp: new Date().toISOString(),
        type, 
        message
      };
      return [newLog, ...prev].slice(0, 50); // Keep last 50 logs
    });
  }, []);

  // The registry now only populates from real wallet connections
  const registerUser = useCallback((user) => {
    setOnboardedUsers(prev => {
      // Check if user already exists to avoid duplicates
      const exists = prev.find(u => u.address === user.address);
      if (exists) return prev;
      
      const newUser = {
        id: `usr_${Date.now()}`,
        name: user.name,
        address: user.address,
        gender: user.gender,
        joinedAt: new Date().toISOString(),
        activeRecently: true,
      };
      logEvent('SYSTEM', `New user registered: ${shorten(user.address, 8)}`);
      return [newUser, ...prev];
    });
  }, [logEvent]);

  // Auto-register connected wallet
  useEffect(() => {
    if (address) {
      registerUser({
        address,
        name: name,
        gender: gender
      });
    }
  }, [address, name, gender, registerUser]);



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

  /** DRIP ENGINE: Automated Micro-transaction Processor */
  useEffect(() => {
    const dripInterval = setInterval(() => {
      setDripFlows(prevFlows => {
        if (prevFlows.length === 0) return prevFlows;

        let hasUpdates = false;
        const updatedFlows = prevFlows.map(flow => {
          if (flow.status !== 'active') return flow;
          
          const now = Date.now();
          if (now >= flow.nextTick) {
            hasUpdates = true;
            const microAmount = (flow.totalAmount / (flow.timelineWeeks * 7)).toFixed(4); // daily drip simulation
            
            // Log the internal micro-tx
            const newLog = {
              id: `drip_${Date.now()}`,
              flowId: flow.id,
              amount: microAmount,
              timestamp: new Date().toISOString(),
              message: `Drip executed: ${microAmount} XLM release`
            };
            setDripLogs(prev => [newLog, ...prev].slice(0, 50));

            const isLastTick = flow.ticksCompleted + 1 >= (flow.timelineWeeks * 7);
            if (isLastTick) {
              setTimeout(() => {
                addNotification('success', `Drip Flow Completed: ${flow.totalAmount} XLM fully released.`);
                logEvent('SYSTEM', `Flow ${flow.id} reached 100% distribution.`);
              }, 0);
            }

            return {
              ...flow,
              ticksCompleted: flow.ticksCompleted + 1,
              remainingAmount: (flow.remainingAmount - microAmount).toFixed(4),
              nextTick: now + 5000, // Process every 5 seconds for simulation speed
              status: isLastTick ? 'completed' : 'active'
            };
          }
          return flow;
        });

        return hasUpdates ? updatedFlows : prevFlows;
      });
    }, 2000);
    return () => clearInterval(dripInterval);
  }, [addNotification, logEvent]);

  /** Funding Entry Point */
  const addInternalFunds = useCallback(async (amount) => {
    await withLoading(async () => {
      await new Promise(r => setTimeout(r, 1200)); // Simulate processing
      setInternalWalletBalance(prev => prev + parseFloat(amount));
      addNotification('success', `Wallet funded: +${amount} XLM (via UPI Simulation)`);
      logEvent('WALLET', `Internal wallet topped up with ${amount} XLM.`);
    });
  }, [addNotification, logEvent, withLoading]);

  /** Intent Execution (Start Drip) */
  const startDripFlow = useCallback(async (intent, bypassApproval = false) => {
    return await withLoading(async () => {
      await new Promise(r => setTimeout(r, 1500)); // Simulate engine initialization
      
      const total = parseFloat(intent.target);
      if (internalWalletBalance < total) {
        addNotification('error', 'Insufficient internal wallet balance for this intent.');
        return false;
      }

      // DRIP INTERCEPTOR: Smart Rules Fallback
      if (!bypassApproval && protectionRules?.amountLimit && total >= parseFloat(protectionRules.amountLimit)) {
        setPendingApprovals(prev => [...prev, {
          id: Date.now(),
          type: 'smart_plan',
          intent: intent,
          amount: total,
          approvals: 1,
          rejects: 0,
          status: 'Pending Approval',
          approvedBy: [address]
        }]);
        addNotification('info', `[Payment Protection] High-value Smart Plan (${total} XLM) routed to Approval Queue.`);
        logEvent('SYSTEM', `Smart Planner intercept: ${total} XLM plan requires Multi-Approval.`);
        return true; // Successfully queued.
      }

      const newFlow = {
        id: `flow_${Date.now()}`,
        totalAmount: total,
        remainingAmount: total,
        timelineWeeks: parseInt(intent.timeline),
        strategy: intent.risk,
        flexibility: intent.flexibility,
        ticksCompleted: 0,
        status: 'active',
        nextTick: Date.now() + 5000,
        createdAt: new Date().toISOString()
      };

      setInternalWalletBalance(prev => prev - total);
      setDripFlows(prev => [newFlow, ...prev]);
      addNotification('success', `Smart Plan engine initiated: ${total} XLM locked and streaming.`);
      logEvent('SYSTEM', `Plan deployed: ${total} XLM scheduled over ${intent.timeline} weeks.`);
      return true;
    });
  }, [internalWalletBalance, addNotification, logEvent, withLoading, protectionRules, setPendingApprovals, address]);

  /** Combined activity feed sorted newest first */
  const activityFeed = [...transactions, ...schedules].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <AppContext.Provider value={{ 
      transactions, schedules, notifications, activityFeed, inrRate, setInrRate,
      addTransaction, addSchedule, updateSchedule,
      addNotification, markAllRead, clearNotification,
      
      trustedContacts, setTrustedContacts, 
      approvalThreshold, setApprovalThreshold, 
      protectionRules, setProtectionRules,
      pendingApprovals, setPendingApprovals,
      
      onboardedUsers, productionLogs, logEvent,
      internalWalletBalance, dripFlows, dripLogs,
      addInternalFunds, startDripFlow, registerUser
    }}>
      {children}
    </AppContext.Provider>
  );
}

