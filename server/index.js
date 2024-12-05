require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db.config');
const authRoutes = require('./routes/auth.routes');
const testRoutes = require('./routes/test.routes');

const app = express();

// Connect to MongoDB
(async () => {
  try {
    await connectDB();
    console.log('Database connection established');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
})();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Allow your React app's origin
  credentials: true
}));
app.use(express.json());

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);

app.get('/api', (req, res) => {
    res.json({ message: "Welcome to IESv2 Server!" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Available routes:');
  console.log('- /api/auth/login (POST)');
  console.log('- /api/auth/test-login (GET)');
  console.log('- /api/auth/register (POST)');
});
