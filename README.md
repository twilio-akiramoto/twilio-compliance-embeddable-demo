Documentation:

https://www.twilio.com/docs/messaging/compliance/toll-free/compliance-embeddable-onboarding

Twilio Internal guide to implement - reach out to your Twilio SE for access.
https://docs.google.com/document/d/1o_K-1eXUysI_TIiJcmH9k7g_ss1CAwKZvY1oTiJUZVg/edit?tab=t.0#heading=h.z8cazyah9biw

# Twilio ISV Compliance Embeddable Demo

A complete reference implementation demonstrating how ISVs can integrate the Twilio Compliance Embeddable to streamline customer onboarding. Includes a full customer lifecycle management system with three applications:

- **ISV Demo Dashboard** - Test and explore all compliance products
- **Customer Portal** - End-customer registration via email invitation
- **CSM Dashboard** - ISV team monitors customer onboarding progress

## 🎯 Supported Products

- **US Toll-free Verification** (Public Beta) - Verify toll-free numbers for SMS messaging
- **Secondary Customer Profiles** - Create customer profiles for voice products
- **Regulatory Compliance Bundles** - Register phone numbers for 30+ international markets
- **Branded Calling** (Pilot) - Display business branding on outgoing calls
- **Australia Alphanumeric Sender ID** (NEW) - Register alphanumeric sender IDs for Australian SMS compliance (ACMA regulations)

> **Note:** Australia Alphanumeric Sender ID is in pilot and includes a mock mode for testing. See [AU_ALPHANUMERIC_README.md](AU_ALPHANUMERIC_README.md) for setup instructions.

## 🏗️ Architecture

This demo consists of **four applications** in a monorepo structure:

### 1. Backend API (Node.js/Express) - Port 3011
- **Authentication:** JWT-based auth with role-based access control (customer, csm, admin)
- **Database:** SQLite (dev) with Sequelize ORM - production-ready for PostgreSQL/MySQL
- **Email Service:** SendGrid integration with graceful fallback to simulation mode
- **Compliance APIs:** Initializes ComplianceInquiry sessions via Twilio APIs
- **API Routes:**
  - `/api/auth/*` - Login, signup, token management
  - `/api/portal/*` - Customer portal endpoints (protected)
  - `/api/dashboard/*` - CSM dashboard endpoints (CSM role required)
  - `/api/compliance/*` - Twilio compliance product APIs

### 2. ISV Demo Dashboard (React) - Port 3010
- Test and explore all five compliance products
- Interactive forms for each compliance type
- Real-time embed integration
- Developer-focused interface

### 3. Customer Portal (React) - Port 3020
- **Invitation-based registration:** Customers sign up via secure email link
- **Dashboard:** View registration status and history
- **AU Sender ID Registration:** Complete Australia Alphanumeric Sender ID registration
- **Profile Management:** Update business information
- Integrates Twilio Compliance Embeddable for end-customers

### 4. CSM Dashboard (React) - Port 3030
- **Customer Management:** View all customers with search/filter
- **Send Invitations:** Invite new customers via email
- **Metrics & Analytics:** Real-time dashboard with charts (recharts)
- **Customer Timeline:** Track journey from invitation → completed
- **Status Monitoring:** sent → logged_in → in_progress → completed

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

### Email Configuration (Optional)

For production email delivery:
- **SendGrid Account:** Get API key at https://sendgrid.com
- **From Email:** Verified sender email address

Without SendGrid, emails are simulated (logged to console)

## 🚀 Installation

### 1. Clone the Repository

```bash
cd /Users/akiramoto/Documents/Github/twilio-compliance-embeddable-demo
```

### 2. Install All Dependencies

```bash
# Backend
cd backend
npm install

# ISV Demo Dashboard
cd ../frontend
npm install

# Customer Portal
cd ../customer-portal
npm install

# CSM Dashboard
cd ../csm-dashboard
npm install
```

Or install all at once from root (requires concurrently):
```bash
npm install
npm run install:all
```

### 4. Configure Environment Variables

#### Backend Configuration

