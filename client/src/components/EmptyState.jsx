import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No items found',
  description = 'There are no records matching your query or filter criteria.',
  action = null
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px dashed #cbd5e1',
        margin: '16px 0'
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: '#f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#64748b',
          marginBottom: '16px'
        }}
      >
        <Icon size={24} />
      </div>
      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.875rem', color: '#64748b', maxWidth: '380px', marginBottom: action ? '20px' : 0 }}>
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
