import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ text = 'Loading...', size = 24 }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        gap: '12px',
        color: '#64748b'
      }}
    >
      <Loader2
        size={size}
        style={{
          animation: 'spin 1s linear infinite'
        }}
      />
      {text && <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{text}</span>}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
