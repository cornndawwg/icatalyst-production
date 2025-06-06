// MINIMAL EXPRESS SERVER - ZERO EXTERNAL ROUTES
// Testing Railway deployment without any route file imports

const express = require('express');
const cors = require('cors');
const path = require('path');

// Environment and debug logging
const envPath = path.join(__dirname, '..', '.env');
console.log(`Looking for .env file at: ${envPath}`);

// Check environment variables
const DATABASE_URL = process.env.DATABASE_URL;
const JWT_SECRET = process.env.JWT_SECRET;

if (!DATABASE_URL) {
  console.log('⚠️ DATABASE_URL missing - Railway variable configuration issue detected');
}

if (!JWT_SECRET) {
  console.log('⚠️ JWT_SECRET missing - using fallback');
}

console.log('=== RAILWAY ZERO ROUTES DEPLOYMENT ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('DATABASE_URL present:', !!DATABASE_URL);
console.log('DATABASE_URL length:', DATABASE_URL ? DATABASE_URL.length : 'N/A');
console.log('JWT_SECRET present:', !!JWT_SECRET);
console.log('JWT_SECRET length:', JWT_SECRET ? JWT_SECRET.length : 'N/A');

console.log('Railway PG Variables:');
console.log('PGHOST:', process.env.PGHOST);
console.log('PGPORT:', process.env.PGPORT);
console.log('PGDATABASE:', process.env.PGDATABASE);
console.log('PGUSER:', process.env.PGUSER);
console.log('PGPASSWORD present:', !!process.env.PGPASSWORD);
console.log('PGURL present:', !!process.env.PGURL);

console.log('Current working directory:', process.cwd());
console.log('__dirname:', __dirname);
console.log('Deployment Mode: ZERO EXTERNAL ROUTES - BASELINE TEST');
console.log('================================');

// Create Express app
const app = express();

// Basic middleware
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

console.log('✅ Basic middleware loaded');

// NO EXTERNAL ROUTE IMPORTS - Only inline routes

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    mode: 'zero-routes-baseline',
    message: 'Baseline test - no external routes loaded'
  });
});

// API info
app.get('/api', (req, res) => {
  res.json({ 
    message: 'iCatalyst Smart Home CRM - Baseline Test',
    status: 'operational',
    mode: 'zero-external-routes',
    available_endpoints: ['health', 'api'],
    note: 'Testing without any external route file imports'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'iCatalyst Smart Home CRM - Baseline Test', 
    api_root: '/api',
    health_check: '/health',
    mode: 'No external route files loaded'
  });
});

// Simple inline test-db route (no external file)
app.get('/api/test-db', (req, res) => {
  res.json({
    status: 'success',
    message: 'Inline test-db route working',
    note: 'No external route file - inline route only',
    timestamp: new Date().toISOString()
  });
});

// FIXED 404 handler - use /* instead of *
app.all('/*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    available_endpoints: ['/health', '/api', '/api/test-db', '/']
  });
});

// Start server
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 BASELINE TEST: Server started on port ${PORT}`);
  console.log(`📋 Available endpoints: /health, /api, /api/test-db, /`);
  console.log(`🎯 Zero external route files loaded`);
  console.log(`✅ If this works, external route files are the issue`);
  console.log(`🔍 If this fails, there's still a configuration problem`);
}); 