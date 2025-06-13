const express = require('express');
const router = express.Router();
const analyticsService = require('../services/analytics-service');

// =============================================================================
// EXECUTIVE SUMMARY DASHBOARD ROUTES
// =============================================================================

/**
 * GET /api/analytics/executive-summary
 * Main endpoint for Executive Summary Dashboard
 * Returns 4-quadrant KPI data: Revenue Impact, Efficiency Gains, Customer Experience, AI Performance
 */
router.get('/executive-summary', async (req, res) => {
  try {
    console.log('📊 API: Generating executive summary dashboard data...');
    
    const { timeframe = 'last_30_days' } = req.query;
    
    // Validate timeframe
    const validTimeframes = ['last_7_days', 'last_30_days', 'last_90_days'];
    if (!validTimeframes.includes(timeframe)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid timeframe',
        validOptions: validTimeframes
      });
    }

    const summary = await analyticsService.getExecutiveSummary(timeframe);
    
    res.json(summary);
  } catch (error) {
    console.error('❌ Executive Summary API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate executive summary',
      details: error.message
    });
  }
});

/**
 * GET /api/analytics/revenue-impact
 * Detailed revenue impact analysis
 */
router.get('/revenue-impact', async (req, res) => {
  try {
    console.log('💰 API: Calculating revenue impact metrics...');
    
    const { timeframe = 'last_30_days' } = req.query;
    const dateRange = analyticsService.getDateRange(timeframe);
    
    const revenueImpact = await analyticsService.calculateRevenueImpact(dateRange);
    
    res.json({
      success: true,
      data: revenueImpact,
      timeframe,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Revenue Impact API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate revenue impact',
      details: error.message
    });
  }
});

/**
 * GET /api/analytics/efficiency-gains
 * Detailed efficiency and productivity metrics
 */
router.get('/efficiency-gains', async (req, res) => {
  try {
    console.log('⚡ API: Calculating efficiency gains...');
    
    const { timeframe = 'last_30_days' } = req.query;
    const dateRange = analyticsService.getDateRange(timeframe);
    
    const efficiencyGains = await analyticsService.calculateEfficiencyGains(dateRange);
    
    res.json({
      success: true,
      data: efficiencyGains,
      timeframe,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Efficiency Gains API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate efficiency gains',
      details: error.message
    });
  }
});

/**
 * GET /api/analytics/customer-experience
 * Customer satisfaction and engagement metrics
 */
router.get('/customer-experience', async (req, res) => {
  try {
    console.log('🤝 API: Analyzing customer experience metrics...');
    
    const { timeframe = 'last_30_days' } = req.query;
    const dateRange = analyticsService.getDateRange(timeframe);
    
    const customerExperience = await analyticsService.calculateCustomerExperience(dateRange);
    
    res.json({
      success: true,
      data: customerExperience,
      timeframe,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Customer Experience API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate customer experience metrics',
      details: error.message
    });
  }
});

/**
 * GET /api/analytics/ai-performance
 * AI system performance and accuracy metrics
 */
router.get('/ai-performance', async (req, res) => {
  try {
    console.log('🤖 API: Analyzing AI performance metrics...');
    
    const { timeframe = 'last_30_days' } = req.query;
    const dateRange = analyticsService.getDateRange(timeframe);
    
    const aiPerformance = await analyticsService.calculateAIPerformance(dateRange);
    
    res.json({
      success: true,
      data: aiPerformance,
      timeframe,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ AI Performance API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate AI performance metrics',
      details: error.message
    });
  }
});

/**
 * GET /api/analytics/roi-calculation
 * ROI and financial impact analysis
 */
router.get('/roi-calculation', async (req, res) => {
  try {
    console.log('💎 API: Calculating ROI and financial impact...');
    
    const { timeframe = 'last_30_days' } = req.query;
    const dateRange = analyticsService.getDateRange(timeframe);
    
    const roiCalculation = await analyticsService.calculateROI(dateRange);
    
    res.json({
      success: true,
      data: roiCalculation,
      timeframe,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ ROI Calculation API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate ROI',
      details: error.message
    });
  }
});

// =============================================================================
// REAL-TIME EVENT TRACKING
// =============================================================================

