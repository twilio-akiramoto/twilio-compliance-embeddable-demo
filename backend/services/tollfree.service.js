const { client } = require('../config/twilio');

/**
 * Initialize a new US Toll-free Verification ComplianceInquiry
 *
 * @param {Object} params - Initialization parameters
 * @param {string} params.friendlyName - Friendly name for the inquiry
 * @param {string} params.notificationEmail - Email for status notifications
 * @param {string} params.phoneNumberType - Type of phone number (e.g., 'tollfree')
 * @param {string} params.endUserType - End user type ('Business' or 'Individual')
 * @returns {Promise<Object>} Inquiry data with session token
 */
async function initializeTollFree(params) {
  try {
    const { friendlyName, notificationEmail, phoneNumberType, endUserType } = params;

    console.log('📞 Initializing Toll-free Verification inquiry...');

    const response = await client.trusthub.v1.complianceInquiries.tollfree.initialize
      .create({
        phoneNumberType: phoneNumberType || 'tollfree',
        endUserType: endUserType || 'Business',
        isIsvEmbed: true,
        friendlyName,
        notificationEmail,
        // Optional parameters for ISVs
        isvRegisteringForSelfOrTenant: 'my_customer',
        businessIdentityType: 'isv_reseller_or_partner'
      });

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
 * @param {string} registrationId - The registration ID to resume
 * @returns {Promise<Object>} Inquiry data with new session token
 */
async function resumeTollFree(registrationId) {
  try {
    console.log('🔄 Resuming Toll-free inquiry:', registrationId);

    const response = await client.trusthub.v1.complianceInquiries
      .tollfree(registrationId)
      .resume
      .create({
        isIsvEmbed: true
      });

    console.log('✅ Toll-free inquiry resumed:', response.inquiryId);

    return {
      inquiryId: response.inquiryId,
      inquirySessionToken: response.inquirySessionToken,
      registrationId: response.registrationId
    };
  } catch (error) {
    console.error('❌ Error resuming toll-free inquiry:', error.message);
    throw error;
  }
}

module.exports = {
  initializeTollFree,
  resumeTollFree
};
