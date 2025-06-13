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

async function seedSmartHomeProducts() {
    console.log('🏠 Seeding smart home products for AI system...');
    
    try {
        const products = [
            // Audio/Video Systems
            {
                name: 'Sonos Arc Soundbar',
                description: 'Premium wireless soundbar with Dolby Atmos',
                category: 'audio-video',
                brand: 'Sonos',
                model: 'Arc',
                sku: 'SONOS-ARC-001',
                basePrice: 899.00,
                goodTierPrice: 899.00,
                betterTierPrice: 999.00,
                bestTierPrice: 1199.00,
                specifications: JSON.stringify({
                    channels: '3.0.2',
                    connectivity: ['WiFi', 'Ethernet', 'HDMI eARC'],
                    voiceControl: ['Alexa', 'Google Assistant']
                })
            },
            {
                name: 'Samsung 75" QLED 4K Smart TV',
                description: 'Ultra-premium 4K smart display with quantum dot technology',
                category: 'audio-video',
                brand: 'Samsung',
                model: 'QN75Q90C',
                sku: 'SAM-Q90C-75',
                basePrice: 2799.00,
                goodTierPrice: 2799.00,
                betterTierPrice: 3199.00,
                bestTierPrice: 3799.00,
                specifications: JSON.stringify({
                    resolution: '4K UHD',
                    hdr: ['HDR10+', 'Quantum HDR'],
                    smartOS: 'Tizen',
                    gaming: '4K 120Hz'
                })
            },
            
            // Lighting Control
            {
                name: 'Lutron Caseta Smart Dimmer Switch',
                description: 'Professional-grade smart dimmer with app control',
                category: 'lighting',
                brand: 'Lutron',
                model: 'PD-6WCL',
                sku: 'LUT-CASETA-DIM',
                basePrice: 59.99,
                goodTierPrice: 59.99,
                betterTierPrice: 79.99,
                bestTierPrice: 99.99,
                specifications: JSON.stringify({
                    protocol: 'Clear Connect RF',
                    compatibility: ['Alexa', 'Google', 'HomeKit'],
                    load: '600W LED/CFL, 1000W Incandescent'
                })
            },
            {
                name: 'Philips Hue Color Smart Bulbs (4-pack)',
                description: 'Color-changing smart LED bulbs with millions of colors',
                category: 'lighting',
                brand: 'Philips',
                model: 'Hue Color A19',
                sku: 'PHI-HUE-COL-4PK',
                basePrice: 199.99,
                goodTierPrice: 199.99,
                betterTierPrice: 229.99,
                bestTierPrice: 279.99,
                specifications: JSON.stringify({
                    lumens: '1100 lm',
                    colors: '16 million',
                    protocol: 'Zigbee',
                    lifespan: '25,000 hours'
                })
            },
            
            // Security Systems
            {
                name: 'Ring Video Doorbell Pro 2',
                description: 'Advanced video doorbell with 3D motion detection',
                category: 'security',
                brand: 'Ring',
                model: 'Video Doorbell Pro 2',
                sku: 'RING-VDP2-001',
                basePrice: 269.99,
                goodTierPrice: 269.99,
                betterTierPrice: 319.99,
                bestTierPrice: 399.99,
                specifications: JSON.stringify({
                    resolution: '1536p HD',
                    features: ['3D Motion Detection', 'Bird\'s Eye View', 'Advanced Pre-Roll'],
                    power: 'Hardwired',
                    storage: 'Cloud subscription required'
                })
            },
            {
                name: 'Nest Cam Outdoor (Battery)',
                description: 'Wire-free outdoor security camera with intelligent alerts',
                category: 'security',
                brand: 'Google Nest',
                model: 'Nest Cam (battery)',
                sku: 'NEST-CAM-OUT-BAT',
                basePrice: 179.99,
                goodTierPrice: 179.99,
                betterTierPrice: 219.99,
                bestTierPrice: 279.99,
                specifications: JSON.stringify({
                    resolution: '1080p HDR',
                    battery: 'Up to 7 months',
                    ai: 'Intelligent person/package/vehicle detection',
                    storage: '3 hours free, subscription for more'
                })
            },
            
            // Climate Control
            {
                name: 'Ecobee Smart Thermostat Premium',
                description: 'AI-powered thermostat with air quality monitoring',
                category: 'climate',
                brand: 'Ecobee',
                model: 'SmartThermostat Premium',
                sku: 'ECO-SMART-PREM',
                basePrice: 249.99,
                goodTierPrice: 249.99,
                betterTierPrice: 299.99,
                bestTierPrice: 379.99,
                specifications: JSON.stringify({
                    features: ['Air Quality Monitor', 'Smart Sensors', 'Voice Control'],
                    compatibility: ['Alexa', 'Google', 'HomeKit', 'SmartThings'],
                    energy: 'ENERGY STAR certified'
                })
            },
            
            // Networking
            {
                name: 'Ubiquiti Dream Machine Pro',
                description: 'Enterprise-grade router and security gateway',
                category: 'networking',
                brand: 'Ubiquiti',
                model: 'UDM-Pro',
                sku: 'UBI-UDM-PRO',
                basePrice: 499.00,
                goodTierPrice: 499.00,
                betterTierPrice: 599.00,
                bestTierPrice: 749.00,
                specifications: JSON.stringify({
                    throughput: '3.5 Gbps',
                    ports: '8x Gigabit + 2x SFP+',
                    features: ['IDS/IPS', 'VPN Server', 'WiFi 6 Ready'],
                    management: 'UniFi Network Controller'
                })
            },
            {
                name: 'Ubiquiti WiFi 6 Access Point',
                description: 'High-performance WiFi 6 access point for whole-home coverage',
                category: 'networking',
                brand: 'Ubiquiti',
                model: 'U6-Pro',
                sku: 'UBI-U6-PRO',
                basePrice: 179.00,
                goodTierPrice: 179.00,
                betterTierPrice: 199.00,
                bestTierPrice: 239.00,
                specifications: JSON.stringify({
                    standard: 'WiFi 6 (802.11ax)',
                    speed: '4.8 Gbps aggregate',
                    coverage: '6,000 sq ft',
                    power: 'PoE+ required'
                })
            },
            
            // Professional Services
            {
                name: 'System Design Consultation',
                description: 'Professional smart home system design and planning',
                category: 'design',
                brand: 'iCatalyst',
                model: 'Design-Pro',
                sku: 'ICAL-DESIGN-001',
                basePrice: 299.00,
                goodTierPrice: 299.00,
                betterTierPrice: 499.00,
                bestTierPrice: 799.00,
                specifications: JSON.stringify({
                    includes: ['Site survey', 'System design', '3D renderings', 'Equipment list'],
                    deliverables: ['CAD drawings', 'Installation timeline', 'Budget estimate']
                })
            },
            {
                name: 'Professional Installation Service',
                description: 'Expert installation and configuration of smart home systems',
                category: 'installation',
                brand: 'iCatalyst',
                model: 'Install-Pro',
                sku: 'ICAL-INSTALL-001',
                basePrice: 150.00, // Per hour
                goodTierPrice: 150.00,
                betterTierPrice: 175.00,
                bestTierPrice: 200.00,
                specifications: JSON.stringify({
                    unit: 'per hour',
                    minimum: '4 hours',
                    includes: ['Installation', 'Configuration', 'Testing', 'Training'],
                    warranty: '1 year on installation'
                })
            }
        ];

        // Clear existing products (optional - remove if you want to keep existing)
        await prisma.product.deleteMany({});

        // Create new products
        for (const productData of products) {
            await prisma.product.create({
                data: productData
            });
        }

        console.log(`✅ Successfully seeded ${products.length} smart home products`);

        // Also seed some customer personas for AI context
        await seedCustomerPersonas();

    } catch (error) {
        console.error('❌ Error seeding smart home products:', error);
    } finally {
        await prisma.$disconnect();
    }
}

