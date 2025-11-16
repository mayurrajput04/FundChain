require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3001;

// ============ MIDDLEWARE ============

const allowedOrigins = [
  'http://localhost:5173',
  'https://your-production-domain.com'
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============ BASIC ROUTES ============

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'FundChain Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API info
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'FundChain API',
    endpoints: {
      health: 'GET /',
      auth: {
        requestMessage: 'POST /api/auth/request-message',
        verify: 'POST /api/auth/verify',
        logout: 'POST /api/auth/logout'
      },
      users: {
        register: 'POST /api/users/register',
        profile: 'GET /api/users/:address',
        checkUsername: 'POST /api/users/check-username'
      },
      campaigns: {
        getAll: 'GET /api/campaigns',
        getOne: 'GET /api/campaigns/:address',
        create: 'POST /api/campaigns',
        approve: 'POST /api/campaigns/:address/approve'
      }
    }
  });
});

// ============ PLACEHOLDER ROUTES ============

// Auth routes
app.post('/api/auth/request-message', (req, res) => {
  const { address } = req.body;
  res.json({
    success: true,
    message: `Sign this message to authenticate: ${address} - ${Date.now()}`,
    nonce: Math.random().toString(36).substring(7)
  });
});

app.post('/api/auth/verify', (req, res) => {
  res.json({
    success: true,
    message: 'Authentication endpoint (to be implemented)',
    token: 'placeholder-token'
  });
});

// User routes
app.post('/api/users/register', (req, res) => {
  const { walletAddress, username } = req.body;
  res.json({
    success: true,
    message: 'User registration endpoint (to be implemented)',
    data: { walletAddress, username }
  });
});

app.post('/api/users/check-username', (req, res) => {
  const { username } = req.body;
  res.json({
    success: true,
    available: true,
    username
  });
});

app.get('/api/users/:address', (req, res) => {
  res.json({
    success: true,
    message: 'User profile endpoint (to be implemented)',
    address: req.params.address
  });
});

// Campaign routes
app.get('/api/campaigns', (req, res) => {
  res.json({
    success: true,
    campaigns: [],
    message: 'Campaigns will be loaded from blockchain'
  });
});

app.get('/api/campaigns/:address', (req, res) => {
  res.json({
    success: true,
    message: 'Campaign details endpoint (to be implemented)',
    address: req.params.address
  });
});

// ============ ERROR HANDLING ============

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// ============ DATABASE CONNECTION (Optional for now) ============

const connectDB = async () => {
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ MongoDB connected');
    } catch (error) {
      console.log('⚠️  MongoDB connection failed:', error.message);
      console.log('   Backend will run without database');
    }
  } else {
    console.log('ℹ️  No MongoDB URI configured, running without database');
  }
};

// ============ START SERVER ============

const startServer = async () => {
  // Try to connect to database (optional)
  await connectDB();

  // Start Express server
  app.listen(PORT, () => {
    console.log('\n🚀 ================================');
    console.log('   FundChain Backend Server');
    console.log('   ================================');
    console.log(`   ✅ Server running on port ${PORT}`);
    console.log(`   📍 API: http://localhost:${PORT}`);
    console.log(`   📍 Health: http://localhost:${PORT}/`);
    console.log(`   🌐 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    console.log('   ================================\n');
  });
};

startServer();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});