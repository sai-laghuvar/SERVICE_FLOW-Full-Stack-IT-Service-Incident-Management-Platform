import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { notificationService } from '../services/notificationService';
import { formatRelativeTime } from '../utils/dateUtils';

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      // Quiet fail on polling
    }
  };

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications({ limit: 6 });
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // 30s poll
    return () => clearInterval(interval);
  }, []);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!isOpen) {
      loadNotifications();
    }
    setIsOpen(!isOpen);
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.read) {
        await notificationService.markAsRead(notification._id);
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error(err);
    }

    setIsOpen(false);
    if (notification.ticketCode) {
      navigate(`/tickets/${notification.ticketCode}`);
    } else if (notification.relatedTicketId) {
      navigate(`/tickets/${notification.relatedTicketId.ticketId || notification.relatedTicketId}`);
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="btn btn-secondary"
        style={{
          width: '38px',
          height: '38px',
          padding: 0,
          borderRadius: '50%',
          position: 'relative'
        }}
        title="Notifications"
      >
        <Bell size={18} color="#475569" />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              backgroundColor: '#ef4444',
              color: '#ffffff',
              fontSize: '0.68rem',
              fontWeight: 700,
              borderRadius: '9999px',
              minWidth: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              border: '2px solid #ffffff'
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            marginTop: '8px',
            width: '360px',
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border-light)',
            zIndex: 50,
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              padding: '14px 16px',
              borderBottom: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#f8fafc'
            }}
          >
            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b' }}>
              Notifications ({unreadCount} new)
            </span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary-600)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Check size={14} /> Mark all read
              </button>
            )}
          </div>

          <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                No notifications yet.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => handleNotificationClick(n)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    backgroundColor: n.read ? '#ffffff' : '#f0f7ff',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = n.read ? '#ffffff' : '#f0f7ff')
                  }
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: n.read ? 'transparent' : 'var(--primary-600)',
                        marginTop: '6px',
                        flexShrink: 0
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.825rem', color: '#1e293b', lineHeight: 1.4, margin: 0 }}>
                        {n.message}
                      </p>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                        {formatRelativeTime(n.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div
            style={{
              padding: '10px 16px',
              borderTop: '1px solid var(--border-light)',
              backgroundColor: '#f8fafc',
              textAlign: 'center'
            }}
          >
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/notifications');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary-600)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              View all notifications <ExternalLink size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
