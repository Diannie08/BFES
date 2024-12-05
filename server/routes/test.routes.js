const express = require('express');
const router = express.Router();
const User = require('../models/user.model');

// Test route to create a user
router.post('/create-test-user', async (req, res) => {
    try {
        const testUser = new User({
            email: 'test@buksu.edu.ph',
            name: 'Test User',
            role: 'student'
        });

        const savedUser = await testUser.save();
        res.json({
            message: 'Test user created successfully',
            user: savedUser
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error creating test user',
            error: error.message
        });
    }
});

// Test route to get all users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching users',
            error: error.message
        });
    }
});

module.exports = router;
