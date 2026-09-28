import React from 'react';

const STATUS_CONFIG = {
  Open: {
    className: 'badge-status-open',
    dotColor: '#2563eb'
  },
  'In Progress': {
    className: 'badge-status-in-progress',
    dotColor: '#d97706'
  },
  'On Hold': {
    className: 'badge-status-on-hold',
    dotColor: '#9333ea'
  },
  Resolved: {
    className: 'badge-status-resolved',
    dotColor: '#16a34a'
  },
  Closed: {
    className: 'badge-status-closed',
    dotColor: '#64748b'
  }
};

const TicketStatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.Open;

  return (
    <span className={`badge ${config.className}`}>
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: config.dotColor
        }}
      />
      {status}
    </span>
  );
};

export default TicketStatusBadge;
