import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ticketService } from '../services/ticketService';
import { useToast } from '../context/ToastContext';
import { Send, ArrowLeft, Info, AlertTriangle } from 'lucide-react';

const CreateTicket = () => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Software',
    priority: 'Medium',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Please provide a descriptive ticket title');
      return;
    }
    if (!formData.description.trim()) {
      setError('Please describe the problem symptoms in detail');
      return;
    }

    setLoading(true);
    try {
      const ticket = await ticketService.createTicket(formData);
      addToast(`Incident ${ticket.ticketId} created successfully`, 'success');
      navigate(`/tickets/${ticket.ticketId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit support ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link
          to="/tickets"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: '#64748b',
            fontSize: '0.875rem',
            marginBottom: '12px'
          }}
        >
          <ArrowLeft size={16} /> Back to Incidents Queue
        </Link>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
          Log IT Support Incident
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Submit a new hardware, software, or network issue to enterprise IT support
        </p>
      </div>

      <div className="card">
        {error && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              color: '#b91c1c',
              fontSize: '0.85rem',
              marginBottom: '20px'
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="form-group">
            <label className="form-label">
              Incident Summary / Title <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="text"
              name="title"
              required
              maxLength={150}
              placeholder="e.g. Cannot connect to staging PostgreSQL database from office Wi-Fi"
              value={formData.title}
              onChange={handleChange}
              className="input"
              disabled={loading}
            />
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
              Keep it concise and descriptive (max 150 characters).
            </span>
          </div>

          {/* Category & Priority Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">
                Service Category <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="select"
                disabled={loading}
              >
                <option value="Hardware">Hardware (Laptops, Monitors, Printers)</option>
                <option value="Software">Software (IDE, OS, Productivity apps)</option>
                <option value="Network">Network (VPN, Wi-Fi, DNS, Gateways)</option>
                <option value="Access/Login">Access/Login (IAM, SSO, Okta, Credentials)</option>
                <option value="Email">Email (Outlook, Gmail, SPF, Routing)</option>
                <option value="Other">Other Miscellaneous Request</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Initial Priority <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="select"
                disabled={loading}
              >
                <option value="Low">Low — General inquiry or low impact (72h SLA)</option>
                <option value="Medium">Medium — Standard single-user blocker (24h SLA)</option>
                <option value="High">High — Multiple users or core workflow stalled (8h SLA)</option>
                <option value="Critical">Critical — Full outage / enterprise emergency (4h SLA)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">
              Detailed Description & Steps to Reproduce <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <textarea
              name="description"
              required
              rows={6}
              placeholder="Please provide specifics: when did it start, error messages or codes seen, affected systems, and any troubleshooting already attempted..."
              value={formData.description}
              onChange={handleChange}
              className="textarea"
              disabled={loading}
            />
          </div>

          {/* Enterprise SLA Info Card */}
          <div
            style={{
              padding: '14px 18px',
              backgroundColor: '#f8fafc',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              marginBottom: '24px'
            }}
          >
            <Info size={18} color="#3b82f6" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.4 }}>
              <strong>Automated SLA Tracking:</strong> When submitted, an initial SLA target is
              computed based on the ticket's priority. IT support agents will triage and investigate
              accordingly. You will receive live in-app notifications whenever status changes or notes
              are added.
            </div>
          </div>

          {/* Submit Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              onClick={() => navigate('/tickets')}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              <Send size={16} /> {loading ? 'Submitting Incident...' : 'Submit Support Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicket;
