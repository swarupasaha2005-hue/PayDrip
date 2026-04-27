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
    
    // Heuristic 1: Drip Engine Liquidity Crisis
    if (activeFlows.length > 0 && totalDripRemaining > internalWalletBalance) {
      newSuggestions.push({
        id: 'low_internal_balance',
        level: 'warning',
        message: 'Your internal engine balance cannot sustain your active Smart Plans to completion. Consider topping up to prevent workflow failure.',
        actionLabel: 'Top Up Engine',
        actionRoute: '/dashboard' // Could open funding modal
      });
    }

    // Heuristic 2: Capital Inactivity
    const externalBalance = parseFloat(balance || 0);
    if (externalBalance > 100 && internalWalletBalance === 0 && activeFlows.length === 0) {
      newSuggestions.push({
        id: 'fund_engine',
        level: 'info',
        message: 'You have idle capital sitting externally. Transfer XLM into the Drip Engine to begin executing automated flows.',
        actionLabel: 'Allocate Funds',
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
