// Data Storage Utility for Smart Home CRM
// Handles localStorage persistence for projects and customers

export interface Project {
  id: string;
  name: string;
  type: string;
  description: string;
  customer: string;
  property: string;
  status: 'Planning' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled';
  priority: 'High' | 'Medium' | 'Low';
  startDate: string;
  endDate: string;
  budget: string;
  spent: string;
  progress: number;
  team: string[];
  tasks: Array<{ name: string; status: string }>;
  tags: string[];
  lastUpdate: string;
  createdDate: string;
  completedDate?: string;
  // New Project Wizard Data
  projectData?: {
    contractAmount: number;
    budgetBreakdown: Record<string, number>;
    targetMargin: number;
    teamMembers: number[];
    projectManager: string;
    milestones: Array<{ key: string; label: string; date: string; completed: boolean }>;
    customerId?: number;
    newCustomer?: any;
    propertyDetails?: any;
    specialRequirements?: string;
    riskAssessment?: string;
    clientExpectations?: string;
  };
}

export interface Customer {
  id: string;
  name: string;
  company?: string;
  phone: string;
  email: string;
  address?: string;
  vipStatus: boolean;
  lifetimeValue: number;
  projectHistory: string[];
  source: string;
  addedDate: string;
  lastContact: string;
  completedProjects: number;
  referralRevenue: number;
  satisfaction: number;
}

const STORAGE_KEYS = {
  PROJECTS: 'smart_home_crm_projects',
  CUSTOMERS: 'smart_home_crm_customers',
  SETTINGS: 'smart_home_crm_settings'
};

// Generate unique IDs
export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Project Management
export const saveProject = (project: Project): void => {
  const projects = getProjects();
  const existingIndex = projects.findIndex(p => p.id === project.id);
  
  if (existingIndex >= 0) {
    projects[existingIndex] = { ...project, lastUpdate: new Date().toISOString().split('T')[0] };
  } else {
    projects.push({ ...project, lastUpdate: new Date().toISOString().split('T')[0] });
  }
  
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
};

export const getProjects = (): Project[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading projects from localStorage:', error);
    return [];
  }
};

export const getProjectById = (id: string): Project | null => {
  const projects = getProjects();
  return projects.find(p => p.id === id) || null;
};

export const deleteProject = (id: string): void => {
  const projects = getProjects().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
};

export const markProjectComplete = (projectId: string, completionData?: any): Customer | null => {
  const projects = getProjects();
  const projectIndex = projects.findIndex(p => p.id === projectId);
  
  if (projectIndex === -1) return null;
  
  const project = projects[projectIndex];
  const completedDate = new Date().toISOString().split('T')[0];
  
  // Update project status
  projects[projectIndex] = {
    ...project,
    status: 'Completed',
    progress: 100,
    completedDate,
    lastUpdate: completedDate,
    ...completionData
  };
  
  saveProject(projects[projectIndex]);
  
  // Create customer from project data
  const customer = createCustomerFromProject(projects[projectIndex]);
  if (customer) {
    saveCustomer(customer);
  }
  
  return customer;
};

// Customer Management
export const saveCustomer = (customer: Customer): void => {
  const customers = getCustomers();
  const existingIndex = customers.findIndex(c => c.id === customer.id);
  
  if (existingIndex >= 0) {
    customers[existingIndex] = customer;
  } else {
    customers.push(customer);
  }
  
  localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
};

export const getCustomers = (): Customer[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading customers from localStorage:', error);
    return [];
  }
};

export const getCustomerById = (id: string): Customer | null => {
  const customers = getCustomers();
  return customers.find(c => c.id === id) || null;
};

// Create customer from completed project
export const createCustomerFromProject = (project: Project): Customer | null => {
  if (!project.projectData) return null;
  
  const revenue = project.projectData.contractAmount || parseFloat(project.budget.replace(/[$,]/g, '')) || 0;
  const existingCustomers = getCustomers();
  
  // Check if customer already exists
  let existingCustomer: Customer | null = null;
  
  if (project.projectData.customerId) {
    existingCustomer = existingCustomers.find(c => c.id === project.projectData!.customerId!.toString()) || null;
  } else if (project.projectData.newCustomer) {
    existingCustomer = existingCustomers.find(c => 
      c.email === project.projectData!.newCustomer!.email ||
      c.name === project.projectData!.newCustomer!.name
    ) || null;
  }
  
  if (existingCustomer) {
    // Update existing customer
    existingCustomer.lifetimeValue += revenue;
    existingCustomer.projectHistory.push(project.id);
    existingCustomer.completedProjects += 1;
    existingCustomer.lastContact = project.completedDate || new Date().toISOString().split('T')[0];
    return existingCustomer;
  } else {
    // Create new customer
    const customerData = project.projectData.newCustomer || {
      name: project.customer,
      email: `${project.customer.toLowerCase().replace(/\s/g, '')}@email.com`,
      phone: '(555) 000-0000'
    };
    
    return {
      id: generateId('cust'),
      name: customerData.name || project.customer,
      company: customerData.company || '',
      phone: customerData.phone || '(555) 000-0000',
      email: customerData.email || `${project.customer.toLowerCase().replace(/\s/g, '')}@email.com`,
      address: customerData.address || '',
      vipStatus: customerData.vipStatus || false,
      lifetimeValue: revenue,
      projectHistory: [project.id],
      source: 'Direct Business',
      addedDate: project.completedDate || new Date().toISOString().split('T')[0],
      lastContact: project.completedDate || new Date().toISOString().split('T')[0],
      completedProjects: 1,
      referralRevenue: 0,
      satisfaction: 9.0 // Default high satisfaction for completed projects
    };
  }
};

