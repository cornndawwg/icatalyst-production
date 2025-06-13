const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const SmartHomeMonitoringService = require('../services/smartHomeMonitoringService');

// GET /api/smart-home-monitoring/systems - List all monitored systems
// POST /api/smart-home-monitoring/register - Register new system for monitoring
// GET /api/smart-home-monitoring/dashboard/stats - Get monitoring dashboard statistics
// PUT /api/smart-home-monitoring/systems/:id/refresh - Refresh system status
// DELETE /api/smart-home-monitoring/systems/:id - Remove system from monitoring
// GET /api/smart-home-monitoring/health - Health check endpoint

const monitoringService = new SmartHomeMonitoringService();

// 🏠 Get all monitored smart home systems
router.get('/systems', async (req, res) => {
  try {
    console.log('🏠 Fetching all monitored smart home systems');
    
    const { customerId, projectId, type, status } = req.query;
    
    let systems = monitoringService.getAllSystems();
    
    // Apply filters
    if (customerId) {
      systems = systems.filter(s => s.customerId === customerId);
    }
    
    if (projectId) {
      systems = systems.filter(s => s.projectId === projectId);
    }
    
    if (type) {
      systems = systems.filter(s => s.type === type);
    }
    
    if (status) {
      systems = systems.filter(s => s.status === status);
    }

    console.log(`✅ Found ${systems.length} monitored systems`);
    
    res.json({
      success: true,
      systems,
      total: systems.length
    });

  } catch (error) {
    console.error('❌ Error fetching monitored systems:', error);
    res.status(500).json({
      error: 'Failed to fetch monitored systems',
      details: error.message
    });
  }
});

// 🔗 Register new smart home system for monitoring
router.post('/register', async (req, res) => {
  try {
    const systemConfig = req.body;
    
    console.log('🔗 Registering new smart home system:', systemConfig.name);

    // Validate required fields
    const requiredFields = ['type', 'name', 'host', 'customerId'];
    const missingFields = requiredFields.filter(field => !systemConfig[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        missingFields
      });
    }

    // Validate system type
    const supportedTypes = ['lutron-caseta', 'crestron', 'control4', 'generic'];
    if (!supportedTypes.includes(systemConfig.type)) {
      return res.status(400).json({
        error: 'Unsupported system type',
        supportedTypes
      });
    }

    // Verify customer exists
    if (systemConfig.customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: systemConfig.customerId }
      });
      
      if (!customer) {
        return res.status(404).json({
          error: 'Customer not found'
        });
      }
    }

    // Register the system
    const registeredSystem = await monitoringService.registerSystem(systemConfig);
    
    console.log('✅ Smart home system registered successfully');
    
    res.json({
      success: true,
      system: registeredSystem,
      message: 'Smart home system registered for monitoring'
    });

  } catch (error) {
    console.error('❌ Error registering smart home system:', error);
    res.status(500).json({
      error: 'Failed to register system',
      details: error.message
    });
  }
});

// 📊 Get smart home monitoring dashboard statistics
router.get('/dashboard/stats', async (req, res) => {
  try {
    console.log('📊 Generating smart home monitoring dashboard statistics');

    const stats = monitoringService.getDashboardStats();
    
    // Get additional database statistics
    const [totalCustomersWithSystems, totalProjects] = await Promise.all([
      prisma.customer.count(),
      prisma.project.count()
    ]);

    const dashboardStats = {
      monitoring: stats,
      integration: {
        totalCustomersWithSystems,
        totalProjects,
        averageSystemsPerCustomer: stats.total > 0 ? (stats.total / totalCustomersWithSystems).toFixed(1) : 0
      },
      alerts: monitoringService.generateAlerts?.() || [],
      lastUpdated: new Date().toISOString()
    };

    console.log('✅ Smart home monitoring dashboard statistics generated');
    
    res.json({
      success: true,
      stats: dashboardStats
    });

  } catch (error) {
    console.error('❌ Error generating monitoring statistics:', error);
    res.status(500).json({
      error: 'Failed to generate monitoring statistics',
      details: error.message
    });
  }
});

