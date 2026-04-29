import React, { useEffect } from 'react';
import { Shield, Plus, Clock, Key, AlertTriangle, Send, RefreshCw, KeyRound, HardDrive, Minus, CheckCircle2, TrendingUp, X, Settings2, ShieldCheck, XCircle } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { useApp } from '../hooks/useApp';
import { useLoading } from '../hooks/useLoading';

export default function Vault() {
  const { address } = useWallet();
  const { 
    addNotification, 
    trustedContacts, setTrustedContacts,
    approvalThreshold, setApprovalThreshold,
    protectionRules, setProtectionRules,
    pendingApprovals, setPendingApprovals,
    logEvent, startDripFlow
  } = useApp();
  const { withLoading } = useLoading();

  // Primary owner logic: If there are no contacts, connected user acts as primary. 
  // Otherwise, the first contact in the array is considered the Primary Owner.
  const isPrimary = trustedContacts.length === 0 || trustedContacts[0].address === address;
  const isTrustedContact = trustedContacts.some(c => c.address === address);

  // Auto-set the primary owner if empty and wallet connects
  useEffect(() => {
    if (trustedContacts.length === 0 && address) {
      setTrustedContacts([{ id: Date.now().toString(), address, role: 'Primary' }]);
    }
  }, [address, trustedContacts.length, setTrustedContacts]);

  const short = (a) => {
    if (!a) return '';
    if (a.includes('...')) return a; 
    return `${a.slice(0, 6)}...${a.slice(-4)}`;
  };

  const simulateTx = async () => {
    await withLoading(async () => {
      await new Promise(r => setTimeout(r, 1000));
      // Random amount for simulation
      const amt = Math.floor(Math.random() * 800) + 200;
      
      const requiresMultiApproval = amt >= (protectionRules.amountLimit || 500);
      
      const tx = { 
        id: Date.now(), 
        amount: amt, 
        approvals: 1, 
        rejects: 0,
        status: requiresMultiApproval ? 'Pending Approval' : 'Approved',
        approvedBy: [address]
      };
      
      setPendingApprovals([...pendingApprovals, tx]);
      
      if (requiresMultiApproval) {
        addNotification('info', `High-value payment of ${amt} XLM initiated. Placed in Pending Approval queue.`);
        logEvent('SYSTEM', `Secure Funds: Payment of ${amt} XLM requires multi-approval.`);
      } else {
        addNotification('success', `Payment of ${amt} XLM auto-approved (Under threshold limit).`);
        logEvent('SYSTEM', `Secure Funds: Payment of ${amt} XLM executed immediately.`);
      }
    });
  };

  const approveTx = async (id) => {
    await withLoading(async () => {
      await new Promise(r => setTimeout(r, 800));
      setPendingApprovals(prev => prev.map(t => {
        if (t.id === id && t.status === 'Pending Approval' && !t.approvedBy.includes(address)) {
          const newApprovals = t.approvals + 1;
          const status = newApprovals >= approvalThreshold ? 'Approved' : 'Pending Approval';
          
          if (status === 'Approved') {
            addNotification('success', 'Multi-Approval limit reached. Payment Executed.');
            logEvent('SYSTEM', `Secure Funds: Payment ${id} Approved and Executed.`);
            if (t.type === 'smart_plan' && t.intent) {
              setTimeout(() => startDripFlow(t.intent, true), 100);
            }
          }
          
          return { ...t, approvals: newApprovals, status, approvedBy: [...t.approvedBy, address] };
        }
        return t;
      }));
    });
  };

  const rejectTx = async (id) => {
    await withLoading(async () => {
      await new Promise(r => setTimeout(r, 800));
      setPendingApprovals(prev => prev.map(t => {
        if (t.id === id && t.status === 'Pending Approval') {
          addNotification('error', 'Payment Rejected by Trusted Contact.');
          logEvent('SYSTEM', `Secure Funds: Payment ${id} Rejected.`);
          return { ...t, status: 'Rejected', rejects: t.rejects + 1 };
        }
        return t;
      }));
    });
  };

  const addContact = () => {
    if (!isPrimary) return addNotification('error', 'Only the primary user can manage access.');
    const newAddr = window.prompt("Enter Contact Public Key (G...):");
    if (newAddr && newAddr.length > 20) {
      const newContact = { id: Date.now().toString(), address: newAddr, role: 'Contact' };
      setTrustedContacts([...trustedContacts, newContact]);
      addNotification('success', 'Trusted Contact added successfully.');
      logEvent('SYSTEM', `Secure Funds: New Trusted Contact added: ${newAddr.substring(0, 8)}...`);
    } else if (newAddr) {
      addNotification('error', 'Invalid Stellar address format.');
    }
  };

  const removeContact = (idToRemove) => {
    if (!isPrimary) return addNotification('error', 'Only the primary user can manage access.');
    const newContacts = trustedContacts.filter(c => c.id !== idToRemove);
    setTrustedContacts(newContacts);
    
    // Smooth auto-adjustment of threshold
    if (approvalThreshold > newContacts.length) {
      setApprovalThreshold(Math.max(1, newContacts.length));
    }
    
    addNotification('info', 'Trusted Contact removed.');
    logEvent('SYSTEM', `Secure Funds: A Trusted Contact was removed.`);
  };

  return (
    <div className="fade-up" style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '40px' }}>
       <div style={{ marginBottom: 64 }}>
        <h1 style={{ color: 'white' }}>Payment Protection</h1>
        <p style={{ color: 'var(--text-3)', fontSize: 20, fontWeight: 500 }}>Secure your funds with multi-approval rules and trusted backups.</p>
       </div>

       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 40 }}>
         
         {/* Left Column: Smart Rules & Threshold */}
         <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: 40 }}>
            <div className="glass-panel" style={{ textAlign: 'center', padding: '48px 32px' }}>
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 40 }}>
                 <ShieldCheck size={20} color="var(--primary)" />
                 <h3 style={{ fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px' }}>Multi-Approval Factor</h3>
               </div>
               
               <div style={{ position: 'relative', width: 220, height: 220, margin: '0 auto 40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)', filter: 'drop-shadow(0 0 20px rgba(var(--primary-rgb), 0.3))' }}>
                    <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="6" />
                    <circle 
                      cx="50" cy="50" r="44" fill="none" stroke="var(--primary)" strokeWidth="6" 
                      strokeDasharray="276.5" strokeDashoffset={276.5 - (276.5 * (approvalThreshold / Math.max(1, trustedContacts.length)))} 
                      strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' }} 
                    />
                  </svg>
                  <div style={{ position: 'absolute', textAlign: 'center' }}>
                     <Shield size={32} color="var(--primary)" style={{ marginBottom: 12, opacity: 0.8 }} />
                     <div style={{ fontSize: 48, fontWeight: 800, lineHeight: 1, color: 'white' }}>{approvalThreshold}</div>
                     <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', marginTop: 6, letterSpacing: '1px' }}>of {trustedContacts.length} Req.</div>
                  </div>
               </div>

               <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: '100px', border: '1px solid var(--glass-border)', padding: '6px' }}>
                 <button disabled={!isPrimary} className="pd-btn pd-btn-ghost" style={{ width: 44, height: 44, padding: 0, borderRadius: '50%' }} onClick={() => setApprovalThreshold(Math.max(1, approvalThreshold - 1))}>
                   <Minus size={16} />
                 </button>
                 <div style={{ flex: 1, fontSize: 11, fontWeight: 800, color: 'white', letterSpacing: '1px' }}>THRESHOLD</div>
                 <button disabled={!isPrimary} className="pd-btn pd-btn-ghost" style={{ width: 44, height: 44, padding: 0, borderRadius: '50%' }} onClick={() => setApprovalThreshold(Math.min(trustedContacts.length, approvalThreshold + 1))}>
                   <Plus size={16} />
                 </button>
               </div>
            </div>

            <div className="dark-form" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <Settings2 size={18} color="var(--primary)" />
                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '1px' }}>Smart Payment Rules</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label className="pd-field-label" style={{ marginBottom: 8, display: 'block' }}>Require Multi-Approval Above</label>
                  <div className="dark-field">
                    <input 
                      type="number" 
                      className="dark-input" 
                      value={protectionRules.amountLimit} 
                      onChange={(e) => setProtectionRules({...protectionRules, amountLimit: e.target.value})}
                      disabled={!isPrimary}
                    />
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>XLM</span>
                  </div>
                </div>
                <div>
                  <label className="pd-field-label" style={{ marginBottom: 8, display: 'block' }}>Auto-Execute Delay (No Response)</label>
                  <div className="dark-field">
                    <input 
                      type="number" 
                      className="dark-input" 
                      value={protectionRules.fallbackDelayHours} 
                      onChange={(e) => setProtectionRules({...protectionRules, fallbackDelayHours: e.target.value})}
                      disabled={!isPrimary}
                    />
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)' }}>Hours</span>
                  </div>
                </div>
              </div>
            </div>
         </div>

         {/* Right Side: Trusted Contacts and Pending Approvals */}
         <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: 40 }}>
            
            {/* Trusted Contacts Manager */}
            <div className="glass-panel" style={{ padding: '40px' }}>
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                   <Key size={20} color="var(--text-3)" />
                   <h3 style={{ fontSize: 20, fontWeight: 700 }}>Trusted Access</h3>
                 </div>
                 {isPrimary && (
                   <button className="pd-btn pd-btn-primary" onClick={addContact} style={{ padding: '10px 24px', fontSize: 13 }}>
                     <Plus size={16} /> Add Contact
                   </button>
                 )}
               </div>
               
               <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                 {trustedContacts.map((contact) => (
                   <div key={contact.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                       <div style={{ width: 10, height: 10, borderRadius: '50%', background: contact.role === 'Primary' ? 'var(--primary)' : 'var(--accent)', boxShadow: `0 0 12px ${contact.role === 'Primary' ? 'var(--primary)' : 'var(--accent)'}` }} />
                       <span style={{ fontSize: 14, fontFamily: 'monospace', fontWeight: 600, color: 'white' }}>{short(contact.address)}</span>
                       {contact.address === address && <span style={{ fontSize: 9, fontWeight: 800, background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px' }}>YOU</span>}
                     </div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                       <span style={{ borderRadius: '100px', fontSize: 10, padding: '4px 12px', background: 'rgba(255,255,255,0.03)', color: 'var(--text-3)', fontWeight: 700 }}>
                         {contact.role === 'Primary' ? 'OWNER' : 'BACKUP'}
                       </span>
                       {isPrimary && contact.role !== 'Primary' && (
                         <button onClick={() => removeContact(contact.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', opacity: 0.6 }} title="Remove Contact">
                           <X size={18} color="var(--error)" />
                         </button>
                       )}
                     </div>
                   </div>
                 ))}
               </div>
            </div>

            {/* Approvals Queue */}
            <div className="glass-panel" style={{ flex: 1, padding: '40px' }}>
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                   <HardDrive size={20} color="var(--text-3)" />
                   <h3 style={{ fontSize: 20, fontWeight: 700 }}>Approval Queue</h3>
                 </div>
                 <button className="pd-btn pd-btn-ghost" onClick={simulateTx} title="Simulate Mock Payment" style={{ width: 44, height: 44, padding: 0, borderRadius: '50%' }}>
                   <Send size={18} />
                 </button>
               </div>

               {pendingApprovals.length === 0 ? (
                 <div style={{ textAlign: 'center', padding: '80px 0', background: 'rgba(255,255,255,0.01)', borderRadius: '24px', border: '1px dashed var(--glass-border)' }}>
                   <div style={{ background: 'rgba(255,255,255,0.03)', width: 80, height: 80, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '1px solid var(--glass-border)' }}>
                     <Clock size={32} color="var(--text-3)" />
                   </div>
                   <p style={{ fontSize: 18, fontWeight: 500, color: 'var(--text-3)' }}>No Pending Payments.</p>
                 </div>
               ) : (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                   {pendingApprovals.map(tx => {
                     const isPending = tx.status === 'Pending Approval';
                     const progress = (tx.approvals / approvalThreshold) * 100;
                     const hasApproved = tx.approvedBy.includes(address);
                     
                     let statusColor = 'var(--primary)';
                     if (tx.status === 'Approved') statusColor = 'var(--success)';
                     if (tx.status === 'Rejected') statusColor = 'var(--error)';

                     return (
                       <div key={tx.id} className="pd-field" style={{ 
                         flexDirection: 'column', alignItems: 'stretch', padding: '24px', 
                         gap: 20, position: 'relative', overflow: 'hidden' 
                       }}>
                          <div style={{ position: 'absolute', bottom: 0, left: 0, height: 4, background: statusColor, width: Math.min(100, progress) + '%', transition: 'width 0.8s ease' }} />
                          
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{ padding: '10px', borderRadius: '12px', background: 'var(--bg)' }}>
                                <TrendingUp size={20} color={statusColor} />
                              </div>
                              <div>
                                <div style={{ fontSize: 16, fontWeight: 700 }}>
                                   {tx.type === 'smart_plan' ? `Deploy Smart Plan (${tx.amount} XLM)` : `Transfer ${tx.amount} XLM`}
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <Clock size={12} /> Status: {tx.status}
                                </div>
                              </div>
                            </div>
                            <div className="badge" style={{ background: 'var(--bg)', color: statusColor }}>TX #{tx.id.toString().slice(-4)}</div>
                          </div>
                          
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg)', padding: '12px 20px', borderRadius: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{ fontSize: 15, fontWeight: 800 }}>{tx.approvals} / {tx.status === 'Approved' ? tx.approvals : approvalThreshold}</div>
                              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase' }}>Secure Approvals</div>
                            </div>
                            
                            {isPending && isTrustedContact && !hasApproved ? (
                              <div style={{ display: 'flex', gap: 8 }}>
                                <button className="pd-btn" onClick={() => rejectTx(tx.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '8px 16px', borderRadius: '10px', fontSize: 12 }}>
                                  REJECT
                                </button>
                                <button className="pd-btn pd-btn-primary" onClick={() => approveTx(tx.id)} style={{ padding: '8px 16px', borderRadius: '10px', fontSize: 12 }}>
                                  APPROVE
                                </button>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: statusColor, fontSize: 13, fontWeight: 800, textTransform: 'uppercase' }}>
                                {tx.hash && tx.status !== 'Paid via UPI' && (
                                  <a 
                                    href={`https://testnet.stellarchain.io/transactions/${tx.hash}`} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="pd-btn pd-btn-ghost" 
                                    style={{ width: 44, height: 44, padding: 0, borderRadius: '50%' }}
                                  >
                                    <ExternalLink size={18} />
                                  </a>
                                )}
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
