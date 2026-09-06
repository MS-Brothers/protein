const express = require('express');
const router = express.Router();
const { loginAdmin, getAdminProfile, updateAdminProfile, changeAdminPassword } = require('../controllers/adminAuthController');
const { adminProtect } = require('../middleware/adminAuthMiddleware');

// POST /api/admin/auth/login
router.post('/login', loginAdmin);

// GET /api/admin/auth/profile
router.get('/profile', adminProtect, getAdminProfile);

// PUT /api/admin/auth/profile
router.put('/profile', adminProtect, updateAdminProfile);

// PUT /api/admin/auth/change-password
router.put('/change-password', adminProtect, changeAdminPassword);

module.exports = router;
