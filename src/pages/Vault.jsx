import React, { useState } from 'react';
import { Shield, Plus, Clock, Key, AlertTriangle, Send, RefreshCw, KeyRound, HardDrive, Minus, CheckCircle2, TrendingUp } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { useApp } from '../hooks/useApp';
import { useLoading } from '../hooks/useLoading';

export default function Vault() {
  const { address } = useWallet();
  const { 
    addNotification, 
    vaultSigners: signers, setVaultSigners: setSigners,
    vaultThreshold: threshold, setVaultThreshold: setThreshold,
    vaultPendingTx: pendingTx, setVaultPendingTx: setPendingTx,
    logEvent
  } = useApp();
  const { withLoading } = useLoading();

  const [isSocialRecoveryActive, setIsSocialRecoveryActive] = useState(false);

  const short = (a) => {
    if (!a) return '';
    if (a.includes('...')) return a; 
    return `${a.slice(0, 6)}...${a.slice(-4)}`;
  };

  const simulateTx = async () => {
    await withLoading(async () => {
      await new Promise(r => setTimeout(r, 1000));
      const tx = { id: Date.now(), amount: 500, timeLock: 24, approvals: 1 };
      setPendingTx([...pendingTx, tx]);
      addNotification('info', `Transaction to extract 500 XLM initiated. Time-lock: 24h.`);
      logEvent('VAULT', `Signer ${address?.substring(0, 8)} initiated extraction of 500 XLM.`);
    });
  };

  const executeSocialRecovery = async () => {
    await withLoading(async () => {
      setIsSocialRecoveryActive(true);
      addNotification('warning', 'Social Recovery Protocol Initiated. Guardians notified.');
      logEvent('SECURITY', 'Social Recovery Protocol manually triggered.');
      await new Promise(r => setTimeout(r, 2500));
      setIsSocialRecoveryActive(false);
      addNotification('success', 'Wallet Access Restored via Guardian Consensus.');
      logEvent('SECURITY', 'Access restored via social recovery consensus.');
    });
  };

  const approveTx = async (id) => {
    await withLoading(async () => {
      await new Promise(r => setTimeout(r, 800));
      setPendingTx(prev => prev.map(t => {
        if (t.id === id) {
          const newApprovals = t.approvals + 1;
          if (newApprovals >= threshold) {
            addNotification('success', 'Execution Consensus Reached. Funds deploying after time-lock.');
            logEvent('VAULT', `Consensus reached for Tx ${id}. Execution scheduled.`);
          } else {
            logEvent('VAULT', `Signature added to Tx ${id} by ${address?.substring(0, 8)}.`);
          }
          return { ...t, approvals: newApprovals };
        }
        return t;
      }));
    });
  };

  const addGuardian = () => {
    const newAddr = window.prompt("Enter Guardian Public Key (G...):");
    if (newAddr && newAddr.length > 20) {
      const newGuardian = { id: Date.now().toString(), address: newAddr, role: 'Guardian' };
      setSigners([...signers, newGuardian]);
      addNotification('success', 'Guardian added to Multi-Sig coordination.');
      logEvent('VAULT', `New Guardian added: ${newAddr.substring(0, 8)}...`);
    } else if (newAddr) {
      addNotification('error', 'Invalid Stellar address format.');
    }
  };

  return (
    <div className="spatial-spread fade-up">
       <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 4px', letterSpacing: '-0.5px' }}>Security Vault</h1>
        <p style={{ color: 'var(--text-3)', fontSize: 16 }}>Programmable multi-sig core with social recovery mechanics.</p>
       </div>

       <div className="stitch-layout-grid">
         
         {/* Left Column: Signature Core & Recovery */}
         <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: 32 }}>
            <div className="pd-card-v2" style={{ textAlign: 'center' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
                 <KeyRound size={20} color="var(--primary)" />
                 <h3 style={{ fontSize: 16, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Signature Core</h3>
               </div>
               
               <div style={{ position: 'relative', width: 220, height: 220, margin: '0 auto 32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)', filter: 'drop-shadow(0 0 8px rgba(var(--primary-rgb), 0.2))' }}>
                    <circle cx="50" cy="50" r="44" fill="none" stroke="var(--surface-2)" strokeWidth="8" />
                    <circle 
                      cx="50" cy="50" r="44" fill="none" stroke="var(--primary)" strokeWidth="8" 
                      strokeDasharray="276.5" strokeDashoffset={276.5 - (276.5 * (threshold / Math.max(1, signers.length)))} 
                      strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' }} 
                    />
                  </svg>
                  <div style={{ position: 'absolute', textAlign: 'center' }}>
                     <Shield size={32} color="var(--primary)" style={{ marginBottom: 8 }} />
                     <div style={{ fontSize: 42, fontWeight: 800, lineHeight: 1, color: 'var(--text)' }}>{threshold}</div>
                     <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', marginTop: 4 }}>of {signers.length} Req.</div>
                  </div>
                  
                  {isSocialRecoveryActive && (
                    <div style={{ position: 'absolute', inset: -10, background: 'rgba(239, 68, 68, 0.1)', border: '2px dashed var(--error)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'spin 4s linear infinite' }}>
                       <RefreshCw size={32} color="var(--error)" />
                    </div>
                  )}
               </div>

               <div className="pd-field" style={{ padding: '8px', borderRadius: '15px', background: 'var(--surface-2)' }}>
                 <button className="pd-btn pd-btn-ghost" style={{ flex: 1, borderRadius: '12px', padding: '10px' }} onClick={() => setThreshold(Math.max(1, threshold - 1))}>
                   <Minus size={16} />
                 </button>
                 <div style={{ flex: 2, fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>CONSTRUCT THRESHOLD</div>
                 <button className="pd-btn pd-btn-ghost" style={{ flex: 1, borderRadius: '12px', padding: '10px' }} onClick={() => setThreshold(Math.min(signers.length, threshold + 1))}>
                   <Plus size={16} />
                 </button>
               </div>
            </div>

            <div className="pd-card-v2" style={{ background: 'var(--bg)', borderStyle: 'solid', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <AlertTriangle size={20} color="var(--error)" />
                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--error)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Emergency Protocol</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 24, lineHeight: 1.6 }}>If physical access is compromised, initiate social recovery via guardian consensus.</p>
              <button 
                className="pd-btn" 
                onClick={executeSocialRecovery} 
                disabled={isSocialRecoveryActive} 
                style={{ 
                  width: '100%', 
                  background: isSocialRecoveryActive ? 'var(--surface-2)' : 'rgba(239, 68, 68, 0.1)', 
                  color: 'var(--error)', 
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  fontSize: 12,
                  fontWeight: 800
                }}
              >
                {isSocialRecoveryActive ? 'RECOVERY IN PROGRESS...' : 'INITIATE SOCIAL RECOVERY'}
              </button>
            </div>
         </div>

         {/* Right Side: Network Participants and Approvals */}
         <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: 32 }}>
            
            <div className="pd-card-v2">
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                   <Key size={20} color="var(--text-3)" />
                   <h3 style={{ fontSize: 18, fontWeight: 700 }}>Network Participants</h3>
                 </div>
                 <button className="pd-btn pd-btn-primary" onClick={addGuardian} style={{ padding: '8px 18px', fontSize: 12, borderRadius: '12px' }}>
                   <Plus size={14} /> Add Guardian
                 </button>
               </div>
               
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                 {signers.map(s => (
                   <div key={s.id} className="pd-field" style={{ justifyContent: 'space-between', padding: '16px 20px' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                       <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.role === 'Primary' ? 'var(--primary)' : 'var(--accent)', boxShadow: `0 0 10px ${s.role === 'Primary' ? 'var(--primary)' : 'var(--accent)'}` }} />
                       <span style={{ fontSize: 14, fontFamily: 'monospace', fontWeight: 600 }}>{short(s.address)}</span>
                     </div>
                     <span className="badge" style={{ borderRadius: '10px', fontSize: 10, padding: '4px 10px' }}>{s.role}</span>
                   </div>
                 ))}
               </div>
            </div>

            <div className="pd-card-v2" style={{ flex: 1 }}>
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                   <HardDrive size={20} color="var(--text-3)" />
                   <h3 style={{ fontSize: 18, fontWeight: 700 }}>Pending Execution Queue</h3>
                 </div>
                 <button className="pd-btn pd-btn-ghost" onClick={simulateTx} title="Inject Simulated Intent" style={{ padding: '8px', width: 36, height: 36, borderRadius: '10px' }}>
                   <Send size={16} />
                 </button>
               </div>

               {pendingTx.length === 0 ? (
                 <div style={{ textAlign: 'center', padding: '60px 0', background: 'var(--surface-2)', borderRadius: '24px', border: '2px dashed var(--border)' }}>
                   <div style={{ background: 'var(--surface)', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                     <Clock size={32} color="var(--text-3)" />
                   </div>
                   <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-3)' }}>Ledger Synchronized. No pending authorizations.</p>
                 </div>
               ) : (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                   {pendingTx.map(tx => {
                     const isReady = tx.approvals >= threshold;
                     const progress = (tx.approvals / threshold) * 100;
                     return (
                       <div key={tx.id} className="pd-field" style={{ 
                         flexDirection: 'column', alignItems: 'stretch', padding: '24px', 
                         gap: 20, position: 'relative', overflow: 'hidden' 
                       }}>
                          <div style={{ position: 'absolute', bottom: 0, left: 0, height: 4, background: isReady ? 'var(--success)' : 'var(--primary)', width: Math.min(100, progress) + '%', transition: 'width 0.8s ease' }} />
                          
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{ padding: '10px', borderRadius: '12px', background: 'var(--bg)' }}>
                                <TrendingUp size={20} color="var(--primary)" />
                              </div>
                              <div>
                                <div style={{ fontSize: 16, fontWeight: 700 }}>Extract {tx.amount} XLM</div>
                                <div style={{ fontSize: 12, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <Clock size={12} /> Time-lock active: {tx.timeLock}h
                                </div>
                              </div>
                            </div>
                            <div className="badge" style={{ background: 'var(--bg)', color: 'var(--primary)' }}>TX #{tx.id.toString().slice(-4)}</div>
                          </div>
                          
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg)', padding: '12px 20px', borderRadius: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{ fontSize: 15, fontWeight: 800 }}>{tx.approvals} / {threshold}</div>
                              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase' }}>Consensus Progress</div>
                            </div>
                            
                            {!isReady ? (
                              <button className="pd-btn pd-btn-primary" onClick={() => approveTx(tx.id)} style={{ padding: '8px 20px', borderRadius: '10px', fontSize: 12 }}>
                                SIGN TRANSACTION
                              </button>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--success-text)', fontSize: 13, fontWeight: 800 }}>
                                <CheckCircle2 size={16} /> AUTHORIZED
                              </div>
                            )}
                          </div>
                       </div>
                     );
                   })}
                 </div>
               )}
            </div>

         </div>
       </div>
    </div>
  );
}
