const express = require('express');
const router = express.Router();
const { authenticate, requireCustomer } = require('../middleware/auth');
const { getCustomerByUserId, updateCustomerStatus } = require('../services/customer.service');
const { updateUser } = require('../services/user.service');
const { Registration } = require('../models');

// All portal routes require authentication
router.use(authenticate);
router.use(requireCustomer);

/**
 * GET /api/portal/profile
 * Get logged-in customer profile
 */
router.get('/profile', async (req, res) => {
  try {
    const customer = await getCustomerByUserId(req.user.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer profile not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: req.user,
        customer
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile'
    });
  }
});

/**
 * PUT /api/portal/profile
 * Update customer profile
 */
router.put('/profile', async (req, res) => {
  try {
    const { username, companyName, businessWebsite } = req.body;

    // Update user info
    const updates = {};
    if (username) updates.username = username;
    if (companyName) updates.companyName = companyName;

    if (Object.keys(updates).length > 0) {
      await updateUser(req.user.id, updates);
    }

    // Update customer info
    const customer = await getCustomerByUserId(req.user.id);
    if (customer && businessWebsite) {
      const { Customer } = require('../models');
      await Customer.update(
        { businessWebsite },
        { where: { id: customer.id } }
      );
    }

    // Fetch updated profile
    const updatedCustomer = await getCustomerByUserId(req.user.id);

    res.json({
      success: true,
      data: {
        customer: updatedCustomer
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
});

/**
 * GET /api/portal/registrations
 * List customer's registrations
 */
router.get('/registrations', async (req, res) => {
  try {
    const customer = await getCustomerByUserId(req.user.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    const registrations = await Registration.findAll({
      where: { customerId: customer.id },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        registrations: registrations.map(r => r.toJSON())
      }
    });
  } catch (error) {
    console.error('Get registrations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch registrations'
    });
  }
});

/**
 * POST /api/portal/registrations/au-alphanumeric
 * Start AU Alphanumeric Sender ID registration
 */
router.post('/registrations/au-alphanumeric', async (req, res) => {
  try {
    const customer = await getCustomerByUserId(req.user.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    const { senderId, ...registrationData } = req.body;

    // Validate sender ID
    if (!senderId || senderId.length < 2 || senderId.length > 11) {
      return res.status(400).json({
        success: false,
        error: 'Sender ID must be between 2 and 11 characters'
      });
    }

    if (!/[a-zA-Z]/.test(senderId)) {
      return res.status(400).json({
        success: false,
        error: 'Sender ID must contain at least one letter'
      });
    }

    // Create registration record
    const registration = await Registration.create({
      customerId: customer.id,
      registrationType: 'au-alphanumeric',
      senderId,
      status: 'draft',
      data: registrationData,
      startedAt: new Date()
    });

    // Update customer status to 'in_progress'
    await updateCustomerStatus(customer.id, 'in_progress');

    res.json({
      success: true,
      data: {
        registration: registration.toJSON()
      }
    });
  } catch (error) {
    console.error('Create AU registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create registration'
    });
  }
});

/**
 * GET /api/portal/registrations/:id/status
 * Check registration status
 */
router.get('/registrations/:id/status', async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await getCustomerByUserId(req.user.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    // Find registration and verify ownership
    const registration = await Registration.findOne({
      where: {
        id,
        customerId: customer.id
      }
    });

    if (!registration) {
      return res.status(404).json({
        success: false,
        error: 'Registration not found'
      });
    }

    res.json({
      success: true,
      data: {
        registration: registration.toJSON()
      }
    });
  } catch (error) {
    console.error('Get registration status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch registration status'
    });
  }
});

/**
 * PUT /api/portal/registrations/:id
 * Update registration (for saving progress)
 */
router.put('/registrations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, twilioRegistrationId, twilioInquiryId, data } = req.body;

    const customer = await getCustomerByUserId(req.user.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    // Find registration and verify ownership
    const registration = await Registration.findOne({
      where: {
        id,
        customerId: customer.id
      }
    });

    if (!registration) {
      return res.status(404).json({
        success: false,
        error: 'Registration not found'
      });
    }

    // Update fields
    const updates = {};
    if (status) updates.status = status;
    if (twilioRegistrationId) updates.twilioRegistrationId = twilioRegistrationId;
    if (twilioInquiryId) updates.twilioInquiryId = twilioInquiryId;
    if (data) updates.data = { ...registration.data, ...data };

    // Set completedAt if status is approved
    if (status === 'approved') {
      updates.completedAt = new Date();

      // Update customer status to 'completed'
      await updateCustomerStatus(customer.id, 'completed');
    }

    await registration.update(updates);

    res.json({
      success: true,
      data: {
        registration: registration.toJSON()
      }
    });
  } catch (error) {
    console.error('Update registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update registration'
    });
  }
});

module.exports = router;
