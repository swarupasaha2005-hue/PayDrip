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
    <div className="fade-up" style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '40px' }}>
      <div style={{ marginBottom: 64 }}>
        <h1 style={{ color: 'white' }}>Contract Explorer</h1>
        <p style={{ color: 'var(--text-3)', fontSize: 20, fontWeight: 500 }}>Direct conduit to the PayVault Soroban logic node.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 40 }}>
        
        {/* Left Side: Contract Identity Card */}
        <div style={{ gridColumn: 'span 5' }}>
          <div className="glass-panel" style={{ height: '100%', padding: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 48 }}>
              <div style={{ width: 64, height: 64, borderRadius: '20px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Code size={32} color="black" />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-3)', letterSpacing: '1px', textTransform: 'uppercase' }}>Protocol Core</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'white' }}>PayVault Engine</div>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '32px', marginBottom: 40, background: 'rgba(255,255,255,0.01)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <ShieldCheck size={18} color="var(--primary)" />
                <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '1px' }}>Soroban ID</span>
              </div>
              <div style={{ fontSize: 13, fontFamily: 'monospace', wordBreak: 'break-all', color: 'var(--primary)', fontWeight: 700, lineHeight: 1.6, background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '16px', border: '1px solid var(--glass-border)', marginBottom: 24 }}>
                {VAULT_CONTRACT_ID}
              </div>
              <a 
                href={`https://stellar.expert/explorer/testnet/contract/${VAULT_CONTRACT_ID}`}
                target="_blank"
                rel="noreferrer"
                className="pd-btn pd-btn-ghost"
                style={{ width: '100%', padding: '14px', borderRadius: '100px', fontSize: 13 }}
              >
                <ExternalLink size={16} /> Trace On Explorer
              </a>
            </div>

            <div>
              <button 
                onClick={checkContract}
                disabled={checking || !address}
                className="pd-btn pd-btn-primary"
                style={{ width: '100%', padding: '20px', borderRadius: '100px', fontSize: 16 }}
              >
                {checking ? <RefreshCw size={20} className="spinning" /> : <Database size={20} />}
                Query Telemetry
              </button>
              {!address && (
                <p style={{ fontSize: 11, color: 'var(--error)', textAlign: 'center', marginTop: 16, fontWeight: 800, letterSpacing: '1px' }}>
                  AUTH REQUIRED: CONNECT WALLET
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: RAW Sensor Stream */}
        <div style={{ gridColumn: 'span 7' }}>
          <div className="glass-panel" style={{ background: 'rgba(0,0,0,0.2)', height: '100%', padding: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Terminal size={20} color="var(--primary)" />
                <span style={{ fontSize: 13, fontWeight: 800, color: 'white', letterSpacing: '2px', textTransform: 'uppercase' }}>Sensor Stream</span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
              </div>
            </div>
            
            <div style={{ 
              background: 'rgba(0,0,0,0.3)', borderRadius: '24px', padding: '32px', 
              fontFamily: 'monospace', fontSize: 14, color: 'var(--primary)', 
              whiteSpace: 'pre-wrap', lineHeight: 1.8, height: '440px', overflowY: 'auto',
              border: '1px solid var(--glass-border)'
            }}>
              {rawResult ? JSON.stringify(rawResult, null, 2) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.15 }}>
                  <Cpu size={56} style={{ marginBottom: 24 }} />
                  <div style={{ textAlign: 'center', fontSize: 16, fontWeight: 500 }}>
                    // System Idle<br />
                    // Waiting for handshake
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
