const axios = require('axios');
const { accountSid, authToken } = require('../config/twilio');

// Australia ACMA Sender ID Regulation ID
const AU_REGULATION_ID = 'RNa8ade60e2a607e62a802f4e6facc887a';
const AU_REGULATION_VERSION = 1;

// Mock mode for when API is not yet available in production
const USE_MOCK_MODE = process.env.AU_ALPHANUMERIC_MOCK_MODE === 'true';

/**
 * Generate mock response for demo purposes
 */
function generateMockResponse(senderId) {
  const mockRegistrationId = `RG${Date.now()}${Math.random().toString(36).substring(2, 9)}`;
  const mockSessionId = `inq_${Math.random().toString(36).substring(2, 15)}`;
  const mockSessionToken = `mock_token_${Math.random().toString(36).substring(2, 25)}`;

  return {
    inquiryId: mockSessionId,
    inquirySessionToken: mockSessionToken,
    registrationId: mockRegistrationId,
    status: 'DRAFT',
    _isMock: true
  };
}

/**
 * Initialize a new Australia Alphanumeric Sender ID Registration
 *
 * @param {Object} params - Initialization parameters
 * @param {string} params.friendlyName - Friendly name for the registration
 * @param {string} params.notificationEmail - Email for status notifications
 * @param {string} params.senderId - Alphanumeric sender ID (2-11 chars, must contain letter)
 * @param {string} [params.proofOfSenderId] - Proof type (Company Extract, ABNR, etc.)
 * @param {string} [params.businessName] - Business name
 * @param {string} [params.businessWebsite] - Business website URL
 * @param {string} [params.useCaseCategory] - PROMOTIONAL or TRANSACTIONAL
 * @param {string} [params.messageVolume] - Average monthly message volume
 * @param {string} [params.statusCallbackUrl] - Webhook URL for status updates
 * @returns {Promise<Object>} Registration data with embedded session
 */
async function initializeAustraliaAlphanumeric(params) {
  try {
    const {
      friendlyName,
      notificationEmail,
      senderId,
      proofOfSenderId,
      businessName,
      businessWebsite,
      useCaseCategory,
      messageVolume,
      statusCallbackUrl
    } = params;

    console.log('🇦🇺 Initializing Australia Alphanumeric Sender ID registration...');

    // Check if mock mode is enabled
    if (USE_MOCK_MODE) {
      console.log('⚠️  MOCK MODE: Using simulated response (AU Sender ID API not yet available)');
      const mockResponse = generateMockResponse(senderId);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      console.log('✅ Mock registration initialized:', mockResponse.registrationId);
      return mockResponse;
    }

    const url = 'https://numbers.twilio.com/v1/SenderIdRegistrations';

    // Build request body
    const requestBody = {
      regulationId: AU_REGULATION_ID,
      regulationVersion: AU_REGULATION_VERSION,
      friendlyName,
      statusNotificationEmail: notificationEmail,
      data: {
        alphanumericSender: {
          senderId
        },
        business: {
          businessIdentity: 'ISV',
          isSubassigned: 'YES',
          headquartersCountry: params.headquartersCountry || 'US'
        }
      }
    };

    // Add optional fields
    if (statusCallbackUrl) {
      requestBody.statusCallbackUrl = statusCallbackUrl;
    }

    if (proofOfSenderId) {
      requestBody.data.alphanumericSender.proofOfSenderId = proofOfSenderId;
    }

    if (businessName) {
      requestBody.data.business.businessName = businessName;
    }

    if (businessWebsite) {
      requestBody.data.business.businessWebsite = businessWebsite;
    }

    if (useCaseCategory || messageVolume) {
      requestBody.data.useCase = {};
      if (useCaseCategory) {
        requestBody.data.useCase.category = useCaseCategory;
      }
      if (messageVolume) {
        requestBody.data.useCase.averageMessageVolumePerMonth = messageVolume;
      }
    }

    const response = await axios.post(url, requestBody, {
      auth: {
        username: accountSid,
        password: authToken
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = response.data;
    console.log('✅ Australia Alphanumeric Sender ID registration initialized:', data.id);

    // Extract session data from embeddedSession
    const embeddedSession = data.embeddedSession || {};

    return {
      inquiryId: embeddedSession.sessionId,
      inquirySessionToken: embeddedSession.sessionToken,
      registrationId: data.id,
      status: data.status
    };
  } catch (error) {
    console.error('❌ Error initializing AU alphanumeric registration:', error.response?.data || error.message);

    // If API endpoint not found, provide helpful error message
    if (error.response?.status === 404) {
      throw new Error(
        'Australia Alphanumeric Sender ID API is not yet available for your account. ' +
        'Please contact Twilio Support or enable mock mode by setting AU_ALPHANUMERIC_MOCK_MODE=true in .env'
      );
    }

    throw new Error(error.response?.data?.message || error.message);
  }
}

/**
 * Resume an existing Australia Alphanumeric Sender ID Registration
 * Creates a new embedded session for an existing registration
 *
 * @param {string} registrationId - The registration ID to resume
 * @returns {Promise<Object>} Registration data with new embedded session
 */
async function resumeAustraliaAlphanumeric(registrationId) {
  try {
    console.log('🔄 Resuming Australia Alphanumeric Sender ID registration:', registrationId);

    // Check if mock mode is enabled
    if (USE_MOCK_MODE) {
      console.log('⚠️  MOCK MODE: Using simulated response');
      const mockSessionId = `inq_${Math.random().toString(36).substring(2, 15)}`;
      const mockSessionToken = `mock_token_${Math.random().toString(36).substring(2, 25)}`;
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      console.log('✅ Mock registration resumed:', registrationId);
      return {
        inquiryId: mockSessionId,
        inquirySessionToken: mockSessionToken,
        registrationId,
        _isMock: true
      };
    }

    const url = `https://numbers.twilio.com/v1/SenderIdRegistrations/${registrationId}/EmbeddedSessions`;

    const response = await axios.post(url, {}, {
      auth: {
        username: accountSid,
        password: authToken
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = response.data;
    console.log('✅ Australia Alphanumeric Sender ID registration resumed:', data.id);

    return {
      inquiryId: data.sessionId,
      inquirySessionToken: data.sessionToken,
      registrationId: data.id
    };
  } catch (error) {
    console.error('❌ Error resuming AU alphanumeric registration:', error.response?.data || error.message);

    // If API endpoint not found, provide helpful error message
    if (error.response?.status === 404) {
      throw new Error(
        'Australia Alphanumeric Sender ID API is not yet available for your account. ' +
        'Please contact Twilio Support or enable mock mode by setting AU_ALPHANUMERIC_MOCK_MODE=true in .env'
      );
    }

    throw new Error(error.response?.data?.message || error.message);
  }
}

module.exports = {
  initializeAustraliaAlphanumeric,
  resumeAustraliaAlphanumeric
};
