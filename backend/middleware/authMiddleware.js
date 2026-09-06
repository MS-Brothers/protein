const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'ghx_protein_auth_jwt_secret_key_2026';

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, JWT_SECRET);
      
      // We attach the decoded user info to the request object.
      // This includes at least id, user_id, and email based on our login controller.
      req.user = decoded;

      next();
    } catch (error) {
      console.error('JWT Verification failed:', error.message);
      res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
