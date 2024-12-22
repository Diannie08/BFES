const mongoose = require('mongoose');

// Set strictQuery to false to prepare for Mongoose 7
mongoose.set('strictQuery', false);

const connectDB = async () => {
    try {
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            ssl: true,
            tls: true,
            retryWrites: true,
            w: 'majority',
            serverSelectionTimeoutMS: 20000 // Increase timeout to 20 seconds
        };

        // Remove any existing connections
        await mongoose.disconnect();

        // Create new connection
        const conn = await mongoose.connect(process.env.MONGODB_URI, options);
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
};

module.exports = connectDB;