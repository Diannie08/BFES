const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI; // Ensure this is set correctly in your .env file
console.log('MongoDB URI:', uri);
console.log('Environment Variables:', process.env);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const insertUser = async () => {
    try {
        await client.connect();
        const database = client.db('yourDatabaseName'); // Replace with your database name
        const users = database.collection('users');

        const newUser = {
            username: 'adminUser1',
            email: 'admin1@buksu.edu.ph',
            password: 'securePassword', // Make sure to hash the password in production
            role: 'admin'
        };

        const result = await users.insertOne(newUser);
        console.log(`User inserted with id: ${result.insertedId}`);
    } catch (error) {
        console.error('Error inserting user:', error);
    } finally {
        await client.close();
    }
};

insertUser();
