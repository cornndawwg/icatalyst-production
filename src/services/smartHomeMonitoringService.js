/**
 * 🏠 Smart Home System Monitoring Service for iCatalyst CRM
 * 
 * Provides integration and monitoring capabilities for:
 * - Control4 systems (when API becomes available)
 * - Lutron Caseta Pro (via telnet/LEAP)
 * - Crestron Home (via REST API)
 * - Generic MQTT/HTTP monitoring
 * 
 * Note: This is an MVP foundation that can be expanded as APIs become available
 */

class SmartHomeMonitoringService {
  constructor() {
    this.supportedSystems = ['lutron-caseta', 'crestron', 'control4', 'generic'];
    this.activeConnections = new Map();
    this.monitoringConfig = {
      pollInterval: 30000, // 30 seconds
      timeout: 5000,
      retryAttempts: 3
    };

    console.log('🏠 Smart Home Monitoring Service initialized');
  }

  /**
   * 🔗 Register a smart home system for monitoring
   */
  async registerSystem(systemConfig) {
    try {
      const { type, name, host, credentials, customerId, projectId } = systemConfig;
      
      console.log(`🔗 Registering ${type} system: ${name}`);

      if (!this.supportedSystems.includes(type)) {
        throw new Error(`Unsupported system type: ${type}`);
      }

      const systemId = `${type}-${customerId}-${Date.now()}`;
      
      const system = {
        id: systemId,
        type,
        name,
        host,
        credentials,
        customerId,
        projectId,
        status: 'connecting',
        lastSeen: null,
        devices: [],
        registeredAt: new Date()
      };

      // Test connection based on system type
      const connectionTest = await this.testConnection(system);
      
      if (connectionTest.success) {
        system.status = 'connected';
        system.lastSeen = new Date();
        this.activeConnections.set(systemId, system);
        
        // Start monitoring
        this.startMonitoring(systemId);
      } else {
        system.status = 'failed';
        system.error = connectionTest.error;
      }

      console.log(`✅ System ${name} registered with status: ${system.status}`);
      return system;

    } catch (error) {
      console.error('❌ System registration failed:', error);
      throw error;
    }
  }

