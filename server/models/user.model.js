const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function(email) {
                return email.endsWith('@buksu.edu.ph') || email.endsWith('@student.buksu.edu.ph');
            },
            message: props => `${props.value} is not a valid BukSU email address!`
        }
    },
    password: {
        type: String,
        required: function() {
            return !this.googleId; // Password is required only if not using Google login
        }
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    name: {
        type: String,
        required: true
    },
    picture: {
        type: String
    },
    role: {
        type: String,
        enum: ['student', 'faculty', 'admin'],
        default: 'student'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Method to check if email domain is valid
userSchema.methods.isValidBuksuEmail = function() {
    return this.email.endsWith('@buksu.edu.ph') || this.email.endsWith('@student.buksu.edu.ph');
};

const User = mongoose.model('User', userSchema);

module.exports = User;
