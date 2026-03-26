import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ComplianceEmbed from './ComplianceEmbed';
import { initializeCustomerProfile, resumeCustomerProfile } from '../services/api';
import './DemoPages.css';

const CustomerProfileDemo = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [embedData, setEmbedData] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showResume, setShowResume] = useState(false);

  const [notificationEmail, setNotificationEmail] = useState('');
  const [resumeCustomerId, setResumeCustomerId] = useState('');

  const handleInitialize = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await initializeCustomerProfile({ notificationEmail });

      if (response.success) {
        setEmbedData(response.data);
        console.log('Customer ID:', response.data.customerId);
        console.log('Bundle SID:', response.data.bundleSid);
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
      const response = await resumeCustomerProfile(resumeCustomerId);

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
    setTimeout(() => navigate('/'), 3000);
  };

  if (success) {
    return (
      <div className="demo-page">
        <div className="alert alert-success">
          <h3>✅ Customer Profile Submitted!</h3>
          <p>The customer profile has been successfully submitted for review.</p>
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
          <h2>Customer Profile Inquiry</h2>
        </div>

        {embedData.customerId && (
          <div className="alert alert-info">
            <strong>Customer ID:</strong> {embedData.customerId}
            {embedData.bundleSid && (
              <>
                <br />
                <strong>Bundle SID:</strong> {embedData.bundleSid}
              </>
            )}
            <br />
            <small>Save the Customer ID to resume this inquiry later if needed.</small>
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
          <h2>Secondary Customer Profile Demo</h2>
          <p className="page-subtitle">Create customer profiles for voice products</p>
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
                Initialize New Profile
              </button>
              <button
                className={`tab-button ${showResume ? 'active' : ''}`}
                onClick={() => setShowResume(true)}
              >
                Resume Existing Profile
              </button>
            </div>

            {error && (
              <div className="alert alert-error">
                <strong>Error:</strong> {error}
              </div>
            )}

            {!showResume ? (
              <form onSubmit={handleInitialize}>
                <div className="alert alert-info">
                  <strong>Note:</strong> A Primary Customer Profile (approved, ISV/Reseller type) must be configured
                  in the backend .env file (PRIMARY_PROFILE_SID).
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

                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                  {isLoading ? 'Initializing...' : 'Initialize Customer Profile'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResume}>
                <div className="form-group">
                  <label className="form-label">
                    Customer ID <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={resumeCustomerId}
                    onChange={(e) => setResumeCustomerId(e.target.value)}
                    placeholder="e.g., tri1.us1.trusthub.AC...customer.BU..."
                    required
                  />
                  <small className="form-help">The customer ID from a previous inquiry (draft or rejected status)</small>
                </div>

                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                  {isLoading ? 'Resuming...' : 'Resume Customer Profile'}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="demo-info-section">
          <div className="card info-card">
            <h3>About Customer Profiles</h3>
            <p>
              Secondary Customer Profiles are used for voice products. ISVs can create profiles for their
              end customers to manage voice compliance requirements.
            </p>
            <ul>
              <li>Required for US voice products</li>
              <li>Links to your Primary Profile (ISV)</li>
              <li>Supports business and individual customers</li>
              <li>Resume draft or rejected profiles</li>
            </ul>
          </div>

          <div className="card code-card">
            <h4>Backend Integration Example</h4>
            <pre className="code-block">
              {`// Initialize customer profile
const response = await client.trusthub.v1
  .complianceInquiries.customers.initialize
  .create({
    primaryProfileSid: 'BU...',
    notificationEmail: 'support@isv.com'
  });

// Returns: inquiryId, inquirySessionToken,
//          customerId, bundleSid`}
            </pre>
          </div>

          <div className="card info-card">
            <h3>Prerequisites</h3>
            <ul>
              <li>Primary Customer Profile (approved)</li>
              <li>Business identity: ISV / Reseller</li>
              <li>PRIMARY_PROFILE_SID in backend .env</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfileDemo;