/**
 * POST /api/analytics/track-event
 * Track analytics events in real-time for KPI updates
 */
router.post('/track-event', async (req, res) => {
  try {
    console.log('📈 API: Tracking analytics event...');
    
    const eventData = req.body;
    
    // Basic validation
    if (!eventData.eventType || !eventData.eventCategory) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: eventType and eventCategory'
      });
    }

    const event = await analyticsService.trackEvent(eventData);
    
    if (event) {
      res.json({
        success: true,
        data: event,
        message: 'Event tracked successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to track event'
      });
    }
  } catch (error) {
    console.error('❌ Event Tracking API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track event',
      details: error.message
    });
  }
});

// =============================================================================
// HEALTH CHECK AND STATUS
// =============================================================================

/**
 * GET /api/analytics/health
 * Analytics service health check
 */
router.get('/health', async (req, res) => {
  try {
    // Quick database connectivity test
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      success: true,
      status: 'operational',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        analytics: 'operational',
        kpi_tracking: 'active'
      }
    });
  } catch (error) {
    console.error('❌ Analytics Health Check Error:', error);
    res.status(503).json({
      success: false,
      status: 'degraded',
      error: 'Database connectivity issue',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/analytics/kpi-alerts
 * Get current KPI alerts and warnings
 */
router.get('/kpi-alerts', async (req, res) => {
  try {
    console.log('🚨 API: Checking KPI alerts...');
    
    const { timeframe = 'last_30_days' } = req.query;
    const summary = await analyticsService.getExecutiveSummary(timeframe);
    
    if (summary.success) {
      res.json({
        success: true,
        alerts: summary.data.alerts || [],
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to check KPI alerts'
      });
    }
  } catch (error) {
    console.error('❌ KPI Alerts API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check KPI alerts',
      details: error.message
    });
  }
});

// =============================================================================
// TESTING AND VALIDATION ENDPOINTS
// =============================================================================

/**
 * GET /api/analytics/test-data
 * Generate test data for dashboard development (development only)
 */
router.get('/test-data', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        error: 'Test data endpoint not available in production'
      });
    }

    console.log('🧪 API: Generating test analytics data...');
    
    const testData = {
      success: true,
      data: {
        timeframe: 'last_30_days',
        lastUpdated: new Date().toISOString(),
        revenueImpact: {
          totalRevenue: 127500,
          aiAttributedRevenue: 89250,
          revenueImprovement: 47.3,
          conversionRate: 73.2,
          averageDealSize: 5950,
          dealSizeImprovement: 32.2,
          totalDeals: 18,
          aiGeneratedDeals: 15,
          status: 'exceeding_target'
        },
        efficiencyGains: {
          proposalsGenerated: 23,
          avgProposalTime: 425, // seconds
          timeSavingPercentage: 94.3,
          totalTimeSavedHours: 54.5,
          technicianProductivity: 2.3,
          voiceProcessingSpeed: 2.8,
          costSavings: 2725,
          status: 'exceeding_target'
        },
        customerExperience: {
          customerSatisfaction: 8.7,
          responseRate: 82.1,
          responseRateImprovement: 134.6,
          avgViewDuration: 4.2,
          totalInteractions: 28,
          positiveInteractions: 24,
          engagementScore: 91.1,
          status: 'exceeding_target'
        },
        aiPerformance: {
          personaAccuracy: 97.2,
          recommendationAccuracy: 89.4,
          voiceProcessingSpeed: 2.8,
          systemUptime: 99.8,
          totalProcessedRequests: 156,
          successfulRequests: 154,
          errorRate: 1.3,
          status: 'exceeding_target'
        },
        roiCalculation: {
          totalInvestment: 17800,
          totalBenefits: 89975,
          netBenefit: 72175,
          roiPercentage: 405,
          paybackPeriodMonths: 2.4,
          monthlyRunRate: 29992,
          projectedAnnualROI: 1620,
          status: 'exceeding_target'
        },
        status: 'operational',
        alerts: []
      }
    };
    
    res.json(testData);
  } catch (error) {
    console.error('❌ Test Data API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate test data',
      details: error.message
    });
  }
});

module.exports = router; 