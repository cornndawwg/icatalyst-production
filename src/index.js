// ULTRA-MINIMAL EXPRESS SERVER - EMERGENCY ISOLATION
// Finding malformed route in main server setup

const express = require('express');
const cors = require('cors');
const path = require('path');

console.log('🚨 EMERGENCY ISOLATION: Ultra-minimal Express server');
console.log('📋 Goal: Find malformed route in main server setup');

// PHASE 2: Environment variable processing
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

console.log('=== PHASE 2: ENVIRONMENT REPORT ===');
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

// PHASE 2: Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`📊 ${req.method} ${req.path} → ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// PHASE 1: Basic middleware addition
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

// Enhanced health endpoint with Phase 2 information
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    phase: 'Phase 2: Environment + Logging',
    features: ['CORS', 'JSON parsing', 'Request logging', 'Environment validation'],
    environment: {
      node_env: NODE_ENV,
      port: PORT,
      database_configured: !!DATABASE_URL,
      jwt_configured: !!JWT_SECRET
    },
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

console.log('✅ Enhanced health route with Phase 2 monitoring');

// NO OTHER ROUTES
// NO 404 handler 
// NO static serving
// NO complex middleware
// NO catch-all routes

// Start server with enhanced logging
app.listen(PORT, () => {
  console.log(`🚀 PHASE 2 SERVER: Running on port ${PORT}`);
  console.log(`🌐 Environment: ${NODE_ENV}`);
  console.log(`📍 Endpoints: /health`);
  console.log(`✅ Features: CORS + JSON + Logging + Environment`);
  console.log(`📊 Request monitoring: ACTIVE`);
  console.log(`🎯 Testing environment + logging safety`);
  console.log(`📋 Next Phase 3: Basic routes (/api, /) - CAUTION ZONE`);
}); 