require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user.model');

async function testDatabaseConnection() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            ssl: true,
            tlsAllowInvalidCertificates: true,
            tlsAllowInvalidHostnames: true
        });
        console.log('Connected to MongoDB');

        // Create a test user
        const testUser = new User({
            email: 'test@buksu.edu.ph',
            name: 'Test User',
            role: 'student'
        });

        // Save the user
        const savedUser = await testUser.save();
        console.log('Test user created:', savedUser);

        // Fetch all users
        const allUsers = await User.find();
        console.log('All users in database:', allUsers);

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        // Close the connection
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
}

// Run the test
testDatabaseConnection();
