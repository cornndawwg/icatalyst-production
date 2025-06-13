/**
 * AI-Enhanced Persona Detection Service
 * 
 * Analyzes voice transcripts and text input to automatically detect customer persona
 * with confidence scoring for optimal targeting and proposal customization.
 */

// Dynamic import for OpenAI to handle graceful fallback
let OpenAI = null;
try {
  if (typeof window === 'undefined') {
    OpenAI = require('openai').OpenAI;
  }
} catch (error) {
  console.warn('OpenAI package not available. Persona detection will use advanced rule-based analysis.');
}

const prisma = require('../utils/prisma');

// Import analytics service for KPI tracking
let analyticsService = null;
try {
  analyticsService = require('./analytics-service');
} catch (error) {
  console.warn('Analytics service not available for persona detection tracking.');
}

/**
 * Persona Detection Keywords & Patterns
 */
const PERSONA_DETECTION_PATTERNS = {
  // Residential Personas
  'homeowner': {
    keywords: [
      'home', 'house', 'family', 'kids', 'children', 'spouse', 'wife', 'husband',
      'security', 'safety', 'energy', 'bills', 'save money', 'convenience',
      'living room', 'bedroom', 'kitchen', 'garage', 'yard', 'neighborhood',
      'comfort', 'lifestyle', 'peace of mind', 'property value'
    ],
    phrases: [
      'my home', 'our house', 'my family', 'my kids', 'energy savings',
      'home security', 'peace of mind', 'make life easier', 'home value',
      'monthly bills', 'utility costs', 'family safety'
    ],
    context_clues: [
      'residential', 'single family', 'personal use', 'family living',
      'homeowner', 'mortgage', 'property tax'
    ],
    tier_preference: 'better',
    confidence_boost: 0.2
  },

  'interior-designer': {
    keywords: [
      'design', 'aesthetic', 'beautiful', 'elegant', 'sophisticated', 'modern',
      'contemporary', 'luxury', 'high-end', 'premium', 'visual', 'appearance',
      'style', 'decor', 'ambiance', 'lighting scenes', 'mood', 'atmosphere',
      'client', 'portfolio', 'project', 'showcase'
    ],
    phrases: [
      'design aesthetic', 'visual appeal', 'seamless integration', 'hidden technology',
      'architectural elements', 'lighting design', 'interior design', 'design vision',
      'client presentation', 'design portfolio', 'sophisticated look'
    ],
    context_clues: [
      'designer', 'architect', 'creative professional', 'design firm',
      'client projects', 'aesthetic requirements', 'visual integration'
    ],
    tier_preference: 'best',
    confidence_boost: 0.3
  },

  'builder': {
    keywords: [
      'development', 'construction', 'build', 'spec', 'multiple', 'units',
      'cost-effective', 'budget', 'efficient', 'standard', 'bulk', 'volume',
      'installation', 'schedule', 'timeline', 'contractor', 'subcontractor',
      'market', 'buyers', 'sales', 'competitive', 'differentiation'
    ],
    phrases: [
      'spec homes', 'development project', 'multiple units', 'bulk pricing',
      'installation efficiency', 'market differentiation', 'buyer appeal',
      'construction schedule', 'cost per unit', 'standardized systems'
    ],
    context_clues: [
      'builder', 'developer', 'construction company', 'spec building',
      'residential development', 'new construction', 'volume pricing'
    ],
    tier_preference: 'good',
    confidence_boost: 0.25
  },

  'architect': {
    keywords: [
      'architecture', 'design', 'technical', 'specifications', 'integration',
      'building systems', 'infrastructure', 'sustainable', 'innovative',
      'future-proof', 'scalable', 'standards', 'codes', 'engineering',
      'BIM', 'CAD', 'documentation', 'performance', 'efficiency'
    ],
    phrases: [
      'building design', 'system integration', 'technical specifications',
      'architectural vision', 'building performance', 'sustainable design',
      'innovative technology', 'future-proofing', 'building codes',
      'system compatibility', 'architectural elements'
    ],
    context_clues: [
      'architect', 'architectural firm', 'building design', 'system integration',
      'technical requirements', 'building performance', 'design professional'
    ],
    tier_preference: 'best',
    confidence_boost: 0.3
  },

  // Commercial Personas
  'cto-cio': {
    keywords: [
      'IT', 'technology', 'infrastructure', 'network', 'security', 'cybersecurity',
      'scalability', 'integration', 'enterprise', 'data', 'analytics',
      'compliance', 'protocols', 'architecture', 'systems', 'platform',
      'cloud', 'server', 'database', 'API', 'technical', 'strategic'
    ],
    phrases: [
      'IT infrastructure', 'network security', 'system integration',
      'enterprise architecture', 'cybersecurity protocols', 'data analytics',
      'technical requirements', 'scalable systems', 'platform integration',
      'security compliance', 'technology strategy'
    ],
    context_clues: [
      'CTO', 'CIO', 'IT director', 'technology officer', 'chief information',
      'technical leadership', 'enterprise technology', 'IT department'
    ],
    tier_preference: 'best',
    confidence_boost: 0.4
  },

  'business-owner': {
    keywords: [
      'business', 'ROI', 'investment', 'profit', 'revenue', 'costs', 'savings',
      'efficiency', 'productivity', 'operations', 'competitive', 'advantage',
      'customers', 'growth', 'expansion', 'market', 'success', 'bottom line',
      'company', 'organization', 'team', 'employees', 'performance'
    ],
    phrases: [
      'return on investment', 'business growth', 'operational efficiency',
      'competitive advantage', 'cost savings', 'revenue increase',
      'business operations', 'customer experience', 'market position',
      'business success', 'company performance'
    ],
    context_clues: [
      'business owner', 'entrepreneur', 'company founder', 'CEO',
      'small business', 'medium business', 'business operations'
    ],
    tier_preference: 'better',
    confidence_boost: 0.3
  },

  'c-suite': {
    keywords: [
      'strategic', 'executive', 'leadership', 'vision', 'corporate', 'enterprise',
      'stakeholders', 'shareholders', 'board', 'strategic', 'long-term',
      'market', 'positioning', 'competitive', 'industry', 'innovation',
      'transformation', 'digital', 'modernization', 'investment', 'capital'
    ],
    phrases: [
      'strategic initiative', 'executive decision', 'corporate strategy',
      'market positioning', 'competitive positioning', 'strategic advantage',
      'long-term vision', 'stakeholder value', 'corporate transformation',
      'strategic investment', 'executive leadership'
    ],
    context_clues: [
      'CEO', 'CFO', 'COO', 'executive', 'c-level', 'senior leadership',
      'corporate executive', 'strategic decision maker'
    ],
    tier_preference: 'best',
    confidence_boost: 0.4
  },

  'office-manager': {
    keywords: [
      'office', 'workplace', 'employees', 'staff', 'team', 'productivity',
      'efficiency', 'comfort', 'environment', 'management', 'operations',
      'daily', 'routine', 'administration', 'facilities', 'maintenance',
      'costs', 'budget', 'simple', 'easy', 'user-friendly'
    ],
    phrases: [
      'office operations', 'employee productivity', 'workplace efficiency',
      'staff comfort', 'office environment', 'daily operations',
      'administrative tasks', 'office management', 'cost control',
      'easy to use', 'simple operation'
    ],
    context_clues: [
      'office manager', 'administrative manager', 'operations manager',
      'office administration', 'workplace management'
    ],
    tier_preference: 'better',
    confidence_boost: 0.25
  },

  'facilities-manager': {
    keywords: [
      'facilities', 'building', 'maintenance', 'systems', 'HVAC', 'lighting',
      'energy', 'monitoring', 'control', 'operations', 'efficiency',
      'reliability', 'performance', 'technical', 'mechanical', 'electrical',
      'preventive', 'scheduling', 'compliance', 'safety', 'management'
    ],
    phrases: [
      'building management', 'facility operations', 'maintenance efficiency',
      'energy management', 'system monitoring', 'building systems',
      'preventive maintenance', 'facility management', 'operational control',
      'building performance', 'system reliability'
    ],
    context_clues: [
      'facilities manager', 'building manager', 'facility operations',
      'building maintenance', 'facility management', 'property management'
    ],
    tier_preference: 'better',
    confidence_boost: 0.3
  }
};