```bash
cd backend
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
PORT=3011
NODE_ENV=development

# Twilio Credentials (REQUIRED)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here

# Australia Alphanumeric Mock Mode (set to 'true' if API not available)
AU_ALPHANUMERIC_MOCK_MODE=false

# For Secondary Customer Profiles (OPTIONAL)
PRIMARY_PROFILE_SID=BUxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# CORS Configuration
FRONTEND_URL=http://localhost:3010
CUSTOMER_PORTAL_URL=http://localhost:3020
CSM_DASHBOARD_URL=http://localhost:3030

# Authentication (REQUIRED for customer portal & dashboard)
# Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-secret-key-change-in-production

# Email Configuration (OPTIONAL - simulates if not set)
SENDGRID_API_KEY=SG.xxxxxxxxx
FROM_EMAIL=noreply@yourcompany.com

# Database
DATABASE_URL=sqlite:./database.sqlite
```

#### Frontend Configurations

**ISV Demo Dashboard:**
```bash
cd ../frontend
cp .env.example .env
```

```env
PORT=3010
REACT_APP_API_URL=http://localhost:3011/api
REACT_APP_ENABLE_LOGGING=true
```

**Customer Portal:**
```bash
cd ../customer-portal
cp .env.example .env
```

```env
PORT=3020
REACT_APP_API_URL=http://localhost:3011/api
REACT_APP_APP_NAME=Customer Portal
```

**CSM Dashboard:**
```bash
cd ../csm-dashboard
cp .env.example .env
```

```env
PORT=3030
REACT_APP_API_URL=http://localhost:3011/api
REACT_APP_APP_NAME=ISV Dashboard
```

## 🎮 Running the Demo

### Choose Your Experience

**Option A: ISV Demo Dashboard Only** (quick exploration)
- Test all 5 compliance products
- Developer-focused interface
- No authentication required

**Option B: Complete Customer Lifecycle System** (full demo)
- Customer Portal for end-users
- CSM Dashboard for ISV team
- Email invitations and status tracking
- Production-ready architecture

### Option 1: Quick Start with Scripts (Recommended)

**ISV Demo Dashboard + Backend:**
```bash
# Start backend and ISV demo
./start.sh

# Check status
./status.sh

# Stop servers
./stop.sh

# Reset demo database and clean logs
./reset-db.sh

# Reset and auto-restart
./reset-db.sh --restart
./reset-db.sh --restart --all
```

**All Applications (Backend + 3 Frontends):**
```bash
# Start everything
./start.sh --all

# Or manually:
cd backend && npm start &
cd frontend && PORT=3010 npm start &
cd customer-portal && PORT=3020 npm start &
cd csm-dashboard && PORT=3030 npm start &
```

**Features:**
- ✅ Automatic dependency installation
- ✅ Health checks and validation
- ✅ Background process management
- ✅ Detailed logs in `logs/` directory
- ✅ Auto-opens browser (macOS)

See [SCRIPTS_README.md](SCRIPTS_README.md) for detailed documentation.

### Option 2: Run Servers Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm start
# or for auto-reload: npm run dev
```

**Terminal 2 - ISV Demo Dashboard:**
```bash
cd frontend
PORT=3010 npm start
```

**Terminal 3 - Customer Portal (optional):**
```bash
cd customer-portal
PORT=3020 npm start
```

**Terminal 4 - CSM Dashboard (optional):**
```bash
cd csm-dashboard
PORT=3030 npm start
```

### Application URLs

- **Backend API:** http://localhost:3011
  - Health: http://localhost:3011/health
  - API Docs: http://localhost:3011/api
  
- **ISV Demo Dashboard:** http://localhost:3010
  - Product selector and testing interface
  
- **Customer Portal:** http://localhost:3020
  - Customer login/registration
  - Sender ID registration workflow
  
- **CSM Dashboard:** http://localhost:3030
  - CSM login (demo: csm@test.com / password123)
  - Customer management and metrics

## 📖 Using the Demo

### Workflow A: ISV Demo Dashboard (Developer Testing)

1. **Navigate to Landing Page**
   - Open http://localhost:3010
   - See product selector with 5 compliance products

2. **Choose a Product**
   - Click "Start Demo" on any product card

3. **Initialize an Inquiry**
   - Fill out form with required information
   - Click "Initialize Inquiry"

4. **Complete the Embedded Form**
   - Twilio Compliance Embeddable loads
   - Fill out compliance/KYC information

5. **Submit and Track**
   - Success message appears
   - Email notifications sent
   - Inquiry enters review

6. **Resume Draft/Rejected** (where supported)
   - Switch to "Resume" tab
   - Enter Registration/Customer ID
   - Click "Resume Inquiry"

### Workflow B: Customer Lifecycle System (Production Pattern)

**Step 1: CSM Sends Invitation**
1. Login to CSM Dashboard: http://localhost:3030
   - Email: `csm@test.com`
   - Password: `password123`

2. Click "Send Invitation"
   - Enter business name and customer email
   - Optionally add website
   - Click "Send Invitation"

3. Copy registration URL from success message
   - Email is simulated (logged to console)
   - URL format: `http://localhost:3020/register?token=xxxxx`

