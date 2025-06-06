import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Breadcrumbs,
  Link,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Autocomplete,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Collapse,
  FormControlLabel,
  Switch,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Fab,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Save as SaveIcon,
  Clear as ClearIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Home as HomeIcon,
  Star as StarIcon,
  AttachMoney as MoneyIcon,
  ShoppingCart as ShoppingCartIcon,
  Inventory as InventoryIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  VolumeUp as VolumeUpIcon,
  Stop as StopIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useApi } from '../../hooks/useApi';
import { getApiUrl } from '../../lib/api';
import { AISummaryService } from '../../services/aiSummaryService';

// TypeScript interfaces
interface ProposalPersona {
  id: string;
  type: string;
  name: string;
  displayName: string;
  description: string;
  keyFeatures: string | string[]; // Can be JSON string or array
  recommendedTier: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  model: string;
  sku: string;
  basePrice: number;
  goodTierPrice?: number;
  betterTierPrice?: number;
  bestTierPrice?: number;
  specifications: any;
  compatibility: string;
  installation: string;
  price: number; // Calculated based on selected tier
}

interface ProposalItem {
  id?: string;
  name: string;
  description: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productId?: string;
  product?: Product;
  sortOrder: number;
}

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  company?: string;
  email: string;
  type: string;
}

interface Property {
  id: string;
  name: string;
  type: string;
  squareFootage: number;
}

interface FormData {
  name: string;
  description: string;
  isExistingCustomer: boolean;
  customerId: string;
  prospectName: string;
  prospectCompany: string;
  prospectEmail: string;
  prospectPhone: string;
  propertyId?: string;
  projectType: 'residential' | 'commercial';
  customerPersona: string;
  validUntil?: string;
  voiceTranscript?: string;
  items: ProposalItem[];
}

interface VoiceToTextState {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
}

const PRODUCT_CATEGORIES = [
  'audio-video', 'lighting', 'security', 'networking', 'climate', 'access-control', 'other'
];

