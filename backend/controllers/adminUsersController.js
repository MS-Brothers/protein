const db = require('../config/db');

const getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, user_id, full_name, email, mobile, plaintext_password, marketing_consent, is_active, created_at FROM users ORDER BY created_at DESC'
    );
    
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching registered users:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching users' });
  }
};

module.exports = {
  getAllUsers
};
