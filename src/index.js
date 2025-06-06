// PHASE 4: 404 HANDLERS + CATCH-ALL ROUTES - MALFORMED ROUTE EXPECTED HERE
// Adding high-risk route patterns where malformed route syntax likely exists

const express = require('express');
const cors = require('cors');
const path = require('path');

console.log('🚨 PHASE 4: 404 Handlers + Catch-All - MALFORMED ROUTE ZONE');
console.log('📋 Adding: 404 handlers, catch-all routes, error handling');
console.log('⚠️ HIGH RISK: Malformed route parameter expected in this phase');

// Phase 2: Environment variable processing (confirmed working)
const envPath = path.join(__dirname, '..', '.env');
console.log(`Looking for .env file at: ${envPath}`);

const DATABASE_URL = process.env.DATABASE_URL;
const JWT_SECRET = process.env.JWT_SECRET;
const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || 3001;

// Environment validation
if (!DATABASE_URL) {
  console.log('⚠️ DATABASE_URL missing - Railway variable configuration needed');
}
if (!JWT_SECRET) {
  console.log('⚠️ JWT_SECRET missing - using fallback for development');
}

console.log('=== PHASE 4: ENVIRONMENT REPORT ===');
console.log('NODE_ENV:', NODE_ENV);
console.log('PORT:', PORT);
console.log('DATABASE_URL present:', !!DATABASE_URL);
console.log('DATABASE_URL length:', DATABASE_URL ? DATABASE_URL.length : 'N/A');
console.log('JWT_SECRET present:', !!JWT_SECRET);
console.log('JWT_SECRET length:', JWT_SECRET ? JWT_SECRET.length : 'N/A');

console.log('Railway Variables:');
console.log('PGHOST:', process.env.PGHOST);
console.log('PGPORT:', process.env.PGPORT);
console.log('PGDATABASE:', process.env.PGDATABASE);
console.log('PGUSER:', process.env.PGUSER);
console.log('PGPASSWORD present:', !!process.env.PGPASSWORD);

console.log('Working directory:', process.cwd());
console.log('__dirname:', __dirname);
console.log('================================');

// Create Express app
const app = express();

// Phase 2: Request logging middleware (confirmed working)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`📊 ${req.method} ${req.path} → ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Phase 1: Basic middleware (confirmed working)
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

console.log('✅ Basic Express app created');
console.log('✅ Request logging middleware added');
console.log('✅ CORS middleware added');
console.log('✅ Enhanced JSON parsing added');

// PHASE 4: STATIC FILE SERVING - POTENTIAL MALFORMED ROUTE ZONE
if (NODE_ENV === 'production') {
  // Serve Next.js static files in production
  app.use(express.static(path.join(__dirname, '../.next/static')));
  app.use(express.static(path.join(__dirname, '../public')));
  console.log('✅ Static file serving added for production');
}

// Phase 3: Basic Routes (confirmed working)

// Root route - CONFIRMED WORKING
app.get('/', (req, res) => {
  res.json({
    message: 'iCatalyst Smart Home CRM - Phase 4 Testing!',
    phase: 'Phase 4: 404 Handlers + Catch-All Routes',
    status: 'operational',
    api_documentation: '/api',
    health_check: '/health',
    features: ['CORS', 'JSON parsing', 'Request logging', 'Environment validation', 'Basic routing', 'Static serving', '404 handling'],
    note: 'Testing high-risk route patterns - malformed route expected in Phase 4!',
    timestamp: new Date().toISOString()
  });
});

console.log('✅ Root route (/) confirmed working');

