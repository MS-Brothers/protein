const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'ghx_protein_auth_jwt_secret_key_2026';

// Generate JWT Token
const generateToken = (id, user_id, email, full_name) => {
  return jwt.sign({ id, user_id, email, full_name }, JWT_SECRET, {
    expiresIn: '30d',
  });
};

const registerUser = async (req, res) => {
  const { fullName, email, mobile, password, confirmPassword, marketingConsent } = req.body;

  if (!fullName || !email || !mobile || !password || !confirmPassword) {
    return res.status(400).json({ success: false, message: 'Please provide all required fields' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email format' });
  }

  const mobileRegex = /^[0-9]{10,15}$/;
  if (!mobileRegex.test(mobile)) {
    return res.status(400).json({ success: false, message: 'Invalid mobile number' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'Passwords do not match' });
  }

  try {
    // Check if email or mobile exists
    const [existingUsers] = await db.query(
      'SELECT id, email, mobile FROM users WHERE email = ? OR mobile = ?',
      [email, mobile]
    );

    if (existingUsers.length > 0) {
      const isEmailDupe = existingUsers.some(u => u.email === email);
      if (isEmailDupe) {
        return res.status(400).json({ success: false, message: 'Email is already registered' });
      } else {
        return res.status(400).json({ success: false, message: 'Mobile number is already registered' });
      }
    }

    // Hash password (keep this for actual login security)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user with fallback for plaintext_password column if absent
    let result;
    try {
      [result] = await db.query(
        'INSERT INTO users (full_name, email, mobile, password_hash, plaintext_password, marketing_consent) VALUES (?, ?, ?, ?, ?, ?)',
        [fullName, email, mobile, passwordHash, password, marketingConsent || false]
      );
    } catch (insertErr) {
      if (insertErr.code === 'ER_BAD_FIELD_ERROR') {
        [result] = await db.query(
          'INSERT INTO users (full_name, email, mobile, password_hash, marketing_consent) VALUES (?, ?, ?, ?, ?)',
          [fullName, email, mobile, passwordHash, marketingConsent || false]
        );
      } else {
        throw insertErr;
      }
    }

    const insertId = result.insertId;
    const userIdString = `USR${100000 + insertId}`;

    // Update with generated user_id
    await db.query('UPDATE users SET user_id = ? WHERE id = ?', [userIdString, insertId]);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: insertId,
        user_id: userIdString,
        full_name: fullName,
        email: email,
        mobile: mobile,
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    let msg = 'Database error occurred during registration';
    if (error.code === 'ER_NO_SUCH_TABLE') {
      msg = 'Database tables not initialized. Please import database/schema.sql into phpMyAdmin.';
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ER_ACCESS_DENIED_ERROR') {
      msg = 'Database connection failed. Please check MySQL credentials in .env.';
    } else if (error.message) {
      msg = `Database error: ${error.message}`;
    }
    res.status(500).json({ success: false, message: msg });
  }
};

const loginUser = async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email/user ID and password' });
  }

  const cleanIdentifier = identifier.trim();

  try {
    // Find user by email or user_id (case-insensitive)
    const [users] = await db.query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER(?) OR LOWER(user_id) = LOWER(?) LIMIT 1',
      [cleanIdentifier, cleanIdentifier]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email/user ID or password' });
    }

    const user = users[0];

    // Check if account is active
    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email/user ID or password' });
    }

    const token = generateToken(user.id, user.user_id, user.email, user.full_name);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        mobile: user.mobile,
        token: token
      }
    });

  } catch (error) {
    console.error('User login error:', error);
    let msg = 'Database error occurred during login';
    if (error.code === 'ER_NO_SUCH_TABLE') {
      msg = 'Database tables not initialized. Please import database/schema.sql into phpMyAdmin.';
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ER_ACCESS_DENIED_ERROR') {
      msg = 'Database connection failed. Please check MySQL credentials in .env.';
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      msg = 'Database name not found. Please verify DB_NAME in .env.';
    } else if (error.message) {
      msg = `Database error: ${error.message}`;
    }
    res.status(500).json({ success: false, message: msg });
  }
};

const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../services/emailService');

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Please provide an email address' });
  }

  const cleanEmail = email.trim().toLowerCase();
  console.log(`[authController] Forgot password requested for email: ${cleanEmail}`);

  try {
    const [users] = await db.query('SELECT id, full_name, is_active FROM users WHERE LOWER(email) = ? LIMIT 1', [cleanEmail]);
    
    if (users.length === 0) {
      console.log(`[authController] No user found for email: ${cleanEmail}`);
      return res.status(404).json({
        success: false,
        message: 'No registered account found with this email. Please register first.'
      });
    }

    const user = users[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'This account is deactivated. Please contact customer support.'
      });
    }

    // Generate secure token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Token expires in 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Store hashed token
    await db.query(
      'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
      [user.id, tokenHash, expiresAt]
    );

    // Send email via Hostinger SMTP
    try {
      await sendPasswordResetEmail(cleanEmail, user.full_name, resetToken);
    } catch (emailError) {
      console.error('[authController] SMTP Delivery Error:', emailError);
      return res.status(500).json({
        success: false,
        message: `Email sending failed: ${emailError.message}. Check spam folder or contact support.`
      });
    }

    res.json({
      success: true,
      message: 'Password reset link has been sent to your email! (Please check your Inbox and Spam folder)'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
};

const resetPassword = async (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;

  if (!token || !newPassword || !confirmPassword) {
    return res.status(400).json({ success: false, message: 'Please provide token and new passwords' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'Passwords do not match' });
  }

  // Same password requirement rule (though the user asked to remove the 8-char rule previously, 
  // they explicitly requested here "must satisfy the same password-strength rules used during registration". 
  // I'll leave it simple per the last request).

  try {
    // Hash token to compare
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find token
    const [tokens] = await db.query(
      'SELECT id, user_id, expires_at, used_at FROM password_reset_tokens WHERE token_hash = ? LIMIT 1',
      [tokenHash]
    );

    if (tokens.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    const resetRecord = tokens[0];

    if (resetRecord.used_at !== null) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    if (new Date() > new Date(resetRecord.expires_at)) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    // Update password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, resetRecord.user_id]);

    // Mark token as used
    await db.query('UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = ?', [resetRecord.id]);

    res.json({ success: true, message: 'Password reset successfully.' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getMe = async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, user_id, full_name, email, mobile FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: users[0] });
  } catch (error) {
    console.error('getMe error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  const { email, mobile } = req.body;
  const userId = req.user.id;

  if (!email || !mobile) {
    return res.status(400).json({ success: false, message: 'Email and mobile are required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email format' });
  }

  const mobileRegex = /^[0-9]{10,15}$/;
  if (!mobileRegex.test(mobile)) {
    return res.status(400).json({ success: false, message: 'Invalid mobile number' });
  }

  try {
    // Check if email or mobile exists for OTHER users
    const [existingUsers] = await db.query(
      'SELECT id, email, mobile FROM users WHERE (email = ? OR mobile = ?) AND id != ?',
      [email, mobile, userId]
    );

    if (existingUsers.length > 0) {
      const isEmailDupe = existingUsers.some(u => u.email === email);
      if (isEmailDupe) {
        return res.status(400).json({ success: false, message: 'Email is already registered by another account' });
      } else {
        return res.status(400).json({ success: false, message: 'Mobile number is already registered by another account' });
      }
    }

    await db.query(
      'UPDATE users SET email = ?, mobile = ? WHERE id = ?',
      [email, mobile, userId]
    );

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error during profile update' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile
};

