// User Types
export type UserRole = 'admin' | 'field_officer' | 'distributor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  territory?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
}

// Location Types
export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: Date;
}

// Work Log Types
export interface WorkLog {
  id: string;
  userId: string;
  type: 'start' | 'end';
  timestamp: Date;
  location: GeoLocation;
  odometerReading?: number;
  notes?: string;
}

// Meeting Types
export type MeetingType = 'one_on_one' | 'group';
export type MeetingCategory = 'product_demo' | 'farmer_training' | 'feedback_session' | 'sales_event' | 'other';
export type StakeholderType = 'farmer' | 'seller' | 'influencer' | 'veterinarian' | 'other';

export interface Meeting {
  id: string;
  userId: string;
  type: MeetingType;
  category: MeetingCategory;
  stakeholderType: StakeholderType;
  contactName: string;
  contactPhone?: string;
  village: string;
  location: GeoLocation;
  attendanceCount?: number;
  businessPotential?: string;
  notes?: string;
  photos: string[];
  createdAt: Date;
}

// Sample Distribution Types
export type DistributionPurpose = 'trial' | 'demo' | 'follow_up' | 'promotional';

export interface SampleDistribution {
  id: string;
  userId: string;
  recipientName: string;
  recipientContact?: string;
  stakeholderType: StakeholderType;
  productSku: string;
  productName: string;
  quantity: number;
  unit: string;
  batchNumber?: string;
  purpose: DistributionPurpose;
  location: GeoLocation;
  village: string;
  notes?: string;
  createdAt: Date;
}

// Sales Types
export type SaleType = 'b2c' | 'b2b';
export type PaymentMode = 'cash' | 'digital' | 'credit';

export interface Sale {
  id: string;
  userId: string;
  type: SaleType;
  customerName: string;
  customerContact?: string;
  customerType?: StakeholderType;
  businessName?: string;
  productSku: string;
  productName: string;
  packSize: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  paymentMode: PaymentMode;
  location: GeoLocation;
  village: string;
  isRepeatOrder: boolean;
  deliveryTimeline?: string;
  notes?: string;
  createdAt: Date;
}

// Dashboard Types
export interface DailyMetrics {
  date: string;
  meetings: number;
  oneOnOneMeetings: number;
  groupMeetings: number;
  samplesDistributed: number;
  sales: number;
  b2cSales: number;
  b2bSales: number;
  revenue: number;
  distanceTraveled: number;
  villagesVisited: string[];
}

export interface UserMetrics {
  userId: string;
  userName: string;
  totalMeetings: number;
  totalSales: number;
  totalRevenue: number;
  totalDistance: number;
  conversionRate: number;
  territory: string;
}

export interface TerritoryMetrics {
  state: string;
  district: string;
  village: string;
  meetings: number;
  sales: number;
  revenue: number;
  penetrationRate: number;
}

// Activity Log
export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: 'meeting' | 'sale' | 'sample' | 'work_log';
  entityId: string;
  timestamp: Date;
  details: string;
}

// Offline Sync Types
export interface SyncQueueItem {
  id: string;
  type: 'meeting' | 'sale' | 'sample' | 'work_log';
  data: any;
  timestamp: Date;
  retryCount: number;
  status: 'pending' | 'syncing' | 'failed';
}

// Filter Types
export interface DashboardFilters {
  dateRange: { from: Date; to: Date };
  users: string[];
  territories: string[];
  meetingTypes: MeetingType[];
  products: string[];
}

// Vendor Types
export interface Vendor {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  type: StakeholderType;
  businessName?: string;
  village: string;
  district?: string;
  state?: string;
  address?: string;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  lastContactDate?: Date;
  totalPurchases: number;
  totalRevenue: number;
  totalMeetings: number;
  totalSamples: number;
  tags: string[];
  location?: GeoLocation;
}

export interface VendorSearchFilters {
  searchTerm: string;
  types: StakeholderType[];
  villages: string[];
  states: string[];
  hasPurchases: boolean | null;
  dateRange: { from: Date | null; to: Date | null };
}
