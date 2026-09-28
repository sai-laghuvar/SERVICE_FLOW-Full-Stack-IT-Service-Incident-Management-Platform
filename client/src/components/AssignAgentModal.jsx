import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { userService } from '../services/userService';
import { UserCheck } from 'lucide-react';

const AssignAgentModal = ({ isOpen, onClose, ticket, onAssign }) => {
  const [agents, setAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchAgents();
      setSelectedAgentId(ticket?.assignedTo?._id || '');
      setError('');
    }
  }, [isOpen, ticket]);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const data = await userService.getUsers({ role: 'SUPPORT_AGENT' });
      setAgents(data.users || []);
    } catch (err) {
      setError('Failed to load support agents list');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAgentId) {
      setError('Please select an agent to assign');
      return;
    }

    setSubmitting(true);
    try {
      await onAssign(selectedAgentId);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={ticket?.assignedTo ? 'Reassign Support Agent' : 'Assign Support Agent'}
      footer={
        <>
          <button type="button" onClick={onClose} className="btn btn-secondary" disabled={submitting}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="btn btn-primary"
            disabled={submitting || loading || !selectedAgentId}
          >
            <UserCheck size={16} /> {submitting ? 'Assigning...' : 'Confirm Assignment'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Ticket: <span style={{ fontWeight: 600, color: '#1e293b' }}>{ticket?.ticketId}</span> — {ticket?.title}
          </div>
          {ticket?.assignedTo && (
            <div style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '4px' }}>
              Currently assigned to: <strong>{ticket.assignedTo.name}</strong>
            </div>
          )}
        </div>

        {error && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              color: '#b91c1c',
              fontSize: '0.825rem',
              marginBottom: '16px'
            }}
          >
            {error}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Select Support Agent</label>
          {loading ? (
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Loading agents...</div>
          ) : (
            <select
              value={selectedAgentId}
              onChange={(e) => {
                setSelectedAgentId(e.target.value);
                setError('');
              }}
              className="select"
              required
            >
              <option value="">-- Choose an Agent --</option>
              {agents.map((agent) => (
                <option key={agent._id} value={agent._id}>
                  {agent.name} ({agent.department || 'IT Support'})
                </option>
              ))}
            </select>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default AssignAgentModal;
