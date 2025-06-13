/**
 * Product Recommendation API Routes
 * 
 * AI-powered product recommendation and intelligent bundling system
 * that leverages persona detection for optimized smart home solutions.
 */

const express = require('express');
const router = express.Router();
const { productRecommendationService } = require('../services/product-recommendation-service');
const { personaDetectionService } = require('../services/persona-detection-service');

/**
 * Generate product recommendations based on persona and requirements
 * 
 * POST /api/product-recommendations/generate
 * Body: {
 *   persona?: string,              // If not provided, will detect from voice/description
 *   voiceTranscript?: string,      // For persona detection and context
 *   description?: string,          // Alternative to voice for persona detection
 *   budget?: number,               // Customer budget
 *   projectSize?: number,          // Square feet or scope indicator
 *   preferredTier?: 'good'|'better'|'best',
 *   additionalRequirements?: string[],
 *   customerId?: number            // For proposal integration
 * }
 */
router.post('/generate', async (req, res) => {
  try {
    console.log('📊 Product recommendation generation request received');
    
    const {
      persona: providedPersona,
      voiceTranscript,
      description,
      budget,
      projectSize,
      preferredTier,
      additionalRequirements = [],
      customerId
    } = req.body;

    let persona = providedPersona;
    let personaConfidence = 1.0;

    // If persona not provided, detect it from voice transcript or description
    if (!persona && (voiceTranscript || description)) {
      console.log('🔍 Persona not provided, detecting from input...');
      
      const detectionInput = voiceTranscript || description;
      const detectionResult = await personaDetectionService.detectPersona(detectionInput);
      
      if (detectionResult.success) {
        persona = detectionResult.detectedPersona;
        personaConfidence = detectionResult.confidence;
        console.log(`✅ Detected persona: ${persona} (confidence: ${Math.round(personaConfidence * 100)}%)`);
      } else {
        console.log('⚠️ Persona detection failed, using default homeowner persona');
        persona = 'homeowner';
        personaConfidence = 0.5;
      }
    } else if (!persona) {
      persona = 'homeowner'; // Default fallback
      personaConfidence = 0.5;
    }

    // Validate persona
    const availablePersonas = productRecommendationService.constructor.getAvailablePersonas();
    if (!availablePersonas.includes(persona)) {
      return res.status(400).json({
        success: false,
        error: `Invalid persona: ${persona}. Available personas: ${availablePersonas.join(', ')}`
      });
    }

    // Generate recommendations
    const recommendations = await productRecommendationService.generateRecommendations({
      persona,
      personaConfidence,
      budget,
      projectSize,
      voiceTranscript,
      additionalRequirements,
      preferredTier
    });

    if (!recommendations.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate recommendations',
        details: recommendations.error,
        fallback: recommendations.fallbackRecommendations
      });
    }

    console.log('✅ Product recommendations generated successfully');

    res.json({
      success: true,
      message: 'Product recommendations generated successfully',
      data: recommendations,
      metadata: {
        requestId: req.headers['x-request-id'] || Date.now().toString(),
        timestamp: new Date().toISOString(),
        personaDetection: {
          detected: !providedPersona,
          persona,
          confidence: personaConfidence
        }
      }
    });

  } catch (error) {
    console.error('❌ Product recommendation generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Product recommendation generation failed',
      details: error.message
    });
  }
});

/**
 * Get intelligent product bundles for specific persona
 * 
 * GET /api/product-recommendations/bundles/:persona
 * Query: ?budget=15000&tier=better&projectSize=2500
 */
