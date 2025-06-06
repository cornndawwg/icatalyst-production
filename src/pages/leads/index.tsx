import React, { useState } from 'react';
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
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  Slider,
  Snackbar,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  Add as AddIcon,
  Campaign as CampaignIcon,
  Language as WebsiteIcon,
  LinkedIn as LinkedInIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  Apartment as ApartmentIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import CampaignWizard from '../../components/campaigns/CampaignWizard';

// Industry Partner mock data
const mockIndustryPartners = [
  {
    id: 1,
    name: "Sarah Chen",
    title: "Principal Interior Designer",
    company: "Luxury Living Design Studio",
    vertical: "Interior Designers",
    email: "sarah@luxurylivingdesign.com",
    phone: "(555) 234-5678",
    website: "luxurylivingdesign.com",
    linkedin: "linkedin.com/in/sarahchen-design",
    address: "Beverly Hills, CA 90210",
    specialties: ["High-End Residential", "New Construction", "Smart Home Ready"],
    serviceFocus: "Luxury/High-End",
    projectTypes: "Custom/Luxury Homes",
    yearsInBusiness: "Experienced (8-15 years)",
    companyType: "Small Team (2-10)",
    certifications: ["NCIDQ", "LEED AP"],
    geographicCoverage: "Los Angeles Metro Area",
    leadScore: 96,
    lastActivity: "2024-01-15",
    businessDescription: "Excellent Fit: High-end focus + smart home expertise + premium market + local coverage"
  },
  {
    id: 2,
    name: "Marcus Thompson",
    title: "Founding Architect",
    company: "Thompson + Associates Architecture",
    vertical: "Architects",
    email: "marcus@thompsonarch.com",
    phone: "(555) 345-6789",
    website: "thompsonarch.com",
    linkedin: "linkedin.com/in/marcusthompson-arch",
    address: "Manhattan Beach, CA 90266",
    specialties: ["Mixed Residential/Commercial", "New Construction", "Tech Integration"],
    serviceFocus: "Mixed Residential/Commercial",
    projectTypes: "New Construction",
    yearsInBusiness: "Veteran (15+ years)",
    companyType: "Medium Firm (11-25)",
    certifications: ["AIA", "LEED AP BD+C", "NCARB"],
    geographicCoverage: "Southern California",
    leadScore: 94,
    lastActivity: "2024-01-12",
    businessDescription: "Excellent Fit: Tech integration focus + established firm + new construction + regional reach"
  },
  {
    id: 3,
    name: "Jennifer Rodriguez",
    title: "Custom Home Builder",
    company: "Rodriguez Premier Homes",
    vertical: "Custom Home Builders",
    email: "jennifer@rodriguezpremier.com",
    phone: "(555) 456-7890",
    website: "rodriguezpremier.com",
    linkedin: "linkedin.com/in/jrodriguez-builder",
    address: "Newport Beach, CA 92660",
    specialties: ["High-End Residential", "New Construction", "Large Company"],
    serviceFocus: "Residential Only",
    projectTypes: "Custom/Luxury Homes",
    yearsInBusiness: "Experienced (8-15 years)",
    companyType: "Large Firm (25+)",
    certifications: ["CGP", "CAPS", "Green Building"],
    geographicCoverage: "Orange County",
    leadScore: 92,
    lastActivity: "2024-01-10",
    businessDescription: "Excellent Fit: Custom luxury homes + large capacity + high-end market + stable operation"
  },
  {
    id: 4,
    name: "David Kim",
    title: "Luxury Real Estate Advisor",
    company: "Platinum Properties Group",
    vertical: "Real Estate Agents",
    email: "david@platinumproperties.com",
    phone: "(555) 567-8901",
    website: "platinumproperties.com",
    linkedin: "linkedin.com/in/davidkim-luxury",
    address: "Bel Air, CA 90077",
    specialties: ["High-End Residential", "Luxury Market", "Tech Properties"],
    serviceFocus: "Luxury/High-End",
    projectTypes: "Mixed Projects",
    yearsInBusiness: "Veteran (15+ years)",
    companyType: "Small Team (2-10)",
    certifications: ["Luxury Home Marketing", "CRS", "GRI"],
    geographicCoverage: "Greater Los Angeles",
    leadScore: 90,
    lastActivity: "2024-01-14",
    businessDescription: "Excellent Fit: Luxury specialist + tech property focus + premium clientele + local market"
  },
  {
    id: 5,
    name: "Amanda Foster",
    title: "Senior Interior Designer",
    company: "Foster & Associates Design",
    vertical: "Interior Designers",
    email: "amanda@fosterdesign.com",
    phone: "(555) 678-9012",
    website: "fosterdesign.com",
    linkedin: "linkedin.com/in/amandafoster-design",
    address: "Santa Monica, CA 90401",
    specialties: ["Mid-Market Residential", "Renovation/Remodel", "Small Company"],
    serviceFocus: "Residential Only",
    projectTypes: "Renovations/Remodels",
    yearsInBusiness: "Established (3-7 years)",
    companyType: "Small Team (2-10)",
    certifications: ["NCIDQ", "Wellness Design"],
    geographicCoverage: "West Los Angeles",
    leadScore: 88,
    lastActivity: "2024-01-09",
    businessDescription: "Good Fit: Growing firm + residential focus + renovation expertise + good location"
  },
  {
    id: 6,
    name: "Michael Chen",
    title: "Lead Architect",
    company: "Urban Design Collective",
    vertical: "Architects",
    email: "michael@urbandesigncollective.com",
    phone: "(555) 789-0123",
    website: "urbandesigncollective.com",
    linkedin: "linkedin.com/in/michaelchen-architect",
    address: "Pasadena, CA 91101",
    specialties: ["Commercial Focus", "New Construction", "Mid-Size Firm"],
    serviceFocus: "Commercial Only",
    projectTypes: "New Construction",
    yearsInBusiness: "Established (3-7 years)",
    companyType: "Medium Firm (11-25)",
    certifications: ["AIA", "LEED AP"],
    geographicCoverage: "San Gabriel Valley",
    leadScore: 74,
    lastActivity: "2024-01-08",
    businessDescription: "Potential Fit: Commercial focus limits residential referrals but growing firm with tech interest"
  },
  {
    id: 7,
    name: "Lisa Wang",
    title: "Residential Builder",
    company: "Wang Construction",
    vertical: "Custom Home Builders",
    email: "lisa@wangconstruction.com",
    phone: "(555) 890-1234",
    website: "wangconstruction.com",
    linkedin: "linkedin.com/in/lisawang-builder",
    address: "Irvine, CA 92602",
    specialties: ["Mid-Market Residential", "Renovation/Remodel", "Small Company"],
    serviceFocus: "Residential Only",
    projectTypes: "Renovations/Remodels",
    yearsInBusiness: "Established (3-7 years)",
    companyType: "Small Team (2-10)",
    certifications: ["CGP", "Green Building"],
    geographicCoverage: "South Orange County",
    leadScore: 82,
    lastActivity: "2024-01-07",
    businessDescription: "Good Fit: Residential renovations + growing market presence + smart home retrofit potential"
  }
];

