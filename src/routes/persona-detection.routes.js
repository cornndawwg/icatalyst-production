/**
 * Persona Detection API Routes
 * 
 * Provides endpoints for AI-enhanced persona detection with confidence scoring
 * and performance analytics.
 */

const express = require('express');
const router = express.Router();
const { personaDetectionService } = require('../services/persona-detection-service');
const prisma = require('../utils/prisma');

// POST /api/persona-detection/analyze - Analyze text/voice for persona detection
router.post('/analyze', async (req, res) => {
  try {
    const { text, voiceTranscript, additionalContext = {} } = req.body;
    
    console.log('🎯 Persona detection request received:', {
      hasText: !!text,
      hasVoiceTranscript: !!voiceTranscript,
      contextKeys: Object.keys(additionalContext)
    });

    // Validate input
    if (!text && !voiceTranscript) {
      return res.status(400).json({
        error: 'Either text or voiceTranscript is required for persona detection'
      });
    }

    // Perform persona detection
    const detectionResult = await personaDetectionService.detectPersona({
      text,
      voiceTranscript,
      additionalContext
    });

    // Get persona configuration if detection was successful
    let personaConfig = null;
    if (detectionResult.success && detectionResult.persona) {
      personaConfig = await personaDetectionService.getPersonaConfig(detectionResult.persona);
    }

    res.json({
      success: true,
      detection: detectionResult,
      personaConfig,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Persona detection API error:', error);
    res.status(500).json({
      error: 'Failed to analyze persona',
      details: error.message
    });
  }
});

// POST /api/persona-detection/test - Test persona detection with known data
router.post('/test', async (req, res) => {
  try {
    const { 
      text, 
      voiceTranscript, 
      expectedPersona, 
      testName = 'Manual Test',
      additionalContext = {} 
    } = req.body;

    console.log('🧪 Running persona detection test:', testName);

    // Perform detection
    const detectionResult = await personaDetectionService.detectPersona({
      text,
      voiceTranscript,
      additionalContext
    });

    // Calculate accuracy if expected persona provided
    let accuracy = null;
    let isCorrect = null;
    if (expectedPersona) {
      isCorrect = detectionResult.persona === expectedPersona;
      accuracy = isCorrect ? 1.0 : 0.0;
      
      // Track performance
      await personaDetectionService.trackDetectionPerformance(detectionResult, expectedPersona);
    }

    // Get configurations for comparison
    const detectedConfig = detectionResult.persona ? 
      await personaDetectionService.getPersonaConfig(detectionResult.persona) : null;
    
    const expectedConfig = expectedPersona ? 
      await personaDetectionService.getPersonaConfig(expectedPersona) : null;

    res.json({
      success: true,
      test: {
        name: testName,
        input: { text, voiceTranscript, additionalContext },
        expected: expectedPersona,
        detected: detectionResult.persona,
        confidence: detectionResult.confidence,
        method: detectionResult.method,
        accuracy,
        isCorrect,
        detectionDetails: detectionResult
      },
      personas: {
        detected: detectedConfig,
        expected: expectedConfig
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Persona detection test error:', error);
    res.status(500).json({
      error: 'Failed to run persona detection test',
      details: error.message
    });
  }
});

// GET /api/persona-detection/personas - Get all available personas for detection
router.get('/personas', async (req, res) => {
  try {
    const { type } = req.query;

    const where = {};
    if (type) {
      where.type = type;
    }

    // Get personas from database
    const personas = await prisma.proposalPersona.findMany({
      where,
      orderBy: [
        { type: 'asc' },
        { displayName: 'asc' }
      ]
    });

    // Add detection patterns information
    const personasWithPatterns = personas.map(persona => {
      const patterns = require('../services/persona-detection-service').PERSONA_DETECTION_PATTERNS[persona.name];
      return {
        ...persona,
        keyFeatures: persona.keyFeatures ? JSON.parse(persona.keyFeatures) : [],
        detectionPatterns: patterns ? {
          keywordCount: patterns.keywords?.length || 0,
          phraseCount: patterns.phrases?.length || 0,
          contextClueCount: patterns.context_clues?.length || 0,
          tierPreference: patterns.tier_preference,
          confidenceBoost: patterns.confidence_boost
        } : null
      };
    });

    res.json({
      success: true,
      personas: personasWithPatterns,
      total: personas.length,
      availableTypes: [...new Set(personas.map(p => p.type))].sort()
    });

  } catch (error) {
    console.error('❌ Error fetching personas for detection:', error);
    res.status(500).json({
      error: 'Failed to fetch personas',
      details: error.message
    });
  }
});

// GET /api/persona-detection/patterns/:persona - Get detection patterns for specific persona
router.get('/patterns/:persona', async (req, res) => {
  try {
    const { persona } = req.params;
    
    const patterns = require('../services/persona-detection-service').PERSONA_DETECTION_PATTERNS[persona];
    
    if (!patterns) {
      return res.status(404).json({
        error: `Detection patterns not found for persona: ${persona}`
      });
    }

    // Get persona config from database
    const personaConfig = await personaDetectionService.getPersonaConfig(persona);

    res.json({
      success: true,
      persona,
      patterns,
      config: personaConfig,
      statistics: {
        totalKeywords: patterns.keywords?.length || 0,
        totalPhrases: patterns.phrases?.length || 0,
        totalContextClues: patterns.context_clues?.length || 0,
        tierPreference: patterns.tier_preference,
        confidenceBoost: patterns.confidence_boost
      }
    });

  } catch (error) {
    console.error('❌ Error fetching persona patterns:', error);
    res.status(500).json({
      error: 'Failed to fetch persona patterns',
      details: error.message
    });
  }
});

// POST /api/persona-detection/bulk-test - Run multiple test cases
router.post('/bulk-test', async (req, res) => {
  try {
    const { testCases = [] } = req.body;
    
    if (!Array.isArray(testCases) || testCases.length === 0) {
      return res.status(400).json({
        error: 'testCases array is required and must not be empty'
      });
    }

    console.log(`🧪 Running bulk persona detection test with ${testCases.length} cases`);

    const results = [];
    let totalAccuracy = 0;
    let correctCount = 0;

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      const { text, voiceTranscript, expectedPersona, name = `Test ${i + 1}` } = testCase;

      try {
        // Perform detection
        const detectionResult = await personaDetectionService.detectPersona({
          text,
          voiceTranscript,
          additionalContext: testCase.additionalContext || {}
        });

        // Calculate accuracy
        const isCorrect = expectedPersona ? detectionResult.persona === expectedPersona : null;
        const accuracy = isCorrect !== null ? (isCorrect ? 1.0 : 0.0) : null;

        if (accuracy !== null) {
          totalAccuracy += accuracy;
          if (isCorrect) correctCount++;
        }

        results.push({
          testNumber: i + 1,
          name,
          expected: expectedPersona,
          detected: detectionResult.persona,
          confidence: detectionResult.confidence,
          method: detectionResult.method,
          accuracy,
          isCorrect,
          projectType: detectionResult.projectType
        });

        // Track performance
        if (expectedPersona) {
          await personaDetectionService.trackDetectionPerformance(detectionResult, expectedPersona);
        }

      } catch (error) {
        results.push({
          testNumber: i + 1,
          name,
          error: error.message,
          success: false
        });
      }
    }

    const totalTestsWithExpected = results.filter(r => r.expected).length;
    const overallAccuracy = totalTestsWithExpected > 0 ? correctCount / totalTestsWithExpected : null;

    res.json({
      success: true,
      summary: {
        totalTests: testCases.length,
        successfulTests: results.filter(r => !r.error).length,
        failedTests: results.filter(r => r.error).length,
        testsWithExpected: totalTestsWithExpected,
        correctPredictions: correctCount,
        overallAccuracy: overallAccuracy ? Math.round(overallAccuracy * 10000) / 100 : null // Percentage with 2 decimals
      },
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Bulk persona detection test error:', error);
    res.status(500).json({
      error: 'Failed to run bulk persona detection test',
      details: error.message
    });
  }
});

// GET /api/persona-detection/health - Service health check
router.get('/health', async (req, res) => {
  try {
    const service = personaDetectionService;
    
    res.json({
      success: true,
      service: 'PersonaDetectionService',
      status: 'healthy',
      features: {
        openaiConfigured: service.isConfigured,
        ruleBasedFallback: true,
        availablePersonas: require('../services/persona-detection-service').PersonaDetectionService.getAvailablePersonas().length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Persona detection health check error:', error);
    res.status(500).json({
      error: 'Service health check failed',
      details: error.message
    });
  }
});

module.exports = router; 