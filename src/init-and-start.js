const { execSync, spawn } = require('child_process');
const { PrismaClient } = require('@prisma/client');

console.log('🚀 iCatalyst Backend Initialization Starting...');

// Function to run command safely
function runCommand(command, description) {
    try {
        console.log(`⏳ ${description}...`);
        const output = execSync(command, { encoding: 'utf-8', stdio: 'pipe' });
        console.log(`✅ ${description} completed successfully`);
        return true;
    } catch (error) {
        console.error(`❌ ${description} failed:`, error.message);
        return false;
    }
}

// Test database connectivity
async function testDatabaseConnection() {
    console.log('🔍 Testing Database Connectivity...');
    
    const internalUrl = process.env.DATABASE_URL;
    const externalUrl = process.env.DATABASE_PUBLIC_URL;
    
    console.log('Internal URL available:', !!internalUrl);
    console.log('External URL available:', !!externalUrl);
    
    // Try internal connection first
    if (internalUrl) {
        try {
            console.log('⏳ Testing internal database connection...');
            const prismaInternal = new PrismaClient({
                datasources: { db: { url: internalUrl } }
            });
            await prismaInternal.$connect();
            await prismaInternal.$disconnect();
            console.log('✅ Internal database connection successful!');
            return { success: true, url: 'internal' };
        } catch (error) {
            console.log('❌ Internal database connection failed:', error.message);
        }
    }
    
    // Try external connection as fallback
    if (externalUrl) {
        try {
            console.log('⏳ Testing external database connection...');
            const prismaExternal = new PrismaClient({
                datasources: { db: { url: externalUrl } }
            });
            await prismaExternal.$connect();
            await prismaExternal.$disconnect();
            console.log('✅ External database connection successful!');
            
            // Set DATABASE_URL to external URL for Prisma commands
            process.env.DATABASE_URL = externalUrl;
            console.log('🔄 Switched to external database URL');
            return { success: true, url: 'external' };
        } catch (error) {
            console.log('❌ External database connection failed:', error.message);
        }
    }
    
    return { success: false, url: 'none' };
}

async function initializeApp() {
    console.log('1️⃣  Generating Prisma Client...');
    const generateSuccess = runCommand('npx prisma generate', 'Prisma Client Generation');
    
    if (generateSuccess) {
        console.log('2️⃣  Testing Database Connection...');
        const dbTest = await testDatabaseConnection();
        
        if (dbTest.success) {
            console.log(`3️⃣  Pushing Database Schema (using ${dbTest.url} connection)...`);
            const pushSuccess = runCommand('npx prisma db push --accept-data-loss', 'Database Schema Push');
            
            if (pushSuccess) {
                console.log('✅ Database initialization completed successfully!');
            } else {
                console.log('⚠️  Database push failed, but continuing with server startup...');
            }
        } else {
            console.log('⚠️  No database connection available, starting server without database...');
        }
    } else {
        console.log('⚠️  Prisma generation failed, but continuing with server startup...');
    }
    
    console.log('4️⃣  Starting Express Server...');
    
    // Start the main application
    try {
        require('./index.js');
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('🛑 Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('🛑 Received SIGTERM, shutting down gracefully...');
    process.exit(0);
});

// Start the initialization
initializeApp().catch(error => {
    console.error('❌ Initialization failed:', error);
    console.log('🔄 Attempting to start server anyway...');
    try {
        require('./index.js');
    } catch (startError) {
        console.error('❌ Server startup failed:', startError.message);
        process.exit(1);
    }
}); 