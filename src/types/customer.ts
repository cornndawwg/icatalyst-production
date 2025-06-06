export type CustomerType = 'residential' | 'commercial' | 'high-net-worth';
export type CustomerStatus = 'prospect' | 'active' | 'completed' | 'inactive';
export type PropertyType = 'single-family' | 'condo' | 'commercial' | 'multi-family' | 'other';
export type CommunicationMethod = 'email' | 'phone' | 'text' | 'whatsapp';
export type InteractionType = 'call' | 'email' | 'meeting' | 'site-visit' | 'other';
export type ProjectStatus = 'planning' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';
export type MilestoneStatus = 'pending' | 'in-progress' | 'completed' | 'overdue';

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Document {
  id: string;
  name: string;
  url: string;
  type: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface Property {
  id: string;
  name: string;
  type: PropertyType;
  address: Address;
  squareFootage: number;
  bedrooms?: number;
  bathrooms?: number;
  yearBuilt?: number;
  photos: string[];
  documents: Document[];
  systems: {
    type: string;
    details: string;
    installDate?: string;
    lastService?: string;
  }[];
  serviceHistory: {
    id: string;
    date: string;
    type: string;
    description: string;
    technician: string;
    cost: number;
  }[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  status: MilestoneStatus;
  dueDate: string;
  completedDate?: string;
  assignedTo?: string;
}

export interface Budget {
  currency: string;
  total: number;
  spent: number;
  remaining: number;
  lineItems: {
    id: string;
    description: string;
    amount: number;
    category: string;
  }[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  startDate: string;
  endDate?: string;
  property: Property;
  team: TeamMember[];
  milestones: Milestone[];
  budget: Budget;
  documents: Document[];
}

export interface CustomerInteraction {
  id: string;
  type: InteractionType;
  date: string;
  summary: string;
  details: string;
  followUpDate?: string;
  followUpNotes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerMetrics {
  totalRevenue: number;
  projectsCompleted: number;
  avgResponseTime: number;
  lastInteraction?: string;
  nextScheduledInteraction?: string;
}

export interface Customer {
  id: string;
  type: CustomerType;
  status: CustomerStatus;
  firstName: string;
  lastName: string;
  company?: string;
  email: string;
  phone: string;
  preferredCommunication: CommunicationMethod;
  billingAddress: Address;
  properties: Property[];
  projects: Project[];
  interactions: CustomerInteraction[];
  tags: string[];
  notes: string;
  metrics: CustomerMetrics;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerFilters {
  search?: string;
  type?: CustomerType[];
  status?: CustomerStatus[];
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface CustomerSort {
  field: keyof Customer | 'fullName';
  direction: 'asc' | 'desc';
}

export interface CustomerDashboardMetrics {
  totalCustomers: number;
  customersByType: {
    residential: number;
    commercial: number;
    'high-net-worth': number;
  };
  activeProjects: number;
  totalRevenue: number;
  averageSatisfactionScore: number;
  recentActivity: {
    date: string;
    type: CustomerType;
    customerName: string;
    description: string;
  }[];
  upcomingTasks: {
    id: string;
    date: string;
    customerName: string;
    description: string;
  }[];
} 