**Step 2: Customer Registers**
1. Customer clicks invitation link (or paste URL)
2. Registration form pre-fills email from invitation
3. Customer creates account:
   - Full name
   - Password (min 8 characters)
   - Confirm password
4. Auto-login after registration

**Step 3: Customer Completes Registration**
1. Customer dashboard shows overview
2. Click "Register Sender ID"
3. Fill out AU Alphanumeric form:
   - Sender ID (2-11 chars, must include letter)
   - Headquarters country
   - Use case category
   - Message volume
   - Proof type
4. Click "Start Registration"
5. Complete Twilio Compliance Embeddable form
6. Submit → Status updates to "completed"

**Step 4: CSM Monitors Progress**
1. CSM Dashboard shows real-time metrics
2. Customer list updates status badges:
   - 🟦 **sent** - Invitation sent
   - 🟪 **logged_in** - Customer registered
   - 🟨 **in_progress** - Registration started
   - 🟢 **completed** - Registration done
3. Click customer name to view timeline
4. See all events with timestamps

### Resume Functionality Support

- ✅ **Toll-free Verification** - Resume supported
- ✅ **Customer Profiles** - Resume supported
- ✅ **Regulatory Bundles** - Resume supported
- ✅ **AU Alphanumeric** - Resume supported
- ❌ **Branded Calling** - Must complete in single session

## 🔧 API Endpoints

### Authentication APIs

```
POST   /api/auth/login                      # Login with email/password
POST   /api/auth/signup                     # Register with invitation token
POST   /api/auth/verify-token               # Validate JWT token
POST   /api/auth/refresh                    # Refresh expired token
POST   /api/auth/password-reset             # Request password reset
GET    /api/auth/invitation/:token          # Verify invitation token
```

### Customer Portal APIs (Requires Authentication)

```
GET    /api/portal/profile                  # Get customer profile
PUT    /api/portal/profile                  # Update customer profile
GET    /api/portal/registrations            # List customer's registrations
POST   /api/portal/registrations/au-alphanumeric  # Start AU registration
GET    /api/portal/registrations/:id/status # Check registration status
PUT    /api/portal/registrations/:id        # Update registration
```

### CSM Dashboard APIs (Requires CSM Role)

```
GET    /api/dashboard/customers             # List all customers (paginated)
GET    /api/dashboard/customers/:id         # Get customer details
POST   /api/dashboard/invitations           # Send invitation
POST   /api/dashboard/invitations/resend    # Resend invitation
GET    /api/dashboard/metrics               # Get dashboard metrics
GET    /api/dashboard/registrations         # List all registrations
PUT    /api/dashboard/customers/:id/assign  # Assign CSM to customer
PUT    /api/dashboard/customers/:id/status  # Update customer status
```

### Compliance Product APIs

