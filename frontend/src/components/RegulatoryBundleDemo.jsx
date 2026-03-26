import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ComplianceEmbed from './ComplianceEmbed';
import { initializeRegulatoryBundle, resumeRegulatoryBundle } from '../services/api';
import { COUNTRIES, RC_NUMBER_TYPES, RC_END_USER_TYPES } from '../utils/constants';
import './DemoPages.css';

const RegulatoryBundleDemo = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [embedData, setEmbedData] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showResume, setShowResume] = useState(false);

  const [friendlyName, setFriendlyName] = useState('');
  const [notificationEmail, setNotificationEmail] = useState('');
  const [country, setCountry] = useState('US');
  const [numberType, setNumberType] = useState('LOCAL_PHONE_NUMBER');
  const [endUserType, setEndUserType] = useState('BUSINESS');
  const [regulationSid, setRegulationSid] = useState('');
  const [useRegulationSid, setUseRegulationSid] = useState(false);
  const [resumeRegistrationId, setResumeRegistrationId] = useState('');

  const handleInitialize = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const requestData = {
        friendlyName,
        notificationEmail
      };

      if (useRegulationSid) {
        requestData.regulationSid = regulationSid;
      } else {
        requestData.country = country;
        requestData.numberType = numberType;
        requestData.endUserType = endUserType;
      }

      const response = await initializeRegulatoryBundle(requestData);

      if (response.success) {
        setEmbedData(response.data);
        console.log('Registration ID:', response.data.complianceRegistrationId);
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
      const response = await resumeRegulatoryBundle(resumeRegistrationId);

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
          <h3>✅ Regulatory Bundle Submitted!</h3>
          <p>The regulatory compliance bundle has been successfully submitted for review.</p>
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
          <h2>Regulatory Compliance Bundle Inquiry</h2>
        </div>

        {embedData.complianceRegistrationId && (
          <div className="alert alert-info">
            <strong>Registration ID:</strong> {embedData.complianceRegistrationId}
            {embedData.bundleSid && (
              <>
                <br />
                <strong>Bundle SID:</strong> {embedData.bundleSid}
              </>
            )}
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
          <h2>Regulatory Compliance Bundle Demo</h2>
          <p className="page-subtitle">Register phone numbers for international markets</p>
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
                Initialize New Bundle
              </button>
              <button
                className={`tab-button ${showResume ? 'active' : ''}`}
                onClick={() => setShowResume(true)}
              >
                Resume Existing Bundle
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
                    placeholder="e.g., Customer ABC - UK Local"
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
                    <input
                      type="checkbox"
                      checked={useRegulationSid}
                      onChange={(e) => setUseRegulationSid(e.target.checked)}
                      style={{ marginRight: '0.5rem' }}
                    />
                    Use Regulation SID (Advanced)
                  </label>
                </div>

                {useRegulationSid ? (
                  <div className="form-group">
                    <label className="form-label">Regulation SID</label>
                    <input
                      type="text"
                      className="form-input"
                      value={regulationSid}
                      onChange={(e) => setRegulationSid(e.target.value)}
                      placeholder="e.g., RN..."
                    />
                    <small className="form-help">Optional: Provide specific Regulation SID</small>
                  </div>
                ) : (
                  <>
                    <div className="form-group">
                      <label className="form-label">Country</label>
                      <select
                        className="form-select"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                      >
                        {COUNTRIES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.name} ({c.code}) - Wave {c.wave}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Phone Number Type</label>
                      <select
                        className="form-select"
                        value={numberType}
                        onChange={(e) => setNumberType(e.target.value)}
                      >
                        {RC_NUMBER_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">End User Type</label>
                      <div className="radio-group">
                        {RC_END_USER_TYPES.map((type) => (
                          <div key={type.value} className="radio-option">
                            <input
                              type="radio"
                              id={`endUserType-${type.value}`}
                              name="endUserType"
                              value={type.value}
                              checked={endUserType === type.value}
                              onChange={(e) => setEndUserType(e.target.value)}
                            />
                            <label htmlFor={`endUserType-${type.value}`}>{type.label}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                  {isLoading ? 'Initializing...' : 'Initialize Bundle'}
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
                    placeholder="e.g., tri1.us1.account.AC...registration.BU..."
                    required
                  />
                  <small className="form-help">The registration ID from a previous inquiry</small>
                </div>

                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                  {isLoading ? 'Resuming...' : 'Resume Bundle'}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="demo-info-section">
          <div className="card info-card">
            <h3>About Regulatory Bundles</h3>
            <p>
              Regulatory Compliance Bundles are required for phone number registration in international markets.
              Supports 30+ countries across three rollout waves.
            </p>
            <ul>
              <li>Wave 1: AU, BR, DE, MX, ES (Dec 2024)</li>
              <li>Wave 2: Most countries (Jan 2025)</li>
              <li>Wave 3: JP, SV, FR, KE, RO (Feb 2025)</li>
            </ul>
          </div>

          <div className="card code-card">
            <h4>Backend Integration Example</h4>
            <pre className="code-block">
              {`// Initialize RC bundle
const url = 'https://trusthub.twilio.com/v3/
  ComplianceRegistrations/InitializeInquiry?
  ComplianceRegulationCountry=US&
  ComplianceRegulationSubType=LOCAL&
  ComplianceRegulationEndUserType=BUSINESS';

const response = await axios.post(url, {
  data: {
    type: 'ComplianceRegistration',
    attributes: {
      friendly_name: 'Customer ABC',
      status_notification_email: 'support@isv.com'
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

export default RegulatoryBundleDemo;
