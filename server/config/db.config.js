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
            tlsAllowInvalidCertificates: true,
            family: 4
        };

        // Remove any existing connections
        await mongoose.disconnect();

        // Create new connection
        const conn = await mongoose.connect(process.env.MONGODB_URI, options);
        
        // Test the connection
        await conn.connection.db.admin().ping();
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;
