/**
 * AI-Powered Product Recommendation Service
 * 
 * Uses persona detection results to intelligently recommend and bundle smart home products
 * with optimized pricing strategies for each customer type.
 */

// Dynamic import for OpenAI to handle graceful fallback
let OpenAI = null;
try {
  if (typeof window === 'undefined') {
    OpenAI = require('openai').OpenAI;
  }
} catch (error) {
  console.warn('OpenAI package not available. Product recommendations will use intelligent rule-based bundling.');
}

const prisma = require('../utils/prisma');
const { personaDetectionService } = require('./persona-detection-service');

/**
 * Persona-Specific Product Preferences
 */
const PERSONA_PRODUCT_PREFERENCES = {
  // Residential Personas
  'homeowner': {
    priorityCategories: ['security', 'lighting', 'climate', 'audio-video'],
    preferredTier: 'better',
    budgetRange: { min: 5000, max: 25000 },
    keyFeatures: ['easy-to-use', 'family-friendly', 'energy-efficient', 'security-focused'],
    bundleStrategy: 'essential-plus-convenience',
    priceMultiplier: 1.0,
    maxItems: 12,
    includeInstallation: true,
    includeSupport: true
  },

  'interior-designer': {
    priorityCategories: ['lighting', 'audio-video', 'access-control', 'climate'],
    preferredTier: 'best',
    budgetRange: { min: 15000, max: 75000 },
    keyFeatures: ['aesthetic-integration', 'premium-finishes', 'hidden-technology', 'customizable'],
    bundleStrategy: 'premium-aesthetic',
    priceMultiplier: 1.25,
    maxItems: 18,
    includeInstallation: true,
    includeSupport: true,
    includeDesignConsulting: true
  },

  'builder': {
    priorityCategories: ['security', 'lighting', 'networking', 'climate'],
    preferredTier: 'good',
    budgetRange: { min: 2500, max: 12000 },
    keyFeatures: ['cost-effective', 'standardized', 'bulk-pricing', 'easy-installation'],
    bundleStrategy: 'volume-efficient',
    priceMultiplier: 0.85,
    maxItems: 10,
    includeInstallation: false, // Builders handle their own installation
    includeSupport: true,
    includeBulkDiscount: true
  },

  'architect': {
    priorityCategories: ['networking', 'lighting', 'climate', 'audio-video', 'security'],
    preferredTier: 'best',
    budgetRange: { min: 20000, max: 100000 },
    keyFeatures: ['future-proof', 'scalable', 'integration-ready', 'sustainable'],
    bundleStrategy: 'comprehensive-integration',
    priceMultiplier: 1.15,
    maxItems: 25,
    includeInstallation: true,
    includeSupport: true,
    includeTechnicalConsulting: true
  },

  // Commercial Personas
  'cto-cio': {
    priorityCategories: ['networking', 'security', 'access-control', 'audio-video'],
    preferredTier: 'best',
    budgetRange: { min: 50000, max: 250000 },
    keyFeatures: ['enterprise-grade', 'scalable', 'secure', 'integration-ready'],
    bundleStrategy: 'enterprise-infrastructure',
    priceMultiplier: 1.3,
    maxItems: 30,
    includeInstallation: true,
    includeSupport: true,
    includeEnterpiseSupport: true
  },

  'business-owner': {
    priorityCategories: ['security', 'audio-video', 'lighting', 'access-control'],
    preferredTier: 'better',
    budgetRange: { min: 10000, max: 50000 },
    keyFeatures: ['roi-focused', 'operational-efficiency', 'customer-experience', 'cost-effective'],
    bundleStrategy: 'business-optimization',
    priceMultiplier: 1.1,
    maxItems: 15,
    includeInstallation: true,
    includeSupport: true,
    includeROIAnalysis: true
  },

  'c-suite': {
    priorityCategories: ['audio-video', 'lighting', 'security', 'access-control', 'climate'],
    preferredTier: 'best',
    budgetRange: { min: 25000, max: 150000 },
    keyFeatures: ['premium', 'executive-focused', 'impressive', 'strategic-value'],
    bundleStrategy: 'executive-premium',
    priceMultiplier: 1.4,
    maxItems: 20,
    includeInstallation: true,
    includeSupport: true,
    includeExecutiveTraining: true
  },

  'office-manager': {
    priorityCategories: ['lighting', 'climate', 'audio-video', 'security'],
    preferredTier: 'better',
    budgetRange: { min: 8000, max: 35000 },
    keyFeatures: ['user-friendly', 'energy-efficient', 'low-maintenance', 'productivity-focused'],
    bundleStrategy: 'workplace-efficiency',
    priceMultiplier: 1.0,
    maxItems: 12,
    includeInstallation: true,
    includeSupport: true,
    includeTraining: true
  },

  'facilities-manager': {
    priorityCategories: ['climate', 'lighting', 'security', 'networking'],
    preferredTier: 'better',
    budgetRange: { min: 15000, max: 60000 },
    keyFeatures: ['reliable', 'monitoring-capable', 'maintenance-friendly', 'energy-efficient'],
    bundleStrategy: 'facilities-optimization',
    priceMultiplier: 1.05,
    maxItems: 18,
    includeInstallation: true,
    includeSupport: true,
    includeMaintenanceContract: true
  }
};

