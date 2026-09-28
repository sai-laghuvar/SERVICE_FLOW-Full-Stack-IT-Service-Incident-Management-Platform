import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Ticket,
  AlertTriangle,
  Clock,
  CheckCircle,
  HelpCircle,
  PlusCircle,
  Activity,
  ArrowRight,
  ShieldAlert,
  FolderOpen
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import { dashboardService } from '../services/dashboardService';
import { ticketService } from '../services/ticketService';
import { useAuth } from '../context/AuthContext';
import DashboardCard from '../components/DashboardCard';
import TicketTable from '../components/TicketTable';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatDate } from '../utils/dateUtils';

const STATUS_COLORS = {
  Open: '#3b82f6',
  'In Progress': '#f59e0b',
  'On Hold': '#a855f7',
  Resolved: '#10b981',
  Closed: '#64748b'
};

const PRIORITY_COLORS = {
  Critical: '#ef4444',
  High: '#f97316',
  Medium: '#3b82f6',
  Low: '#64748b'
};

const Dashboard = () => {
  const { user } = useAuth();
  const role = user?.role;
  const isAdmin = role === 'ADMIN';
  const isAgent = role === 'SUPPORT_AGENT';
  const isEmployee = role === 'EMPLOYEE';

  const [stats, setStats] = useState(null);
  const [statusData, setStatusData] = useState([]);
  const [priorityData, setPriorityData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [recentTickets, setRecentTickets] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [
        statsRes,
        statusRes,
        priorityRes,
        categoryRes,
        trendsRes,
        ticketsRes
      ] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getStatusBreakdown(),
        dashboardService.getPriorityBreakdown(),
        dashboardService.getCategoryBreakdown(),
        dashboardService.getTrends(7),
        ticketService.getTickets({ limit: 6, sortBy: 'createdAt', sortOrder: 'desc' })
      ]);

      setStats(statsRes);
      setStatusData(statusRes || []);
      setPriorityData(priorityRes || []);
      setCategoryData(categoryRes || []);
      setTrendData(trendsRes || []);
      setRecentTickets(ticketsRes?.tickets || []);

      if (isAdmin || isAgent) {
        const activityRes = await dashboardService.getRecentActivity(8);
        setRecentActivities(activityRes || []);
      }
    } catch (err) {
      console.error('[Dashboard Error]', err);
      setError(err.response?.data?.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [role]);

  if (loading) {
    return <LoadingSpinner text="Aggregating service performance metrics..." size={32} />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchDashboardData} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Welcome Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Welcome back, {user?.name}
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {isAdmin && 'Enterprise IT operations overview, workload dispatch, and SLA governance.'}
            {isAgent && 'Your active incident queues, assigned tickets, and pending resolutions.'}
            {isEmployee && 'Track your submitted IT requests and enterprise service support.'}
          </p>
        </div>

        <Link to="/tickets/new" className="btn btn-primary">
          <PlusCircle size={18} /> Log Incident
        </Link>
      </div>

      {/* KPI Cards Row */}
      <div className="grid-cols-4">
        <DashboardCard
          title={isEmployee ? 'My Total Tickets' : 'Total Incidents'}
          value={stats?.total || 0}
          subtitle="System recorded tickets"
          icon={Ticket}
          color="#3b82f6"
        />

        <DashboardCard
          title="In Progress"
          value={stats?.inProgress || 0}
          subtitle="Actively under investigation"
          icon={Clock}
          color="#f59e0b"
        />

        <DashboardCard
          title="Critical Priority"
          value={stats?.critical || 0}
          subtitle="High business impact"
          icon={AlertTriangle}
          color="#ef4444"
          badge={
            stats?.critical > 0 ? (
              <span className="badge badge-priority-critical">Urgent</span>
            ) : null
          }
        />

        {isAdmin ? (
          <DashboardCard
            title="Unassigned Queue"
            value={stats?.unassigned || 0}
            subtitle="Requires agent dispatch"
            icon={HelpCircle}
            color="#8b5cf6"
            badge={
              stats?.unassigned > 0 ? (
                <span className="badge" style={{ backgroundColor: '#f3e8ff', color: '#6b21a8' }}>
                  Action Needed
                </span>
              ) : null
            }
          />
        ) : (
          <DashboardCard
            title="Resolved / Closed"
            value={(stats?.resolved || 0) + (stats?.closed || 0)}
            subtitle="Successfully remediated"
            icon={CheckCircle}
            color="#10b981"
          />
        )}
      </div>

      {/* SLA Breach Warning Banner if any breached */}
      {stats?.slaBreached > 0 && (
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShieldAlert size={22} color="#dc2626" />
            <div>
              <span style={{ fontWeight: 700, color: '#991b1b', fontSize: '0.9rem' }}>
                {stats.slaBreached} Incident(s) Currently Breached SLA Deadline!
              </span>
              <p style={{ fontSize: '0.8rem', color: '#b91c1c', margin: 0 }}>
                These tickets have exceeded their guaranteed turnaround window and require immediate escalation.
              </p>
            </div>
          </div>
          <Link
            to="/tickets?status=Open"
            className="btn btn-sm"
            style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
          >
            Review Overdue Queue
          </Link>
        </div>
      )}

      {/* Analytics Charts Grid */}
      <div className="grid-cols-2">
        {/* Ticket Volume Trends */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b' }}>
              7-Day Incident Inflow vs Resolution
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Volume Trends</span>
          </div>

          <div style={{ height: '260px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="created"
                  name="Created"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="resolved"
                  name="Resolved"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Breakdown (Pie/Donut) */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b' }}>
              Incidents by Priority
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Severity Distribution</span>
          </div>

          <div style={{ height: '260px', display: 'flex', alignItems: 'center' }}>
            <ResponsiveContainer width="60%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                >
                  {priorityData.map((entry) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={PRIORITY_COLORS[entry.name] || '#94a3b8'}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            {/* Custom Legend */}
            <div style={{ width: '40%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {priorityData.map((item) => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '2px',
                        backgroundColor: PRIORITY_COLORS[item.name] || '#94a3b8'
                      }}
                    />
                    <span style={{ color: '#475569' }}>{item.name}</span>
                  </div>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b' }}>
              Incidents by Service Category
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Domain Analysis</span>
          </div>

          <div style={{ height: '240px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="count" name="Tickets" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b' }}>
              Workflow Status Breakdown
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>State Pipeline</span>
          </div>

          <div style={{ height: '240px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="count" name="Tickets">
                  {statusData.map((entry) => (
                    <Cell key={`status-${entry.name}`} fill={STATUS_COLORS[entry.name] || '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Incidents Table */}
      <div className="card" style={{ padding: '24px 20px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {isEmployee ? 'My Recent Support Requests' : 'Recent Incoming Incidents'}
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Latest tickets recorded in the ServiceFlow pipeline
            </span>
          </div>

          <Link to="/tickets" className="btn btn-secondary btn-sm">
            View All Tickets <ArrowRight size={14} />
          </Link>
        </div>

        <TicketTable tickets={recentTickets} />
      </div>

      {/* Recent Audit Activity Stream for Admin and Agent */}
      {(isAdmin || isAgent) && recentActivities.length > 0 && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Activity size={18} color="var(--primary-600)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Live System Activity Stream
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentActivities.map((act) => (
              <div
                key={act._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  backgroundColor: '#f8fafc',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.825rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>
                    {act.performedBy?.name || 'System'}
                  </span>
                  <span style={{ color: '#64748b' }}>
                    performed <strong style={{ color: '#334155' }}>{act.action.replace(/_/g, ' ')}</strong>
                  </span>
                  {act.ticketId && (
                    <Link
                      to={`/tickets/${act.ticketId.ticketId || act.ticketId}`}
                      className="ticket-code"
                      style={{ fontSize: '0.78rem' }}
                    >
                      [{act.ticketId.ticketId || 'Ticket'}]
                    </Link>
                  )}
                </div>
                <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                  {formatDate(act.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
