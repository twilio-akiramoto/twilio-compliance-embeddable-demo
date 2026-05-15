import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ComplianceEmbed from './ComplianceEmbed';
import { initializeAustraliaAlphanumeric, resumeAustraliaAlphanumeric } from '../services/api';
import { AU_SENDER_ID_PROOF_TYPES, AU_USE_CASE_CATEGORIES, AU_MESSAGE_VOLUMES, COUNTRIES } from '../utils/constants';
import './DemoPages.css';

const AustraliaAlphanumericDemo = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [embedData, setEmbedData] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showResume, setShowResume] = useState(false);

  const [friendlyName, setFriendlyName] = useState('');
  const [notificationEmail, setNotificationEmail] = useState('');
  const [senderId, setSenderId] = useState('');
  const [proofOfSenderId, setProofOfSenderId] = useState('');
  const [headquartersCountry, setHeadquartersCountry] = useState('US');
  const [businessName, setBusinessName] = useState('');
  const [businessWebsite, setBusinessWebsite] = useState('');
  const [useCaseCategory, setUseCaseCategory] = useState('PROMOTIONAL');
  const [messageVolume, setMessageVolume] = useState('');
  const [resumeRegistrationId, setResumeRegistrationId] = useState('');

  const handleInitialize = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const requestData = {
        friendlyName,
        notificationEmail,
        senderId: senderId.toUpperCase(),
        headquartersCountry
      };

      if (proofOfSenderId) requestData.proofOfSenderId = proofOfSenderId;
      if (businessName) requestData.businessName = businessName;
      if (businessWebsite) requestData.businessWebsite = businessWebsite;
      if (useCaseCategory) requestData.useCaseCategory = useCaseCategory;
      if (messageVolume) requestData.messageVolume = messageVolume;

      const response = await initializeAustraliaAlphanumeric(requestData);

      if (response.success) {
        // Check if mock mode is being used
        if (response.data._isMock) {
          setError(
            '⚠️ Mock Mode Active: The Australia Alphanumeric Sender ID API is not yet available in production. ' +
            'The backend returned a mock response. To use the real API, contact Twilio Support to enable this feature for your account, ' +
            'then set AU_ALPHANUMERIC_MOCK_MODE=false in backend/.env'
          );
          console.log('Mock Registration ID:', response.data.registrationId);
        } else {
          setEmbedData(response.data);
          console.log('Registration ID:', response.data.registrationId);
        }
      } else {
        setError(response.error || 'Failed to initialize registration');
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
      const response = await resumeAustraliaAlphanumeric(resumeRegistrationId);

      if (response.success) {
        setEmbedData(response.data);
      } else {
        setError(response.error || 'Failed to resume registration');
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
          <h3>✅ Australia Alphanumeric Sender ID Submitted!</h3>
          <p>The sender ID registration has been successfully submitted for review.</p>
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
          <h2>Australia Alphanumeric Sender ID Registration</h2>
        </div>

        {embedData.registrationId && (
          <div className="alert alert-info">
            <strong>Registration ID:</strong> {embedData.registrationId}
            <br />
            <small>Save the Registration ID to resume this inquiry later if needed.</small>
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
          <h2>Australia Alphanumeric Sender ID Demo</h2>
          <p className="page-subtitle">Register alphanumeric sender IDs for Australian SMS messaging</p>
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
                Initialize New Registration
              </button>
              <button
                className={`tab-button ${showResume ? 'active' : ''}`}
                onClick={() => setShowResume(true)}
              >
                Resume Existing Registration
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
                    placeholder="e.g., Customer ABC - Marketing Sender"
                    required
                  />
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
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Alphanumeric Sender ID <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={senderId}
                    onChange={(e) => setSenderId(e.target.value)}
                    placeholder="e.g., MYCOMPANY"
                    maxLength={11}
                    pattern="[a-zA-Z0-9]{2,11}"
                    required
                  />
                  <small className="form-help">2-11 alphanumeric characters, must contain at least one letter</small>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Headquarters Country <span className="required">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={headquartersCountry}
                    onChange={(e) => setHeadquartersCountry(e.target.value)}
                    required
                  >
                    {COUNTRIES.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                  <small className="form-help">Country where your business is headquartered</small>
                </div>

                <div className="form-group">
                  <label className="form-label">Proof of Sender ID</label>
                  <select
                    className="form-select"
                    value={proofOfSenderId}
                    onChange={(e) => setProofOfSenderId(e.target.value)}
                  >
                    <option value="">Select proof type (optional)</option>
                    {AU_SENDER_ID_PROOF_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Business Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g., My Business Inc"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Business Website</label>
                  <input
                    type="url"
                    className="form-input"
                    value={businessWebsite}
                    onChange={(e) => setBusinessWebsite(e.target.value)}
                    placeholder="e.g., https://example.com"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Use Case Category</label>
                  <div className="radio-group">
                    {AU_USE_CASE_CATEGORIES.map((category) => (
                      <div key={category.value} className="radio-option">
                        <input
                          type="radio"
                          id={`useCase-${category.value}`}
                          name="useCaseCategory"
                          value={category.value}
                          checked={useCaseCategory === category.value}
                          onChange={(e) => setUseCaseCategory(e.target.value)}
                        />
                        <label htmlFor={`useCase-${category.value}`}>{category.label}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Average Monthly Message Volume</label>
                  <select
                    className="form-select"
                    value={messageVolume}
                    onChange={(e) => setMessageVolume(e.target.value)}
                  >
                    <option value="">Select volume (optional)</option>
                    {AU_MESSAGE_VOLUMES.map((volume) => (
                      <option key={volume.value} value={volume.value}>
                        {volume.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                  {isLoading ? 'Initializing...' : 'Initialize Registration'}
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
                    placeholder="e.g., RG..."
                    required
                  />
                  <small className="form-help">The registration ID from a previous inquiry</small>
                </div>

                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                  {isLoading ? 'Resuming...' : 'Resume Registration'}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="demo-info-section">
          <div className="card info-card">
            <h3>About Australia Alphanumeric Sender ID</h3>
            <p>
              Register alphanumeric sender IDs for Australian SMS messaging in compliance with ACMA regulations.
              Required for all sender IDs by July 1, 2026.
            </p>
            <ul>
              <li>ISV-specific registration for customer tenants</li>
              <li>2-11 alphanumeric characters with at least one letter</li>
              <li>Proof of sender ID ownership required</li>
              <li>Supports promotional and transactional messaging</li>
            </ul>
          </div>

          <div className="card code-card">
            <h4>Backend Integration Example</h4>
            <pre className="code-block">
              {`// Initialize AU Alphanumeric Sender ID
const url = 'https://numbers.twilio.com/v1/
  SenderIdRegistrations';

const response = await axios.post(url, {
  regulationId: 'RNa8ade60e2a607e62a802f4e6facc887a',
  regulationVersion: 1,
  friendlyName: 'Customer ABC - Sender',
  statusNotificationEmail: 'support@isv.com',
  data: {
    alphanumericSender: { senderId: 'MYCOMPANY' },
    business: {
      businessIdentity: 'ISV',
      isSubassigned: 'YES'
    }
  }
}, { auth: { username: sid, password: token }});`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AustraliaAlphanumericDemo;