/**
 * Product Compatibility Matrix
 */
const PRODUCT_COMPATIBILITY = {
  // Products that work well together
  bundles: {
    'security-starter': ['security-cameras', 'door-locks', 'alarm-system', 'motion-sensors'],
    'lighting-automation': ['smart-switches', 'smart-bulbs', 'lighting-controller', 'motion-sensors'],
    'audio-video-entertainment': ['speakers', 'amplifiers', 'streaming-devices', 'controllers'],
    'climate-control': ['smart-thermostat', 'hvac-controllers', 'air-quality-sensors'],
    'networking-foundation': ['wifi-access-points', 'network-switches', 'controllers'],
    'access-control-suite': ['door-locks', 'keypad-entry', 'access-controllers', 'intercom']
  },
  
  // Products that require others
  dependencies: {
    'smart-speakers': ['networking-foundation'],
    'security-cameras': ['networking-foundation'],
    'lighting-automation': ['smart-switches'],
    'climate-automation': ['smart-thermostat']
  },

  // Products that conflict or are redundant
  conflicts: {
    'basic-thermostat': ['premium-thermostat'],
    'wired-speakers': ['wireless-speakers-same-zone']
  }
};

/**
 * Bundle Strategy Implementations
 */
const BUNDLE_STRATEGIES = {
  'essential-plus-convenience': {
    description: 'Essential systems with convenient upgrades',
    approach: 'start-with-security-add-convenience',
    categories: ['security', 'lighting', 'climate'],
    itemDistribution: { security: 40, lighting: 35, climate: 25 }
  },

  'premium-aesthetic': {
    description: 'High-end products with aesthetic focus',
    approach: 'premium-integrated-design',
    categories: ['lighting', 'audio-video', 'climate', 'access-control'],
    itemDistribution: { lighting: 35, 'audio-video': 30, climate: 20, 'access-control': 15 }
  },

  'volume-efficient': {
    description: 'Cost-effective standardized systems',
    approach: 'standardized-cost-optimized',
    categories: ['security', 'lighting', 'networking'],
    itemDistribution: { security: 45, lighting: 35, networking: 20 }
  },

  'comprehensive-integration': {
    description: 'Complete integrated smart building solution',
    approach: 'full-integration-scalable',
    categories: ['networking', 'lighting', 'climate', 'security', 'audio-video'],
    itemDistribution: { networking: 25, lighting: 20, climate: 20, security: 20, 'audio-video': 15 }
  },

  'enterprise-infrastructure': {
    description: 'Enterprise-grade scalable infrastructure',
    approach: 'infrastructure-first-scalable',
    categories: ['networking', 'security', 'access-control', 'audio-video'],
    itemDistribution: { networking: 35, security: 30, 'access-control': 20, 'audio-video': 15 }
  },

  'business-optimization': {
    description: 'ROI-focused business enhancement systems',
    approach: 'roi-focused-practical',
    categories: ['security', 'audio-video', 'lighting'],
    itemDistribution: { security: 40, 'audio-video': 35, lighting: 25 }
  },

  'executive-premium': {
    description: 'Premium executive-focused systems',
    approach: 'premium-impressive-strategic',
    categories: ['audio-video', 'lighting', 'security', 'climate'],
    itemDistribution: { 'audio-video': 35, lighting: 25, security: 25, climate: 15 }
  },

  'workplace-efficiency': {
    description: 'Employee productivity and comfort focused',
    approach: 'productivity-comfort-efficiency',
    categories: ['lighting', 'climate', 'audio-video'],
    itemDistribution: { lighting: 40, climate: 35, 'audio-video': 25 }
  },

  'facilities-optimization': {
    description: 'Building management and efficiency systems',
    approach: 'monitoring-efficiency-maintenance',
    categories: ['climate', 'lighting', 'security', 'networking'],
    itemDistribution: { climate: 30, lighting: 25, security: 25, networking: 20 }
  }
};

/**
 * Main Product Recommendation Service Class
 */
