const sgMail = require('@sendgrid/mail');

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@yourcompany.com';
const CUSTOMER_PORTAL_URL = process.env.CUSTOMER_PORTAL_URL || 'http://localhost:3020';

// Initialize SendGrid only if API key is provided
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
  console.log('✅ SendGrid initialized');
} else {
  console.warn('⚠️  SENDGRID_API_KEY not set - email sending will be simulated');
}

/**
 * Send invitation email to customer
 * @param {string} email - Customer email
 * @param {string} token - Invitation token
 * @param {string} businessName - Customer business name
 * @returns {Promise<Object>} Email send result
 */
async function sendInvitation(email, token, businessName) {
  const registrationUrl = `${CUSTOMER_PORTAL_URL}/register?token=${token}`;

  const msg = {
    to: email,
    from: FROM_EMAIL,
    subject: 'Complete Your Sender ID Registration',
    text: `
Hello,

You've been invited to register your sender ID for ${businessName}.

Please click the link below to complete your registration:
${registrationUrl}

This link will expire in 7 days.

If you have any questions, please contact our support team.

Best regards,
The Compliance Team
    `,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0263e0 0%, #0056b3 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #0263e0; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .button:hover { background: #0056b3; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Sender ID Registration Invitation</h1>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>You've been invited to complete your sender ID registration for <strong>${businessName}</strong>.</p>
      <p>To get started, please click the button below:</p>
      <p style="text-align: center;">
        <a href="${registrationUrl}" class="button">Complete Registration</a>
      </p>
      <p style="font-size: 14px; color: #666;">
        Or copy and paste this link into your browser:<br>
        <a href="${registrationUrl}">${registrationUrl}</a>
      </p>
      <p><strong>Note:</strong> This invitation link will expire in 7 days.</p>
      <p>If you have any questions, please contact our support team.</p>
      <p>Best regards,<br>The Compliance Team</p>
    </div>
    <div class="footer">
      <p>This is an automated message. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
    `
  };

  try {
    if (SENDGRID_API_KEY) {
      // Try to send real email via SendGrid
      try {
        await sgMail.send(msg);
        console.log(`✅ Invitation email sent to ${email}`);
        return { success: true, email, registrationUrl };
      } catch (sgError) {
        // If SendGrid fails, fall back to simulation
        console.warn(`⚠️  SendGrid error (${sgError.message}), falling back to simulation mode`);
        console.log(`📧 [SIMULATED] Invitation email to: ${email}`);
        console.log(`📧 Registration URL: ${registrationUrl}`);
        return { success: true, email, registrationUrl, simulated: true };
      }
    } else {
      // Simulate email sending for development
      console.log(`📧 [SIMULATED] Invitation email to: ${email}`);
      console.log(`📧 Registration URL: ${registrationUrl}`);
      return { success: true, email, registrationUrl, simulated: true };
    }
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    throw new Error(`Failed to send invitation email: ${error.message}`);
  }
}

/**
 * Send password reset email
 * @param {string} email - User email
 * @param {string} token - Password reset token
 * @returns {Promise<Object>} Email send result
 */
async function sendPasswordReset(email, token) {
  const resetUrl = `${CUSTOMER_PORTAL_URL}/reset-password?token=${token}`;

  const msg = {
    to: email,
    from: FROM_EMAIL,
    subject: 'Password Reset Request',
    text: `
You requested a password reset.

Click the link below to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request this, please ignore this email.
    `,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .button { display: inline-block; background: #0263e0; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Password Reset Request</h2>
    <p>You requested a password reset for your account.</p>
    <p><a href="${resetUrl}" class="button">Reset Password</a></p>
    <p>Or copy this link: ${resetUrl}</p>
    <p><strong>This link will expire in 1 hour.</strong></p>
    <p>If you didn't request this, please ignore this email.</p>
  </div>
</body>
</html>
    `
  };

  try {
    if (SENDGRID_API_KEY) {
      // Try to send real email via SendGrid
      try {
        await sgMail.send(msg);
        console.log(`✅ Password reset email sent to ${email}`);
        return { success: true, email, resetUrl };
      } catch (sgError) {
        // If SendGrid fails, fall back to simulation
        console.warn(`⚠️  SendGrid error (${sgError.message}), falling back to simulation mode`);
        console.log(`📧 [SIMULATED] Password reset email to: ${email}`);
        console.log(`📧 Reset URL: ${resetUrl}`);
        return { success: true, email, resetUrl, simulated: true };
      }
    } else {
      console.log(`📧 [SIMULATED] Password reset email to: ${email}`);
      console.log(`📧 Reset URL: ${resetUrl}`);
      return { success: true, email, resetUrl, simulated: true };
    }
  } catch (error) {
    console.error('❌ Error sending password reset email:', error.message);
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }
}

module.exports = {
  sendInvitation,
  sendPasswordReset
};
