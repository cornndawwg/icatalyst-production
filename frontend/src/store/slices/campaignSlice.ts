import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { mockCampaigns } from '../../utils/mockData';

interface CampaignContact {
  id: string;
  name: string;
  company: string;
  title: string;
  email: string;
  phone: string;
  linkedIn?: string;
  specialties: string[];
  dateAdded: string;
}

interface CampaignStats {
  sent: number;
  opened: number;
  clicked: number;
  replied: number;
}

export interface Campaign {
  id: string;
  name: string;
  type: string;
  status: 'draft' | 'scheduled' | 'active' | 'completed';
  template: string;
  subject: string;
  content: string;
  scheduledDate?: string;
  contacts: CampaignContact[];
  stats: CampaignStats;
  createdAt: string;
  lastModified: string;
}

interface CampaignState {
  campaigns: Campaign[];
  selectedCampaign: Campaign | null;
  recentlyAddedContacts: CampaignContact[];
  lastAction: {
    type: 'create' | 'update' | 'delete' | 'duplicate' | null;
    campaignName: string | null;
  };
}

const initialState: CampaignState = {
  campaigns: mockCampaigns.map(campaign => ({
    ...campaign,
    contacts: [],
    lastModified: campaign.createdAt,
    content: campaign.template,
  })),
  selectedCampaign: null,
  recentlyAddedContacts: [],
  lastAction: {
    type: null,
    campaignName: null,
  },
};

const campaignSlice = createSlice({
  name: 'campaigns',
  initialState,
  reducers: {
    selectCampaign: (state: CampaignState, action: PayloadAction<string>) => {
      state.selectedCampaign = state.campaigns.find((c: Campaign) => c.id === action.payload) || null;
    },
    
    addContactsToCampaign: (state: CampaignState, action: PayloadAction<{
      campaignId: string;
      contacts: CampaignContact[];
    }>) => {
      const campaign = state.campaigns.find((c: Campaign) => c.id === action.payload.campaignId);
      if (campaign) {
        const newContacts = action.payload.contacts.filter(
          (newContact: CampaignContact) => !campaign.contacts.some((existing: CampaignContact) => existing.id === newContact.id)
        );
        
        campaign.contacts.push(...newContacts.map((contact: CampaignContact) => ({
          ...contact,
          dateAdded: new Date().toISOString(),
        })));
        
        campaign.lastModified = new Date().toISOString();
        state.recentlyAddedContacts = newContacts;
      }
    },
    
    removeContactFromCampaign: (state: CampaignState, action: PayloadAction<{
      campaignId: string;
      contactId: string;
    }>) => {
      const campaign = state.campaigns.find((c: Campaign) => c.id === action.payload.campaignId);
      if (campaign) {
        campaign.contacts = campaign.contacts.filter(
          (contact: CampaignContact) => contact.id !== action.payload.contactId
        );
        campaign.lastModified = new Date().toISOString();
      }
    },
    
    createCampaign: (state: CampaignState, action: PayloadAction<Omit<Campaign, 'id' | 'stats' | 'contacts' | 'createdAt' | 'lastModified'>>) => {
      const timestamp = new Date().toISOString();
      const newCampaign: Campaign = {
        ...action.payload,
        id: `camp-${Date.now()}`,
        contacts: [],
        stats: {
          sent: 0,
          opened: 0,
          clicked: 0,
          replied: 0,
        },
        createdAt: timestamp,
        lastModified: timestamp,
      };
      state.campaigns.push(newCampaign);
      state.selectedCampaign = newCampaign;
      state.lastAction = {
        type: 'create',
        campaignName: newCampaign.name,
      };
    },
    
    updateCampaign: (state: CampaignState, action: PayloadAction<{
      id: string;
      updates: Partial<Omit<Campaign, 'id' | 'stats' | 'contacts' | 'createdAt' | 'lastModified'>>;
    }>) => {
      const campaign = state.campaigns.find((c: Campaign) => c.id === action.payload.id);
      if (campaign) {
        Object.assign(campaign, {
          ...action.payload.updates,
          lastModified: new Date().toISOString(),
        });
        if (state.selectedCampaign?.id === campaign.id) {
          state.selectedCampaign = campaign;
        }
        state.lastAction = {
          type: 'update',
          campaignName: campaign.name,
        };
      }
    },

    deleteCampaign: (state: CampaignState, action: PayloadAction<string>) => {
      const campaignIndex = state.campaigns.findIndex((c: Campaign) => c.id === action.payload);
      if (campaignIndex !== -1) {
        const campaignName = state.campaigns[campaignIndex].name;
        state.campaigns.splice(campaignIndex, 1);
        if (state.selectedCampaign?.id === action.payload) {
          state.selectedCampaign = null;
        }
        state.lastAction = {
          type: 'delete',
          campaignName,
        };
      }
    },

    duplicateCampaign: (state: CampaignState, action: PayloadAction<string>) => {
      const originalCampaign = state.campaigns.find((c: Campaign) => c.id === action.payload);
      if (originalCampaign) {
        const timestamp = new Date().toISOString();
        const duplicatedCampaign: Campaign = {
          ...originalCampaign,
          id: `camp-${Date.now()}`,
          name: `${originalCampaign.name} (Copy)`,
          status: 'draft',
          stats: {
            sent: 0,
            opened: 0,
            clicked: 0,
            replied: 0,
          },
          contacts: originalCampaign.contacts.map((contact: CampaignContact) => ({
            ...contact,
            dateAdded: timestamp,
          })),
          createdAt: timestamp,
          lastModified: timestamp,
        };
        state.campaigns.push(duplicatedCampaign);
        state.selectedCampaign = duplicatedCampaign;
        state.lastAction = {
          type: 'duplicate',
          campaignName: duplicatedCampaign.name,
        };
      }
    },
    
    clearRecentlyAddedContacts: (state: CampaignState) => {
      state.recentlyAddedContacts = [];
    },

    clearLastAction: (state: CampaignState) => {
      state.lastAction = {
        type: null,
        campaignName: null,
      };
    },
  },
});

export const {
  selectCampaign,
  addContactsToCampaign,
  removeContactFromCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  duplicateCampaign,
  clearRecentlyAddedContacts,
  clearLastAction,
} = campaignSlice.actions;

export default campaignSlice.reducer; 