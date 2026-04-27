import { useState, useEffect } from 'react';
import { useApp } from './useApp';
import { useWallet } from './useWallet';

export function usePredictiveEngine() {
  const { internalWalletBalance, dripFlows, pendingApprovals } = useApp();
  const { balance } = useWallet();
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    let newSuggestions = [];

    // Analyze Active Drip Trajectories
    const activeFlows = dripFlows.filter(f => f.status === 'active');
    const totalDripRemaining = activeFlows.reduce((acc, f) => acc + parseFloat(f.remainingAmount), 0);
    
    // Heuristic 1: Automated Balance Shortfall
    if (activeFlows.length > 0 && totalDripRemaining > internalWalletBalance) {
      newSuggestions.push({
        id: 'low_internal_balance',
        level: 'warning',
        message: 'Your automated balance is too low to cover your upcoming scheduled payments. Top up to ensure your plans continue running smoothly.',
        actionLabel: 'Top Up Balance',
        actionType: 'allocate_funds',
        actionRoute: '/dashboard'
      });
    }

    // Heuristic 2: Capital Inactivity (Connected but not Allocated)
    const externalBalance = parseFloat(balance || 0);
    if (externalBalance > 100 && internalWalletBalance === 0 && activeFlows.length === 0) {
      newSuggestions.push({
        id: 'fund_engine',
        level: 'info',
        message: "Your wallet is connected, but these funds aren't yet set aside for automated payments. Start your first automated flow by moving them to your internal balance.",
        actionLabel: 'Setup Automated Funds',
        actionType: 'allocate_funds',
        actionRoute: '/dashboard'
      });
    }

    // Heuristic 3: Approval Bottlenecks (Critical blocking action)
    if (pendingApprovals && pendingApprovals.length > 0) {
      newSuggestions.push({
        id: 'pending_approvals',
        level: 'critical',
        message: `Security Hold: You have ${pendingApprovals.length} transaction(s) stalled in Payment Protection awaiting guardian signatures.`,
        actionLabel: 'Review Approvals',
        actionRoute: '/vault'
      });
    }

    // Determine stability threshold - use a 1-second debounce to prevent micro-tx flickering
    const throttleTimer = setTimeout(() => {
      // Prioritize the highest severity (critical > warning > info)
      const sorted = newSuggestions.sort((a, b) => {
        const ranks = { critical: 3, warning: 2, info: 1 };
        return ranks[b.level] - ranks[a.level];
      });
      setSuggestions(sorted);
    }, 1500);

    return () => clearTimeout(throttleTimer);
  }, [balance, internalWalletBalance, dripFlows, pendingApprovals]);

  return { suggestions };
}
