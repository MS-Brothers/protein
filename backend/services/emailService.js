const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  const isSecure = process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465';
  
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: parseInt(process.env.SMTP_PORT, 10) || 465,
    secure: isSecure, // true for 465 (SSL), false for 587 (TLS/STARTTLS)
    auth: {
      user: process.env.SMTP_USER || 'contact@globalhorizonexim.co.in',
      pass: process.env.SMTP_PASS || 'Surekha@2004#'
    },
    tls: {
      rejectUnauthorized: false // Avoid self-signed certificate rejection issues
    }
  });
};

const sendPasswordResetEmail = async (toEmail, userName, resetToken) => {
  try {
    const transporter = createTransporter();
    const frontendUrl = process.env.FRONTEND_URL || 'https://globalhorizonexim.co.in';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
    const fromAddress = process.env.EMAIL_FROM || '"Global Horizon Exim" <contact@globalhorizonexim.co.in>';

    console.log(`[emailService] Sending password reset email to: ${toEmail} via SMTP (${process.env.SMTP_HOST || 'smtp.hostinger.com'})`);

    const mailOptions = {
      from: fromAddress,
      to: toEmail,
      subject: 'Password Reset Request - Global Horizon Exim',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #f8fafc; padding: 40px 15px;">
            <tr>
              <td align="center">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0,0,0,0.05); overflow: hidden;">
                  
                  <!-- Header with Logo/Title -->
                  <tr>
                    <td align="center" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 30px 20px; color: #ffffff;">
                      <h2 style="margin: 0 0 6px 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px; color: #ffffff;">GLOBAL HORIZON EXIM</h2>
                      <p style="margin: 0; font-size: 12px; color: #fbbf24; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700;">Protein Product Authentication</p>
                    </td>
                  </tr>

                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 35px 30px;">
                      <h3 style="margin: 0 0 12px 0; font-size: 18px; color: #0f172a; font-weight: 700;">Password Reset Request</h3>
                      <p style="margin: 0 0 18px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                        Hello <strong>${userName || 'Valued User'}</strong>,
                      </p>
                      <p style="margin: 0 0 25px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                        We received a request to reset the password for your account. Click the secure button below to set a new password:
                      </p>

                      <!-- Action Button -->
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 25px 0;">
                        <tr>
                          <td align="center">
                            <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 14px 28px; background-color: #2563eb; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 10px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);">
                              Reset Password
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin: 20px 0 0 0; font-size: 12px; line-height: 1.5; color: #94a3b8;">
                        ⏱️ <em>This password reset link is valid for <strong>1 hour</strong>.</em>
                      </p>
                      <p style="margin: 10px 0 0 0; font-size: 12px; line-height: 1.5; color: #94a3b8;">
                        If you did not request a password reset, please ignore this email or contact support if you suspect unauthorized activity.
                      </p>

                      <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 25px 0;" />

                      <p style="margin: 0; font-size: 11px; color: #94a3b8; word-break: break-all;">
                        Direct link: <a href="${resetUrl}" style="color: #2563eb;">${resetUrl}</a>
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td align="center" style="background-color: #f8fafc; padding: 18px 20px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b;">
                      &copy; ${new Date().getFullYear()} Global Horizon Exim. All rights reserved.
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[emailService] Password reset email sent successfully to ${toEmail}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('[emailService] Failed to send email via SMTP:', error.message);
    throw new Error('Email delivery failed. Please check SMTP settings.');
  }
};

module.exports = {
  sendPasswordResetEmail
};
