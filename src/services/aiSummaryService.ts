/**
 * AI Summary Service for Persona-Targeted Proposal Summaries
 * 
 * SAFETY: This is a NEW service that doesn't modify any existing functionality.
 * It provides AI-powered summaries tailored to specific customer personas.
 */

// Dynamic import for OpenAI to handle cases where package isn't installed
let OpenAI: any = null;
try {
  // Try to import OpenAI dynamically
  if (typeof window === 'undefined') {
    // Server-side only
    OpenAI = require('openai').OpenAI;
  }
} catch (error) {
  console.warn('OpenAI package not available. AI summaries will use mock generation.');
}

export interface PersonaPromptConfig {
  systemPrompt: string;
  focusAreas: string[];
  tone: string;
  technicalLevel: 'basic' | 'intermediate' | 'advanced';
  decisionFactors: string[];
}

export interface ProposalSummaryRequest {
  proposalName: string;
  description: string;
  customerPersona: string;
  items: Array<{
    name: string;
    description: string;
    category: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  totalAmount: number;
  voiceTranscript?: string;
}

export interface ProductRecommendationRequest {
  customerPersona: string;
  voiceTranscript: string;
  projectType: 'residential' | 'commercial';
  budget?: number;
  propertySize?: number;
  specificRequirements?: string[];
}

export interface ProductRecommendation {
  name: string;
  description: string;
  category: string;
  brand: string;
  model: string;
  basePrice: number;
  quantity: number;
  reasoning: string;
  priority: 'essential' | 'recommended' | 'optional';
}

export interface ProductRecommendationResult {
  success: boolean;
  recommendations?: ProductRecommendation[];
  totalEstimate?: number;
  projectSummary?: string;
  error?: string;
  tokensUsed?: number;
  cost?: number;
}

export interface CompleteAIWorkflowRequest {
  customerPersona: string;
  voiceTranscript: string;
  projectType: 'residential' | 'commercial';
  budget?: number;
  propertySize?: number;
}

export interface CompleteAIWorkflowResult {
  success: boolean;
  productRecommendations?: ProductRecommendation[];
  proposalSummary?: {
    executiveSummary: string;
    summary: string;
    keyBenefits: string[];
    callToAction: string;
  };
  totalEstimate?: number;
  error?: string;
  tokensUsed?: number;
  cost?: number;
}

export interface AISummaryResult {
  success: boolean;
  summary?: string;
  executiveSummary?: string;
  keyBenefits?: string[];
  callToAction?: string;
  error?: string;
  tokensUsed?: number;
  cost?: number;
}

/**
 * Persona-specific prompt configurations
 */
export const PERSONA_PROMPTS: Record<string, PersonaPromptConfig> = {
  // SMART HOME INTEGRATOR AI
  'smart-home-integrator': {
    systemPrompt: `You are an expert Smart Home Integrator AI with deep knowledge of automation products, systems integration, and customer needs analysis. Your role is to analyze customer requirements and recommend optimal smart home solutions with structured JSON output for product recommendations.`,
    focusAreas: ['product analysis', 'system integration', 'budget optimization', 'technology matching', 'scalability planning'],
    tone: 'expert and analytical',
    technicalLevel: 'advanced',
    decisionFactors: ['technical compatibility', 'budget efficiency', 'future expansion', 'integration complexity', 'customer priorities']
  },

  // RESIDENTIAL PERSONAS
  'homeowner': {
    systemPrompt: `You are a smart home consultant creating a proposal summary for a homeowner. Focus on lifestyle improvements, convenience, security, and energy savings. Use friendly, accessible language that emphasizes family benefits and home value enhancement.`,
    focusAreas: ['convenience', 'security', 'energy savings', 'home value', 'family safety', 'entertainment'],
    tone: 'friendly and reassuring',
    technicalLevel: 'basic',
    decisionFactors: ['ease of use', 'reliability', 'warranty', 'family benefits', 'cost savings']
  },
  
  'interior-designer': {
    systemPrompt: `You are presenting to an interior designer who values aesthetics, client satisfaction, and seamless integration. Emphasize how technology enhances design vision, creates ambiance, and impresses their clients. Use sophisticated design language.`,
    focusAreas: ['aesthetic integration', 'ambiance control', 'client impressions', 'design flexibility', 'hidden technology'],
    tone: 'sophisticated and creative',
    technicalLevel: 'intermediate',
    decisionFactors: ['visual appeal', 'integration capabilities', 'client wow factor', 'design flexibility']
  },

  'builder': {
    systemPrompt: `You are presenting to a builder who cares about efficiency, cost-effectiveness, marketability, and easy installation. Focus on competitive advantages, buyer appeal, and streamlined installation processes.`,
    focusAreas: ['installation efficiency', 'market differentiation', 'buyer appeal', 'cost-effectiveness', 'competitive advantage'],
    tone: 'practical and results-oriented',
    technicalLevel: 'intermediate',
    decisionFactors: ['installation ease', 'market value', 'cost per unit', 'buyer demand', 'warranty support']
  },

  'architect': {
    systemPrompt: `You are presenting to an architect who values innovation, sustainability, integration with building systems, and future-proofing. Use precise technical language and emphasize how technology serves the overall building vision.`,
    focusAreas: ['system integration', 'sustainability', 'innovation', 'building performance', 'future-proofing'],
    tone: 'technical and visionary',
    technicalLevel: 'advanced',
    decisionFactors: ['technical specifications', 'system compatibility', 'energy efficiency', 'scalability']
  },

  // COMMERCIAL PERSONAS
  'cto-cio': {
    systemPrompt: `You are presenting to a CTO/CIO who prioritizes security, scalability, integration with existing systems, and ROI. Focus on technical architecture, cybersecurity, and operational efficiency. Use precise technical terminology.`,
    focusAreas: ['cybersecurity', 'scalability', 'system integration', 'operational efficiency', 'data analytics'],
    tone: 'technical and strategic',
    technicalLevel: 'advanced',
    decisionFactors: ['security protocols', 'integration capabilities', 'scalability', 'ROI', 'maintenance requirements']
  },

  'business-owner': {
    systemPrompt: `You are presenting to a business owner focused on ROI, operational efficiency, competitive advantage, and customer experience. Emphasize bottom-line impact and business growth opportunities.`,
    focusAreas: ['ROI', 'operational efficiency', 'competitive advantage', 'customer experience', 'cost reduction'],
    tone: 'business-focused and persuasive',
    technicalLevel: 'intermediate',
    decisionFactors: ['return on investment', 'payback period', 'competitive advantage', 'operational savings']
  },

  'c-suite': {
    systemPrompt: `You are presenting to C-level executives who think strategically about market positioning, shareholder value, and long-term vision. Focus on strategic advantages and enterprise-level benefits.`,
    focusAreas: ['strategic advantage', 'market positioning', 'stakeholder value', 'innovation leadership', 'risk mitigation'],
    tone: 'executive and strategic',
    technicalLevel: 'intermediate',
    decisionFactors: ['strategic value', 'competitive positioning', 'risk management', 'stakeholder impact']
  },

  'office-manager': {
    systemPrompt: `You are presenting to an office manager who focuses on employee productivity, workplace efficiency, cost control, and ease of management. Emphasize practical daily benefits and operational simplicity.`,
    focusAreas: ['employee productivity', 'workplace efficiency', 'cost control', 'ease of management', 'comfort'],
    tone: 'practical and supportive',
    technicalLevel: 'basic',
    decisionFactors: ['ease of use', 'employee satisfaction', 'cost savings', 'maintenance simplicity']
  },

  'facilities-manager': {
    systemPrompt: `You are presenting to a facilities manager who prioritizes system reliability, maintenance efficiency, energy management, and operational control. Focus on technical reliability and operational benefits.`,
    focusAreas: ['system reliability', 'maintenance efficiency', 'energy management', 'operational control', 'monitoring'],
    tone: 'technical and reliable',
    technicalLevel: 'advanced',
    decisionFactors: ['reliability', 'maintenance requirements', 'energy efficiency', 'system monitoring', 'lifecycle costs']
  }
};

/**
 * AI Summary Service Class
 */
export class AISummaryService {
  private openai: any = null;
  private isConfigured = false;

