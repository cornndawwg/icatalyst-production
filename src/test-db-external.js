const { PrismaClient } = require('@prisma/client');

// Test external database connection
async function testExternalDatabase() {
    console.log('🔍 Testing External Database Connection...');
    
    // Use external URL for testing
    const externalUrl = 'postgresql://postgres:xqvPkfvnPWdoGmClirtwCrIjxRyDHnEy@maglev.proxy.rlwy.net:44486/railway';
    
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: externalUrl
            }
        }
    });
    
    try {
        console.log('⏳ Attempting database connection...');
        await prisma.$connect();
        console.log('✅ Database connection successful!');
        
        console.log('⏳ Testing raw query...');
        const result = await prisma.$queryRaw`SELECT version()`;
        console.log('✅ Raw query successful:', result);
        
        console.log('⏳ Testing Customer table access...');
        const customerCount = await prisma.customer.count();
        console.log('✅ Customer table accessible. Count:', customerCount);
        
    } catch (error) {
        console.error('❌ Database test failed:', error.message);
        console.error('Full error:', error);
    } finally {
        await prisma.$disconnect();
        console.log('🔌 Database connection closed');
    }
}

testExternalDatabase(); 