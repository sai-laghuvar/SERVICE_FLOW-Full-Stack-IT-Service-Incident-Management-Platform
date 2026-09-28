import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Ticket,
  PlusCircle,
  Users,
  Bell,
  User,
  LogOut,
  Layers,
  LifeBuoy
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  if (!user) return null;

  const role = user.role;
  const isAdmin = role === 'ADMIN';
  const isAgent = role === 'SUPPORT_AGENT';

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="brand-icon">
          <Layers size={20} />
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="brand-text">ServiceFlow</span>
            <span className="brand-badge">ITSM</span>
          </div>
          <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>
            Incident Platform
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        <span className="nav-section-title">Core Operations</span>

        <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/tickets" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
          <Ticket size={18} />
          <span>{isAdmin ? 'All Incidents' : isAgent ? 'Service Queue' : 'My Tickets'}</span>
        </NavLink>

        <NavLink to="/tickets/new" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <PlusCircle size={18} />
          <span>New Incident</span>
        </NavLink>

        {isAdmin && (
          <>
            <span className="nav-section-title" style={{ marginTop: '12px' }}>
              Administration
            </span>
            <NavLink to="/admin/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Users size={18} />
              <span>User Directory</span>
            </NavLink>
          </>
        )}

        <span className="nav-section-title" style={{ marginTop: '12px' }}>
          Personal
        </span>

        <NavLink to="/notifications" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Bell size={18} />
          <span>Notifications</span>
        </NavLink>

        <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <User size={18} />
          <span>My Profile</span>
        </NavLink>
      </nav>

      {/* Footer Profile & Logout */}
      <div className="sidebar-footer">
        <div className="user-mini-profile">
          <div className="user-avatar">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="user-info">
            <div className="user-name">{user.name}</div>
            <div className="user-role-badge">
              {role.replace('_', ' ')}
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="btn btn-secondary btn-sm"
          style={{
            padding: '6px',
            backgroundColor: '#1e293b',
            borderColor: '#334155',
            color: '#94a3b8'
          }}
          title="Sign out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
