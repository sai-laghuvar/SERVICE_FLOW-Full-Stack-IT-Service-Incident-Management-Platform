import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  UserCheck,
  RefreshCw,
  Trash2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Layers,
  User as UserIcon,
  Tag
} from 'lucide-react';
import { ticketService } from '../services/ticketService';
import { commentService } from '../services/commentService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import TicketStatusBadge from '../components/TicketStatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import ActivityTimeline from '../components/ActivityTimeline';
import CommentSection from '../components/CommentSection';
import AssignAgentModal from '../components/AssignAgentModal';
import ChangeStatusModal from '../components/ChangeStatusModal';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatDate, getSLARemaining } from '../utils/dateUtils';

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [ticket, setTicket] = useState(null);
  const [history, setHistory] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const role = user?.role;
  const isAdmin = role === 'ADMIN';
  const isAgent = role === 'SUPPORT_AGENT';

  const loadTicketData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [ticketData, historyData, commentsData] = await Promise.all([
        ticketService.getTicketById(id),
        ticketService.getTicketHistory(id),
        commentService.getTicketComments(id)
      ]);

      setTicket(ticketData);
      setHistory(historyData || []);
      setComments(commentsData || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load ticket details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadTicketData();
  }, [loadTicketData]);

  // Handle status update
  const handleStatusUpdate = async (newStatus, resolutionText) => {
    const updated = await ticketService.updateStatus(ticket._id, newStatus, resolutionText);
    setTicket(updated);
    addToast(`Status updated to ${newStatus}`, 'success');
    // Refresh history
    const freshHistory = await ticketService.getTicketHistory(ticket._id);
    setHistory(freshHistory || []);
  };

  // Handle agent assignment
  const handleAssignAgent = async (agentId) => {
    const updated = await ticketService.assignTicket(ticket._id, agentId);
    setTicket(updated);
    addToast('Ticket assigned successfully', 'success');
    // Refresh history
    const freshHistory = await ticketService.getTicketHistory(ticket._id);
    setHistory(freshHistory || []);
  };

  // Handle priority update
  const handlePriorityChange = async (e) => {
    const newPriority = e.target.value;
    try {
      const updated = await ticketService.updatePriority(ticket._id, newPriority);
      setTicket(updated);
      addToast(`Priority changed to ${newPriority}`, 'success');
      const freshHistory = await ticketService.getTicketHistory(ticket._id);
      setHistory(freshHistory || []);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to change priority', 'error');
    }
  };

  // Handle ticket deletion
  const handleDeleteTicket = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete ticket ${ticket.ticketId}?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await ticketService.deleteTicket(ticket._id);
      addToast(`Ticket ${ticket.ticketId} deleted`, 'success');
      navigate('/tickets');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete ticket', 'error');
      setIsDeleting(false);
    }
  };

  // Handle comment added
  const handleCommentAdded = async (commentText) => {
    const newComment = await commentService.addComment(ticket._id, commentText);
    setComments((prev) => [...prev, newComment]);
    // Refresh history because comment creates an audit log
    const freshHistory = await ticketService.getTicketHistory(ticket._id);
    setHistory(freshHistory || []);
  };

  if (loading) {
    return <LoadingSpinner text="Loading incident details & timeline..." size={36} />;
  }

  if (error || !ticket) {
    return (
      <div>
        <Link to="/tickets" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
          <ArrowLeft size={16} /> Back to Incidents Queue
        </Link>
        <ErrorMessage message={error || 'Ticket not found'} onRetry={loadTicketData} />
      </div>
    );
  }

  const sla = getSLARemaining(ticket.slaDeadline, ticket.status);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Breadcrumb & Actions Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <Link
          to="/tickets"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: '#64748b',
            fontSize: '0.875rem'
          }}
        >
          <ArrowLeft size={16} /> Back to Incidents Queue
        </Link>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {(isAdmin || isAgent) && (
            <button
              onClick={() => setIsStatusModalOpen(true)}
              className="btn btn-secondary btn-sm"
              title="Update status"
            >
              <RefreshCw size={14} /> Update Status
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => setIsAssignModalOpen(true)}
              className="btn btn-secondary btn-sm"
              title="Assign or reassign agent"
            >
              <UserCheck size={14} /> {ticket.assignedTo ? 'Reassign Agent' : 'Assign Agent'}
            </button>
          )}

          {isAdmin && (
            <button
              onClick={handleDeleteTicket}
              disabled={isDeleting}
              className="btn btn-danger btn-sm"
              title="Delete incident permanently"
            >
              <Trash2 size={14} /> Delete
            </button>
          )}
        </div>
      </div>

      {/* Main Ticket Header Card */}
      <div className="card" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className="ticket-code" style={{ fontSize: '1.1rem' }}>
                {ticket.ticketId}
              </span>
              <TicketStatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  backgroundColor: '#f1f5f9',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontWeight: 500
                }}
              >
                {ticket.category}
              </span>
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.3 }}>
              {ticket.title}
            </h2>
          </div>

          {/* SLA Deadline Badge */}
          <div
            style={{
              padding: '10px 16px',
              backgroundColor: sla.isBreached ? '#fef2f2' : '#f8fafc',
              border: `1px solid ${sla.isBreached ? '#fca5a5' : 'var(--border-light)'}`,
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <Clock size={18} color={sla.isBreached ? '#dc2626' : '#64748b'} />
            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                Service SLA Target
              </span>
              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: sla.isBreached ? '#dc2626' : '#1e293b'
                }}
              >
                {sla.label}
              </span>
            </div>
          </div>
        </div>

        {/* Reporter & Assignee Metadata Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginTop: '20px',
            paddingTop: '18px',
            borderTop: '1px solid var(--border-light)'
          }}
        >
          {/* Created by */}
          <div>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
              Reported By
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}
              >
                {ticket.createdBy?.name ? ticket.createdBy.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>
                  {ticket.createdBy?.name || 'Unknown'}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  {ticket.createdBy?.department || 'Employee'}
                </div>
              </div>
            </div>
          </div>

          {/* Assigned to */}
          <div>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
              Assigned Specialist
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              {ticket.assignedTo ? (
                <>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}
                  >
                    {ticket.assignedTo.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>
                      {ticket.assignedTo.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      {ticket.assignedTo.department || 'Support Agent'}
                    </div>
                  </div>
                </>
              ) : (
                <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic', marginTop: '4px' }}>
                  Unassigned — Waiting triage
                </span>
              )}
            </div>
          </div>

          {/* Date Created */}
          <div>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
              Date Logged
            </span>
            <div style={{ fontSize: '0.85rem', color: '#1e293b', fontWeight: 500, marginTop: '4px' }}>
              {formatDate(ticket.createdAt)}
            </div>
          </div>

          {/* Priority Adjustment for Admin/Agent */}
          {(isAdmin || isAgent) && (
            <div>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                Manage Priority
              </span>
              <div style={{ marginTop: '4px' }}>
                <select
                  value={ticket.priority}
                  onChange={handlePriorityChange}
                  className="select"
                  style={{ padding: '4px 8px', fontSize: '0.825rem', height: '32px' }}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2-Column Layout: Left (Description, Resolution, Audit Timeline) | Right (Comments) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: '24px' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Incident Description */}
          <div className="card">
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>
              Incident Symptoms & Description
            </h3>
            <div
              style={{
                fontSize: '0.9rem',
                color: '#334155',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                backgroundColor: '#f8fafc',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              {ticket.description}
            </div>
          </div>

          {/* Resolution Details Card if resolved or closed */}
          {ticket.resolution?.text && (
            <div
              className="card"
              style={{
                backgroundColor: '#f0fdf4',
                borderColor: '#bbf7d0'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <CheckCircle2 size={18} color="#16a34a" />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#166534' }}>
                  Resolution Summary & Root Cause
                </h3>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#14532d', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                {ticket.resolution.text}
              </p>
              <div style={{ fontSize: '0.75rem', color: '#15803d', marginTop: '12px' }}>
                Resolved by <strong>{ticket.resolution.resolvedBy?.name || 'Support Agent'}</strong> on{' '}
                {formatDate(ticket.resolution.resolvedAt)}
              </div>
            </div>
          )}

          {/* Activity / Audit Timeline */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>
                Audit Trail & Status History
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                {history.length} Event{history.length === 1 ? '' : 's'}
              </span>
            </div>
            <ActivityTimeline history={history} />
          </div>
        </div>

        {/* Right Column: Communication Comments */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>
                Conversation & Support Notes
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                {comments.length} Message{comments.length === 1 ? '' : 's'}
              </span>
            </div>

            <CommentSection
              ticketId={ticket._id}
              comments={comments}
              onCommentAdded={handleCommentAdded}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <AssignAgentModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        ticket={ticket}
        onAssign={handleAssignAgent}
      />

      <ChangeStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        ticket={ticket}
        onUpdateStatus={handleStatusUpdate}
      />
    </div>
  );
};

export default TicketDetails;
