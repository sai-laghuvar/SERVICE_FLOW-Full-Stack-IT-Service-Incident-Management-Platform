import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px',
        textAlign: 'center'
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#eff6ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#2563eb',
          marginBottom: '20px'
        }}
      >
        <HelpCircle size={32} />
      </div>
      <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
        404 — Resource Not Found
      </h2>
      <p style={{ fontSize: '0.95rem', color: '#64748b', maxWidth: '420px', marginBottom: '24px' }}>
        The page or incident record you are attempting to access does not exist or has been archived.
      </p>
      <Link to="/dashboard" className="btn btn-primary">
        <ArrowLeft size={16} /> Return to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
