import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { sendInvitation } from '../services/dashboard';
import '../styles/SendInvitation.css';

export default function SendInvitation() {
  const [businessName, setBusinessName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [businessWebsite, setBusinessWebsite] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(null);
    setLoading(true);

    try {
      const result = await sendInvitation({
        businessName,
        contactEmail,
        businessWebsite: businessWebsite || undefined
      });

      setSuccess(result);

      // Clear form
      setBusinessName('');
      setContactEmail('');
      setBusinessWebsite('');

      // Auto-redirect after 3 seconds
      setTimeout(() => {
        navigate('/customers');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send invitation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

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
          <button onClick={() => navigate('/customers')} className="nav-link">
            Customers
          </button>
          <button onClick={() => navigate('/invitations')} className="nav-link active">
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
            <h2 style={{ marginTop: '1rem' }}>Send Customer Invitation</h2>
            <p className="page-description">
              Invite a new customer to register their sender ID. They will receive an email with a secure registration link.
            </p>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {success ? (
          <div className="success-card">
            <div className="success-icon">✅</div>
            <h3>Invitation Sent Successfully!</h3>
            <p>An invitation email has been sent to <strong>{success.customer.contactEmail}</strong></p>

            <div className="invitation-details">
              <h4>Invitation Details</h4>
              <div className="detail-item">
                <span className="label">Business Name:</span>
                <span className="value">{success.customer.businessName}</span>
              </div>
              <div className="detail-item">
                <span className="label">Registration URL:</span>
                <div className="url-box">
                  <code>{success.email.registrationUrl}</code>
                  <button
                    onClick={() => copyToClipboard(success.email.registrationUrl)}
                    className="btn btn-small"
                  >
                    Copy
                  </button>
                </div>
              </div>
              {success.email.simulated && (
                <div className="info-message">
                  ℹ️ Email delivery is in simulation mode. In production, this would be sent via SendGrid.
                </div>
              )}
            </div>

            <p className="redirect-message">Redirecting to customers page in 3 seconds...</p>
          </div>
        ) : (
          <div className="invitation-form-card">
            <form onSubmit={handleSubmit} className="invitation-form">
              <div className="form-section">
                <h3>Customer Information</h3>

                <div className="form-group">
                  <label htmlFor="businessName">Business Name *</label>
                  <input
                    type="text"
                    id="businessName"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    required
                    placeholder="e.g., Acme Corporation"
                    disabled={loading}
                  />
                  <small>The name of the customer's business</small>
                </div>

                <div className="form-group">
                  <label htmlFor="contactEmail">Contact Email *</label>
                  <input
                    type="email"
                    id="contactEmail"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                    placeholder="e.g., john@acme.com"
                    disabled={loading}
                  />
                  <small>The customer will receive the invitation at this email address</small>
                </div>

                <div className="form-group">
                  <label htmlFor="businessWebsite">Business Website</label>
                  <input
                    type="url"
                    id="businessWebsite"
                    value={businessWebsite}
                    onChange={(e) => setBusinessWebsite(e.target.value)}
                    placeholder="https://www.acme.com"
                    disabled={loading}
                  />
                  <small>Optional - Will be used during sender ID registration</small>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => navigate('/customers')}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
