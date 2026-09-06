const express = require('express');
const router = express.Router();
const { getAllUsers } = require('../controllers/adminUsersController');
const { adminProtect } = require('../middleware/adminAuthMiddleware');

router.get('/', adminProtect, getAllUsers);

module.exports = router;