  constructor() {
    this.initializeOpenAI();
  }

  private initializeOpenAI() {
    try {
      // Check if OpenAI package is available
      if (!OpenAI) {
        console.warn('OpenAI package not installed. AI summaries will be mocked.');
        return;
      }

      const apiKey = process.env.OPENAI_API_KEY;
      
      if (!apiKey || apiKey === 'your-openai-api-key-here') {
        console.warn('OpenAI API key not configured. AI summaries will be mocked.');
        return;
      }

      this.openai = new OpenAI({
        apiKey: apiKey,
      });
      
      this.isConfigured = true;
      console.log('OpenAI service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize OpenAI:', error);
    }
  }

  /**
   * Generate a persona-targeted proposal summary
   */
  async generateSummary(request: ProposalSummaryRequest): Promise<AISummaryResult> {
    try {
      // Validate inputs
      if (!request.customerPersona || !PERSONA_PROMPTS[request.customerPersona]) {
        return {
          success: false,
          error: `Unsupported persona: ${request.customerPersona}`
        };
      }

      // If OpenAI is not configured, return mock summary
      if (!this.isConfigured || !this.openai) {
        return this.generateMockSummary(request);
      }

      const personaConfig = PERSONA_PROMPTS[request.customerPersona];
      const prompt = this.buildPrompt(request, personaConfig);

      const response = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: personaConfig.systemPrompt
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      // Parse the structured response
      const parsed = this.parseAIResponse(content);

      return {
        success: true,
        ...parsed,
        tokensUsed: response.usage?.total_tokens,
        cost: this.calculateCost(response.usage?.total_tokens || 0)
      };

    } catch (error) {
      console.error('AI Summary generation failed:', error);
      return {
        success: false,
        error: `AI generation failed: ${(error as Error).message}`
      };
    }
  }