/**
 * Commercial vs Residential Detection Patterns
 */
const PROJECT_TYPE_PATTERNS = {
  residential: [
    'home', 'house', 'family', 'personal', 'residential', 'homeowner',
    'living room', 'bedroom', 'kitchen', 'garage', 'basement', 'attic',
    'backyard', 'front yard', 'neighborhood', 'community'
  ],
  commercial: [
    'office', 'business', 'commercial', 'corporate', 'enterprise', 'company',
    'organization', 'workplace', 'facility', 'building', 'headquarters',
    'campus', 'warehouse', 'retail', 'restaurant', 'hotel'
  ]
};

/**
 * Main Persona Detection Service Class
 */
class PersonaDetectionService {
  constructor() {
    this.openai = null;
    this.isConfigured = false;
    this.initializeOpenAI();
  }

  /**
   * Initialize OpenAI client if available
   */
  initializeOpenAI() {
    try {
      if (OpenAI && process.env.OPENAI_API_KEY) {
        this.openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY
        });
        this.isConfigured = true;
        console.log('✅ PersonaDetectionService: OpenAI initialized successfully');
      } else {
        console.log('⚠️ PersonaDetectionService: Using advanced rule-based detection (OpenAI not available)');
      }
    } catch (error) {
      console.error('❌ PersonaDetectionService initialization error:', error.message);
    }
  }

  /**
   * Main persona detection method
   */
  async detectPersona(input) {
    const { text, voiceTranscript, additionalContext = {} } = input;
    const startTime = Date.now(); // Track processing time for analytics
    
    console.log('🎯 Starting persona detection analysis...');
    
    try {
      // Combine all text sources
      const combinedText = [text, voiceTranscript].filter(Boolean).join(' ').toLowerCase();
      
      if (!combinedText.trim()) {
        throw new Error('No text input provided for persona detection');
      }

      // Determine project type first
      const projectType = this.detectProjectType(combinedText);
      console.log(`📋 Detected project type: ${projectType}`);

      // Get persona detection results
      let aiResult = null;
      if (this.isConfigured) {
        aiResult = await this.detectPersonaWithAI(combinedText, projectType, additionalContext);
      }
      
      // Always run rule-based detection for comparison/fallback
      const ruleBasedResult = this.detectPersonaWithRules(combinedText, projectType, additionalContext);
      
      // Combine results intelligently
      const finalResult = this.combineDetectionResults(aiResult, ruleBasedResult, projectType);
      
      // Track analytics event for KPI monitoring
      if (analyticsService) {
        try {
          await analyticsService.trackEvent({
            eventType: 'persona_detection',
            eventCategory: 'ai_performance',
            data: {
              detectedPersona: finalResult.persona,
              projectType: projectType,
              method: finalResult.method,
              inputLength: combinedText.length,
              hasVoiceTranscript: !!voiceTranscript
            },
            accuracy: finalResult.confidence,
            confidence: finalResult.confidence,
            processingTime: Date.now() - startTime,
            success: finalResult.success !== false
          });
        } catch (analyticsError) {
          console.warn('Analytics tracking failed for persona detection:', analyticsError.message);
        }
      }
      
      console.log('🎯 Persona detection completed:', {
        detectedPersona: finalResult.persona,
        confidence: finalResult.confidence,
        method: finalResult.method
      });

      return finalResult;
      
    } catch (error) {
      console.error('❌ Persona detection error:', error);
      return {
        success: false,
        error: error.message,
        persona: 'homeowner', // Safe fallback
        confidence: 0.1,
        method: 'fallback'
      };
    }
  }

  /**
   * Detect project type (residential vs commercial)
   */
  detectProjectType(text) {
    const residentialScore = this.calculateKeywordScore(text, PROJECT_TYPE_PATTERNS.residential);
    const commercialScore = this.calculateKeywordScore(text, PROJECT_TYPE_PATTERNS.commercial);
    
    if (commercialScore > residentialScore) {
      return 'commercial';
    } else {
      return 'residential';
    }
  }

  /**
   * AI-powered persona detection using OpenAI
   */
  async detectPersonaWithAI(text, projectType, context) {
    if (!this.isConfigured) {
      return null;
    }

    try {
      console.log('🤖 Running AI persona detection...');
      
      const prompt = this.buildAIPersonaPrompt(text, projectType, context);
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an expert customer persona analyst for smart home technology. Analyze customer communication to identify their specific persona type with high accuracy.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 500
      });

      const aiResponse = response.choices[0]?.message?.content;
      const usage = response.usage;
      
      console.log(`🤖 AI analysis completed. Tokens used: ${usage?.total_tokens}`);
      
      return this.parseAIPersonaResponse(aiResponse, usage);
      
    } catch (error) {
      console.error('❌ AI persona detection failed:', error.message);
      return null;
    }
  }

  /**
   * Rule-based persona detection using keyword analysis
   */
  detectPersonaWithRules(text, projectType, context) {
    console.log('📊 Running rule-based persona detection...');
    
    const personaScores = {};
    const applicablePersonas = this.getApplicablePersonas(projectType);
    
    // Score each applicable persona
    for (const persona of applicablePersonas) {
      const patterns = PERSONA_DETECTION_PATTERNS[persona];
      if (!patterns) continue;
      
      let score = 0;
      
      // Keyword matching
      score += this.calculateKeywordScore(text, patterns.keywords) * 1.0;
      
      // Phrase matching (higher weight)
      score += this.calculatePhraseScore(text, patterns.phrases) * 2.0;
      
      // Context clues (highest weight)
      score += this.calculateKeywordScore(text, patterns.context_clues) * 3.0;
      
      // Apply confidence boost
      score *= (1 + patterns.confidence_boost);
      
      personaScores[persona] = score;
    }
    
    // Find best match
    const sortedPersonas = Object.entries(personaScores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3); // Top 3 matches
    
    const [topPersona, topScore] = sortedPersonas[0] || ['homeowner', 0];
    const confidence = Math.min(topScore / 10, 0.95); // Normalize confidence
    
    console.log('📊 Rule-based detection results:', {
      topPersona,
      confidence: Math.round(confidence * 100) / 100,
      allScores: personaScores
    });
    
    return {
      persona: topPersona,
      confidence,
      method: 'rule-based',
      alternativeOptions: sortedPersonas.slice(1, 3).map(([persona, score]) => ({
        persona,
        confidence: Math.min(score / 10, 0.95)
      })),
      detailedScores: personaScores
    };
  }

  /**
   * Get personas applicable to project type
   */
  getApplicablePersonas(projectType) {
    const residentialPersonas = ['homeowner', 'interior-designer', 'builder', 'architect'];
    const commercialPersonas = ['cto-cio', 'business-owner', 'c-suite', 'office-manager', 'facilities-manager'];
    
    if (projectType === 'commercial') {
      return commercialPersonas;
    } else {
      return residentialPersonas;
    }
  }

  /**
   * Calculate keyword score for text
   */
  calculateKeywordScore(text, keywords) {
    if (!keywords || !Array.isArray(keywords)) return 0;
    
    let score = 0;
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'gi');
      const matches = text.match(regex);
      if (matches) {
        score += matches.length;
      }
    }
    return score;
  }

  /**
   * Calculate phrase score for text
   */
  calculatePhraseScore(text, phrases) {
    if (!phrases || !Array.isArray(phrases)) return 0;
    
    let score = 0;
    for (const phrase of phrases) {
      if (text.includes(phrase.toLowerCase())) {
        score += 2; // Phrases get higher weight
      }
    }
    return score;
  }

  /**
   * Combine AI and rule-based results
   */
  combineDetectionResults(aiResult, ruleBasedResult, projectType) {
    // If AI is not available, use rule-based
    if (!aiResult) {
      return {
        success: true,
        ...ruleBasedResult,
        projectType,
        combinedMethod: 'rule-based-only'
      };
    }

    // If AI confidence is high, prefer AI
    if (aiResult.confidence > 0.8) {
      return {
        success: true,
        ...aiResult,
        projectType,
        ruleBasedBackup: ruleBasedResult,
        combinedMethod: 'ai-primary'
      };
    }

    // If rule-based confidence is significantly higher, prefer it
    if (ruleBasedResult.confidence > aiResult.confidence + 0.2) {
      return {
        success: true,
        ...ruleBasedResult,
        projectType,
        aiBackup: aiResult,
        combinedMethod: 'rule-based-primary'
      };
    }

    // Use weighted average of both methods
    const combinedConfidence = (aiResult.confidence * 0.6) + (ruleBasedResult.confidence * 0.4);
    const finalPersona = aiResult.confidence > ruleBasedResult.confidence ? aiResult.persona : ruleBasedResult.persona;

    return {
      success: true,
      persona: finalPersona,
      confidence: combinedConfidence,
      method: 'combined',
      projectType,
      aiResult,
      ruleBasedResult,
      combinedMethod: 'weighted-average'
    };
  }

  /**
   * Build AI prompt for persona detection
   */
  buildAIPersonaPrompt(text, projectType, context) {
    const applicablePersonas = this.getApplicablePersonas(projectType);
    
    return `
Analyze the following customer communication and identify the most appropriate persona:

CUSTOMER INPUT:
"${text}"

PROJECT TYPE: ${projectType}

AVAILABLE PERSONAS:
${applicablePersonas.map(persona => {
  const config = PERSONA_DETECTION_PATTERNS[persona];
  return `- ${persona}: ${config ? 'Focus areas: ' + config.keywords.slice(0, 5).join(', ') : 'Standard persona'}`;
}).join('\n')}

ADDITIONAL CONTEXT:
${Object.entries(context).map(([key, value]) => `${key}: ${value}`).join('\n')}

Please respond in this exact JSON format:
{
  "persona": "detected_persona_name",
  "confidence": 0.85,
  "reasoning": "Brief explanation of why this persona was selected",
  "keyIndicators": ["indicator1", "indicator2", "indicator3"]
}

Focus on identifying specific language patterns, professional terminology, and context clues that indicate the customer's role and priorities.
`;
  }

  /**
   * Parse AI response for persona detection
   */
  parseAIPersonaResponse(content, usage) {
    try {
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        persona: parsed.persona,
        confidence: Math.min(Math.max(parsed.confidence, 0), 1), // Clamp 0-1
        method: 'ai',
        reasoning: parsed.reasoning,
        keyIndicators: parsed.keyIndicators || [],
        tokensUsed: usage?.total_tokens || 0,
        cost: this.calculateCost(usage?.total_tokens || 0)
      };
    } catch (error) {
      console.error('❌ Failed to parse AI response:', error.message);
      return {
        persona: 'homeowner',
        confidence: 0.1,
        method: 'ai-parse-error',
        error: error.message
      };
    }
  }

  /**
   * Calculate OpenAI API cost
   */
  calculateCost(tokens) {
    // GPT-4 pricing: $0.03 per 1K input tokens, $0.06 per 1K output tokens
    // Simplified calculation assuming 50/50 split
    return ((tokens / 1000) * 0.045).toFixed(4);
  }

  /**
   * Get persona configuration and recommended tier
   */
  async getPersonaConfig(personaName) {
    try {
      const persona = await prisma.proposalPersona.findUnique({
        where: { name: personaName }
      });

      if (!persona) {
        console.warn(`⚠️ Persona not found in database: ${personaName}`);
        return null;
      }

      return {
        ...persona,
        keyFeatures: persona.keyFeatures ? JSON.parse(persona.keyFeatures) : [],
        detectionPatterns: PERSONA_DETECTION_PATTERNS[personaName] || null
      };
    } catch (error) {
      console.error('❌ Error fetching persona config:', error);
      return null;
    }
  }

  /**
   * Track persona detection performance
   */
  async trackDetectionPerformance(detectionResult, actualPersona = null) {
    try {
      // This would be expanded to track accuracy metrics
      console.log('📊 Tracking persona detection performance:', {
        detected: detectionResult.persona,
        confidence: detectionResult.confidence,
        method: detectionResult.method,
        actual: actualPersona,
        accuracy: actualPersona ? (detectionResult.persona === actualPersona ? 1 : 0) : null
      });
      
      // Future: Store in analytics table for performance tracking
      
    } catch (error) {
      console.error('❌ Error tracking detection performance:', error);
    }
  }

  /**
   * Get available personas for detection
   */
  static getAvailablePersonas() {
    return Object.keys(PERSONA_DETECTION_PATTERNS);
  }

  /**
   * Validate persona name
   */
  static isValidPersona(personaName) {
    return PERSONA_DETECTION_PATTERNS.hasOwnProperty(personaName);
  }
}

// Export singleton instance
const personaDetectionService = new PersonaDetectionService();

module.exports = {
  PersonaDetectionService,
  personaDetectionService,
  PERSONA_DETECTION_PATTERNS,
  PROJECT_TYPE_PATTERNS
};