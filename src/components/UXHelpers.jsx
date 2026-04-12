import React from 'react';

export const SkeletonBox = ({ width = '100%', height = '20px', borderRadius = '4px' }) => (
  <div 
    className="pulse" 
    style={{ 
      width, 
      height, 
      borderRadius, 
      background: 'rgba(184,168,255,0.1)',
      marginBottom: '8px'
    }} 
  />
);

export const SkeletonCard = () => (
  <div className="card" style={{ padding: '24px' }}>
    <SkeletonBox width="40%" height="12px" />
    <SkeletonBox width="80%" height="32px" />
    <SkeletonBox width="60%" height="14px" />
  </div>
);

export const RetryButton = ({ onRetry, error }) => {
  if (!error) return null;
  
  return (
    <div style={{ marginTop: 8 }}>
      <button 
        onClick={onRetry}
        className="btn btn-ghost"
        style={{ padding: '4px 12px', fontSize: 12, borderColor: 'var(--error-text)', color: 'var(--error-text)' }}
      >
        Retry Failed Transaction
      </button>
    </div>
  );
};
