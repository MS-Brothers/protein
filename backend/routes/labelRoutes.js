const express = require('express');
const router = express.Router();
const { saveLabel, getLabels } = require('../controllers/labelController');
const { adminProtect } = require('../middleware/adminAuthMiddleware');

// Protect all routes with admin middleware
router.use(adminProtect);

router.post('/', saveLabel);
router.get('/', getLabels);

module.exports = router;