  /**
   * Build the prompt for AI generation
   */
  private buildPrompt(request: ProposalSummaryRequest, config: PersonaPromptConfig): string {
    const itemsList = request.items.map(item => 
      `- ${item.name} (${item.category}) - Qty: ${item.quantity} - $${item.unitPrice.toLocaleString()}`
    ).join('\n');

    return `
Create a compelling proposal summary for this smart home project:

**Proposal:** ${request.proposalName}
**Description:** ${request.description}
**Customer Persona:** ${request.customerPersona}
**Total Investment:** $${request.totalAmount.toLocaleString()}

**Proposed Solutions:**
${itemsList}

${request.voiceTranscript ? `**Customer Input:** ${request.voiceTranscript}` : ''}

**Focus Areas for this persona:** ${config.focusAreas.join(', ')}
**Key Decision Factors:** ${config.decisionFactors.join(', ')}
**Tone:** ${config.tone}
**Technical Level:** ${config.technicalLevel}

Please provide a structured response with:
1. **EXECUTIVE_SUMMARY:** A compelling 2-3 sentence overview
2. **DETAILED_SUMMARY:** 2-3 paragraphs highlighting persona-specific benefits
3. **KEY_BENEFITS:** 4-5 bullet points of top advantages
4. **CALL_TO_ACTION:** A persuasive next step

Tailor the language and emphasis specifically for the ${request.customerPersona} persona.
    `;
  }

  /**
   * Parse AI response into structured format
   */
  private parseAIResponse(content: string): Partial<AISummaryResult> {
    try {
      // Extract sections using regex patterns
      const executiveSummary = this.extractSection(content, 'EXECUTIVE_SUMMARY');
      const detailedSummary = this.extractSection(content, 'DETAILED_SUMMARY');
      const keyBenefits = this.extractBulletPoints(content, 'KEY_BENEFITS');
      const callToAction = this.extractSection(content, 'CALL_TO_ACTION');

      return {
        executiveSummary: executiveSummary || content.substring(0, 200) + '...',
        summary: detailedSummary || content,
        keyBenefits: keyBenefits.length > 0 ? keyBenefits : ['Enhanced automation', 'Improved efficiency', 'Cost savings', 'Future-ready technology'],
        callToAction: callToAction || 'Ready to move forward? Let\'s schedule a consultation to discuss next steps.'
      };
    } catch (error) {
      // Fallback to simple parsing
      return {
        summary: content,
        executiveSummary: content.substring(0, 200) + '...',
        keyBenefits: ['Enhanced automation', 'Improved efficiency'],
        callToAction: 'Contact us to learn more.'
      };
    }
  }

