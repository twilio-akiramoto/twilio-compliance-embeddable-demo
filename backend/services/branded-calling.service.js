const axios = require('axios');
const { accountSid, authToken } = require('../config/twilio');

/**
 * Initialize a new Branded Calling ComplianceInquiry
 *
 * Note: Branded Calling does NOT support resume - inquiries must be completed in a single session
 *
 * @param {Object} params - Initialization parameters
 * @param {string} params.viSid - Voice Integrity Bundle SID (required)
 * @param {Array<string>} params.pnSids - Array of Phone Number SIDs (required, max 28)
 * @param {string} [params.legalBusinessName] - Business name (optional pre-fill)
 * @param {string} [params.shortDisplayName] - Short display name (optional, max 15 chars)
 * @param {string} [params.longDisplayName] - Long display name (optional, max 32 chars)
 * @param {string} [params.purposeOfCall] - Purpose of outgoing calls (optional)
 * @returns {Promise<Object>} Inquiry data with session token
 */
async function initializeBrandedCalling(params) {
  try {
    const {
      viSid,
      pnSids,
      legalBusinessName,
      shortDisplayName,
      longDisplayName,
      purposeOfCall
    } = params;

    if (!viSid) {
      throw new Error('Voice Integrity Bundle SID (viSid) is required');
    }

    if (!pnSids || !Array.isArray(pnSids) || pnSids.length === 0) {
      throw new Error('At least one Phone Number SID (pnSids) is required');
    }

    if (pnSids.length > 28) {
      throw new Error('Maximum 28 Phone Number SIDs allowed');
    }

    if (shortDisplayName && shortDisplayName.length > 15) {
      throw new Error('Short display name must be 15 characters or less');
    }

    if (longDisplayName && longDisplayName.length > 32) {
      throw new Error('Long display name must be 32 characters or less');
    }

    console.log('📱 Initializing Branded Calling inquiry...');

    const url = 'https://trusthub.twilio.com/v1/ComplianceInquiries/BrandedCalling/Initialize';

    // Build request body as URL-encoded form data
    const formData = new URLSearchParams();
    formData.append('ViSid', viSid);

    // Add all phone number SIDs
    pnSids.forEach(pnSid => {
      formData.append('PnSids', pnSid);
    });

    // Add optional pre-fill parameters
    if (legalBusinessName) {
      formData.append('LegalBusinessName', legalBusinessName);
    }
    if (shortDisplayName) {
      formData.append('ShortDisplayName', shortDisplayName);
    }
    if (longDisplayName) {
      formData.append('LongDisplayName', longDisplayName);
    }
    if (purposeOfCall) {
      formData.append('PurposeOfCall', purposeOfCall);
    }

    const response = await axios.post(url, formData.toString(), {
      auth: {
        username: accountSid,
        password: authToken
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const data = response.data;
    console.log('✅ Branded Calling inquiry initialized:', data.inquiry_id);

    return {
      inquiryId: data.inquiry_id,
      inquirySessionToken: data.inquiry_session_token,
      registrationId: data.registration_id,
      url: data.url
    };
  } catch (error) {
    console.error('❌ Error initializing branded calling:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message);
  }
}

/**
 * Note: Branded Calling does NOT support resume functionality
 * Inquiries must be completed in a single session
 */

module.exports = {
  initializeBrandedCalling
};
