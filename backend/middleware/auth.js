const { verifyToken } = require('../services/auth.service');
const { getUserById } = require('../services/user.service');

/**
 * Middleware to validate JWT token and attach user to request
 */
async function authenticate(req, res, next) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No authentication token provided'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Get current user from database to ensure they still exist and are active
    const user = await getUserById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found or inactive'
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      error: 'Authentication failed'
    });
  }
}

/**
 * Middleware to require specific role(s)
 * @param {string|Array<string>} roles - Required role(s)
 * @returns {Function} Express middleware function
 */
function requireRole(roles) {
  // Normalize to array
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Required role: ${allowedRoles.join(' or ')}`
      });
    }

    next();
  };
}

/**
 * Middleware for CSM-only endpoints
 */
const requireCSM = requireRole(['csm', 'admin']);

/**
 * Middleware for admin-only endpoints
 */
const requireAdmin = requireRole('admin');

/**
 * Middleware for customer endpoints
 */
const requireCustomer = requireRole('customer');

module.exports = {
  authenticate,
  requireRole,
  requireCSM,
  requireAdmin,
  requireCustomer
};
