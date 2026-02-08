import React, { useState, useMemo } from 'react';
import { vendorService } from '@/services/dataService';
import VendorMap from './VendorMap';
import type { Vendor, VendorSearchFilters, StakeholderType } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { 
  Search, Filter, X, User, Phone, MapPin, Store, 
  TrendingUp, Calendar, Users, Package, DollarSign,
  Briefcase, LayoutList, Map
} from 'lucide-react';

interface VendorSearchProps {
  onSelectVendor?: (vendor: Vendor) => void;
  selectable?: boolean;
}

const stakeholderTypeLabels: Record<StakeholderType, string> = {
  farmer: 'Farmer',
  seller: 'Seller/Retailer',
  influencer: 'Influencer',
  veterinarian: 'Veterinarian',
  other: 'Other',
};

const stakeholderTypeColors: Record<StakeholderType, string> = {
  farmer: 'bg-emerald-100 text-emerald-700',
  seller: 'bg-blue-100 text-blue-700',
  influencer: 'bg-purple-100 text-purple-700',
  veterinarian: 'bg-amber-100 text-amber-700',
  other: 'bg-gray-100 text-gray-700',
};

const VendorSearch: React.FC<VendorSearchProps> = ({ onSelectVendor, selectable = false }) => {
  const [filters, setFilters] = useState<VendorSearchFilters>({
    searchTerm: '',
    types: [],
    villages: [],
    states: [],
    hasPurchases: null,
    dateRange: { from: null, to: null },
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showVendorDetails, setShowVendorDetails] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  
  const allVendors = useMemo(() => vendorService.getAll(), []);
  const filteredVendors = useMemo(() => vendorService.search(filters), [filters]);
  const villages = useMemo(() => vendorService.getUniqueVillages(), []);
  const states = useMemo(() => vendorService.getUniqueStates(), []);
  const stats = useMemo(() => vendorService.getVendorStats(), []);

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, searchTerm: value }));
  };

  const handleTypeToggle = (type: StakeholderType) => {
    setFilters(prev => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type]
    }));
  };

  const handleVillageToggle = (village: string) => {
    setFilters(prev => ({
      ...prev,
      villages: prev.villages.includes(village)
        ? prev.villages.filter(v => v !== village)
        : [...prev.villages, village]
    }));
  };

  const handleStateToggle = (state: string) => {
    setFilters(prev => ({
      ...prev,
      states: prev.states.includes(state)
        ? prev.states.filter(s => s !== state)
        : [...prev.states, state]
    }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      types: [],
      villages: [],
      states: [],
      hasPurchases: null,
      dateRange: { from: null, to: null },
    });
  };

  const handleVendorClick = (vendor: Vendor) => {
    if (selectable && onSelectVendor) {
      onSelectVendor(vendor);
    } else {
      setSelectedVendor(vendor);
      setShowVendorDetails(true);
    }
  };

  const activeFiltersCount = filters.types.length + filters.villages.length + filters.states.length + 
    (filters.hasPurchases !== null ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-gray-500">Total Vendors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.withPurchases}</p>
                <p className="text-xs text-gray-500">With Purchases</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">₹{(stats.totalRevenue / 1000).toFixed(0)}k</p>
                <p className="text-xs text-gray-500">Total Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.byType.farmer}</p>
                <p className="text-xs text-gray-500">Farmers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, phone, business, or village..."
                value={filters.searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
              {filters.searchTerm && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="relative"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-emerald-500 text-white text-xs rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Type Filter */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Vendor Type</Label>
                  <div className="space-y-2">
                    {(Object.keys(stakeholderTypeLabels) as StakeholderType[]).map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`type-${type}`}
                          checked={filters.types.includes(type)}
                          onCheckedChange={() => handleTypeToggle(type)}
                        />
                        <Label htmlFor={`type-${type}`} className="text-sm cursor-pointer">
                          {stakeholderTypeLabels[type]}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Village Filter */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Village</Label>
                  <ScrollArea className="h-40">
                    <div className="space-y-2 pr-4">
                      {villages.map((village) => (
                        <div key={village} className="flex items-center space-x-2">
                          <Checkbox
                            id={`village-${village}`}
                            checked={filters.villages.includes(village)}
                            onCheckedChange={() => handleVillageToggle(village)}
                          />
                          <Label htmlFor={`village-${village}`} className="text-sm cursor-pointer">
                            {village}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* State & Purchase Filter */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">State</Label>
                    <Select 
                      value={filters.states[0] || 'all'} 
                      onValueChange={(v) => handleStateToggle(v === 'all' ? '' : v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All States</SelectItem>
                        {states.map((state) => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Purchase Status</Label>
                    <Select 
                      value={filters.hasPurchases === null ? 'all' : filters.hasPurchases ? 'yes' : 'no'} 
                      onValueChange={(v) => setFilters(prev => ({ 
                        ...prev, 
                        hasPurchases: v === 'all' ? null : v === 'yes' 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Vendors</SelectItem>
                        <SelectItem value="yes">Has Purchases</SelectItem>
                        <SelectItem value="no">No Purchases</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {activeFiltersCount > 0 && (
                <div className="mt-4 flex justify-end">
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="w-4 h-4 mr-1" />
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Count & View Toggle */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing <span className="font-medium">{filteredVendors.length}</span> of{' '}
          <span className="font-medium">{allVendors.length}</span> vendors
        </p>
        <div className="flex items-center gap-3">
          {activeFiltersCount > 0 && (
            <div className="flex gap-2 flex-wrap">
              {filters.types.map(type => (
                <Badge key={type} variant="secondary" className="cursor-pointer" onClick={() => handleTypeToggle(type)}>
                  {stakeholderTypeLabels[type]} <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
              {filters.villages.map(village => (
                <Badge key={village} variant="secondary" className="cursor-pointer" onClick={() => handleVillageToggle(village)}>
                  {village} <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
          )}
          {/* View Mode Toggle */}
          <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as 'list' | 'map')}>
            <ToggleGroupItem value="list" aria-label="List view">
              <LayoutList className="w-4 h-4 mr-1" />
              List
            </ToggleGroupItem>
            <ToggleGroupItem value="map" aria-label="Map view">
              <Map className="w-4 h-4 mr-1" />
              Map
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {/* Map View */}
      {viewMode === 'map' && (
        <VendorMap filteredVendors={filteredVendors} showCurrentLocation={true} height="450px" />
      )}

      {/* Vendor List */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {filteredVendors.map((vendor) => (
          <Card 
            key={vendor.id} 
            className={`cursor-pointer transition-shadow hover:shadow-md ${selectable ? 'hover:border-emerald-300' : ''}`}
            onClick={() => handleVendorClick(vendor)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className={stakeholderTypeColors[vendor.type]}>
                    {vendor.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{vendor.name}</h3>
                        {!vendor.isActive && (
                          <Badge variant="destructive" className="text-xs">Inactive</Badge>
                        )}
                      </div>
                      {vendor.businessName && (
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Store className="w-3 h-3" />
                          {vendor.businessName}
                        </p>
                      )}
                    </div>
                    <Badge className={stakeholderTypeColors[vendor.type]}>
                      {stakeholderTypeLabels[vendor.type]}
                    </Badge>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-500">
                    {vendor.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {vendor.phone}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {vendor.village}{vendor.district ? `, ${vendor.district}` : ''}
                    </span>
                    {vendor.lastContactDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Last contact: {new Date(vendor.lastContactDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {vendor.totalPurchases > 0 && (
                      <Badge variant="outline" className="text-xs">
                        <DollarSign className="w-3 h-3 mr-1" />
                        ₹{vendor.totalRevenue.toLocaleString()} revenue
                      </Badge>
                    )}
                    {vendor.totalMeetings > 0 && (
                      <Badge variant="outline" className="text-xs">
                        <Users className="w-3 h-3 mr-1" />
                        {vendor.totalMeetings} meetings
                      </Badge>
                    )}
                    {vendor.totalSamples > 0 && (
                      <Badge variant="outline" className="text-xs">
                        <Package className="w-3 h-3 mr-1" />
                        {vendor.totalSamples} samples
                      </Badge>
                    )}
                  </div>

                  {vendor.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {vendor.tags.map((tag) => (
                        <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredVendors.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No vendors found matching your criteria</p>
              <Button className="mt-3" variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      )}

      {/* Vendor Details Dialog */}
      <Dialog open={showVendorDetails} onOpenChange={setShowVendorDetails}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedVendor && (
            <>
              <DialogHeader>
                <DialogTitle>Vendor Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className={`text-lg ${stakeholderTypeColors[selectedVendor.type]}`}>
                      {selectedVendor.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-bold">{selectedVendor.name}</h2>
                    {selectedVendor.businessName && (
                      <p className="text-gray-500 flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {selectedVendor.businessName}
                      </p>
                    )}
                    <Badge className={`mt-1 ${stakeholderTypeColors[selectedVendor.type]}`}>
                      {stakeholderTypeLabels[selectedVendor.type]}
                    </Badge>
                  </div>
                </div>

                <Separator />

                {/* Contact Info */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-gray-500 uppercase">Contact Information</h3>
                  <div className="space-y-2">
                    {selectedVendor.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{selectedVendor.phone}</span>
                      </div>
                    )}
                    {selectedVendor.email && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>{selectedVendor.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>
                        {selectedVendor.village}
                        {selectedVendor.district && `, ${selectedVendor.district}`}
                        {selectedVendor.state && `, ${selectedVendor.state}`}
                      </span>
                    </div>
                    {selectedVendor.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                        <span>{selectedVendor.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Activity Stats */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-gray-500 uppercase">Activity Summary</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold">{selectedVendor.totalMeetings}</p>
                      <p className="text-xs text-gray-500">Meetings</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold">{selectedVendor.totalPurchases}</p>
                      <p className="text-xs text-gray-500">Purchases</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold">{selectedVendor.totalSamples}</p>
                      <p className="text-xs text-gray-500">Samples</p>
                    </div>
                  </div>
                  {selectedVendor.totalRevenue > 0 && (
                    <div className="bg-emerald-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Total Revenue Generated</p>
                      <p className="text-2xl font-bold text-emerald-600">
                        ₹{selectedVendor.totalRevenue.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Additional Info */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-gray-500 uppercase">Additional Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status</span>
                      <Badge variant={selectedVendor.isActive ? 'default' : 'destructive'}>
                        {selectedVendor.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Added On</span>
                      <span>{new Date(selectedVendor.createdAt).toLocaleDateString()}</span>
                    </div>
                    {selectedVendor.lastContactDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Last Contact</span>
                        <span>{new Date(selectedVendor.lastContactDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedVendor.notes && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm text-gray-500 uppercase">Notes</h3>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {selectedVendor.notes}
                      </p>
                    </div>
                  </>
                )}

                {selectedVendor.tags.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm text-gray-500 uppercase">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedVendor.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorSearch;
