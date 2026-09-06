const express = require('express');
const router = express.Router();
const adminVerificationHistoryController = require('../controllers/adminVerificationHistoryController');
const { adminProtect } = require('../middleware/adminAuthMiddleware');

// Route to get verification history with pagination, search, and filtering
router.get('/', adminProtect, adminVerificationHistoryController.getVerificationHistory);

module.exports = router;
