import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Layers, LogIn, ShieldCheck, Headphones, Briefcase } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      addToast('Signed in successfully', 'success');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setError('');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f172a',
        padding: '20px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden'
        }}
      >
        {/* Brand Banner */}
        <div
          style={{
            padding: '32px 32px 24px',
            textAlign: 'center',
            borderBottom: '1px solid var(--border-light)'
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              margin: '0 auto 16px',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}
          >
            <Layers size={26} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>
            ServiceFlow
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
            IT Service & Incident Management Platform
          </p>
        </div>

        {/* Form Body */}
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
              <label className="form-label">Corporate Email Address</label>
              <input
                type="email"
                required
                placeholder="name@serviceflow.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                disabled={loading}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', height: '42px', fontSize: '0.95rem' }}
            >
              <LogIn size={18} /> {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Credentials Autofill */}
          <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border-light)' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: '#94a3b8',
                letterSpacing: '0.05em',
                display: 'block',
                marginBottom: '10px'
              }}
            >
              Quick Demo Logins (Password: Password123!)
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleDemoFill('admin@serviceflow.local')}
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'flex-start', fontSize: '0.8rem' }}
              >
                <ShieldCheck size={14} color="#d97706" />
                <span>Admin: <strong>admin@serviceflow.local</strong></span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill('agent1@serviceflow.local')}
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'flex-start', fontSize: '0.8rem' }}
              >
                <Headphones size={14} color="#2563eb" />
                <span>Agent: <strong>agent1@serviceflow.local</strong></span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill('employee1@serviceflow.local')}
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'flex-start', fontSize: '0.8rem' }}
              >
                <Briefcase size={14} color="#64748b" />
                <span>Employee: <strong>employee1@serviceflow.local</strong></span>
              </button>
            </div>
          </div>

          {/* Registration link */}
          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.85rem', color: '#64748b' }}>
            New corporate employee?{' '}
            <Link to="/signup" style={{ color: 'var(--primary-600)', fontWeight: 600 }}>
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