// API info route - CONFIRMED WORKING
app.get('/api', (req, res) => {
  res.json({
    name: 'iCatalyst Smart Home CRM API',
    version: '1.0.0',
    phase: 'Phase 4: 404 Handlers + Catch-All Testing',
    status: 'operational',
    endpoints: {
      health: '/health',
      root: '/',
      api_info: '/api'
    },
    features: ['CORS enabled', 'JSON parsing', 'Request monitoring', 'Environment validation', 'Static serving'],
    environment: NODE_ENV,
    uptime: process.uptime(),
    note: 'Phase 4 testing - hunting for malformed route parameters!',
    timestamp: new Date().toISOString()
  });
});

console.log('✅ API info route (/api) confirmed working');

// Enhanced health endpoint - CONFIRMED WORKING
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    phase: 'Phase 4: 404 Handlers + Catch-All + Static Serving',
    features: ['CORS', 'JSON parsing', 'Request logging', 'Environment validation', 'Basic routing', 'Static serving', '404 handling'],
    environment: {
      node_env: NODE_ENV,
      port: PORT,
      database_configured: !!DATABASE_URL,
      jwt_configured: !!JWT_SECRET
    },
    routes_tested: ['/', '/api', '/health'],
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

console.log('✅ Enhanced health route confirmed working');

// PHASE 4: HIGH-RISK ZONE - 404 HANDLERS + CATCH-ALL ROUTES

// Next.js catch-all for production - POTENTIAL MALFORMED ROUTE
if (NODE_ENV === 'production') {
  console.log('🚨 Adding Next.js catch-all route - POTENTIAL MALFORMED ROUTE ZONE');
  
  // This could be the malformed route! Testing catch-all pattern
  app.get('/*', (req, res) => {
    // In production, serve Next.js app for unmatched routes
    res.sendFile(path.join(__dirname, '../.next/server/pages/index.html'));
  });
  
  console.log('⚠️ Next.js catch-all route (/*) added - TESTING MALFORMED ROUTE PATTERN');
}

// 404 Error Handler - HIGHEST RISK FOR MALFORMED ROUTE
console.log('🚨 Adding 404 handler - HIGHEST RISK MALFORMED ROUTE ZONE');

// This is likely where the malformed route exists!
app.use((req, res, next) => {
  console.log(`🔍 404 HANDLER: ${req.method} ${req.path} - Route not found`);
  res.status(404).json({
    error: 'Route not found',
    method: req.method,
    path: req.path,
    phase: 'Phase 4: 404 Handler Testing',
    message: 'The requested endpoint does not exist',
    available_endpoints: ['/', '/api', '/health'],
    timestamp: new Date().toISOString()
  });
});

console.log('⚠️ 404 handler added - MONITORING FOR MALFORMED ROUTE');

// Global Error Handler - POTENTIAL MALFORMED ROUTE
app.use((error, req, res, next) => {
  console.error('🚨 GLOBAL ERROR HANDLER:', error.message);
  console.error('🔍 Stack:', error.stack);
  
  res.status(500).json({
    error: 'Internal Server Error',
    phase: 'Phase 4: Error Handler Testing',
    message: NODE_ENV === 'production' ? 'Something went wrong' : error.message,
    timestamp: new Date().toISOString()
  });
});

console.log('⚠️ Global error handler added - FINAL ROUTE TESTING');

// Start server with Phase 4 high-risk route testing
app.listen(PORT, () => {
  console.log(`🚨 PHASE 4 SERVER: Running on port ${PORT}`);
  console.log(`🌐 Environment: ${NODE_ENV}`);
  console.log(`📍 Endpoints: /, /api, /health + 404/catch-all handlers`);
  console.log(`✅ Features: CORS + JSON + Logging + Environment + Basic Routes + Static + 404`);
  console.log(`📊 Request monitoring: ACTIVE`);
  console.log(`🎯 HIGH RISK: Testing 404 handlers + catch-all routes`);
  console.log(`🚨 EXPECTED: path-to-regexp error from malformed route parameter`);
  console.log(`🔍 If this fails: MALFORMED ROUTE FOUND - ready to fix!`);
  console.log(`🏆 If this works: Move to Phase 5 (external route files)`);
}); 