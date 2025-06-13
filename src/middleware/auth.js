const jwt = require('jsonwebtoken');

// Development mode auth bypass for testing
const authMiddleware = (req, res, next) => {
  // In development or if BYPASS_AUTH is set, skip authentication
  if (process.env.NODE_ENV === 'development' || process.env.BYPASS_AUTH === 'true') {
    // Add a mock user for development
    req.user = {
      id: 'dev-user-123',
      email: 'dev@icatalyst.com',
      role: 'admin'
    };
    return next();
  }

  // Production authentication
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-fallback-secret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Optional auth middleware - allows both authenticated and non-authenticated requests
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-fallback-secret');
      req.user = decoded;
    } catch (error) {
      // Invalid token, but continue without user
    }
  }

  next();
};

module.exports = { authMiddleware, optionalAuth };