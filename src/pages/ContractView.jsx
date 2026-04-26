import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { VAULT_CONTRACT_ID, fetchLockedAmount } from '../utils/stellar';
import { Code, ExternalLink, RefreshCw, Database, Terminal, Cpu, ShieldCheck } from 'lucide-react';

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
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 4px', letterSpacing: '-0.5px' }}>Contract Explorer</h1>
        <p style={{ color: 'var(--text-3)', fontSize: 16 }}>Direct conduit to the PayVault Soroban logic node.</p>
      </div>

      <div className="stitch-layout-grid">
        
        {/* Left Side: Contract Identity Card */}
        <div style={{ gridColumn: 'span 5' }}>
          <div className="pd-card-v2" style={{ height: '100%', background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
              <div style={{ width: 64, height: 64, borderRadius: '22px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(var(--primary-rgb), 0.3)' }}>
                <Code size={32} color="white" />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-3)', letterSpacing: 1, textTransform: 'uppercase' }}>Active Protocol</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>PayVault Core Engine</div>
              </div>
            </div>

            <div className="pd-field" style={{ flexDirection: 'column', alignItems: 'stretch', padding: '24px', gap: 16, marginBottom: 32, borderStyle: 'solid' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={16} color="var(--primary)" />
                <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Soroban Contract ID</span>
              </div>
              <div style={{ fontSize: 13, fontFamily: 'monospace', wordBreak: 'break-all', color: 'var(--primary-dark)', fontWeight: 700, lineHeight: 1.6, background: 'var(--bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                {VAULT_CONTRACT_ID}
              </div>
              <a 
                href={`https://stellar.expert/explorer/testnet/contract/${VAULT_CONTRACT_ID}`}
                target="_blank"
                rel="noreferrer"
                className="pd-btn pd-btn-ghost"
                style={{ fontSize: 12, padding: '10px', borderRadius: '14px', width: '100%', gap: 8 }}
              >
                <ExternalLink size={14} /> Explorer Trace
              </a>
            </div>

            <div className="pd-field-container">
              <button 
                onClick={checkContract}
                disabled={checking || !address}
                className="pd-btn pd-btn-primary"
                style={{ width: '100%', padding: '20px', borderRadius: '22px', fontSize: 16 }}
              >
                {checking ? <RefreshCw size={20} className="spinning" /> : <Database size={20} />}
                Query Live Telemetry
              </button>
              {!address && (
                <p style={{ fontSize: 12, color: 'var(--error)', textAlign: 'center', marginTop: 12, fontWeight: 700 }}>
                  AUTHENTICATION REQUIRED: CONNECT WALLET
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: RAW Sensor Stream */}
        <div style={{ gridColumn: 'span 7' }}>
          <div className="pd-card-v2" style={{ background: '#0F172A', height: '100%', borderColor: 'rgba(var(--primary-rgb), 0.2)', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Terminal size={18} color="var(--primary)" />
                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--primary)', letterSpacing: '2px', textTransform: 'uppercase' }}>Raw Sensor Stream</span>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }} />
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }} />
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
              </div>
            </div>
            
            <div style={{ 
              background: 'rgba(0,0,0,0.3)', borderRadius: '16px', padding: '24px', 
              fontFamily: 'monospace', fontSize: 14, color: 'var(--primary)', 
              whiteSpace: 'pre-wrap', lineHeight: 1.8, height: '400px', overflowY: 'auto',
              border: '1px solid rgba(255,255,255,0.03)', boxShadow: 'inset 2px 4px 12px rgba(0,0,0,0.5)'
            }}>
              {rawResult ? JSON.stringify(rawResult, null, 2) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.4 }}>
                  <Cpu size={48} style={{ marginBottom: 16 }} />
                  <div style={{ textAlign: 'center' }}>
                    // Connection idle.<br />
                    // Initiate telemetry handshake to synchronize.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
