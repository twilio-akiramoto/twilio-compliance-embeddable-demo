# Quick Test Guide - Australia Alphanumeric Sender ID

## Current Status ✅

- ✅ Backend running on port 3011 (with mock mode enabled)
- ✅ Frontend running on port 3010
- ⚠️ Mock mode active (real API not available yet)

## Test Now

1. **Open the application**
   - Navigate to: http://localhost:3010
   - You should see 5 product cards

2. **Verify the AU Alphanumeric card**
   - Look for the 🇦🇺 icon (5th card)
   - Title: "Australia Alphanumeric Sender ID"
   - Status badge: "Available" (green)
   - Description mentions July 1, 2026 deadline

3. **Click "Start Demo"**
   - Should route to: http://localhost:3010/au-alphanumeric
   - Form should load with two tabs:
     - "Initialize New Registration" (active)
     - "Resume Existing Registration"

4. **Fill out the form**
   - Friendly Name: `Test Registration`
   - Notification Email: `test@example.com`
   - Sender ID: `TESTCO` (will validate 2-11 chars, must have letter)
   - Proof Type: Select any option (optional)
   - Business Name: `Test Business` (optional)
   - Business Website: `https://example.com` (optional)
   - Use Case: Select "Promotional" (default)
   - Message Volume: Select any range (optional)

5. **Click "Initialize Registration"**
   - Button text changes to "Initializing..."
   - After ~500ms, you'll see a **warning message** (yellow alert box):
     ```
     ⚠️ Mock Mode Active: The Australia Alphanumeric Sender ID API 
     is not yet available in production...
     ```
   - This is EXPECTED behavior - mock mode is working correctly!

6. **View backend logs** (optional)
   ```bash
   tail -f /tmp/backend.log
   ```
   - You should see:
     ```
     🇦🇺 Initializing Australia Alphanumeric Sender ID registration...
     ⚠️  MOCK MODE: Using simulated response
     ✅ Mock registration initialized: RG...
     ```

## What's Working ✅

- ✅ Product card displays correctly
- ✅ Routing to `/au-alphanumeric` works
- ✅ Form renders with all fields
- ✅ Client-side validation (sender ID format)
- ✅ Backend API endpoints respond
- ✅ Mock mode generates realistic responses
- ✅ Error handling displays helpful messages
- ✅ Registration ID is logged for testing

## What's Not Working (By Design)

- ❌ Embeddable iframe won't load (mock tokens aren't valid)
- ❌ No real Twilio registrations created (mock mode)
- ❌ Can't test actual compliance form submission

## Expected Error Flow

### Test Invalid Sender IDs

Try these to see validation:

1. **Too short**: `A` → Error: "senderId must be 2-11 alphanumeric characters"
2. **Too long**: `VERYLONGCOMPANY` → Error: "senderId must be 2-11 alphanumeric characters"
3. **No letters**: `12345` → Error: "senderId must contain at least one letter"
4. **Empty**: `` → Browser validation: "Please fill out this field"

## API Test (Command Line)

```bash
# Test initialize endpoint
curl -X POST http://localhost:3011/api/compliance/au-alphanumeric/initialize \
  -H "Content-Type: application/json" \
  -d '{
    "friendlyName": "CLI Test",
    "notificationEmail": "test@example.com",
    "senderId": "CLITEST"
  }' | jq .

# Expected response:
{
  "success": true,
  "data": {
    "inquiryId": "inq_...",
    "inquirySessionToken": "mock_token_...",
    "registrationId": "RG...",
    "status": "DRAFT",
    "_isMock": true  ← Indicates mock mode
  }
}
```

## Check Stored Inquiries

```bash
curl -s http://localhost:3011/api/compliance/inquiries | jq .

# Should show your test inquiries with product: "au-alphanumeric"
```

## Next Steps to Enable Real API

See `AU_ALPHANUMERIC_README.md` for detailed instructions on:
1. Contacting Twilio to enable the API
2. Disabling mock mode
3. Testing with real credentials

## Troubleshooting

### "Network Error" in browser
- Check backend is running: `curl http://localhost:3011/health`
- Check frontend `.env` has: `REACT_APP_API_URL=http://localhost:3011/api`

### Form doesn't submit
- Check browser console for errors
- Verify all required fields are filled
- Check sender ID validation (2-11 chars, contains letter)

### Backend not responding
```bash
# Restart backend
cd backend
lsof -ti:3011 | xargs kill -9
npm start
```

### Frontend not loading
```bash
# Restart frontend
cd frontend
npm start
```

## Success Checklist

- [x] Backend running (health check returns 200)
- [x] Frontend running (http://localhost:3010 loads)
- [x] AU Alphanumeric card visible on home page
- [x] Route to `/au-alphanumeric` works
- [x] Form displays correctly with all fields
- [x] Validation prevents invalid sender IDs
- [x] Initialize button triggers API call
- [x] Mock mode warning displays (expected)
- [x] Backend logs show mock mode messages
- [x] Inquiries stored in memory

✅ **Implementation Complete & Working in Mock Mode**

To test with real API:
1. Contact senderid@twilio.com for API access
2. Set `AU_ALPHANUMERIC_MOCK_MODE=false` in `backend/.env`
3. Restart backend
4. Test again - embeddable should load
