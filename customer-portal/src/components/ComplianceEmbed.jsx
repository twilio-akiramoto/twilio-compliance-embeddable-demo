import React, { useState } from 'react';
import { TwilioComplianceEmbed } from '@twilio/twilio-compliance-embed';
import './ComplianceEmbed.css';

const ComplianceEmbed = ({ inquiryId, inquirySessionToken, onComplete, onError }) => {
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [events, setEvents] = useState([]);

  const addEvent = (eventName, data = {}) => {
    const timestamp = new Date().toLocaleTimeString();
    const newEvent = { timestamp, eventName, data };
    setEvents(prev => [newEvent, ...prev].slice(0, 10)); // Keep last 10 events
    console.log(`[${timestamp}] ComplianceEmbed Event:`, eventName, data);
  };

  const handleReady = () => {
    console.log('✅ Embed loaded successfully');
    setIsReady(true);
    addEvent('onReady');
  };

  const handleInquirySubmitted = (data) => {
    console.log('✅ Inquiry submitted successfully:', data);
    addEvent('onInquirySubmitted', data);
    if (onComplete) {
      onComplete(data);
    }
  };

  const handleCancel = () => {
    console.log('⚠️  User cancelled inquiry');
    addEvent('onCancel');
    if (window.confirm('Are you sure you want to cancel? Any progress will be saved and you can resume later.')) {
      window.history.back();
    }
  };

  const handleError = (error) => {
    console.error('❌ Embed error:', error);
    addEvent('onError', { error: error?.message || 'Unknown error' });
    setHasError(true);
    setErrorMessage(error?.message || 'An error occurred loading the compliance form');
    if (onError) {
      onError(error);
    }
  };

  const handleEvent = (event, metadata) => {
    console.log('📋 Event:', event, metadata);
    addEvent(event, metadata);
  };

  if (!inquiryId || !inquirySessionToken) {
    return (
      <div className="embed-container">
        <div className="alert alert-error">
          <strong>Error:</strong> Missing inquiry ID or session token. Please initialize an inquiry first.
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="embed-container">
        <div className="alert alert-error">
          <strong>Error Loading Compliance Form:</strong>
          <p>{errorMessage}</p>
          <button
            className="btn btn-secondary"
            onClick={() => window.history.back()}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="embed-container">
      {!isReady && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="spinner"></div>
            <p className="loading-text">Loading compliance form...</p>
          </div>
        </div>
      )}

      <div className={`embed-wrapper ${!isReady ? 'embed-loading' : ''}`}>
        <TwilioComplianceEmbed
          inquiryId={inquiryId}
          inquirySessionToken={inquirySessionToken}
          onReady={handleReady}
          onInquirySubmitted={handleInquirySubmitted}
          onCancel={handleCancel}
          onError={handleError}
          onEvent={handleEvent}
          widgetPadding={{ top: 48, bottom: 48, left: 48, right: 48 }}
        />
      </div>

      {/* Event Log for Demo Purposes */}
      {process.env.REACT_APP_ENABLE_LOGGING === 'true' && events.length > 0 && (
        <div className="event-log card">
          <h4>Event Log (Demo)</h4>
          <div className="events-list">
            {events.map((event, index) => (
              <div key={index} className="event-item">
                <span className="event-time">{event.timestamp}</span>
                <span className="event-name">{event.eventName}</span>
                {Object.keys(event.data).length > 0 && (
                  <span className="event-data">{JSON.stringify(event.data)}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplianceEmbed;
