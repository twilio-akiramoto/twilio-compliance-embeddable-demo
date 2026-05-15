const express = require('express');
const router = express.Router();
const { generateToken, verifyPassword, generatePasswordResetToken } = require('../services/auth.service');
const { createUser, getUserByEmail } = require('../services/user.service');
const { getCustomerByInvitationToken, linkCustomerToUser, invalidateInvitationToken } = require('../services/customer.service');
const { sendPasswordReset } = require('../services/email.service');
const { authenticate } = require('../middleware/auth');

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Get user with password hash
    const user = await getUserByEmail(email, true);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Update last login timestamp
    const { updateLastLogin } = require('../services/user.service');
    await updateLastLogin(user.id);

    // Remove password hash from response
    delete user.passwordHash;

    res.json({
      success: true,
      data: {
        token,
        user
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed. Please try again.'
    });
  }
});

/**
 * POST /api/auth/signup
 * Create new customer account via invitation token
 */
router.post('/signup', async (req, res) => {
  try {
    const { token, email, password, username, companyName } = req.body;

    // Validate input
    if (!token || !email || !password || !username) {
      return res.status(400).json({
        success: false,
        error: 'Token, email, password, and username are required'
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long'
      });
    }

    // Verify invitation token
    const customer = await getCustomerByInvitationToken(token);

    if (!customer) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired invitation token'
      });
    }

    // Verify email matches invitation
    if (customer.contactEmail !== email) {
      return res.status(400).json({
        success: false,
        error: 'Email does not match invitation'
      });
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email already exists'
      });
    }

    // Create user account
    const user = await createUser({
      email,
      password,
      username,
      role: 'customer',
      companyName: companyName || customer.businessName
    });

    // Link customer to user
    await linkCustomerToUser(customer.id, user.id);

    // Invalidate invitation token
    await invalidateInvitationToken(customer.id);

    // Generate JWT token for auto-login
    const jwtToken = generateToken(user);

    res.json({
      success: true,
      data: {
        token: jwtToken,
        user
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      error: 'Signup failed. Please try again.'
    });
  }
});

/**
 * POST /api/auth/verify-token
 * Validate JWT token and return user info
 */
router.post('/verify-token', authenticate, async (req, res) => {
  try {
    // If authenticate middleware passes, token is valid
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Token verification failed'
    });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh JWT token
 */
router.post('/refresh', authenticate, async (req, res) => {
  try {
    // Generate new token
    const newToken = generateToken(req.user);

    res.json({
      success: true,
      data: {
        token: newToken
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      error: 'Token refresh failed'
    });
  }
});

/**
 * POST /api/auth/password-reset
 * Request password reset email
 */
router.post('/password-reset', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    // Check if user exists
    const user = await getUserByEmail(email);

    if (!user) {
      // Don't reveal whether user exists
      return res.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = generatePasswordResetToken();

    // In a production system, you would:
    // 1. Store resetToken in database with expiration
    // 2. Send email with reset link
    // For now, we'll just send the email
    await sendPasswordReset(email, resetToken);

    res.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.'
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({
      success: false,
      error: 'Password reset request failed'
    });
  }
});

/**
 * POST /api/auth/password-reset/:token
 * Complete password reset with token
 */
router.post('/password-reset/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Password is required'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long'
      });
    }

    // In a production system, you would:
    // 1. Verify reset token from database
    // 2. Check token expiration
    // 3. Update user password
    // 4. Invalidate reset token

    // For now, return a placeholder response
    res.status(501).json({
      success: false,
      error: 'Password reset completion not yet implemented. Token and database integration required.'
    });
  } catch (error) {
    console.error('Password reset completion error:', error);
    res.status(500).json({
      success: false,
      error: 'Password reset failed'
    });
  }
});

/**
 * GET /api/auth/invitation/:token
 * Verify invitation token and return customer info
 */
router.get('/invitation/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const customer = await getCustomerByInvitationToken(token);

    if (!customer) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired invitation token'
      });
    }

    // Return customer info (without sensitive data)
    res.json({
      success: true,
      data: {
        businessName: customer.businessName,
        contactEmail: customer.contactEmail,
        businessWebsite: customer.businessWebsite
      }
    });
  } catch (error) {
    console.error('Invitation verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Invitation verification failed'
    });
  }
});

module.exports = router;
