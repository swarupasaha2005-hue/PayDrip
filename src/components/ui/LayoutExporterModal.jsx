import React from 'react';
import { X, Copy, Check, Download } from 'lucide-react';

export default function LayoutExporterModal({ isOpen, onClose, layout }) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const jsonString = JSON.stringify(layout, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(5, 5, 10, 0.8)', backdropFilter: 'blur(12px)',
        padding: '24px'
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div 
        className="fade-up" 
        style={{
          background: 'var(--surface)', borderRadius: '32px', width: '100%', maxWidth: '600px',
          overflow: 'hidden', border: '1px solid var(--border)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '80vh'
        }}
      >
        <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Export Layout</h3>
            <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '4px 0 0' }}>Copy the coordinates below to save your configuration.</p>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'var(--surface-2)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text)' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          <div style={{ 
            background: 'var(--bg)', 
            padding: '20px', 
            borderRadius: '16px', 
            border: '1px solid var(--border)',
            position: 'relative'
          }}>
            <pre style={{ 
              margin: 0, 
              fontSize: 13, 
              fontFamily: 'Share Tech Mono, monospace', 
              color: 'var(--text-2)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all'
            }}>
              {jsonString}
            </pre>
            <button 
              onClick={handleCopy}
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                color: 'var(--text)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              {copied ? <><Check size={14} color="var(--success)" /> Copied</> : <><Copy size={14} /> Copy JSON</>}
            </button>
          </div>
        </div>

        <div style={{ padding: '24px 32px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button 
            className="pd-btn pd-btn-ghost" 
            style={{ borderRadius: '12px' }}
            onClick={onClose}
          >
            Close
          </button>
          <button 
            className="pd-btn pd-btn-primary" 
            style={{ borderRadius: '12px' }}
            onClick={handleCopy}
          >
            <Download size={18} /> Download Data
          </button>
        </div>
      </div>
    </div>
  );
}
