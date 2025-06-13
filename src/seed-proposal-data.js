const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedProposalData() {
  console.log('🌱 Seeding Smart Proposal System data...');

  try {
    // Seed Proposal Personas
    const proposalPersonas = [
      // Residential Personas
      {
        type: 'residential',
        name: 'homeowner',
        displayName: 'Homeowner',
        description: 'Primary residential decision maker focused on family comfort, security, and convenience',
        keyFeatures: JSON.stringify([
          'Enhanced security and peace of mind',
          'Energy efficiency and cost savings',
          'Convenience and lifestyle improvement',
          'Easy-to-use mobile controls',
          'Family safety features'
        ]),
        recommendedTier: 'better'
      },
      {
        type: 'residential',
        name: 'interior-designer',
        displayName: 'Interior Designer',
        description: 'Design professional seeking sophisticated, aesthetically pleasing solutions',
        keyFeatures: JSON.stringify([
          'Sleek, hidden technology integration',
          'Customizable lighting scenes',
          'Architectural-grade components',
          'Seamless user interface design',
          'Premium finishes and materials'
        ]),
        recommendedTier: 'best'
      },
      {
        type: 'residential',
        name: 'builder',
        displayName: 'Builder/Developer',
        description: 'Construction professional building spec homes or developments',
        keyFeatures: JSON.stringify([
          'Cost-effective bulk pricing',
          'Standardized installation packages',
          'Builder-friendly scheduling',
          'Market differentiation features',
          'Warranty and support programs'
        ]),
        recommendedTier: 'good'
      },
      {
        type: 'residential',
        name: 'architect',
        displayName: 'Architect',
        description: 'Design architect planning integrated smart home systems',
        keyFeatures: JSON.stringify([
          'Advanced system integration',
          'Future-proof technology',
          'Detailed technical specifications',
          'CAD/BIM integration support',
          'Sustainable technology options'
        ]),
        recommendedTier: 'best'
      },
      // Commercial Personas
      {
        type: 'commercial',
        name: 'cto-cio',
        displayName: 'CTO/CIO',
        description: 'Technology executive focused on infrastructure and security',
        keyFeatures: JSON.stringify([
          'Enterprise-grade security',
          'Network infrastructure optimization',
          'Scalable system architecture',
          'IT policy compliance',
          'Remote management capabilities'
        ]),
        recommendedTier: 'best'
      },
      {
        type: 'commercial',
        name: 'business-owner',
        displayName: 'Business Owner',
        description: 'Small to medium business owner focused on ROI and efficiency',
        keyFeatures: JSON.stringify([
          'Cost savings and ROI metrics',
          'Operational efficiency gains',
          'Employee productivity benefits',
          'Customer experience enhancement',
          'Competitive advantage features'
        ]),
        recommendedTier: 'better'
      },
      {
        type: 'commercial',
        name: 'c-suite',
        displayName: 'C-Suite Executive',
        description: 'Senior executive focused on strategic business impact',
        keyFeatures: JSON.stringify([
          'Strategic technology investment',
          'Brand enhancement opportunities',
          'Executive-level reporting',
          'Risk mitigation strategies',
          'Premium user experience'
        ]),
        recommendedTier: 'best'
      },
      {
        type: 'commercial',
        name: 'office-manager',
        displayName: 'Office Manager',
        description: 'Operations manager handling day-to-day facility management',
        keyFeatures: JSON.stringify([
          'Simplified daily operations',
          'Energy cost management',
          'Maintenance reduction',
          'Staff convenience features',
          'Easy system administration'
        ]),
        recommendedTier: 'better'
      },
      {
        type: 'commercial',
        name: 'facilities-manager',
        displayName: 'Facilities Manager',
        description: 'Facilities professional managing building systems and operations',
        keyFeatures: JSON.stringify([
          'Integrated building management',
          'Preventive maintenance alerts',
          'Energy optimization systems',
          'Compliance monitoring',
          'Centralized control platforms'
        ]),
        recommendedTier: 'better'
      }
    ];

    console.log(`📝 Seeding ${proposalPersonas.length} proposal personas...`);
    
    for (const persona of proposalPersonas) {
      try {
        const result = await prisma.proposalPersona.upsert({
          where: { name: persona.name },
          update: persona,
          create: persona
        });
        console.log(`  ✅ ${result.displayName} (${result.name})`);
      } catch (error) {
        console.error(`  ❌ Error seeding persona ${persona.name}:`, error.message);
      }
    }

    console.log('✅ Proposal personas seeded');

    // Seed Sample Products with Good/Better/Best pricing
    const products = [
      // Audio/Video Products
      {
        name: 'Sonos Era 100 Smart Speaker',
        description: 'Compact smart speaker with rich, room-filling sound',
        category: 'audio-video',
        brand: 'Sonos',
        model: 'Era 100',
        sku: 'SONOS-ERA100',
        basePrice: 249.00,
        goodTierPrice: 249.00,
        betterTierPrice: 299.00, // includes setup
        bestTierPrice: 349.00, // includes setup + room tuning
        specifications: JSON.stringify({
          'Connectivity': 'Wi-Fi, Bluetooth',
          'Voice Control': 'Alexa, Google Assistant',
          'Dimensions': '7.2 x 5.1 x 4.0 inches',
          'Audio': 'Two angled drivers, advanced processing'
        }),
        compatibility: 'Sonos ecosystem, Apple AirPlay 2, Spotify Connect',
        installation: 'Simple plug-and-play setup, optional professional tuning'
      },
      {
        name: 'Control4 EA-1 Controller',
        description: 'Entry-level home automation controller for small homes',
        category: 'audio-video',
        brand: 'Control4',
        model: 'EA-1',
        sku: 'C4-EA1',
        basePrice: 695.00,
        goodTierPrice: 695.00,
        betterTierPrice: 895.00, // includes basic programming
        bestTierPrice: 1295.00, // includes advanced programming + training
        specifications: JSON.stringify({
          'Zones': 'Up to 15 devices',
          'Network': 'Ethernet, Wi-Fi',
          'Protocol Support': 'Zigbee, Z-Wave, IR, IP',
          'Storage': 'Cloud-based'
        }),
        compatibility: 'Control4 ecosystem, major smart home brands',
        installation: 'Professional installation and programming required'
      },
      // Lighting Products
      {
        name: 'Lutron Caseta Wireless Dimmer',
        description: 'Smart dimmer switch with app and voice control',
        category: 'lighting',
        brand: 'Lutron',
        model: 'PD-6WCL',
        sku: 'LUTRON-PD6WCL',
        basePrice: 59.95,
        goodTierPrice: 59.95,
        betterTierPrice: 79.95, // includes installation
        bestTierPrice: 99.95, // includes installation + scene programming
        specifications: JSON.stringify({
          'Load Type': 'LED, CFL, Incandescent',
          'Control': 'App, voice, physical switch',
          'Range': 'Up to 30 feet',
          'Installation': 'No neutral wire required'
        }),
        compatibility: 'Alexa, Google Assistant, Apple HomeKit',
        installation: 'Simple replacement of existing switch'
      },
      {
        name: 'Philips Hue Color Bulb',
        description: 'Smart LED bulb with 16 million colors',
        category: 'lighting',
        brand: 'Philips',
        model: 'Hue Color A19',
        sku: 'PHILIPS-HUE-COLOR',
        basePrice: 49.99,
        goodTierPrice: 49.99,
        betterTierPrice: 59.99, // includes setup service
        bestTierPrice: 79.99, // includes setup + scene creation
        specifications: JSON.stringify({
          'Brightness': '800 lumens',
          'Colors': '16 million colors',
          'Lifespan': '25,000 hours',
          'Connectivity': 'Zigbee 3.0'
        }),
        compatibility: 'Philips Hue ecosystem, major smart home platforms',
        installation: 'Screw-in installation, requires Hue Bridge'
      },
      // Security Products
      {
        name: 'Ring Video Doorbell Pro 2',
        description: 'Advanced video doorbell with 3D motion detection',
        category: 'security',
        brand: 'Ring',
        model: 'Pro 2',
        sku: 'RING-DOORBELL-PRO2',
        basePrice: 249.99,
        goodTierPrice: 249.99,
        betterTierPrice: 349.99, // includes installation
        bestTierPrice: 449.99, // includes installation + chime + monitoring setup
        specifications: JSON.stringify({
          'Video': '1536p HD, HDR',
          'Field of View': '150° horizontal, 90° vertical',
          'Audio': 'Two-way talk',
          'Detection': '3D motion detection'
        }),
        compatibility: 'Alexa, Google Assistant, IFTTT',
        installation: 'Hardwired installation, existing doorbell wiring required'
      },
      // Networking Products
      {
        name: 'Ubiquiti Dream Machine',
        description: 'All-in-one router, security gateway, and network controller',
        category: 'networking',
        brand: 'Ubiquiti',
        model: 'UDM',
        sku: 'UBNT-UDM',
        basePrice: 379.00,
        goodTierPrice: 379.00,
        betterTierPrice: 579.00, // includes basic setup
        bestTierPrice: 779.00, // includes advanced configuration + monitoring
        specifications: JSON.stringify({
          'Throughput': '3.5 Gbps',
          'Coverage': 'Up to 4,000 sq ft',
          'Ports': '1x WAN, 4x LAN Gigabit',
          'Features': 'IDS/IPS, Deep Packet Inspection'
        }),
        compatibility: 'UniFi ecosystem, major internet providers',
        installation: 'Network configuration and optimization recommended'
      },
      // Climate Products
      {
        name: 'Ecobee SmartThermostat',
        description: 'Smart thermostat with room sensors and voice control',
        category: 'climate',
        brand: 'Ecobee',
        model: 'SmartThermostat Premium',
        sku: 'ECOBEE-SMART-PREM',
        basePrice: 249.00,
        goodTierPrice: 249.00,
        betterTierPrice: 349.00, // includes installation
        bestTierPrice: 449.00, // includes installation + room sensors + optimization
        specifications: JSON.stringify({
          'Display': '3.5" full-color touchscreen',
          'Sensors': 'Built-in room sensor, remote sensors available',
          'Voice': 'Built-in Alexa',
          'Compatibility': '95% of heating and cooling systems'
        }),
        compatibility: 'Alexa, Google Assistant, Apple HomeKit, SmartThings',
        installation: 'Professional installation recommended for optimal performance'
      }
    ];

    console.log(`📦 Seeding ${products.length} sample products...`);

    for (const product of products) {
      try {
        const result = await prisma.product.upsert({
          where: { sku: product.sku },
          update: product,
          create: product
        });
        console.log(`  ✅ ${result.name} (${result.sku})`);
      } catch (error) {
        console.error(`  ❌ Error seeding product ${product.sku}:`, error.message);
      }
    }

    console.log('✅ Sample products seeded');
    console.log('🎉 Smart Proposal System data seeding completed!');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedProposalData()
    .catch((e) => {
      console.error('Error seeding proposal data:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { seedProposalData }; 