require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const connectDB = require('../config/db.config');

const users = [
    {
        email: 'admin@buksu.edu.ph',
        password: 'admin123',
        name: 'Admin User',
        role: 'admin'
    },
    {
        email: 'faculty@buksu.edu.ph',
        password: 'faculty123',
        name: 'Faculty User',
        role: 'faculty'
    },
    {
        email: 'student@student.buksu.edu.ph',
        password: 'student123',
        name: 'Student User',
        role: 'student'
    }
];

async function seedUsers() {
    let connection;
    try {
        console.log('Attempting to connect to MongoDB...');
        // Connect to database
        connection = await connectDB();
        console.log('Successfully connected to MongoDB');
        
        // Delete existing users
        console.log('Deleting existing users...');
        await User.deleteMany({});
        console.log('Successfully deleted all existing users');

        // Hash passwords and create new users
        console.log('Creating new users...');
        const hashedUsers = await Promise.all(users.map(async user => {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(user.password, salt);
            return {
                ...user,
                password: hashedPassword
            };
        }));

        // Insert new users
        const createdUsers = await User.insertMany(hashedUsers);
        console.log('\nUsers seeded successfully:');
        createdUsers.forEach(user => {
            console.log(`- ${user.name} (${user.email}) - ${user.role}`);
        });

        // Print login credentials
        console.log('\nLogin Credentials:');
        users.forEach(user => {
            console.log(`\n${user.role.toUpperCase()}:`);
            console.log(`Email: ${user.email}`);
            console.log(`Password: ${user.password}`);
        });

    } catch (error) {
        console.error('\nError seeding users:', error);
        console.error('\nFull error:', error.stack);
    } finally {
        // Close database connection
        if (connection) {
            try {
                await mongoose.connection.close();
                console.log('\nDatabase connection closed successfully');
            } catch (err) {
                console.error('\nError closing database connection:', err);
            }
        }
        // Force exit to prevent hanging
        process.exit(0);
    }
}

// Run the seeder
console.log('Starting user seeder...');
seedUsers();
