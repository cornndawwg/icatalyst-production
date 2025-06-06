// Employee Management Data Structure and Storage Utilities
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface WeeklySchedule {
  monday: { start: string; end: string; available: boolean };
  tuesday: { start: string; end: string; available: boolean };
  wednesday: { start: string; end: string; available: boolean };
  thursday: { start: string; end: string; available: boolean };
  friday: { start: string; end: string; available: boolean };
  saturday: { start: string; end: string; available: boolean };
  sunday: { start: string; end: string; available: boolean };
}

export interface TimeOffRequest {
  id: string;
  startDate: string;
  endDate: string;
  type: 'Vacation' | 'Sick' | 'Personal' | 'Training' | 'Other';
  status: 'Pending' | 'Approved' | 'Denied';
  reason?: string;
  approvedBy?: string;
  requestedAt: string;
}

export interface Employee {
  id: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: Address;
    dateOfBirth?: string;
    emergencyContact?: EmergencyContact;
    avatar?: string;
  };
  employment: {
    employeeId: string;
    title: string;
    department: 'Installation' | 'Sales' | 'Service' | 'Management' | 'Admin';
    role: 'Project Manager' | 'Lead Installer' | 'Technician' | 'Sales Rep' | 'Admin' | 'Installer';
    hireDate: string;
    employmentType: 'Full Time' | 'Part Time' | 'Contract' | 'Seasonal';
    status: 'Active' | 'Inactive' | 'On Leave' | 'Terminated';
  };
  compensation: {
    hourlyRate?: number;
    salary?: number;
    overtimeRate?: number;
    payType: 'Hourly' | 'Salary' | 'Commission' | 'Contract';
  };
  skills: {
    certifications: string[];
    specialties: string[];
    skillLevel: 'Entry' | 'Intermediate' | 'Advanced' | 'Expert';
    yearsExperience: number;
  };
  availability: {
    schedule: WeeklySchedule;
    timeOff: TimeOffRequest[];
    availableForTravel: boolean;
  };
  performance: {
    rating: number; // 1-5
    completedProjects: number;
    customerSatisfaction: number;
    lastReviewDate?: string;
    notes?: string;
  };
  currentAssignments: {
    activeProjects: string[]; // Project IDs
    nextAvailable: string; // Date
  };
  metadata: {
    createdAt: string;
    createdBy: string;
    lastModified: string;
    modifiedBy: string;
  };
}

// Storage configuration
const EMPLOYEES_STORAGE_KEY = 'smart-home-employees';
const EMPLOYEE_COUNTER_KEY = 'smart-home-employee-counter';

// SSR safety check - prevent localStorage access during server-side rendering
const isClient = typeof window !== 'undefined';

// Helper function to generate unique employee IDs
export const generateEmployeeId = (prefix: string = 'EMP'): string => {
  if (!isClient) {
    // During SSR, generate a timestamp-based ID
    return `${prefix}${Date.now()}`;
  }
  
  const counter = getNextCounter();
  return `${prefix}${counter.toString().padStart(3, '0')}`;
};

const getNextCounter = (): number => {
  if (!isClient) return 1; // Return default during SSR
  
  const counter = localStorage.getItem(EMPLOYEE_COUNTER_KEY);
  const nextCounter = counter ? parseInt(counter) + 1 : 1;
  localStorage.setItem(EMPLOYEE_COUNTER_KEY, nextCounter.toString());
  return nextCounter;
};

