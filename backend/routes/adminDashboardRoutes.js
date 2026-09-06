const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/adminDashboardController');
const { adminProtect } = require('../middleware/adminAuthMiddleware');

// GET /api/admin/dashboard/stats
router.get('/stats', adminProtect, getDashboardStats);

module.exports = router;
