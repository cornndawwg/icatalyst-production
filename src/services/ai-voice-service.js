const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const prisma = require('../utils/prisma');
const { personaDetectionService } = require('./persona-detection-service');

class AIVoiceService {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        
        this.WHISPER_MODEL = 'whisper-1';
        this.GPT_MODEL = 'gpt-4-1106-preview'; // GPT-4 Turbo for better performance
    }

    /**
     * Process voice recording: transcribe and generate proposal
     * @param {string} voiceRecordingId - ID of the voice recording
     * @returns {Promise<Object>} Processing result
     */
    async processVoiceRecording(voiceRecordingId) {
        console.log(`🎙️ Starting AI processing for voice recording: ${voiceRecordingId}`);
        
        try {
            // Get voice recording record
            const voiceRecording = await prisma.voiceRecording.findUnique({
                where: { id: voiceRecordingId },
                include: {
                    customer: true,
                    property: true
                }
            });

            if (!voiceRecording) {
                throw new Error(`Voice recording not found: ${voiceRecordingId}`);
            }

            // Update status to processing
            await prisma.voiceRecording.update({
                where: { id: voiceRecordingId },
                data: {
                    transcriptionStatus: 'processing',
                    processingStartedAt: new Date()
                }
            });

            // Step 1: Transcribe audio using Whisper
            console.log(`🔄 Transcribing audio file: ${voiceRecording.filename}`);
            const transcription = await this.transcribeAudio(voiceRecording.fileUrl);
            
            // Update transcription status
            await prisma.voiceRecording.update({
                where: { id: voiceRecordingId },
                data: {
                    transcriptionStatus: 'completed',
                    transcriptionText: transcription,
                    proposalStatus: 'processing'
                }
            });

            console.log(`✅ Transcription completed: ${transcription.substring(0, 100)}...`);

            // Step 2: Enhanced persona detection
            console.log(`🎯 Running AI-enhanced persona detection...`);
            const personaDetection = await personaDetectionService.detectPersona({
                voiceTranscript: transcription,
                additionalContext: {
                    hasCustomer: !!voiceRecording.customer,
                    customerType: voiceRecording.customer?.type,
                    propertyType: voiceRecording.property?.type,
                    propertySize: voiceRecording.property?.squareFootage
                }
            });

            console.log(`🎯 Persona detected: ${personaDetection.persona} (confidence: ${Math.round(personaDetection.confidence * 100)}%)`);

            // Step 3: Generate proposal using GPT-4 with persona insights
            console.log(`🤖 Generating proposal from transcription with persona targeting...`);
            const proposalData = await this.generateProposal(transcription, voiceRecording, personaDetection);

            // Step 4: Create AI proposal record with persona detection data
            const aiProposal = await this.createAIProposal(voiceRecordingId, proposalData, transcription, personaDetection);

            // Update voice recording status
            await prisma.voiceRecording.update({
                where: { id: voiceRecordingId },
                data: {
                    proposalStatus: 'completed',
                    processingCompletedAt: new Date()
                }
            });

            console.log(`🎉 AI proposal generated successfully: ${aiProposal.id}`);

            return {
                success: true,
                voiceRecordingId,
                transcription,
                aiProposalId: aiProposal.id,
                processingTime: proposalData.processingTime
            };

        } catch (error) {
            console.error(`❌ AI processing failed for ${voiceRecordingId}:`, error);
            
            // Update error status
            await prisma.voiceRecording.update({
                where: { id: voiceRecordingId },
                data: {
                    transcriptionStatus: 'failed',
                    transcriptionError: error.message,
                    proposalStatus: 'failed',
                    proposalError: error.message
                }
            });

            throw error;
        }
    }

    /**
     * Transcribe audio file using OpenAI Whisper
     * @param {string} filePath - Path to audio file
     * @returns {Promise<string>} Transcribed text
     */
    async transcribeAudio(filePath) {
        try {
            const audioFile = fs.createReadStream(filePath);
            
            const transcription = await this.openai.audio.transcriptions.create({
                file: audioFile,
                model: this.WHISPER_MODEL,
                language: 'en', // Optimize for English
                response_format: 'text'
            });

            return transcription;
        } catch (error) {
            console.error('Whisper transcription error:', error);
            throw new Error(`Audio transcription failed: ${error.message}`);
        }
    }

    /**
     * Generate smart home proposal using GPT-4 with AI-enhanced persona targeting and intelligent product bundling
     * PRIORITY 1B ENHANCEMENT: Advanced Good/Better/Best automation with competitive intelligence
     * @param {string} transcription - Transcribed text from voice memo
     * @param {Object} context - Voice recording context (customer, property)
     * @param {Object} personaDetection - Persona detection results
     * @returns {Promise<Object>} Generated proposal data
     */
    async generateProposal(transcription, context, personaDetection = null) {
        const startTime = Date.now();

        try {
            // PHASE 1B ENHANCEMENT: Generate intelligent product recommendations with tier optimization
            const { productRecommendationService } = require('./product-recommendation-service');
            let productRecommendations = null;
            
            if (personaDetection?.success) {
                console.log(`🛍️ Generating ENHANCED product recommendations for ${personaDetection.persona}...`);
                
                try {
                    const budget = this.extractBudgetFromTranscript(transcription);
                    const projectSize = this.extractProjectSizeFromTranscript(transcription);
                    const urgency = this.extractUrgencyFromTranscript(transcription);
                    const requirements = this.extractSpecificRequirements(transcription);
                    
                    const recommendationResult = await productRecommendationService.generateRecommendations({
                        persona: personaDetection.persona,
                        personaConfidence: personaDetection.confidence,
                        voiceTranscript: transcription,
                        budget: budget,
                        projectSize: projectSize,
                        urgency: urgency,
                        specificRequirements: requirements,
                        enhancedTierOptimization: true // NEW: Enable advanced tier optimization
                    });
                    
                    if (recommendationResult.success) {
                        productRecommendations = recommendationResult;
                        console.log(`✅ Generated ${productRecommendations.recommendations.items.length} ENHANCED intelligent product recommendations`);
                    }
                } catch (error) {
                    console.warn('⚠️ Enhanced product recommendation generation failed, proceeding with standard approach:', error.message);
                }
            }

            // Get product catalog for context and validation
            const products = await prisma.product.findMany({
                where: { isActive: true },
                select: {
                    id: true,
                    name: true,
                    category: true,
                    brand: true,
                    description: true,
                    basePrice: true,
                    goodTierPrice: true,
                    betterTierPrice: true,
                    bestTierPrice: true
                }
            });

            // Get customer personas for targeting
            const personas = await prisma.customerPersona.findMany({
                where: { isActive: true },
                select: {
                    name: true,
                    description: true,
                    recommendedTier: true,
                    keyCharacteristics: true
                }
            });

            // ENHANCED GPT-4 prompt for superior tier differentiation
            const prompt = this.buildEnhancedGPTPrompt(transcription, context, products, personas, personaDetection, productRecommendations);

            console.log(`🤖 Calling GPT-4 for ENHANCED proposal generation...`);
            
            const completion = await this.openai.chat.completions.create({
                model: this.GPT_MODEL,
                messages: [
                    {
                        role: "system",
                        content: `You are iCatalyst AI, the world's most advanced smart home proposal automation system. Your revolutionary capability is transforming voice memos into complete, intelligent Good/Better/Best proposals that outperform any competitor.

COMPETITIVE ADVANTAGE: You generate complete voice-to-approval automation, not just voice-to-outline like Portal.io.

Your Good/Better/Best tiers must demonstrate clear value progression that justifies premium pricing and showcases advanced AI intelligence.`
                    },
                    {
                        role: "user", 
                        content: prompt
                    }
                ],
                temperature: 0.3, // Lower temperature for more consistent, professional results
                max_tokens: 4000
            });

            const content = completion.choices[0].message.content;
            const usage = completion.usage;

            console.log(`📊 GPT-4 response received. Tokens used: ${usage.total_tokens}`);

            // Parse and validate JSON response
            let proposalData;
            try {
                // Clean the response to ensure valid JSON
                const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
                proposalData = JSON.parse(cleanedContent);
            } catch (parseError) {
                console.error('❌ Failed to parse GPT-4 response as JSON:', parseError);
                console.log('Raw response:', content);
                throw new Error('Invalid JSON response from GPT-4');
            }

            // ENHANCED: Validate and optimize tier differentiation
            this.validateAndOptimizeTiers(proposalData, personaDetection, productRecommendations);

            // Add metadata for tracking and analytics
            const processingTime = Date.now() - startTime;
            proposalData.processingTime = processingTime;
            proposalData.modelVersion = this.GPT_MODEL;
            proposalData.tokensUsed = usage.total_tokens;
            proposalData.enhancedTierOptimization = true; // Track enhanced features

            console.log(`✅ ENHANCED proposal generated successfully in ${processingTime}ms`);
            console.log(`   📊 Tiers: Good ($${proposalData.goodTierTotal}) | Better ($${proposalData.betterTierTotal}) | Best ($${proposalData.bestTierTotal})`);
            
            return proposalData;

        } catch (error) {
            console.error('💥 Enhanced proposal generation failed:', error);
            throw error;
        }
    }

    /**
     * ENHANCED GPT prompt for superior Good/Better/Best automation
     * Builds competitive-intelligence-driven prompt for revolutionary tier differentiation
     */
    buildEnhancedGPTPrompt(transcription, context, products, personas, personaDetection, productRecommendations = null) {
        const customerContext = context.customer ? 
            `Customer: ${context.customer.firstName} ${context.customer.lastName} (${context.customer.type})` : 
            'Customer: Unknown (to be identified from voice memo)';

        const propertyContext = context.property ? 
            `Property: ${context.property.type} - ${context.property.squareFootage} sq ft` : 
            'Property: To be identified from voice memo';

        // Enhanced persona context with competitive insights
        const personaContext = personaDetection && personaDetection.success ? 
            `🎯 AI PERSONA DETECTION (95%+ ACCURACY):
- Detected Persona: ${personaDetection.persona} (${Math.round(personaDetection.confidence * 100)}% confidence)
- Project Type: ${personaDetection.projectType}
- Recommended Tier: ${personas.find(p => p.name === personaDetection.persona)?.recommendedTier || 'better'}
- AI Reasoning: ${personaDetection.reasoning || 'Advanced persona analysis'}
- Key Indicators: ${personaDetection.keyIndicators ? personaDetection.keyIndicators.join(', ') : 'Professional analysis completed'}` :
            '🎯 AI PERSONA DETECTION: Analyze voice memo to determine optimal customer persona';

        // Revolutionary product recommendation context
        const productRecommendationContext = productRecommendations && productRecommendations.success ?
            `🚀 AI INTELLIGENT PRODUCT BUNDLING (PRIORITIZE):
- Bundle Strategy: ${productRecommendations.bundleStrategy}
- Optimized Tier: ${productRecommendations.recommendations.recommendedTier}
- Total Items: ${productRecommendations.recommendations.items.length}
- Est. Value: $${productRecommendations.recommendations.estimatedTotal.toLocaleString()}

SMART BUNDLE FOUNDATION:
${productRecommendations.recommendations.items.slice(0, 8).map(item => 
    `- ${item.name} (${item.category}) - $${item.price} | Qty: ${item.quantity} | ${item.reasoning}`
).join('\n')}

INTELLIGENT TIER STRUCTURE:
Good Tier: ${productRecommendations.recommendations.goodTier.items.length} items → $${productRecommendations.recommendations.goodTier.total.toLocaleString()}
Better Tier: ${productRecommendations.recommendations.betterTier.items.length} items → $${productRecommendations.recommendations.betterTier.total.toLocaleString()}
Best Tier: ${productRecommendations.recommendations.bestTier.items.length} items → $${productRecommendations.recommendations.bestTier.total.toLocaleString()}` :
            '🚀 AI INTELLIGENT PRODUCT BUNDLING: Generate optimized bundles based on persona analysis';

        return `🎙️ VOICE MEMO TRANSCRIPTION:
"${transcription}"

📋 CONTEXT:
${customerContext}
${propertyContext}

${personaContext}

${productRecommendationContext}

🏪 AVAILABLE PRODUCTS (Enterprise Catalog):
${products.slice(0, 15).map(p => `- ${p.name} (${p.category}) - Base: $${p.basePrice} | Good: $${p.goodTierPrice} | Better: $${p.betterTierPrice} | Best: $${p.bestTierPrice}`).join('\n')}
... and ${products.length - 15} more professional products available

👥 CUSTOMER PERSONAS:
${personas.map(p => `- ${p.name}: ${p.description} (Recommended: ${p.recommendedTier})`).join('\n')}

🎯 REVOLUTIONARY TASK: Generate the industry's most intelligent Good/Better/Best proposal automation

COMPETITIVE ADVANTAGE REQUIREMENTS:
1. VOICE-TO-APPROVAL AUTOMATION: Complete proposals, not just outlines like Portal.io
2. INTELLIGENT TIER DIFFERENTIATION: Each tier must show clear value progression
3. PERSONA-OPTIMIZED BUNDLING: Products selected based on customer psychology
4. PREMIUM POSITIONING: Justify $800-1,200/month positioning vs competitors

TIER STRATEGY MANDATES:
- GOOD: Essential foundation (meets basic needs, competitive pricing)
- BETTER: Optimal value (recommended tier, best ROI, premium features)
- BEST: Future-proof premium (wow factor, maximum capability, executive appeal)

${personaDetection?.success ? `🎯 PRIMARY PERSONA: "${personaDetection.persona}" - Optimize all tiers for this detected persona` : '🎯 PERSONA ANALYSIS: Determine optimal persona from voice memo'}

${productRecommendations?.success ? `🚀 FOUNDATION: Use AI-recommended products as your tier foundation - they are intelligently pre-selected` : '🚀 PRODUCT SELECTION: Choose optimal products based on voice memo requirements'}

RESPOND WITH VALID JSON ONLY:
{
  "proposalName": "Professional proposal title showcasing value",
  "description": "Compelling description highlighting tier benefits and AI intelligence",
  "customerPersona": "${personaDetection?.success ? personaDetection.persona : 'detected_persona_name'}",
  "recommendedTier": "good|better|best",
  "detectedCustomerName": "name from voice memo or null",
  "detectedCustomerType": "residential|commercial",
  "detectedPropertyType": "specific property type",
  "personaConfidence": ${personaDetection?.confidence || 0.8},
  "personaDetectionMethod": "${personaDetection?.method || 'advanced-analysis'}",
  "tierValueProposition": {
    "good": "Value proposition for Good tier",
    "better": "Value proposition for Better tier (recommended)",
    "best": "Value proposition for Best tier"
  },
  "goodTierItems": [
    {
      "productId": "product_id_or_null",
      "name": "Product/Service name",
      "description": "Detailed item description with value focus",
      "category": "equipment|labor|materials|design|consulting|installation",
      "quantity": 1,
      "unitPrice": 100.00,
      "totalPrice": 100.00,
      "tierJustification": "Why this item is essential for Good tier"
    }
  ],
  "betterTierItems": [/* Include all Good tier + Better additions */],
  "bestTierItems": [/* Include all Better tier + Best additions */],
  "goodTierTotal": 0.00,
  "betterTierTotal": 0.00,
  "bestTierTotal": 0.00,
  "competitiveAdvantage": "How this proposal outperforms Portal.io and D-Tool",
  "upsellOpportunities": ["Future enhancement opportunity 1", "Future enhancement opportunity 2"]
}`;
    }

    /**
     * ENHANCED: Validate and optimize tier differentiation for competitive advantage
     */
    validateAndOptimizeTiers(proposalData, personaDetection, productRecommendations) {
        // Ensure progressive pricing
        if (proposalData.betterTierTotal <= proposalData.goodTierTotal) {
            console.warn('⚠️ Correcting tier pricing progression');
            proposalData.betterTierTotal = proposalData.goodTierTotal * 1.3;
        }
        
        if (proposalData.bestTierTotal <= proposalData.betterTierTotal) {
            console.warn('⚠️ Correcting tier pricing progression');
            proposalData.bestTierTotal = proposalData.betterTierTotal * 1.4;
        }

        // Ensure Better tier has more items than Good tier
        if (proposalData.betterTierItems.length <= proposalData.goodTierItems.length) {
            console.warn('⚠️ Better tier should have more items than Good tier');
        }

        // Ensure Best tier has premium positioning
        if (proposalData.bestTierTotal < 10000 && personaDetection?.persona !== 'builder') {
            console.log('📈 Optimizing Best tier for premium positioning');
            // Add margin for premium positioning
            proposalData.bestTierTotal = Math.max(proposalData.bestTierTotal, proposalData.betterTierTotal * 1.5);
        }

        // Add competitive differentiation if missing
        if (!proposalData.competitiveAdvantage) {
            proposalData.competitiveAdvantage = "Revolutionary voice-to-approval automation with AI persona targeting delivers complete proposals in 30 seconds vs competitors' manual outline generation";
        }

        console.log(`✅ Tier validation complete: Good ($${proposalData.goodTierTotal}) → Better ($${proposalData.betterTierTotal}) → Best ($${proposalData.bestTierTotal})`);
    }

    /**
     * ENHANCED: Extract specific requirements from voice transcript
     */
    extractSpecificRequirements(transcript) {
        const requirements = [];
        const lowerTranscript = transcript.toLowerCase();

        // Security requirements
        if (lowerTranscript.includes('security') || lowerTranscript.includes('camera') || lowerTranscript.includes('alarm')) {
            requirements.push('security');
        }

        // Lighting requirements
        if (lowerTranscript.includes('light') || lowerTranscript.includes('dimmer') || lowerTranscript.includes('automated lighting')) {
            requirements.push('lighting');
        }

        // Audio/Video requirements
        if (lowerTranscript.includes('audio') || lowerTranscript.includes('speaker') || lowerTranscript.includes('music') || lowerTranscript.includes('sound')) {
            requirements.push('audio-video');
        }

        // Climate requirements
        if (lowerTranscript.includes('temperature') || lowerTranscript.includes('thermostat') || lowerTranscript.includes('hvac') || lowerTranscript.includes('climate')) {
            requirements.push('climate');
        }

        // Networking requirements
        if (lowerTranscript.includes('wifi') || lowerTranscript.includes('network') || lowerTranscript.includes('internet') || lowerTranscript.includes('connectivity')) {
            requirements.push('networking');
        }

        return requirements;
    }

    /**
     * ENHANCED: Extract urgency indicators from voice transcript
     */
    extractUrgencyFromTranscript(transcript) {
        const lowerTranscript = transcript.toLowerCase();
        
        if (lowerTranscript.includes('urgent') || lowerTranscript.includes('asap') || lowerTranscript.includes('immediately')) {
            return 'high';
        }
        
        if (lowerTranscript.includes('soon') || lowerTranscript.includes('quickly') || lowerTranscript.includes('fast')) {
            return 'medium';
        }

        if (lowerTranscript.includes('when convenient') || lowerTranscript.includes('no rush') || lowerTranscript.includes('flexible timing')) {
            return 'low';
        }

        return 'medium'; // default
    }

    /**
     * Create AI proposal record in database with persona detection data
     */
    async createAIProposal(voiceRecordingId, proposalData, transcription, personaDetection = null) {
        return await prisma.aiProposal.create({
            data: {
                voiceRecordingId,
                promptUsed: transcription.substring(0, 1000), // Store first 1000 chars of transcription
                modelVersion: proposalData.modelVersion,
                processingTime: proposalData.processingTime,
                tokensUsed: proposalData.tokensUsed,
                proposalName: proposalData.proposalName,
                description: proposalData.description,
                customerPersona: proposalData.customerPersona,
                recommendedTier: proposalData.recommendedTier,
                detectedCustomerName: proposalData.detectedCustomerName,
                detectedCustomerType: proposalData.detectedCustomerType,
                detectedPropertyType: proposalData.detectedPropertyType,
                goodTierItems: JSON.stringify(proposalData.goodTierItems),
                betterTierItems: JSON.stringify(proposalData.betterTierItems),
                bestTierItems: JSON.stringify(proposalData.bestTierItems),
                goodTierTotal: proposalData.goodTierTotal,
                betterTierTotal: proposalData.betterTierTotal,
                bestTierTotal: proposalData.bestTierTotal
            }
        });
    }

    /**
     * Convert AI proposal to full proposal
     * @param {string} aiProposalId - AI proposal ID
     * @param {string} selectedTier - good|better|best
     * @param {string} customerId - Customer ID (optional)
     * @returns {Promise<Object>} Created proposal
     */
    async convertToProposal(aiProposalId, selectedTier, customerId = null) {
        const aiProposal = await prisma.aiProposal.findUnique({
            where: { id: aiProposalId },
            include: { voiceRecording: true }
        });

        if (!aiProposal) {
            throw new Error(`AI proposal not found: ${aiProposalId}`);
        }

        const tierItems = JSON.parse(aiProposal[`${selectedTier}TierItems`]);
        const tierTotal = aiProposal[`${selectedTier}TierTotal`];

        // Create proposal
        const proposal = await prisma.proposal.create({
            data: {
                name: aiProposal.proposalName,
                description: aiProposal.description,
                status: 'draft',
                customerPersona: aiProposal.customerPersona,
                totalAmount: tierTotal,
                isExistingCustomer: !!customerId,
                customerId: customerId,
                prospectName: !customerId ? aiProposal.detectedCustomerName : null,
                createdBy: aiProposal.voiceRecording.recordedBy
            }
        });

        // Create proposal items
        for (const item of tierItems) {
            await prisma.proposalItem.create({
                data: {
                    proposalId: proposal.id,
                    productId: item.productId,
                    name: item.name,
                    description: item.description,
                    category: item.category,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    totalPrice: item.totalPrice
                }
            });
        }

        // Update AI proposal
        await prisma.aiProposal.update({
            where: { id: aiProposalId },
            data: {
                convertedToProposal: true,
                finalProposalId: proposal.id
            }
        });

        return proposal;
    }

    /**
     * Extract budget information from voice transcript
     * @param {string} transcript - Voice transcript
     * @returns {number|null} Detected budget or null
     */
    extractBudgetFromTranscript(transcript) {
        const budgetPatterns = [
            /budget\s+(?:is\s+|of\s+)?\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,
            /\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s+budget/i,
            /around\s+\$?(\d{1,3}(?:,\d{3})*)/i,
            /about\s+\$?(\d{1,3}(?:,\d{3})*)/i,
            /up\s+to\s+\$?(\d{1,3}(?:,\d{3})*)/i,
            /(\d{1,3}(?:,\d{3})*)\s+(?:dollars?|k|thousand)/i
        ];

        for (const pattern of budgetPatterns) {
            const match = transcript.match(pattern);
            if (match) {
                let amount = parseFloat(match[1].replace(/,/g, ''));
                
                // Handle "k" or "thousand" multipliers
                if (transcript.toLowerCase().includes('k') || transcript.toLowerCase().includes('thousand')) {
                    if (amount < 1000) amount *= 1000;
                }
                
                // Return reasonable budget amounts (between $1k and $500k)
                if (amount >= 1000 && amount <= 500000) {
                    console.log(`💰 Extracted budget from transcript: $${amount.toLocaleString()}`);
                    return amount;
                }
            }
        }
        
        return null;
    }

    /**
     * Extract project size information from voice transcript
     * @param {string} transcript - Voice transcript
     * @returns {number|null} Detected project size in square feet or null
     */
    extractProjectSizeFromTranscript(transcript) {
        const sizePatterns = [
            /(\d{1,2}(?:,\d{3})*)\s+(?:square\s+)?(?:feet|ft|sq\.?\s*ft)/i,
            /(\d{1,2}(?:,\d{3})*)\s+sf/i,
            /(\d{1,2})\s*(?:x|\*|by)\s*(\d{1,2})\s*(?:feet|ft)/i, // length x width
            /(\d{1,2})\s+(?:bedroom|bed)/i, // bedrooms as size indicator
            /(\d{1,2})\s+(?:story|floor)/i // stories as size indicator
        ];

        for (let i = 0; i < sizePatterns.length; i++) {
            const pattern = sizePatterns[i];
            const match = transcript.match(pattern);
            
            if (match) {
                let size;
                
                if (i === 2) { // length x width pattern
                    size = parseInt(match[1]) * parseInt(match[2]);
                } else if (i === 3) { // bedroom count
                    const bedrooms = parseInt(match[1]);
                    size = bedrooms * 1200; // Estimate 1200 sq ft per bedroom
                } else if (i === 4) { // story count
                    const stories = parseInt(match[1]);
                    size = stories * 2000; // Estimate 2000 sq ft per story
                } else {
                    size = parseInt(match[1].replace(/,/g, ''));
                }
                
                // Return reasonable sizes (between 500 and 50,000 sq ft)
                if (size >= 500 && size <= 50000) {
                    console.log(`📐 Extracted project size from transcript: ${size.toLocaleString()} sq ft`);
                    return size;
                }
            }
        }
        
        return null;
    }
}

module.exports = AIVoiceService; 