const express = require('express');
const router = express.Router();
const { authenticate, requireCSM } = require('../middleware/auth');
const {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  assignCSM,
  updateCustomerStatus
} = require('../services/customer.service');
const { sendInvitation } = require('../services/email.service');
const { Registration, Customer, User } = require('../models');
const { Op } = require('sequelize');

// All dashboard routes require CSM authentication
router.use(authenticate);
router.use(requireCSM);

/**
 * GET /api/dashboard/customers
 * List all customers with filters and pagination
 */
router.get('/customers', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, assignedCSM } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (assignedCSM) filters.assignedCSM = assignedCSM;

    const result = await getAllCustomers({
      page: parseInt(page),
      limit: parseInt(limit),
      ...filters
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customers'
    });
  }
});

/**
 * GET /api/dashboard/customers/:id
 * Get customer details with registrations
 */
router.get('/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await getCustomerById(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    res.json({
      success: true,
      data: {
        customer
      }
    });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customer'
    });
  }
});

/**
 * POST /api/dashboard/invitations
 * Send invitation to customer
 */
router.post('/invitations', async (req, res) => {
  try {
    const { businessName, contactEmail, businessWebsite, assignedCSM, metadata } = req.body;

    // Validate input
    if (!businessName || !contactEmail) {
      return res.status(400).json({
        success: false,
        error: 'Business name and contact email are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({
      where: { contactEmail }
    });

    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        error: 'A customer with this email already exists'
      });
    }

    // Create customer with invitation token
    const customer = await createCustomer({
      businessName,
      contactEmail,
      businessWebsite,
      assignedCSM: assignedCSM || req.user.id, // Default to current CSM
      metadata
    });

    // Send invitation email
    const emailResult = await sendInvitation(
      contactEmail,
      customer.invitationToken,
      businessName
    );

    res.json({
      success: true,
      data: {
        customer,
        email: emailResult
      }
    });
  } catch (error) {
    console.error('Send invitation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send invitation'
    });
  }
});

/**
 * POST /api/dashboard/invitations/resend
 * Resend invitation to customer
 */
router.post('/invitations/resend', async (req, res) => {
  try {
    const { customerId } = req.body;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        error: 'Customer ID is required'
      });
    }

    const customer = await getCustomerById(customerId);

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    // Check if customer already has a user account
    if (customer.userId) {
      return res.status(400).json({
        success: false,
        error: 'Customer has already registered'
      });
    }

    // Send invitation email with existing token
    const emailResult = await sendInvitation(
      customer.contactEmail,
      customer.invitationToken,
      customer.businessName
    );

    // Update invitation sent timestamp
    await Customer.update(
      { invitationSentAt: new Date() },
      { where: { id: customerId } }
    );

    res.json({
      success: true,
      data: {
        email: emailResult
      }
    });
  } catch (error) {
    console.error('Resend invitation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to resend invitation'
    });
  }
});

/**
 * GET /api/dashboard/metrics
 * Get dashboard metrics
 */
router.get('/metrics', async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    const daysAgo = timeRange === '7d' ? 7 : timeRange === '90d' ? 90 : 30;
    const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    // Total customers
    const totalCustomers = await Customer.count();

    // Invitations sent this period
    const invitationsSent = await Customer.count({
      where: {
        invitationSentAt: {
          [Op.gte]: startDate
        }
      }
    });

    // Active registrations (in progress)
    const activeRegistrations = await Registration.count({
      where: {
        status: {
          [Op.in]: ['draft', 'in_review', 'in_progress']
        }
      }
    });

    // Completed registrations
    const completedRegistrations = await Registration.count({
      where: {
        status: 'approved',
        completedAt: {
          [Op.gte]: startDate
        }
      }
    });

    // Approval rate
    const totalSubmitted = await Registration.count({
      where: {
        status: {
          [Op.in]: ['approved', 'rejected']
        },
        completedAt: {
          [Op.gte]: startDate
        }
      }
    });

    const approvalRate = totalSubmitted > 0
      ? Math.round((completedRegistrations / totalSubmitted) * 100)
      : 0;

    // Status breakdown
    const statusBreakdown = await Customer.findAll({
      attributes: [
        'invitationStatus',
        [Customer.sequelize.fn('COUNT', Customer.sequelize.col('id')), 'count']
      ],
      group: ['invitationStatus']
    });

    // Registrations over time (last 30 days)
    const registrationsOverTime = await Registration.findAll({
      attributes: [
        [Registration.sequelize.fn('DATE', Registration.sequelize.col('created_at')), 'date'],
        [Registration.sequelize.fn('COUNT', Registration.sequelize.col('id')), 'count']
      ],
      where: {
        createdAt: {
          [Op.gte]: startDate
        }
      },
      group: [Registration.sequelize.fn('DATE', Registration.sequelize.col('created_at'))],
      order: [[Registration.sequelize.fn('DATE', Registration.sequelize.col('created_at')), 'ASC']]
    });

    res.json({
      success: true,
      data: {
        metrics: {
          totalCustomers,
          invitationsSent,
          activeRegistrations,
          completedRegistrations,
          approvalRate
        },
        charts: {
          statusBreakdown: statusBreakdown.map(s => s.toJSON()),
          registrationsOverTime: registrationsOverTime.map(r => r.toJSON())
        }
      }
    });
  } catch (error) {
    console.error('Get metrics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch metrics'
    });
  }
});

/**
 * GET /api/dashboard/registrations
 * List all registrations with filters
 */
router.get('/registrations', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, registrationType } = req.query;

    const where = {};
    if (status) where.status = status;
    if (registrationType) where.registrationType = registrationType;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Registration.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'businessName', 'contactEmail']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        registrations: rows.map(r => r.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / parseInt(limit))
        }
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
 * PUT /api/dashboard/customers/:id/assign
 * Assign CSM to customer
 */
router.put('/customers/:id/assign', async (req, res) => {
  try {
    const { id } = req.params;
    const { csmId } = req.body;

    if (!csmId) {
      return res.status(400).json({
        success: false,
        error: 'CSM ID is required'
      });
    }

    // Verify CSM exists and has correct role
    const csm = await User.findByPk(csmId);

    if (!csm || !['csm', 'admin'].includes(csm.role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid CSM'
      });
    }

    const customer = await assignCSM(id, csmId);

    res.json({
      success: true,
      data: {
        customer
      }
    });
  } catch (error) {
    console.error('Assign CSM error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to assign CSM'
    });
  }
});

/**
 * PUT /api/dashboard/customers/:id/status
 * Update customer status
 */
router.put('/customers/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['sent', 'opened', 'logged_in', 'in_progress', 'completed'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    const customer = await updateCustomerStatus(id, status);

    res.json({
      success: true,
      data: {
        customer
      }
    });
  } catch (error) {
    console.error('Update customer status error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update customer status'
    });
  }
});

module.exports = router;
