const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const mongoose = require('mongoose');
const MONGO_URI = process.env.MONGO_URI;

if (MONGO_URI) {
    mongoose.connect(MONGO_URI)
        .then(() => console.log('MongoDB connected successfully'))
        .catch(err => console.error('MongoDB connection error:', err));
} else {
    console.warn("WARNING: MONGO_URI not found in .env. Database will not work.");
}

// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Health Endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'Platform API is active and secure' });
});

app.listen(PORT, () => {
    console.log(`RAPLIFY Secure Backend running on port ${PORT}`);
});
