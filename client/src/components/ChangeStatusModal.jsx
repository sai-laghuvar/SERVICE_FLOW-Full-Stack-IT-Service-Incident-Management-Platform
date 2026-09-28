import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const VALID_TRANSITIONS = {
  Open: ['In Progress'],
  'In Progress': ['On Hold', 'Resolved'],
  'On Hold': ['In Progress'],
  Resolved: ['Closed', 'In Progress'],
  Closed: ['In Progress'] // Admin only
};

const ChangeStatusModal = ({ isOpen, onClose, ticket, onUpdateStatus }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [targetStatus, setTargetStatus] = useState('');
  const [resolutionText, setResolutionText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const currentStatus = ticket?.status || 'Open';
  let allowed = VALID_TRANSITIONS[currentStatus] || [];
  if (currentStatus === 'Closed' && !isAdmin) {
    allowed = [];
  }

  useEffect(() => {
    if (isOpen) {
      setTargetStatus(allowed[0] || '');
      setResolutionText('');
      setError('');
    }
  }, [isOpen, ticket]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!targetStatus) {
      setError('Please select a target status');
      return;
    }

    if (targetStatus === 'Resolved' && !resolutionText.trim()) {
      setError('Resolution explanation is mandatory when marking a ticket as Resolved');
      return;
    }

    setSubmitting(true);
    try {
      await onUpdateStatus(targetStatus, resolutionText.trim());
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Ticket Status"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn btn-secondary" disabled={submitting}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="btn btn-primary"
            disabled={submitting || !targetStatus}
          >
            <RefreshCw size={15} /> {submitting ? 'Updating...' : 'Update Status'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Current Status:{' '}
            <strong style={{ color: '#1e293b' }}>{currentStatus}</strong>
          </div>
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

        {allowed.length === 0 ? (
          <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
            This ticket is in terminal state ({currentStatus}) and cannot transition further.
          </div>
        ) : (
          <>
            <div className="form-group">
              <label className="form-label">Next Status Transition</label>
              <select
                value={targetStatus}
                onChange={(e) => {
                  setTargetStatus(e.target.value);
                  setError('');
                }}
                className="select"
                required
              >
                {allowed.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {targetStatus === 'Resolved' && (
              <div className="form-group">
                <label className="form-label">
                  Resolution Explanation <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe the root cause and steps taken to resolve the incident..."
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  className="textarea"
                  required
                />
                <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  This resolution will be documented in the ticket record and visible to the employee.
                </span>
              </div>
            )}
          </>
        )}
      </form>
    </Modal>
  );
};

export default ChangeStatusModal;