router.get('/bundles/:persona', async (req, res) => {
  try {
    const { persona } = req.params;
    const { budget, tier, projectSize } = req.query;

    console.log(`📦 Generating bundles for persona: ${persona}`);

    // Validate persona
    const availablePersonas = productRecommendationService.constructor.getAvailablePersonas();
    if (!availablePersonas.includes(persona)) {
      return res.status(400).json({
        success: false,
        error: `Invalid persona: ${persona}. Available personas: ${availablePersonas.join(', ')}`
      });
    }

    // Generate bundle recommendations
    const bundles = await productRecommendationService.generateRecommendations({
      persona,
      budget: budget ? parseInt(budget) : undefined,
      projectSize: projectSize ? parseInt(projectSize) : undefined,
      preferredTier: tier,
      personaConfidence: 1.0
    });

    if (!bundles.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate bundles',
        details: bundles.error
      });
    }

    res.json({
      success: true,
      message: `Product bundles generated for ${persona}`,
      data: {
        persona,
        bundles: {
          good: bundles.recommendations.goodTier,
          better: bundles.recommendations.betterTier,
          best: bundles.recommendations.bestTier
        },
        recommendedTier: bundles.recommendations.recommendedTier,
        summary: bundles.summary
      }
    });

  } catch (error) {
    console.error('❌ Bundle generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Bundle generation failed',
      details: error.message
    });
  }
});

/**
 * Get persona preferences and bundle strategies
 * 
 * GET /api/product-recommendations/personas
 */
router.get('/personas', async (req, res) => {
  try {
    const availablePersonas = productRecommendationService.constructor.getAvailablePersonas();
    const bundleStrategies = productRecommendationService.constructor.getBundleStrategies();

    const personaDetails = {};
    for (const persona of availablePersonas) {
      const preferences = productRecommendationService.constructor.getPersonaPreferences(persona);
      personaDetails[persona] = {
        ...preferences,
        bundleStrategy: bundleStrategies[preferences.bundleStrategy]
      };
    }

    res.json({
      success: true,
      message: 'Persona preferences and bundle strategies',
      data: {
        personas: personaDetails,
        bundleStrategies,
        totalPersonas: availablePersonas.length
      }
    });

  } catch (error) {
    console.error('❌ Error getting persona preferences:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get persona preferences',
      details: error.message
    });
  }
});

/**
 * Get pricing optimization for specific persona and tier
 * 
 * GET /api/product-recommendations/pricing/:persona/:tier
 * Query: ?productIds=1,2,3&budget=20000
 */
router.get('/pricing/:persona/:tier', async (req, res) => {
  try {
    const { persona, tier } = req.params;
    const { productIds, budget } = req.query;

    console.log(`💰 Calculating pricing for ${persona} - ${tier} tier`);

    // Validate inputs
    const availablePersonas = productRecommendationService.constructor.getAvailablePersonas();
    if (!availablePersonas.includes(persona)) {
      return res.status(400).json({
        success: false,
        error: `Invalid persona: ${persona}`
      });
    }

    const validTiers = ['good', 'better', 'best'];
    if (!validTiers.includes(tier)) {
      return res.status(400).json({
        success: false,
        error: `Invalid tier: ${tier}. Valid tiers: ${validTiers.join(', ')}`
      });
    }

    // Get persona preferences for pricing optimization
    const personaPrefs = productRecommendationService.constructor.getPersonaPreferences(persona);
    
    let pricingData = {
      persona,
      tier,
      priceMultiplier: personaPrefs.priceMultiplier,
      budgetRange: personaPrefs.budgetRange,
      preferredTier: personaPrefs.preferredTier,
      recommendations: {
        tierAlignment: tier === personaPrefs.preferredTier ? 'optimal' : 
                      tier === 'best' && personaPrefs.preferredTier === 'better' ? 'upgrade' : 'alternative',
        budgetFit: budget ? {
          provided: parseInt(budget),
          recommended: personaPrefs.budgetRange,
          status: parseInt(budget) >= personaPrefs.budgetRange.min && 
                  parseInt(budget) <= personaPrefs.budgetRange.max ? 'optimal' : 'outside-range'
        } : null
      }
    };

    // If specific product IDs provided, calculate pricing for those products
    if (productIds) {
      const ids = productIds.split(',').map(id => parseInt(id.trim()));
      // This would typically fetch actual products and calculate pricing
      // For now, return the pricing framework
      pricingData.requestedProducts = ids;
      pricingData.note = 'Product-specific pricing calculation would be implemented here';
    }

    res.json({
      success: true,
      message: `Pricing optimization for ${persona} - ${tier} tier`,
      data: pricingData
    });

  } catch (error) {
    console.error('❌ Pricing calculation error:', error);
    res.status(500).json({
      success: false,
      error: 'Pricing calculation failed',
      details: error.message
    });
  }
});

