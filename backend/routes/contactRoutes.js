const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { submitContactForm } = require('../controllers/contactController');

const JWT_SECRET = process.env.JWT_SECRET || 'ghx_protein_auth_jwt_secret_key_2026';

// Optional auth middleware so both authenticated and guest users can contact support
const optionalAuth = (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      // Ignore invalid token and continue as guest
    }
  }
  next();
};

router.post('/', optionalAuth, submitContactForm);

module.exports = router;
