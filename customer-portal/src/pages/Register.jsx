import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { verifyInvitationToken } from '../services/auth';
import '../styles/Auth.css';

export default function Register() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [customerInfo, setCustomerInfo] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);

  const navigate = useNavigate();
  const { register } = useAuth();

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('No invitation token provided');
        setVerifying(false);
        return;
      }

      try {
        const info = await verifyInvitationToken(token);
        setCustomerInfo(info);
      } catch (err) {
        setError('Invalid or expired invitation token');
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await register({
        token,
        email: customerInfo.contactEmail,
        password,
        username,
        companyName: customerInfo.businessName
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            Verifying invitation...
          </div>
        </div>
      </div>
    );
  }

  if (error && !customerInfo) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="alert alert-error">
            {error}
          </div>
          <p style={{ textAlign: 'center', marginTop: '1rem' }}>
            Please contact support if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Complete Registration</h1>
          <p>Welcome! Create your account to get started.</p>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <div className="info-box">
          <strong>Business:</strong> {customerInfo.businessName}<br />
          <strong>Email:</strong> {customerInfo.contactEmail}
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Full Name *</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="John Doe"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="At least 8 characters"
              disabled={loading}
            />
            <small>Must be at least 8 characters long</small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Re-enter password"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
