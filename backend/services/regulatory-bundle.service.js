const axios = require('axios');
const { accountSid, authToken } = require('../config/twilio');

/**
 * Initialize a new Regulatory Compliance Bundle ComplianceInquiry
 *
 * @param {Object} params - Initialization parameters
 * @param {string} params.friendlyName - Friendly name for the bundle
 * @param {string} params.notificationEmail - Email for status notifications
 * @param {string} params.country - ISO country code (e.g., 'US', 'GB', 'AU')
 * @param {string} params.numberType - Phone number type (LOCAL, MOBILE, NATIONAL, TOLLFREE)
 * @param {string} params.endUserType - End user type (BUSINESS or INDIVIDUAL)
 * @param {string} [params.regulationSid] - Optional RegulationSid (takes priority)
 * @returns {Promise<Object>} Inquiry data with session token
 */
async function initializeRegulatoryBundle(params) {
  try {
    const {
      friendlyName,
      notificationEmail,
      country,
      numberType,
      endUserType,
      regulationSid,
      statusCallbackUrl
    } = params;

    console.log('🌍 Initializing Regulatory Bundle inquiry...');

    // Build query parameters
    const queryParams = new URLSearchParams();
    if (regulationSid) {
      queryParams.append('RegulationSid', regulationSid);
    } else {
      if (!country || !numberType || !endUserType) {
        throw new Error(
          'Either regulationSid or (country, numberType, endUserType) must be provided'
        );
      }
      queryParams.append('ComplianceRegulationCountry', country);
      queryParams.append('ComplianceRegulationSubType', numberType);
      queryParams.append('ComplianceRegulationEndUserType', endUserType);
    }

    const url = `https://trusthub.twilio.com/v3/ComplianceRegistrations/InitializeInquiry?${queryParams.toString()}`;

    // Build request body
    const requestBody = {
      data: {
        type: 'ComplianceRegistration',
        attributes: {
          friendly_name: friendlyName,
          status_notification_email: notificationEmail
        }
      }
    };

    if (statusCallbackUrl) {
      requestBody.data.attributes.status_callback_url = statusCallbackUrl;
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
    console.log('✅ Regulatory Bundle inquiry initialized:', data.inquiry_id);

    // Extract Bundle SID from compliance_registration_id
    // Format: tri1.us1.account.ACXXXXXXXX.registration.BUXXXXXXXX
    const registrationId = data.compliance_registration_id;
    const bundleSid = registrationId ? registrationId.split('.').pop() : null;

    return {
      inquiryId: data.inquiry_id,
      inquirySessionToken: data.inquiry_session_token,
      complianceRegistrationId: data.compliance_registration_id,
      bundleSid
    };
  } catch (error) {
    console.error('❌ Error initializing regulatory bundle:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message);
  }
}

/**
 * Resume an existing Regulatory Bundle ComplianceInquiry
 *
 * @param {string} registrationId - The compliance registration ID to resume
 * @returns {Promise<Object>} Inquiry data with new session token
 */
async function resumeRegulatoryBundle(registrationId) {
  try {
    console.log('🔄 Resuming Regulatory Bundle inquiry:', registrationId);

    const url = `https://trusthub.twilio.com/v3/ComplianceRegistrations/${registrationId}/InitializeInquiry`;

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
    console.log('✅ Regulatory Bundle inquiry resumed:', data.inquiry_id);

    return {
      inquiryId: data.inquiry_id,
      inquirySessionToken: data.inquiry_session_token,
      complianceRegistrationId: data.compliance_registration_id
    };
  } catch (error) {
    console.error('❌ Error resuming regulatory bundle:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message);
  }
}

module.exports = {
  initializeRegulatoryBundle,
  resumeRegulatoryBundle
};
