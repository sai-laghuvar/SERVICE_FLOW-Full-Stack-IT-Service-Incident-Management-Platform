/**
 * Date formatting and SLA calculation utilities
 */

export const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date);
};

export const formatRelativeTime = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;

  return formatDate(dateString);
};

export const getSLARemaining = (slaDeadline, status) => {
  if (!slaDeadline) return { label: 'No SLA', isBreached: false };
  if (status === 'Resolved' || status === 'Closed') {
    return { label: 'Met SLA', isBreached: false, isCompleted: true };
  }

  const deadline = new Date(slaDeadline);
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();

  if (diff <= 0) {
    const overdueHours = Math.abs(Math.floor(diff / (1000 * 60 * 60)));
    return {
      label: `Breached (${overdueHours}h overdue)`,
      isBreached: true
    };
  }

  const hoursRemaining = Math.floor(diff / (1000 * 60 * 60));
  const minutesRemaining = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hoursRemaining > 24) {
    const days = Math.floor(hoursRemaining / 24);
    return { label: `${days}d remaining`, isBreached: false };
  }

  return {
    label: `${hoursRemaining}h ${minutesRemaining}m left`,
    isBreached: false
  };
};
