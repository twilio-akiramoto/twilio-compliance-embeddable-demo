# Getting Started Guide

Complete guide to set up and run the Twilio Compliance Embeddable Demo.

## Prerequisites

Before you begin, ensure you have:

- ✅ **Node.js 18+** installed ([Download](https://nodejs.org/))
- ✅ **Git** installed
- ✅ **Twilio Account** with Account SID and Auth Token
- ✅ **Terminal/Command Line** access

## Quick Start (5 Minutes)

### 1. Navigate to Project Directory

```bash
cd /Users/akiramoto/Documents/Github/twilio-compliance-embeddable-demo
```

### 2. Configure Credentials

Edit `backend/.env` and add your Twilio credentials:

```bash
# Open in your editor
nano backend/.env
# or
code backend/.env
```

Update these lines:
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
```

> **Where to find credentials:**
> 1. Go to [Twilio Console](https://console.twilio.com/)
> 2. Find Account SID and Auth Token on the dashboard
> 3. Click the eye icon to reveal Auth Token

### 3. Start the Demo

```bash
./start.sh
```

**That's it!** The script will:
- Install all dependencies automatically
- Start backend on port 3011
- Start frontend on port 3010
- Open your browser to http://localhost:3010

### 4. Test It Out

1. You should see 5 product cards on the home page
2. Click on any product's "Start Demo" button
3. Fill out the form and submit
4. Watch the compliance embeddable load!

## Detailed Setup

### Installation

The project consists of two parts: backend (API) and frontend (UI).

#### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit with your credentials
nano .env
```

**Required variables:**
```env
PORT=3011
NODE_ENV=development
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
FRONTEND_URL=http://localhost:3010
```

**Optional variables:**
```env
# For Secondary Customer Profiles
PRIMARY_PROFILE_SID=BUxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# For Australia Alphanumeric Sender ID mock mode
AU_ALPHANUMERIC_MOCK_MODE=true
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment template (optional - has defaults)
cp .env.example .env
```

**Default configuration:**
```env
REACT_APP_API_URL=http://localhost:3011/api
REACT_APP_ENABLE_LOGGING=true
```

### Running the Demo

#### Method 1: Using Scripts (Easiest)

From the project root:

```bash
# Start everything
./start.sh

# Check if running
./status.sh

# View logs
tail -f logs/backend.log
tail -f logs/frontend.log

# Stop everything
./stop.sh

# Restart
./restart.sh
```

#### Method 2: Manual (Two Terminals)

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

#### Method 3: Development Mode with Auto-Reload

**Terminal 1 - Backend (with nodemon):**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend (with hot reload):**
```bash
cd frontend
npm start
```

## Verifying Installation

### Check Backend Health

```bash
curl http://localhost:3011/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-05-15T14:00:00.000Z",
  "service": "Twilio Compliance Embeddable Demo API"
}
```

### Check Frontend

Open browser to: http://localhost:3010

You should see:
- ✅ Twilio ISV Compliance Embeddable Demo header
- ✅ 5 product cards (Toll-free, Customer Profile, Regulatory Bundle, Branded Calling, AU Alphanumeric)
- ✅ "How It Works" section with 4 steps

### Test an API Endpoint

```bash
curl -X POST http://localhost:3011/api/compliance/tollfree/initialize \
  -H "Content-Type: application/json" \
  -d '{
    "tollfreePhoneNumber": "+18005551234",
    "notificationEmail": "test@example.com",
    "businessName": "Test Company"
  }'
```

Expected: JSON response with `inquiryId` and `inquirySessionToken`

## Product-Specific Setup

### Australia Alphanumeric Sender ID

This product requires special setup due to API availability:

1. **Enable Mock Mode** (if API not available):
   ```bash
   # In backend/.env
   AU_ALPHANUMERIC_MOCK_MODE=true
   ```

2. **Test the implementation:**
   - Navigate to http://localhost:3010
   - Click "Australia Alphanumeric Sender ID" card
   - Fill form with test data
   - Submit (you'll see mock mode warning)

3. **Enable Real API** (when available):
   - Contact senderid@twilio.com for access
   - Set `AU_ALPHANUMERIC_MOCK_MODE=false`
   - Restart: `./restart.sh`

See [AU_ALPHANUMERIC_README.md](AU_ALPHANUMERIC_README.md) for details.

### Secondary Customer Profiles

Requires a Primary Customer Profile:

1. Create Primary Customer Profile in Twilio Console
2. Wait for approval (usually 1-2 business days)
3. Add `PRIMARY_PROFILE_SID` to `backend/.env`
4. Restart backend

### Branded Calling

Requires pilot access:

1. Contact your Twilio Account Manager for pilot access
2. Create a Voice Integrity Bundle
3. Note your `viSid` (Voice Integrity Bundle SID)
4. Use it when testing the Branded Calling demo

## Troubleshooting

### Common Issues

#### "Network Error" in Browser

**Problem:** Frontend can't reach backend

**Solutions:**
```bash
# Check if backend is running
curl http://localhost:3011/health

# If not running, start it
cd backend && npm start

# Check ports aren't blocked
lsof -i:3011
```

#### "Port Already in Use"

**Problem:** Port 3011 or 3010 is occupied

**Solutions:**
```bash
# Option 1: Use stop script (recommended)
./stop.sh

# Option 2: Kill manually
lsof -ti:3011 | xargs kill -9
lsof -ti:3010 | xargs kill -9

# Then restart
./start.sh
```

#### Invalid Twilio Credentials

**Problem:** Backend starts but API calls fail with 401

**Solutions:**
1. Verify credentials in backend/.env
2. Test credentials:
   ```bash
   curl -u $TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN \
     https://api.twilio.com/2010-04-01/Accounts.json
   ```
3. If invalid, get new credentials from [Twilio Console](https://console.twilio.com/)

#### Dependencies Won't Install

**Problem:** `npm install` fails

**Solutions:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and try again
rm -rf node_modules package-lock.json
npm install

# Try with --legacy-peer-deps
npm install --legacy-peer-deps
```

#### Frontend Won't Compile

**Problem:** React compilation errors

**Solutions:**
```bash
# Clear cache
rm -rf node_modules/.cache

# Reinstall dependencies
cd frontend
rm -rf node_modules package-lock.json
npm install

# Check Node version (requires 18+)
node --version
```

### Getting Help

**Check logs:**
```bash
# Backend logs
tail -50 logs/backend.log

# Frontend logs
tail -50 logs/frontend.log
```

**Common log patterns to look for:**
- `❌` - Errors that need fixing
- `⚠️` - Warnings (may be OK)
- `✅` - Success messages

**Status check:**
```bash
./status.sh
```

This shows:
- Running/stopped status
- PID numbers
- CPU/memory usage
- Health check results
- Mock mode status

## Next Steps

Once running successfully:

1. **Explore Products**
   - Try each product's demo
   - Fill out different form combinations
   - Test resume functionality

2. **Read Documentation**
   - [SCRIPTS_README.md](SCRIPTS_README.md) - Script usage
   - [AU_ALPHANUMERIC_README.md](AU_ALPHANUMERIC_README.md) - AU Sender ID details
   - [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Technical details

3. **Customize for Your Needs**
   - Modify forms in `frontend/src/components/`
   - Add custom validation
   - Style with your brand colors
   - Add webhook handlers

4. **Deploy to Production**
   - Set up proper database (replace in-memory storage)
   - Configure production environment variables
   - Set up reverse proxy (nginx)
   - Enable HTTPS
   - Set up monitoring

## Environment Summary

**Development:**
- Frontend: http://localhost:3010
- Backend: http://localhost:3011
- Logs: `logs/` directory
- Mock mode: Enabled for AU Alphanumeric

**Production Checklist:**
- [ ] Real database configured
- [ ] Environment variables secured
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Webhook endpoints secured
- [ ] Logging/monitoring set up
- [ ] Error tracking (Sentry, etc.)
- [ ] Backups configured

## Quick Reference

```bash
# Start demo
./start.sh

# Stop demo
./stop.sh

# Check status
./status.sh

# View logs
tail -f logs/backend.log
tail -f logs/frontend.log

# Test backend health
curl http://localhost:3011/health

# Open in browser
open http://localhost:3010

# Restart after config changes
./restart.sh
```

## Support

- **Twilio Documentation:** https://www.twilio.com/docs/messaging/compliance
- **GitHub Issues:** Report issues in your repository
- **Twilio Support:** Contact via Console for API/account issues
- **AU Sender ID:** senderid@twilio.com

## Summary

✅ You should now have:
- Backend running on port 3011
- Frontend running on port 3010
- All 5 products accessible
- Logs being written to `logs/`
- Browser open to demo

🎉 **Congratulations! You're ready to explore the Twilio Compliance Embeddable!**