// Commercial properties mock data (existing)
const mockCommercialProperties = [
  {
    id: 1,
    businessName: "Green Valley Estates",
    contactName: "Sarah Johnson",
    title: "Property Manager",
    email: "sarah.johnson@greenvalley.com",
    phone: "(555) 123-4567",
    address: "1234 Oak Street, Riverside, CA 92501",
    propertyType: "Apartment Complex",
    units: 150,
    estimated_value: "$2.5M",
    score: 95,
    source: "Commercial Directory",
    lastUpdated: "2024-01-15"
  },
  {
    id: 2,
    businessName: "Sunset Residential Group",
    contactName: "Michael Chen",
    title: "Operations Director",
    email: "m.chen@sunsetres.com",
    phone: "(555) 234-5678",
    address: "5678 Pine Avenue, Riverside, CA 92502",
    propertyType: "Single Family Homes",
    units: 75,
    estimated_value: "$1.8M",
    score: 88,
    source: "Web Scraping",
    lastUpdated: "2024-01-14"
  },
  {
    id: 3,
    businessName: "Riverside Business Park",
    contactName: "Jennifer Martinez",
    title: "Facilities Manager",
    email: "j.martinez@rbpark.com",
    phone: "(555) 345-6789",
    address: "9012 Business Blvd, Riverside, CA 92503",
    propertyType: "Commercial Office",
    units: 25,
    estimated_value: "$3.2M",
    score: 92,
    source: "Public Records",
    lastUpdated: "2024-01-13"
  },
  {
    id: 4,
    businessName: "Heritage Senior Living",
    contactName: "Robert Williams",
    title: "General Manager",
    email: "r.williams@heritagesl.com",
    phone: "(555) 456-7890",
    address: "3456 Elder Lane, Riverside, CA 92504",
    propertyType: "Senior Housing",
    units: 120,
    estimated_value: "$4.1M",
    score: 96,
    source: "Industry Database",
    lastUpdated: "2024-01-12"
  },
  {
    id: 5,
    businessName: "University Heights Apartments",
    contactName: "Amanda Davis",
    title: "Leasing Director",
    email: "a.davis@uhappartments.com",
    phone: "(555) 567-8901",
    address: "7890 University Drive, Riverside, CA 92505",
    propertyType: "Student Housing",
    units: 200,
    estimated_value: "$3.8M",
    score: 85,
    source: "Social Media",
    lastUpdated: "2024-01-11"
  }
];