  /**
   * 🧪 Test connection to smart home system
   */
  async testConnection(system) {
    try {
      switch (system.type) {
        case 'lutron-caseta':
          return await this.testLutronConnection(system);
        case 'crestron':
          return await this.testCrestronConnection(system);
        case 'control4':
          return await this.testControl4Connection(system);
        case 'generic':
          return await this.testGenericConnection(system);
        default:
          throw new Error(`Unknown system type: ${system.type}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 🔧 Test Lutron Caseta Pro connection
   */
  async testLutronConnection(system) {
    try {
      // Test telnet connection to Lutron Bridge Pro
      const net = require('net');
      
      return new Promise((resolve) => {
        const client = new net.Socket();
        client.setTimeout(this.monitoringConfig.timeout);

        client.connect(23, system.host, () => {
          console.log('🔧 Lutron telnet connection established');
          client.destroy();
          resolve({
            success: true,
            connectionType: 'telnet',
            port: 23
          });
        });

        client.on('timeout', () => {
          client.destroy();
          resolve({
            success: false,
            error: 'Connection timeout'
          });
        });

        client.on('error', (err) => {
          resolve({
            success: false,
            error: err.message
          });
        });
      });

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 🏗️ Test Crestron connection
   */
  async testCrestronConnection(system) {
    try {
      // Test HTTPS connection to Crestron Home
      const response = await fetch(`https://${system.host}/cws/api`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${system.credentials.token}`,
          'Accept': 'application/json'
        },
        timeout: this.monitoringConfig.timeout
      });

      if (response.ok) {
        return {
          success: true,
          connectionType: 'https',
          apiVersion: response.headers.get('api-version')
        };
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 🎮 Test Control4 connection (placeholder)
   */
  async testControl4Connection(system) {
    // Control4 API is not publicly available
    // This would require dealer credentials and specific integration
    console.log('🎮 Control4 integration requires dealer API access');
    
    return {
      success: false,
      error: 'Control4 API integration requires dealer credentials and is not publicly available'
    };
  }

  /**
   * 🌐 Test generic HTTP/MQTT connection
   */
  async testGenericConnection(system) {
    try {
      if (system.credentials.protocol === 'http' || system.credentials.protocol === 'https') {
        const response = await fetch(`${system.credentials.protocol}://${system.host}${system.credentials.endpoint || '/status'}`, {
          timeout: this.monitoringConfig.timeout
        });
        
        return {
          success: response.ok,
          connectionType: system.credentials.protocol,
          status: response.status
        };
      }
      
      // MQTT would require additional setup
      return {
        success: false,
        error: 'MQTT monitoring not yet implemented'
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 📊 Start monitoring a registered system
   */
  startMonitoring(systemId) {
    const system = this.activeConnections.get(systemId);
    if (!system) return;

    console.log(`📊 Starting monitoring for system: ${system.name}`);

    const monitor = setInterval(async () => {
      try {
        const healthCheck = await this.performHealthCheck(system);
        
        if (healthCheck.success) {
          system.status = 'connected';
          system.lastSeen = new Date();
          system.health = healthCheck.health;
        } else {
          system.status = 'disconnected';
          system.error = healthCheck.error;
          console.warn(`⚠️ System ${system.name} health check failed:`, healthCheck.error);
        }

        // Update system data
        this.activeConnections.set(systemId, system);

      } catch (error) {
        console.error(`❌ Monitoring error for ${system.name}:`, error);
        system.status = 'error';
        system.error = error.message;
      }
    }, this.monitoringConfig.pollInterval);

    // Store monitor reference for cleanup
    system.monitorRef = monitor;
  }

  /**
   * 🏥 Perform health check on system
   */
  async performHealthCheck(system) {
    try {
      switch (system.type) {
        case 'lutron-caseta':
          return await this.checkLutronHealth(system);
        case 'crestron':
          return await this.checkCrestronHealth(system);
        case 'generic':
          return await this.checkGenericHealth(system);
        default:
          return {
            success: false,
            error: 'Health check not implemented for this system type'
          };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 🔧 Check Lutron system health
   */
  async checkLutronHealth(system) {
    try {
      // Simple ping test for Lutron bridge
      const net = require('net');
      
      return new Promise((resolve) => {
        const client = new net.Socket();
        client.setTimeout(3000);

        client.connect(23, system.host, () => {
          client.destroy();
          resolve({
            success: true,
            health: {
              connectionType: 'telnet',
              responseTime: Date.now() - startTime,
              status: 'online'
            }
          });
        });

        const startTime = Date.now();

        client.on('timeout', () => {
          client.destroy();
          resolve({
            success: false,
            error: 'Connection timeout'
          });
        });

        client.on('error', (err) => {
          resolve({
            success: false,
            error: err.message
          });
        });
      });

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 🏗️ Check Crestron system health
   */
  async checkCrestronHealth(system) {
    try {
      const startTime = Date.now();
      
      const response = await fetch(`https://${system.host}/cws/api/devices`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${system.credentials.token}`,
          'Accept': 'application/json'
        },
        timeout: 3000
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          health: {
            connectionType: 'https',
            responseTime: Date.now() - startTime,
            deviceCount: data.devices?.length || 0,
            status: 'online'
          }
        };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 🌐 Check generic system health
   */
  async checkGenericHealth(system) {
    try {
      const startTime = Date.now();
      
      const response = await fetch(`${system.credentials.protocol}://${system.host}${system.credentials.healthEndpoint || '/health'}`, {
        timeout: 3000
      });

      return {
        success: response.ok,
        health: {
          connectionType: system.credentials.protocol,
          responseTime: Date.now() - startTime,
          httpStatus: response.status,
          status: response.ok ? 'online' : 'degraded'
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 📋 Get all monitored systems
   */
  getAllSystems() {
    return Array.from(this.activeConnections.values()).map(system => ({
      id: system.id,
      type: system.type,
      name: system.name,
      status: system.status,
      lastSeen: system.lastSeen,
      health: system.health,
      customerId: system.customerId,
      projectId: system.projectId,
      error: system.error
    }));
  }

  /**
   * 📊 Get system dashboard data
   */
  getDashboardStats() {
    const systems = this.getAllSystems();
    
    return {
      total: systems.length,
      online: systems.filter(s => s.status === 'connected').length,
      offline: systems.filter(s => s.status === 'disconnected').length,
      error: systems.filter(s => s.status === 'error').length,
      byType: {
        lutron: systems.filter(s => s.type === 'lutron-caseta').length,
        crestron: systems.filter(s => s.type === 'crestron').length,
        control4: systems.filter(s => s.type === 'control4').length,
        generic: systems.filter(s => s.type === 'generic').length
      }
    };
  }

  /**
   * 🔄 Refresh system status
   */
  async refreshSystem(systemId) {
    const system = this.activeConnections.get(systemId);
    if (!system) {
      throw new Error('System not found');
    }

    console.log(`🔄 Refreshing system: ${system.name}`);
    
    const healthCheck = await this.performHealthCheck(system);
    
    if (healthCheck.success) {
      system.status = 'connected';
      system.lastSeen = new Date();
      system.health = healthCheck.health;
      system.error = null;
    } else {
      system.status = 'disconnected';
      system.error = healthCheck.error;
    }

    this.activeConnections.set(systemId, system);
    return system;
  }

  /**
   * 🗑️ Remove system from monitoring
   */
  removeSystem(systemId) {
    const system = this.activeConnections.get(systemId);
    if (!system) return false;

    // Stop monitoring
    if (system.monitorRef) {
      clearInterval(system.monitorRef);
    }

    // Remove from active connections
    this.activeConnections.delete(systemId);
    
    console.log(`🗑️ System ${system.name} removed from monitoring`);
    return true;
  }

  /**
   * 📱 Generate system alert recommendations
   */
  generateAlerts() {
    const systems = this.getAllSystems();
    const alerts = [];

    systems.forEach(system => {
      // Offline systems
      if (system.status === 'disconnected' || system.status === 'error') {
        alerts.push({
          type: 'system_offline',
          severity: 'high',
          system: system.name,
          message: `${system.name} has been offline since ${system.lastSeen}`,
          recommendation: 'Check network connectivity and device power'
        });
      }

      // Slow response times
      if (system.health?.responseTime > 5000) {
        alerts.push({
          type: 'slow_response',
          severity: 'medium',
          system: system.name,
          message: `${system.name} response time is ${system.health.responseTime}ms`,
          recommendation: 'Check network performance and device load'
        });
      }

      // Long time since last contact
      if (system.lastSeen) {
        const timeSinceLastSeen = Date.now() - new Date(system.lastSeen).getTime();
        if (timeSinceLastSeen > 300000) { // 5 minutes
          alerts.push({
            type: 'stale_data',
            severity: 'medium',
            system: system.name,
            message: `No contact with ${system.name} for ${Math.round(timeSinceLastSeen / 60000)} minutes`,
            recommendation: 'Verify monitoring configuration and network stability'
          });
        }
      }
    });

    return alerts;
  }
}

module.exports = SmartHomeMonitoringService; 