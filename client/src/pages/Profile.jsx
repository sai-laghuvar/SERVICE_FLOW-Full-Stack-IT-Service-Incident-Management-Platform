import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Shield, Briefcase, Mail, Calendar, Save, LogOut } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';

const Profile = () => {
  const { user, updateProfile, logout } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ name, department });
      addToast('Profile updated successfully', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
          User Profile & Enterprise Settings
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Manage your identity details, department assignment, and security session
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.6rem',
            fontWeight: 700,
            flexShrink: 0
          }}
        >
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>

        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' }}>
            {user?.name}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <span
              className="badge"
              style={{
                backgroundColor:
                  user?.role === 'ADMIN'
                    ? '#fef3c7'
                    : user?.role === 'SUPPORT_AGENT'
                    ? '#e0e7ff'
                    : '#f1f5f9',
                color:
                  user?.role === 'ADMIN'
                    ? '#92400e'
                    : user?.role === 'SUPPORT_AGENT'
                    ? '#3730a3'
                    : '#475569'
              }}
            >
              <Shield size={12} /> {user?.role?.replace('_', ' ')}
            </span>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              {user?.department}
            </span>
          </div>
        </div>

        <button onClick={logout} className="btn btn-secondary btn-sm" title="Log out">
          <LogOut size={15} /> Sign Out
        </button>
      </div>

      {/* Edit Details Card */}
      <div className="card">
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '16px' }}>
          Personal Details
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              disabled={saving}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Corporate Email (Read Only)</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="input"
              style={{ backgroundColor: '#f8fafc', color: '#64748b', cursor: 'not-allowed' }}
            />
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
              Corporate email identities are verified and managed by enterprise directory SSO.
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Department</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="input"
              disabled={saving}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="submit" disabled={saving} className="btn btn-primary">
              <Save size={16} /> {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Account Audit Details */}
      <div className="card" style={{ backgroundColor: '#f8fafc', borderColor: 'var(--border-subtle)' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#475569', marginBottom: '12px' }}>
          System Security & Account Audit
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.825rem', color: '#64748b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={14} />
            <span>Account Created: <strong>{formatDate(user?.createdAt)}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={14} />
            <span>RBAC Security Clearance: <strong>{user?.role}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Briefcase size={14} />
            <span>Assigned Division: <strong>{user?.department || 'Operations'}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
