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
  const [tollfreePhoneNumber, setTollfreePhoneNumber] = useState('');
  const [notificationEmail, setNotificationEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessWebsite, setBusinessWebsite] = useState('');
  const [resumeRegistrationId, setResumeRegistrationId] = useState('');

  const handleInitialize = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await initializeTollFree({
        tollfreePhoneNumber,
        notificationEmail,
        businessName: businessName || undefined,
        businessWebsite: businessWebsite || undefined
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
      <div className="demo-page demo-page-fullwidth">
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
                    Toll-free Phone Number <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    className="form-input"
                    value={tollfreePhoneNumber}
                    onChange={(e) => setTollfreePhoneNumber(e.target.value)}
                    placeholder="e.g., +18005551234"
                    required
                    pattern="\+1(800|888|877|866|855|844|833)[0-9]{7}"
                  />
                  <small className="form-help">The toll-free number to verify (E.164 format: +18XXXXXXXXX)</small>
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
                  <small className="form-help">Email to receive verification status notifications</small>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Business Name
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g., Acme Corporation"
                  />
                  <small className="form-help">Name of the business using this toll-free number (optional)</small>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Business Website
                  </label>
                  <input
                    type="url"
                    className="form-input"
                    value={businessWebsite}
                    onChange={(e) => setBusinessWebsite(e.target.value)}
                    placeholder="e.g., https://www.example.com"
                  />
                  <small className="form-help">Website of the business (optional)</small>
                </div>

                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                  {isLoading ? 'Initializing...' : 'Initialize Inquiry'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResume}>
                <div className="alert alert-error">
                  <strong>⚠️ Resume Not Supported</strong>
                  <p>Resume functionality is not currently available for US Toll-free Verification. Please complete the verification in a single session or create a new inquiry.</p>
                </div>

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
                    disabled
                  />
                  <small className="form-help">Resume is not supported for toll-free verification</small>
                </div>

                <button type="submit" className="btn btn-primary" disabled>
                  Resume Not Available
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
  .complianceTollfreeInquiries
  .create({
    tollfreePhoneNumber: '+18005551234',
    notificationEmail: 'support@isv.com',
    businessName: 'Acme Corp',
    businessWebsite: 'https://example.com'
  });

// Returns: inquiryId, inquirySessionToken, registrationId`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TollFreeDemo;
