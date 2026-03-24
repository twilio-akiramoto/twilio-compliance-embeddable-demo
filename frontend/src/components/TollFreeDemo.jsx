import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ComplianceEmbed from './ComplianceEmbed';
import { initializeTollFree, resumeTollFree } from '../services/api';
import './DemoPages.css';

const TollFreeDemo = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [embedData, setEmbedData] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showResume, setShowResume] = useState(false);

  // Form state
  const [friendlyName, setFriendlyName] = useState('');
  const [notificationEmail, setNotificationEmail] = useState('');
  const [phoneNumberType, setPhoneNumberType] = useState('tollfree');
  const [endUserType, setEndUserType] = useState('Business');
  const [resumeRegistrationId, setResumeRegistrationId] = useState('');

  const handleInitialize = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await initializeTollFree({
        friendlyName,
        notificationEmail,
        phoneNumberType,
        endUserType
      });

      if (response.success) {
        setEmbedData(response.data);
        console.log('Registration ID:', response.data.registrationId);
      } else {
        setError(response.error || 'Failed to initialize inquiry');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResume = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await resumeTollFree(resumeRegistrationId);

      if (response.success) {
        setEmbedData(response.data);
      } else {
        setError(response.error || 'Failed to resume inquiry');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    setSuccess(true);
    setTimeout(() => {
      navigate('/');
    }, 3000);
  };

  if (success) {
    return (
      <div className="demo-page">
        <div className="alert alert-success">
          <h3>✅ Toll-free Verification Submitted!</h3>
          <p>The compliance inquiry has been successfully submitted. You will receive email notifications about the review status.</p>
          <p>Redirecting to home page...</p>
        </div>
      </div>
    );
  }

  if (embedData) {
    return (
      <div className="demo-page">
        <div className="page-header">
          <button className="btn btn-secondary" onClick={() => setEmbedData(null)}>
            ← Back to Form
          </button>
          <h2>Toll-free Verification Inquiry</h2>
        </div>

        {embedData.registrationId && (
          <div className="alert alert-info">
            <strong>Registration ID:</strong> {embedData.registrationId}
            <br />
            <small>Save this ID to resume this inquiry later if needed.</small>
          </div>
        )}

        <ComplianceEmbed
          inquiryId={embedData.inquiryId}
          inquirySessionToken={embedData.inquirySessionToken}
          onComplete={handleComplete}
          onError={(err) => setError(err.message)}
        />
      </div>
    );
  }

  return (
    <div className="demo-page">
      <div className="page-header">
        <button className="btn btn-secondary" onClick={() => navigate('/')}>
          ← Back to Products
        </button>
        <div>
          <h2>US Toll-free Verification Demo</h2>
          <p className="page-subtitle">Initialize a new toll-free verification inquiry for your customer</p>
        </div>
      </div>

      <div className="demo-content">
        <div className="demo-form-section">
          <div className="card">
            <div className="card-header">
              <button
                className={`tab-button ${!showResume ? 'active' : ''}`}
                onClick={() => setShowResume(false)}
              >
                Initialize New Inquiry
              </button>
              <button
                className={`tab-button ${showResume ? 'active' : ''}`}
                onClick={() => setShowResume(true)}
              >
                Resume Existing Inquiry
              </button>
            </div>

            {error && (
              <div className="alert alert-error">
                <strong>Error:</strong> {error}
              </div>
            )}

            {!showResume ? (
              <form onSubmit={handleInitialize}>
                <div className="form-group">
                  <label className="form-label">
                    Friendly Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={friendlyName}
                    onChange={(e) => setFriendlyName(e.target.value)}
                    placeholder="e.g., Customer ABC - Toll-free"
                    required
                  />
                  <small className="form-help">A descriptive name for this inquiry</small>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Notification Email <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    value={notificationEmail}
                    onChange={(e) => setNotificationEmail(e.target.value)}
                    placeholder="e.g., support@yourcompany.com"
                    required
                  />
                  <small className="form-help">Email to receive status notifications</small>
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number Type</label>
                  <select
                    className="form-select"
                    value={phoneNumberType}
                    onChange={(e) => setPhoneNumberType(e.target.value)}
                  >
                    <option value="tollfree">Toll-free</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">End User Type</label>
                  <select
                    className="form-select"
                    value={endUserType}
                    onChange={(e) => setEndUserType(e.target.value)}
                  >
                    <option value="Business">Business</option>
                    <option value="Individual">Individual</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                  {isLoading ? 'Initializing...' : 'Initialize Inquiry'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResume}>
                <div className="form-group">
                  <label className="form-label">
                    Registration ID <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={resumeRegistrationId}
                    onChange={(e) => setResumeRegistrationId(e.target.value)}
                    placeholder="e.g., tri1.us1.account.AC...registration.TF..."
                    required
                  />
                  <small className="form-help">The registration ID from a previous inquiry (draft or rejected status)</small>
                </div>

                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                  {isLoading ? 'Resuming...' : 'Resume Inquiry'}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="demo-info-section">
          <div className="card info-card">
            <h3>About Toll-free Verification</h3>
            <p>
              US Toll-free Verification is required for sending SMS messages from toll-free phone numbers.
              This Public Beta product supports both Business and Individual end users.
            </p>
            <ul>
              <li>Verify toll-free numbers for SMS messaging</li>
              <li>Supports business and individual use cases</li>
              <li>Resume draft or rejected inquiries</li>
              <li>Receive email notifications on status changes</li>
            </ul>
          </div>

          <div className="card code-card">
            <h4>Backend Integration Example</h4>
            <pre className="code-block">
              {`// Initialize toll-free inquiry
const response = await client.trusthub.v1
  .complianceInquiries.tollfree.initialize
  .create({
    phoneNumberType: 'tollfree',
    endUserType: 'Business',
    isIsvEmbed: true,
    friendlyName: 'Customer ABC',
    notificationEmail: 'support@isv.com'
  });

// Returns: inquiryId, inquirySessionToken`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TollFreeDemo;
