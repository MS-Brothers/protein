const express = require('express');
const router = express.Router();
const { getDashboardStats, getUsedLabels } = require('../controllers/adminDashboardController');
const { adminProtect } = require('../middleware/adminAuthMiddleware');

// GET /api/admin/dashboard/stats
router.get('/stats', adminProtect, getDashboardStats);

// GET /api/admin/dashboard/labels-used
router.get('/labels-used', adminProtect, getUsedLabels);

module.exports = router;
