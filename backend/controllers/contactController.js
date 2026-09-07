const { sendContactFormEmail } = require('../services/emailService');

/**
 * Handle contact form submissions and send email notification to globalhorizonexiim@gmail.com
 */
const submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    const senderMessage = message ? message.trim() : '';
    const senderEmail = email ? email.trim() : (req.user?.email || '');
    const senderName = name ? name.trim() : (req.user?.full_name || 'Customer');
    const senderPhone = phone ? phone.trim() : (req.user?.mobile || '');
    const userId = req.user?.user_id || req.body.userId || null;

    if (!senderMessage) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a message description.'
      });
    }

    if (!senderEmail) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address so we can reply to you.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(senderEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address format.'
      });
    }

    await sendContactFormEmail({
      name: senderName,
      email: senderEmail,
      phone: senderPhone,
      subject: subject ? subject.trim() : 'Support & Authentication Inquiry',
      message: senderMessage,
      userId
    });

    return res.status(200).json({
      success: true,
      message: 'Thank you! Your message has been sent to our support desk. We will get back to you shortly.'
    });
  } catch (error) {
    console.error('[contactController] Error processing contact submission:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to send message. Please check SMTP settings or try again later.'
    });
  }
};

module.exports = {
  submitContactForm
};