// Sample employees data
const sampleEmployees: Employee[] = [
  {
    id: 'emp1',
    personalInfo: {
      firstName: 'Sarah',
      lastName: 'Williams',
      email: 'sarah.williams@company.com',
      phone: '(555) 123-4567',
      address: {
        street: '123 Oak Street',
        city: 'Denver',
        state: 'CO',
        zipCode: '80202'
      },
      emergencyContact: {
        name: 'Michael Williams',
        relationship: 'Spouse',
        phone: '(555) 987-6543'
      }
    },
    employment: {
      employeeId: 'EMP001',
      title: 'Lead Smart Home Installer',
      department: 'Installation',
      role: 'Lead Installer',
      hireDate: '2022-03-15',
      employmentType: 'Full Time',
      status: 'Active'
    },
    compensation: {
      hourlyRate: 85,
      overtimeRate: 127.50,
      payType: 'Hourly'
    },
    skills: {
      certifications: ['Control4 Certified', 'Lutron Certified', 'Sonos Certified'],
      specialties: ['Control4', 'Lutron', 'Network Setup', 'Audio Systems', 'Security'],
      skillLevel: 'Expert',
      yearsExperience: 8
    },
    availability: {
      schedule: {
        monday: { start: '08:00', end: '17:00', available: true },
        tuesday: { start: '08:00', end: '17:00', available: true },
        wednesday: { start: '08:00', end: '17:00', available: true },
        thursday: { start: '08:00', end: '17:00', available: true },
        friday: { start: '08:00', end: '17:00', available: true },
        saturday: { start: '09:00', end: '15:00', available: true },
        sunday: { start: '00:00', end: '00:00', available: false }
      },
      timeOff: [],
      availableForTravel: true
    },
    performance: {
      rating: 4.9,
      completedProjects: 127,
      customerSatisfaction: 4.8,
      lastReviewDate: '2024-01-15',
      notes: 'Exceptional performer, excellent customer relations'
    },
    currentAssignments: {
      activeProjects: ['proj1', 'proj2'],
      nextAvailable: '2024-02-15'
    },
    metadata: {
      createdAt: '2022-03-15T10:00:00Z',
      createdBy: 'admin',
      lastModified: '2024-01-15T14:30:00Z',
      modifiedBy: 'admin'
    }
  },
  {
    id: 'emp2',
    personalInfo: {
      firstName: 'Mike',
      lastName: 'Chen',
      email: 'mike.chen@company.com',
      phone: '(555) 234-5678',
      address: {
        street: '456 Pine Avenue',
        city: 'Denver',
        state: 'CO',
        zipCode: '80203'
      },
      emergencyContact: {
        name: 'Lisa Chen',
        relationship: 'Wife',
        phone: '(555) 876-5432'
      }
    },
    employment: {
      employeeId: 'EMP002',
      title: 'Senior Project Manager',
      department: 'Management',
      role: 'Project Manager',
      hireDate: '2021-08-01',
      employmentType: 'Full Time',
      status: 'Active'
    },
    compensation: {
      salary: 95000,
      payType: 'Salary'
    },
    skills: {
      certifications: ['PMP Certified', 'Control4 Certified', 'Project Management'],
      specialties: ['Project Management', 'Control4', 'Network Setup', 'Client Relations'],
      skillLevel: 'Expert',
      yearsExperience: 12
    },
    availability: {
      schedule: {
        monday: { start: '07:30', end: '17:30', available: true },
        tuesday: { start: '07:30', end: '17:30', available: true },
        wednesday: { start: '07:30', end: '17:30', available: true },
        thursday: { start: '07:30', end: '17:30', available: true },
        friday: { start: '07:30', end: '17:30', available: true },
        saturday: { start: '00:00', end: '00:00', available: false },
        sunday: { start: '00:00', end: '00:00', available: false }
      },
      timeOff: [
        {
          id: 'to1',
          startDate: '2024-02-20',
          endDate: '2024-02-23',
          type: 'Vacation',
          status: 'Approved',
          reason: 'Family vacation',
          approvedBy: 'admin',
          requestedAt: '2024-01-15T10:00:00Z'
        }
      ],
      availableForTravel: true
    },
    performance: {
      rating: 4.7,
      completedProjects: 89,
      customerSatisfaction: 4.6,
      lastReviewDate: '2024-01-10',
      notes: 'Strong leadership, excellent project delivery'
    },
    currentAssignments: {
      activeProjects: ['proj1', 'proj3', 'proj4'],
      nextAvailable: '2024-02-20'
    },
    metadata: {
      createdAt: '2021-08-01T09:00:00Z',
      createdBy: 'admin',
      lastModified: '2024-01-10T16:20:00Z',
      modifiedBy: 'admin'
    }
  },
  {
    id: 'emp3',
    personalInfo: {
      firstName: 'Tom',
      lastName: 'Rodriguez',
      email: 'tom.rodriguez@company.com',
      phone: '(555) 345-6789',
      address: {
        street: '789 Maple Drive',
        city: 'Denver',
        state: 'CO',
        zipCode: '80204'
      },
      emergencyContact: {
        name: 'Maria Rodriguez',
        relationship: 'Sister',
        phone: '(555) 765-4321'
      }
    },
    employment: {
      employeeId: 'EMP003',
      title: 'Audio/Video Specialist',
      department: 'Installation',
      role: 'Technician',
      hireDate: '2023-01-10',
      employmentType: 'Part Time',
      status: 'Active'
    },
    compensation: {
      hourlyRate: 75,
      overtimeRate: 112.50,
      payType: 'Hourly'
    },
    skills: {
      certifications: ['Audio Engineering', 'Sonos Certified'],
      specialties: ['Audio Systems', 'Theater Systems', 'Sonos', 'Speaker Installation'],
      skillLevel: 'Advanced',
      yearsExperience: 5
    },
    availability: {
      schedule: {
        monday: { start: '10:00', end: '18:00', available: true },
        tuesday: { start: '10:00', end: '18:00', available: true },
        wednesday: { start: '10:00', end: '18:00', available: true },
        thursday: { start: '00:00', end: '00:00', available: false },
        friday: { start: '10:00', end: '18:00', available: true },
        saturday: { start: '09:00', end: '15:00', available: true },
        sunday: { start: '00:00', end: '00:00', available: false }
      },
      timeOff: [],
      availableForTravel: false
    },
    performance: {
      rating: 4.8,
      completedProjects: 45,
      customerSatisfaction: 4.9,
      lastReviewDate: '2024-01-05',
      notes: 'Excellent technical skills, customer favorite'
    },
    currentAssignments: {
      activeProjects: ['proj1'],
      nextAvailable: '2024-02-05'
    },
    metadata: {
      createdAt: '2023-01-10T11:00:00Z',
      createdBy: 'admin',
      lastModified: '2024-01-05T15:45:00Z',
      modifiedBy: 'admin'
    }
  },
  {
    id: 'emp4',
    personalInfo: {
      firstName: 'Jessica',
      lastName: 'Martinez',
      email: 'jessica.martinez@company.com',
      phone: '(555) 456-7890',
      address: {
        street: '321 Cedar Lane',
        city: 'Denver',
        state: 'CO',
        zipCode: '80205'
      },
      emergencyContact: {
        name: 'Carlos Martinez',
        relationship: 'Father',
        phone: '(555) 654-3210'
      }
    },
    employment: {
      employeeId: 'EMP004',
      title: 'Network & Security Technician',
      department: 'Installation',
      role: 'Technician',
      hireDate: '2023-06-15',
      employmentType: 'Full Time',
      status: 'Active'
    },
    compensation: {
      hourlyRate: 72,
      overtimeRate: 108.00,
      payType: 'Hourly'
    },
    skills: {
      certifications: ['Network+ Certified', 'Security+ Certified', 'Ubiquiti Certified'],
      specialties: ['Network Setup', 'Security Systems', 'WiFi Design', 'IP Cameras'],
      skillLevel: 'Advanced',
      yearsExperience: 4
    },
    availability: {
      schedule: {
        monday: { start: '08:00', end: '16:00', available: true },
        tuesday: { start: '08:00', end: '16:00', available: true },
        wednesday: { start: '08:00', end: '16:00', available: true },
        thursday: { start: '08:00', end: '16:00', available: true },
        friday: { start: '08:00', end: '16:00', available: true },
        saturday: { start: '00:00', end: '00:00', available: false },
        sunday: { start: '00:00', end: '00:00', available: false }
      },
      timeOff: [],
      availableForTravel: true
    },
    performance: {
      rating: 4.6,
      completedProjects: 28,
      customerSatisfaction: 4.5,
      lastReviewDate: '2024-01-08',
      notes: 'Strong technical skills, reliable performer'
    },
    currentAssignments: {
      activeProjects: ['proj2', 'proj5'],
      nextAvailable: '2024-02-10'
    },
    metadata: {
      createdAt: '2023-06-15T14:00:00Z',
      createdBy: 'admin',
      lastModified: '2024-01-08T11:30:00Z',
      modifiedBy: 'admin'
    }
  },
  {
    id: 'emp5',
    personalInfo: {
      firstName: 'David',
      lastName: 'Thompson',
      email: 'david.thompson@company.com',
      phone: '(555) 567-8901',
      address: {
        street: '987 Birch Street',
        city: 'Denver',
        state: 'CO',
        zipCode: '80206'
      },
      emergencyContact: {
        name: 'Nancy Thompson',
        relationship: 'Mother',
        phone: '(555) 543-2109'
      }
    },
    employment: {
      employeeId: 'EMP005',
      title: 'Installation Technician',
      department: 'Installation',
      role: 'Installer',
      hireDate: '2023-09-01',
      employmentType: 'Full Time',
      status: 'Active'
    },
    compensation: {
      hourlyRate: 58,
      overtimeRate: 87.00,
      payType: 'Hourly'
    },
    skills: {
      certifications: ['Basic Installation', 'Safety Certified'],
      specialties: ['Basic Installation', 'Wiring', 'Device Mounting'],
      skillLevel: 'Intermediate',
      yearsExperience: 2
    },
    availability: {
      schedule: {
        monday: { start: '08:00', end: '17:00', available: true },
        tuesday: { start: '08:00', end: '17:00', available: true },
        wednesday: { start: '08:00', end: '17:00', available: true },
        thursday: { start: '08:00', end: '17:00', available: true },
        friday: { start: '08:00', end: '17:00', available: true },
        saturday: { start: '08:00', end: '14:00', available: true },
        sunday: { start: '00:00', end: '00:00', available: false }
      },
      timeOff: [],
      availableForTravel: true
    },
    performance: {
      rating: 4.2,
      completedProjects: 15,
      customerSatisfaction: 4.3,
      lastReviewDate: '2024-01-12',
      notes: 'Eager to learn, good work ethic'
    },
    currentAssignments: {
      activeProjects: ['proj3'],
      nextAvailable: '2024-02-01'
    },
    metadata: {
      createdAt: '2023-09-01T12:00:00Z',
      createdBy: 'admin',
      lastModified: '2024-01-12T13:15:00Z',
      modifiedBy: 'admin'
    }
  }
];

