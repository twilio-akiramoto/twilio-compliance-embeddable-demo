const express = require('express');
const router = express.Router();
const storage = require('../utils/storage');

// Import services
const { initializeTollFree, resumeTollFree } = require('../services/tollfree.service');
const { initializeCustomerProfile, resumeCustomerProfile } = require('../services/customer-profile.service');
const { initializeRegulatoryBundle, resumeRegulatoryBundle } = require('../services/regulatory-bundle.service');
const { initializeBrandedCalling } = require('../services/branded-calling.service');
const { initializeAustraliaAlphanumeric, resumeAustraliaAlphanumeric } = require('../services/australia-alphanumeric.service');

/**
 * Helper function to format success responses
 */
function successResponse(data) {
  return { success: true, data };
}

/**
 * Helper function to format error responses
 */
function errorResponse(error) {
  return {
    success: false,
    error: error.message || 'An error occurred'
  };
}

// ========================================
// US Toll-free Verification Endpoints
// ========================================

/**
 * POST /api/compliance/tollfree/initialize
 * Initialize a new Toll-free Verification inquiry
 */
router.post('/tollfree/initialize', async (req, res) => {
  try {
    const {
      tollfreePhoneNumber,
      notificationEmail,
      businessName,
      businessWebsite,
      useCaseCategories,
      useCaseSummary
    } = req.body;

    // Validation
    if (!tollfreePhoneNumber || !notificationEmail) {
      return res.status(400).json(errorResponse(
        new Error('tollfreePhoneNumber and notificationEmail are required')
      ));
    }

    // Validate phone number format (basic check for toll-free numbers)
    if (!tollfreePhoneNumber.match(/^\+1(800|888|877|866|855|844|833)/)) {
      return res.status(400).json(errorResponse(
        new Error('tollfreePhoneNumber must be a valid US toll-free number in E.164 format (e.g., +18005551234)')
      ));
    }

    const result = await initializeTollFree({
      tollfreePhoneNumber,
      notificationEmail,
      businessName,
      businessWebsite,
      useCaseCategories,
      useCaseSummary
    });

    // Save to storage
    storage.saveInquiry({
      inquiryId: result.inquiryId,
      product: 'tollfree',
      registrationId: result.registrationId,
      status: 'initialized',
      tollfreePhoneNumber,
      businessName
    });

    res.json(successResponse(result));
  } catch (error) {
    res.status(500).json(errorResponse(error));
  }
});

/**
 * POST /api/compliance/tollfree/resume
 * Resume an existing Toll-free Verification inquiry
 */
router.post('/tollfree/resume', async (req, res) => {
  try {
    const { registrationId } = req.body;

    if (!registrationId) {
      return res.status(400).json(errorResponse(
        new Error('registrationId is required')
      ));
    }

    const result = await resumeTollFree(registrationId);

    // Update storage
    storage.saveInquiry({
      inquiryId: result.inquiryId,
      product: 'tollfree',
      registrationId: result.registrationId,
      status: 'resumed'
    });

    res.json(successResponse(result));
  } catch (error) {
    res.status(500).json(errorResponse(error));
  }
});

// ========================================
// Secondary Customer Profile Endpoints
// ========================================

/**
 * POST /api/compliance/customer-profile/initialize
 * Initialize a new Customer Profile inquiry
 */
router.post('/customer-profile/initialize', async (req, res) => {
  try {
    const { notificationEmail } = req.body;

    if (!notificationEmail) {
      return res.status(400).json(errorResponse(
        new Error('notificationEmail is required')
      ));
    }

    const result = await initializeCustomerProfile({ notificationEmail });

    // Save to storage
    storage.saveInquiry({
      inquiryId: result.inquiryId,
      product: 'customer-profile',
      customerId: result.customerId,
      bundleSid: result.bundleSid,
      status: 'initialized'
    });

    res.json(successResponse(result));
  } catch (error) {
    res.status(500).json(errorResponse(error));
  }
});

