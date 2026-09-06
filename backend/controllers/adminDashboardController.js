const db = require('../config/db');

const getDashboardStats = async (req, res) => {
  try {
    // 1. Total Authentication Codes
    const [totalCodesRows] = await db.query('SELECT COUNT(*) as count FROM authentication_codes');
    const totalCodes = totalCodesRows[0].count;

    // 2. Total Genuine Verifications
    const [genuineRows] = await db.query('SELECT COUNT(*) as count FROM verification_history WHERE verification_status = "GENUINE"');
    const totalGenuine = genuineRows[0].count;

    // 3. Total Already Verified Attempts
    const [alreadyVerifiedRows] = await db.query('SELECT COUNT(*) as count FROM verification_history WHERE verification_status = "ALREADY_VERIFIED"');
    const totalAlreadyVerified = alreadyVerifiedRows[0].count;

    // 4. Total Invalid Verification Attempts
    const [invalidRows] = await db.query('SELECT COUNT(*) as count FROM verification_history WHERE verification_status = "INVALID"');
    const totalInvalid = invalidRows[0].count;

    res.status(200).json({
      success: true,
      data: {
        totalCodes,
        totalGenuine,
        totalAlreadyVerified,
        totalInvalid
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error.message);
    res.status(500).json({ success: false, message: 'Server error fetching dashboard stats' });
  }
};

module.exports = {
  getDashboardStats
};