// CRUD Operations
export const getAllEmployees = (): Employee[] => {
  try {
    // Return empty array during SSR
    if (!isClient) return [];
    
    const stored = localStorage.getItem(EMPLOYEES_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate that it's an array and filter out any invalid entries
      if (Array.isArray(parsed)) {
        return parsed.filter(emp => emp && typeof emp === 'object' && emp.id);
      }
    }
    // Initialize with sample data if no employees exist or data is invalid
    saveEmployees(sampleEmployees);
    return sampleEmployees;
  } catch (error) {
    console.error('Error loading employees:', error);
    // If localStorage is corrupted, return sample data
    return sampleEmployees;
  }
};

export const getEmployeeById = (id: string): Employee | null => {
  try {
    // Return null during SSR
    if (!isClient) return null;
    
    const employees = getAllEmployees();
    return employees.find(emp => emp.id === id) || null;
  } catch (error) {
    console.error('Error getting employee by ID:', error);
    return null;
  }
};

export const saveEmployee = (employee: Employee): void => {
  try {
    // Skip saving during SSR
    if (!isClient) return;
    
    // Validate employee object
    if (!employee || typeof employee !== 'object' || !employee.id) {
      throw new Error('Invalid employee object');
    }
    
    const employees = getAllEmployees();
    const existingIndex = employees.findIndex(emp => emp.id === employee.id);
    
    if (existingIndex >= 0) {
      employees[existingIndex] = employee;
    } else {
      employees.push(employee);
    }
    
    saveEmployees(employees);
  } catch (error) {
    console.error('Error saving employee:', error);
  }
};