/**
 * POST /api/compliance/customer-profile/resume
 * Resume an existing Customer Profile inquiry
 */
router.post('/customer-profile/resume', async (req, res) => {
  try {
    const { customerId } = req.body;

    if (!customerId) {
      return res.status(400).json(errorResponse(
        new Error('customerId is required')
      ));
    }

    const result = await resumeCustomerProfile(customerId);

    // Update storage
    storage.saveInquiry({
      inquiryId: result.inquiryId,
      product: 'customer-profile',
      customerId: result.customerId,
      status: 'resumed'
    });

    res.json(successResponse(result));
  } catch (error) {
    res.status(500).json(errorResponse(error));
  }
});

// ========================================
// Regulatory Compliance Bundle Endpoints
// ========================================

/**
 * POST /api/compliance/regulatory-bundle/initialize
 * Initialize a new Regulatory Bundle inquiry
 */
router.post('/regulatory-bundle/initialize', async (req, res) => {
  try {
    const {
      friendlyName,
      notificationEmail,
      country,
      numberType,
      endUserType,
      regulationSid,
      statusCallbackUrl
    } = req.body;

    // Validation
    if (!friendlyName || !notificationEmail) {
      return res.status(400).json(errorResponse(
        new Error('friendlyName and notificationEmail are required')
      ));
    }

    if (!regulationSid && (!country || !numberType || !endUserType)) {
      return res.status(400).json(errorResponse(
        new Error('Either regulationSid or (country, numberType, endUserType) must be provided')
      ));
    }

    const result = await initializeRegulatoryBundle({
      friendlyName,
      notificationEmail,
      country,
      numberType,
      endUserType,
      regulationSid,
      statusCallbackUrl: statusCallbackUrl || process.env.STATUS_CALLBACK_URL
    });

    // Save to storage
    storage.saveInquiry({
      inquiryId: result.inquiryId,
      product: 'regulatory-bundle',
      complianceRegistrationId: result.complianceRegistrationId,
      bundleSid: result.bundleSid,
      status: 'initialized',
      friendlyName,
      country
    });

    res.json(successResponse(result));
  } catch (error) {
    res.status(500).json(errorResponse(error));
  }
});

/**
 * POST /api/compliance/regulatory-bundle/resume
 * Resume an existing Regulatory Bundle inquiry
 */
router.post('/regulatory-bundle/resume', async (req, res) => {
  try {
    const { registrationId } = req.body;

    if (!registrationId) {
      return res.status(400).json(errorResponse(
        new Error('registrationId is required')
      ));
    }

    const result = await resumeRegulatoryBundle(registrationId);

    // Update storage
    storage.saveInquiry({
      inquiryId: result.inquiryId,
      product: 'regulatory-bundle',
      complianceRegistrationId: result.complianceRegistrationId,
      status: 'resumed'
    });

    res.json(successResponse(result));
  } catch (error) {
    res.status(500).json(errorResponse(error));
  }
});

// ========================================
// Branded Calling Endpoints
// ========================================

/**
 * POST /api/compliance/branded-calling/initialize
 * Initialize a new Branded Calling inquiry
 * Note: Branded Calling does NOT support resume
 */
router.post('/branded-calling/initialize', async (req, res) => {
  try {
    const {
      viSid,
      pnSids,
      legalBusinessName,
      shortDisplayName,
      longDisplayName,
      purposeOfCall
    } = req.body;

    // Validation
    if (!viSid) {
      return res.status(400).json(errorResponse(
        new Error('viSid (Voice Integrity Bundle SID) is required')
      ));
    }

    if (!pnSids || !Array.isArray(pnSids) || pnSids.length === 0) {
      return res.status(400).json(errorResponse(
        new Error('pnSids (Phone Number SIDs) array is required')
      ));
    }

    const result = await initializeBrandedCalling({
      viSid,
      pnSids,
      legalBusinessName,
      shortDisplayName,
      longDisplayName,
      purposeOfCall
    });

    // Save to storage
    storage.saveInquiry({
      inquiryId: result.inquiryId,
      product: 'branded-calling',
      registrationId: result.registrationId,
      status: 'initialized',
      viSid,
      phoneNumberCount: pnSids.length
    });

    res.json(successResponse(result));
  } catch (error) {
    res.status(500).json(errorResponse(error));
  }
});

