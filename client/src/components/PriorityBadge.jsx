import React from 'react';
import { AlertTriangle, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react';

const PRIORITY_CONFIG = {
  Critical: {
    className: 'badge-priority-critical',
    icon: AlertTriangle,
    iconColor: '#b91c1c'
  },
  High: {
    className: 'badge-priority-high',
    icon: ArrowUp,
    iconColor: '#c2410c'
  },
  Medium: {
    className: 'badge-priority-medium',
    icon: AlertCircle,
    iconColor: '#1d4ed8'
  },
  Low: {
    className: 'badge-priority-low',
    icon: ArrowDown,
    iconColor: '#475569'
  }
};

const PriorityBadge = ({ priority }) => {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.Medium;
  const Icon = config.icon;

  return (
    <span className={`badge ${config.className}`}>
      <Icon size={12} color={config.iconColor} strokeWidth={2.5} />
      {priority}
    </span>
  );
};

export default PriorityBadge;