export const deleteEmployee = (id: string): void => {
  try {
    // Skip deleting during SSR
    if (!isClient) return;
    
    const employees = getAllEmployees();
    const filteredEmployees = employees.filter(emp => emp.id !== id);
    saveEmployees(filteredEmployees);
  } catch (error) {
    console.error('Error deleting employee:', error);
  }
};

export const saveEmployees = (employees: Employee[]): void => {
  try {
    // Skip saving during SSR
    if (!isClient) return;
    
    // Validate input
    if (!Array.isArray(employees)) {
      throw new Error('Employees must be an array');
    }
    
    localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(employees));
  } catch (error) {
    console.error('Error saving employees:', error);
  }
};

// Helper functions for employee management
export const getEmployeeFullName = (employee: Employee | null | undefined): string => {
  if (!employee) return 'Unknown Employee';
  if (!employee.personalInfo) return 'Unknown Employee';
  if (!employee.personalInfo.firstName || !employee.personalInfo.lastName) {
    return employee.personalInfo.email || employee.employment?.employeeId || 'Unknown Employee';
  }
  return `${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`;
};

export const getEmployeeAvailability = (employee: Employee | null | undefined): string => {
  if (!employee || !employee.currentAssignments) return 'Unknown';
  
  const { nextAvailable } = employee.currentAssignments;
  
  if (!nextAvailable) return 'Unknown';
  
  const checkDate = new Date();
  const nextAvailableDate = new Date(nextAvailable);
  
  if (isNaN(nextAvailableDate.getTime())) return 'Unknown';
  
  if (checkDate < nextAvailableDate) return 'Available';
  return 'Unavailable';
};

