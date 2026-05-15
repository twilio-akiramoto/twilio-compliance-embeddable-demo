const { Customer, User, Registration } = require('../models');
const { generateInvitationToken } = require('./auth.service');

/**
 * Create a new customer (for invitation flow)
 * @param {Object} customerData - Customer data
 * @returns {Promise<Object>} Created customer with invitation token
 */
async function createCustomer({ businessName, contactEmail, businessWebsite, assignedCSM, metadata = {} }) {
  const invitationToken = generateInvitationToken();

  const customer = await Customer.create({
    businessName,
    contactEmail,
    businessWebsite,
    invitationToken,
    invitationSentAt: new Date(),
    invitationStatus: 'sent',
    assignedCSM,
    metadata
  });

  return customer.toJSON();
}

/**
 * Get customer by ID with related data
 * @param {string} id - Customer ID
 * @returns {Promise<Object|null>} Customer object or null
 */
async function getCustomerById(id) {
  const customer = await Customer.findByPk(id, {
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'username', 'lastLogin']
      },
      {
        model: User,
        as: 'csm',
        attributes: ['id', 'email', 'username']
      },
      {
        model: Registration,
        as: 'registrations'
      }
    ]
  });

  return customer ? customer.toJSON() : null;
}

/**
 * Get customer by user ID
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} Customer object or null
 */
async function getCustomerByUserId(userId) {
  const customer = await Customer.findOne({
    where: { userId },
    include: [
      {
        model: Registration,
        as: 'registrations'
      }
    ]
  });

  return customer ? customer.toJSON() : null;
}

/**
 * Get customer by invitation token
 * @param {string} token - Invitation token
 * @returns {Promise<Object|null>} Customer object or null
 */
async function getCustomerByInvitationToken(token) {
  const customer = await Customer.findOne({
    where: { invitationToken: token }
  });

  return customer ? customer.toJSON() : null;
}

/**
 * Get all customers with pagination and filters
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Customers and pagination info
 */
async function getAllCustomers({ page = 1, limit = 20, status, assignedCSM } = {}) {
  const offset = (page - 1) * limit;
  const where = {};

  if (status) {
    where.invitationStatus = status;
  }

  if (assignedCSM) {
    where.assignedCSM = assignedCSM;
  }

  const { count, rows } = await Customer.findAndCountAll({
    where,
    limit,
    offset,
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'username', 'lastLogin']
      },
      {
        model: User,
        as: 'csm',
        attributes: ['id', 'email', 'username']
      }
    ],
    order: [['createdAt', 'DESC']]
  });

  return {
    customers: rows.map(r => r.toJSON()),
    pagination: {
      page,
      limit,
      total: count,
      pages: Math.ceil(count / limit)
    }
  };
}

/**
 * Update customer status
 * @param {string} id - Customer ID
 * @param {string} status - New status
 * @returns {Promise<Object>} Updated customer
 */
async function updateCustomerStatus(id, status) {
  const customer = await Customer.findByPk(id);

  if (!customer) {
    throw new Error('Customer not found');
  }

  await customer.update({ invitationStatus: status });

  return customer.toJSON();
}

/**
 * Link customer to user account (after registration)
 * @param {string} customerId - Customer ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated customer
 */
async function linkCustomerToUser(customerId, userId) {
  const customer = await Customer.findByPk(customerId);

  if (!customer) {
    throw new Error('Customer not found');
  }

  await customer.update({
    userId,
    invitationStatus: 'logged_in'
  });

  return customer.toJSON();
}

/**
 * Assign CSM to customer
 * @param {string} customerId - Customer ID
 * @param {string} csmId - CSM user ID
 * @returns {Promise<Object>} Updated customer
 */
async function assignCSM(customerId, csmId) {
  const customer = await Customer.findByPk(customerId);

  if (!customer) {
    throw new Error('Customer not found');
  }

  await customer.update({ assignedCSM: csmId });

  return customer.toJSON();
}

/**
 * Get customer registrations
 * @param {string} customerId - Customer ID
 * @returns {Promise<Array>} Array of registrations
 */
async function getCustomerRegistrations(customerId) {
  const registrations = await Registration.findAll({
    where: { customerId },
    order: [['createdAt', 'DESC']]
  });

  return registrations.map(r => r.toJSON());
}

/**
 * Invalidate invitation token (after use)
 * @param {string} customerId - Customer ID
 * @returns {Promise<void>}
 */
async function invalidateInvitationToken(customerId) {
  await Customer.update(
    { invitationToken: null },
    { where: { id: customerId } }
  );
}

module.exports = {
  createCustomer,
  getCustomerById,
  getCustomerByUserId,
  getCustomerByInvitationToken,
  getAllCustomers,
  updateCustomerStatus,
  linkCustomerToUser,
  assignCSM,
  getCustomerRegistrations,
  invalidateInvitationToken
};
