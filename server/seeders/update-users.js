require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user.model');
const connectDB = require('../config/db.config');

const updateUsers = async () => {
  try {
    await connectDB();
    console.log('Connected to database');

    // Create some students if none exist
    const students = await User.find({ role: 'student' });
    
    if (students.length === 0) {
      const newStudents = [
        {
          name: 'John Student',
          email: 'john.student@buksu.edu.ph',
          password: '$2a$10$XFE/UQEXfwOxHqwR8QmOZ.tG5Z.GQqwTH.AC98ra4znT1hh6WyH1S', // 'password123'
          role: 'student'
        },
        {
          name: 'Jane Student',
          email: 'jane.student@buksu.edu.ph',
          password: '$2a$10$XFE/UQEXfwOxHqwR8QmOZ.tG5Z.GQqwTH.AC98ra4znT1hh6WyH1S', // 'password123'
          role: 'student'
        },
        {
          name: 'Bob Student',
          email: 'bob.student@buksu.edu.ph',
          password: '$2a$10$XFE/UQEXfwOxHqwR8QmOZ.tG5Z.GQqwTH.AC98ra4znT1hh6WyH1S', // 'password123'
          role: 'student'
        }
      ];

      await User.insertMany(newStudents);
      console.log('Created new student users');
    }

    // Ensure we have at least 2 instructors
    const instructors = await User.find({ role: 'instructor' });
    if (instructors.length < 2) {
      const numToUpdate = 2 - instructors.length;
      const result = await User.updateMany(
        { role: { $ne: 'instructor' } },
        { $set: { role: 'instructor' } },
        { limit: numToUpdate }
      );
      console.log(`Updated ${result.modifiedCount} users to instructors`);
    }

    // Show current user counts
    const finalCounts = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('Current user counts:', finalCounts);
    
    await mongoose.disconnect();
    console.log('Database connection closed');

  } catch (error) {
    console.error('Error updating users:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

updateUsers();