/**
 * Test product recommendation accuracy with sample inputs
 * 
 * POST /api/product-recommendations/test
 * Body: {
 *   testCases: [
 *     {
 *       name: "Test Case Name",
 *       input: { persona: "homeowner", budget: 15000, ... },
 *       expectedOutcome: { minItems: 5, maxTotal: 20000, ... }
 *     }
 *   ]
 * }
 */
router.post('/test', async (req, res) => {
  try {
    console.log('🧪 Running product recommendation tests');
    
    const { testCases = [] } = req.body;
    
    if (testCases.length === 0) {
      // Provide default test cases
      const defaultTestCases = [
        {
          name: "Homeowner Basic Package",
          input: {
            persona: "homeowner",
            budget: 15000,
            projectSize: 2000,
            preferredTier: "better"
          },
          expectedOutcome: {
            minItems: 5,
            maxItems: 15,
            maxTotal: 18000,
            requiredCategories: ["security", "lighting"]
          }
        },
        {
          name: "Interior Designer Premium",
          input: {
            persona: "interior-designer",
            budget: 50000,
            preferredTier: "best"
          },
          expectedOutcome: {
            minItems: 10,
            maxItems: 20,
            maxTotal: 60000,
            requiredCategories: ["lighting", "audio-video"]
          }
        },
        {
          name: "Builder Cost-Effective",
          input: {
            persona: "builder",
            budget: 8000,
            preferredTier: "good"
          },
          expectedOutcome: {
            minItems: 5,
            maxItems: 12,
            maxTotal: 10000,
            requiredCategories: ["security", "lighting"]
          }
        },
        {
          name: "C-Suite Executive Package",
          input: {
            persona: "c-suite",
            budget: 75000,
            preferredTier: "best"
          },
          expectedOutcome: {
            minItems: 8,
            maxItems: 25,
            maxTotal: 90000,
            requiredCategories: ["audio-video", "lighting", "security"]
          }
        }
      ];
      
      return res.json({
        success: true,
        message: 'Default test cases provided',
        data: {
          availableTestCases: defaultTestCases,
          instruction: 'Submit these test cases in the request body to run tests'
        }
      });
    }

    const testResults = [];
    
    for (const testCase of testCases) {
      console.log(`🧪 Running test: ${testCase.name}`);
      
      const startTime = Date.now();
      
      try {
        // Generate recommendations for test case
        const result = await productRecommendationService.generateRecommendations({
          ...testCase.input,
          personaConfidence: 1.0
        });
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        // Validate against expected outcome
        const validation = this.validateTestResult(result, testCase.expectedOutcome);
        
        testResults.push({
          name: testCase.name,
          passed: validation.passed,
          result: result.success ? {
            itemCount: result.recommendations.items.length,
            total: result.recommendations.estimatedTotal,
            categories: [...new Set(result.recommendations.items.map(item => item.category))],
            recommendedTier: result.recommendations.recommendedTier
          } : null,
          validation,
          performance: {
            duration: `${duration}ms`,
            success: result.success
          },
          errors: result.success ? null : result.error
        });
        
      } catch (error) {
        testResults.push({
          name: testCase.name,
          passed: false,
          error: error.message,
          performance: {
            duration: `${Date.now() - startTime}ms`,
            success: false
          }
        });
      }
    }
    
    const summary = {
      totalTests: testResults.length,
      passed: testResults.filter(r => r.passed).length,
      failed: testResults.filter(r => !r.passed).length,
      successRate: Math.round((testResults.filter(r => r.passed).length / testResults.length) * 100)
    };
    
    console.log(`🧪 Test summary: ${summary.passed}/${summary.totalTests} passed (${summary.successRate}%)`);
    
    res.json({
      success: true,
      message: `Product recommendation testing completed`,
      data: {
        summary,
        results: testResults
      }
    });

  } catch (error) {
    console.error('❌ Testing error:', error);
    res.status(500).json({
      success: false,
      error: 'Testing failed',
      details: error.message
    });
  }
});

