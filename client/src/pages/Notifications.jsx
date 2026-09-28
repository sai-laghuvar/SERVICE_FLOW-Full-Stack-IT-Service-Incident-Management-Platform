import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../services/notificationService';
import { useToast } from '../context/ToastContext';
import { Bell, Check, ExternalLink, Inbox } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import { formatRelativeTime } from '../utils/dateUtils';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { addToast } = useToast();
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await notificationService.getNotifications({ unreadOnly, page, limit: 15 });
      setNotifications(data.notifications || []);
      setPagination(data.pagination || null);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [unreadOnly, page]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      addToast('All notifications marked as read', 'success');
    } catch (err) {
      addToast('Failed to mark all as read', 'error');
    }
  };

  const handleNotificationClick = async (n) => {
    if (!n.read) {
      try {
        await notificationService.markAsRead(n._id);
        setNotifications((prev) =>
          prev.map((item) => (item._id === n._id ? { ...item, read: true } : item))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        // Continue navigation
      }
    }

    if (n.ticketCode) {
      navigate(`/tickets/${n.ticketCode}`);
    } else if (n.relatedTicketId) {
      navigate(`/tickets/${n.relatedTicketId.ticketId || n.relatedTicketId}`);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Notification Center
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Real-time incident updates, assignment dispatches, and communication responses
          </p>
        </div>

        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn btn-secondary btn-sm">
            <Check size={14} /> Mark all read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={() => {
            setUnreadOnly(false);
            setPage(1);
          }}
          className={`btn btn-sm ${!unreadOnly ? 'btn-primary' : 'btn-secondary'}`}
        >
          All Notifications
        </button>
        <button
          onClick={() => {
            setUnreadOnly(true);
            setPage(1);
          }}
          className={`btn btn-sm ${unreadOnly ? 'btn-primary' : 'btn-secondary'}`}
        >
          Unread Only ({unreadCount})
        </button>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchNotifications} />}

      {loading ? (
        <LoadingSpinner text="Retrieving notifications..." size={32} />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description={
            unreadOnly
              ? 'You have caught up with all your unread alerts.'
              : 'You do not have any notifications yet.'
          }
        />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => handleNotificationClick(n)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1px solid var(--border-subtle)',
                backgroundColor: n.read ? '#ffffff' : '#f0f7ff',
                cursor: 'pointer',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = n.read ? '#ffffff' : '#f0f7ff')
              }
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: n.read ? 'transparent' : 'var(--primary-600)',
                    marginTop: '6px',
                    flexShrink: 0
                  }}
                />
                <div>
                  <p style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: n.read ? 400 : 600, lineHeight: 1.4, margin: 0 }}>
                    {n.message}
                  </p>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '6px', display: 'block' }}>
                    {formatRelativeTime(n.createdAt)}
                  </span>
                </div>
              </div>

              {n.ticketCode && (
                <span className="ticket-code" style={{ fontSize: '0.8rem', flexShrink: 0, marginLeft: '16px' }}>
                  {n.ticketCode}
                </span>
              )}
            </div>
          ))}

          <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />
        </div>
      )}
    </div>
  );
};

export default Notifications;
