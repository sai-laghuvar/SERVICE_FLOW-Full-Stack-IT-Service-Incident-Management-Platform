import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus, ShieldCheck, Headphones, Briefcase } from 'lucide-react';
import NotificationBell from './NotificationBell';
import { useAuth } from '../context/AuthContext';

const getBreadcrumbTitle = (pathname) => {
  if (pathname === '/dashboard' || pathname === '/admin/dashboard') return 'Operational Dashboard';
  if (pathname === '/tickets' || pathname === '/admin/tickets') return 'Incident Management Queue';
  if (pathname === '/tickets/new') return 'Log New Support Ticket';
  if (pathname.startsWith('/tickets/')) return 'Incident Details';
  if (pathname === '/admin/users') return 'User Directory & Access Control';
  if (pathname === '/notifications') return 'Notification Center';
  if (pathname === '/profile') return 'User Profile & Settings';
  return 'ServiceFlow ITSM';
};

const Navbar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const role = user?.role;
  const isEmployee = role === 'EMPLOYEE';

  return (
    <header className="top-navbar">
      {/* Page Title / Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
          {getBreadcrumbTitle(location.pathname)}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {role === 'ADMIN' && (
            <span className="badge" style={{ backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>
              <ShieldCheck size={12} /> Admin Workspace
            </span>
          )}
          {role === 'SUPPORT_AGENT' && (
            <span className="badge" style={{ backgroundColor: '#e0e7ff', color: '#3730a3', border: '1px solid #c7d2fe' }}>
              <Headphones size={12} /> Support Workspace
            </span>
          )}
          {role === 'EMPLOYEE' && (
            <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}>
              <Briefcase size={12} /> Employee Portal
            </span>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Quick New Ticket button */}
        <Link to="/tickets/new" className="btn btn-primary btn-sm">
          <Plus size={16} /> New Incident
        </Link>

        {/* In-app Notification Bell */}
        <NotificationBell />

        {/* User Mini Avatar Link */}
        <Link
          to="/profile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none'
          }}
          title="View Profile"
        >
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: '#e2e8f0',
              color: '#334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
