const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function (req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mysecretkey123');
    
    // Check if token is about to expire (within 5 minutes)
    const tokenExp = decoded.exp * 1000; // Convert to milliseconds
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    
    // Find user in database to ensure they still exist
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found.' });
    }

    // Add user information to request
    req.user = {
      id: user._id,
      username: user.username,
      email: user.email
    };

    // If token is about to expire, issue a new one
    if (tokenExp - now < fiveMinutes) {
      const newToken = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET || 'mysecretkey123',
        { expiresIn: '24h' }
      );
      
      // Send new token in response header
      res.header('x-auth-token', newToken);
      res.header('Access-Control-Expose-Headers', 'x-auth-token');
    }
    
    next();
  } catch (ex) {
    console.error('Token verification error:', ex);
    if (ex.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired.' });
    }
    if (ex.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    res.status(401).json({ error: 'Invalid token.' });
  }
}; 