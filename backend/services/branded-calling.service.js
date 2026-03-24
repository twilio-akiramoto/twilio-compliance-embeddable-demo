const { client } = require('../config/twilio');

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

    console.log('📱 Initializing Branded Calling inquiry...');

    // Build request parameters
    const requestParams = {
      viSid,
      pnSids
    };

    // Add optional pre-fill parameters
    if (legalBusinessName) {
      requestParams.legalBusinessName = legalBusinessName;
    }
    if (shortDisplayName) {
      if (shortDisplayName.length > 15) {
        throw new Error('Short display name must be 15 characters or less');
      }
      requestParams.shortDisplayName = shortDisplayName;
    }
    if (longDisplayName) {
      if (longDisplayName.length > 32) {
        throw new Error('Long display name must be 32 characters or less');
      }
      requestParams.longDisplayName = longDisplayName;
    }
    if (purposeOfCall) {
      requestParams.purposeOfCall = purposeOfCall;
    }

    const response = await client.trusthub.v1.complianceInquiries.brandedCalling.initialize
      .create(requestParams);

    console.log('✅ Branded Calling inquiry initialized:', response.inquiryId);

    return {
      inquiryId: response.inquiryId,
      inquirySessionToken: response.inquirySessionToken,
      registrationId: response.registrationId,
      url: response.url
    };
  } catch (error) {
    console.error('❌ Error initializing branded calling:', error.message);
    throw error;
  }
}

/**
 * Note: Branded Calling does NOT support resume functionality
 * Inquiries must be completed in a single session
 */

module.exports = {
  initializeBrandedCalling
};
