import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PlusCircle, Ticket as TicketIcon } from 'lucide-react';
import { ticketService } from '../services/ticketService';
import TicketTable from '../components/TicketTable';
import TicketFilters from '../components/TicketFilters';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

const Tickets = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Read initial filter values from URL search params
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    priority: searchParams.get('priority') || '',
    category: searchParams.get('category') || '',
    assignedTo: searchParams.get('assignedTo') || '',
    page: parseInt(searchParams.get('page') || '1', 10),
    limit: 10
  });

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await ticketService.getTickets(filters);
      setTickets(data.tickets || []);
      setPagination(data.pagination || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve tickets');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => {
      const updated = { ...prev, [field]: value, page: 1 };
      // Sync URL params
      const params = new URLSearchParams();
      Object.keys(updated).forEach((key) => {
        if (updated[key]) params.set(key, updated[key]);
      });
      setSearchParams(params, { replace: true });
      return updated;
    });
  };

  const handleResetFilters = () => {
    const cleanFilters = {
      search: '',
      status: '',
      priority: '',
      category: '',
      assignedTo: '',
      page: 1,
      limit: 10
    };
    setFilters(cleanFilters);
    setSearchParams({}, { replace: true });
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Incident Management Queue
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Filter, triage, and track resolution lifecycles across enterprise service requests
          </p>
        </div>

        <Link to="/tickets/new" className="btn btn-primary">
          <PlusCircle size={18} /> Log Incident
        </Link>
      </div>

      {/* Filter Component */}
      <TicketFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Main Content Area */}
      {error && <ErrorMessage message={error} onRetry={fetchTickets} />}

      {loading ? (
        <LoadingSpinner text="Retrieving incident records..." size={32} />
      ) : tickets.length === 0 ? (
        <EmptyState
          icon={TicketIcon}
          title="No incidents found"
          description="There are no tickets matching your current search parameters or filter criteria."
          action={
            <button onClick={handleResetFilters} className="btn btn-secondary btn-sm">
              Clear All Filters
            </button>
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <TicketTable tickets={tickets} />
          <Pagination pagination={pagination} onPageChange={handlePageChange} />
        </div>
      )}
    </div>
  );
};

export default Tickets;
