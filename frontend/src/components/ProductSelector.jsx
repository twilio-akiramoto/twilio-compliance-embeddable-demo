import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ProductSelector.css';

const ProductSelector = () => {
  const navigate = useNavigate();

  const products = [
    {
      id: 'tollfree',
      icon: '📞',
      title: 'US Toll-free Verification',
      description: 'Verify toll-free numbers for SMS and voice messaging. Public Beta product with support for Business and Individual end users.',
      status: 'Public Beta',
      route: '/tollfree',
      docsUrl: 'https://www.twilio.com/docs/messaging/compliance/toll-free/compliance-embeddable-onboarding'
    },
    {
      id: 'customer-profile',
      icon: '🏢',
      title: 'Secondary Customer Profiles',
      description: 'Create customer profiles for voice products. Requires an approved Primary Customer Profile (ISV/Reseller type).',
      status: 'Available',
      route: '/customer-profile',
      docsUrl: 'https://www.twilio.com/docs/messaging/compliance/toll-free/compliance-embeddable-onboarding'
    },
    {
      id: 'regulatory-bundle',
      icon: '🌍',
      title: 'Regulatory Compliance Bundles',
      description: 'Register phone numbers for international markets. Supports 30+ countries across Wave 1, 2, and 3 rollouts.',
      status: 'Available',
      route: '/regulatory-bundle',
      docsUrl: 'https://www.twilio.com/docs/messaging/compliance/toll-free/compliance-embeddable-onboarding'
    },
    {
      id: 'branded-calling',
      icon: '📱',
      title: 'Branded Calling',
      description: 'Display your business name and branding on outgoing calls. Requires pilot access and Voice Integrity Bundle.',
      status: 'Pilot',
      route: '/branded-calling',
      docsUrl: 'https://www.twilio.com/docs/messaging/compliance/toll-free/compliance-embeddable-onboarding'
    },
    {
      id: 'au-alphanumeric',
      icon: '🇦🇺',
      title: 'Australia Alphanumeric Sender ID',
      description: 'Register alphanumeric sender IDs for Australian SMS messaging. Required for compliance with ACMA regulations by July 1, 2026.',
      status: 'Pilot',
      route: '/au-alphanumeric',
      docsUrl: 'https://www.twilio.com/docs/messaging/compliance/sender-id-registration'
    }
  ];

  return (
    <div className="product-selector">
      <div className="intro-section">
        <h2>Choose a Compliance Product to Demo</h2>
        <p className="intro-text">
          This demo showcases how ISVs can integrate the Twilio Compliance Embeddable to streamline customer onboarding.
          Select a product below to see the integration in action.
        </p>
      </div>

      <div className="products-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <div className="product-icon">{product.icon}</div>
            <div className="product-content">
              <div className="product-header">
                <h3 className="product-title">{product.title}</h3>
                <span className={`product-status status-${product.status.toLowerCase().replace(' ', '-')}`}>
                  {product.status}
                </span>
              </div>
              <p className="product-description">{product.description}</p>
            </div>
            <div className="product-actions">
              <button
                className="btn btn-primary product-btn"
                onClick={() => navigate(product.route)}
              >
                Start Demo
              </button>
              <a
                href={product.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="product-docs-link"
              >
                View Docs →
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="info-section card">
        <h3>How It Works</h3>
        <div className="info-steps">
          <div className="info-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>Initialize Inquiry</h4>
              <p>Your backend calls Twilio's ComplianceInquiry API to get a session token and inquiry ID</p>
            </div>
          </div>
          <div className="info-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>Render Embed</h4>
              <p>Your frontend renders the TwilioComplianceEmbed component with the session token</p>
            </div>
          </div>
          <div className="info-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>Customer Completes</h4>
              <p>Your customer fills out the compliance form directly in your application</p>
            </div>
          </div>
          <div className="info-step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h4>Get Notified</h4>
              <p>Receive callbacks and webhooks when the inquiry is submitted and reviewed</p>
            </div>
          </div>
        </div>
      </div>

      <div className="alert alert-info">
        <strong>Note:</strong> This is a reference implementation. Make sure you have valid Twilio credentials
        configured in the backend .env file before testing.
      </div>
    </div>
  );
};

export default ProductSelector;
