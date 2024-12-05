require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const connectDB = require('../config/db.config');

async function createTestUser() {
    try {
        // Connect to MongoDB
        await connectDB();

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('test123', salt);

        // Create test user
        const testUser = new User({
            email: 'test@buksu.edu.ph',
            password: hashedPassword,
            name: 'Test User',
            role: 'student'
        });

        // Save user
        await testUser.save();
        console.log('Test user created successfully:', {
            email: testUser.email,
            name: testUser.name,
            role: testUser.role
        });

    } catch (error) {
        console.error('Error creating test user:', error.message);
    } finally {
        // Close database connection
        await mongoose.connection.close();
    }
}

// Run the script
createTestUser();
