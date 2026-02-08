import type { 
  Meeting, Sale, SampleDistribution, WorkLog, 
  DailyMetrics, UserMetrics, TerritoryMetrics, ActivityLog,
  GeoLocation, Vendor, VendorSearchFilters, StakeholderType
} from '@/types';
import { 
  mockMeetings, mockSales, mockSampleDistributions, 
  mockWorkLogs, mockDailyMetrics, mockUserMetrics, 
  mockTerritoryMetrics, mockActivityLogs, mockUsers, mockVendors
} from '@/data/mockData';
import type { User } from '@/types';

// In-memory storage for demo (simulating database)
let meetings = [...mockMeetings];
let sales = [...mockSales];
let samples = [...mockSampleDistributions];
let workLogs = [...mockWorkLogs];
let activityLogs = [...mockActivityLogs];
let vendors = [...mockVendors];

// Meeting Services
export const meetingService = {
  getAll: (): Meeting[] => meetings,
  
  getByUserId: (userId: string): Meeting[] => 
    meetings.filter(m => m.userId === userId),
  
  getById: (id: string): Meeting | undefined => 
    meetings.find(m => m.id === id),
  
  create: (meeting: Omit<Meeting, 'id' | 'createdAt'>): Meeting => {
    const newMeeting: Meeting = {
      ...meeting,
      id: `m${Date.now()}`,
      createdAt: new Date(),
    };
    meetings.push(newMeeting);
    
    // Add activity log
    const user = mockUsers.find(u => u.id === meeting.userId);
    activityLogs.push({
      id: `al${Date.now()}`,
      userId: meeting.userId,
      userName: user?.name || 'Unknown',
      action: 'created',
      entityType: 'meeting',
      entityId: newMeeting.id,
      timestamp: new Date(),
      details: `${meeting.type === 'one_on_one' ? 'One-on-one' : 'Group'} meeting with ${meeting.contactName}`,
    });
    
    return newMeeting;
  },
  
  update: (id: string, updates: Partial<Meeting>): Meeting | null => {
    const index = meetings.findIndex(m => m.id === id);
    if (index === -1) return null;
    
    meetings[index] = { ...meetings[index], ...updates };
    return meetings[index];
  },
  
  delete: (id: string): boolean => {
    const index = meetings.findIndex(m => m.id === id);
    if (index === -1) return false;
    meetings.splice(index, 1);
    return true;
  },
  
  getByDateRange: (startDate: Date, endDate: Date): Meeting[] =>
    meetings.filter(m => m.createdAt >= startDate && m.createdAt <= endDate),
  
  getByTerritory: (village: string): Meeting[] =>
    meetings.filter(m => m.village.toLowerCase().includes(village.toLowerCase())),
};

// Sale Services
export const saleService = {
  getAll: (): Sale[] => sales,
  
  getByUserId: (userId: string): Sale[] => 
    sales.filter(s => s.userId === userId),
  
  getById: (id: string): Sale | undefined => 
    sales.find(s => s.id === id),
  
  create: (sale: Omit<Sale, 'id' | 'createdAt'>): Sale => {
    const newSale: Sale = {
      ...sale,
      id: `s${Date.now()}`,
      createdAt: new Date(),
    };
    sales.push(newSale);
    
    // Add activity log
    const user = mockUsers.find(u => u.id === sale.userId);
    activityLogs.push({
      id: `al${Date.now()}`,
      userId: sale.userId,
      userName: user?.name || 'Unknown',
      action: 'created',
      entityType: 'sale',
      entityId: newSale.id,
      timestamp: new Date(),
      details: `${sale.type === 'b2c' ? 'B2C' : 'B2B'} sale to ${sale.customerName} - Rs. ${sale.totalValue.toLocaleString()}`,
    });
    
    return newSale;
  },
  
  update: (id: string, updates: Partial<Sale>): Sale | null => {
    const index = sales.findIndex(s => s.id === id);
    if (index === -1) return null;
    
    sales[index] = { ...sales[index], ...updates };
    return sales[index];
  },
  
  delete: (id: string): boolean => {
    const index = sales.findIndex(s => s.id === id);
    if (index === -1) return false;
    sales.splice(index, 1);
    return true;
  },
  
  getTotalRevenue: (): number => 
    sales.reduce((sum, s) => sum + s.totalValue, 0),
  
  getRevenueByType: () => ({
    b2c: sales.filter(s => s.type === 'b2c').reduce((sum, s) => sum + s.totalValue, 0),
    b2b: sales.filter(s => s.type === 'b2b').reduce((sum, s) => sum + s.totalValue, 0),
  }),
  
  getByDateRange: (startDate: Date, endDate: Date): Sale[] =>
    sales.filter(s => s.createdAt >= startDate && s.createdAt <= endDate),
};