const mockCampaigns = [
  { id: 1, name: "Q1 Property Managers Outreach", status: "Active" },
  { id: 2, name: "Commercial Real Estate Campaign", status: "Active" },
  { id: 3, name: "Smart Home Solutions Newsletter", status: "Draft" },
];

export default function LeadsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0); // 0 = Industry Partners, 1 = Commercial Properties
  
  // Industry Partner Search Filters
  const [partnerFilters, setPartnerFilters] = useState({
    vertical: 'All Verticals',
    zipCode: '90210',
    radius: 25,
    companyType: 'All Company Types',
    yearsInBusiness: 'All Experience Levels',
    serviceFocus: 'All Service Types',
    projectTypes: 'All Project Types',
    certifications: 'All Certifications'
  });

  // Commercial Property Search Filters (existing)
  const [commercialFilters, setCommercialFilters] = useState({
    location: 'Riverside, CA',
    radius: 25,
    propertyType: 'All Types',
    minUnits: 10,
    maxUnits: 500,
    industry: 'Real Estate'
  });
  
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [filteredResults, setFilteredResults] = useState<any[]>([]);
  const [campaignWizardOpen, setCampaignWizardOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleSearch = async () => {
    setIsSearching(true);
    setSelectedLeads([]); // Clear selections when searching
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Apply actual filtering logic
    if (activeTab === 0) {
      // Industry Partners filtering
      let filtered = mockIndustryPartners.filter(partner => {
        // Filter by vertical (required)
        if (partnerFilters.vertical !== 'All Verticals' && partner.vertical !== partnerFilters.vertical) {
          return false;
        }
        
        // Filter by company type
        if (partnerFilters.companyType !== 'All Company Types') {
          if (partnerFilters.companyType === 'Solo Practice' && partner.companyType !== 'Solo Practice (1 person)') return false;
          if (partnerFilters.companyType === 'Small Team' && partner.companyType !== 'Small Team (2-10)') return false;
          if (partnerFilters.companyType === 'Medium Firm' && partner.companyType !== 'Medium Firm (11-25)') return false;
          if (partnerFilters.companyType === 'Large Firm' && partner.companyType !== 'Large Firm (25+)') return false;
        }
        
        // Filter by years in business
        if (partnerFilters.yearsInBusiness !== 'All Experience Levels' && partner.yearsInBusiness !== partnerFilters.yearsInBusiness) {
          return false;
        }
        
        // Filter by service focus
        if (partnerFilters.serviceFocus !== 'All Service Types' && partner.serviceFocus !== partnerFilters.serviceFocus) {
          return false;
        }
        
        // Filter by project types
        if (partnerFilters.projectTypes !== 'All Project Types' && partner.projectTypes !== partnerFilters.projectTypes) {
          return false;
        }
        
        // Basic zip code proximity filter (simplified - in real app would use geolocation API)
        if (partnerFilters.zipCode && partnerFilters.zipCode.length === 5) {
          // Simple proximity check based on first 3 digits of zip code for demo
          const searchZip = partnerFilters.zipCode.substring(0, 3);
          const partnerZip = partner.address.match(/\d{5}/)?.[0]?.substring(0, 3);
          
          // For demo: if radius is 25+ miles, allow different zip prefix; if less, require same prefix
          if (partnerFilters.radius < 25 && searchZip !== partnerZip) {
            return false;
          }
        }
        
        return true;
      });
      
      setFilteredResults(filtered);
    } else {
      // Commercial Properties filtering (existing logic)
      setFilteredResults(mockCommercialProperties);
    }
    
    setIsSearching(false);
    setShowResults(true);
  };

  const handleSelectLead = (leadId: number) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const handleSelectAll = () => {
    const currentLeads = activeTab === 0 ? filteredResults : filteredResults;
    setSelectedLeads(
      selectedLeads.length === currentLeads.length 
        ? [] 
        : currentLeads.map(lead => lead.id)
    );
  };

  const handleAddToCampaign = () => {
    if (selectedLeads.length === 0) return;
    setCampaignWizardOpen(true);
  };

  const handleCampaignCreated = (campaignData: any) => {
    setSelectedLeads([]);
    setSuccessMessage(`Campaign "${campaignData.name}" created with ${selectedLeads.length} leads!`);
    // Optionally redirect to campaigns page
    setTimeout(() => {
      router.push('/campaigns');
    }, 2000);
  };

  const getSelectedLeadsData = () => {
    const currentLeads = activeTab === 0 ? filteredResults : filteredResults;
    return currentLeads.filter(lead => selectedLeads.includes(lead.id));
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'success';
    if (score >= 80) return 'warning';
    if (score >= 70) return 'info';
    return 'error';
  };

  const getPartnershipFit = (score: number) => {
    if (score >= 90) return 'Excellent Fit';
    if (score >= 80) return 'Good Fit';
    if (score >= 70) return 'Potential Fit';
    if (score >= 60) return 'Poor Fit';
    return 'Not Recommended';
  };

  const handleExportClick = () => {
    setUpgradeModalOpen(true);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={NextLink} href="/" color="inherit" underline="hover">
          Dashboard
        </Link>
        <Typography color="text.primary">Lead Generation</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Smart Home Industry Lead Generation
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Connect with industry professionals and commercial properties using AI-powered search
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportClick}>
            Export (Pro Feature)
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            disabled={selectedLeads.length === 0}
            onClick={handleAddToCampaign}
          >
            Add to Campaign ({selectedLeads.length})
          </Button>
        </Box>
      </Box>

      {/* Dual Search Mode Tabs */}
      <Paper sx={{ mb: 4 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => {
            setActiveTab(newValue);
            setSelectedLeads([]); // Clear selection when switching tabs
            setShowResults(false); // Reset results
          }}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            icon={<PersonIcon />} 
            label="Industry Partners" 
            iconPosition="start"
            sx={{ minHeight: 64, fontSize: '1rem' }}
          />
          <Tab 
            icon={<ApartmentIcon />} 
            label="Commercial Properties" 
            iconPosition="start"
            sx={{ minHeight: 64, fontSize: '1rem' }}
          />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {activeTab === 0 ? (
            // Industry Partner Search Interface
            <Box>
              <Typography variant="h6" gutterBottom>
                🎯 Find Industry Partners & Referral Sources
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Search for Interior Designers, Architects, Custom Home Builders, and Real Estate Agents who work on high-end smart home projects
              </Typography>
              <Typography variant="body2" color="primary.main" sx={{ mb: 3 }}>
                🤖 <strong>AI-Verified Data:</strong> Professional categories and specialties verified through portfolio analysis, website content, and public business data with 90%+ accuracy
              </Typography>
              
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Professional Vertical</InputLabel>
                    <Select
                      value={partnerFilters.vertical}
                      label="Professional Vertical"
                      onChange={(e) => setPartnerFilters(prev => ({ ...prev, vertical: e.target.value }))}
                    >
                      <MenuItem value="All Verticals">All Verticals</MenuItem>
                      <MenuItem value="Interior Designers">Interior Designers</MenuItem>
                      <MenuItem value="Architects">Architects</MenuItem>
                      <MenuItem value="Custom Home Builders">Custom Home Builders</MenuItem>
                      <MenuItem value="Real Estate Agents">Real Estate Agents</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Zip Code"
                    value={partnerFilters.zipCode}
                    onChange={(e) => setPartnerFilters(prev => ({ ...prev, zipCode: e.target.value }))}
                    placeholder="e.g., 90210"
                    inputProps={{ maxLength: 5, pattern: '[0-9]*' }}
                    helperText="Enter 5-digit zip code for location search"
                  />
                </Grid>
                
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth>
                    <InputLabel>Search Radius</InputLabel>
                    <Select
                      value={partnerFilters.radius}
                      label="Search Radius"
                      onChange={(e) => setPartnerFilters(prev => ({ ...prev, radius: e.target.value as number }))}
                    >
                      <MenuItem value={10}>10 miles</MenuItem>
                      <MenuItem value={25}>25 miles</MenuItem>
                      <MenuItem value={50}>50 miles</MenuItem>
                      <MenuItem value={75}>75 miles</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Company Type</InputLabel>
                    <Select
                      value={partnerFilters.companyType}
                      label="Company Type"
                      onChange={(e) => setPartnerFilters(prev => ({ ...prev, companyType: e.target.value }))}
                    >
                      <MenuItem value="All Company Types">All Company Types</MenuItem>
                      <MenuItem value="Solo Practice">Solo Practice (1 person)</MenuItem>
                      <MenuItem value="Small Team">Small Team (2-10)</MenuItem>
                      <MenuItem value="Medium Firm">Medium Firm (11-25)</MenuItem>
                      <MenuItem value="Large Firm">Large Firm (25+)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Years in Business</InputLabel>
                    <Select
                      value={partnerFilters.yearsInBusiness}
                      label="Years in Business"
                      onChange={(e) => setPartnerFilters(prev => ({ ...prev, yearsInBusiness: e.target.value }))}
                    >
                      <MenuItem value="All Experience Levels">All Experience Levels</MenuItem>
                      <MenuItem value="New Practice (0-2 years)">New Practice (0-2 years)</MenuItem>
                      <MenuItem value="Established (3-7 years)">Established (3-7 years)</MenuItem>
                      <MenuItem value="Experienced (8-15 years)">Experienced (8-15 years)</MenuItem>
                      <MenuItem value="Veteran (15+ years)">Veteran (15+ years)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Service Focus</InputLabel>
                    <Select
                      value={partnerFilters.serviceFocus}
                      label="Service Focus"
                      onChange={(e) => setPartnerFilters(prev => ({ ...prev, serviceFocus: e.target.value }))}
                    >
                      <MenuItem value="All Service Types">All Service Types</MenuItem>
                      <MenuItem value="Residential Only">Residential Only</MenuItem>
                      <MenuItem value="Commercial Only">Commercial Only</MenuItem>
                      <MenuItem value="Mixed Residential/Commercial">Mixed Residential/Commercial</MenuItem>
                      <MenuItem value="Luxury/High-End">Luxury/High-End</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Project Types</InputLabel>
                    <Select
                      value={partnerFilters.projectTypes}
                      label="Project Types"
                      onChange={(e) => setPartnerFilters(prev => ({ ...prev, projectTypes: e.target.value }))}
                    >
                      <MenuItem value="All Project Types">All Project Types</MenuItem>
                      <MenuItem value="New Construction">New Construction</MenuItem>
                      <MenuItem value="Renovations/Remodels">Renovations/Remodels</MenuItem>
                      <MenuItem value="Mixed Projects">Mixed Projects</MenuItem>
                      <MenuItem value="Custom/Luxury Homes">Custom/Luxury Homes</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Certifications</InputLabel>
                    <Select
                      value={partnerFilters.certifications}
                      label="Certifications"
                      onChange={(e) => setPartnerFilters(prev => ({ ...prev, certifications: e.target.value }))}
                    >
                      <MenuItem value="All Certifications">All Certifications</MenuItem>
                      <MenuItem value="LEED Certified">LEED Certified</MenuItem>
                      <MenuItem value="NCIDQ Certified">NCIDQ Certified</MenuItem>
                      <MenuItem value="AIA Member">AIA Member</MenuItem>
                      <MenuItem value="ASID Member">ASID Member</MenuItem>
                      <MenuItem value="Multiple Certifications">Multiple Certifications</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<SearchIcon />}
                  onClick={handleSearch}
                  disabled={isSearching}
                >
                  {isSearching ? 'Searching Directory...' : 'Search Industry Partners'}
                </Button>
                <Button variant="outlined" startIcon={<FilterIcon />}>
                  Advanced Filters
                </Button>
              </Box>
            </Box>
          ) : (
            // Commercial Property Search Interface (existing)
            <Box>
              <Typography variant="h6" gutterBottom>
                🏢 Target Commercial Property Search
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Find multi-unit properties and commercial facilities for bulk smart home installations
              </Typography>
              
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Location"
                    value={commercialFilters.location}
                    onChange={(e) => setCommercialFilters(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="City, State or ZIP"
                    InputProps={{
                      startAdornment: <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth>
                    <InputLabel>Radius</InputLabel>
                    <Select
                      value={commercialFilters.radius}
                      label="Radius"
                      onChange={(e) => setCommercialFilters(prev => ({ ...prev, radius: e.target.value as number }))}
                    >
                      <MenuItem value={5}>5 miles</MenuItem>
                      <MenuItem value={10}>10 miles</MenuItem>
                      <MenuItem value={25}>25 miles</MenuItem>
                      <MenuItem value={50}>50 miles</MenuItem>
                      <MenuItem value={100}>100 miles</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Property Type</InputLabel>
                    <Select
                      value={commercialFilters.propertyType}
                      label="Property Type"
                      onChange={(e) => setCommercialFilters(prev => ({ ...prev, propertyType: e.target.value }))}
                    >
                      <MenuItem value="All Types">All Property Types</MenuItem>
                      <MenuItem value="Apartment Complex">Apartment Complex</MenuItem>
                      <MenuItem value="Single Family Homes">Single Family Homes</MenuItem>
                      <MenuItem value="Commercial Office">Commercial Office</MenuItem>
                      <MenuItem value="Senior Housing">Senior Housing</MenuItem>
                      <MenuItem value="Student Housing">Student Housing</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Industry</InputLabel>
                    <Select
                      value={commercialFilters.industry}
                      label="Industry"
                      onChange={(e) => setCommercialFilters(prev => ({ ...prev, industry: e.target.value }))}
                    >
                      <MenuItem value="Real Estate">Real Estate</MenuItem>
                      <MenuItem value="Property Management">Property Management</MenuItem>
                      <MenuItem value="Construction">Construction</MenuItem>
                      <MenuItem value="Hospitality">Hospitality</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Typography gutterBottom>Property Size (Units): {commercialFilters.minUnits} - {commercialFilters.maxUnits}</Typography>
                  <Slider
                    value={[commercialFilters.minUnits, commercialFilters.maxUnits]}
                    onChange={(_, newValue) => {
                      const [min, max] = newValue as number[];
                      setCommercialFilters(prev => ({ ...prev, minUnits: min, maxUnits: max }));
                    }}
                    valueLabelDisplay="auto"
                    min={1}
                    max={1000}
                    marks={[
                      { value: 1, label: '1' },
                      { value: 50, label: '50' },
                      { value: 100, label: '100' },
                      { value: 500, label: '500' },
                      { value: 1000, label: '1000+' }
                    ]}
                  />
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<SearchIcon />}
                  onClick={handleSearch}
                  disabled={isSearching}
                >
                  {isSearching ? 'Searching...' : 'Search Commercial Properties'}
                </Button>
                <Button variant="outlined" startIcon={<FilterIcon />}>
                  Advanced Filters
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Loading State */}
      {isSearching && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <SearchIcon sx={{ mr: 1 }} />
            <Typography variant="h6">
              {activeTab === 0 ? 'Searching Industry Partner Directory...' : 'Searching Commercial Properties...'}
            </Typography>
          </Box>
          <LinearProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {activeTab === 0 
              ? 'Analyzing professional networks and project portfolios...'
              : 'Analyzing property databases and business intelligence...'
            }
          </Typography>
        </Paper>
      )}

      {/* Search Results */}
      {showResults && !isSearching && (
        <Paper sx={{ mb: 4 }}>
          <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6">
                  {activeTab === 0 ? 'Industry Partner Results' : 'Commercial Property Results'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {activeTab === 0 
                    ? `Found ${filteredResults.length} qualified industry professionals`
                    : `Found ${filteredResults.length} commercial properties matching your criteria`
                  }
                  {activeTab === 0 && partnerFilters.vertical !== 'All Verticals' && (
                    <span> • Filtered by: {partnerFilters.vertical}</span>
                  )}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleSelectAll}
                >
                  {selectedLeads.length === filteredResults.length && filteredResults.length > 0
                    ? 'Deselect All' 
                    : 'Select All'
                  }
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleAddToCampaign}
                  disabled={selectedLeads.length === 0}
                >
                  Add {selectedLeads.length} to Campaign
                </Button>
                {selectedLeads.length > 0 && (
                  <Button
                    variant="text"
                    size="small"
                    onClick={handleExportClick}
                    sx={{ color: 'primary.main', textDecoration: 'underline' }}
                  >
                    Export Selected (Pro)
                  </Button>
                )}
              </Box>
            </Box>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedLeads.length === filteredResults.length && filteredResults.length > 0}
                      indeterminate={selectedLeads.length > 0 && selectedLeads.length < filteredResults.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  {activeTab === 0 ? (
                    <>
                      <TableCell>Professional</TableCell>
                      <TableCell>Specialties</TableCell>
                      <TableCell>Business Profile</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          Partnership Potential
                          <Tooltip 
                            title={
                              <Box>
                                <Typography variant="subtitle2" gutterBottom>
                                  Partnership Potential Score
                                </Typography>
                                <Typography variant="body2" gutterBottom>
                                  Based on AI analysis of public data including:
                                </Typography>
                                <Typography variant="body2" component="div">
                                  • Market Alignment (serves high-end residential)<br/>
                                  • Technology Integration (smart home/automation)<br/>
                                  • Professional Credibility (portfolio quality)<br/>
                                  • Geographic Proximity (serves target area)<br/>
                                  • Company Stability (years in business)
                                </Typography>
                                <br/>
                                <Typography variant="body2">
                                  <strong>90-100:</strong> Excellent Fit<br/>
                                  <strong>80-89:</strong> Good Fit<br/>
                                  <strong>70-79:</strong> Potential Fit<br/>
                                  <strong>60-69:</strong> Poor Fit
                                </Typography>
                              </Box>
                            }
                            arrow
                            placement="top"
                          >
                            <HelpIcon sx={{ fontSize: 16, color: 'text.secondary', cursor: 'help' }} />
                          </Tooltip>
                        </Box>
                      </TableCell>
                      <TableCell>Contact</TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>Business</TableCell>
                      <TableCell>Contact</TableCell>
                      <TableCell>Property Details</TableCell>
                      <TableCell>Estimated Value</TableCell>
                      <TableCell>Lead Score</TableCell>
                    </>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredResults.map((lead: any) => (
                  <TableRow key={lead.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedLeads.includes(lead.id)}
                        onChange={() => handleSelectLead(lead.id)}
                      />
                    </TableCell>
                    {activeTab === 0 ? (
                      // Industry Partner Row
                      <>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                              {lead.name.split(' ').map((n: string) => n[0]).join('')}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {lead.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {lead.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {lead.company} • {lead.address}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            {lead.specialties.slice(0, 2).map((specialty: string, index: number) => (
                              <Chip 
                                key={index}
                                label={specialty} 
                                size="small" 
                                sx={{ mr: 0.5, mb: 0.5 }}
                                color="primary"
                                variant="outlined"
                              />
                            ))}
                            {lead.specialties.length > 2 && (
                              <Chip 
                                label={`+${lead.specialties.length - 2}`} 
                                size="small" 
                                variant="outlined"
                                color="default"
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {lead.yearsInBusiness}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {lead.companyType}
                            </Typography>
                            <br />
                            <Typography variant="caption" color="success.main">
                              {lead.geographicCoverage}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LinearProgress
                              variant="determinate"
                              value={lead.leadScore}
                              sx={{ 
                                width: 60, 
                                mr: 1,
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: getScoreColor(lead.leadScore) === 'success' ? 'success.main' : 
                                                 getScoreColor(lead.leadScore) === 'warning' ? 'warning.main' : 
                                                 getScoreColor(lead.leadScore) === 'info' ? 'info.main' : 'error.main'
                                }
                              }}
                            />
                            <Typography variant="body2" fontWeight="bold">
                              {lead.leadScore}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color={`${getScoreColor(lead.leadScore)}.main`} sx={{ fontWeight: 'medium' }}>
                            {getPartnershipFit(lead.leadScore)}
                          </Typography>
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            Updated: {lead.lastActivity}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title={`Email ${lead.name}`}>
                              <IconButton 
                                size="small" 
                                href={`mailto:${lead.email}`}
                                color="primary"
                              >
                                <EmailIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={`Call ${lead.name}`}>
                              <IconButton 
                                size="small" 
                                href={`tel:${lead.phone}`}
                                color="primary"
                              >
                                <PhoneIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Visit Website">
                              <IconButton 
                                size="small" 
                                href={`https://${lead.website}`}
                                target="_blank"
                                color="primary"
                              >
                                <WebsiteIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="LinkedIn Profile">
                              <IconButton 
                                size="small" 
                                href={`https://${lead.linkedin}`}
                                target="_blank"
                                color="primary"
                              >
                                <LinkedInIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </>
                    ) : (
                      // Commercial Property Row
                      <>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 2, bgcolor: 'secondary.main' }}>
                              <BusinessIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {lead.businessName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {lead.address}
                              </Typography>
                              <Chip 
                                label={lead.source} 
                                size="small" 
                                color="info"
                                variant="outlined"
                                sx={{ mt: 0.5 }}
                              />
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {lead.contactName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {lead.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {lead.email} • {lead.phone}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {lead.propertyType}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {lead.units} units
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold" color="success.main">
                            {lead.estimated_value}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Updated: {lead.lastUpdated}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LinearProgress
                              variant="determinate"
                              value={lead.score}
                              sx={{ 
                                width: 60, 
                                mr: 1,
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: getScoreColor(lead.score) === 'success' ? 'success.main' : 
                                                 getScoreColor(lead.score) === 'warning' ? 'warning.main' : 'error.main'
                                }
                              }}
                            />
                            <Typography variant="body2" fontWeight="bold">
                              {lead.score}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                            <Tooltip title={`Email ${lead.contactName}`}>
                              <IconButton 
                                size="small" 
                                href={`mailto:${lead.email}`}
                                color="primary"
                              >
                                <EmailIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={`Call ${lead.contactName}`}>
                              <IconButton 
                                size="small" 
                                href={`tel:${lead.phone}`}
                                color="primary"
                              >
                                <PhoneIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Campaign Wizard Integration */}
      <CampaignWizard
        open={campaignWizardOpen}
        onClose={() => setCampaignWizardOpen(false)}
        onSave={handleCampaignCreated}
        initialLeads={getSelectedLeadsData()}
      />

      {/* Success Notification */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
      >
        <Alert onClose={() => setSuccessMessage('')} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Upgrade to Pro Modal */}
      <Dialog open={upgradeModalOpen} onClose={() => setUpgradeModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <DownloadIcon color="primary" />
            <Typography variant="h5" component="span">
              Export Leads - Pro Feature
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Unlock Unlimited Data Exports
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Export your search results to CSV, Excel, or other formats for external use
            </Typography>
          </Box>

          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              💡 <strong>Pro Tip:</strong> Keep leads in our platform for best results! Our built-in email campaigns have 3x higher response rates than exported cold outreach.
            </Typography>
          </Alert>

          <Paper sx={{ p: 3, bgcolor: 'primary.50', border: '2px solid', borderColor: 'primary.main' }}>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="h4" color="primary.main" fontWeight="bold">
                $49<Typography component="span" variant="body1">/month</Typography>
              </Typography>
              <Typography variant="h6" gutterBottom>
                Smart Home CRM Pro
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Everything in Free, plus:
            </Typography>
            
            <Box component="ul" sx={{ pl: 3, mt: 1, '& li': { mb: 0.5 } }}>
              <li>✅ <strong>Unlimited Data Export</strong> (CSV, Excel)</li>
              <li>✅ <strong>Advanced Campaign Analytics</strong></li>
              <li>✅ <strong>Custom Email Templates</strong></li>
              <li>✅ <strong>Lead Scoring & Prioritization</strong></li>
              <li>✅ <strong>Pipeline Management</strong></li>
              <li>✅ <strong>Integration with CRM Tools</strong></li>
              <li>✅ <strong>Priority Customer Support</strong></li>
            </Box>
          </Paper>

          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              "The Pro plan paid for itself in the first month. The export feature plus advanced analytics helped us close 40% more deals." - Jennifer R., Smart Home Installer
            </Typography>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setUpgradeModalOpen(false)} color="inherit">
            Continue with Free Plan
          </Button>
          <Button variant="contained" size="large" sx={{ px: 4 }}>
            Upgrade to Pro - $49/month
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 