/**
 * Validate test result against expected outcome
 */
function validateTestResult(result, expected) {
  const validation = {
    passed: true,
    checks: []
  };

  if (!result.success) {
    validation.passed = false;
    validation.checks.push({
      check: 'recommendation_generation',
      passed: false,
      message: 'Failed to generate recommendations'
    });
    return validation;
  }

  const items = result.recommendations.items || [];
  const total = result.recommendations.estimatedTotal || 0;
  const categories = [...new Set(items.map(item => item.category))];

  // Check minimum items
  if (expected.minItems && items.length < expected.minItems) {
    validation.passed = false;
    validation.checks.push({
      check: 'minimum_items',
      passed: false,
      expected: expected.minItems,
      actual: items.length,
      message: `Expected at least ${expected.minItems} items, got ${items.length}`
    });
  } else if (expected.minItems) {
    validation.checks.push({
      check: 'minimum_items',
      passed: true,
      expected: expected.minItems,
      actual: items.length
    });
  }

  // Check maximum items
  if (expected.maxItems && items.length > expected.maxItems) {
    validation.passed = false;
    validation.checks.push({
      check: 'maximum_items',
      passed: false,
      expected: expected.maxItems,
      actual: items.length,
      message: `Expected at most ${expected.maxItems} items, got ${items.length}`
    });
  } else if (expected.maxItems) {
    validation.checks.push({
      check: 'maximum_items',
      passed: true,
      expected: expected.maxItems,
      actual: items.length
    });
  }

  // Check maximum total
  if (expected.maxTotal && total > expected.maxTotal) {
    validation.passed = false;
    validation.checks.push({
      check: 'maximum_total',
      passed: false,
      expected: expected.maxTotal,
      actual: total,
      message: `Expected total ≤ $${expected.maxTotal}, got $${total}`
    });
  } else if (expected.maxTotal) {
    validation.checks.push({
      check: 'maximum_total',
      passed: true,
      expected: expected.maxTotal,
      actual: total
    });
  }

  // Check required categories
  if (expected.requiredCategories && expected.requiredCategories.length > 0) {
    const missingCategories = expected.requiredCategories.filter(cat => !categories.includes(cat));
    if (missingCategories.length > 0) {
      validation.passed = false;
      validation.checks.push({
        check: 'required_categories',
        passed: false,
        expected: expected.requiredCategories,
        actual: categories,
        missing: missingCategories,
        message: `Missing required categories: ${missingCategories.join(', ')}`
      });
    } else {
      validation.checks.push({
        check: 'required_categories',
        passed: true,
        expected: expected.requiredCategories,
        actual: categories
      });
    }
  }

  return validation;
}

/**
 * Get service health and configuration
 * 
 * GET /api/product-recommendations/health
 */
router.get('/health', async (req, res) => {
  try {
    const healthCheck = {
      service: 'ProductRecommendationService',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      configuration: {
        openaiConfigured: productRecommendationService.isConfigured,
        totalPersonas: productRecommendationService.constructor.getAvailablePersonas().length,
        bundleStrategies: Object.keys(productRecommendationService.constructor.getBundleStrategies()).length
      },
      capabilities: {
        aiRecommendations: productRecommendationService.isConfigured,
        ruleBasedRecommendations: true,
        personaDetectionIntegration: true,
        pricingOptimization: true,
        bundleCompatibilityValidation: true,
        tierCalculation: true
      }
    };

    res.json({
      success: true,
      message: 'Product recommendation service health check',
      data: healthCheck
    });

  } catch (error) {
    console.error('❌ Health check error:', error);
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      details: error.message
    });
  }
});

module.exports = router;