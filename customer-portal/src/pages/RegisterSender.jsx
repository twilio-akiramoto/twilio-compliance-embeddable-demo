import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, createAuAlphanumericRegistration, updateRegistration } from '../services/portal';
import ComplianceEmbed from '../components/ComplianceEmbed';
import { AU_SENDER_ID_PROOF_TYPES, AU_USE_CASE_CATEGORIES, AU_MESSAGE_VOLUMES, COUNTRIES } from '../utils/constants';
import '../styles/RegisterSender.css';

export default function RegisterSender() {
  const [profile, setProfile] = useState(null);
  const [senderId, setSenderId] = useState('');
  const [headquartersCountry, setHeadquartersCountry] = useState('US');
  const [useCaseCategory, setUseCaseCategory] = useState('');
  const [messageVolume, setMessageVolume] = useState('');
  const [proofType, setProofType] = useState('');
  const [inquirySession, setInquirySession] = useState(null);
  const [currentRegistration, setCurrentRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getProfile();
      setProfile(data);
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // Create registration in database
      const registration = await createAuAlphanumericRegistration({
        senderId,
        headquartersCountry,
        useCaseCategory,
        messageVolume,
        proofType
      });

      setCurrentRegistration(registration);

      // Initialize Twilio Compliance Embeddable
      const response = await fetch(`${process.env.REACT_APP_API_URL}/compliance/au-alphanumeric/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('customerPortalToken')}`
        },
        body: JSON.stringify({
          senderId,
          businessName: profile.customer.businessName,
          businessWebsite: profile.customer.businessWebsite || '',
          headquartersCountry,
          useCaseCategory,
          messageVolume,
          proofType
        })
      });

      const result = await response.json();

      if (result.success) {
        // Update registration with Twilio IDs
        await updateRegistration(registration.id, {
          twilioRegistrationId: result.data.registrationId,
          twilioInquiryId: result.data.inquiryId,
          status: 'in_progress'
        });

        setInquirySession(result.data.inquirySession);
      } else {
        throw new Error(result.error || 'Failed to initialize registration');
      }
    } catch (err) {
      setError(err.message || 'Failed to start registration');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInquirySubmitted = async () => {
    console.log('Inquiry submitted!');

    try {
      if (currentRegistration) {
        await updateRegistration(currentRegistration.id, {
          status: 'approved',
          completedAt: new Date().toISOString()
        });
      }

      alert('Registration submitted successfully! Redirecting to dashboard...');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      console.error('Failed to update registration status:', err);
    }
  };

  if (loading) {
    return (
      <div className="register-sender-container">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          Loading...
        </div>
      </div>
    );
  }

  if (inquirySession) {
    return (
      <div className="register-sender-container">
        <div className="embed-header">
          <h1>Complete Your Registration</h1>
          <p>Fill out the form below to complete your sender ID registration</p>
        </div>

        <div className="embed-container">
          <ComplianceEmbed
            inquirySession={inquirySession}
            onInquirySubmitted={handleInquirySubmitted}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="register-sender-container">
      <div className="register-sender-card">
        <div className="card-header">
          <h1>Australia Alphanumeric Sender ID Registration</h1>
          <p>Register a new sender ID for SMS messaging in Australia</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-secondary"
          >
            Back to Dashboard
          </button>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="registration-form">
          <div className="form-section">
            <h3>Business Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Business Name</label>
                <input
                  type="text"
                  value={profile?.customer?.businessName || ''}
                  disabled
                  className="input-disabled"
                />
              </div>
              <div className="form-group">
                <label>Business Website</label>
                <input
                  type="text"
                  value={profile?.customer?.businessWebsite || 'Not provided'}
                  disabled
                  className="input-disabled"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Sender ID Details</h3>

            <div className="form-group">
              <label htmlFor="senderId">Sender ID *</label>
              <input
                type="text"
                id="senderId"
                value={senderId}
                onChange={(e) => setSenderId(e.target.value)}
                required
                placeholder="e.g., ACME"
                minLength={2}
                maxLength={11}
                pattern=".*[a-zA-Z].*"
                disabled={submitting}
              />
              <small>2-11 characters, must contain at least one letter</small>
            </div>

            <div className="form-group">
              <label htmlFor="headquartersCountry">Business Headquarters Country *</label>
              <select
                id="headquartersCountry"
                value={headquartersCountry}
                onChange={(e) => setHeadquartersCountry(e.target.value)}
                required
                disabled={submitting}
              >
                {COUNTRIES.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="useCaseCategory">Use Case Category *</label>
              <select
                id="useCaseCategory"
                value={useCaseCategory}
                onChange={(e) => setUseCaseCategory(e.target.value)}
                required
                disabled={submitting}
              >
                <option value="">Select a category</option>
                {AU_USE_CASE_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="messageVolume">Expected Message Volume *</label>
              <select
                id="messageVolume"
                value={messageVolume}
                onChange={(e) => setMessageVolume(e.target.value)}
                required
                disabled={submitting}
              >
                <option value="">Select volume range</option>
                {AU_MESSAGE_VOLUMES.map((volume) => (
                  <option key={volume} value={volume}>
                    {volume}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="proofType">Sender ID Proof Type *</label>
              <select
                id="proofType"
                value={proofType}
                onChange={(e) => setProofType(e.target.value)}
                required
                disabled={submitting}
              >
                <option value="">Select proof type</option>
                {AU_SENDER_ID_PROOF_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Starting Registration...' : 'Start Registration'}
          </button>
        </form>
      </div>
    </div>
  );
}
