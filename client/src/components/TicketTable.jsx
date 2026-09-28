import React from 'react';
import { Link } from 'react-router-dom';
import TicketStatusBadge from './TicketStatusBadge';
import PriorityBadge from './PriorityBadge';
import { formatDate, getSLARemaining } from '../utils/dateUtils';
import { ArrowUpRight, User as UserIcon } from 'lucide-react';

const TicketTable = ({ tickets = [] }) => {
  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Ticket ID</th>
            <th>Title & Category</th>
            <th>Status</th>
            <th>Priority</th>
            <th>SLA Status</th>
            <th>Created By</th>
            <th>Assigned Agent</th>
            <th>Created</th>
            <th style={{ textAlign: 'right' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => {
            const sla = getSLARemaining(ticket.slaDeadline, ticket.status);
            return (
              <tr key={ticket._id}>
                <td>
                  <Link to={`/tickets/${ticket.ticketId}`} className="ticket-code">
                    {ticket.ticketId}
                  </Link>
                </td>
                <td style={{ maxWidth: '280px' }}>
                  <Link
                    to={`/tickets/${ticket.ticketId}`}
                    style={{
                      fontWeight: 600,
                      color: 'var(--text-main)',
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {ticket.title}
                  </Link>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--text-muted)',
                      backgroundColor: '#f1f5f9',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      display: 'inline-block',
                      marginTop: '3px'
                    }}
                  >
                    {ticket.category}
                  </span>
                </td>
                <td>
                  <TicketStatusBadge status={ticket.status} />
                </td>
                <td>
                  <PriorityBadge priority={ticket.priority} />
                </td>
                <td>
                  {sla.isBreached ? (
                    <span className="badge-sla-breached">{sla.label}</span>
                  ) : (
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{sla.label}</span>
                  )}
                </td>
                <td>
                  <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                    {ticket.createdBy?.name || 'Unknown'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    {ticket.createdBy?.department || ''}
                  </div>
                </td>
                <td>
                  {ticket.assignedTo ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                      <UserIcon size={14} color="#64748b" />
                      <span>{ticket.assignedTo.name}</span>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>
                      Unassigned
                    </span>
                  )}
                </td>
                <td style={{ fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                  {formatDate(ticket.createdAt)}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <Link
                    to={`/tickets/${ticket.ticketId}`}
                    className="btn btn-sm btn-secondary"
                    style={{ padding: '4px 8px' }}
                    title="View Ticket Details"
                  >
                    <ArrowUpRight size={14} />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TicketTable;
