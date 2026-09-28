import React from 'react';
import {
  PlusCircle,
  UserCheck,
  RefreshCw,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Clock,
  Archive
} from 'lucide-react';
import { formatDate } from '../utils/dateUtils';

const getActionDetails = (log) => {
  switch (log.action) {
    case 'TICKET_CREATED':
      return {
        icon: PlusCircle,
        color: '#2563eb',
        title: 'Ticket Created',
        description: `Created ticket by ${log.performedBy?.name || 'System'}`
      };
    case 'TICKET_ASSIGNED':
      return {
        icon: UserCheck,
        color: '#7c3aed',
        title: 'Ticket Assigned',
        description: `Assigned to ${log.metadata?.agentName || log.newValue || 'Support Agent'} by ${log.performedBy?.name || 'Admin'}`
      };
    case 'TICKET_REASSIGNED':
      return {
        icon: UserCheck,
        color: '#7c3aed',
        title: 'Ticket Reassigned',
        description: `Reassigned to ${log.metadata?.agentName || log.newValue} by ${log.performedBy?.name || 'Admin'}`
      };
    case 'STATUS_CHANGED':
      return {
        icon: RefreshCw,
        color: '#d97706',
        title: 'Status Updated',
        description: `Status changed from ${log.oldValue} → ${log.newValue} by ${log.performedBy?.name}`
      };
    case 'PRIORITY_CHANGED':
      return {
        icon: AlertCircle,
        color: '#ea580c',
        title: 'Priority Changed',
        description: `Priority updated from ${log.oldValue} → ${log.newValue} by ${log.performedBy?.name}`
      };
    case 'COMMENT_ADDED':
      return {
        icon: MessageSquare,
        color: '#0891b2',
        title: 'Comment Added',
        description: `${log.performedBy?.name} commented: "${log.metadata?.commentSnippet || ''}"`
      };
    case 'TICKET_RESOLVED':
      return {
        icon: CheckCircle2,
        color: '#16a34a',
        title: 'Ticket Resolved',
        description: `Resolved by ${log.performedBy?.name}. Resolution: "${log.metadata?.resolution || ''}"`
      };
    case 'TICKET_CLOSED':
      return {
        icon: Archive,
        color: '#475569',
        title: 'Ticket Closed',
        description: `Ticket closed by ${log.performedBy?.name}`
      };
    case 'TICKET_REOPENED':
      return {
        icon: RefreshCw,
        color: '#dc2626',
        title: 'Ticket Reopened',
        description: `Ticket reopened by ${log.performedBy?.name}`
      };
    default:
      return {
        icon: Clock,
        color: '#64748b',
        title: log.action.replace(/_/g, ' '),
        description: `Action performed by ${log.performedBy?.name || 'User'}`
      };
  }
};

const ActivityTimeline = ({ history = [] }) => {
  if (!history || history.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
        No activity history recorded yet.
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', paddingLeft: '28px', margin: '16px 0' }}>
      {/* Continuous timeline line */}
      <div
        style={{
          position: 'absolute',
          left: '11px',
          top: '12px',
          bottom: '12px',
          width: '2px',
          backgroundColor: '#e2e8f0'
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {history.map((log) => {
          const details = getActionDetails(log);
          const Icon = details.icon;

          return (
            <div key={log._id} style={{ position: 'relative', display: 'flex', gap: '14px' }}>
              {/* Timeline marker node */}
              <div
                style={{
                  position: 'absolute',
                  left: '-28px',
                  top: '0px',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  border: `2px solid ${details.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2
                }}
              >
                <Icon size={12} color={details.color} />
              </div>

              {/* Log Content Card */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>
                    {details.title}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {formatDate(log.createdAt)}
                  </span>
                </div>
                <p style={{ fontSize: '0.825rem', color: '#475569', marginTop: '4px', lineHeight: 1.4 }}>
                  {details.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityTimeline;