async function seedCustomerPersonas() {
    console.log('👥 Seeding customer personas for AI targeting...');
    
    const personas = [
        {
            type: 'residential',
            name: 'homeowner',
            displayName: 'Homeowner',
            description: 'Tech-savvy homeowner looking for convenience and security',
            keyFeatures: JSON.stringify([
                'Easy-to-use interfaces',
                'Mobile app control',
                'Energy savings',
                'Security features',
                'Voice control integration'
            ]),
            recommendedTier: 'better'
        },
        {
            type: 'residential',
            name: 'luxury-homeowner',
            displayName: 'Luxury Homeowner',
            description: 'High-end residential client wanting premium, cutting-edge technology',
            keyFeatures: JSON.stringify([
                'Premium brands and materials',
                'Custom integration',
                'Advanced automation',
                'Architectural integration',
                'Concierge-level support'
            ]),
            recommendedTier: 'best'
        },
        {
            type: 'commercial',
            name: 'business-owner',
            displayName: 'Business Owner',
            description: 'Small to medium business owner focused on ROI and efficiency',
            keyFeatures: JSON.stringify([
                'Cost-effective solutions',
                'Quick ROI',
                'Scalable systems',
                'Employee productivity',
                'Security and access control'
            ]),
            recommendedTier: 'good'
        },
        {
            type: 'commercial',
            name: 'facilities-manager',
            displayName: 'Facilities Manager',
            description: 'Corporate facilities manager managing large properties',
            keyFeatures: JSON.stringify([
                'Enterprise-grade solutions',
                'Centralized management',
                'Maintenance efficiency',
                'Compliance and reporting',
                'Scalable infrastructure'
            ]),
            recommendedTier: 'best'
        }
    ];

    // Clear existing personas
    await prisma.proposalPersona.deleteMany({});

    for (const personaData of personas) {
        await prisma.proposalPersona.create({
            data: personaData
        });
    }

    console.log(`✅ Successfully seeded ${personas.length} customer personas`);
}

seedSmartHomeProducts(); 