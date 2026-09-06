const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/health', async (req, res) => {
  try {
    // Check DB connection
    const connection = await db.getConnection();
    connection.release();
    
    res.json({
      success: true,
      message: 'Protein Authentication API is running',
      database: 'Connected'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Protein Authentication API is running but Database is disconnected',
      database: 'Not Connected',
      error: error.message
    });
  }
});

module.exports = router;
