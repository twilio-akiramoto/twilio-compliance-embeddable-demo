require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  console.error('Please copy .env.example to .env and fill in your Twilio credentials');
  process.exit(1);
}

// Initialize Twilio client
const twilio = require('twilio');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = twilio(accountSid, authToken);

console.log('✅ Twilio client initialized with account:', accountSid);

module.exports = {
  client,
  accountSid,
  authToken,
  primaryProfileSid: process.env.PRIMARY_PROFILE_SID || null
};
