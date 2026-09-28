import React from 'react';

const DashboardCard = ({ title, value, subtitle, icon: Icon, color = '#3b82f6', badge = null }) => {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </span>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: `${color}18`, // 10% opacity tint
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color
          }}
        >
          {Icon && <Icon size={20} />}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <span style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.1 }}>
          {value !== undefined && value !== null ? value : '—'}
        </span>
        {badge && <span>{badge}</span>}
      </div>

      {subtitle && (
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {subtitle}
        </span>
      )}
    </div>
  );
};

export default DashboardCard;
