// Global error handlers for uncaught exceptions and unhandled promise rejections
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
// --- CLEANED UP SERVER.JS ---
// Fixed booking creation with basePrice and bookingNumber - v1.1
console.log('Starting server.js...');
const express = require('express');
const path = require('path');
console.log('Loaded express');
require('./models/Review');
console.log('Loaded Review model');
const cors = require('cors');
console.log('Loaded cors');
const helmet = require('helmet');
console.log('Loaded helmet');
const compression = require('compression');
console.log('Loaded compression');
const cookieParser = require('cookie-parser');
console.log('Loaded cookie-parser');
const rateLimit = require('express-rate-limit');
console.log('Loaded express-rate-limit');
const mongoose = require('mongoose');
console.log('Loaded mongoose');
const { createServer } = require('http');
console.log('Loaded http');
const { Server } = require('socket.io');
console.log('Loaded socket.io');
require('dotenv').config();
console.log('Loaded dotenv');

const authRoutes = require('./routes/auth');
console.log('Loaded authRoutes');
const userRoutes = require('./routes/users');
console.log('Loaded userRoutes');
const serviceRoutes = require('./routes/services');
console.log('Loaded serviceRoutes');
const bookingRoutes = require('./routes/bookings');
console.log('Loaded bookingRoutes');
const providerRoutes = require('./routes/providers');
console.log('Loaded providerRoutes');
const reviewRoutes = require('./routes/reviews');
console.log('Loaded reviewRoutes');
const paymentRoutes = require('./routes/payments');
console.log('Loaded paymentRoutes');
const uploadRoutes = require('./routes/upload');
console.log('Loaded uploadRoutes');
const adminRoutes = require('./routes/admin');
console.log('Loaded adminRoutes');
const mpesaRoutes = require('./routes/mpesa');
console.log('Loaded mpesaRoutes');
const providerOnboardingRoutes = require('./routes/provider');
console.log('Loaded providerOnboardingRoutes');
const providerServiceRoutes = require('./routes/providerServices');
console.log('Loaded providerServiceRoutes');
const providerBookingRoutes = require('./routes/providerBookings');
console.log('Loaded providerBookingRoutes');
const dashboardRoutes = require('./routes/dashboard');
console.log('Loaded dashboardRoutes');
const providerMatchingRoutes = require('./routes/providerMatching');
console.log('Loaded providerMatchingRoutes');
const enhancedProviderMatchingRoutes = require('./routes/enhancedProviderMatching');
console.log('Loaded enhancedProviderMatchingRoutes');

const errorHandler = require('./middleware/errorHandler');
console.log('Loaded errorHandler');
const logger = require('./utils/logger');
console.log('Loaded logger');

console.log('Creating Express app...');
const app = express();
const server = createServer(app);
console.log('Initializing Socket.IO...');
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

console.log('Setting up routes and middleware...');
app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX || 100,
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());
app.use(limiter);
// Production-ready CORS configuration
const allowedOrigins = [
  "http://localhost:3000", // Development frontend
  "http://192.168.56.1:3000", // Local network
  process.env.CLIENT_URL, // Production frontend URL
  "https://www.solutilconnect.com", // Main production domain
  "https://solutil-git-main-stanondieckis-projects.vercel.app", // Vercel deployment
  "https://solutil-1hdie2qqg-stanondieckis-projects.vercel.app" // Vercel deployment
].filter(Boolean); // Remove any undefined values

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl} - ${req.ip}`);
  next();
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Solutil API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes); // Legacy services API
app.use('/api/v2/services', require('./routes/servicesV2')); // 🆕 Enhanced services API
app.use('/api/bookings', bookingRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/payments/mpesa', mpesaRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/verification', require('./routes/adminVerification')); // Enhanced email verification admin panel
app.use('/api/provider', providerOnboardingRoutes);
app.use('/api/provider-services', providerServiceRoutes);
app.use('/api/provider-bookings', providerBookingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/booking', providerMatchingRoutes);
app.use('/api/booking', enhancedProviderMatchingRoutes);
app.use('/api/booking', require('./routes/ultimateProviderDiscovery')); // 🚀 Ultimate provider discovery system

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

app.use(errorHandler);

io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.id}`);
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    logger.info(`User ${userId} joined their room`);
  });
  socket.on('booking_update', (data) => {
    io.to(`user_${data.clientId}`).emit('booking_status_update', data);
    io.to(`user_${data.providerId}`).emit('booking_status_update', data);
  });
  socket.on('send_message', (data) => {
    io.to(`user_${data.recipientId}`).emit('new_message', data);
  });
  socket.on('provider_location_update', (data) => {
    socket.broadcast.emit('provider_location', data);
  });
  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
});

let dbConnected = false;
const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    const localUri = 'mongodb://localhost:27017/solutil';
    const atlasUri = process.env.MONGODB_URI;
    let conn;
    try {
      console.log('Trying local MongoDB...');
      conn = await Promise.race([
        mongoose.connect(localUri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 3000,
          connectTimeoutMS: 3000
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Local connection timeout')), 5000))
      ]);
      console.log(`✅ Local MongoDB Connected: ${conn.connection.host}`);
      dbConnected = true;
    } catch (localError) {
      console.log('Local MongoDB failed, trying Atlas...');
      try {
        conn = await Promise.race([
          mongoose.connect(atlasUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 5000
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Atlas connection timeout')), 8000))
        ]);
        console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
        dbConnected = true;
      } catch (atlasError) {
        throw atlasError;
      }
    }
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.warn('⚠️  Starting in FALLBACK MODE without database connection');
    console.warn('⚠️  Mock data will be served until database is available');
    logger.warn('Database connection failed, running in fallback mode:', error);
    dbConnected = false;
  }
};

global.isDbConnected = () => dbConnected;

process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    if (dbConnected) {
      mongoose.connection.close();
    }
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    if (dbConnected) {
      mongoose.connection.close();
    }
    process.exit(0);
  });
});

const PORT = process.env.PORT || 5000;
console.log('Starting Solutil API Server...');
const startServer = async () => {
  console.log('Calling connectDB...');
  try {
    await connectDB();
    console.log('connectDB finished, starting server.listen...');
  } catch (err) {
    console.error('Error in connectDB:', err);
  }
  console.log('About to call server.listen...');
  server.listen(PORT, () => {
    console.log(`🚀 Solutil API Server running on port ${PORT}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 CORS Origin: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
    console.log(`💾 Database Status: ${dbConnected ? 'Connected' : 'Fallback Mode (Mock Data)'}`);
    logger.info(`🚀 Solutil API Server running on port ${PORT}`);
    logger.info(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🌐 CORS Origin: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
    logger.info(`💾 Database Status: ${dbConnected ? 'Connected' : 'Fallback Mode'}`);
    if (process.env.NODE_ENV === 'development') {
      logger.info(`📋 API Documentation: http://localhost:${PORT}/api/health`);
    }
  });
};

startServer().catch(error => {
  logger.error('Failed to start server:', error);
  server.listen(PORT, () => {
    console.log(`🚀 Solutil API Server running on port ${PORT} (Emergency Mode)`);
    logger.info(`🚀 Solutil API Server running on port ${PORT} (Emergency Mode)`);
  });
});

module.exports = { app, io };
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  logger.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  logger.error('Unhandled Rejection:', reason);
});
