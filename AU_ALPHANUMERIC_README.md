# Australia Alphanumeric Sender ID - Setup Guide

## ⚠️ Important: API Availability

The **Australia Alphanumeric Sender ID API** (`/v1/SenderIdRegistrations`) is currently in **pilot/beta** and may not be available for all Twilio accounts yet.

### API Status Check

If you encounter this error:
```
The requested resource /v1/SenderIdRegistrations was not found
```

This means the API is not yet enabled for your Twilio account.

## Solutions

### Option 1: Enable Mock Mode (Demo/Testing)

For development and testing purposes, you can enable mock mode:

1. Edit `backend/.env`
2. Set: `AU_ALPHANUMERIC_MOCK_MODE=true`
3. Restart the backend server

**Mock Mode Features:**
- ✅ Tests the entire UI/UX flow
- ✅ Validates form inputs
- ✅ Generates realistic mock responses
- ✅ Stores inquiries in the demo database
- ❌ Does NOT create real Twilio registrations
- ❌ Embeddable iframe will NOT load (mock tokens aren't valid)

**Mock Mode Response Example:**
```json
{
  "success": true,
  "data": {
    "inquiryId": "inq_mock123",
    "inquirySessionToken": "mock_token_xyz",
    "registrationId": "RGmock456",
    "status": "DRAFT",
    "_isMock": true
  }
}
```

The frontend will detect `_isMock: true` and display a warning instead of loading the embeddable.

### Option 2: Request API Access (Production)

To use the real Australia Alphanumeric Sender ID API:

1. **Contact Twilio Support**
   - Email: senderid@twilio.com
   - Subject: "Request Access to AU Alphanumeric Sender ID API"
   - Include your Account SID

2. **Verify ISV Enrollment**
   - ISVs must be opted into Twilio's AU Sender ID program
   - Provide your business details and use case

3. **Wait for Enablement**
   - Twilio will enable the API for your account
   - You'll receive confirmation when ready

4. **Disable Mock Mode**
   - Edit `backend/.env`
   - Set: `AU_ALPHANUMERIC_MOCK_MODE=false`
   - Restart the backend server

5. **Test the Real API**
   - Initialize a registration
   - The embeddable should load with real session tokens
   - Complete the compliance form
   - Check registration status in Twilio Console

## Configuration

### Backend Environment Variables

```bash
# In backend/.env

# Mock mode (true = use mock responses, false = use real API)
AU_ALPHANUMERIC_MOCK_MODE=true

# Your Twilio credentials (required)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
```

### Frontend Configuration

No frontend changes needed - the component automatically detects mock mode from the API response.

## Testing the Implementation

### 1. With Mock Mode (Current Setup)

```bash
# Start backend
cd backend
npm start

# Start frontend (separate terminal)
cd frontend
npm start
```

**Expected Behavior:**
1. Navigate to http://localhost:3010
2. Click "Australia Alphanumeric Sender ID" card
3. Fill out the form with test data:
   - Friendly Name: "Test Registration"
   - Email: test@example.com
   - Sender ID: TESTCO (2-11 chars, must contain letter)
4. Click "Initialize Registration"
5. **Warning message appears** explaining mock mode is active
6. Form resets (no embeddable loads)

### 2. With Real API (After Enablement)

```bash
# Disable mock mode
# Edit backend/.env: AU_ALPHANUMERIC_MOCK_MODE=false

# Restart backend
cd backend
npm start
```

**Expected Behavior:**
1. Same steps 1-4 as above
2. **Embeddable iframe loads** with real Twilio compliance form
3. Complete the form in the embeddable
4. Submit → Registration created in Twilio
5. Success message → Redirect to home

## API Endpoints

### Initialize Registration
```bash
POST /api/compliance/au-alphanumeric/initialize

Request:
{
  "friendlyName": "Customer ABC Registration",
  "notificationEmail": "support@mycompany.com",
  "senderId": "MYCOMPANY",
  "proofOfSenderId": "Company Extract",
  "businessName": "My Company Inc",
  "businessWebsite": "https://mycompany.com",
  "useCaseCategory": "PROMOTIONAL",
  "messageVolume": "1000-10000"
}

Response (Real API):
{
  "success": true,
  "data": {
    "inquiryId": "inq_abc123def456",
    "inquirySessionToken": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "registrationId": "RGabc123def456",
    "status": "DRAFT"
  }
}

Response (Mock Mode):
{
  "success": true,
  "data": {
    "inquiryId": "inq_mock123",
    "inquirySessionToken": "mock_token_xyz",
    "registrationId": "RGmock456",
    "status": "DRAFT",
    "_isMock": true  // ← Indicates mock mode
  }
}
```

### Resume Registration
```bash
POST /api/compliance/au-alphanumeric/resume

Request:
{
  "registrationId": "RGabc123def456"
}

Response: Same structure as initialize
```

## Validation Rules

The implementation enforces these rules:

### Sender ID Validation
- **Length**: 2-11 characters
- **Format**: Alphanumeric only (a-z, A-Z, 0-9)
- **Requirement**: Must contain at least one letter
- **Examples**:
  - ✅ Valid: "MYCOMPANY", "Shop2U", "Alert123", "ABC"
  - ❌ Invalid: "A" (too short), "123" (no letters), "TOOLONGCOMPANY" (>11 chars)

### Required Fields
- `friendlyName`: Human-readable name for the registration
- `notificationEmail`: Valid email address
- `senderId`: Alphanumeric sender ID (see validation above)

### Optional Fields
- `proofOfSenderId`: Proof type dropdown
- `businessName`: Legal business name
- `businessWebsite`: Valid URL format
- `useCaseCategory`: PROMOTIONAL or TRANSACTIONAL
- `messageVolume`: Average monthly volume range

## Troubleshooting

### Error: "Network Error"
- **Cause**: Backend not running
- **Solution**: Start backend with `cd backend && npm start`
- **Verify**: http://localhost:3011/health should return `{"status":"healthy"}`

### Error: "The requested resource /v1/SenderIdRegistrations was not found"
- **Cause**: API not enabled for your account
- **Solution**: Enable mock mode (see Option 1 above) OR request API access (see Option 2)

### Error: "senderId must contain at least one letter"
- **Cause**: Sender ID is all numbers (e.g., "12345")
- **Solution**: Add at least one letter (e.g., "Alert123")

### Embeddable Not Loading
- **With Mock Mode**: This is expected - mock tokens aren't valid
- **With Real API**: Check browser console for errors, verify `inquirySessionToken` is present

## Production Deployment

### Prerequisites
1. ✅ Twilio account with AU Sender ID API access
2. ✅ ISV enrollment confirmed by Twilio
3. ✅ Valid Twilio Account SID and Auth Token
4. ✅ Mock mode disabled (`AU_ALPHANUMERIC_MOCK_MODE=false`)

### Deployment Steps
1. Set production environment variables
2. Deploy backend to your hosting platform
3. Deploy frontend with correct `REACT_APP_API_URL`
4. Test end-to-end with real credentials
5. Monitor registration submissions in Twilio Console

## Support

- **Twilio Docs**: https://www.twilio.com/docs/messaging/compliance/sender-id-registration
- **API Access**: senderid@twilio.com
- **ACMA Regulations**: https://www.acma.gov.au/
- **Implementation Issues**: Check GitHub Issues or contact your Twilio account manager

## Timeline

- **Pilot Launch**: Q1 2026 (limited access)
- **General Availability**: TBD
- **Compliance Deadline**: July 1, 2026 (all sender IDs must be registered)
