const path = require('path');
const dotenv = require('dotenv');

// Resolve the absolute path to .env file
const envPath = path.resolve(__dirname, '..', '.env');
console.log('Looking for .env file at:', envPath);

// Load environment variables
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.warn('Warning: .env file not found, using environment variables');
}

const express = require('express');
const cors = require('cors');

// Initialize Express app first
const app = express();

// Debug logging - Railway specific
console.log('=== RAILWAY DEPLOYMENT DEBUG ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('DATABASE_URL present:', !!process.env.DATABASE_URL);
console.log('JWT_SECRET present:', !!process.env.JWT_SECRET);
console.log('Current working directory:', process.cwd());
console.log('__dirname:', __dirname);
console.log('================================');

// Import modules with error handling
let logger, errorHandler;
try {
  logger = require('./utils/logger').logger;
  console.log('✅ Logger loaded successfully');
} catch (err) {
  console.error('❌ Logger loading failed:', err.message);
  // Fallback console logger
  logger = {
    info: console.log,
    error: console.error,
    warn: console.warn
  };
}

try {
  errorHandler = require('./middleware/errorHandler').errorHandler;
  console.log('✅ Error handler loaded successfully');
} catch (err) {
  console.error('❌ Error handler loading failed:', err.message);
  // Fallback error handler
  errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  };
}

// Load routes with error handling
const routes = {};
try {
  routes.auth = require('./routes/auth.routes');
  routes.customers = require('./routes/customers.routes');
  routes.upload = require('./routes/upload.routes');
  routes.proposals = require('./routes/proposals.routes');
  routes.products = require('./routes/products.routes');
  routes.proposalPersonas = require('./routes/proposal-personas.routes');
  routes.properties = require('./routes/properties.routes');
  routes.testDb = require('./routes/test-db.routes');
  routes.portal = require('./routes/portal.routes');
  console.log('✅ All routes loaded successfully');
} catch (err) {
  console.error('❌ Route loading failed:', err.message);
  // Continue with available routes
}

const PORT = process.env.PORT || 3001;

// Enhanced CORS configuration for Railway and local development
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:3002',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001', 
    'http://127.0.0.1:3002',
    // Railway production URLs
    /\.railway\.app$/,
    /\.up\.railway\.app$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint for Railway
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'iCatalyst Smart Home CRM API Server',
    version: '1.0.0',
    status: 'running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      customers: '/api/customers',
      upload: '/api/upload',
      proposals: '/api/proposals',
      products: '/api/products',
      proposalPersonas: '/api/proposal-personas',
      properties: '/api/properties',
      testDb: '/api/test-db',
      portal: '/api/portal'
    }
  });
});

// Mount routes safely
if (routes.auth) app.use('/api/auth', routes.auth);
if (routes.customers) app.use('/api/customers', routes.customers);
if (routes.upload) app.use('/api/upload', routes.upload);
if (routes.proposals) app.use('/api/proposals', routes.proposals);
if (routes.products) app.use('/api/products', routes.products);
if (routes.proposalPersonas) app.use('/api/proposal-personas', routes.proposalPersonas);
if (routes.properties) app.use('/api/properties', routes.properties);
if (routes.testDb) app.use('/api/test-db', routes.testDb);
if (routes.portal) app.use('/api/portal', routes.portal);

// Error handling
app.use(errorHandler);

// Graceful shutdown handler
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

// Start server with proper error handling
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 iCatalyst CRM Server Started Successfully!');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🏠 API Root: http://localhost:${PORT}/`);
  logger.info(`iCatalyst CRM API Server started successfully on port ${PORT}`);
}).on('error', (err) => {
  console.error('❌ Server startup error:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  }
  logger.error('Server startup error:', err);
  process.exit(1);
}); 