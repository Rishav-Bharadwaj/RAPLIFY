const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['customer', 'seller'],
        required: true,
    },
    uniqueCode: {
        type: String,
    },
    name: {
        type: String,
        default: '',
    },
    email: {
        type: String,
        default: '',
    },
    address: {
        type: String,
        default: '',
    },
    lat: {
        type: Number,
        default: 0,
    },
    lng: {
        type: Number,
        default: 0,
    },
    isNewProfile: {
        type: Boolean,
        default: true,
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