```
# Toll-free Verification
POST   /api/compliance/tollfree/initialize
POST   /api/compliance/tollfree/resume

# Customer Profiles
POST   /api/compliance/customer-profile/initialize
POST   /api/compliance/customer-profile/resume

# Regulatory Bundles
POST   /api/compliance/regulatory-bundle/initialize
POST   /api/compliance/regulatory-bundle/resume

# Branded Calling
POST   /api/compliance/branded-calling/initialize

# Australia Alphanumeric Sender ID
POST   /api/compliance/au-alphanumeric/initialize
POST   /api/compliance/au-alphanumeric/resume

# Inquiry Management
GET    /api/compliance/inquiries
GET    /api/compliance/inquiries/:id
```

## 🗂️ Project Structure

```
twilio-compliance-embeddable-demo/
├── backend/                        # Backend API (Port 3011)
│   ├── config/
│   │   └── twilio.js              # Twilio client initialization
│   ├── middleware/
│   │   └── auth.js                # JWT authentication middleware
│   ├── models/                    # Database models (Sequelize)
│   │   ├── index.js               # DB connection & associations
│   │   ├── user.js                # User model (customer/csm/admin)
│   │   ├── customer.js            # Customer model (invitations)
│   │   └── registration.js        # Registration model (sender IDs)
│   ├── routes/
│   │   ├── auth.js                # Authentication endpoints
│   │   ├── portal.js              # Customer portal endpoints
│   │   ├── dashboard.js           # CSM dashboard endpoints
│   │   └── compliance.js          # Twilio compliance APIs
│   ├── services/
│   │   ├── auth.service.js        # JWT & password hashing
│   │   ├── user.service.js        # User CRUD operations
│   │   ├── customer.service.js    # Customer management
│   │   ├── email.service.js       # SendGrid email delivery
│   │   ├── tollfree.service.js
│   │   ├── customer-profile.service.js
│   │   ├── regulatory-bundle.service.js
│   │   ├── branded-calling.service.js
│   │   └── australia-alphanumeric.service.js
│   ├── utils/
│   │   └── storage.js             # Legacy in-memory storage
│   ├── server.js                  # Express server
│   ├── package.json
│   └── .env.example
│
├── frontend/                       # ISV Demo Dashboard (Port 3010)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProductSelector.jsx
│   │   │   ├── ComplianceEmbed.jsx
│   │   │   ├── TollFreeDemo.jsx
│   │   │   ├── CustomerProfileDemo.jsx
│   │   │   ├── RegulatoryBundleDemo.jsx
│   │   │   ├── BrandedCallingDemo.jsx
│   │   │   └── AustraliaAlphanumericDemo.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── utils/
│   │   │   └── constants.js
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── .env.example
│
├── customer-portal/                # Customer Portal (Port 3020)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProtectedRoute.jsx     # Auth guard
│   │   │   └── ComplianceEmbed.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx              # Customer login
│   │   │   ├── Register.jsx           # Invitation-based signup
│   │   │   ├── Dashboard.jsx          # Customer dashboard
│   │   │   └── RegisterSender.jsx     # AU sender registration
│   │   ├── hooks/
│   │   │   └── useAuth.js             # Auth context
│   │   ├── services/
│   │   │   ├── auth.js                # Auth API calls
│   │   │   └── portal.js              # Portal API calls
│   │   ├── styles/                    # CSS files
│   │   ├── App.jsx                    # Router config
│   │   └── index.js
│   ├── package.json
│   └── .env.example
│
└── csm-dashboard/                  # CSM Dashboard (Port 3030)
    ├── src/
    │   ├── components/
    │   │   ├── ProtectedRoute.jsx     # Auth guard
    │   │   ├── StatusBadge.jsx        # Status badge component
    │   │   └── MetricCard.jsx         # Metric display
    │   ├── pages/
    │   │   ├── Login.jsx              # CSM login
    │   │   ├── Dashboard.jsx          # Metrics & charts
    │   │   ├── CustomerList.jsx       # Customer table
    │   │   ├── CustomerDetail.jsx     # Customer timeline
    │   │   └── SendInvitation.jsx     # Invite form
    │   ├── hooks/
    │   │   └── useAuth.js             # Auth context
    │   ├── services/
    │   │   ├── auth.js                # Auth API calls
    │   │   └── dashboard.js           # Dashboard API calls
    │   ├── styles/                    # CSS files
    │   ├── App.js                     # Router config
    │   └── index.js
    ├── package.json
    └── .env.example
```

