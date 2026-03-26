# Twilio ISV Compliance Embeddable Demo

A reference implementation demonstrating how ISVs can integrate the Twilio Compliance Embeddable to streamline customer onboarding across four compliance products.

## 🎯 Supported Products

- **US Toll-free Verification** (Public Beta) - Verify toll-free numbers for SMS messaging
- **Secondary Customer Profiles** - Create customer profiles for voice products
- **Regulatory Compliance Bundles** - Register phone numbers for 30+ international markets
- **Branded Calling** (Pilot) - Display business branding on outgoing calls

## 🏗️ Architecture

This demo consists of two main components:

### Backend (Node.js/Express)
- Initializes ComplianceInquiry sessions via Twilio APIs
- Returns session tokens and inquiry IDs to frontend
- Provides endpoints for initialize and resume operations
- In-memory storage for demo purposes

### Frontend (React)
- Renders the TwilioComplianceEmbed iframe component
- Handles all embed callbacks (onReady, onInquirySubmitted, onCancel, onError)
- Product-specific configuration forms
- Clean, intuitive UI for navigation

## 📋 Prerequisites

### Twilio Account Requirements

1. **For all products:**
   - Twilio account with access to Compliance APIs
   - Account SID and Auth Token

2. **For Secondary Customer Profiles:**
   - Primary Customer Profile (approved status)
   - Business identity type: ISV / Reseller

3. **For Branded Calling:**
   - Pilot access (contact your Account Manager)
   - Voice Integrity Bundle SID
   - Phone Number SIDs to verify

### Development Environment

- Node.js 18+
- npm or yarn
- Git

## 🚀 Installation

### 1. Clone the Repository

```bash
cd /Users/akiramoto/Documents/Github/twilio-compliance-embeddable-demo
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4. Configure Environment Variables

#### Backend Configuration

```bash
cd backend
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
PORT=3001
NODE_ENV=development

# Twilio Credentials (REQUIRED)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here

# For Secondary Customer Profiles (OPTIONAL - only if using this product)
PRIMARY_PROFILE_SID=BUxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

#### Frontend Configuration

```bash
cd ../frontend
cp .env.example .env
```

The default values should work:

```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_ENABLE_LOGGING=true
```

## 🎮 Running the Demo

### Option 1: Run Both Servers Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm start
# or for auto-reload during development:
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### Option 2: Run Both Together (requires root setup)

From the root directory:

```bash
npm install  # installs concurrently
npm run dev  # runs both backend and frontend
```

The application will be available at:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **Health Check:** http://localhost:3001/health

## 📖 Using the Demo

### 1. Navigate to Landing Page

Open http://localhost:3000 to see the product selector with four cards.

### 2. Choose a Product

Click "Start Demo" on any product card to begin.

### 3. Initialize an Inquiry

Fill out the form with required information:
- **Friendly Name:** A descriptive name for tracking
- **Notification Email:** Where to receive status updates
- Product-specific fields (varies by product)

Click **"Initialize Inquiry"** to create a new compliance session.

### 4. Complete the Embedded Form

The Twilio Compliance Embeddable will load with the compliance form. Your customer would fill this out with their KYC information.

### 5. Submit and Track

After submission:
- You'll see a success message
- Email notifications will be sent to the configured address
- The inquiry enters review status

### 6. Resume Draft/Rejected Inquiries (Where Supported)

Products that support resume functionality:
- ✅ Toll-free Verification
- ✅ Customer Profiles
- ✅ Regulatory Bundles
- ❌ Branded Calling (must complete in single session)

To resume:
1. Switch to the "Resume" tab
2. Enter the Registration/Customer ID from the original inquiry
3. Click "Resume Inquiry"

## 🔧 API Endpoints

### Toll-free Verification

```
POST /api/compliance/tollfree/initialize
POST /api/compliance/tollfree/resume  (Not currently supported by Twilio API)
```

**Note:** Resume functionality is not available for US Toll-free Verification as of Twilio SDK v4.20.0. Verifications must be completed in a single session.

### Customer Profiles

```
POST /api/compliance/customer-profile/initialize
POST /api/compliance/customer-profile/resume
```

### Regulatory Bundles

```
POST /api/compliance/regulatory-bundle/initialize
POST /api/compliance/regulatory-bundle/resume
```

### Branded Calling

```
POST /api/compliance/branded-calling/initialize
```

### Inquiry Management

```
GET /api/compliance/inquiries
GET /api/compliance/inquiries/:id
```

## 🗂️ Project Structure

```
twilio-compliance-embeddable-demo/
├── backend/
│   ├── config/
│   │   └── twilio.js              # Twilio client initialization
│   ├── routes/
│   │   └── compliance.js           # API route handlers
│   ├── services/
│   │   ├── tollfree.service.js
│   │   ├── customer-profile.service.js
│   │   ├── regulatory-bundle.service.js
│   │   └── branded-calling.service.js
│   ├── utils/
│   │   └── storage.js              # In-memory inquiry storage
│   ├── server.js                   # Express server
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ProductSelector.jsx
    │   │   ├── ComplianceEmbed.jsx    # Reusable embed wrapper
    │   │   ├── TollFreeDemo.jsx
    │   │   ├── CustomerProfileDemo.jsx
    │   │   ├── RegulatoryBundleDemo.jsx
    │   │   └── BrandedCallingDemo.jsx
    │   ├── services/
    │   │   └── api.js                 # Axios API client
    │   ├── utils/
    │   │   └── constants.js
    │   ├── App.js                     # Main app with routing
    │   └── index.js
    ├── package.json
    └── .env.example
```

