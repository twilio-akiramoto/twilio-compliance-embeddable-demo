import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getCustomerById, resendInvitation } from '../services/dashboard';
import StatusBadge from '../components/StatusBadge';
import '../styles/CustomerDetail.css';

export default function CustomerDetail() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadCustomer();
  }, [id]);

  const loadCustomer = async () => {
    try {
      const data = await getCustomerById(id);
      setCustomer(data);
    } catch (error) {
      console.error('Failed to load customer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendInvitation = async () => {
    setResending(true);
    setMessage('');
    try {
      await resendInvitation(id);
      setMessage('Invitation resent successfully!');
      loadCustomer();
    } catch (error) {
      setMessage('Failed to resend invitation');
    } finally {
      setResending(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not yet';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          Loading customer details...
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="dashboard-layout">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          Customer not found
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>ISV Dashboard</h1>
          <p>Welcome back, {user?.username || 'CSM'}</p>
        </div>
        <nav className="header-nav">
          <button onClick={() => navigate('/dashboard')} className="nav-link">
            Dashboard
          </button>
          <button onClick={() => navigate('/customers')} className="nav-link active">
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

      <main className="page-content">
        <div className="page-header">
          <div>
            <button onClick={() => navigate('/customers')} className="btn btn-secondary">
              ← Back to Customers
            </button>
            <h2 style={{ marginTop: '1rem' }}>{customer.businessName}</h2>
          </div>
        </div>

        {message && (
          <div className={`alert ${message.includes('Failed') ? 'alert-error' : 'alert-success'}`}>
            {message}
          </div>
        )}

        <div className="detail-grid">
          <div className="detail-card">
            <h3>Customer Information</h3>
            <div className="info-list">
              <div className="info-item">
                <span className="info-label">Business Name</span>
                <span className="info-value">{customer.businessName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Contact Email</span>
                <span className="info-value">{customer.contactEmail}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Website</span>
                <span className="info-value">{customer.businessWebsite || 'Not provided'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Status</span>
                <StatusBadge status={customer.invitationStatus} />
              </div>
              <div className="info-item">
                <span className="info-label">Assigned CSM</span>
                <span className="info-value">{customer.csm?.username || 'Unassigned'}</span>
              </div>
            </div>
          </div>

          <div className="detail-card">
            <h3>Timeline</h3>
            <div className="timeline">
              <div className="timeline-item completed">
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <div className="timeline-title">Invitation Sent</div>
                  <div className="timeline-date">{formatDate(customer.invitationSentAt)}</div>
                </div>
              </div>

              <div className={`timeline-item ${customer.user ? 'completed' : 'pending'}`}>
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <div className="timeline-title">Customer Logged In</div>
                  <div className="timeline-date">
                    {customer.user ? formatDate(customer.user.lastLogin || customer.user.createdAt) : 'Pending'}
                  </div>
                </div>
              </div>

              <div className={`timeline-item ${customer.registrations?.length > 0 ? 'completed' : 'pending'}`}>
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <div className="timeline-title">Registration Started</div>
                  <div className="timeline-date">
                    {customer.registrations?.length > 0
                      ? formatDate(customer.registrations[0].startedAt)
                      : 'Pending'}
                  </div>
                </div>
              </div>

              <div className={`timeline-item ${customer.invitationStatus === 'completed' ? 'completed' : 'pending'}`}>
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <div className="timeline-title">Registration Completed</div>
                  <div className="timeline-date">
                    {customer.invitationStatus === 'completed'
                      ? formatDate(customer.registrations?.[0]?.completedAt)
                      : 'Pending'}
                  </div>
                </div>
              </div>
            </div>

            {!customer.userId && (
              <button
                onClick={handleResendInvitation}
                disabled={resending}
                className="btn btn-primary"
                style={{ marginTop: '1rem', width: '100%' }}
              >
                {resending ? 'Resending...' : 'Resend Invitation'}
              </button>
            )}
          </div>
        </div>

        {customer.registrations && customer.registrations.length > 0 && (
          <div className="detail-card" style={{ marginTop: '2rem' }}>
            <h3>Registrations</h3>
            <div className="table-container">
              <table className="data-table">
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
                  {customer.registrations.map((reg) => (
                    <tr key={reg.id}>
                      <td><strong>{reg.senderId || 'N/A'}</strong></td>
                      <td>
                        {reg.registrationType === 'au-alphanumeric'
                          ? 'AU Alphanumeric'
                          : reg.registrationType}
                      </td>
                      <td><StatusBadge status={reg.status} /></td>
                      <td>{formatDate(reg.startedAt)}</td>
                      <td>{formatDate(reg.completedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
