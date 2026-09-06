const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'ghx_protein_auth_jwt_secret_key_2026';

const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password' });
  }

  const cleanEmail = email.trim();

  try {
    // Check if admins table has any rows; if empty, auto-create initial admins
    const [countResult] = await db.query('SELECT COUNT(*) as cnt FROM admins');
    if (countResult[0].cnt === 0) {
      const defaultHash = await bcrypt.hash('Admin@12345', 10);
      await db.query(
        'INSERT INTO admins (admin_id, name, email, password_hash) VALUES (?, ?, ?, ?), (?, ?, ?, ?)',
        [
          'ADM-001', 'System Administrator', 'contact@globalhorizonexim.co.in', defaultHash,
          'ADM-002', 'Admin Local', 'admin@protein.local', defaultHash
        ]
      );
    }

    const [admins] = await db.query(
      'SELECT * FROM admins WHERE LOWER(email) = LOWER(?) OR admin_id = ? LIMIT 1',
      [cleanEmail, cleanEmail]
    );

    if (admins.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const admin = admins[0];

    if (!admin.is_active) {
      return res.status(403).json({ success: false, message: 'Admin account is inactive' });
    }

    const isMatch = await bcrypt.compare(password, admin.password_hash);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, isAdmin: true },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(200).json({
      success: true,
      message: 'Admin login successful',
      data: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        token
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: error.code === 'ER_NO_SUCH_TABLE'
        ? 'Database tables not initialized. Please import schema.sql into phpMyAdmin.'
        : `Database error: ${error.message}`
    });
  }
};

const getAdminProfile = async (req, res) => {
  try {
    const adminId = req.admin.id;
    const [admins] = await db.query('SELECT id, admin_id, name, email, is_active, created_at FROM admins WHERE id = ?', [adminId]);
    
    if (admins.length === 0) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    res.status(200).json({ success: true, data: admins[0] });
  } catch (error) {
    console.error('Get admin profile error:', error.message);
    res.status(500).json({ success: false, message: 'Server error while fetching profile' });
  }
};

const updateAdminProfile = async (req, res) => {
  const { name, email } = req.body;
  const adminId = req.admin.id;

  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'Name and email are required' });
  }

  try {
    // Check if email belongs to another admin
    const [existing] = await db.query('SELECT id FROM admins WHERE email = ? AND id != ? LIMIT 1', [email, adminId]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email is already in use by another admin' });
    }

    await db.query('UPDATE admins SET name = ?, email = ? WHERE id = ?', [name, email, adminId]);
    
    res.status(200).json({ success: true, message: 'Profile updated successfully', data: { name, email } });
  } catch (error) {
    console.error('Update admin profile error:', error.message);
    res.status(500).json({ success: false, message: 'Server error while updating profile' });
  }
};

const changeAdminPassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const adminId = req.admin.id;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Current password and new password are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
  }

  try {
    const [admins] = await db.query('SELECT * FROM admins WHERE id = ? LIMIT 1', [adminId]);

    if (admins.length === 0) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    const admin = admins[0];
    const isMatch = await bcrypt.compare(currentPassword, admin.password_hash);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect current password' });
    }

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    await db.query('UPDATE admins SET password_hash = ? WHERE id = ?', [newPasswordHash, adminId]);

    res.status(200).json({ success: true, message: 'Password changed successfully. Please log in again.' });
  } catch (error) {
    console.error('Change admin password error:', error.message);
    res.status(500).json({ success: false, message: 'Server error while changing password' });
  }
};

module.exports = {
  loginAdmin,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword
};
