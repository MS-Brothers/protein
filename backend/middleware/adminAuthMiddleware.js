const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'ghx_protein_auth_jwt_secret_key_2026';

const adminProtect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Ensure the token belongs to an admin
      if (!decoded.isAdmin) {
        return res.status(403).json({ success: false, message: 'Not authorized as an admin' });
      }

      req.admin = decoded;
      next();
    } catch (error) {
      console.error('Admin JWT Verification failed:', error.message);
      res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

module.exports = { adminProtect };
