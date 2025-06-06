// PHASE 3 REVERT + SURGICAL DEBUGGING - ISOLATING MULTIPLE MALFORMED ROUTES
// Adding Phase 4 features ONE BY ONE to find ALL malformed route patterns

const express = require('express');
const cors = require('cors');
const path = require('path');

console.log('🔬 SURGICAL DEBUGGING: Reverting to Phase 3 + Individual Feature Testing');
console.log('📋 Strategy: Add Phase 4 features ONE BY ONE to isolate ALL malformed routes');
console.log('⚠️ MULTIPLE MALFORMED ROUTES: Error position changed from 2 → 1');

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

console.log('=== SURGICAL DEBUGGING: ENVIRONMENT REPORT ===');
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

// Phase 3: Basic Routes (CONFIRMED WORKING - SAFE BASELINE)

// Root route - CONFIRMED WORKING
app.get('/', (req, res) => {
  res.json({
    message: 'iCatalyst Smart Home CRM - Surgical Debugging Mode!',
    phase: 'Phase 3 Baseline + Surgical Phase 4 Testing',
    status: 'operational',
    api_documentation: '/api',
    health_check: '/health',
    features: ['CORS', 'JSON parsing', 'Request logging', 'Environment validation', 'Basic routing'],
    debugging_mode: 'SURGICAL - Adding Phase 4 features individually',
    note: 'Isolating multiple malformed routes one by one!',
    timestamp: new Date().toISOString()
  });
});

console.log('✅ Root route (/) confirmed working - Phase 3 baseline');

// API info route - CONFIRMED WORKING
app.get('/api', (req, res) => {
  res.json({
    name: 'iCatalyst Smart Home CRM API',
    version: '1.0.0',
    phase: 'Phase 3 Baseline + Surgical Phase 4 Testing',
    status: 'operational',
    endpoints: {
      health: '/health',
      root: '/',
      api_info: '/api'
    },
    features: ['CORS enabled', 'JSON parsing', 'Request monitoring', 'Environment validation'],
    environment: NODE_ENV,
    uptime: process.uptime(),
    debugging_mode: 'SURGICAL - Individual feature isolation',
    note: 'Finding ALL malformed routes systematically!',
    timestamp: new Date().toISOString()
  });
});

console.log('✅ API info route (/api) confirmed working - Phase 3 baseline');

// Enhanced health endpoint - CONFIRMED WORKING
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    phase: 'Phase 3 Baseline - Surgical Debugging Mode',
    features: ['CORS', 'JSON parsing', 'Request logging', 'Environment validation', 'Basic routing'],
    environment: {
      node_env: NODE_ENV,
      port: PORT,
      database_configured: !!DATABASE_URL,
      jwt_configured: !!JWT_SECRET
    },
    routes_tested: ['/', '/api', '/health'],
    debugging_strategy: 'Individual Phase 4 feature testing',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

console.log('✅ Enhanced health route confirmed working - Phase 3 baseline');

// SURGICAL DEBUGGING: PHASE 4A - STATIC FILE SERVING (FIRST INDIVIDUAL TEST)
console.log('🔬 TESTING: Phase 4A - Static file serving individually');

if (NODE_ENV === 'production') {
  // Serve Next.js static files in production
  app.use(express.static(path.join(__dirname, '../.next/static')));
  app.use(express.static(path.join(__dirname, '../public')));
  console.log('✅ Phase 4A: Static file serving added for production');
} else {
  console.log('⏭️ Phase 4A: Static file serving skipped (development mode)');
}

// SURGICAL DEBUGGING: PHASE 4B - NEXT.JS CATCH-ALL ROUTE (HIGH SUSPICION)
console.log('🔬 TESTING: Phase 4B - Next.js catch-all route (PRIMARY SUSPECT)');
console.log('⚠️ HIGH PROBABILITY: Previous error location - Missing parameter name at 2');

if (NODE_ENV === 'production') {
  console.log('🚨 Adding Next.js catch-all route - MALFORMED ROUTE EXPECTED HERE');
  
  // TESTING: This is likely where the malformed route exists!
  // Previous error: "Missing parameter name at 2" occurred here
  app.get('*', (req, res) => {
    // In production, serve Next.js built pages or send 404 JSON
    try {
      // Try to serve the main Next.js page or fallback to JSON response
      const indexPath = path.join(__dirname, '../public/index.html');
      res.sendFile(indexPath, (err) => {
        if (err) {
          // Fallback to JSON response if file doesn't exist
          res.status(404).json({
            error: 'Page not found',
            message: 'The requested page does not exist',
            available_endpoints: ['/', '/api', '/health'],
            phase: 'Phase 4B: Next.js Catch-All Testing',
            timestamp: new Date().toISOString()
          });
        }
      });
    } catch (error) {
      res.status(404).json({
        error: 'Page not found',
        message: 'The requested page does not exist',
        available_endpoints: ['/', '/api', '/health'],
        phase: 'Phase 4B: Next.js Catch-All Testing',
        timestamp: new Date().toISOString()
      });
    }
  });
  
  console.log('⚠️ Next.js catch-all route (*) added - TESTING FOR MALFORMED SYNTAX');
} else {
  console.log('⏭️ Phase 4B: Next.js catch-all skipped (development mode)');
}

// SURGICAL DEBUGGING: NO OTHER PHASE 4 FEATURES YET
// Will add individually in next iterations if Phase 4B succeeds:
// 4C. 404 handlers (POTENTIAL REMAINING MALFORMED ROUTE)  
// 4D. Error handlers (POTENTIAL REMAINING MALFORMED ROUTE)

console.log('🔬 PHASE 4B TESTING: Next.js catch-all route isolation');
console.log('📋 Expected: path-to-regexp error if malformed route exists here');
console.log('🎯 Goal: Identify exact malformed route parameter syntax');

// Start server with Phase 3 baseline
app.listen(PORT, () => {
  console.log(`🔬 SURGICAL DEBUGGING SERVER: Running on port ${PORT}`);
  console.log(`🌐 Environment: ${NODE_ENV}`);
  console.log(`📍 Endpoints: /, /api, /health (Phase 3 baseline)`);
  console.log(`✅ Features: CORS + JSON + Logging + Environment + Basic Routes`);
  console.log(`📊 Request monitoring: ACTIVE`);
  console.log(`🔬 SURGICAL MODE: Phase 3 baseline established`);
  console.log(`📋 Next deployment: Add static file serving individually`);
  console.log(`🎯 Strategy: Isolate each malformed route pattern systematically`);
  console.log(`🚨 Expected: This should work (Phase 3 confirmed)`);
}); 