  /**
   * Extract a specific section from the AI response
   */
  private extractSection(content: string, sectionName: string): string | null {
    const regex = new RegExp(`\\*\\*${sectionName}:\\*\\*\\s*([\\s\\S]*?)(?=\\*\\*[A-Z_]+:\\*\\*|$)`, 'i');
    const match = content.match(regex);
    return match ? match[1].trim() : null;
  }

  /**
   * Extract bullet points from a section
   */
  private extractBulletPoints(content: string, sectionName: string): string[] {
    const section = this.extractSection(content, sectionName);
    if (!section) return [];

    return section
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('-') || line.startsWith('•') || line.match(/^\d+\./))
      .map(line => line.replace(/^[-•\d.]\s*/, '').trim())
      .filter(line => line.length > 0);
  }

  /**
   * Generate mock summary for testing when OpenAI is not configured
   */
  private generateMockSummary(request: ProposalSummaryRequest): AISummaryResult {
    const personaConfig = PERSONA_PROMPTS[request.customerPersona];
    
    return {
      success: true,
      executiveSummary: `This comprehensive smart home solution is tailored specifically for ${request.customerPersona}s, delivering ${personaConfig.focusAreas.slice(0, 2).join(' and ')} through cutting-edge automation technology.`,
      summary: `Your ${request.proposalName} represents a strategic investment in ${personaConfig.focusAreas.join(', ')}. This ${request.items.length}-component solution addresses your specific needs with a ${personaConfig.tone} approach. The integrated systems will provide immediate value while positioning you for future growth and enhanced ${personaConfig.focusAreas[0]}.`,
      keyBenefits: [
        `Enhanced ${personaConfig.focusAreas[0]}`,
        `Improved ${personaConfig.focusAreas[1]}`,
        `Streamlined ${personaConfig.focusAreas[2] || 'operations'}`,
        `Future-ready technology investment`,
        `Professional-grade reliability`
      ],
      callToAction: `Ready to enhance your ${personaConfig.focusAreas[0]}? Let's schedule a consultation to discuss implementation details and timeline.`,
      tokensUsed: 250,
      cost: 0.001
    };
  }

  /**
   * Calculate estimated cost based on token usage
   */
  private calculateCost(tokens: number): number {
    // Approximate cost for GPT-4o-mini: $0.00015 per 1K tokens
    return (tokens / 1000) * 0.00015;
  }

  /**
   * Get available personas
   */
  static getAvailablePersonas(): string[] {
    return Object.keys(PERSONA_PROMPTS);
  }

  /**
   * Get persona configuration
   */
  static getPersonaConfig(persona: string): PersonaPromptConfig | null {
    return PERSONA_PROMPTS[persona] || null;
  }

  /**
   * Generate product recommendations based on customer requirements
   */
  async generateProductRecommendations(request: ProductRecommendationRequest): Promise<ProductRecommendationResult> {
    try {
      // If OpenAI is not configured, return mock recommendations
      if (!this.isConfigured || !this.openai) {
        return this.generateMockProductRecommendations(request);
      }

      const integrationConfig = PERSONA_PROMPTS['smart-home-integrator'];
      const prompt = this.buildProductRecommendationPrompt(request, integrationConfig);

      const response = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: integrationConfig.systemPrompt
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3, // Lower temperature for more consistent product recommendations
        max_tokens: 1500,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      // Parse the structured JSON response
      const parsed = this.parseProductRecommendations(content);

      return {
        success: true,
        ...parsed,
        tokensUsed: response.usage?.total_tokens,
        cost: this.calculateCost(response.usage?.total_tokens || 0)
      };

    } catch (error) {
      console.error('Product recommendation generation failed:', error);
      return {
        success: false,
        error: `Product recommendation failed: ${(error as Error).message}`
      };
    }
  }

