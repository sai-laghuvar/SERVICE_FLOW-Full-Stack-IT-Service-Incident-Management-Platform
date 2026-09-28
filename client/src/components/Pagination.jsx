import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages, total, limit } = pagination;
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderTop: '1px solid var(--border-light)',
        backgroundColor: '#ffffff',
        borderBottomLeftRadius: 'var(--radius-lg)',
        borderBottomRightRadius: 'var(--radius-lg)'
      }}
    >
      <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
        Showing <span style={{ fontWeight: 600, color: '#1e293b' }}>{startItem}</span> to{' '}
        <span style={{ fontWeight: 600, color: '#1e293b' }}>{endItem}</span> of{' '}
        <span style={{ fontWeight: 600, color: '#1e293b' }}>{total}</span> results
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="btn btn-sm btn-secondary"
          style={{ padding: '6px 10px' }}
        >
          <ChevronLeft size={16} /> Previous
        </button>

        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', padding: '0 8px' }}>
          Page {page} of {totalPages}
        </span>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="btn btn-sm btn-secondary"
          style={{ padding: '6px 10px' }}
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
