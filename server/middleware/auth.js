const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const verifyToken = async (req, res, next) => {
  try {
    console.log('=== TOKEN VERIFICATION ===');
    console.log('Headers:', req.headers);
    
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        console.log('Invalid token:', err);
        return res.status(401).json({ message: 'Invalid token' });
      }
      
      // Get fresh user data from database
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        console.log('User not found');
        return res.status(401).json({ message: 'User not found' });
      }
      
      console.log('Token verified for user:', user.email);
      req.user = user;
      next();
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ message: 'Error verifying token' });
  }
};

module.exports = { verifyToken };
