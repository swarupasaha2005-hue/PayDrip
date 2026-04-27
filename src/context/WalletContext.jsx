import React, { useState, useEffect, useCallback } from 'react';
import { connectWallet, fetchBalance, fetchLockedAmount } from '../utils/stellar';
import { WalletContext } from './ContextObjects';
import { useLoading } from '../hooks/useLoading';

export function WalletProvider({ children }) {
  const { withLoading } = useLoading();
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
      await withLoading(async () => {
        const bal = await fetchBalance(pubKey);
        setBalance(bal);

        // Fetch contract-specific data in background
        const [locked] = await Promise.all([
          fetchLockedAmount(pubKey).catch(e => { console.error('Fetch locked error', e); return '0'; })
        ]);
        setLockedBalance(locked);
      });
    } catch (err) {
      console.error('Fetch balance error', err);
    }
  }, [withLoading]);

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
      await withLoading(async () => {
        if (selectedProvider === 'freighter') {
           pubKey = await connectWallet();
        } else if (selectedProvider === 'albedo') {
           await new Promise(r => setTimeout(r, 1000));
           pubKey = 'G...' + Math.random().toString(36).substring(2, 10).toUpperCase();
        } else if (selectedProvider === 'walletconnect') {
           await new Promise(r => setTimeout(r, 1200));
           pubKey = 'G...' + Math.random().toString(36).substring(2, 10).toUpperCase();
        }
      });
      
      setProvider(selectedProvider);
      setAddress(pubKey);
    } catch (err) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  }, [withLoading]);

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

