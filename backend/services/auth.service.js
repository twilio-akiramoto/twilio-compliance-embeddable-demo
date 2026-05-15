const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '24h';
const SALT_ROUNDS = 10;

/**
 * Generate JWT token for a user
 * @param {Object} user - User object with id, email, role
 * @returns {string} JWT token
 */
function generateToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    username: user.username
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
}

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded token payload or null if invalid
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
}

/**
 * Hash password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify password against hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} True if password matches
 */
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Generate secure random token for invitations
 * @returns {string} Random token
 */
function generateInvitationToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate password reset token
 * @returns {string} Random token
 */
function generatePasswordResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

module.exports = {
  generateToken,
  verifyToken,
  hashPassword,
  verifyPassword,
  generateInvitationToken,
  generatePasswordResetToken
};