// 🔄 Refresh specific system status
router.put('/systems/:id/refresh', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🔄 Refreshing system status: ${id}`);

    const refreshedSystem = await monitoringService.refreshSystem(id);
    
    console.log('✅ System status refreshed successfully');
    
    res.json({
      success: true,
      system: refreshedSystem,
      message: 'System status refreshed'
    });

  } catch (error) {
    console.error('❌ Error refreshing system status:', error);
    res.status(500).json({
      error: 'Failed to refresh system status',
      details: error.message
    });
  }
});

// 🗑️ Remove system from monitoring
router.delete('/systems/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🗑️ Removing system from monitoring: ${id}`);

    const removed = monitoringService.removeSystem(id);
    
    if (removed) {
      console.log('✅ System removed from monitoring successfully');
      
      res.json({
        success: true,
        message: 'System removed from monitoring'
      });
    } else {
      res.status(404).json({
        error: 'System not found'
      });
    }

  } catch (error) {
    console.error('❌ Error removing system from monitoring:', error);
    res.status(500).json({
      error: 'Failed to remove system from monitoring',
      details: error.message
    });
  }
});

// 🏠 Get supported smart home system types and requirements
router.get('/supported-systems', (req, res) => {
  try {
    const supportedSystems = {
      'lutron-caseta': {
        name: 'Lutron Caseta Pro',
        description: 'Professional Lutron lighting control systems',
        requirements: {
          hardware: 'Lutron Bridge Pro (L-BDGPRO2-WH)',
          connection: 'Telnet (port 23)',
          authentication: 'Username: lutron, Password: integration',
          setup: 'Enable telnet integration in Lutron app'
        },
        capabilities: ['lighting_control', 'status_monitoring', 'device_discovery'],
        status: 'supported'
      },
      'crestron': {
        name: 'Crestron Home',
        description: 'Crestron home automation systems',
        requirements: {
          hardware: 'Crestron Control Processor (CP4-R, MC4-R, PC4-R)',
          connection: 'HTTPS REST API',
          authentication: 'Web API token from Crestron Home app',
          setup: 'Generate authentication token in system settings'
        },
        capabilities: ['lighting_control', 'av_control', 'climate_control', 'security_integration'],
        status: 'supported'
      },
      'control4': {
        name: 'Control4',
        description: 'Control4 home automation systems',
        requirements: {
          hardware: 'Control4 Director (EA series controllers)',
          connection: 'Dealer API access required',
          authentication: 'Control4 dealer credentials',
          setup: 'Requires authorized Control4 dealer integration'
        },
        capabilities: ['whole_home_automation', 'entertainment_control', 'security_integration'],
        status: 'requires_dealer_access'
      },
      'generic': {
        name: 'Generic HTTP/MQTT',
        description: 'Generic smart home devices with HTTP or MQTT interfaces',
        requirements: {
          hardware: 'Any device with HTTP REST API or MQTT support',
          connection: 'HTTP/HTTPS or MQTT',
          authentication: 'API keys or credentials as required',
          setup: 'Configure endpoint URLs and authentication'
        },
        capabilities: ['status_monitoring', 'custom_integrations'],
        status: 'supported'
      }
    };

    res.json({
      success: true,
      supportedSystems,
      totalTypes: Object.keys(supportedSystems).length
    });

  } catch (error) {
    console.error('❌ Error getting supported systems:', error);
    res.status(500).json({
      error: 'Failed to get supported systems',
      details: error.message
    });
  }
});

// 🚨 Get system alerts and recommendations
router.get('/alerts', (req, res) => {
  try {
    console.log('🚨 Generating system alerts and recommendations');

    const alerts = monitoringService.generateAlerts?.() || [];
    
    // Categorize alerts by severity
    const categorizedAlerts = {
      high: alerts.filter(a => a.severity === 'high'),
      medium: alerts.filter(a => a.severity === 'medium'),
      low: alerts.filter(a => a.severity === 'low'),
      total: alerts.length
    };

    res.json({
      success: true,
      alerts: categorizedAlerts,
      recommendations: alerts.map(a => a.recommendation).filter(Boolean)
    });

  } catch (error) {
    console.error('❌ Error generating alerts:', error);
    res.status(500).json({
      error: 'Failed to generate alerts',
      details: error.message
    });
  }
});

// GET /api/smart-home-monitoring/health - Health check endpoint
router.get('/health', async (req, res) => {
  try {
    res.json({
      status: 'healthy',
      service: 'Smart Home Monitoring',
      version: '1.0.0',
      features: [
        'Device status monitoring',
        'System health checks',
        'Performance analytics',
        'Alert management'
      ],
      configured: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Smart Home Monitoring health check error:', error);
    res.status(500).json({
      error: 'Smart Home Monitoring health check failed',
      details: error.message
    });
  }
});

module.exports = router; 