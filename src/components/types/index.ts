export type StakeholderType =
  | 'farmer'
  | 'seller'
  | 'influencer'
  | 'veterinarian'
  | 'other';

export interface Vendor {
  id: string;
  name: string;
  type: StakeholderType;
  village: string;
  district?: string;
  phone?: string;
  businessName?: string;
  isActive: boolean;
  location?: {
    latitude: number;
    longitude: number;
  };
  totalPurchases: number;
  totalRevenue: number;
  totalMeetings: number;
  totalSamples: number;
  notes?: string;
}
