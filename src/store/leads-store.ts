import { create } from 'zustand';

/**
 * Minimal demo leads store.
 * Keeps the same API shape used by your dashboard but ensures `leads` is always an array.
 * You can replace the DataService calls later with your real API.
 */

export interface Lead {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  region?: string;
  status?: string;
  createdAt?: string;
  score?: number;
}

interface LeadsState {
  leads: Lead[];
  isLoading: boolean;
  fetchLeads: () => Promise<void>;
  // ... other actions can be added as needed
}

const demoLeads: Lead[] = [
  { _id: 'l1', name: 'Aman Singh', email: 'aman@example.com', company: 'Acme Ltd', region: 'India', status: 'qualified', createdAt: new Date().toISOString(), score: 78 },
  { _id: 'l2', name: 'Sara Khan', email: 'sara@example.com', company: 'BlueCo', region: 'UAE', status: 'new', createdAt: new Date().toISOString(), score: 45 },
  { _id: 'l3', name: 'James Lee', email: 'james@example.com', company: 'GreenTech', region: 'US', status: 'contacted', createdAt: new Date().toISOString(), score: 61 }
];

export const useLeadsStore = create<LeadsState>((set, get) => ({
  leads: demoLeads.slice(),
  isLoading: false,
  fetchLeads: async () => {
    set({ isLoading: true });
    try {
      // if you later plug in a DataService, use it here.
      // For now, we keep demo data and simulate network delay.
      await new Promise((r) => setTimeout(r, 300));
      set({ leads: demoLeads.slice(), isLoading: false });
    } catch (e) {
      // keep demo leads on error
      set({ leads: demoLeads.slice(), isLoading: false });
    }
  }
}));