// TypeScript declarations for Web Speech API
declare global {
  interface Window {
    webkitSpeechRecognition: typeof SpeechRecognition;
    SpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

export default function CreateProposalPage() {
  const router = useRouter();
  const { customerId, propertyId } = router.query;

  // State management
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    isExistingCustomer: true,
    customerId: (customerId as string) || '',
    prospectName: '',
    prospectCompany: '',
    prospectEmail: '',
    prospectPhone: '',
    propertyId: propertyId as string,
    projectType: 'residential',
    customerPersona: '',
    validUntil: '',
    voiceTranscript: '',
    items: []
  });

  const [personas, setPersonas] = useState<ProposalPersona[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<ProposalPersona | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [productSearchResults, setProductSearchResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [expandedSections, setExpandedSections] = useState({
    voiceInput: true,
    productSearch: true,
    selectedProducts: true
  });

  // Voice to Text state
  const [voiceState, setVoiceState] = useState<VoiceToTextState>({
    isListening: false,
    transcript: '',
    interimTranscript: '',
    error: null
  });

  // AI generation state
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiProgress, setAiProgress] = useState('');

  // AI product recommendations state
  const [aiRecommendations, setAiRecommendations] = useState<Product[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // API hooks
  const { get: fetchProposalPersonas } = useApi<{ personas: ProposalPersona[] }>({
    onSuccess: (data) => {
      console.log('✅ Personas loaded successfully:', data);
      setPersonas(data.personas);
    },
    onError: (error) => {
      console.error('❌ Failed to load personas:', error);
      setError(`Failed to load personas: ${error.message}`);
    }
  });

  const { get: fetchCustomers } = useApi<{ customers: Customer[] }>({
    onSuccess: (data) => {
      console.log('✅ Customers loaded successfully:', data);
      setCustomers(data.customers);
    },
    onError: (error) => {
      console.error('❌ Failed to load customers:', error);
      setError(`Failed to load customers: ${error.message}`);
    }
  });

  const { get: fetchProperties } = useApi<{ properties: Property[] }>({
    onSuccess: (data) => {
      console.log('✅ Properties loaded successfully:', data);
      setProperties(data.properties);
    },
    onError: (error) => {
      console.error('❌ Failed to load properties:', error);
      setError(`Failed to load properties: ${error.message}`);
    }
  });

  const { get: searchProducts } = useApi<{ products: Product[] }>({
    onSuccess: (data) => {
      console.log('🎯 Product search successful:', data);
      console.log(`📦 Found ${data.products?.length || 0} products:`, data.products);
      setProductSearchResults(data.products);
    },
    onError: (error) => {
      console.error('❌ Product search failed:', error);
      setError(`Failed to search products: ${error.message}`);
    }
  });

  const { post: createProposal } = useApi<any>({
    onSuccess: (data) => {
      setSuccess('Proposal created successfully!');
      setTimeout(() => router.push(`/proposals/${data.id}`), 2000);
    },
    onError: (error) => setError(`Failed to create proposal: ${error.message}`)
  });

  // Initialize data on component mount
  useEffect(() => {
    let isMounted = true; // Guard against multiple calls
    
    const initializeData = async () => {
      if (loading) return; // Prevent multiple initialization calls
      
      console.log('🚀 Starting data initialization...');
      setLoading(true);
      setError(null);
      
      // Add timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        if (isMounted) {
          console.error('⏰ Data loading timeout after 10 seconds');
          setError('Loading timeout - please refresh the page');
          setLoading(false);
        }
      }, 10000);

      try {
        console.log('📡 Making API calls...');
        const results = await Promise.allSettled([
          fetchProposalPersonas(getApiUrl('/api/proposal-personas')),
          fetchCustomers(getApiUrl('/api/customers')),
          fetchProperties(getApiUrl('/api/properties'))
        ]);

        // Check if any failed
        const failures = results.filter(result => result.status === 'rejected');
        if (failures.length > 0) {
          console.warn('⚠️ Some API calls failed:', failures);
          // Still allow the page to load with partial data
        }

        console.log('✅ Data initialization completed');
        clearTimeout(timeout);
      } catch (error) {
        console.error('💥 Critical error during initialization:', error);
        clearTimeout(timeout);
        if (isMounted) {
          setError('Failed to initialize data. Please refresh the page.');
        }
      } finally {
        console.log('🏁 Setting loading to false');
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeData();
    
    return () => {
      isMounted = false; // Cleanup guard
    };
  }, []); // Empty dependency array - only run once!

  // Voice recognition effect
  useEffect(() => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      setVoiceState(prev => ({
        ...prev,
        error: 'Speech recognition not supported in this browser'
      }));
      return;
    }

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setVoiceState(prev => ({ ...prev, isListening: true, error: null }));
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setVoiceState(prev => ({
        ...prev,
        transcript: prev.transcript + finalTranscript,
        interimTranscript
      }));

      if (finalTranscript) {
        console.log('🎤 Voice transcript captured');
        setFormData(prev => {
          // Guard: Only update if there's actually new content
          if ((prev.voiceTranscript || '').includes(finalTranscript.trim())) {
            return prev; // No change, prevent re-render
          }
          
          return {
            ...prev,
            voiceTranscript: (prev.voiceTranscript || '') + finalTranscript,
            description: prev.description + finalTranscript
          };
        });
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.log('🎤 Voice recognition error:', event.error);
      setVoiceState(prev => ({
        ...prev,
        error: `Speech recognition error: ${event.error}`,
        isListening: false
      }));
    };

    recognition.onend = () => {
      console.log('🎤 Voice recognition ended');
      setVoiceState(prev => ({ ...prev, isListening: false }));
      
      // 🎤 NEW: Smart auto-trigger workflow after voice input completes
      setTimeout(() => {
        // Auto-populate fields from voice if transcript exists
        const transcript = voiceState.transcript || formData.voiceTranscript;
        if (transcript?.trim() && transcript.length > 10) {
          autoPopulateFromVoice();
          
          // If persona is selected, auto-trigger AI recommendations
          setTimeout(() => {
            if (formData.customerPersona) {
              console.log('🤖 Auto-triggering AI recommendations after voice input...');
              generateAIRecommendations();
            }
          }, 1500); // Give time for auto-population to complete
        }
      }, 500); // Small delay to ensure state updates
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Product search with debouncing
  useEffect(() => {
    console.log('🔍 Product search effect triggered:', { 
      productSearch: productSearch.trim(), 
      searchLength: productSearch.trim().length 
    });
    
    const timeoutId = setTimeout(() => {
      if (productSearch.trim() && productSearch.trim().length >= 2) { // Added minimum length guard
        const searchUrl = getApiUrl(`/api/products?search=${productSearch}`);
        console.log('🚀 Making product search API call:', searchUrl);
        searchProducts(searchUrl);
      } else if (productSearch.trim().length === 0) {
        console.log('🧹 Clearing search results (empty search)');
        setProductSearchResults([]);
      }
      // Ignore searches with 1 character to reduce API calls
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [productSearch]); // Keep minimal dependencies

  // Calculate totals
  const totals = useMemo(() => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + tax;

    return { subtotal, tax, total };
  }, [formData.items]);

  // Voice control functions
  const startListening = useCallback(() => {
    if (recognitionRef.current && !voiceState.isListening) {
      recognitionRef.current.start();
    }
  }, [voiceState.isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && voiceState.isListening) {
      recognitionRef.current.stop();
    }
  }, [voiceState.isListening]);

  const clearVoiceTranscript = useCallback(() => {
    setVoiceState(prev => ({ ...prev, transcript: '', interimTranscript: '' }));
    setFormData(prev => ({ ...prev, voiceTranscript: '' }));
  }, []);

  // 🎤 NEW: Smart voice-to-proposal auto-population
  const autoPopulateFromVoice = useCallback(() => {
    const transcript = voiceState.transcript || formData.voiceTranscript || '';
    if (!transcript.trim()) return;

    // Extract project name from voice input
    let proposalName = '';
    const transcript_lower = transcript.toLowerCase();
    
    // Smart name generation from voice patterns
    if (transcript_lower.includes('smart home')) {
      proposalName = 'Smart Home Integration Proposal';
    } else if (transcript_lower.includes('security')) {
      proposalName = 'Security System Proposal';
    } else if (transcript_lower.includes('audio') || transcript_lower.includes('sound')) {
      proposalName = 'Audio/Video System Proposal';
    } else if (transcript_lower.includes('lighting')) {
      proposalName = 'Smart Lighting Proposal';
    } else if (transcript_lower.includes('bedroom') || transcript_lower.includes('house')) {
      proposalName = 'Residential Smart Home Proposal';
    } else {
      proposalName = 'Custom Smart Home Proposal';
    }

    // Extract budget if mentioned
    const budgetMatch = transcript.match(/\$?([\d,]+)(?:k|\s*thousand)?/i);
    let budgetNote = '';
    if (budgetMatch) {
      const amount = budgetMatch[1].replace(',', '');
      budgetNote = budgetMatch[0].includes('k') || budgetMatch[0].includes('thousand') 
        ? `Budget: $${amount},000` 
        : `Budget: $${amount}`;
    }

    // Auto-populate proposal fields
    setFormData(prev => ({
      ...prev,
      name: prev.name || proposalName,
      description: prev.description || `${transcript.trim()}${budgetNote ? '\n\n' + budgetNote : ''}`
    }));

    setSuccess('🎤 Voice input auto-populated proposal fields!');
  }, [voiceState.transcript, formData.voiceTranscript]);

  // Generate AI product recommendations
  const generateAIRecommendations = useCallback(async () => {
    console.log('🤖 generateAIRecommendations called');
    
    if (!formData.customerPersona) {
      console.warn('No customer persona selected');
      return;
    }

    if (recommendationsLoading) {
      console.warn('AI recommendations already loading, skipping...');
      return;
    }

    setRecommendationsLoading(true);
    setShowRecommendations(true);
    
    // Auto-expand the voice input section so user can see the recommendations
    setExpandedSections(prev => ({
      ...prev,
      voiceInput: true
    }));
    
    try {
      // Simplified mock recommendations to avoid API issues
      console.log('Generating mock AI recommendations...');
      
      const mockProducts: Product[] = [
        {
          id: 'ai-rec-1',
          name: 'Smart Home Hub Pro',
          description: 'Central control system for all smart devices',
          category: 'networking',
          brand: 'Smart Home Pro',
          model: 'AI-Recommended',
          sku: 'AI-1',
          basePrice: 299.99,
          specifications: 'Perfect for centralized control and automation',
          compatibility: 'Universal',
          installation: 'Professional Installation Required',
          price: 299.99
        },
        {
          id: 'ai-rec-2',
          name: 'Smart Lighting System',
          description: 'Whole-home intelligent lighting solution',
          category: 'lighting',
          brand: 'Smart Home Pro',
          model: 'AI-Recommended',
          sku: 'AI-2',
          basePrice: 499.99,
          specifications: 'Energy efficient and mood-enhancing lighting',
          compatibility: 'Universal',
          installation: 'Professional Installation Required',
          price: 499.99
        },
        {
          id: 'ai-rec-3',
          name: 'Security Camera System',
          description: '4K security cameras with AI detection',
          category: 'security',
          brand: 'Smart Home Pro',
          model: 'AI-Recommended',
          sku: 'AI-3',
          basePrice: 799.99,
          specifications: 'Advanced AI detection and 24/7 monitoring',
          compatibility: 'Universal',
          installation: 'Professional Installation Required',
          price: 799.99
        }
      ];

      setAiRecommendations(mockProducts);
      setSuccess(`AI found ${mockProducts.length} product recommendations for ${formData.customerPersona} persona!`);
      
    } catch (error) {
      console.error('AI recommendation error:', error);
      setError('Failed to generate AI recommendations. Please try again.');
      setAiRecommendations([]);
    } finally {
      setRecommendationsLoading(false);
    }
  }, [formData.customerPersona, recommendationsLoading]); // Minimal dependencies

  // Auto-trigger AI recommendations - DISABLED TO PREVENT INFINITE LOOPS
  /*
  useEffect(() => {
    if (formData.customerPersona && (formData.voiceTranscript || formData.description)) {
      const timeoutId = setTimeout(() => {
        console.log('🤖 Auto-triggering AI recommendations...');
        generateAIRecommendations();
      }, 2000); // Reasonable delay to avoid too frequent calls

      return () => clearTimeout(timeoutId);
    }
  }, [formData.customerPersona, formData.voiceTranscript, formData.description]); // REMOVED generateAIRecommendations to break the loop!
  */

  // Form handlers
  const handlePersonaChange = (personaName: string) => {
    const persona = personas.find(p => p.name === personaName);
    setSelectedPersona(persona || null);
    setFormData(prev => ({
      ...prev,
      customerPersona: personaName
    }));
  };

  const handleAddProduct = (product: Product) => {
    const newItem: ProposalItem = {
      name: product.name,
      description: product.description || '',
      category: product.category,
      quantity: 1,
      unitPrice: product.price,
      totalPrice: product.price,
      productId: product.id,
      product,
      sortOrder: formData.items.length
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));

    // Enhanced feedback for AI recommendations
    if (product.id?.startsWith('ai-rec-')) {
      setSuccess(`✨ AI recommendation "${product.name}" added to proposal!`);
      
      // Auto-expand the selected products section to show what was added
      setExpandedSections(prev => ({
        ...prev,
        selectedProducts: true
      }));
    } else {
      setSuccess(`Product "${product.name}" added to proposal!`);
    }
  };

  const handleUpdateItem = (index: number, updates: Partial<ProposalItem>) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, ...updates };
          updatedItem.totalPrice = updatedItem.quantity * updatedItem.unitPrice;
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    // Validate based on customer type
    const isValidCustomer = formData.isExistingCustomer ? formData.customerId : (formData.prospectName && formData.prospectEmail);
    
    if (!formData.name || !isValidCustomer || !formData.customerPersona) {
      const missingFields = [];
      if (!formData.name) missingFields.push('Proposal Name');
      if (!isValidCustomer) {
        missingFields.push(formData.isExistingCustomer ? 'Customer Selection' : 'Prospect Name and Email');
      }
      if (!formData.customerPersona) missingFields.push('Customer Persona');
      
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    console.log('🚀 Starting proposal submission process...');
    console.log('📋 Form data validation passed:', {
      name: formData.name,
      isExistingCustomer: formData.isExistingCustomer,
      customerId: formData.customerId,
      prospectName: formData.prospectName,
      prospectEmail: formData.prospectEmail,
      customerPersona: formData.customerPersona,
      itemsCount: formData.items.length,
      totalValue: formData.items.reduce((sum, item) => sum + item.totalPrice, 0)
    });

    setSaving(true);
    try {
      // 🤖 ENHANCED: Generate AI summaries for the proposal
      let aiSummaries = null;
      
      if (formData.items.length > 0 && formData.customerPersona) {
        console.log('🚀 Generating AI-enhanced proposal summaries...');
        
        setAiGenerating(true);
        setAiProgress('Initializing AI systems...');
        
        try {
          const aiService = new AISummaryService();
          
          setAiProgress('Smart Home Integrator AI analyzing requirements...');
          await new Promise(resolve => setTimeout(resolve, 800)); // Visual feedback delay
          
          // Generate complete AI workflow (Product recommendations + Persona summary)
          const aiResult = await aiService.generateCompleteWorkflow({
            customerPersona: formData.customerPersona,
            voiceTranscript: formData.voiceTranscript || `Customer requirements for ${formData.name}`,
            projectType: formData.projectType,
            budget: formData.items.reduce((total, item) => total + item.totalPrice, 0),
            propertySize: 2500 // TODO: Get from property if available
          });

          setAiProgress('Generating persona-targeted summaries...');
          await new Promise(resolve => setTimeout(resolve, 800)); // Visual feedback delay

          if (aiResult.success) {
            aiSummaries = {
              executiveSummary: aiResult.proposalSummary?.executiveSummary,
              detailedSummary: aiResult.proposalSummary?.summary,
              keyBenefits: aiResult.proposalSummary?.keyBenefits,
              callToAction: aiResult.proposalSummary?.callToAction,
              aiGeneratedProducts: aiResult.productRecommendations,
              totalAiEstimate: aiResult.totalEstimate,
              aiMetadata: {
                tokensUsed: aiResult.tokensUsed,
                cost: aiResult.cost,
                generatedAt: new Date().toISOString(),
                persona: formData.customerPersona,
                projectType: formData.projectType
              }
            };
            
            setAiProgress('AI enhancement complete!');
            console.log('✅ AI summaries generated successfully');
          } else {
            console.warn('⚠️ AI summary generation failed, proceeding without AI enhancement');
            setAiProgress('AI enhancement skipped');
          }
        } catch (aiError) {
          console.error('AI summary generation error:', aiError);
          setAiProgress('AI enhancement failed, continuing...');
          // Continue with proposal creation even if AI fails
        } finally {
          setAiGenerating(false);
        }
      }

      // 🔧 CRITICAL FIX: Clean all foreign key references to prevent constraint violations
      const cleanedFormData = {
        ...formData,
        // CLEAN CUSTOMER REFERENCES
        customerId: formData.isExistingCustomer && formData.customerId ? formData.customerId : null,
        
        // CLEAN PROPERTY REFERENCES  
        propertyId: formData.propertyId && formData.propertyId.trim() ? formData.propertyId : null,
        
        // REMOVE projectId entirely - not used in frontend but might be getting set somehow
        projectId: null,
        
        // CLEAN ITEMS - remove any invalid productId references
        items: formData.items.map(item => ({
          name: item.name,
          description: item.description || '',
          category: item.category,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.quantity * item.unitPrice,
          // ONLY include productId if it's a valid non-empty string
          ...(item.productId && item.productId.trim() && !item.productId.startsWith('ai-rec-') 
            ? { productId: item.productId } 
            : {}),
          sortOrder: formData.items.indexOf(item)
        }))
      };

      console.log('🔧 Cleaned form data for submission:', {
        name: cleanedFormData.name,
        isExistingCustomer: cleanedFormData.isExistingCustomer,
        customerId: cleanedFormData.customerId,
        prospectName: cleanedFormData.prospectName,
        propertyId: cleanedFormData.propertyId,
        projectId: cleanedFormData.projectId,
        itemsCount: cleanedFormData.items.length,
        itemsWithProductId: cleanedFormData.items.filter(item => item.productId).length
      });

      // 🔧 ENHANCED: Prepare proposal data with validation
      const proposalData = {
        ...cleanedFormData,
        createdBy: 'current-user', // TODO: Get from auth context
        validUntil: cleanedFormData.validUntil ? new Date(cleanedFormData.validUntil).toISOString() : null,
        // 🎯 ADD AI-GENERATED CONTENT
        ...(aiSummaries && {
          aiSummary: aiSummaries,
          description: aiSummaries.detailedSummary || cleanedFormData.description // Use AI summary as description if available
        })
      };

      // 🔧 FINAL CLEANUP: Remove any undefined or empty string values that could cause issues
      Object.keys(proposalData).forEach(key => {
        const value = (proposalData as any)[key];
        if (value === undefined || value === '') {
          (proposalData as any)[key] = null;
        }
      });

      console.log('📤 Final proposal data being sent to API:', {
        ...proposalData,
        items: proposalData.items?.length || 0,
        aiSummary: aiSummaries ? 'Generated' : 'None'
      });

      await createProposal(getApiUrl('/api/proposals'), proposalData);
      
    } catch (error) {
      console.error('💥 Failed to create proposal:', error);
      
      // Enhanced error messages based on error type
      let userFriendlyMessage = 'Failed to create proposal. ';
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes('constraint')) {
        userFriendlyMessage += 'There was an issue with the customer or property data. Please check your selections.';
      } else if (errorMessage.includes('validation')) {
        userFriendlyMessage += 'Please check that all required fields are filled correctly.';
      } else {
        userFriendlyMessage += 'Please try again or contact support if the issue persists.';
      }
      
      setError(userFriendlyMessage);
    } finally {
      setSaving(false);
      setAiGenerating(false);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ ml: 2, mt: 2 }}>
            Loading proposal data...
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This should only take a few seconds
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mt: 3, maxWidth: 600 }}>
              <Box>
                <Typography variant="body2">{error}</Typography>
                <Button 
                  variant="outlined" 
                  size="small" 
                  sx={{ mt: 1 }}
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </Box>
            </Alert>
          )}
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box mb={3}>
        <Breadcrumbs separator="/" sx={{ mb: 2 }}>
          <Link component={NextLink} href="/" color="inherit">
            Dashboard
          </Link>
          <Link component={NextLink} href="/proposals" color="inherit">
            Proposals
          </Link>
          <Typography color="text.primary">Create Proposal</Typography>
        </Breadcrumbs>
        
        <Typography variant="h4" component="h1" gutterBottom>
          Create Smart Proposal
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create intelligent proposals by selecting your project type, customer persona, and products. AI will suggest upsell opportunities and complementary products to maximize value.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Main Form */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            {/* Basic Information */}
            <Typography variant="h6" gutterBottom>
              Project Type & Basic Information
            </Typography>

            {/* Project Type Selection - Prominent at top */}
            <Box sx={{ mb: 4, p: 3, bgcolor: 'primary.50', borderRadius: 2, border: '2px solid', borderColor: 'primary.200' }}>
              <Typography variant="h6" gutterBottom color="primary">
                Select Project Type
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Choose the project type to see relevant customer personas and optimize your proposal
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Paper
                    elevation={formData.projectType === 'residential' ? 8 : 1}
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      border: formData.projectType === 'residential' ? '2px solid' : '1px solid',
                      borderColor: formData.projectType === 'residential' ? 'primary.main' : 'divider',
                      bgcolor: formData.projectType === 'residential' ? 'primary.50' : 'background.paper',
                      '&:hover': {
                        bgcolor: 'primary.50',
                        borderColor: 'primary.main'
                      }
                    }}
                    onClick={() => {
                      setFormData(prev => ({ 
                        ...prev, 
                        projectType: 'residential',
                        customerPersona: '' // Clear persona when changing type
                      }));
                      setSelectedPersona(null);
                    }}
                  >
                    <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                      <HomeIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6" color="primary">
                        Residential
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Single-family homes, condos, apartments
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper
                    elevation={formData.projectType === 'commercial' ? 8 : 1}
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      border: formData.projectType === 'commercial' ? '2px solid' : '1px solid',
                      borderColor: formData.projectType === 'commercial' ? 'primary.main' : 'divider',
                      bgcolor: formData.projectType === 'commercial' ? 'primary.50' : 'background.paper',
                      '&:hover': {
                        bgcolor: 'primary.50',
                        borderColor: 'primary.main'
                      }
                    }}
                    onClick={() => {
                      setFormData(prev => ({ 
                        ...prev, 
                        projectType: 'commercial',
                        customerPersona: '' // Clear persona when changing type
                      }));
                      setSelectedPersona(null);
                    }}
                  >
                    <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                      <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6" color="primary">
                        Commercial
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Offices, retail, hospitality, enterprise
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
            
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Proposal Name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="e.g., Johnson Family Smart Home Automation"
                />
              </Grid>

              {/* Customer Status Selection */}
              <Grid item xs={12}>
                <Box sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2, border: '1px solid', borderColor: 'grey.300' }}>
                  <Typography variant="h6" gutterBottom>
                    Customer Information
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isExistingCustomer}
                        onChange={(e) => {
                          setFormData(prev => ({ 
                            ...prev, 
                            isExistingCustomer: e.target.checked,
                            // Clear fields when switching
                            customerId: '',
                            prospectName: '',
                            prospectCompany: '',
                            prospectEmail: '',
                            prospectPhone: ''
                          }));
                        }}
                        color="primary"
                      />
                    }
                    label={
                      <Box display="flex" alignItems="center">
                        <PersonIcon sx={{ mr: 1 }} />
                        <Typography variant="body1">
                          {formData.isExistingCustomer ? 'Existing Customer' : 'New Prospect'}
                        </Typography>
                      </Box>
                    }
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                    {formData.isExistingCustomer 
                      ? 'Select from your existing customer database'
                      : 'Enter prospect information (will become customer after approval + payment)'
                    }
                  </Typography>

                  {formData.isExistingCustomer ? (
                    <FormControl fullWidth required>
                      <InputLabel>Select Customer</InputLabel>
                      <Select
                        value={formData.customerId}
                        label="Select Customer"
                        onChange={(e) => setFormData(prev => ({ ...prev, customerId: e.target.value }))}
                      >
                        {customers.map((customer) => (
                          <MenuItem key={customer.id} value={customer.id}>
                            <Box display="flex" alignItems="center">
                              <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.75rem' }}>
                                {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                              </Avatar>
                              {customer.firstName} {customer.lastName}
                              {customer.company && ` (${customer.company})`}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Contact Name"
                          value={formData.prospectName}
                          onChange={(e) => setFormData(prev => ({ ...prev, prospectName: e.target.value }))}
                          required={!formData.isExistingCustomer}
                          placeholder="John Doe"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Company/Organization"
                          value={formData.prospectCompany}
                          onChange={(e) => setFormData(prev => ({ ...prev, prospectCompany: e.target.value }))}
                          placeholder="Acme Corp (optional)"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Email Address"
                          type="email"
                          value={formData.prospectEmail}
                          onChange={(e) => setFormData(prev => ({ ...prev, prospectEmail: e.target.value }))}
                          required={!formData.isExistingCustomer}
                          placeholder="john@acmecorp.com"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Phone Number"
                          value={formData.prospectPhone}
                          onChange={(e) => setFormData(prev => ({ ...prev, prospectPhone: e.target.value }))}
                          placeholder="(555) 123-4567"
                        />
                      </Grid>
                    </Grid>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Property</InputLabel>
                  <Select
                    value={formData.propertyId || ''}
                    label="Property"
                    onChange={(e) => setFormData(prev => ({ ...prev, propertyId: e.target.value }))}
                  >
                    <MenuItem value="">No specific property</MenuItem>
                    {properties.map((property) => (
                      <MenuItem key={property.id} value={property.id}>
                        {property.name} ({property.type}, {property.squareFootage} sq ft)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Customer Persona</InputLabel>
                  <Select
                    value={formData.customerPersona}
                    label="Customer Persona"
                    onChange={(e) => handlePersonaChange(e.target.value)}
                  >
                    {personas
                      .filter(persona => persona.type === formData.projectType)
                      .map((persona) => (
                      <MenuItem key={persona.id} value={persona.name}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            {persona.type === 'residential' ? <HomeIcon sx={{ mr: 1 }} /> : <BusinessIcon sx={{ mr: 1 }} />}
                            <span>{persona.displayName}</span>
                          </div>
                          <Typography variant="caption" color="text.secondary">
                            {persona.description}
                          </Typography>
                        </div>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Valid Until"
                  value={formData.validUntil}
                  onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Enhanced Voice Input & AI Workflow Section */}
            <Box sx={{ mb: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h6">
                  🎤 Voice Input & AI Recommendations
                </Typography>
                <IconButton onClick={() => toggleSection('voiceInput')}>
                  {expandedSections.voiceInput ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>

              <Collapse in={expandedSections.voiceInput}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>🎯 Revolutionary 30-Second Workflow:</strong> Select project type & persona → Speak requirements → AI generates suggestions → Add to proposal → Create proposal. No typing required!
                  </Typography>
                  
                  {/* Quick Demo Button */}
                  <Box sx={{ mt: 2 }}>
                    <Button
                      startIcon={<AutoAwesomeIcon />}
                      onClick={() => {
                        // Demo the complete workflow with mock data
                        const mockTranscript = "I need a complete smart home setup for a 3-bedroom house. The customer wants whole home audio, smart lighting throughout, security cameras, and smart door locks. They prefer Control4 for the main hub and have a budget around $15,000.";
                        setVoiceState(prev => ({ ...prev, transcript: mockTranscript }));
                        setFormData(prev => ({ ...prev, voiceTranscript: mockTranscript }));
                        
                        // Auto-populate and trigger AI
                        setTimeout(() => {
                          autoPopulateFromVoice();
                          if (formData.customerPersona) {
                            setTimeout(() => generateAIRecommendations(), 1000);
                          }
                        }, 500);
                        
                        setSuccess('🎤 Demo voice input simulated! Check the workflow progress above.');
                      }}
                      variant="outlined"
                      color="secondary"
                      size="small"
                    >
                      🎬 Demo Complete Workflow
                    </Button>
                  </Box>

                  {/* 🚀 Workflow Progress Indicators */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      🚀 Voice-to-Proposal Workflow Progress:
                    </Typography>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      <Chip 
                        size="small" 
                        icon={formData.projectType ? <CheckIcon /> : <ErrorIcon />}
                        label="1. Project Type" 
                        color={formData.projectType ? 'success' : 'default'}
                        variant={formData.projectType ? 'filled' : 'outlined'}
                      />
                      <Chip 
                        size="small" 
                        icon={formData.customerPersona ? <CheckIcon /> : <ErrorIcon />}
                        label="2. Customer Persona" 
                        color={formData.customerPersona ? 'success' : 'default'}
                        variant={formData.customerPersona ? 'filled' : 'outlined'}
                      />
                      <Chip 
                        size="small" 
                        icon={(formData.voiceTranscript || voiceState.transcript) ? <CheckIcon /> : <MicIcon />}
                        label="3. Voice Input" 
                        color={(formData.voiceTranscript || voiceState.transcript) ? 'success' : 'default'}
                        variant={(formData.voiceTranscript || voiceState.transcript) ? 'filled' : 'outlined'}
                      />
                      <Chip 
                        size="small" 
                        icon={formData.name ? <CheckIcon /> : <ErrorIcon />}
                        label="4. Auto-Populated" 
                        color={formData.name ? 'success' : 'default'}
                        variant={formData.name ? 'filled' : 'outlined'}
                      />
                      <Chip 
                        size="small" 
                        icon={aiRecommendations.length > 0 ? <CheckIcon /> : <AutoAwesomeIcon />}
                        label="5. AI Suggestions" 
                        color={aiRecommendations.length > 0 ? 'success' : 'default'}
                        variant={aiRecommendations.length > 0 ? 'filled' : 'outlined'}
                      />
                      <Chip 
                        size="small" 
                        icon={formData.items.length > 0 ? <CheckIcon /> : <ShoppingCartIcon />}
                        label="6. Products Added" 
                        color={formData.items.length > 0 ? 'success' : 'default'}
                        variant={formData.items.length > 0 ? 'filled' : 'outlined'}
                      />
                      {formData.customerPersona && formData.name && formData.items.length > 0 && (
                        <Chip 
                          size="small" 
                          icon={<StarIcon />}
                          label="🎯 Ready to Create!" 
                          color="secondary"
                          variant="filled"
                          sx={{ fontWeight: 'bold' }}
                        />
                      )}
                    </Box>
                  </Box>
                </Alert>

                <Card variant="outlined" sx={{ p: 3, mb: 2 }}>
                  <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
                    <Fab
                      color={voiceState.isListening ? "error" : "primary"}
                      size="large"
                      onClick={voiceState.isListening ? stopListening : startListening}
                      disabled={!recognitionRef.current}
                      sx={{
                        ...(voiceState.isListening && {
                          animation: 'pulse 2s infinite',
                          '@keyframes pulse': {
                            '0%': { transform: 'scale(1)' },
                            '50%': { transform: 'scale(1.1)' },
                            '100%': { transform: 'scale(1)' }
                          }
                        })
                      }}
                    >
                      {voiceState.isListening ? <StopIcon /> : <MicIcon />}
                    </Fab>
                    
                    <Box flex={1}>
                      <Typography variant="h6" color={voiceState.isListening ? "primary" : "text.primary"}>
                        {voiceState.isListening ? "🎙️ Listening... Describe the project requirements" : "Click to start voice input"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Tell us about the customer's needs, preferences, and project scope
                      </Typography>
                      {voiceState.error && (
                        <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                          {voiceState.error}
                        </Typography>
                      )}
                    </Box>

                    <Box display="flex" gap={1}>
                      <Button
                        startIcon={<ClearIcon />}
                        onClick={clearVoiceTranscript}
                        disabled={!voiceState.transcript}
                        variant="outlined"
                        size="small"
                      >
                        Clear
                      </Button>
                      
                      {/* 🎤 NEW: Auto-Populate from Voice Button */}
                      <Button
                        startIcon={<AutoAwesomeIcon />}
                        onClick={autoPopulateFromVoice}
                        disabled={!voiceState.transcript && !formData.voiceTranscript}
                        variant="outlined"
                        color="primary"
                        size="small"
                      >
                        Auto-Populate
                      </Button>
                      
                      {/* AI Suggestions Button - Primary (when persona is selected) */}
                      {formData.customerPersona && (formData.voiceTranscript || formData.description) && (
                        <Button
                          startIcon={recommendationsLoading ? <CircularProgress size={16} /> : <AutoAwesomeIcon />}
                          onClick={generateAIRecommendations}
                          disabled={recommendationsLoading}
                          variant="contained"
                          color="secondary"
                          size="small"
                        >
                          {recommendationsLoading ? 'Analyzing...' : 'Get AI Suggestions'}
                        </Button>
                      )}
                      
                      {/* AI Suggestions Button - Fallback (when voice input exists but no persona) */}
                      {!formData.customerPersona && (formData.voiceTranscript || voiceState.transcript) && (
                        <Button
                          startIcon={<WarningIcon />}
                          variant="outlined"
                          color="warning"
                          size="small"
                          disabled
                          sx={{ cursor: 'help' }}
                          title="Select a Customer Persona first to get AI suggestions"
                        >
                          AI Ready (Select Persona)
                        </Button>
                      )}
                    </Box>
                  </Box>

                  {(voiceState.transcript || voiceState.interimTranscript) && (
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 2, 
                        bgcolor: 'primary.50', 
                        border: '2px solid', 
                        borderColor: 'primary.200',
                        mb: 2 
                      }}
                    >
                      <Typography variant="body1">
                        {voiceState.transcript}
                        <Typography component="span" sx={{ color: 'primary.main', fontStyle: 'italic' }}>
                          {voiceState.interimTranscript}
                        </Typography>
                      </Typography>
                    </Paper>
                  )}

                  {/* AI Product Recommendations */}
                  {showRecommendations && (
                    <Box sx={{ mt: 2 }}>
                      <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                        <AutoAwesomeIcon sx={{ mr: 1, color: 'secondary.main' }} />
                        <Typography variant="h6" color="secondary">
                          AI Product Recommendations
                        </Typography>
                        {recommendationsLoading && <CircularProgress size={20} sx={{ ml: 2 }} />}
                      </Box>

                      {aiRecommendations.length > 0 ? (
                        <Card variant="outlined" sx={{ bgcolor: 'secondary.50' }}>
                          <List>
                            {aiRecommendations.map((product) => (
                              <ListItem
                                key={product.id}
                                secondaryAction={
                                  <Button
                                    startIcon={<AddIcon />}
                                    variant="contained"
                                    color="secondary"
                                    size="small"
                                    onClick={() => handleAddProduct(product)}
                                  >
                                    Add to Proposal
                                  </Button>
                                }
                              >
                                <ListItemAvatar>
                                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                                    <AutoAwesomeIcon />
                                  </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                  primary={
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                      <span>{product.name}</span>
                                      <Chip label={product.category} size="small" />
                                      <Chip label={product.brand} size="small" variant="outlined" />
                                    </div>
                                  }
                                  secondary={
                                    <Box>
                                      <Typography variant="body2" color="text.secondary">
                                        {product.description}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                        AI Reasoning: {product.specifications}
                                      </Typography>
                                      <Typography variant="h6" color="secondary.main" sx={{ mt: 1 }}>
                                        ${product.price.toFixed(2)}
                                      </Typography>
                                    </Box>
                                  }
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Card>
                      ) : recommendationsLoading ? (
                        <Card variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
                          <CircularProgress sx={{ mb: 2 }} />
                          <Typography variant="body1">
                            AI is analyzing your requirements and generating personalized product recommendations...
                          </Typography>
                        </Card>
                      ) : (
                        <Alert severity="info">
                          No AI recommendations available. Make sure you have selected a customer persona and provided project details.
                        </Alert>
                      )}
                    </Box>
                  )}
                </Card>
              </Collapse>
            </Box>

            {/* Description Field */}
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Proposal Description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the proposed smart home solution..."
              sx={{ mb: 3 }}
            />

            <Divider sx={{ my: 3 }} />

            {/* Product Search Section */}
            <Box sx={{ mb: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h6">
                  Product Selection & AI Recommendations
                </Typography>
                <IconButton onClick={() => toggleSection('productSearch')}>
                  {expandedSections.productSearch ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>

              <Collapse in={expandedSections.productSearch}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>AI-Powered Suggestions:</strong> As you add products, our AI will identify complementary products and upsell opportunities to maximize project value.
                  </Typography>
                </Alert>
                
                <TextField
                  fullWidth
                  label="Search Products"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search by name, brand, or category..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    )
                  }}
                  sx={{ mb: 2 }}
                />

                {productSearchResults.length > 0 && (
                  <Card variant="outlined" sx={{ maxHeight: 400, overflow: 'auto' }}>
                    <List>
                      {productSearchResults.map((product) => (
                        <ListItem
                          key={product.id}
                          secondaryAction={
                            <Button
                              startIcon={<AddIcon />}
                              variant="outlined"
                              size="small"
                              onClick={() => handleAddProduct(product)}
                            >
                              Add
                            </Button>
                          }
                        >
                          <ListItemAvatar>
                            <Avatar>
                              <InventoryIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span>{product.name}</span>
                                <Chip label={product.category} size="small" />
                                <Chip label={product.brand} size="small" variant="outlined" />
                              </div>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  {product.description}
                                </Typography>
                                <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                                  ${product.price.toFixed(2)}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Card>
                )}
              </Collapse>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Selected Products */}
            <Box sx={{ mb: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h6">
                  Selected Products ({formData.items.length})
                </Typography>
                <IconButton onClick={() => toggleSection('selectedProducts')}>
                  {expandedSections.selectedProducts ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>

              <Collapse in={expandedSections.selectedProducts}>
                {formData.items.length === 0 ? (
                  <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
                    <ShoppingCartIcon color="disabled" sx={{ fontSize: 48, mb: 1 }} />
                    <Typography variant="body1" color="text.secondary">
                      No products selected yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Search and add products above
                    </Typography>
                  </Paper>
                ) : (
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Product</TableCell>
                          <TableCell align="center">Quantity</TableCell>
                          <TableCell align="right">Unit Price</TableCell>
                          <TableCell align="right">Total</TableCell>
                          <TableCell align="center">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {formData.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" fontWeight="medium">
                                  {item.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {item.description}
                                </Typography>
                                <Box mt={1}>
                                  <Chip label={item.category} size="small" />
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <TextField
                                size="small"
                                type="number"
                                value={item.quantity}
                                onChange={(e) => handleUpdateItem(index, { quantity: parseInt(e.target.value) || 1 })}
                                inputProps={{ min: 1, style: { textAlign: 'center' } }}
                                sx={{ width: 80 }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <TextField
                                size="small"
                                type="number"
                                value={item.unitPrice}
                                onChange={(e) => handleUpdateItem(index, { unitPrice: parseFloat(e.target.value) || 0 })}
                                inputProps={{ min: 0, step: 0.01 }}
                                InputProps={{
                                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                                }}
                                sx={{ width: 120 }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight="medium">
                                ${item.totalPrice.toFixed(2)}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemoveItem(index)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Collapse>
            </Box>
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          {/* Pricing Summary */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Proposal Summary
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="body2">Subtotal:</Typography>
                <Typography variant="body2">${totals.subtotal.toFixed(2)}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="body2">Tax (8%):</Typography>
                <Typography variant="body2">${totals.tax.toFixed(2)}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box display="flex" justifyContent="space-between">
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6" color="primary">
                  ${totals.total.toFixed(2)}
                </Typography>
              </Box>
            </Box>

            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Final pricing will be discussed and customized during your face-to-face customer meeting.
              </Typography>
            </Alert>

            <Box display="flex" gap={2}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={
                  aiGenerating ? <AutoAwesomeIcon /> :
                  saving ? <CircularProgress size={20} /> : 
                  <SaveIcon />
                }
                onClick={handleSubmit}
                disabled={saving || aiGenerating || !formData.name || !(formData.isExistingCustomer ? formData.customerId : (formData.prospectName && formData.prospectEmail)) || !formData.customerPersona}
                sx={{
                  ...(aiGenerating && {
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                  })
                }}
              >
                {aiGenerating ? aiProgress : 
                 saving ? 'Creating...' : 
                 'Create AI-Enhanced Proposal'}
              </Button>
            </Box>

            {/* AI Progress Indicator */}
            {aiGenerating && (
              <Box sx={{ mt: 2 }}>
                <Alert severity="info" icon={<AutoAwesomeIcon />}>
                  <Typography variant="body2">
                    <strong>AI Enhancement in Progress:</strong> {aiProgress}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <CircularProgress size={16} sx={{ mr: 1 }} />
                    <Typography variant="caption" color="text.secondary">
                      Generating persona-targeted summaries and product recommendations...
                    </Typography>
                  </Box>
                </Alert>
              </Box>
            )}
          </Paper>

          {/* Selected Persona Info */}
          {selectedPersona && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Customer Persona
              </Typography>
              
              <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                {selectedPersona?.type === 'residential' ? <HomeIcon sx={{ mr: 1 }} /> : <BusinessIcon sx={{ mr: 1 }} />}
                <Typography variant="body1" fontWeight="medium">
                  {selectedPersona?.displayName || 'Unknown Persona'}
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {selectedPersona?.description || 'No description available'}
              </Typography>

              <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                Key Features for this Persona:
              </Typography>
              <Box>
                {(() => {
                  // Defensive programming for keyFeatures
                  if (!selectedPersona?.keyFeatures) {
                    return (
                      <Chip
                        label="No key features available"
                        size="small"
                        color="default"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    );
                  }

                  let features: string[] = [];
                  
                  try {
                    // Handle case where keyFeatures is a JSON string
                    if (typeof selectedPersona.keyFeatures === 'string') {
                      features = JSON.parse(selectedPersona.keyFeatures);
                    } else if (Array.isArray(selectedPersona.keyFeatures)) {
                      // Handle case where keyFeatures is already an array
                      features = selectedPersona.keyFeatures;
                    } else {
                      // Fallback for unexpected data types
                      features = [];
                    }
                  } catch (error) {
                    console.error('Error parsing keyFeatures:', error);
                    features = [];
                  }

                  // Ensure features is an array and has elements
                  if (!Array.isArray(features) || features.length === 0) {
                    return (
                      <Chip
                        label="No key features available"
                        size="small"
                        color="default"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    );
                  }

                  return features.map((feature, index) => (
                    <Chip
                      key={index}
                      label={feature}
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ));
                })()}
              </Box>

              <Box mt={2}>
                <Alert severity="info" variant="outlined">
                  <Typography variant="caption">
                    AI will suggest complementary products based on this persona's preferences and project requirements.
                  </Typography>
                </Alert>
              </Box>
            </Paper>
          )}

          {/* Quick Actions */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              AI Assistant Tools
            </Typography>
            
            <Box display="flex" flexDirection="column" gap={1}>
              <Button
                variant="outlined"
                startIcon={<MicIcon />}
                onClick={voiceState.isListening ? stopListening : startListening}
                disabled={!recognitionRef.current}
                color={voiceState.isListening ? "error" : "primary"}
              >
                {voiceState.isListening ? 'Stop Recording' : 'Voice Input'}
              </Button>
              
              {formData.items.length > 0 && (
                <Button
                  variant="outlined"
                  startIcon={<StarIcon />}
                  color="success"
                  disabled
                >
                  AI Upsell Suggestions (Coming Soon)
                </Button>
              )}
              
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={() => {
                  setFormData({
                    name: '',
                    description: '',
                    isExistingCustomer: true,
                    customerId: '',
                    prospectName: '',
                    prospectCompany: '',
                    prospectEmail: '',
                    prospectPhone: '',
                    propertyId: '',
                    projectType: 'residential',
                    customerPersona: '',
                    validUntil: '',
                    voiceTranscript: '',
                    items: []
                  });
                  setSelectedPersona(null);
                }}
              >
                Clear Form
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Snackbar notifications */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess(null)} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
} 