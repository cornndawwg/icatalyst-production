const { PrismaClient } = require('@prisma/client');

// Use external DATABASE_PUBLIC_URL for seeding
const databaseUrl = 'postgresql://postgres:xqvPkfvnPWdoGmClirtwCrIjxRyDHnEy@maglev.proxy.rlwy.net:44486/railway';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: databaseUrl
        }
    }
});

async function seedTestData() {
    console.log('🌱 Seeding test data...');
    
    try {
        // Create test customers
        const customer1 = await prisma.customer.create({
            data: {
                type: 'residential',
                status: 'active',
                firstName: 'John',
                lastName: 'Smith',
                company: null,
                email: 'john.smith@example.com',
                phone: '(555) 123-4567',
                preferredCommunication: 'email',
                notes: 'Test customer for frontend integration'
            }
        });

        const customer2 = await prisma.customer.create({
            data: {
                type: 'commercial',
                status: 'prospect',
                firstName: 'Sarah',
                lastName: 'Johnson',
                company: 'Johnson Enterprises',
                email: 'sarah@johnsonent.com',
                phone: '(555) 987-6543',
                preferredCommunication: 'phone',
                notes: 'Commercial prospect - solar installation'
            }
        });

        const customer3 = await prisma.customer.create({
            data: {
                type: 'high-net-worth',
                status: 'active',
                firstName: 'Michael',
                lastName: 'Davis',
                company: null,
                email: 'mdavis@email.com',
                phone: '(555) 456-7890',
                preferredCommunication: 'email',
                notes: 'High-value client - smart home automation'
            }
        });

        console.log('✅ Created test customers:');
        console.log(`  📋 ${customer1.firstName} ${customer1.lastName} (${customer1.type})`);
        console.log(`  📋 ${customer2.firstName} ${customer2.lastName} (${customer2.type})`);
        console.log(`  📋 ${customer3.firstName} ${customer3.lastName} (${customer3.type})`);

        // Verify data
        const totalCustomers = await prisma.customer.count();
        console.log(`✅ Total customers in database: ${totalCustomers}`);

    } catch (error) {
        console.error('❌ Error seeding data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedTestData(); 