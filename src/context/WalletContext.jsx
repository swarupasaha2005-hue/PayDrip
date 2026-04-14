import React, { useState, useEffect, useCallback } from 'react';
import { connectWallet, fetchBalance, fetchLockedAmount } from '../utils/stellar';
import { WalletContext } from './ContextObjects';

export function WalletProvider({ children }) {
  const [address, setAddress]         = useState(() => localStorage.getItem('pd_wallet') || null);
  const [balance, setBalance]         = useState('0');
  const [lockedBalance, setLockedBalance] = useState('0');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError]             = useState(null);

  const updateBalance = useCallback(async (pubKey) => {
    if (!pubKey) return;
    
    // Fetch primary XLM balance
    try {
      const bal = await fetchBalance(pubKey);
      setBalance(bal);
    } catch (err) {
      console.error('Fetch base balance error', err);
    }

    // Fetch contract-specific data in background
    Promise.all([
      fetchLockedAmount(pubKey).catch(e => { console.error('Fetch locked error', e); return '0'; })
    ]).then(([locked]) => {
      setLockedBalance(locked);
    });
  }, []);

  // Hydrate balance when address loads
  useEffect(() => {
    if (address) updateBalance(address);
  }, [address, updateBalance]);

  // Persist address
  useEffect(() => {
    if (address) localStorage.setItem('pd_wallet', address);
    else localStorage.removeItem('pd_wallet');
  }, [address]);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const pubKey = await connectWallet();
      setAddress(pubKey);
    } catch (err) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setBalance('0');
    setLockedBalance('0');
  }, []);

  return (
    <WalletContext.Provider value={{ address, balance, lockedBalance, updateBalance, connect, disconnect, isConnecting, error }}>
      {children}
    </WalletContext.Provider>
  );
}

