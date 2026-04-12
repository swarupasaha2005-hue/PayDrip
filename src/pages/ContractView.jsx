import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { VAULT_CONTRACT_ID, fetchLockedAmount } from '../utils/stellar';
import { Code, ExternalLink, RefreshCw, Database, Terminal } from 'lucide-react';

export default function ContractView() {
  const { address } = useWallet();
  const [checking, setChecking] = useState(false);
  const [rawResult, setRawResult] = useState(null);

  const checkContract = async () => {
    if (!address) return;
    setChecking(true);
    try {
      const amount = await fetchLockedAmount(address);
      setRawResult({
        address: address,
        locked_xlm: amount,
        contract_id: VAULT_CONTRACT_ID,
        network: 'Stellar Testnet',
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      setRawResult({ error: err.message });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="fade-up">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 4 }}>Contract Explorer</h1>
        <p style={{ color: 'var(--text-2)', fontSize: 14 }}>Direct interaction with the PayVault Soroban contract</p>
      </div>

      <div className="grid-2-1" style={{ gap: 24 }}>
        <div className="card" style={{ padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Code size={22} color="white" />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-3)' }}>TARGET CONTRACT</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>PayVault (Stellar Testnet)</div>
            </div>
          </div>

          <div style={{ background: 'var(--bg)', borderRadius: 16, padding: 20, marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', marginBottom: 8, letterSpacing: 1 }}>CONTRACT ID</div>
            <div style={{ fontSize: 12, fontFamily: 'monospace', wordBreak: 'break-all', color: 'var(--primary-dark)', marginBottom: 12, lineHeight: 1.5 }}>
              {VAULT_CONTRACT_ID}
            </div>
            <a 
              href={`https://stellar.expert/explorer/testnet/contract/${VAULT_CONTRACT_ID}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost"
              style={{ padding: '8px 12px', fontSize: 11, gap: 6 }}
            >
              <ExternalLink size={12} /> View on Stellar Expert
            </a>
          </div>

          <button 
            onClick={checkContract}
            disabled={checking || !address}
            className="btn btn-primary"
            style={{ width: '100%', padding: '16px', borderRadius: 99, gap: 10 }}
          >
            {checking ? <RefreshCw size={18} className="spinning" /> : <Database size={18} />}
            Query Contract State
          </button>
          {!address && (
            <p style={{ fontSize: 12, color: 'var(--error-text)', textAlign: 'center', marginTop: 12 }}>
              Please connect your wallet to query your specific vault state.
            </p>
          )}
        </div>

        <div className="card" style={{ background: '#1E1B4B', border: 'none', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 16 }}>
            <Terminal size={16} color="var(--primary)" />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'white', letterSpacing: 1 }}>RAW RESPONSE</span>
          </div>
          
          <div style={{ flex: 1, fontFamily: 'monospace', fontSize: 12, color: '#A7F3D0', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
            {rawResult ? JSON.stringify(rawResult, null, 2) : '// No query executed yet.\n// Click "Query Contract State" to fetch live data from Soroban.'}
          </div>
        </div>
      </div>
    </div>
  );
}