// Sample Distribution Services
export const sampleService = {
  getAll: (): SampleDistribution[] => samples,
  
  getByUserId: (userId: string): SampleDistribution[] => 
    samples.filter(s => s.userId === userId),
  
  getById: (id: string): SampleDistribution | undefined => 
    samples.find(s => s.id === id),
  
  create: (sample: Omit<SampleDistribution, 'id' | 'createdAt'>): SampleDistribution => {
    const newSample: SampleDistribution = {
      ...sample,
      id: `sd${Date.now()}`,
      createdAt: new Date(),
    };
    samples.push(newSample);
    
    // Add activity log
    const user = mockUsers.find(u => u.id === sample.userId);
    activityLogs.push({
      id: `al${Date.now()}`,
      userId: sample.userId,
      userName: user?.name || 'Unknown',
      action: 'created',
      entityType: 'sample',
      entityId: newSample.id,
      timestamp: new Date(),
      details: `Sample distribution to ${sample.recipientName} - ${sample.quantity} ${sample.unit}`,
    });
    
    return newSample;
  },
  
  update: (id: string, updates: Partial<SampleDistribution>): SampleDistribution | null => {
    const index = samples.findIndex(s => s.id === id);
    if (index === -1) return null;
    
    samples[index] = { ...samples[index], ...updates };
    return samples[index];
  },
  
  delete: (id: string): boolean => {
    const index = samples.findIndex(s => s.id === id);
    if (index === -1) return false;
    samples.splice(index, 1);
    return true;
  },
  
  getTotalDistributed: (): number => 
    samples.reduce((sum, s) => sum + s.quantity, 0),
  
  getByDateRange: (startDate: Date, endDate: Date): SampleDistribution[] =>
    samples.filter(s => s.createdAt >= startDate && s.createdAt <= endDate),
};

// Work Log Services
export const workLogService = {
  getAll: (): WorkLog[] => workLogs,
  
  getByUserId: (userId: string): WorkLog[] => 
    workLogs.filter(w => w.userId === userId),
  
  getTodayLog: (userId: string): { start?: WorkLog; end?: WorkLog } => {
    const today = new Date().toDateString();
    const userLogs = workLogs.filter(w => w.userId === userId);
    return {
      start: userLogs.find(w => w.type === 'start' && w.timestamp.toDateString() === today),
      end: userLogs.find(w => w.type === 'end' && w.timestamp.toDateString() === today),
    };
  },
  
  create: (log: Omit<WorkLog, 'id'>): WorkLog => {
    const newLog: WorkLog = {
      ...log,
      id: `wl${Date.now()}`,
    };
    workLogs.push(newLog);
    
    // Add activity log
    const user = mockUsers.find(u => u.id === log.userId);
    activityLogs.push({
      id: `al${Date.now()}`,
      userId: log.userId,
      userName: user?.name || 'Unknown',
      action: 'created',
      entityType: 'work_log',
      entityId: newLog.id,
      timestamp: new Date(),
      details: `Work ${log.type === 'start' ? 'started' : 'ended'}`,
    });
    
    return newLog;
  },
  
  getDistanceTraveled: (userId: string, date: Date): number => {
    const userLogs = workLogs.filter(w => 
      w.userId === userId && 
      w.timestamp.toDateString() === date.toDateString()
    );
    
    const startLog = userLogs.find(w => w.type === 'start');
    const endLog = userLogs.find(w => w.type === 'end');
    
    if (startLog?.odometerReading && endLog?.odometerReading) {
      return endLog.odometerReading - startLog.odometerReading;
    }
    
    return Math.floor(Math.random() * 50) + 20; // Mock distance
  },
};