## 🎨 Key Integration Points

### Backend: Initialize ComplianceInquiry

```javascript
// US Toll-free Verification
const response = await client.trusthub.v1.complianceTollfreeInquiries
  .create({
    tollfreePhoneNumber: '+18005551234',  // Required: E.164 format
    notificationEmail: 'support@isv.com', // Required
    businessName: 'Acme Corporation',     // Optional
    businessWebsite: 'https://acme.com'   // Optional
  });

// Returns: { inquiryId, inquirySessionToken, registrationId, url }
```

### Frontend: Render Embed

```jsx
import { TwilioComplianceEmbed } from '@twilio/twilio-compliance-embed';

<TwilioComplianceEmbed
  inquiryId={inquiryId}
  inquirySessionToken={inquirySessionToken}
  onReady={() => console.log('Ready')}
  onInquirySubmitted={() => handleSuccess()}
  onCancel={() => handleCancel()}
  onError={(error) => handleError(error)}
/>
```

## 🐛 Troubleshooting

### Backend won't start

**Error:** `Missing required environment variables`

**Solution:** Make sure you've copied `.env.example` to `.env` and filled in your Twilio credentials.

```bash
cd backend
cp .env.example .env
# Edit .env with your credentials
```

---

**Error:** `TWILIO_ACCOUNT_SID not configured`

**Solution:** Ensure your `.env` file has valid Twilio credentials without quotes:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
```

### Frontend build errors

**Error:** `Cannot find module '@twilio/twilio-compliance-embed'`

**Solution:** Reinstall frontend dependencies:

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Customer Profile initialization fails

**Error:** `PRIMARY_PROFILE_SID not configured`

**Solution:** You need an approved Primary Customer Profile. Add it to backend `.env`:

```env
PRIMARY_PROFILE_SID=BUxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

To create a Primary Customer Profile:
1. Log into Twilio Console
2. Navigate to Trust Hub
3. Create a Primary Customer Profile
4. Select business type: ISV / Reseller
5. Wait for approval

### Embed iframe not loading

**Error:** Embed shows loading spinner indefinitely

**Possible causes:**
1. **Invalid session token** - Token may have expired (1440 min lifetime)
2. **CORS issues** - Check that backend FRONTEND_URL matches your frontend URL
3. **Network issues** - Check browser console for errors

**Solution:**
- Check browser console for specific error messages
- Verify network tab shows successful API calls
- Try initializing a new inquiry

### Regulatory Bundle country not supported

**Error:** Country selection leads to initialization failure

**Solution:** Check the Wave rollout schedule:
- Wave 1: AU, BR, DE, MX, ES
- Wave 2: Most countries (30+)
- Wave 3: JP, SV, FR, KE, RO

Some countries may not yet be supported.

## 📚 Additional Resources

- [Twilio Compliance Embeddable Documentation](https://www.twilio.com/docs/messaging/compliance/toll-free/compliance-embeddable-onboarding)
- [TrustHub API Reference](https://www.twilio.com/docs/trust-hub/api)
- [Toll-free Verification Guide](https://www.twilio.com/docs/sms/guide/toll-free-verification)
- [Regulatory Bundles Guide](https://support.twilio.com/hc/en-us/articles/1260803965530-Twilio-s-Regulatory-Bundle-resource)

## 🔐 Security Considerations

### For Production Deployments

1. **Never expose Twilio credentials to frontend**
   - Keep Account SID and Auth Token server-side only
   - Session tokens are ephemeral and safe to pass to frontend

2. **Implement authentication**
   - Add user authentication before allowing inquiry initialization
   - Verify user permissions for each operation

3. **Use HTTPS in production**
   - Configure SSL/TLS certificates
   - Update CORS settings for production domain

4. **Validate webhook signatures**
   - When implementing status callbacks, validate Twilio's signature
   - See: https://www.twilio.com/docs/usage/webhooks/webhooks-security

5. **Replace in-memory storage**
   - Use a proper database (PostgreSQL, MongoDB, etc.)
   - Implement data retention policies

6. **Rate limiting**
   - Add rate limiting to API endpoints
   - Prevent abuse and excessive API calls

## 🚢 Deployment

### Backend Deployment

The backend can be deployed to any Node.js hosting service:
- Heroku
- AWS (EC2, Lambda, Elastic Beanstalk)
- Google Cloud Platform
- Digital Ocean
- Fly.io

Make sure to:
1. Set environment variables in your hosting platform
2. Configure CORS for your frontend domain
3. Set up health check monitoring on `/health`

### Frontend Deployment

The frontend can be deployed as a static site:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

Build command:
```bash
cd frontend
npm run build
```

Set `REACT_APP_API_URL` to your production backend URL.

## 🤝 Contributing

This is a reference implementation for demonstration purposes. Feel free to:
- Fork and customize for your needs
- Add additional features (database persistence, authentication, etc.)
- Improve error handling and UX
- Add tests

## 📄 License

MIT License - feel free to use this code as a starting point for your own ISV implementation.

## 💬 Support

For questions about:
- **This demo:** Open an issue in the GitHub repository
- **Twilio Compliance Embeddable:** Contact Twilio Support or your Account Manager
- **TrustHub/Compliance:** See Twilio documentation links above

---

**Built with ❤️ using Twilio Compliance Embeddable**
