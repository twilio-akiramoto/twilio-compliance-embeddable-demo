const { User } = require('../models');
const { hashPassword } = require('./auth.service');

/**
 * Create a new user
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Created user (without password)
 */
async function createUser({ email, password, username, role = 'customer', companyName }) {
  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user
  const user = await User.create({
    email,
    passwordHash,
    username,
    role,
    companyName,
    isActive: true
  });

  // Return user without password
  const userObj = user.toJSON();
  delete userObj.passwordHash;

  return userObj;
}

/**
 * Get user by email
 * @param {string} email - User email
 * @param {boolean} includePassword - Include password hash in result
 * @returns {Promise<Object|null>} User object or null
 */
async function getUserByEmail(email, includePassword = false) {
  const user = await User.findOne({
    where: { email, isActive: true }
  });

  if (!user) return null;

  const userObj = user.toJSON();
  if (!includePassword) {
    delete userObj.passwordHash;
  }

  return userObj;
}

/**
 * Get user by ID
 * @param {string} id - User ID
 * @returns {Promise<Object|null>} User object or null
 */
async function getUserById(id) {
  const user = await User.findOne({
    where: { id, isActive: true }
  });

  if (!user) return null;

  const userObj = user.toJSON();
  delete userObj.passwordHash;

  return userObj;
}

/**
 * Update user
 * @param {string} id - User ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated user
 */
async function updateUser(id, updates) {
  const user = await User.findByPk(id);

  if (!user) {
    throw new Error('User not found');
  }

  // Don't allow updating password directly through this method
  if (updates.password) {
    delete updates.password;
  }

  await user.update(updates);

  const userObj = user.toJSON();
  delete userObj.passwordHash;

  return userObj;
}

/**
 * Update last login timestamp
 * @param {string} id - User ID
 * @returns {Promise<void>}
 */
async function updateLastLogin(id) {
  await User.update(
    { lastLogin: new Date() },
    { where: { id } }
  );
}

/**
 * Soft delete user
 * @param {string} id - User ID
 * @returns {Promise<void>}
 */
async function deleteUser(id) {
  await User.update(
    { isActive: false },
    { where: { id } }
  );
}

/**
 * Get all users by role
 * @param {string} role - User role (customer, csm, admin)
 * @returns {Promise<Array>} Array of users
 */
async function getUsersByRole(role) {
  const users = await User.findAll({
    where: { role, isActive: true },
    attributes: { exclude: ['passwordHash'] }
  });

  return users.map(user => user.toJSON());
}

module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
  updateUser,
  updateLastLogin,
  deleteUser,
  getUsersByRole
};
