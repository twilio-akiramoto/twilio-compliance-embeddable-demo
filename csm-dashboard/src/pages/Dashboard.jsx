import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getMetrics } from '../services/dashboard';
import MetricCard from '../components/MetricCard';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const data = await getMetrics('30d');
      setMetrics(data);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          Loading dashboard...
        </div>
      </div>
    );
  }

  const statusColors = {
    sent: '#2196f3',
    logged_in: '#9c27b0',
    in_progress: '#ff9800',
    completed: '#4caf50'
  };

  const chartData = metrics?.charts?.statusBreakdown?.map(item => ({
    name: item.invitationStatus.replace(/_/g, ' '),
    value: parseInt(item.count)
  })) || [];

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>ISV Dashboard</h1>
          <p>Welcome back, {user?.username || 'CSM'}</p>
        </div>
        <nav className="header-nav">
          <button onClick={() => navigate('/dashboard')} className="nav-link active">
            Dashboard
          </button>
          <button onClick={() => navigate('/customers')} className="nav-link">
            Customers
          </button>
          <button onClick={() => navigate('/invitations')} className="nav-link">
            Send Invitation
          </button>
          <button onClick={handleLogout} className="btn btn-secondary">
            Logout
          </button>
        </nav>
      </header>

      <main className="dashboard-content">
        <section className="metrics-section">
          <h2>Overview</h2>
          <div className="metrics-grid">
            <MetricCard
              title="Total Customers"
              value={metrics?.metrics?.totalCustomers || 0}
              icon="👥"
              color="blue"
            />
            <MetricCard
              title="Invitations Sent"
              value={metrics?.metrics?.invitationsSent || 0}
              icon="📧"
              color="purple"
            />
            <MetricCard
              title="Active Registrations"
              value={metrics?.metrics?.activeRegistrations || 0}
              icon="⏳"
              color="yellow"
            />
            <MetricCard
              title="Completed"
              value={metrics?.metrics?.completedRegistrations || 0}
              icon="✅"
              color="green"
            />
          </div>
        </section>

        <section className="charts-section">
          <div className="chart-card">
            <h3>Customer Status Distribution</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => {
                      const colorKey = entry.name.replace(/ /g, '_').toLowerCase();
                      return <Cell key={`cell-${index}`} fill={statusColors[colorKey] || '#999'} />;
                    })}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart">
                <p>No customer data available yet</p>
              </div>
            )}
          </div>

          <div className="chart-card">
            <h3>Quick Stats</h3>
            <div className="stats-list">
              <div className="stat-item">
                <span className="stat-label">Approval Rate</span>
                <span className="stat-value">{metrics?.metrics?.approvalRate || 0}%</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Registrations</span>
                <span className="stat-value">
                  {(metrics?.metrics?.activeRegistrations || 0) + (metrics?.metrics?.completedRegistrations || 0)}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Completion Rate</span>
                <span className="stat-value">
                  {metrics?.metrics?.totalCustomers > 0
                    ? Math.round((metrics.metrics.completedRegistrations / metrics.metrics.totalCustomers) * 100)
                    : 0}%
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="actions-section">
          <div className="action-cards">
            <div className="action-card" onClick={() => navigate('/customers')}>
              <div className="action-icon">👥</div>
              <h3>View Customers</h3>
              <p>Manage all customer accounts and registrations</p>
            </div>
            <div className="action-card" onClick={() => navigate('/invitations')}>
              <div className="action-icon">📧</div>
              <h3>Send Invitation</h3>
              <p>Invite new customers to register sender IDs</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