## 💾 Database Schema

The system uses SQLite for development (easily swappable to PostgreSQL/MySQL for production).

### Tables

**users**
- Authentication and role management
- Fields: id, email, passwordHash, username, role (customer/csm/admin), companyName, lastLogin, isActive
- Supports JWT-based authentication

**customers**
- Customer invitation and onboarding tracking
- Fields: id, userId (FK), businessName, contactEmail, invitationToken, invitationSentAt, invitationStatus, assignedCSM (FK), metadata
- Status flow: sent → opened → logged_in → in_progress → completed

**registrations**
- Sender ID registrations for compliance products
- Fields: id, customerId (FK), registrationType, senderId, status, twilioRegistrationId, twilioInquiryId, startedAt, completedAt, data (JSON)
- Tracks multiple registrations per customer

### Relationships
- User → Customer (one-to-one via userId)
- User (CSM) → Customers (one-to-many via assignedCSM)
- Customer → Registrations (one-to-many)

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

## 🔄 Resetting the Demo

The demo includes multiple ways to reset and clean the database:

### Method 1: Reset Script (Recommended)

```bash
# Clean database and logs only
./reset-db.sh

# Clean and auto-restart ISV demo
./reset-db.sh --restart

# Clean and auto-restart all applications
./reset-db.sh --restart --all
```

**What it does:**
- Stops all running services
- Deletes the SQLite database file
- Cleans all log files
- Optionally restarts with fresh seed data

**Test credentials are recreated:**
- CSM: `csm@test.com` / `password123`
- Customer: `customer@test.com` / `customer123`

### Method 2: UI Button (CSM Dashboard)

1. Log into CSM Dashboard: http://localhost:3030
2. Click "🔄 Reset Demo" button in header
3. Confirm the action
4. Database is cleared and reseeded without restarting servers

**Note:** This method keeps the servers running and only resets the data.

### Method 3: Manual Cleanup

```bash
# Stop services
./stop.sh

# Remove database
rm -f backend/database.sqlite

# Remove logs
rm -f logs/*.log

# Restart
./start.sh --all
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

---

**Error:** `SQLITE_CONSTRAINT: UNIQUE constraint failed`

**Solution:** Database migration conflict. Reset the database:

```bash
./reset-db.sh --restart --all
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
   - ✅ Already implemented in this demo

2. **JWT Secret Management**
   - Generate strong JWT_SECRET using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - Never commit JWT_SECRET to version control
   - Use environment-specific secrets in production
   - ✅ JWT authentication already implemented

3. **Password Security**
   - Passwords hashed with bcrypt (10 salt rounds)
   - Minimum 8 character requirement enforced
   - ✅ Already implemented

4. **Email Security**
   - Invitation tokens are cryptographically secure (32 bytes)
   - Tokens are single-use and invalidated after registration
   - SendGrid API key kept server-side only
   - ✅ Already implemented with graceful fallback

5. **Use HTTPS in production**
   - Configure SSL/TLS certificates
   - Update CORS settings for production domains
   - Set secure cookie flags in production

6. **Database Security**
   - SQLite suitable for development/demo only
   - Migrate to PostgreSQL/MySQL for production
   - Enable connection encryption
   - Implement backup and retention policies

7. **Role-Based Access Control**
   - Customer role: can only access own data
   - CSM role: can view all customers and send invitations
   - Admin role: full system access
   - ✅ RBAC middleware already implemented

8. **Rate Limiting**
   - Add rate limiting to API endpoints
   - Prevent brute force attacks on login
   - Throttle invitation sending

9. **Validate webhook signatures**
   - When implementing status callbacks, validate Twilio's signature
   - See: https://www.twilio.com/docs/usage/webhooks/webhooks-security

10. **Input Validation**
    - Validate all user inputs server-side
    - Sanitize data before database insertion
    - ✅ Basic validation implemented

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