// Dashboard Services
export const dashboardService = {
  getDailyMetrics: (): DailyMetrics[] => mockDailyMetrics,
  
  getUserMetrics: (): UserMetrics[] => mockUserMetrics,
  
  getTerritoryMetrics: (): TerritoryMetrics[] => mockTerritoryMetrics,
  
  getActivityLogs: (limit: number = 50): ActivityLog[] => 
    activityLogs
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit),
  
  getSummaryStats: () => {
    const totalMeetings = meetings.length;
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, s) => sum + s.totalValue, 0);
    const totalSamples = samples.reduce((sum, s) => sum + s.quantity, 0);
    const b2cSales = sales.filter(s => s.type === 'b2c').length;
    const b2bSales = sales.filter(s => s.type === 'b2b').length;
    const b2cRevenue = sales.filter(s => s.type === 'b2c').reduce((sum, s) => sum + s.totalValue, 0);
    const b2bRevenue = sales.filter(s => s.type === 'b2b').reduce((sum, s) => sum + s.totalValue, 0);
    
    return {
      totalMeetings,
      totalSales,
      totalRevenue,
      totalSamples,
      b2cSales,
      b2bSales,
      b2cRevenue,
      b2bRevenue,
      conversionRate: totalMeetings > 0 ? Math.round((totalSales / totalMeetings) * 100) : 0,
    };
  },
  
  getRecentActivity: () => {
    return activityLogs
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);
  },
};

// User Services
export const userService = {
  getAll: (): User[] => mockUsers,
  
  getById: (id: string): User | undefined => 
    mockUsers.find(u => u.id === id),
  
  getFieldOfficers: (): User[] => 
    mockUsers.filter(u => u.role === 'field_officer' && u.isActive),
  
  getDistributors: (): User[] => 
    mockUsers.filter(u => u.role === 'distributor' && u.isActive),
  
  getActiveUsers: (): User[] => 
    mockUsers.filter(u => u.isActive),
};

// Location Services
export const locationService = {
  getCurrentPosition: (): Promise<GeoLocation> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        // Return mock location for demo
        resolve({
          latitude: 28.6139 + (Math.random() - 0.5) * 0.1,
          longitude: 77.2090 + (Math.random() - 0.5) * 0.1,
          accuracy: 10,
          timestamp: new Date(),
        });
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(),
          });
        },
        () => {
          // Return mock location on error
          resolve({
            latitude: 28.6139 + (Math.random() - 0.5) * 0.1,
            longitude: 77.2090 + (Math.random() - 0.5) * 0.1,
            accuracy: 10,
            timestamp: new Date(),
          });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  },
  
  calculateDistance: (loc1: GeoLocation, loc2: GeoLocation): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (loc2.latitude - loc1.latitude) * Math.PI / 180;
    const dLon = (loc2.longitude - loc1.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(loc1.latitude * Math.PI / 180) * Math.cos(loc2.latitude * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  },
};

