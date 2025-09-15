import { create } from 'zustand';

export interface Campaign {
  _id: string;
  name: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  createdAt?: string;
}

interface CampaignsState {
  campaigns: Campaign[];
  isLoading: boolean;
  fetchCampaigns: () => Promise<void>;
}

const demoCampaigns: Campaign[] = [
  { _id: 'c1', name: 'Welcome Flow', status: 'running', createdAt: new Date().toISOString() },
  { _id: 'c2', name: 'Re-engage 30d', status: 'paused', createdAt: new Date().toISOString() }
];

export const useCampaignsStore = create<CampaignsState>((set) => ({
  campaigns: demoCampaigns.slice(),
  isLoading: false,
  fetchCampaigns: async () => {
    set({ isLoading: true });
    await new Promise((r) => setTimeout(r, 250));
    set({ campaigns: demoCampaigns.slice(), isLoading: false });
  }
}));
