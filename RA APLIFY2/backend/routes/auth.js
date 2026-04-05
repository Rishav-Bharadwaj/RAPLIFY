const express = require('express');
const router = express.Router();
const twilio = require('twilio');

// Load secure credentials from environment
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

let client;
if (accountSid && authToken) {
    client = twilio(accountSid, authToken);
} else {
    console.warn("WARNING: Twilio credentials not found in .env. Using mock implementation.");
}

// @route POST /api/auth/send-otp
// @desc Send OTP to phone number using Twilio Verify
router.post('/send-otp', async (req, res) => {
    const { phone } = req.body;
    
    if (!phone || phone.length < 10) {
        return res.status(400).json({ success: false, message: 'Invalid phone number' });
    }

    try {
        const formattedPhone = `+91${phone}`; // Assuming Indian numbers block, change if necessary
        
        if (client) {
            // Real SMS via Twilio
            const verification = await client.verify.v2.services(verifyServiceSid)
                .verifications
                .create({ to: formattedPhone, channel: 'sms' });
                
            res.json({ success: true, message: 'OTP sent successfully', status: verification.status });
        } else {
            // Mock Implementation for testing
            console.log(`[MOCK] Sending OTP to ${formattedPhone}`);
            res.json({ success: true, message: 'Mock OTP sent (Setup Twilio credentials in .env to enable real SMS)' });
        }
    } catch (error) {
        console.error("Twilio Error:", error);
        res.status(500).json({ success: false, message: 'Failed to send OTP', error: error.message });
    }
});

// @route POST /api/auth/verify-otp
// @desc Verify OTP using Twilio
router.post('/verify-otp', async (req, res) => {
    const { phone, otp } = req.body;
    
    if (!phone || !otp) {
        return res.status(400).json({ success: false, message: 'Phone and OTP required' });
    }

    try {
        const formattedPhone = `+91${phone}`;
        
        if (client) {
            // Real Verification
            const verificationCheck = await client.verify.v2.services(verifyServiceSid)
                .verificationChecks
                .create({ to: formattedPhone, code: otp });

            if (verificationCheck.status === 'approved') {
                res.json({ success: true, message: 'Phone verified successfully' });
            } else {
                res.status(400).json({ success: false, message: 'Invalid OTP' });
            }
        } else {
            // Mock Verification
            if (otp === '123456') {
                res.json({ success: true, message: 'Mock Verification Successful' });
            } else {
                res.status(400).json({ success: false, message: 'Invalid Mock OTP (Use 123456)' });
            }
        }
    } catch (error) {
        console.error("Verification Error:", error);
        res.status(500).json({ success: false, message: 'Verification failed', error: error.message });
    }
});

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'secret_raplify_key_123';

// @route POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { phone, password, role, uniqueCode } = req.body;
        
        let user = await User.findOne({ phone, role });
        if (user) {
            return res.status(400).json({ success: false, message: 'Phone already registered for this role.' });
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        user = new User({
            phone,
            password: hashedPassword,
            role,
            uniqueCode: uniqueCode || ''
        });
        
        await user.save();
        
        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
        
        res.json({ success: true, token, user: { id: user._id, phone: user.phone, role: user.role, isNewProfile: user.isNewProfile } });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ success: false, message: 'Server error during registration' });
    }
});

// @route POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { phone, password, role } = req.body;
        
        if (!phone || !password || !role) {
            return res.status(400).json({ success: false, message: 'Missing credentials.' });
        }
        
        const user = await User.findOne({ phone, role });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid phone or password.' });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid phone or password.' });
        }
        
        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
        res.json({ 
            success: true, 
            token, 
            user: { 
                id: user._id, phone: user.phone, role: user.role, name: user.name, 
                address: user.address, email: user.email, lat: user.lat, lng: user.lng, 
                isNewProfile: user.isNewProfile 
            } 
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
});

// @route POST /api/auth/seller-login
router.post('/seller-login', async (req, res) => {
    try {
        const { identifier, password } = req.body;
        
        if (!identifier || !password) {
            return res.status(400).json({ success: false, message: 'Missing credentials.' });
        }
        
        // Find seller by phone or uniqueCode
        const user = await User.findOne({ 
            role: 'seller', 
            $or: [{ phone: identifier }, { uniqueCode: identifier }] 
        });
        
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid credentials. Check your ID/phone and password.' });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid credentials. Check your ID/phone and password.' });
        }
        
        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
        res.json({ 
            success: true, 
            token, 
            user: { 
                id: user._id, phone: user.phone, role: user.role, name: user.name, uniqueCode: user.uniqueCode,
                address: user.address, email: user.email, lat: user.lat, lng: user.lng, 
                isNewProfile: user.isNewProfile 
            } 
        });
    } catch (error) {
        console.error('Seller login error:', error);
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
});

// @route POST /api/auth/profile
// @desc Update user profile details
router.post('/profile', async (req, res) => {
    try {
        // Simple token verification without a separate middleware for speed
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }
        
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        
        const updates = req.body;
        
        // Don't allow password or phone updates through this route directly
        delete updates.password;
        delete updates.phone;
        delete updates._id;

        // Apply isNew toggle
        if (updates.isNew !== undefined) {
             updates.isNewProfile = updates.isNew;
             delete updates.isNew;
        }
        
        const user = await User.findByIdAndUpdate(
            decoded.id, 
            { $set: updates }, 
            { new: true }
        );
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        res.json({ 
            success: true, 
            user: { 
                id: user._id, phone: user.phone, role: user.role, name: user.name, 
                address: user.address, email: user.email, lat: user.lat, lng: user.lng, 
                isNewProfile: user.isNewProfile, uniqueCode: user.uniqueCode 
            } 
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ success: false, message: 'Server error updating profile' });
    }
});

module.exports = router;