  /**
   * Complete AI workflow: Product recommendations + Persona-targeted summary
   */
  async generateCompleteWorkflow(request: CompleteAIWorkflowRequest): Promise<CompleteAIWorkflowResult> {
    try {
      // Step 1: Generate product recommendations
      const productResult = await this.generateProductRecommendations({
        customerPersona: request.customerPersona,
        voiceTranscript: request.voiceTranscript,
        projectType: request.projectType,
        budget: request.budget,
        propertySize: request.propertySize
      });

      if (!productResult.success || !productResult.recommendations) {
        return {
          success: false,
          error: 'Failed to generate product recommendations'
        };
      }

      // Step 2: Convert recommendations to proposal items
      const proposalItems = productResult.recommendations.map(rec => ({
        name: rec.name,
        description: rec.description,
        category: rec.category,
        quantity: rec.quantity,
        unitPrice: rec.basePrice,
        totalPrice: rec.basePrice * rec.quantity
      }));

      // Step 3: Generate persona-targeted summary
      const summaryResult = await this.generateSummary({
        proposalName: `Smart Home ${request.projectType === 'residential' ? 'Automation' : 'Integration'} Solution`,
        description: productResult.projectSummary || 'Comprehensive smart automation system',
        customerPersona: request.customerPersona,
        items: proposalItems,
        totalAmount: productResult.totalEstimate || 0,
        voiceTranscript: request.voiceTranscript
      });

      if (!summaryResult.success) {
        return {
          success: false,
          error: 'Failed to generate proposal summary'
        };
      }

      return {
        success: true,
        productRecommendations: productResult.recommendations,
        proposalSummary: {
          executiveSummary: summaryResult.executiveSummary || '',
          summary: summaryResult.summary || '',
          keyBenefits: summaryResult.keyBenefits || [],
          callToAction: summaryResult.callToAction || ''
        },
        totalEstimate: productResult.totalEstimate,
        tokensUsed: (productResult.tokensUsed || 0) + (summaryResult.tokensUsed || 0),
        cost: (productResult.cost || 0) + (summaryResult.cost || 0)
      };

    } catch (error) {
      console.error('Complete AI workflow failed:', error);
      return {
        success: false,
        error: `Complete workflow failed: ${(error as Error).message}`
      };
    }
  }

  /**
   * Build the prompt for product recommendation generation
   */
  private buildProductRecommendationPrompt(request: ProductRecommendationRequest, config: PersonaPromptConfig): string {
    return `
Analyze the customer requirements and recommend optimal smart home products:

**Customer Profile:**
- Persona: ${request.customerPersona}
- Project Type: ${request.projectType}
- Budget: ${request.budget ? `$${request.budget.toLocaleString()}` : 'Not specified'}
- Property Size: ${request.propertySize ? `${request.propertySize} sq ft` : 'Not specified'}

**Customer Requirements (Voice Input):**
"${request.voiceTranscript}"

**Focus Areas:** ${config.focusAreas.join(', ')}
**Decision Factors:** ${config.decisionFactors.join(', ')}

Please provide a structured JSON response with the following format:
{
  "projectSummary": "Brief overview of the recommended solution",
  "recommendations": [
    {
      "name": "Product Name",
      "description": "Product description",
      "category": "lighting|security|audio-video|networking|climate|access-control|other",
      "brand": "Brand Name",
      "model": "Model Number",
      "basePrice": 999,
      "quantity": 1,
      "reasoning": "Why this product fits the customer's needs",
      "priority": "essential|recommended|optional"
    }
  ],
  "totalEstimate": 15000
}

Consider product compatibility, budget constraints, and customer priorities. Focus on ${config.focusAreas.slice(0, 3).join(', ')}.
    `;
  }

