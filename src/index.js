// PHASE 3: BASIC ROUTES ADDITION - CRITICAL ROUTE PARAMETER TESTING
// Adding root route + API info route - FIRST ROUTE PARAMETER TEST

const express = require('express');
const cors = require('cors');
const path = require('path');

console.log('🎯 PHASE 3: Basic Routes Addition - CRITICAL TESTING ZONE');
console.log('📋 Adding: Root route (/) + API info route (/api)');
console.log('⚠️ FIRST ROUTE PARAMETER TESTING - Monitoring for malformed routes');

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

console.log('=== PHASE 3: ENVIRONMENT REPORT ===');
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

// PHASE 3: BASIC ROUTES - CRITICAL TESTING ZONE

// Root route - FIRST CUSTOM ROUTE TEST
app.get('/', (req, res) => {
  res.json({
    message: 'iCatalyst Smart Home CRM - Phase 3 Success!',
    phase: 'Phase 3: Basic Routes Testing',
    status: 'operational',
    api_documentation: '/api',
    health_check: '/health',
    features: ['CORS', 'JSON parsing', 'Request logging', 'Environment validation', 'Basic routing'],
    note: 'Root route operational - route parameter testing successful!',
    timestamp: new Date().toISOString()
  });
});

console.log('✅ Root route (/) added - FIRST ROUTE PARAMETER TEST');

// API info route - SECOND CUSTOM ROUTE TEST  
app.get('/api', (req, res) => {
  res.json({
    name: 'iCatalyst Smart Home CRM API',
    version: '1.0.0',
    phase: 'Phase 3: Basic Routes Testing',
    status: 'operational',
    endpoints: {
      health: '/health',
      root: '/',
      api_info: '/api'
    },
    features: ['CORS enabled', 'JSON parsing', 'Request monitoring', 'Environment validation'],
    environment: NODE_ENV,
    uptime: process.uptime(),
    note: 'API route operational - route parameter testing successful!',
    timestamp: new Date().toISOString()
  });
});

console.log('✅ API info route (/api) added - SECOND ROUTE PARAMETER TEST');

// Enhanced health endpoint (Phase 2 - confirmed working)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    phase: 'Phase 3: Basic Routes + Environment + Logging',
    features: ['CORS', 'JSON parsing', 'Request logging', 'Environment validation', 'Basic routing'],
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

console.log('✅ Enhanced health route with Phase 3 route testing status');

// NO 404 HANDLER YET (Phase 4 - HIGH RISK ZONE)
// NO external route files yet (Phase 5)
// NO catch-all routes yet (Phase 4 - VERY HIGH RISK)

// Start server with Phase 3 route testing
app.listen(PORT, () => {
  console.log(`🚀 PHASE 3 SERVER: Running on port ${PORT}`);
  console.log(`🌐 Environment: ${NODE_ENV}`);
  console.log(`📍 Endpoints: /, /api, /health`);
  console.log(`✅ Features: CORS + JSON + Logging + Environment + Basic Routes`);
  console.log(`📊 Request monitoring: ACTIVE`);
  console.log(`🎯 CRITICAL: Testing basic route parameters`);
  console.log(`⚠️ If this works: malformed route is in Phase 4 (404 handlers)`);
  console.log(`🚨 If this fails: malformed route found in basic routing`);
  console.log(`📋 Next Phase 4: 404 handlers + catch-all routes - HIGH RISK ZONE`);
}); 