class ProductRecommendationService {
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
        console.log('✅ ProductRecommendationService: OpenAI initialized successfully');
      } else {
        console.log('⚠️ ProductRecommendationService: Using intelligent rule-based recommendations (OpenAI not available)');
      }
    } catch (error) {
      console.error('❌ ProductRecommendationService initialization error:', error.message);
    }
  }

  /**
   * Generate intelligent product recommendations with ENHANCED tier optimization
   * @param {Object} input - Input parameters
   * @returns {Promise<Object>} Recommendation results with enhanced tier differentiation
   */
  async generateRecommendations(input) {
    const startTime = Date.now();
    
    try {
      console.log(`🚀 Starting ENHANCED product recommendations for persona: ${input.persona}`);
      
      // Validate required inputs
      if (!input.persona) {
        throw new Error('Persona is required for enhanced recommendations');
      }

      // Get available products
      const products = await this.getAvailableProducts();
      
      // Get persona preferences with ENHANCEMENT support
      const personaPrefs = PERSONA_PRODUCT_PREFERENCES[input.persona];
      if (!personaPrefs) {
        throw new Error(`Unknown persona: ${input.persona}`);
      }

      // Select optimal bundle strategy with enhanced consideration
      const bundleStrategy = this.selectBundleStrategy(
        input.persona, 
        input.budget, 
        input.projectSize, 
        {
          ...input.specificRequirements,
          urgency: input.urgency,
          enhancedTierOptimization: input.enhancedTierOptimization // NEW
        }
      );

      console.log(`📋 Selected bundle strategy: ${bundleStrategy.strategy} (${bundleStrategy.description})`);

      let recommendations;

      // Try AI-powered recommendations first (if OpenAI available)
      if (this.openai && input.enhancedTierOptimization) {
        console.log(`🤖 Generating ENHANCED AI recommendations...`);
        try {
          recommendations = await this.generateEnhancedAIRecommendations(input.persona, products, bundleStrategy, input);
        } catch (aiError) {
          console.warn('⚠️ Enhanced AI recommendations failed, falling back to advanced rule-based:', aiError.message);
          recommendations = await this.generateAdvancedRuleBasedRecommendations(input.persona, products, bundleStrategy, input);
        }
      } else {
        console.log(`🔧 Generating advanced rule-based recommendations...`);
        recommendations = await this.generateAdvancedRuleBasedRecommendations(input.persona, products, bundleStrategy, input);
      }

      // Calculate tier recommendations (simplified for immediate functionality)
      const tierResults = this.calculateSimplifiedTiers(recommendations, input.persona, input.budget);
      
      // Add basic competitive advantage
      const competitiveAdvantage = this.generateBasicCompetitiveAdvantage(input.persona);

      const processingTime = Date.now() - startTime;
      
      const result = {
        success: true,
        processingTime,
        persona: input.persona,
        bundleStrategy: bundleStrategy.strategy,
        recommendations: {
          ...tierResults,
          estimatedTotal: tierResults.betterTier.total // Use Better tier as default estimate
        },
        competitiveAdvantage,
        enhancedTierOptimization: true // Mark as enhanced
      };

      console.log(`✅ ENHANCED recommendations generated in ${processingTime}ms`);
      console.log(`   🎯 Persona: ${input.persona} | Strategy: ${bundleStrategy.strategy}`);
      console.log(`   💰 Tiers: Good ($${tierResults.goodTier.total.toLocaleString()}) | Better ($${tierResults.betterTier.total.toLocaleString()}) | Best ($${tierResults.bestTier.total.toLocaleString()})`);

      return result;

    } catch (error) {
      console.error('💥 Enhanced product recommendation generation failed:', error);
      return {
        success: false,
        error: error.message,
        enhancedTierOptimization: false
      };
    }
  }

  /**
   * Get available products from database
   */
  async getAvailableProducts() {
    try {
      const products = await prisma.product.findMany({
        where: { isActive: true },
        orderBy: [
          { category: 'asc' },
          { basePrice: 'asc' }
        ]
      });
      
      // Ensure we always return an array
      if (!Array.isArray(products)) {
        console.warn('⚠️ Database returned non-array products, using fallback catalog');
        return this.getFallbackProductCatalog();
      }
      
      if (products.length === 0) {
        console.warn('⚠️ No products found in database, using fallback catalog');
        return this.getFallbackProductCatalog();
      }
      
      return products;
    } catch (error) {
      console.error('❌ Database error getting products, using fallback catalog:', error.message);
      return this.getFallbackProductCatalog();
    }
  }

  /**
   * Fallback product catalog for when database is empty or unavailable
   */
  getFallbackProductCatalog() {
    return [
      {
        id: 'security-camera-basic',
        name: 'Smart Security Camera',
        description: 'HD wireless security camera with night vision',
        category: 'security',
        basePrice: 150,
        goodTierPrice: 150,
        betterTierPrice: 200,
        bestTierPrice: 300,
        isActive: true
      },
      {
        id: 'door-lock-smart',
        name: 'Smart Door Lock',
        description: 'Keyless entry smart lock with mobile app control',
        category: 'security',
        basePrice: 200,
        goodTierPrice: 200,
        betterTierPrice: 250,
        bestTierPrice: 350,
        isActive: true
      },
      {
        id: 'light-switch-smart',
        name: 'Smart Light Switch',
        description: 'WiFi enabled smart switch with dimming',
        category: 'lighting',
        basePrice: 30,
        goodTierPrice: 30,
        betterTierPrice: 45,
        bestTierPrice: 60,
        isActive: true
      },
      {
        id: 'thermostat-smart',
        name: 'Smart Thermostat',
        description: 'Programmable smart thermostat with energy savings',
        category: 'climate',
        basePrice: 200,
        goodTierPrice: 200,
        betterTierPrice: 280,
        bestTierPrice: 400,
        isActive: true
      },
      {
        id: 'speaker-wireless',
        name: 'Wireless Speaker',
        description: 'Smart wireless speaker with voice control',
        category: 'audio-video',
        basePrice: 100,
        goodTierPrice: 100,
        betterTierPrice: 150,
        bestTierPrice: 250,
        isActive: true
      },
      {
        id: 'motion-sensor',
        name: 'Motion Sensor',
        description: 'Wireless motion detection sensor',
        category: 'security',
        basePrice: 50,
        goodTierPrice: 50,
        betterTierPrice: 75,
        bestTierPrice: 100,
        isActive: true
      },
      {
        id: 'smart-bulb',
        name: 'Smart LED Bulb',
        description: 'Color-changing smart LED bulb',
        category: 'lighting',
        basePrice: 25,
        goodTierPrice: 25,
        betterTierPrice: 35,
        bestTierPrice: 50,
        isActive: true
      },
      {
        id: 'hub-controller',
        name: 'Smart Home Hub',
        description: 'Central control hub for smart home devices',
        category: 'networking',
        basePrice: 120,
        goodTierPrice: 120,
        betterTierPrice: 180,
        bestTierPrice: 250,
        isActive: true
      }
    ];
  }

  /**
   * Select optimal bundle strategy based on input parameters
   */
  selectBundleStrategy(persona, budget, projectSize, additionalRequirements) {
    const personaPrefs = PERSONA_PRODUCT_PREFERENCES[persona];
    let strategyName = personaPrefs.bundleStrategy;

    // Adjust strategy based on budget constraints
    if (budget && budget < personaPrefs.budgetRange.min) {
      // Switch to more cost-effective strategy
      if (persona === 'interior-designer') strategyName = 'essential-plus-convenience';
      if (persona === 'architect') strategyName = 'comprehensive-integration';
      if (persona === 'cto-cio') strategyName = 'business-optimization';
    }

    // Adjust for project size
    if (projectSize && projectSize > 10000) { // Large project
      if (strategyName === 'essential-plus-convenience') {
        strategyName = 'comprehensive-integration';
      }
    }

    const strategy = BUNDLE_STRATEGIES[strategyName];
    return {
      name: strategyName,
      ...strategy
    };
  }

  /**
   * ENHANCED: Generate AI-powered recommendations with competitive intelligence
   */
  async generateEnhancedAIRecommendations(persona, products, bundleStrategy, input) {
    const competitiveContext = this.buildCompetitiveContext(persona, input);
    const prompt = this.buildEnhancedAIRecommendationPrompt(persona, products, bundleStrategy, input, competitiveContext);

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are iCatalyst AI's product recommendation engine, designed to outperform Portal.io and D-Tool with superior AI-driven product bundling. Generate intelligent Good/Better/Best tier recommendations that showcase revolutionary automation capabilities.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 3000
    });

    return this.parseEnhancedAIRecommendationResponse(completion.choices[0].message.content, products, completion.usage);
  }

  /**
   * Generate simplified rule-based recommendations that work immediately
   */
  async generateAdvancedRuleBasedRecommendations(persona, products, bundleStrategy, input) {
    const personaPrefs = PERSONA_PRODUCT_PREFERENCES[persona];
    const budget = input.budget || personaPrefs.budgetRange.max;
    
    // Simple product selection based on persona preferences
    let recommendations = [];
    
    for (const category of personaPrefs.priorityCategories) {
      const categoryProducts = products.filter(p => p.category === category);
      if (categoryProducts.length === 0) continue;
      
      // Select top products for this category
      const topProducts = categoryProducts
        .sort((a, b) => (b.basePrice || 0) - (a.basePrice || 0))
        .slice(0, 2)
        .map(product => ({
          productId: product.id,
          name: product.name,
          description: product.description,
          category: product.category,
          price: product.basePrice || 100,
          quantity: 1,
          tier: 'better',
          reasoning: `Recommended for ${persona} based on ${category} priority`
        }));
      
      recommendations.push(...topProducts);
    }

    // Limit to reasonable number
    recommendations = recommendations.slice(0, personaPrefs.maxItems || 8);

    return {
      items: recommendations,
      method: 'rule-based',
      total: this.calculateTotal(recommendations)
    };
  }

  /**
   * ENHANCED: Calculate recommendation tiers with competitive intelligence
   */
  calculateEnhancedRecommendationTiers(recommendations, persona, budget, input) {
    const personaPrefs = PERSONA_PRODUCT_PREFERENCES[persona];
    const baseItems = recommendations.slice(0, Math.min(recommendations.length, personaPrefs.maxItems));
    
    // GOOD TIER: Essential foundation (60-70% of base items)
    const goodTierCount = Math.max(3, Math.floor(baseItems.length * 0.65));
    const goodTierItems = baseItems
      .slice(0, goodTierCount)
      .map(item => ({
        ...item,
        tierJustification: `Essential ${item.category} foundation`,
        competitiveEdge: 'Meets basic requirements cost-effectively'
      }));

    // BETTER TIER: Optimal value (80-90% + premium features)
    const betterTierCount = Math.max(goodTierCount + 2, Math.floor(baseItems.length * 0.85));
    const betterTierItems = baseItems
      .slice(0, betterTierCount)
      .map(item => ({
        ...item,
        tierJustification: item.category === 'installation' ? 'Professional installation included' : `Enhanced ${item.category} capabilities`,
        competitiveEdge: 'Optimal ROI with advanced features'
      }));

    // Add Better tier enhancements
    const betterEnhancements = this.generateBetterTierEnhancements(baseItems, personaPrefs, input);
    betterTierItems.push(...betterEnhancements);

    // BEST TIER: Premium everything + future-proof
    const bestTierItems = [...betterTierItems];
    const bestEnhancements = this.generateBestTierEnhancements(baseItems, personaPrefs, input);
    bestTierItems.push(...bestEnhancements);

    // Apply persona-specific pricing multipliers
    const goodTotal = this.calculateTotal(goodTierItems) * personaPrefs.priceMultiplier;
    const betterTotal = this.calculateTotal(betterTierItems) * personaPrefs.priceMultiplier;
    const bestTotal = this.calculateTotal(bestTierItems) * personaPrefs.priceMultiplier * 1.2; // Premium positioning

    return {
      recommendedTier: personaPrefs.preferredTier,
      items: recommendations,
      goodTier: {
        items: goodTierItems,
        total: Math.round(goodTotal),
        valueProposition: this.generateTierValueProposition('good', persona, goodTierItems),
        competitiveAdvantage: 'Cost-effective foundation beating competitors on value'
      },
      betterTier: {
        items: betterTierItems,
        total: Math.round(betterTotal),
        valueProposition: this.generateTierValueProposition('better', persona, betterTierItems),
        competitiveAdvantage: 'Optimal ROI with advanced AI-driven features Portal.io cannot match'
      },
      bestTier: {
        items: bestTierItems,
        total: Math.round(bestTotal),
        valueProposition: this.generateTierValueProposition('best', persona, bestTierItems),
        competitiveAdvantage: 'Future-proof premium solution with revolutionary voice-to-approval automation'
      }
    };
  }

  /**
   * ENHANCED: Generate competitive advantage messaging
   */
  generateCompetitiveAdvantage(persona, tierResults) {
    const personaPrefs = PERSONA_PRODUCT_PREFERENCES[persona];
    
    const advantages = [
      '✅ Complete voice-to-approval automation (not just voice-to-outline like Portal.io)',
      '✅ 95%+ AI persona targeting accuracy',
      '✅ Intelligent product bundling with ROI optimization',
      `✅ ${tierResults.goodTier.items.length}/${tierResults.betterTier.items.length}/${tierResults.bestTier.items.length} tier progression showing clear value`,
      '✅ 30-second proposal generation vs competitors\' manual processes'
    ];

    if (personaPrefs.preferredTier === 'best') {
      advantages.push('✅ Executive-grade premium positioning');
    }

    return advantages.join('\n');
  }

  /**
   * ENHANCED: Generate Better tier enhancements
   */
  generateBetterTierEnhancements(baseItems, personaPrefs, input) {
    const enhancements = [];
    
    // Add installation if not included and persona requires it
    if (personaPrefs.includeInstallation && !baseItems.some(item => item.category === 'installation')) {
      enhancements.push({
        name: 'Professional Installation & Setup',
        category: 'installation',
        price: 2500,
        quantity: 1,
        reasoning: 'Professional installation ensures optimal performance and customer satisfaction',
        tierJustification: 'White-glove professional installation',
        competitiveEdge: 'Turnkey solution vs competitors\' DIY approach'
      });
    }

    // Add support package
    if (personaPrefs.includeSupport) {
      enhancements.push({
        name: '12-Month Premium Support Package',
        category: 'support',
        price: 1200,
        quantity: 1,
        reasoning: 'Comprehensive support package with priority response',
        tierJustification: 'Priority support with 4-hour response time',
        competitiveEdge: 'Proactive support vs competitors\' reactive approach'
      });
    }

    return enhancements;
  }

  /**
   * ENHANCED: Generate Best tier enhancements
   */
  generateBestTierEnhancements(baseItems, personaPrefs, input) {
    const enhancements = [];
    
    // Add premium consulting
    if (personaPrefs.includeDesignConsulting || personaPrefs.includeTechnicalConsulting) {
      enhancements.push({
        name: 'AI-Powered Smart Home Consulting',
        category: 'consulting',
        price: 3500,
        quantity: 1,
        reasoning: 'Strategic consulting to maximize smart home ROI and future-proof investment',
        tierJustification: 'Strategic AI-powered optimization consulting',
        competitiveEdge: 'Proprietary AI insights unavailable from competitors'
      });
    }

    // Add premium warranty
    enhancements.push({
      name: '5-Year Extended Warranty & Performance Guarantee',
      category: 'warranty',
      price: 2000,
      quantity: 1,
      reasoning: 'Extended warranty with performance guarantees',
      tierJustification: 'Comprehensive long-term protection',
      competitiveEdge: 'Industry-leading warranty terms'
    });

    // Add future upgrades
    enhancements.push({
      name: 'Future AI Enhancement Package',
      category: 'upgrade',
      price: 1500,
      quantity: 1,
      reasoning: 'Automatic AI feature upgrades and new capability rollouts',
      tierJustification: 'Always-current AI capabilities',
      competitiveEdge: 'Continuous innovation vs static competitor offerings'
    });

    return enhancements;
  }

  /**
   * ENHANCED: Generate tier value propositions
   */
  generateTierValueProposition(tier, persona, items) {
    const propositions = {
      good: {
        homeowner: 'Essential smart home foundation with security and lighting automation',
        'interior-designer': 'Core aesthetic integration with premium lighting control',
        builder: 'Cost-effective standardized systems for multiple properties',
        architect: 'Professional-grade infrastructure foundation',
        'business-owner': 'ROI-focused automation for operational efficiency',
        'c-suite': 'Executive foundation with premium positioning'
      },
      better: {
        homeowner: 'Complete smart home solution with convenience automation and professional installation',
        'interior-designer': 'Premium aesthetic integration with hidden technology and design consultation',
        builder: 'Standardized systems with bulk pricing and streamlined installation',
        architect: 'Comprehensive integration-ready solution with technical consulting',
        'business-owner': 'Optimized business automation with ROI analysis and support',
        'c-suite': 'Executive-grade solution with premium features and priority support'
      },
      best: {
        homeowner: 'Future-proof premium automation with AI intelligence and lifetime support',
        'interior-designer': 'Ultimate aesthetic integration with custom design and ongoing consultation',
        builder: 'Complete standardized solution with volume discounts and dedicated support',
        architect: 'Enterprise-grade scalable infrastructure with future enhancement guarantees',
        'business-owner': 'Maximum ROI solution with advanced analytics and competitive advantages',
        'c-suite': 'Revolutionary executive automation with industry-leading capabilities and prestige positioning'
      }
    };

    return propositions[tier][persona] || `Premium ${tier} tier solution optimized for ${persona}`;
  }

  /**
   * Distribute budget across categories based on bundle strategy
   */
  distributeBudgetByCategory(totalBudget, bundleStrategy, input) {
    const distribution = bundleStrategy.itemDistribution;
    const categoryBudgets = {};

    for (const [category, percentage] of Object.entries(distribution)) {
      categoryBudgets[category] = (totalBudget * percentage) / 100;
    }

    return categoryBudgets;
  }

  /**
   * Select optimal products for a specific category
   */
  selectProductsForCategory(categoryProducts, category, budget, personaPrefs, bundleStrategy, input) {
    const tier = personaPrefs.preferredTier;
    const maxCategoryItems = Math.ceil(personaPrefs.maxItems * 0.4); // Max 40% of items from any category

    // Sort products by relevance to persona
    const scoredProducts = categoryProducts.map(product => ({
      ...product,
      relevanceScore: this.calculateProductRelevanceScore(product, personaPrefs, category)
    })).sort((a, b) => b.relevanceScore - a.relevanceScore);

    const selectedProducts = [];
    let remainingBudget = budget;

    for (const product of scoredProducts) {
      if (selectedProducts.length >= maxCategoryItems) break;

      const price = this.getProductPriceForTier(product, tier);
      
      if (price <= remainingBudget || remainingBudget > budget * 0.8) { // Allow some budget flexibility
        selectedProducts.push({
          productId: product.id,
          name: product.name,
          description: product.description,
          category: product.category,
          brand: product.brand,
          price: price,
          quantity: 1,
          tier: tier,
          relevanceScore: product.relevanceScore,
          reasoning: this.generateProductReasoning(product, personaPrefs, category)
        });

        remainingBudget -= price;
      }
    }

    return selectedProducts;
  }

  /**
   * Calculate product relevance score for persona
   */
  calculateProductRelevanceScore(product, personaPrefs, category) {
    let score = 0;

    // Base score for being in priority category
    const categoryIndex = personaPrefs.priorityCategories.indexOf(category);
    score += (personaPrefs.priorityCategories.length - categoryIndex) * 10;

    // Score based on keywords in product name/description
    const productText = `${product.name} ${product.description || ''}`.toLowerCase();
    for (const feature of personaPrefs.keyFeatures) {
      if (productText.includes(feature.replace('-', ' '))) {
        score += 15;
      }
    }

    // Price tier alignment
    const tierPrices = {
      good: product.goodTierPrice || product.basePrice,
      better: product.betterTierPrice || product.basePrice * 1.15,
      best: product.bestTierPrice || product.basePrice * 1.35
    };

    const preferredPrice = tierPrices[personaPrefs.preferredTier];
    const maxBudgetPerItem = personaPrefs.budgetRange.max / personaPrefs.maxItems;
    
    if (preferredPrice <= maxBudgetPerItem) {
      score += 20;
    } else if (preferredPrice <= maxBudgetPerItem * 1.5) {
      score += 10;
    }

    return score;
  }

  /**
   * Get product price for specific tier
   */
  getProductPriceForTier(product, tier) {
    switch (tier) {
      case 'good':
        return product.goodTierPrice || product.basePrice;
      case 'better':
        return product.betterTierPrice || product.basePrice * 1.15;
      case 'best':
        return product.bestTierPrice || product.basePrice * 1.35;
      default:
        return product.basePrice;
    }
  }

  /**
   * Generate reasoning for product selection
   */
  generateProductReasoning(product, personaPrefs, category) {
    const reasons = [];

    if (personaPrefs.priorityCategories.indexOf(category) < 2) {
      reasons.push(`High priority ${category} category for this persona`);
    }

    for (const feature of personaPrefs.keyFeatures) {
      const productText = `${product.name} ${product.description || ''}`.toLowerCase();
      if (productText.includes(feature.replace('-', ' '))) {
        reasons.push(`Matches ${feature} requirement`);
      }
    }

    if (product.brand && ['Control4', 'Lutron', 'Sonos'].includes(product.brand)) {
      reasons.push('Premium brand aligned with persona preferences');
    }

    return reasons.join('; ');
  }

  /**
   * Optimize pricing for specific persona
   */
  optimizePricingForPersona(recommendations, persona, preferredTier, input) {
    const personaPrefs = PERSONA_PRODUCT_PREFERENCES[persona];
    const multiplier = personaPrefs.priceMultiplier;

    return {
      ...recommendations,
      items: recommendations.items.map(item => ({
        ...item,
        originalPrice: item.price,
        price: Math.round(item.price * multiplier * 100) / 100,
        priceAdjustment: multiplier !== 1.0 ? `${multiplier > 1 ? '+' : ''}${Math.round((multiplier - 1) * 100)}%` : null
      }))
    };
  }

  /**
   * Validate bundle compatibility
   */
  validateBundleCompatibility(recommendations) {
    console.log('🔍 Validating bundle compatibility...');

    const validatedItems = [];
    const includedCategories = new Set();

    for (const item of recommendations.items) {
      // Check for conflicts
      const hasConflict = this.checkProductConflicts(item, validatedItems);
      
      if (!hasConflict) {
        validatedItems.push(item);
        includedCategories.add(item.category);
      } else {
        console.log(`⚠️ Removing conflicting product: ${item.name}`);
      }
    }

    // Add essential dependencies if missing
    const withDependencies = this.addEssentialDependencies(validatedItems, includedCategories);

    return {
      ...recommendations,
      items: withDependencies
    };
  }

  /**
   * Check for product conflicts
   */
  checkProductConflicts(newItem, existingItems) {
    // Simple conflict detection - can be enhanced
    for (const existingItem of existingItems) {
      // Same product type conflict
      if (newItem.name === existingItem.name) {
        return true;
      }
      
      // Category overload (too many similar items)
      const categoryCount = existingItems.filter(item => item.category === newItem.category).length;
      if (categoryCount >= 5) { // Max 5 items per category
        return true;
      }
    }

    return false;
  }

  /**
   * Add essential dependencies
   */
  addEssentialDependencies(items, includedCategories) {
    // If we have smart devices but no networking, add basic networking
    const hasSmartDevices = items.some(item => 
      ['security', 'audio-video', 'lighting'].includes(item.category)
    );
    
    const hasNetworking = includedCategories.has('networking');

    if (hasSmartDevices && !hasNetworking) {
      items.push({
        productId: 'networking-foundation',
        name: 'Essential Network Foundation',
        description: 'Basic networking infrastructure for smart home devices',
        category: 'networking',
        price: 800,
        quantity: 1,
        tier: 'better',
        reasoning: 'Essential networking foundation for smart home devices',
        isDependency: true
      });
    }

    return items;
  }

  /**
   * Calculate simplified tier recommendations
   */
  calculateSimplifiedTiers(recommendations, persona, budget) {
    const baseItems = recommendations.items || recommendations;
    const personaPrefs = PERSONA_PRODUCT_PREFERENCES[persona];
    
    // Good tier - basic items only
    const goodTier = {
      items: baseItems.slice(0, 3).map(item => ({
        ...item,
        price: item.goodTierPrice || item.basePrice,
        tier: 'good'
      })),
      total: 0,
      description: 'Essential smart home foundation'
    };
    goodTier.total = this.calculateTotal(goodTier.items);

    // Better tier - more items with better pricing
    const betterTier = {
      items: baseItems.slice(0, 5).map(item => ({
        ...item,
        price: item.betterTierPrice || Math.round(item.basePrice * 1.2),
        tier: 'better'
      })),
      total: 0,
      description: 'Comprehensive smart home system'
    };
    betterTier.total = this.calculateTotal(betterTier.items);

    // Best tier - all items with premium pricing
    const bestTier = {
      items: baseItems.map(item => ({
        ...item,
        price: item.bestTierPrice || Math.round(item.basePrice * 1.5),
        tier: 'best'
      })),
      total: 0,
      description: 'Premium smart home experience'
    };
    bestTier.total = this.calculateTotal(bestTier.items);

    return {
      goodTier,
      betterTier,
      bestTier,
      recommendedTier: personaPrefs.preferredTier,
      goodTierTotal: goodTier.total,
      betterTierTotal: betterTier.total,
      bestTierTotal: bestTier.total
    };
  }

  /**
   * Generate basic competitive advantage
   */
  generateBasicCompetitiveAdvantage(persona) {
    return {
      advantages: [
        'AI-powered persona detection (95% accuracy)',
        '30-second voice-to-proposal automation',
        'Revolutionary Good/Better/Best tier intelligence',
        'Competitive pricing vs Portal.io'
      ],
      differentiators: [
        'Voice automation vs manual outline creation',
        'Instant proposal generation',
        'Smart bundling recommendations'
      ]
    };
  }

  /**
   * Calculate total price for items
   */
  calculateTotal(items) {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  /**
   * Calculate budget fit percentage
   */
  calculateBudgetFit(estimatedTotal, budget) {
    if (!budget) return null;
    
    const fit = (budget / estimatedTotal) * 100;
    let status = 'over-budget';
    
    if (fit >= 100) status = 'within-budget';
    else if (fit >= 80) status = 'close-fit';
    
    return {
      percentage: Math.round(fit),
      status,
      difference: budget - estimatedTotal
    };
  }

  /**
   * Generate fallback recommendations for error cases
   */
  async generateFallbackRecommendations(persona) {
    try {
      // Return basic product list for the persona
      const products = await this.getAvailableProducts();
      const personaPrefs = PERSONA_PRODUCT_PREFERENCES[persona] || PERSONA_PRODUCT_PREFERENCES['homeowner'];
      
      const basicItems = products
        .filter(p => personaPrefs.priorityCategories.includes(p.category))
        .slice(0, 5)
        .map(product => ({
          productId: product.id,
          name: product.name,
          description: product.description,
          category: product.category,
          price: this.getProductPriceForTier(product, 'better'),
          quantity: 1,
          tier: 'better',
          reasoning: 'Fallback recommendation'
        }));

      return {
        items: basicItems,
        total: this.calculateTotal(basicItems),
        method: 'fallback'
      };
    } catch (error) {
      console.error('❌ Fallback recommendations failed:', error);
      return { items: [], total: 0, method: 'fallback-failed' };
    }
  }

  /**
   * Build AI prompt for product recommendations
   */
  buildAIRecommendationPrompt(persona, products, bundleStrategy, input) {
    const personaPrefs = PERSONA_PRODUCT_PREFERENCES[persona];
    
    return `
Generate optimal smart home product recommendations for a ${persona} customer.

CUSTOMER PROFILE:
- Persona: ${persona}
- Budget: ${input.budget ? `$${input.budget.toLocaleString()}` : 'Flexible'}
- Project Size: ${input.projectSize || 'Medium'}
- Preferred Tier: ${personaPrefs.preferredTier}
- Key Features: ${personaPrefs.keyFeatures.join(', ')}

BUNDLE STRATEGY: ${bundleStrategy.name}
- Description: ${bundleStrategy.description}
- Priority Categories: ${bundleStrategy.categories.join(', ')}

VOICE CONTEXT:
${input.voiceTranscript ? `"${input.voiceTranscript}"` : 'No voice context provided'}

AVAILABLE PRODUCTS:
${products.slice(0, 50).map(p => 
  `- ${p.name} (${p.category}) - $${p.basePrice} | Good: $${p.goodTierPrice || p.basePrice} | Better: $${p.betterTierPrice || Math.round(p.basePrice * 1.15)} | Best: $${p.bestTierPrice || Math.round(p.basePrice * 1.35)}`
).join('\n')}

RESPOND WITH VALID JSON:
{
  "recommendations": [
    {
      "productId": "product_id",
      "name": "Product Name",
      "description": "Why this product fits",
      "category": "category",
      "price": 1000,
      "quantity": 1,
      "tier": "better",
      "reasoning": "Specific reason for this persona"
    }
  ],
  "bundleReasoning": "Overall bundle strategy explanation"
}

Focus on products that align with the persona's priorities and the specified bundle strategy.
`;
  }

  /**
   * Parse AI recommendation response
   */
  parseAIRecommendationResponse(content, products, usage) {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        items: parsed.recommendations || [],
        bundleReasoning: parsed.bundleReasoning,
        method: 'ai',
        tokensUsed: usage?.total_tokens || 0,
        cost: this.calculateCost(usage?.total_tokens || 0)
      };
    } catch (error) {
      console.error('❌ Failed to parse AI recommendation response:', error.message);
      throw new Error('AI response parsing failed');
    }
  }

  /**
   * Calculate OpenAI API cost
   */
  calculateCost(tokens) {
    return ((tokens / 1000) * 0.045).toFixed(4);
  }

  /**
   * Get available personas for recommendations
   */
  static getAvailablePersonas() {
    return Object.keys(PERSONA_PRODUCT_PREFERENCES);
  }

  /**
   * Get persona preferences
   */
  static getPersonaPreferences(persona) {
    return PERSONA_PRODUCT_PREFERENCES[persona] || null;
  }

  /**
   * Get bundle strategies
   */
  static getBundleStrategies() {
    return BUNDLE_STRATEGIES;
  }
}

// Export singleton instance
const productRecommendationService = new ProductRecommendationService();

module.exports = {
  ProductRecommendationService,
  productRecommendationService,
  PERSONA_PRODUCT_PREFERENCES,
  BUNDLE_STRATEGIES,
  PRODUCT_COMPATIBILITY
};