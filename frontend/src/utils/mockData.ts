interface Professional {
  id: string;
  name: string;
  company: string;
  title: string;
  email: string;
  phone: string;
  linkedIn?: string;
  projects: number;
  specialties: string[];
}

interface CampaignStats {
  sent: number;
  opened: number;
  clicked: number;
  replied: number;
}

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: 'draft' | 'scheduled' | 'active' | 'completed';
  template: string;
  subject: string;
  scheduledDate?: string;
  recipientCount: number;
  stats: CampaignStats;
  createdAt: string;
}

const specialtiesByVertical = {
  'interior-designers': [
    'Modern Contemporary',
    'Traditional',
    'Transitional',
    'Smart Home Integration',
    'Luxury Residential',
    'Commercial Spaces',
  ],
  'architects': [
    'Modern Architecture',
    'Smart Home Design',
    'Sustainable Design',
    'Luxury Homes',
    'Home Automation',
    'Green Building',
  ],
  'custom-builders': [
    'Luxury Homes',
    'Smart Home Construction',
    'Energy Efficient',
    'Modern Builds',
    'Home Automation',
    'High-End Residential',
  ],
};

function generateMockProfessional(index: number): Professional {
  const verticals = Object.keys(specialtiesByVertical);
  const vertical = verticals[Math.floor(Math.random() * verticals.length)];
  const specialties = specialtiesByVertical[vertical as keyof typeof specialtiesByVertical];
  
  const firstName = ['James', 'Sarah', 'Michael', 'Emma', 'David', 'Lisa', 'Robert', 'Jennifer'][Math.floor(Math.random() * 8)];
  const lastName = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'][Math.floor(Math.random() * 8)];
  const name = `${firstName} ${lastName}`;
  
  const companies = [
    'Modern Design Co.',
    'Smart Spaces LLC',
    'Elite Interiors',
    'Future Homes',
    'Innovative Architects',
    'Premium Builders',
    'Smart Living Designs',
    'Luxury Homes Group',
  ];

  const titles = {
    'interior-designers': ['Principal Designer', 'Senior Interior Designer', 'Design Director'],
    'architects': ['Principal Architect', 'Senior Architect', 'Design Architect'],
    'custom-builders': ['Owner', 'Project Manager', 'Construction Manager'],
  };

  return {
    id: `prof-${index}`,
    name,
    company: companies[Math.floor(Math.random() * companies.length)],
    title: titles[vertical as keyof typeof titles][Math.floor(Math.random() * 3)],
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${companies[Math.floor(Math.random() * companies.length)].toLowerCase().replace(/[^a-zA-Z]/g, '')}.com`,
    phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
    linkedIn: Math.random() > 0.3 ? `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}-${Math.floor(Math.random() * 1000)}` : undefined,
    projects: Math.floor(Math.random() * 50) + 10,
    specialties: Array.from(new Set([
      ...Array(Math.floor(Math.random() * 3) + 1)
        .fill(null)
        .map(() => specialties[Math.floor(Math.random() * specialties.length)])
    ])),
  };
}

function generateMockCampaign(index: number): Campaign {
  const campaignTypes = ['introduction', 'partnership', 'follow-up'];
  const statuses: Array<'draft' | 'scheduled' | 'active' | 'completed'> = ['draft', 'scheduled', 'active', 'completed'];
  const templates = ['interior-designer-intro', 'architect-partnership', 'builder-collaboration', 'follow-up-template'];
  
  const type = campaignTypes[Math.floor(Math.random() * campaignTypes.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const recipientCount = Math.floor(Math.random() * 50) + 5;
  const sent = status === 'completed' ? recipientCount : status === 'active' ? Math.floor(recipientCount * 0.7) : 0;
  const opened = Math.floor(sent * (0.3 + Math.random() * 0.4));
  const clicked = Math.floor(opened * (0.2 + Math.random() * 0.3));
  const replied = Math.floor(clicked * (0.1 + Math.random() * 0.2));

  return {
    id: `camp-${index}`,
    name: `${type.charAt(0).toUpperCase() + type.slice(1)} Campaign ${index + 1}`,
    type,
    status,
    template: templates[Math.floor(Math.random() * templates.length)],
    subject: 'Smart Home Integration Partnership Opportunity',
    scheduledDate: status === 'scheduled' ? new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
    recipientCount,
    stats: {
      sent,
      opened,
      clicked,
      replied,
    },
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  };
}

export const mockProfessionals: Professional[] = Array.from({ length: 25 }, (_, i) => 
  generateMockProfessional(i)
);

export const mockCampaigns: Campaign[] = Array.from({ length: 10 }, (_, i) =>
  generateMockCampaign(i)
); 