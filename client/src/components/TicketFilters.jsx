import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TicketFilters = ({ filters, onFilterChange, onReset }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const isAgent = user?.role === 'SUPPORT_AGENT';

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        alignItems: 'center',
        padding: '16px',
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        marginBottom: '20px'
      }}
    >
      {/* Search Input */}
      <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '200px' }}>
        <Search
          size={16}
          style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
        />
        <input
          type="text"
          placeholder="Search by ID or Title..."
          value={filters.search || ''}
          onChange={(e) => onFilterChange('search', e.target.value)}
          className="input"
          style={{ paddingLeft: '36px' }}
        />
      </div>

      {/* Status Filter */}
      <div style={{ width: '150px' }}>
        <select
          value={filters.status || ''}
          onChange={(e) => onFilterChange('status', e.target.value)}
          className="select"
        >
          <option value="">All Statuses</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="On Hold">On Hold</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      {/* Priority Filter */}
      <div style={{ width: '140px' }}>
        <select
          value={filters.priority || ''}
          onChange={(e) => onFilterChange('priority', e.target.value)}
          className="select"
        >
          <option value="">All Priorities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {/* Category Filter */}
      <div style={{ width: '150px' }}>
        <select
          value={filters.category || ''}
          onChange={(e) => onFilterChange('category', e.target.value)}
          className="select"
        >
          <option value="">All Categories</option>
          <option value="Hardware">Hardware</option>
          <option value="Software">Software</option>
          <option value="Network">Network</option>
          <option value="Access/Login">Access/Login</option>
          <option value="Email">Email</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Assignment Filter for Admin or Agent */}
      {(isAdmin || isAgent) && (
        <div style={{ width: '150px' }}>
          <select
            value={filters.assignedTo || ''}
            onChange={(e) => onFilterChange('assignedTo', e.target.value)}
            className="select"
          >
            <option value="">All Assignees</option>
            {isAgent && <option value="me">Assigned to Me</option>}
            {isAdmin && <option value="unassigned">Unassigned</option>}
          </select>
        </div>
      )}

      {/* Reset button */}
      <button
        onClick={onReset}
        title="Reset all filters"
        className="btn btn-secondary btn-sm"
        style={{ height: '38px', padding: '0 12px' }}
      >
        <RotateCcw size={14} /> Reset
      </button>
    </div>
  );
};

export default TicketFilters;
