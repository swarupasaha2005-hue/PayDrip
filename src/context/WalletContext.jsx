import React, { useState, useEffect, useCallback } from 'react';
import { connectWallet, fetchBalance, fetchLockedAmount } from '../utils/stellar';
import { WalletContext } from './ContextObjects';

export function WalletProvider({ children }) {
  const [address, setAddress]         = useState(() => localStorage.getItem('pd_wallet') || null);
  const [provider, setProvider]       = useState(() => localStorage.getItem('pd_wallet_provider') || 'freighter');
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

  // Persist address & provider
  useEffect(() => {
    if (address) {
      localStorage.setItem('pd_wallet', address);
      localStorage.setItem('pd_wallet_provider', provider);
    } else {
      localStorage.removeItem('pd_wallet');
      localStorage.removeItem('pd_wallet_provider');
    }
  }, [address, provider]);

  const connect = useCallback(async (selectedProvider = 'freighter') => {
    setIsConnecting(true);
    setError(null);
    try {
      // Simulate real connection for albedo / walletconnect logic.
      // If selectedProvider is 'freighter', use actual stellar helper, else simulate an address.
      let pubKey;
      if (selectedProvider === 'freighter') {
         pubKey = await connectWallet();
      } else if (selectedProvider === 'albedo') {
         await new Promise(r => setTimeout(r, 1000));
         pubKey = 'G...' + Math.random().toString(36).substring(2, 10).toUpperCase();
      } else if (selectedProvider === 'walletconnect') {
         await new Promise(r => setTimeout(r, 1200));
         pubKey = 'G...' + Math.random().toString(36).substring(2, 10).toUpperCase();
      }
      
      setProvider(selectedProvider);
      setAddress(pubKey);
    } catch (err) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setProvider(null);
    setBalance('0');
    setLockedBalance('0');
  }, []);

  return (
    <WalletContext.Provider value={{ address, provider, balance, lockedBalance, updateBalance, connect, disconnect, isConnecting, error }}>
      {children}
    </WalletContext.Provider>
  );
}

