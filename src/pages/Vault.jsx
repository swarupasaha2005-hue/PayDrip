import React, { useState } from 'react';
import { Shield, Plus, Clock, Key, AlertTriangle, Send, RefreshCw, KeyRound, HardDrive } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { useApp } from '../hooks/useApp';

export default function Vault() {
  const { address } = useWallet();
  const { 
    addNotification, 
    vaultSigners: signers, setVaultSigners: setSigners,
    vaultThreshold: threshold, setVaultThreshold: setThreshold,
    vaultPendingTx: pendingTx, setVaultPendingTx: setPendingTx,
    logEvent
  } = useApp();

  const [isSocialRecoveryActive, setIsSocialRecoveryActive] = useState(false);

  const short = (a) => {
    if (!a) return '';
    if (a.includes('...')) return a; // already shortened dummy
    return `${a.slice(0, 6)}...${a.slice(-4)}`;
  };

  const simulateTx = () => {
    const tx = { id: Date.now(), amount: 500, timeLock: 24, approvals: 1 };
    setPendingTx([...pendingTx, tx]);
    addNotification('info', `Transaction to extract 500 XLM initiated. Time-lock: 24h.`);
    logEvent('VAULT', `Signer ${address.substring(0, 8)} initiated extraction of 500 XLM.`);
  };

  const executeSocialRecovery = () => {
    setIsSocialRecoveryActive(true);
    addNotification('warning', 'Social Recovery Protocol Initiated. Guardians notified.');
    logEvent('SECURITY', 'Social Recovery Protocol manually triggered.');
    setTimeout(() => {
      setIsSocialRecoveryActive(false);
      addNotification('success', 'Wallet Access Restored via Guardian Consensus.');
      logEvent('SECURITY', 'Access restored via social recovery consensus.');
    }, 4000);
  };

  const approveTx = (id) => {
    setPendingTx(prev => prev.map(t => {
      if (t.id === id) {
        const newApprovals = t.approvals + 1;
        if (newApprovals >= threshold) {
          addNotification('success', 'Execution Consensus Reached. Funds deploying after time-lock.');
          logEvent('VAULT', `Consensus reached for Tx ${id}. Execution scheduled.`);
        } else {
          logEvent('VAULT', `Signature added to Tx ${id} by ${address.substring(0, 8)}.`);
        }
        return { ...t, approvals: newApprovals };
      }
      return t;
    }));
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
         
         {/* Center Core: Threshold Chart */}
         <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="stitch-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', position: 'relative' }}>
               <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-2)', marginBottom: 24, alignSelf: 'flex-start' }}>Signature Core</h3>
               
               {/* Radial Ring substitute using SVG */}
               <div style={{ position: 'relative', width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                  <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                    <circle cx="50" cy="50" r="45" fill="none" stroke="var(--border)" strokeWidth="6" />
                    <circle 
                      cx="50" cy="50" r="45" fill="none" stroke="var(--primary)" strokeWidth="6" 
                      strokeDasharray="282.7" strokeDashoffset={282.7 - (282.7 * (threshold / Math.max(1, signers.length)))} 
                      strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.8s ease' }} 
                    />
                  </svg>
                  <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                     <Shield size={28} color="var(--text)" style={{ marginBottom: 8 }} />
                     <span style={{ fontSize: 24, fontWeight: 700, lineHeight: 1 }}>{threshold}</span>
                     <span style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>of {signers.length} Req.</span>
                  </div>
                  
                  {isSocialRecoveryActive && (
                    <div style={{ position: 'absolute', inset: -20, background: 'var(--surface)', border: '1px solid var(--error)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', animation: 'pulse 1s infinite' }}>
                       <RefreshCw size={32} color="var(--error)" className="spinning" />
                    </div>
                  )}
               </div>

               <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
                 <button className="btn-icon" style={{ flex: 1 }} onClick={() => setThreshold(Math.max(1, threshold - 1))}>-</button>
                 <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-2)' }}>Threshold</span>
                 <button className="btn-icon" style={{ flex: 1 }} onClick={() => setThreshold(Math.min(signers.length, threshold + 1))}>+</button>
               </div>
            </div>

            {/* Social Recovery Action */}
            <div className="stitch-card" style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <AlertTriangle size={18} color="var(--error)" />
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--error-text)' }}>Emergency Protocol</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 16, lineHeight: 1.5 }}>If wallet access is lost, guardians can collaboratively construct a key rotation intent.</p>
              <button className="btn" onClick={executeSocialRecovery} disabled={isSocialRecoveryActive} style={{ width: '100%', background: 'var(--error)', color: 'white', border: 'none' }}>
                Initiate Recovery
              </button>
            </div>
         </div>

         {/* Right Side: Network Participants and Approvals */}
         <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            <div className="stitch-panel">
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                 <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                   <KeyRound size={16} /> Attached Signers
                 </h3>
                 <button className="btn" onClick={addGuardian} style={{ padding: '8px 16px', fontSize: 12 }}>
                   <Plus size={14} /> Add Guardian
                 </button>
               </div>
               
               <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                 {signers.map(s => (
                   <div key={s.id} className="stitch-card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                       <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.role === 'Primary' ? 'var(--primary)' : 'var(--accent)' }} />
                       <span style={{ fontSize: 14, fontFamily: 'monospace' }}>{short(s.address)}</span>
                     </div>
                     <span className="badge" style={{ background: 'var(--surface-2)', color: 'var(--text-2)' }}>{s.role}</span>
                   </div>
                 ))}
               </div>
            </div>

            <div className="stitch-panel" style={{ flex: 1 }}>
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                 <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                   <HardDrive size={16} /> Pending Queues
                 </h3>
                 <button className="btn-icon" onClick={simulateTx} title="Simulate Tx" style={{ width: 32, height: 32 }}>
                   <Send size={14} />
                 </button>
               </div>

               {pendingTx.length === 0 ? (
                 <div style={{ textAlign: 'center', padding: '40px 0', opacity: 0.5 }}>
                   <Clock size={32} style={{ margin: '0 auto 12px' }} />
                   <p style={{ fontSize: 14 }}>Ledger clear. No pending flows.</p>
                 </div>
               ) : (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                   {pendingTx.map(tx => {
                     const isReady = tx.approvals >= threshold;
                     const progress = (tx.approvals / threshold) * 100;
                     return (
                       <div key={tx.id} className="stitch-card" style={{ position: 'relative', overflow: 'hidden' }}>
                          <div style={{ position: 'absolute', bottom: 0, left: 0, height: 4, background: isReady ? 'var(--success)' : 'var(--primary)', width: Math.min(100, progress) + '%', transition: 'width 0.5s' }} />
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <div style={{ fontSize: 15, fontWeight: 600 }}>Extract {tx.amount} XLM</div>
                            <div className="badge" style={{ background: 'rgba(255,255,255,0.05)' }}>T-Lock: {tx.timeLock}h</div>
                          </div>
                          
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: 13, color: 'var(--text-3)' }}>
                               {tx.approvals}/{threshold} Approvals
                            </div>
                            {!isReady && (
                              <button className="btn btn-ghost" onClick={() => approveTx(tx.id)} style={{ padding: '6px 12px', fontSize: 12, borderColor: 'var(--success)', color: 'var(--success)' }}>
                                Approve
                              </button>
                            )}
                            {isReady && <span style={{ color: 'var(--success-text)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Consensus Met</span>}
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
