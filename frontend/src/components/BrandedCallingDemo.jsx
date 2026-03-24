import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ComplianceEmbed from './ComplianceEmbed';
import { initializeBrandedCalling } from '../services/api';
import './DemoPages.css';

const BrandedCallingDemo = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [embedData, setEmbedData] = useState(null);
  const [success, setSuccess] = useState(false);

  const [viSid, setViSid] = useState('');
  const [pnSids, setPnSids] = useState('');
  const [legalBusinessName, setLegalBusinessName] = useState('');
  const [shortDisplayName, setShortDisplayName] = useState('');
  const [longDisplayName, setLongDisplayName] = useState('');
  const [purposeOfCall, setPurposeOfCall] = useState('');

  const handleInitialize = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Parse comma-separated phone number SIDs
      const pnSidsArray = pnSids
        .split(',')
        .map(sid => sid.trim())
        .filter(sid => sid.length > 0);

      if (pnSidsArray.length === 0) {
        throw new Error('At least one Phone Number SID is required');
      }

      if (pnSidsArray.length > 28) {
        throw new Error('Maximum 28 Phone Number SIDs allowed');
      }

      const requestData = {
        viSid,
        pnSids: pnSidsArray
      };

      // Add optional fields if provided
      if (legalBusinessName) requestData.legalBusinessName = legalBusinessName;
      if (shortDisplayName) requestData.shortDisplayName = shortDisplayName;
      if (longDisplayName) requestData.longDisplayName = longDisplayName;
      if (purposeOfCall) requestData.purposeOfCall = purposeOfCall;

      const response = await initializeBrandedCalling(requestData);

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

  const handleComplete = () => {
    setSuccess(true);
    setTimeout(() => navigate('/'), 3000);
  };

  if (success) {
    return (
      <div className="demo-page">
        <div className="alert alert-success">
          <h3>✅ Branded Calling Submitted!</h3>
          <p>The branded calling inquiry has been successfully submitted for review.</p>
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
          <h2>Branded Calling Inquiry</h2>
        </div>

        {embedData.registrationId && (
          <div className="alert alert-info">
            <strong>Registration ID:</strong> {embedData.registrationId}
            <br />
            <small>Note: This inquiry must be completed in a single session. Resume is not supported.</small>
          </div>
        )}

        <div className="warning-box">
          <strong>⚠️ Important:</strong>
          <p>Branded Calling inquiries must be completed in a single session. If you close this page before completing the form, you will need to start over.</p>
        </div>

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
          <h2>Branded Calling Demo</h2>
          <p className="page-subtitle">Display your business branding on outgoing calls</p>
        </div>
      </div>

      <div className="demo-content">
        <div className="demo-form-section">
          <div className="card">
            <div className="alert alert-warning">
              <strong>Pilot Product:</strong> Branded Calling requires pilot access. Check with your Twilio
              Account Manager to see if you're eligible.
            </div>

            {error && (
              <div className="alert alert-error">
                <strong>Error:</strong> {error}
              </div>
            )}

            <form onSubmit={handleInitialize}>
              <div className="form-group">
                <label className="form-label">
                  Voice Integrity Bundle SID <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={viSid}
                  onChange={(e) => setViSid(e.target.value)}
                  placeholder="e.g., BU..."
                  required
                />
                <small className="form-help">The SID of your Voice Integrity Bundle</small>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Phone Number SIDs <span className="required">*</span>
                </label>
                <textarea
                  className="form-textarea"
                  value={pnSids}
                  onChange={(e) => setPnSids(e.target.value)}
                  placeholder="e.g., PN..., PN..., PN..."
                  rows={4}
                  required
                />
                <small className="form-help">
                  Comma-separated list of Phone Number SIDs (max 28). Example: PN1234..., PN5678...
                </small>
              </div>

              <div className="alert alert-info">
                <strong>Optional Pre-fill Fields:</strong> The fields below will be shown to users in the form.
                Pre-filling them can speed up the process.
              </div>

              <div className="form-group">
                <label className="form-label">Legal Business Name (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  value={legalBusinessName}
                  onChange={(e) => setLegalBusinessName(e.target.value)}
                  placeholder="e.g., Your Company Inc."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Short Display Name (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  value={shortDisplayName}
                  onChange={(e) => setShortDisplayName(e.target.value)}
                  placeholder="e.g., YourCompany"
                  maxLength={15}
                />
                <small className="form-help">Max 15 characters. Default display name on outgoing calls.</small>
              </div>

              <div className="form-group">
                <label className="form-label">Long Display Name (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  value={longDisplayName}
                  onChange={(e) => setLongDisplayName(e.target.value)}
                  placeholder="e.g., Your Company Customer Service"
                  maxLength={32}
                />
                <small className="form-help">Max 32 characters. Used on supported carriers.</small>
              </div>

              <div className="form-group">
                <label className="form-label">Purpose of Call (Optional)</label>
                <textarea
                  className="form-textarea"
                  value={purposeOfCall}
                  onChange={(e) => setPurposeOfCall(e.target.value)}
                  placeholder="e.g., Customer support and service calls"
                  rows={3}
                />
              </div>

              <div className="warning-box">
                <strong>⚠️ No Resume Support:</strong>
                <p>Branded Calling must be completed in a single session. Make sure you have all required information before starting.</p>
              </div>

              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? 'Initializing...' : 'Initialize Branded Calling'}
              </button>
            </form>
          </div>
        </div>

        <div className="demo-info-section">
          <div className="card info-card">
            <h3>About Branded Calling</h3>
            <p>
              Branded Calling displays your business name and branding information on outgoing calls,
              increasing answer rates and customer trust.
            </p>
            <ul>
              <li>Display business name on caller ID</li>
              <li>Increase call answer rates</li>
              <li>Build customer trust</li>
              <li>Requires Voice Integrity Bundle</li>
            </ul>
          </div>

          <div className="card code-card">
            <h4>Backend Integration Example</h4>
            <pre className="code-block">
              {`// Initialize branded calling
const response = await client.trusthub.v1
  .complianceInquiries.brandedCalling
  .initialize.create({
    viSid: 'BU...',
    pnSids: ['PN...', 'PN...'],
    legalBusinessName: 'Your Company',
    shortDisplayName: 'YourCompany',
    longDisplayName: 'Your Company Support',
    purposeOfCall: 'Customer support'
  });

// Returns: inquiryId, inquirySessionToken`}
            </pre>
          </div>

          <div className="card info-card">
            <h3>Prerequisites</h3>
            <ul>
              <li>Pilot access approval required</li>
              <li>Voice Integrity Bundle (ViSid)</li>
              <li>Phone Numbers to verify (PnSids)</li>
              <li>Must complete in single session</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandedCallingDemo;