  /**
   * Parse product recommendations from AI response
   */
  private parseProductRecommendations(content: string): Partial<ProductRecommendationResult> {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          recommendations: parsed.recommendations || [],
          totalEstimate: parsed.totalEstimate || 0,
          projectSummary: parsed.projectSummary || 'Smart home automation solution'
        };
      }
      
      // Fallback to simple parsing if JSON fails
      return {
        recommendations: [
          {
            name: 'Smart Lighting System',
            description: 'Comprehensive lighting automation',
            category: 'lighting',
            brand: 'Lutron',
            model: 'Caseta Pro',
            basePrice: 2500,
            quantity: 1,
            reasoning: 'Essential foundation for smart home automation',
            priority: 'essential'
          }
        ],
        totalEstimate: 15000,
        projectSummary: 'Comprehensive smart home automation solution'
      };
    } catch (error) {
      // Return fallback recommendations
      return {
        recommendations: [
          {
            name: 'Smart Automation Package',
            description: 'Complete smart home solution',
            category: 'other',
            brand: 'Control4',
            model: 'EA-1',
            basePrice: 12000,
            quantity: 1,
            reasoning: 'Integrated solution matching customer requirements',
            priority: 'essential'
          }
        ],
        totalEstimate: 12000,
        projectSummary: 'Integrated smart home automation system'
      };
    }
  }

  /**
   * Generate mock product recommendations for testing
   */
  private generateMockProductRecommendations(request: ProductRecommendationRequest): ProductRecommendationResult {
    const personaConfig = PERSONA_PROMPTS[request.customerPersona] || PERSONA_PROMPTS['homeowner'];
    
    // Generate mock recommendations based on project type and persona
    const baseRecommendations: ProductRecommendation[] = [
      {
        name: 'Smart Lighting Control System',
        description: 'Automated lighting throughout the space',
        category: 'lighting',
        brand: 'Lutron',
        model: 'Caseta Pro',
        basePrice: request.projectType === 'commercial' ? 8000 : 3500,
        quantity: 1,
        reasoning: `Perfect for ${personaConfig.focusAreas[0]} with ${personaConfig.tone} approach`,
        priority: 'essential'
      },
      {
        name: 'Security & Monitoring System',
        description: 'Comprehensive security with smart monitoring',
        category: 'security',
        brand: 'Honeywell',
        model: 'Pro Series',
        basePrice: request.projectType === 'commercial' ? 12000 : 6000,
        quantity: 1,
        reasoning: `Addresses ${personaConfig.focusAreas[1]} requirements with professional-grade reliability`,
        priority: 'essential'
      },
      {
        name: 'Climate Control Integration',
        description: 'Smart HVAC control and optimization',
        category: 'climate',
        brand: 'Ecobee',
        model: 'SmartThermostat Pro',
        basePrice: request.projectType === 'commercial' ? 3500 : 1500,
        quantity: 1,
        reasoning: `Enhances ${personaConfig.focusAreas[2] || 'comfort'} while reducing operational costs`,
        priority: 'recommended'
      }
    ];

    // Filter recommendations based on budget if provided
    let filteredRecommendations = baseRecommendations;
    if (request.budget) {
      const essentialTotal = baseRecommendations
        .filter(rec => rec.priority === 'essential')
        .reduce((total, rec) => total + (rec.basePrice * rec.quantity), 0);
      
      if (essentialTotal > request.budget) {
        // Scale down prices to fit budget
        const scaleFactor = (request.budget * 0.8) / essentialTotal;
        filteredRecommendations = baseRecommendations.map(rec => ({
          ...rec,
          basePrice: Math.round(rec.basePrice * scaleFactor)
        }));
      }
    }

    const totalEstimate = filteredRecommendations.reduce(
      (total, rec) => total + (rec.basePrice * rec.quantity), 
      0
    );

    return {
      success: true,
      recommendations: filteredRecommendations,
      totalEstimate,
      projectSummary: `Comprehensive ${request.projectType} smart automation solution tailored for ${request.customerPersona} with focus on ${personaConfig.focusAreas.slice(0, 2).join(' and ')}`,
      tokensUsed: 350,
      cost: 0.0005
    };
  }
}

export default AISummaryService; 