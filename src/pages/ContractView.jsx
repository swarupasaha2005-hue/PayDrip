import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
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
    <div className="spatial-spread fade-up">
      <div style={{ position: 'relative', zIndex: 10, paddingLeft: 12, marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1px', marginBottom: 8 }}>Contract Explorer</h1>
        <p style={{ color: 'var(--text-2)', fontSize: 16 }}>Direct conduit to the PayVault Soroban logic node</p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40 }}>
        
        {/* Left Blob Interface */}
        <div className="module module-blob" style={{ flex: '1 1 350px', background: 'var(--surface)', color: 'var(--text)', padding: '48px', alignItems: 'flex-start', textAlign: 'left', borderRadius: '40% 60% 50% 50% / 50% 50% 60% 40%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--card-grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
              <Code size={24} color="white" />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-3)', letterSpacing: 1 }}>ACTIVE NODE</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>PayVault Engine</div>
            </div>
          </div>

          <div style={{ background: 'var(--surface-2)', borderRadius: '32px', padding: '24px 32px', marginBottom: 32, width: '100%', boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-3)', marginBottom: 12, letterSpacing: 1 }}>CONTRACT HASH</div>
            <div style={{ fontSize: 13, fontFamily: 'monospace', wordBreak: 'break-all', color: 'var(--primary-dark)', marginBottom: 20, lineHeight: 1.6 }}>
              {VAULT_CONTRACT_ID}
            </div>
            <a 
              href={`https://stellar.expert/explorer/testnet/contract/${VAULT_CONTRACT_ID}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost"
              style={{ padding: '12px 20px', fontSize: 13, gap: 8, width: '100%', borderRadius: '999px' }}
            >
              <ExternalLink size={16} /> Inspect on Stellar Expert
            </a>
          </div>

          <button 
            onClick={checkContract}
            disabled={checking || !address}
            className="btn btn-primary"
            style={{ width: '100%', padding: '20px', borderRadius: '999px', gap: 12, fontSize: 15 }}
          >
            {checking ? <RefreshCw size={20} className="spinning" /> : <Database size={20} />}
            Query Live Telemetry
          </button>
          {!address && (
            <p style={{ fontSize: 13, color: 'var(--error-text)', textAlign: 'center', marginTop: 16, fontWeight: 600 }}>
              Connect wallet to authenticate telemetry.
            </p>
          )}
        </div>

        {/* Right Dark Organic Terminal */}
        <div className="module" style={{ flex: '2 1 500px', background: '#0F172A', border: '1px solid rgba(167,243,208,0.2)', borderRadius: 'var(--shape-organic)', display: 'flex', flexDirection: 'column', minHeight: 500, padding: 48, boxShadow: '0 24px 64px rgba(0,0,0,0.4), inset 0 0 40px rgba(167,243,208,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 24, borderBottom: '1px solid rgba(167,243,208,0.1)', marginBottom: 24 }}>
            <Terminal size={20} color="#A7F3D0" />
            <span style={{ fontSize: 13, fontWeight: 800, color: '#A7F3D0', letterSpacing: 2 }}>RAW SENSOR STREAM</span>
          </div>
          
          <div style={{ flex: 1, fontFamily: 'monospace', fontSize: 14, color: '#6EE7B7', whiteSpace: 'pre-wrap', lineHeight: 1.8, opacity: 0.9 }}>
            {rawResult ? JSON.stringify(rawResult, null, 2) : '// No connection established.\n// Initiate "Query Live Telemetry" to ping Soroban network.'}
          </div>
        </div>
      </div>
    </div>
  );
}
