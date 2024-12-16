const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const googleClient = require('../config/google.config');
const User = require('../models/user.model');
const EvaluationForm = require('../models/evaluationForm.model'); // Assuming you have this model
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const axios = require('axios'); // Added axios for reCAPTCHA verification

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'ies595871@gmail.com',
    pass: process.env.EMAIL_PASS || 'eran atdc ezij yfhs'
  }
});

// Store verification codes temporarily (in production, use Redis or a database)
const verificationCodes = new Map();

// Comprehensive debug middleware for ALL routes
router.use((req, res, next) => {
  console.log('=== AUTH ROUTE MIDDLEWARE ===');
  console.log('Full Request Details:');
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('Base URL:', req.baseUrl);
  console.log('Original URL:', req.originalUrl);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  
  // Log all registered routes
  router.stack.forEach((r) => {
    if (r.route && r.route.path) {
      console.log(`Registered route: ${r.route.path}`);
    }
  });
  
  next();
});

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }
      
      // Get fresh user data from database
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      req.user = user;
      next();
    });
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

// Explicit test routes
router.get('/ping', (req, res) => {
  res.json({ 
    message: 'Pong!', 
    timestamp: new Date().toISOString() 
  });
});

router.post('/echo', (req, res) => {
  res.json({
    message: 'Request received',
    method: req.method,
    body: req.body,
    headers: req.headers
  });
});

// Debug route to verify auth routes are working
router.get('/test-routes', (req, res) => {
  console.log('Auth routes are accessible');
  res.json({ 
    message: 'Auth routes are working', 
    routes: [
      '/google-register',
      '/google',
      '/register',
      '/login',
      '/verify-token'
    ]
  });
});

router.post('/google', async (req, res) => {
  console.log('Google authentication route called');
  try {
    const { token } = req.body;
    
    // Verify the Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    
    // Here you would typically:
    // 1. Check if user exists in your database
    // 2. Create user if they don't exist
    // 3. Generate a JWT token for your application
    
    const user = {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      googleId: payload.sub
    };

    // Generate JWT token
    const jwtToken = jwt.sign(
      { id: user.googleId, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      token: jwtToken,
      user: {
        email: user.email,
        name: user.name,
        picture: user.picture
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

router.post('/register', async (req, res) => {
  console.log('Registration route called');
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      name: `${firstName} ${lastName}`,
      email,
      password: hashedPassword,
      role: 'student' // default role
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      token,
      user: {
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// New route for Google registration with role selection
router.post('/google-register', async (req, res) => {
  console.log('=== EXPLICIT GOOGLE REGISTER ROUTE CALLED ===');
  console.log('Full Request Details:');
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('Base URL:', req.baseUrl);
  console.log('Original URL:', req.originalUrl);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);

  try {
    const { 
      email, 
      firstName, 
      lastName, 
      googleId, 
      role 
    } = req.body;

    // Validate input with extensive logging
    if (!email) {
      console.error('Validation Error: Email is missing');
      return res.status(400).json({ 
        error: true,
        message: 'Email is required',
        receivedData: req.body
      });
    }

    if (!role) {
      console.error('Validation Error: Role is missing');
      return res.status(400).json({ 
        error: true,
        message: 'Role is required',
        receivedData: req.body
      });
    }

    // Validate role
    const validRoles = ['student', 'faculty', 'admin'];
    if (!validRoles.includes(role)) {
      console.error('Validation Error: Invalid role');
      return res.status(400).json({ 
        error: true,
        message: 'Invalid role selected. Must be student, faculty, or admin.',
        receivedData: req.body,
        validRoles: validRoles
      });
    }

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      console.log('User already exists, updating role');
      // If user exists but no role is set, update the role
      if (!user.role) {
        user.role = role;
        await user.save();
      }
    } else {
      console.log('Creating new user');
      // Create new user
      // Generate a random password for Google users
      const salt = await bcrypt.genSalt(10);
      const randomPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      user = new User({
        name: `${firstName} ${lastName}`,
        email,
        password: hashedPassword,
        role,
        googleId,
        registrationType: 'google'
      });

      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        role: user.role 
      }, 
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );

    // Return user info and token
    console.log('Registration successful');
    res.status(200).json({
      error: false,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('=== GOOGLE REGISTRATION ERROR ===');
    console.error('Full error:', error);
    res.status(500).json({ 
      error: true,
      message: 'Server error during Google registration',
      details: error.message,
      stack: error.stack
    });
  }
});

// Test route to verify endpoint is working
router.get('/test-login', (req, res) => {
  console.log('Test login route called');
  res.json({ message: 'Login route is accessible' });
});

router.post('/login', async (req, res) => {
  try {
    const { email, password, recaptchaResponse } = req.body;

    // Verify reCAPTCHA
    const recaptchaVerification = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY || '6LeBAZ0qAAAAAGaeOOQD1nRb4-bNP5wj-z-IcYcq',
          response: recaptchaResponse
        }
      }
    );

    if (!recaptchaVerification.data.success) {
      return res.status(400).json({ message: 'reCAPTCHA verification failed' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Send response
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Route to verify token
router.get('/verify-token', verifyToken, (req, res) => {
  res.json({ 
    valid: true, 
    user: {
      id: req.user._id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role
    } 
  });
});

// Route to handle forgot password request
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a random 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store the code with expiration (15 minutes)
    verificationCodes.set(email, {
      code: verificationCode,
      expiresAt: Date.now() + 15 * 60 * 1000 // 15 minutes
    });

    // Send verification email
    const mailOptions = {
      from: process.env.EMAIL_USER || 'ies595871@gmail.com',
      to: email,
      subject: 'Password Reset Verification Code',
      html: `
        <h1>Password Reset Request</h1>
        <p>You have requested to reset your password. Here is your verification code:</p>
        <h2 style="color: #1a73e8; font-size: 24px; letter-spacing: 2px;">${verificationCode}</h2>
        <p>This code will expire in 15 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Verification code sent to email' });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Error sending verification code' });
  }
});

// Route to verify the code
router.post('/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;

    const storedData = verificationCodes.get(email);
    if (!storedData) {
      return res.status(400).json({ message: 'No verification code found' });
    }

    if (Date.now() > storedData.expiresAt) {
      verificationCodes.delete(email);
      return res.status(400).json({ message: 'Verification code has expired' });
    }

    if (storedData.code !== code) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    res.json({ message: 'Code verified successfully' });

  } catch (error) {
    console.error('Code verification error:', error);
    res.status(500).json({ message: 'Error verifying code' });
  }
});

// Route to reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Find user and update password
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user's password
    user.password = hashedPassword;
    await user.save();

    // Clear verification code
    verificationCodes.delete(email);

    res.json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
});

// Added API endpoint to fetch evaluations for a specific student by ID
router.get('/student/evaluations/:id', async (req, res) => {
    try {
        const evaluations = await EvaluationForm.find({ studentId: req.params.id });
        res.json(evaluations);
    } catch (error) {
        console.error('Error fetching evaluations:', error);
        res.status(500).json({ message: 'Error fetching evaluations' });
    }
});

// Export the router
module.exports = router;