export const getEmployeesByDepartment = (department: Employee['employment']['department']): Employee[] => {
  try {
    return getAllEmployees().filter(emp => emp?.employment?.department === department);
  } catch (error) {
    console.error('Error filtering employees by department:', error);
    return [];
  }
};

export const getEmployeesByRole = (role: Employee['employment']['role']): Employee[] => {
  try {
    return getAllEmployees().filter(emp => emp?.employment?.role === role);
  } catch (error) {
    console.error('Error filtering employees by role:', error);
    return [];
  }
};

export const getAvailableEmployees = (date?: string): Employee[] => {
  try {
    const employees = getAllEmployees();
    return employees.filter(emp => {
      if (!emp || !emp.employment || emp.employment.status !== 'Active') return false;
      
      // Check if they have availability on the given date
      if (date) {
        const checkDate = new Date(date);
        if (isNaN(checkDate.getTime())) return false;
        
        const nextAvailable = emp.currentAssignments?.nextAvailable;
        if (!nextAvailable) return true; // If no next available date, assume available
        
        const nextAvailableDate = new Date(nextAvailable);
        if (isNaN(nextAvailableDate.getTime())) return true;
        
        if (checkDate < nextAvailableDate) return false;
      }
      
      return true;
    });
  } catch (error) {
    console.error('Error getting available employees:', error);
    return [];
  }
};

export const searchEmployees = (searchTerm: string): Employee[] => {
  if (!searchTerm.trim()) return getAllEmployees();
  
  try {
    const term = searchTerm.toLowerCase();
    return getAllEmployees().filter(emp => {
      if (!emp) return false;
      
      const firstName = emp.personalInfo?.firstName?.toLowerCase() || '';
      const lastName = emp.personalInfo?.lastName?.toLowerCase() || '';
      const title = emp.employment?.title?.toLowerCase() || '';
      const role = emp.employment?.role?.toLowerCase() || '';
      const specialties = emp.skills?.specialties || [];
      const certifications = emp.skills?.certifications || [];
      
      return firstName.includes(term) ||
        lastName.includes(term) ||
        title.includes(term) ||
        role.includes(term) ||
        specialties.some(skill => skill?.toLowerCase().includes(term)) ||
        certifications.some(cert => cert?.toLowerCase().includes(term));
    });
  } catch (error) {
    console.error('Error searching employees:', error);
    return [];
  }
}; 