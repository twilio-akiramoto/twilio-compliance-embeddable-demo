const { client } = require('../config/twilio');

/**
 * Initialize a new US Toll-free Verification ComplianceInquiry
 *
 * @param {Object} params - Initialization parameters
 * @param {string} params.tollfreePhoneNumber - The toll-free phone number to verify (E.164 format)
 * @param {string} params.notificationEmail - Email for status notifications
 * @param {string} params.businessName - Optional business name
 * @param {string} params.businessWebsite - Optional business website
 * @param {Array<string>} params.useCaseCategories - Optional use case categories
 * @param {string} params.useCaseSummary - Optional use case summary
 * @returns {Promise<Object>} Inquiry data with session token
 */
async function initializeTollFree(params) {
  try {
    const {
      tollfreePhoneNumber,
      notificationEmail,
      businessName,
      businessWebsite,
      useCaseCategories,
      useCaseSummary
    } = params;

    console.log('📞 Initializing Toll-free Verification inquiry...');
    console.log('   Phone Number:', tollfreePhoneNumber);

    const requestParams = {
      tollfreePhoneNumber,
      notificationEmail
    };

    // Add optional parameters if provided
    if (businessName) requestParams.businessName = businessName;
    if (businessWebsite) requestParams.businessWebsite = businessWebsite;
    if (useCaseCategories) requestParams.useCaseCategories = useCaseCategories;
    if (useCaseSummary) requestParams.useCaseSummary = useCaseSummary;

    const response = await client.trusthub.v1.complianceTollfreeInquiries
      .create(requestParams);

    console.log('✅ Toll-free inquiry initialized:', response.inquiryId);

    return {
      inquiryId: response.inquiryId,
      inquirySessionToken: response.inquirySessionToken,
      registrationId: response.registrationId,
      url: response.url
    };
  } catch (error) {
    console.error('❌ Error initializing toll-free inquiry:', error.message);
    throw error;
  }
}

/**
 * Resume an existing Toll-free Verification ComplianceInquiry
 *
 * NOTE: As of Twilio SDK v4.20.0, the complianceTollfreeInquiries API
 * does not support resume functionality. Toll-free verifications must
 * be completed in a single session or resubmitted as new inquiries.
 *
 * @param {string} registrationId - The registration ID to resume
 * @returns {Promise<Object>} Inquiry data with new session token
 */
async function resumeTollFree(registrationId) {
  console.log('⚠️  Resume not supported for Toll-free inquiries');
  throw new Error(
    'Resume is not currently supported for US Toll-free Verification. ' +
    'Please complete the verification in a single session or create a new inquiry.'
  );
}

module.exports = {
  initializeTollFree,
  resumeTollFree
};
