import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Layers, UserPlus } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: 'Engineering',
    role: 'EMPLOYEE'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
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

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      addToast('Account created successfully!', 'success');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f172a',
        padding: '24px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            padding: '28px 32px 20px',
            textAlign: 'center',
            borderBottom: '1px solid var(--border-light)'
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              margin: '0 auto 12px',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}
          >
            <Layers size={22} />
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Register Employee Account
          </h2>
          <p style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '4px' }}>
            Create your access credentials for the ServiceFlow IT portal
          </p>
        </div>

        <div style={{ padding: '32px' }}>
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
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={handleChange}
                className="input"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                required
                placeholder="name@serviceflow.local"
                value={formData.email}
                onChange={handleChange}
                className="input"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password (min. 6 characters)</label>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••••••"
                value={formData.password}
                onChange={handleChange}
                className="input"
                disabled={loading}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="select"
                  disabled={loading}
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Sales & Operations">Sales & Operations</option>
                  <option value="Product">Product</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Finance & Legal">Finance & Legal</option>
                  <option value="IT Support">IT Support</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Account Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="select"
                  disabled={loading}
                >
                  <option value="EMPLOYEE">Employee</option>
                  <option value="SUPPORT_AGENT">Support Agent</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', height: '42px', marginTop: '12px', fontSize: '0.95rem' }}
            >
              <UserPlus size={18} /> {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.85rem', color: '#64748b' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary-600)', fontWeight: 600 }}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