// Vendor Services
export const vendorService = {
  getAll: (): Vendor[] => vendors,
  
  getById: (id: string): Vendor | undefined => 
    vendors.find(v => v.id === id),
  
  getByType: (type: StakeholderType): Vendor[] => 
    vendors.filter(v => v.type === type),
  
  getActive: (): Vendor[] => 
    vendors.filter(v => v.isActive),
  
  search: (filters: VendorSearchFilters): Vendor[] => {
    return vendors.filter(vendor => {
      // Search term filter (name, phone, business name)
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesName = vendor.name.toLowerCase().includes(searchLower);
        const matchesPhone = vendor.phone?.toLowerCase().includes(searchLower) || false;
        const matchesBusiness = vendor.businessName?.toLowerCase().includes(searchLower) || false;
        const matchesVillage = vendor.village.toLowerCase().includes(searchLower);
        if (!matchesName && !matchesPhone && !matchesBusiness && !matchesVillage) {
          return false;
        }
      }
      
      // Type filter
      if (filters.types.length > 0 && !filters.types.includes(vendor.type)) {
        return false;
      }
      
      // Village filter
      if (filters.villages.length > 0 && !filters.villages.includes(vendor.village)) {
        return false;
      }
      
      // State filter
      if (filters.states.length > 0 && !filters.states.includes(vendor.state || '')) {
        return false;
      }
      
      // Has purchases filter
      if (filters.hasPurchases !== null) {
        if (filters.hasPurchases && vendor.totalPurchases === 0) return false;
        if (!filters.hasPurchases && vendor.totalPurchases > 0) return false;
      }
      
      // Date range filter
      if (filters.dateRange.from && vendor.createdAt < filters.dateRange.from) return false;
      if (filters.dateRange.to && vendor.createdAt > filters.dateRange.to) return false;
      
      return true;
    });
  },
  
  create: (vendor: Omit<Vendor, 'id' | 'createdAt' | 'totalPurchases' | 'totalRevenue' | 'totalMeetings' | 'totalSamples'>): Vendor => {
    const newVendor: Vendor = {
      ...vendor,
      id: `v${Date.now()}`,
      createdAt: new Date(),
      totalPurchases: 0,
      totalRevenue: 0,
      totalMeetings: 0,
      totalSamples: 0,
    };
    vendors.push(newVendor);
    return newVendor;
  },
  
  update: (id: string, updates: Partial<Vendor>): Vendor | null => {
    const index = vendors.findIndex(v => v.id === id);
    if (index === -1) return null;
    vendors[index] = { ...vendors[index], ...updates };
    return vendors[index];
  },
  
  delete: (id: string): boolean => {
    const index = vendors.findIndex(v => v.id === id);
    if (index === -1) return false;
    vendors.splice(index, 1);
    return true;
  },
  
  getVendorStats: () => {
    return {
      total: vendors.length,
      active: vendors.filter(v => v.isActive).length,
      inactive: vendors.filter(v => !v.isActive).length,
      byType: {
        farmer: vendors.filter(v => v.type === 'farmer').length,
        seller: vendors.filter(v => v.type === 'seller').length,
        influencer: vendors.filter(v => v.type === 'influencer').length,
        veterinarian: vendors.filter(v => v.type === 'veterinarian').length,
        other: vendors.filter(v => v.type === 'other').length,
      },
      withPurchases: vendors.filter(v => v.totalPurchases > 0).length,
      totalRevenue: vendors.reduce((sum, v) => sum + v.totalRevenue, 0),
    };
  },
  
  getTopVendors: (limit: number = 10): Vendor[] => {
    return [...vendors]
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit);
  },
  
  getRecentVendors: (limit: number = 10): Vendor[] => {
    return [...vendors]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  },
  
  getUniqueVillages: (): string[] => {
    return [...new Set(vendors.map(v => v.village))].sort();
  },
  
  getUniqueStates: (): string[] => {
    return [...new Set(vendors.map(v => v.state).filter(Boolean))].sort() as string[];
  },
  
  // Update vendor metrics based on new activity
  updateMetrics: (vendorId: string, type: 'meeting' | 'sale' | 'sample', value?: number) => {
    const vendor = vendors.find(v => v.id === vendorId);
    if (!vendor) return;
    
    if (type === 'meeting') {
      vendor.totalMeetings += 1;
    } else if (type === 'sale' && value) {
      vendor.totalPurchases += 1;
      vendor.totalRevenue += value;
    } else if (type === 'sample') {
      vendor.totalSamples += 1;
    }
    vendor.lastContactDate = new Date();
  },
};
