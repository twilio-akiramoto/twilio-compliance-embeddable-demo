import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getProfile, getRegistrations } from '../services/portal';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profileData, registrationsData] = await Promise.all([
        getProfile(),
        getRegistrations()
      ]);
      setProfile(profileData);
      setRegistrations(registrationsData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      draft: 'badge-gray',
      in_review: 'badge-blue',
      in_progress: 'badge-yellow',
      approved: 'badge-green',
      rejected: 'badge-red'
    };
    return statusMap[status] || 'badge-gray';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          Loading dashboard...
        </div>
      </div>
    );
  }

  const pendingCount = registrations.filter(r =>
    ['draft', 'in_review', 'in_progress'].includes(r.status)
  ).length;
  const completedCount = registrations.filter(r => r.status === 'approved').length;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Customer Portal</h1>
          <p>Welcome back, {user?.username || 'Customer'}</p>
        </div>
        <button onClick={handleLogout} className="btn btn-secondary">
          Logout
        </button>
      </header>

      <div className="dashboard-content">
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon">📝</div>
            <div className="metric-value">{registrations.length}</div>
            <div className="metric-label">Total Registrations</div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">⏳</div>
            <div className="metric-value">{pendingCount}</div>
            <div className="metric-label">Pending</div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">✅</div>
            <div className="metric-value">{completedCount}</div>
            <div className="metric-label">Completed</div>
          </div>
        </div>

        <div className="action-section">
          <h2>Register New Sender ID</h2>
          <p>Start a new Australia Alphanumeric Sender ID registration</p>
          <button
            onClick={() => navigate('/register-sender')}
            className="btn btn-primary"
          >
            Register Sender ID
          </button>
        </div>

        <div className="registrations-section">
          <h2>Your Registrations</h2>

          {registrations.length === 0 ? (
            <div className="empty-state">
              <p>No registrations yet. Click the button above to get started!</p>
            </div>
          ) : (
            <div className="registrations-table">
              <table>
                <thead>
                  <tr>
                    <th>Sender ID</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Started</th>
                    <th>Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg) => (
                    <tr key={reg.id}>
                      <td>
                        <strong>{reg.senderId || 'N/A'}</strong>
                      </td>
                      <td>
                        {reg.registrationType === 'au-alphanumeric'
                          ? 'AU Alphanumeric'
                          : reg.registrationType}
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(reg.status)}`}>
                          {reg.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>{formatDate(reg.startedAt)}</td>
                      <td>{formatDate(reg.completedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="profile-section">
          <h2>Your Profile</h2>
          <div className="profile-info">
            <div className="info-row">
              <span className="label">Business Name:</span>
              <span className="value">{profile?.customer?.businessName || 'N/A'}</span>
            </div>
            <div className="info-row">
              <span className="label">Email:</span>
              <span className="value">{profile?.user?.email || 'N/A'}</span>
            </div>
            <div className="info-row">
              <span className="label">Website:</span>
              <span className="value">{profile?.customer?.businessWebsite || 'N/A'}</span>
            </div>
            <div className="info-row">
              <span className="label">Status:</span>
              <span className={`badge ${getStatusBadgeClass(profile?.customer?.invitationStatus)}`}>
                {profile?.customer?.invitationStatus?.replace('_', ' ') || 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