// ========================================
// Australia Alphanumeric Sender ID Endpoints
// ========================================

/**
 * POST /api/compliance/au-alphanumeric/initialize
 * Initialize a new Australia Alphanumeric Sender ID registration
 */
router.post('/au-alphanumeric/initialize', async (req, res) => {
  try {
    const {
      friendlyName,
      notificationEmail,
      senderId,
      headquartersCountry,
      proofOfSenderId,
      businessName,
      businessWebsite,
      useCaseCategory,
      messageVolume,
      statusCallbackUrl
    } = req.body;

    // Validation
    if (!friendlyName || !notificationEmail || !senderId) {
      return res.status(400).json(errorResponse(
        new Error('friendlyName, notificationEmail, and senderId are required')
      ));
    }

    // Validate sender ID format (2-11 alphanumeric characters, must contain at least one letter)
    if (!/^[a-zA-Z0-9]{2,11}$/.test(senderId)) {
      return res.status(400).json(errorResponse(
        new Error('senderId must be 2-11 alphanumeric characters')
      ));
    }

    if (!/[a-zA-Z]/.test(senderId)) {
      return res.status(400).json(errorResponse(
        new Error('senderId must contain at least one letter')
      ));
    }

    const result = await initializeAustraliaAlphanumeric({
      friendlyName,
      notificationEmail,
      senderId,
      headquartersCountry,
      proofOfSenderId,
      businessName,
      businessWebsite,
      useCaseCategory,
      messageVolume,
      statusCallbackUrl
    });

    // Store inquiry
    storage.saveInquiry({
      inquiryId: result.inquiryId,
      product: 'au-alphanumeric',
      registrationId: result.registrationId,
      status: result.status || 'initialized',
      senderId,
      friendlyName,
      businessName
    });

    res.json(successResponse(result));
  } catch (error) {
    res.status(500).json(errorResponse(error));
  }
});

/**
 * POST /api/compliance/au-alphanumeric/resume
 * Resume an existing Australia Alphanumeric Sender ID registration
 */
router.post('/au-alphanumeric/resume', async (req, res) => {
  try {
    const { registrationId } = req.body;

    if (!registrationId) {
      return res.status(400).json(errorResponse(
        new Error('registrationId is required')
      ));
    }

    const result = await resumeAustraliaAlphanumeric(registrationId);

    // Update stored inquiry
    storage.saveInquiry({
      inquiryId: result.inquiryId,
      product: 'au-alphanumeric',
      registrationId: result.registrationId,
      status: 'resumed'
    });

    res.json(successResponse(result));
  } catch (error) {
    res.status(500).json(errorResponse(error));
  }
});

// ========================================
// Inquiry Management Endpoints
// ========================================

/**
 * GET /api/compliance/inquiries
 * Get all inquiries from storage
 */
router.get('/inquiries', (req, res) => {
  try {
    const inquiries = storage.getAllInquiries();
    res.json(successResponse({ inquiries }));
  } catch (error) {
    res.status(500).json(errorResponse(error));
  }
});

/**
 * GET /api/compliance/inquiries/:id
 * Get a specific inquiry by ID
 */
router.get('/inquiries/:id', (req, res) => {
  try {
    const inquiry = storage.getInquiry(req.params.id);

    if (!inquiry) {
      return res.status(404).json(errorResponse(
        new Error('Inquiry not found')
      ));
    }

    res.json(successResponse({ inquiry }));
  } catch (error) {
    res.status(500).json(errorResponse(error));
  }
});

module.exports = router;
