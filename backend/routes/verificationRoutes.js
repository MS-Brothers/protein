const express = require('express');
const router = express.Router();
const { verifyProduct, getUserVerificationHistory } = require('../controllers/verificationController');
const { protect } = require('../middleware/authMiddleware');

router.post('/verify', protect, verifyProduct);
router.get('/history', protect, getUserVerificationHistory);

module.exports = router;
