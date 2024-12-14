require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const connectDB = require('../config/db.config');

const seedUsers = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to database');

    // Check for existing users
    const existingUsers = await User.find({});
    
    if (existingUsers.length === 0) {
      // Create sample users
      const sampleUsers = [
        {
          name: 'Admin User',
          email: 'admin@example.com',
          password: await bcrypt.hash('admin123', 10),
          role: 'admin'
        },
        {
          name: 'John Smith',
          email: 'instructor1@example.com',
          password: await bcrypt.hash('instructor123', 10),
          role: 'instructor'
        },
        {
          name: 'Jane Doe',
          email: 'instructor2@example.com',
          password: await bcrypt.hash('instructor123', 10),
          role: 'instructor'
        },
        {
          name: 'Student One',
          email: 'student1@example.com',
          password: await bcrypt.hash('student123', 10),
          role: 'student'
        },
        {
          name: 'Student Two',
          email: 'student2@example.com',
          password: await bcrypt.hash('student123', 10),
          role: 'student'
        },
        {
          name: 'Student Three',
          email: 'student3@example.com',
          password: await bcrypt.hash('student123', 10),
          role: 'student'
        }
      ];

      console.log('Creating sample users...');
      await User.insertMany(sampleUsers);
      console.log('Sample users created successfully');
    } else {
      console.log(`${existingUsers.length} users already exist, skipping seeding`);
    }

    // Disconnect from database
    await mongoose.disconnect();
    console.log('Database connection closed');

  } catch (error) {
    console.error('Error seeding users:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Run the seeder
seedUsers();