// Convert wizard data to project format
export const convertWizardDataToProject = (wizardData: any): Project => {
  const projectId = generateId('proj');
  const today = new Date().toISOString().split('T')[0];
  
  // Calculate budget and spent amounts
  const totalBudget = Object.values(wizardData.budget).reduce((sum: number, value: any) => 
    sum + (parseFloat(value) || 0), 0
  );
  
  // Determine customer name
  const customerName = wizardData.customerId 
    ? `Customer ${wizardData.customerId}` 
    : wizardData.newCustomer?.name || 'Unknown Customer';
  
  // Create project tags based on type and priority
  const tags = [
    wizardData.type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
    `${wizardData.priority.charAt(0).toUpperCase() + wizardData.priority.slice(1)} Priority`
  ];
  
  if (wizardData.specialRequirements) {
    tags.push('Special Requirements');
  }
  
  // Create tasks from milestones
  const tasks = wizardData.milestones
    .filter((m: any) => m.date)
    .map((milestone: any) => ({
      name: milestone.label,
      status: 'Pending'
    }));
  
  return {
    id: projectId,
    name: wizardData.name,
    type: wizardData.type,
    description: wizardData.description,
    customer: customerName,
    property: wizardData.propertyDetails?.address || wizardData.newCustomer?.address || 'Property Address TBD',
    status: 'Planning',
    priority: wizardData.priority.charAt(0).toUpperCase() + wizardData.priority.slice(1) as 'High' | 'Medium' | 'Low',
    startDate: wizardData.startDate,
    endDate: wizardData.endDate,
    budget: `$${totalBudget.toLocaleString()}`,
    spent: '$0',
    progress: 0,
    team: [`Project Manager`], // Will be enhanced with actual team data
    tasks,
    tags,
    lastUpdate: today,
    createdDate: today,
    projectData: {
      contractAmount: parseFloat(wizardData.contractAmount) || 0,
      budgetBreakdown: wizardData.budget,
      targetMargin: wizardData.targetMargin,
      teamMembers: wizardData.teamMembers,
      projectManager: wizardData.projectManager,
      milestones: wizardData.milestones,
      customerId: wizardData.customerId,
      newCustomer: wizardData.newCustomer,
      propertyDetails: wizardData.propertyDetails,
      specialRequirements: wizardData.specialRequirements,
      riskAssessment: wizardData.riskAssessment,
      clientExpectations: wizardData.clientExpectations
    }
  };
};

// Initialize with sample data if empty
export const initializeDataIfEmpty = (): void => {
  const projects = getProjects();
  const customers = getCustomers();
  
  if (projects.length === 0) {
    // Add sample completed project and customer
    const sampleCompletedProject: Project = {
      id: 'proj_sample_001',
      name: 'Heritage Health Monitoring System',
      type: 'security',
      description: 'Advanced health monitoring and emergency alert system for senior living facility',
      customer: 'Heritage Senior Communities',
      property: 'Heritage Senior Living',
      status: 'Completed',
      priority: 'High',
      startDate: '2023-10-01',
      endDate: '2023-12-31',
      budget: '$158,000',
      spent: '$152,000',
      progress: 100,
      team: ['Dr. Patricia Moore', 'Carlos Mendez', 'Lisa Chang'],
      tasks: [
        { name: 'Medical Requirements Review', status: 'Completed' },
        { name: 'System Design', status: 'Completed' },
        { name: 'Installation & Setup', status: 'Completed' },
        { name: 'Staff Training', status: 'Completed' },
        { name: 'Go-Live & Support', status: 'Completed' }
      ],
      tags: ['Healthcare', 'Senior Living', 'Emergency Systems'],
      lastUpdate: '2024-01-05',
      createdDate: '2023-10-01',
      completedDate: '2023-12-31',
      projectData: {
        contractAmount: 158000,
        budgetBreakdown: {
          equipment: 95000,
          labor: 35000,
          materials: 15000,
          subcontractors: 8000,
          travel: 2000,
          permits: 3000
        },
        targetMargin: 35,
        teamMembers: [1, 2, 3],
        projectManager: '1',
        milestones: []
      }
    };
    
    saveProject(sampleCompletedProject);
    
    // Create customer from completed project
    const customer = createCustomerFromProject(sampleCompletedProject);
    if (customer) {
      saveCustomer(customer);
    }
  }
};

// Clear all data (for development/testing)
export const clearAllData = (): void => {
  localStorage.removeItem(STORAGE_KEYS.PROJECTS);
  localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
};

// Export data for backup
export const exportData = () => {
  return {
    projects: getProjects(),
    customers: getCustomers(),
    exportDate: new Date().toISOString()
  };
};

// Import data from backup
export const importData = (data: any): void => {
  if (data.projects) {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(data.projects));
  }
  if (data.customers) {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(data.customers));
  }
}; 