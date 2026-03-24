import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

// Import components
import ProductSelector from './components/ProductSelector';
import TollFreeDemo from './components/TollFreeDemo';
import CustomerProfileDemo from './components/CustomerProfileDemo';
import RegulatoryBundleDemo from './components/RegulatoryBundleDemo';
import BrandedCallingDemo from './components/BrandedCallingDemo';

function App() {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <div className="header-content">
            <Link to="/" className="header-link">
              <h1 className="app-title">Twilio ISV Compliance Embeddable Demo</h1>
            </Link>
            <p className="app-subtitle">Reference implementation for ISV customer onboarding</p>
          </div>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<ProductSelector />} />
            <Route path="/tollfree" element={<TollFreeDemo />} />
            <Route path="/customer-profile" element={<CustomerProfileDemo />} />
            <Route path="/regulatory-bundle" element={<RegulatoryBundleDemo />} />
            <Route path="/branded-calling" element={<BrandedCallingDemo />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <div className="footer-content">
            <p>
              Built with{' '}
              <a
                href="https://www.twilio.com/docs/messaging/compliance/toll-free/compliance-embeddable-onboarding"
                target="_blank"
                rel="noopener noreferrer"
              >
                Twilio Compliance Embeddable
              </a>
            </p>
            <p className="footer-note">
              For demo purposes only. See{' '}
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>{' '}
              for implementation details.
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
