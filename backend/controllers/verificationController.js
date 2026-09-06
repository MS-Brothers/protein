const db = require('../config/db');

const verifyProduct = async (req, res) => {
  const { authenticationCode } = req.body;
  const user_id = req.user.id; // User is authenticated via JWT

  if (!authenticationCode || authenticationCode.trim() === '') {
    return res.status(400).json({ success: false, message: 'Authentication code is required' });
  }

  // Normalize code
  const normalizedCode = authenticationCode.trim().toUpperCase();

  try {
    // Search the authentication_codes table
    const [codes] = await db.query(
      'SELECT id, authentication_code, product_name, sku, batch_number, status, first_verified_at FROM authentication_codes WHERE authentication_code = ? LIMIT 1',
      [normalizedCode]
    );

    if (codes.length === 0 || codes[0].status !== 'ACTIVE') {
      // Code not found or inactive -> Invalid
      await db.query(
        'INSERT INTO verification_history (user_id, authentication_code, verification_status) VALUES (?, ?, ?)',
        [user_id, normalizedCode, 'INVALID']
      );

      return res.status(404).json({
        success: false,
        message: 'The authentication code is invalid or does not exist.',
      });
    }

    const productInfo = codes[0];

    if (productInfo.first_verified_at !== null) {
      // Already verified
      await db.query(
        'INSERT INTO verification_history (user_id, authentication_code, verification_status) VALUES (?, ?, ?)',
        [user_id, normalizedCode, 'ALREADY_VERIFIED']
      );

      const responseData = {
        verificationStatus: 'Already Verified',
        firstVerifiedAt: productInfo.first_verified_at,
        authenticationCode: normalizedCode
      };
      
      if (productInfo.product_name) {
        responseData.productName = productInfo.product_name;
        responseData.batchNumber = productInfo.batch_number;
      }

      return res.status(200).json({
        success: true,
        message: 'Product Already Verified',
        data: responseData
      });
    }

    // Code found and NOT previously verified -> Genuine
    // Update the first_verified_at timestamp
    const now = new Date();
    await db.query(
      'UPDATE authentication_codes SET first_verified_at = ? WHERE authentication_code = ?',
      [now, normalizedCode]
    );

    await db.query(
      'INSERT INTO verification_history (user_id, authentication_code, verification_status) VALUES (?, ?, ?)',
      [user_id, normalizedCode, 'GENUINE']
    );

    const responseData = {
      verificationStatus: 'Verified',
      verifiedAt: now.toISOString(),
      authenticationCode: normalizedCode
    };

    if (productInfo.product_name) {
      responseData.productName = productInfo.product_name;
      responseData.batchNumber = productInfo.batch_number;
    }

    return res.status(200).json({
      success: true,
      message: 'Genuine Product',
      data: responseData
    });
  } catch (error) {
    console.error('Verification error:', error.message);
    res.status(500).json({ success: false, message: 'Server error during verification' });
  }
};

const getUserVerificationHistory = async (req, res) => {
  const user_id = req.user.id;

  try {
    const [history] = await db.query(
      `SELECT authentication_code, verification_status, verified_at 
       FROM verification_history 
       WHERE user_id = ? 
       ORDER BY verified_at DESC`,
      [user_id]
    );

    return res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error fetching user verification history:', error.message);
    res.status(500).json({ success: false, message: 'Server error fetching history' });
  }
};

module.exports = {
  verifyProduct,
  getUserVerificationHistory
};
