const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Using the URI directly from environment variables
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            dbName: 'billmaster',
            // Remove deprecated options and add recommended ones
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 10
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Add connection event listeners
        mongoose.connection.on('connected', () => {
            console.log('Mongoose connected to MongoDB');
        });

        mongoose.connection.on('error', (err) => {
            console.error('Mongoose connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('Mongoose disconnected');
        });

        return conn;
    } catch (error) {
        console.error('MongoDB connection error:', {
            message: error.message,
            code: error.code,
            name: error.name
        });
        throw error;
    }
};

module.exports = connectDB; 