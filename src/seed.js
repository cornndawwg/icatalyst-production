const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seed() {
  try {
    console.log('Seeding database...');

    // Clear existing data first
    await prisma.interaction.deleteMany();
    await prisma.budgetLineItem.deleteMany();
    await prisma.budget.deleteMany();
    await prisma.project.deleteMany();
    await prisma.property.deleteMany();
    await prisma.customerMetrics.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.address.deleteMany();
    await prisma.customer.deleteMany();

    // Create sample customers
    const customer1 = await prisma.customer.create({
      data: {
        type: 'residential',
        status: 'active',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@email.com',
        phone: '(555) 123-4567',
        preferredCommunication: 'email',
        company: null,
        notes: 'Interested in smart home automation for new house',
        billingAddress: {
          create: {
            street: '123 Main St',
            city: 'Austin',
            state: 'TX',
            zipCode: '78701',
            country: 'USA'
          }
        },
        tags: {
          create: [
            { name: 'VIP' },
            { name: 'Smart Lighting' }
          ]
        },
        metrics: {
          create: {
            totalRevenue: 15000.00,
            projectsCompleted: 1,
            avgResponseTime: 2.5,
            lastInteraction: new Date('2024-05-29T10:00:00Z'),
            nextScheduledInteraction: new Date('2024-06-05T14:00:00Z')
          }
        }
      }
    });

    const customer2 = await prisma.customer.create({
      data: {
        type: 'commercial',
        status: 'prospect',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.j@techcorp.com',
        phone: '(555) 987-6543',
        preferredCommunication: 'phone',
        company: 'TechCorp Solutions',
        notes: 'Looking to upgrade office building with smart systems',
        billingAddress: {
          create: {
            street: '456 Business Ave',
            city: 'Austin',
            state: 'TX',
            zipCode: '78702',
            country: 'USA'
          }
        },
        tags: {
          create: [
            { name: 'Commercial' },
            { name: 'Security Systems' }
          ]
        },
        metrics: {
          create: {
            totalRevenue: 0.00,
            projectsCompleted: 0,
            avgResponseTime: 0,
            lastInteraction: new Date('2024-05-28T15:30:00Z'),
            nextScheduledInteraction: new Date('2024-06-03T09:00:00Z')
          }
        }
      }
    });

    const customer3 = await prisma.customer.create({
      data: {
        type: 'high-net-worth',
        status: 'active',
        firstName: 'Michael',
        lastName: 'Davis',
        email: 'mdavis@luxuryestate.com',
        phone: '(555) 456-7890',
        preferredCommunication: 'email',
        company: null,
        notes: 'Premium smart home integration for luxury estate',
        billingAddress: {
          create: {
            street: '789 Luxury Lane',
            city: 'West Lake Hills',
            state: 'TX',
            zipCode: '78746',
            country: 'USA'
          }
        },
        tags: {
          create: [
            { name: 'Premium' },
            { name: 'Full Automation' },
            { name: 'Audio/Video' }
          ]
        },
        metrics: {
          create: {
            totalRevenue: 85000.00,
            projectsCompleted: 2,
            avgResponseTime: 1.2,
            lastInteraction: new Date('2024-05-30T11:15:00Z'),
            nextScheduledInteraction: new Date('2024-06-10T16:00:00Z')
          }
        }
      }
    });

    // Create properties - since the billing address is already created for each customer
    // we'll just create properties without addresses for now to avoid the constraint
    const property1 = await prisma.property.create({
      data: {
        name: 'Smith Family Home',
        type: 'single-family',
        squareFootage: 2500,
        bedrooms: 4,
        bathrooms: 3,
        yearBuilt: 2020,
        customerId: customer1.id
        // addressId: null for now due to unique constraint
      }
    });

    const property2 = await prisma.property.create({
      data: {
        name: 'TechCorp Office Building',
        type: 'commercial',
        squareFootage: 15000,
        yearBuilt: 2015,
        customerId: customer2.id
        // addressId: null for now due to unique constraint
      }
    });

    // Create projects
    const project1 = await prisma.project.create({
      data: {
        name: 'Smart Lighting Installation',
        description: 'Complete smart lighting system with automated controls',
        status: 'completed',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-04-15'),
        customerId: customer1.id,
        propertyId: property1.id,
        budget: {
          create: {
            currency: 'USD',
            total: 15000.00,
            spent: 14500.00,
            remaining: 500.00,
            lineItems: {
              create: [
                {
                  description: 'Smart switches and dimmers',
                  amount: 5000.00,
                  category: 'Hardware'
                },
                {
                  description: 'Installation labor',
                  amount: 8000.00,
                  category: 'Labor'
                },
                {
                  description: 'Configuration and setup',
                  amount: 1500.00,
                  category: 'Services'
                }
              ]
            }
          }
        }
      }
    });

    const project2 = await prisma.project.create({
      data: {
        name: 'Security System Upgrade',
        description: 'Commercial security system with smart access controls',
        status: 'in-progress',
        startDate: new Date('2024-05-15'),
        customerId: customer2.id,
        propertyId: property2.id,
        budget: {
          create: {
            currency: 'USD',
            total: 35000.00,
            spent: 12000.00,
            remaining: 23000.00,
            lineItems: {
              create: [
                {
                  description: 'Security cameras and sensors',
                  amount: 15000.00,
                  category: 'Hardware'
                },
                {
                  description: 'Access control system',
                  amount: 10000.00,
                  category: 'Hardware'
                },
                {
                  description: 'Installation and configuration',
                  amount: 10000.00,
                  category: 'Labor'
                }
              ]
            }
          }
        }
      }
    });

    // Create interactions
    await prisma.interaction.create({
      data: {
        type: 'meeting',
        date: new Date('2024-05-29T10:00:00Z'),
        summary: 'Project completion review',
        details: 'Reviewed completed smart lighting installation, customer very satisfied',
        createdBy: 'Admin User',
        customerId: customer1.id
      }
    });

    await prisma.interaction.create({
      data: {
        type: 'call',
        date: new Date('2024-05-28T15:30:00Z'),
        summary: 'Initial consultation',
        details: 'Discussed security system requirements for office building',
        followUpDate: new Date('2024-06-03T09:00:00Z'),
        followUpNotes: 'Send detailed proposal for security upgrade',
        createdBy: 'Sales Team',
        customerId: customer2.id
      }
    });

    console.log('✅ Database seeded successfully!');
    console.log(`Created ${3} customers with properties, projects, and interactions`);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  }); 