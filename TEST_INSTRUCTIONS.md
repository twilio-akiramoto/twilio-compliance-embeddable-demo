# Testing Instructions for Australia Alphanumeric Sender ID

## Quick Start

### 1. Backend Setup
```bash
cd backend
npm install  # if dependencies changed
npm start    # Should start on port 3001
```

Expected output:
```
Server running on port 3001
🌐 Environment: development
✅ Twilio configured
```

### 2. Frontend Setup
```bash
cd frontend
npm install  # if dependencies changed
npm start    # Should start on port 3000
```

Browser should open to http://localhost:3000

### 3. Verify New Product Card

On the home page, you should see 5 product cards:
1. US Toll-free Verification
2. Secondary Customer Profiles
3. Regulatory Compliance Bundles
4. Branded Calling
5. **Australia Alphanumeric Sender ID** 🇦🇺 (NEW)

The AU card should show:
- Icon: 🇦🇺
- Status: "Available" (green badge)
- Description mentioning ACMA regulations and July 1, 2026 deadline

## Manual Testing Steps

### Test 1: Initialize New Registration

1. Click "Start Demo" on the AU Alphanumeric Sender ID card
2. You should be routed to `/au-alphanumeric`
3. Fill out the form:
   - Friendly Name: "Test Registration"
   - Notification Email: "test@example.com"
   - Sender ID: "MYCOMPANY" (2-11 chars, must have letter)
   - Proof Type: Select "Company Extract"
   - Business Name: "My Test Business"
   - Business Website: "https://example.com"
   - Use Case: Select "Promotional"
   - Message Volume: Select "1,000 - 10,000"
4. Click "Initialize Registration"
5. Expected behavior:
   - Loading state: "Initializing..."
   - Backend calls POST `/api/compliance/au-alphanumeric/initialize`
   - Backend calls Twilio API: `POST https://numbers.twilio.com/v1/SenderIdRegistrations`
   - Response includes Registration ID (save this!)
   - Embeddable iframe loads with compliance form
6. Complete the form in the embeddable
7. Expected: Success message → redirect to home page

### Test 2: Resume Existing Registration

1. Navigate to `/au-alphanumeric`
2. Click the "Resume Existing Registration" tab
3. Enter the Registration ID from Test 1
4. Click "Resume Registration"
5. Expected behavior:
   - Backend calls POST `/api/compliance/au-alphanumeric/resume`
   - Backend calls Twilio API: `POST https://numbers.twilio.com/v1/SenderIdRegistrations/{id}/EmbeddedSessions`
   - Embeddable loads with existing data
   - Previous form data should be pre-filled

### Test 3: Validation Errors

Test invalid sender IDs:
- "A" → Error: "must be 2-11 alphanumeric characters"
- "123456789012" → Error: "must be 2-11 alphanumeric characters"
- "123" → Error: "must contain at least one letter"
- "" → Error: "required"

Test missing fields:
- Empty Friendly Name → Error: "required"
- Empty Email → Error: "required"
- Invalid Email format → Browser validation error

### Test 4: API Verification

Check inquiries are stored:
```bash
curl http://localhost:3001/api/compliance/inquiries
```

Should return array including your AU alphanumeric inquiry with:
- `product: "au-alphanumeric"`
- `registrationId: "RG..."`
- `senderId: "MYCOMPANY"`
- `status: "initialized"`

## Backend API Testing

### Initialize Endpoint Test
```bash
curl -X POST http://localhost:3001/api/compliance/au-alphanumeric/initialize \
  -H "Content-Type: application/json" \
  -d '{
    "friendlyName": "CLI Test",
    "notificationEmail": "test@example.com",
    "senderId": "TESTCO",
    "businessName": "Test Company",
    "useCaseCategory": "PROMOTIONAL"
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "inquiryId": "inq_XXXXXXXX",
    "inquirySessionToken": "token...",
    "registrationId": "RG...",
    "status": "DRAFT"
  }
}
```

### Resume Endpoint Test
```bash
curl -X POST http://localhost:3001/api/compliance/au-alphanumeric/resume \
  -H "Content-Type: application/json" \
  -d '{
    "registrationId": "RG..."
  }'
```

Expected response (if DRAFT/REJECTED status):
```json
{
  "success": true,
  "data": {
    "inquiryId": "inq_YYYYYYYY",
    "inquirySessionToken": "new_token...",
    "registrationId": "RG..."
  }
}
```

## Integration Points Checklist

- [x] Backend service created: `backend/services/australia-alphanumeric.service.js`
- [x] Backend routes added: `/api/compliance/au-alphanumeric/*`
- [x] Frontend component created: `frontend/src/components/AustraliaAlphanumericDemo.jsx`
- [x] Frontend API functions added: `initializeAustraliaAlphanumeric()`, `resumeAustraliaAlphanumeric()`
- [x] Frontend route added: `/au-alphanumeric`
- [x] Product card added to home page
- [x] Constants added for dropdowns
- [x] Validation implemented (2-11 chars, contains letter)
- [x] Error handling implemented
- [x] Storage integration implemented

## Known Limitations

1. **Twilio Credentials Required**: The API calls will fail without valid credentials in `.env`
2. **ISV Opt-in Required**: ISV must email senderid@twilio.com to be enrolled
3. **No Mock Mode**: Unlike other demos, there's no mock/test mode for AU Sender ID
4. **Session Expiration**: Sessions expire after 24 hours

## Troubleshooting

### Error: "Failed to initialize registration"
- Check `.env` file has valid TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN
- Check ISV is opted into AU Sender ID program
- Check backend logs for detailed error message

### Error: 409 Conflict on Resume
- Registration may be in IN_REVIEW or APPROVED status (can only resume DRAFT/REJECTED)
- Check registration status via Twilio Console

### Embeddable Not Loading
- Check browser console for errors
- Verify `inquiryId` and `inquirySessionToken` are present in response
- Check CORS settings if running on non-default ports

### Backend Connection Refused
- Verify backend is running on port 3001
- Check firewall settings
- Verify frontend API_BASE_URL is correct

## Success Criteria

✅ All tests pass
✅ Product card visible on home page
✅ Form loads at `/au-alphanumeric`
✅ Initialize creates registration and displays embeddable
✅ Resume retrieves existing registration
✅ Validation prevents invalid sender IDs
✅ Inquiries stored with product='au-alphanumeric'
✅ UI/UX consistent with other demo pages
