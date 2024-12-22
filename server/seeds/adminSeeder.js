const mongoose = require('mongoose');
const User = require('../models/user.model'); // Corrected path to User model

const seedAdminUser = async () => {
  const adminUser = {
    username: 'adminUser1',
    email: 'admin1@buksu.edu.ph',
    password: 'securePassword', // Use a hashed password in production
    role: 'admin'
  };

  try {
    const existingAdmin = await User.findOne({ email: adminUser.email });
    if (!existingAdmin) {
      await User.create(adminUser);
      console.log('Admin user seeded successfully.');
    } else {
      console.log('Admin user already exists.');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
};

seedAdminUser();
