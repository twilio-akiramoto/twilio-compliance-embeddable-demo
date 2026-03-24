const { client, primaryProfileSid } = require('../config/twilio');

/**
 * Initialize a new Secondary Customer Profile ComplianceInquiry
 *
 * @param {Object} params - Initialization parameters
 * @param {string} params.notificationEmail - Email for status notifications
 * @returns {Promise<Object>} Inquiry data with session token
 */
async function initializeCustomerProfile(params) {
  try {
    const { notificationEmail } = params;

    if (!primaryProfileSid) {
      throw new Error(
        'PRIMARY_PROFILE_SID not configured. Please set it in your .env file.'
      );
    }

    console.log('🏢 Initializing Customer Profile inquiry...');
    console.log('Using Primary Profile SID:', primaryProfileSid);

    const response = await client.trusthub.v1.complianceInquiries.customers.initialize
      .create({
        primaryProfileSid,
        notificationEmail
      });

    console.log('✅ Customer Profile inquiry initialized:', response.inquiryId);

    // Extract BU SID from customer_id
    // Format: tri1.us1.trusthub.<<Your ASID>>.customer.<<Bundle SID>>
    const customerId = response.customerId;
    const bundleSid = customerId.split('.').pop();

    return {
      inquiryId: response.inquiryId,
      inquirySessionToken: response.inquirySessionToken,
      customerId: response.customerId,
      bundleSid,
      url: response.url
    };
  } catch (error) {
    console.error('❌ Error initializing customer profile:', error.message);
    throw error;
  }
}

/**
 * Resume an existing Customer Profile ComplianceInquiry
 *
 * @param {string} customerId - The customer ID to resume
 * @returns {Promise<Object>} Inquiry data with new session token
 */
async function resumeCustomerProfile(customerId) {
  try {
    if (!primaryProfileSid) {
      throw new Error(
        'PRIMARY_PROFILE_SID not configured. Please set it in your .env file.'
      );
    }

    console.log('🔄 Resuming Customer Profile inquiry:', customerId);

    const response = await client.trusthub.v1.complianceInquiries
      .customers(customerId)
      .initialize
      .create({
        primaryProfileSid
      });

    console.log('✅ Customer Profile inquiry resumed:', response.inquiryId);

    return {
      inquiryId: response.inquiryId,
      inquirySessionToken: response.inquirySessionToken,
      customerId: response.customerId
    };
  } catch (error) {
    console.error('❌ Error resuming customer profile:', error.message);
    throw error;
  }
}

module.exports = {
  initializeCustomerProfile,
  resumeCustomerProfile
};
