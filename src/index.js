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

// Railway environment variable fallbacks
if (!process.env.DATABASE_URL) {
  console.warn('⚠️ DATABASE_URL missing - Railway variable configuration issue detected');
  // Railway PostgreSQL service typically uses this internal format
  process.env.DATABASE_URL = process.env.PGURL || 
    `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`;
}

if (!process.env.JWT_SECRET) {
  console.warn('⚠️ JWT_SECRET missing - using fallback');
  process.env.JWT_SECRET = 'iCatalyst2024SecureKey!';
}

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
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
console.log('DATABASE_URL length:', process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0);
console.log('JWT_SECRET present:', !!process.env.JWT_SECRET);
console.log('JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);

// Railway PostgreSQL debug info
console.log('Railway PG Variables:');
console.log('PGHOST:', process.env.PGHOST);
console.log('PGPORT:', process.env.PGPORT);
console.log('PGDATABASE:', process.env.PGDATABASE);
console.log('PGUSER:', process.env.PGUSER);
console.log('PGPASSWORD present:', !!process.env.PGPASSWORD);
console.log('PGURL present:', !!process.env.PGURL);

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
    uptime: process.uptime(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL_present: !!process.env.DATABASE_URL,
      JWT_SECRET_present: !!process.env.JWT_SECRET
    }
  });
});

// Environment debug endpoint
app.get('/debug/env', (req, res) => {
  res.json({
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    DATABASE_URL_present: !!process.env.DATABASE_URL,
    DATABASE_URL_length: process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0,
    JWT_SECRET_present: !!process.env.JWT_SECRET,
    JWT_SECRET_length: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0,
    RAILWAY_VARS: {
      PGHOST: process.env.PGHOST,
      PGPORT: process.env.PGPORT,
      PGDATABASE: process.env.PGDATABASE,
      PGUSER: process.env.PGUSER,
      PGPASSWORD_present: !!process.env.PGPASSWORD,
      PGURL_present: !!process.env.PGURL
    }
  });
});

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve Next.js static files in production
if (process.env.NODE_ENV === 'production') {
  console.log('🎯 Production mode: Setting up Next.js static file serving');
  
  // Serve Next.js static assets
  const nextStaticPath = path.join(__dirname, '../out');
  const nextBuildPath = path.join(__dirname, '../.next');
  
  console.log('Next.js static path:', nextStaticPath);
  console.log('Next.js build path:', nextBuildPath);
  
  // Serve Next.js static files
  app.use('/_next', express.static(path.join(nextBuildPath, 'static')));
  app.use('/static', express.static(path.join(nextStaticPath, 'static')));
  
  // Try to serve from out directory first (static export), then from .next
  try {
    const fs = require('fs');
    if (fs.existsSync(nextStaticPath)) {
      console.log('✅ Found Next.js static export directory');
      app.use(express.static(nextStaticPath));
    } else if (fs.existsSync(nextBuildPath)) {
      console.log('✅ Found Next.js build directory');
      app.use(express.static(nextBuildPath));
    } else {
      console.warn('⚠️ No Next.js build directory found - API only mode');
    }
  } catch (err) {
    console.warn('⚠️ Error setting up Next.js static serving:', err.message);
  }
}

// Mount API routes with /api prefix
if (routes.auth) app.use('/api/auth', routes.auth);
if (routes.customers) app.use('/api/customers', routes.customers);
if (routes.upload) app.use('/api/upload', routes.upload);
if (routes.proposals) app.use('/api/proposals', routes.proposals);
if (routes.products) app.use('/api/products', routes.products);
if (routes.proposalPersonas) app.use('/api/proposal-personas', routes.proposalPersonas);
if (routes.properties) app.use('/api/properties', routes.properties);
if (routes.testDb) app.use('/api/test-db', routes.testDb);
if (routes.portal) app.use('/api/portal', routes.portal);

// API root endpoint (for debugging)
app.get('/api', (req, res) => {
  res.json({ 
    message: 'iCatalyst Smart Home CRM API Server',
    version: '1.0.0',
    status: 'running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      debug: '/debug/env',
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

// Root endpoint - serve Next.js app or API info
app.get('/', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    // In production, try to serve Next.js index.html
    const indexPath = path.join(__dirname, '../out/index.html');
    const nextIndexPath = path.join(__dirname, '../.next/server/pages/index.html');
    
    try {
      const fs = require('fs');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else if (fs.existsSync(nextIndexPath)) {
        res.sendFile(nextIndexPath);
      } else {
        // Fallback to API info if no frontend found
        res.json({ 
          message: 'iCatalyst Smart Home CRM - API Server',
          version: '1.0.0',
          status: 'running',
          mode: 'API Only',
          environment: process.env.NODE_ENV,
          timestamp: new Date().toISOString(),
          note: 'Frontend build not found - serving API endpoints only',
          api_root: '/api'
        });
      }
    } catch (err) {
      console.error('Error serving frontend:', err);
      res.json({ 
        message: 'iCatalyst Smart Home CRM - API Server',
        version: '1.0.0',
        status: 'running',
        error: 'Frontend serving error',
        api_root: '/api'
      });
    }
  } else {
    // Development mode - show API info
    res.json({ 
      message: 'iCatalyst Smart Home CRM - Development API Server',
      version: '1.0.0',
      status: 'running',
      environment: 'development',
      frontend: 'http://localhost:3002',
      api_root: '/api'
    });
  }
});

// Catch-all route for Next.js client-side routing in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    // Don't intercept API routes
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    // Serve index.html for all other routes (client-side routing)
    const indexPath = path.join(__dirname, '../out/index.html');
    const nextIndexPath = path.join(__dirname, '../.next/server/pages/index.html');
    
    try {
      const fs = require('fs');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else if (fs.existsSync(nextIndexPath)) {
        res.sendFile(nextIndexPath);
      } else {
        res.status(404).json({ error: 'Frontend not found' });
      }
    } catch (err) {
      console.error('Error serving frontend fallback:', err);
      res.status(404).json({ error: 'Frontend serving error' });
    }
  });
}

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
  console.log(`🔍 Debug endpoint: http://localhost:${PORT}/debug/env`);
  console.log(`🏠 Application: http://localhost:${PORT}/`);
  console.log(`🔌 API Root: http://localhost:${PORT}/api`);
  
  if (process.env.NODE_ENV === 'production') {
    console.log('🎯 Production mode: Serving Next.js frontend + Express API');
  } else {
    console.log('🛠️ Development mode: API server only');
  }
  
  // Final environment check
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL still missing after fallbacks!');
  } else {
    console.log('✅ DATABASE_URL configured successfully');
  }
  
  logger.info(`iCatalyst CRM Server started successfully on port ${PORT}`);
}).on('error', (err) => {
  console.error('❌ Server startup error:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  }
  logger.error('Server startup error:', err);
  process.exit(1);
}); 