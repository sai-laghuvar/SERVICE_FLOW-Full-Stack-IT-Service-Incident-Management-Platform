import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorMessage = ({ message = 'An unexpected error occurred', onRetry = null }) => {
  return (
    <div
      style={{
        padding: '16px 20px',
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: '#991b1b',
        fontSize: '0.875rem',
        margin: '16px 0'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <AlertCircle size={20} color="#dc2626" />
        <span>{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn btn-sm btn-secondary"
          style={{ borderColor: '#fca5a5', color: '#991b1b' }}
        >
          <RefreshCw size={14} /> Retry
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
