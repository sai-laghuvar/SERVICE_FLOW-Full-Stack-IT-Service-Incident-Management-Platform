import React, { useState, useEffect, useCallback } from 'react';
import { userService } from '../services/userService';
import { useToast } from '../context/ToastContext';
import { Users, Search, Edit3, Shield, CheckCircle, XCircle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Modal from '../components/Modal';
import { formatDate } from '../utils/dateUtils';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Edit user modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [editFormData, setEditFormData] = useState({ role: '', isActive: true, department: '' });
  const [isUpdating, setIsUpdating] = useState(false);

  const { addToast } = useToast();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await userService.getUsers({ search, role: roleFilter });
      setUsers(data.users || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve users');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setEditFormData({
      role: user.role,
      isActive: user.isActive,
      department: user.department || ''
    });
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const updated = await userService.updateUser(selectedUser._id, editFormData);
      setUsers((prev) => prev.map((u) => (u._id === updated._id ? updated : u)));
      addToast(`User ${updated.name} updated successfully`, 'success');
      setSelectedUser(null);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update user', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
          User Directory & Role Governance
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Manage corporate employees, IT support agents, and platform administrator privileges
        </p>
      </div>

      {/* Search and Filters */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          flexWrap: 'wrap',
          backgroundColor: '#ffffff',
          padding: '16px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)'
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
          />
          <input
            type="text"
            placeholder="Search by user name or email address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
            style={{ paddingLeft: '36px' }}
          />
        </div>

        <div style={{ width: '180px' }}>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="select"
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Administrator</option>
            <option value="SUPPORT_AGENT">Support Agent</option>
            <option value="EMPLOYEE">Employee</option>
          </select>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchUsers} />}

      {loading ? (
        <LoadingSpinner text="Retrieving user records..." size={32} />
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Registered</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor:
                            u.role === 'ADMIN'
                              ? '#d97706'
                              : u.role === 'SUPPORT_AGENT'
                              ? '#2563eb'
                              : '#64748b',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 600,
                          fontSize: '0.85rem'
                        }}
                      >
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{u.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        backgroundColor:
                          u.role === 'ADMIN'
                            ? '#fef3c7'
                            : u.role === 'SUPPORT_AGENT'
                            ? '#e0e7ff'
                            : '#f1f5f9',
                        color:
                          u.role === 'ADMIN'
                            ? '#92400e'
                            : u.role === 'SUPPORT_AGENT'
                            ? '#3730a3'
                            : '#475569'
                      }}
                    >
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: '#475569' }}>
                    {u.department || 'General'}
                  </td>
                  <td>
                    {u.isActive ? (
                      <span className="badge" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
                        <CheckCircle size={12} /> Active
                      </span>
                    ) : (
                      <span className="badge" style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}>
                        <XCircle size={12} /> Inactive
                      </span>
                    )}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {formatDate(u.createdAt)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => handleOpenEdit(u)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '4px 8px' }}
                      title="Edit role and permissions"
                    >
                      <Edit3 size={14} /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit User Modal */}
      {selectedUser && (
        <Modal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          title={`Edit User: ${selectedUser.name}`}
          footer={
            <>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="btn btn-secondary"
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveUser}
                className="btn btn-primary"
                disabled={isUpdating}
              >
                {isUpdating ? 'Saving...' : 'Save Permissions'}
              </button>
            </>
          }
        >
          <form onSubmit={handleSaveUser}>
            <div className="form-group">
              <label className="form-label">System Role</label>
              <select
                value={editFormData.role}
                onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                className="select"
              >
                <option value="EMPLOYEE">Employee (Standard Support Requester)</option>
                <option value="SUPPORT_AGENT">Support Agent (Triage & Resolution Specialist)</option>
                <option value="ADMIN">Administrator (Full System Privilege)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Department</label>
              <input
                type="text"
                value={editFormData.department}
                onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                className="input"
              />
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px' }}>
              <input
                type="checkbox"
                id="isActive"
                checked={editFormData.isActive}
                onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="isActive" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                Account Active & Allowed to Sign In
              </label>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default UsersManagement;
