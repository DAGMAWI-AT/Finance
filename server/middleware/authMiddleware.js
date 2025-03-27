const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_secretKey;

const verifyToken = (req, res, next) => {
  // Get token from header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"
  
  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'Access denied. No token provided.' 
    });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded; // Add decoded user to request object
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ 
      success: false,
      message: 'Invalid or expired token.' 
    });
  }
};

module.exports = verifyToken;