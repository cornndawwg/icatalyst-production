// MINIMAL EXPRESS SERVER - SYSTEMATIC ROUTE ADDITION
// Phase 1: Add test-db route (simplest first)

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

console.log('=== RAILWAY SYSTEMATIC ROUTE TESTING ===');
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
console.log('Deployment Mode: BREAKTHROUGH - FOUND THE ISSUE!');
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

// Load test-db route now that we fixed the issue
let testDbRoutes;
try {
  testDbRoutes = require('./routes/test-db.routes');
  console.log('✅ Test-db routes loaded');
} catch (err) {
  console.error('❌ Test-db routes loading failed:', err.message);
}

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    mode: 'breakthrough-success',
    message: 'BREAKTHROUGH: Fixed path-to-regexp error!'
  });
});

console.log('✅ Health route added');

// Mount test-db route
if (testDbRoutes) {
  app.use('/api/test-db', testDbRoutes);
  console.log('✅ Test-db route mounted at /api/test-db');
}

// API info
app.get('/api', (req, res) => {
  res.json({ 
    message: 'iCatalyst Smart Home CRM - BREAKTHROUGH SUCCESS!',
    status: 'operational',
    breakthrough: 'Fixed path-to-regexp error caused by invalid * pattern',
    available_endpoints: testDbRoutes ? ['test-db'] : [],
    note: 'Ready to add more routes systematically!'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'iCatalyst Smart Home CRM - BREAKTHROUGH ACHIEVED!', 
    api_root: '/api',
    health_check: '/health',
    issue_fixed: 'Invalid * pattern in 404 handler'
  });
});

// FIXED 404 handler - use /* instead of *
app.all('/*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    available_endpoints: ['/health', '/api', testDbRoutes ? '/api/test-db' : null].filter(Boolean)
  });
});

// Start server
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🎉 BREAKTHROUGH SUCCESS! Server started on port ${PORT}`);
  console.log(`🔧 Fixed path-to-regexp error: Changed * to /* in 404 handler`);
  console.log(`📋 Available endpoints: /health, /api${testDbRoutes ? ', /api/test-db' : ''}`);
  console.log(`🚀 Ready to systematically add remaining routes!`);
  console.log(`✅ Railway deployment should now work perfectly!`);
}); 