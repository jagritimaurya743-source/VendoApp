import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { vendorService, locationService } from '@/services/dataService';
import type { Vendor, StakeholderType } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  MapPin, Navigation, Crosshair, 
  UserCheck, Phone, DollarSign, Package
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom icons for different vendor types
const createVendorIcon = (type: StakeholderType) => {
  const colors = {
    farmer: '#10B981',      // emerald
    seller: '#3B82F6',      // blue
    influencer: '#8B5CF6',  // purple
    veterinarian: '#F59E0B', // amber
    other: '#6B7280',       // gray
  };
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 32px;
      height: 32px;
      background-color: ${colors[type]};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 12px;
    ">${type.charAt(0).toUpperCase()}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

// Current location icon (RED)
const createCurrentLocationIcon = () => {
  return L.divIcon({
    className: 'current-location-marker',
    html: `<div style="
      width: 24px;
      height: 24px;
      background-color: #EF4444;
      border: 4px solid white;
      border-radius: 50%;
      box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.3), 0 2px 8px rgba(0,0,0,0.4);
      animation: pulse 2s infinite;
    "></div>
    <style>
      @keyframes pulse {
        0% { box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.3), 0 2px 8px rgba(0,0,0,0.4); }
        50% { box-shadow: 0 0 0 12px rgba(239, 68, 68, 0), 0 2px 8px rgba(0,0,0,0.4); }
        100% { box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.3), 0 2px 8px rgba(0,0,0,0.4); }
      }
    </style>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Map recenter component
const MapRecenter: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

interface VendorMapProps {
  filteredVendors?: Vendor[];
  showCurrentLocation?: boolean;
  height?: string;
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

const VendorMap: React.FC<VendorMapProps> = ({ 
  filteredVendors, 
  showCurrentLocation = true,
  height = '500px'
}) => {
  const [currentLocation, setCurrentLocation] = useState<{lat: number; lng: number} | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  
  const vendors = useMemo(() => {
    return filteredVendors || vendorService.getAll().filter(v => v.isActive);
  }, [filteredVendors]);
  
  // Default center (India)
  const defaultCenter: [number, number] = [28.6139, 77.2090];
  
  // Calculate map center based on vendors or current location
  const mapCenter: [number, number] = useMemo(() => {
    if (currentLocation) {
      return [currentLocation.lat, currentLocation.lng];
    }
    if (vendors.length > 0) {
      const avgLat = vendors.reduce((sum, v) => sum + (v.location?.latitude || 0), 0) / vendors.length;
      const avgLng = vendors.reduce((sum, v) => sum + (v.location?.longitude || 0), 0) / vendors.length;
      if (avgLat !== 0 && avgLng !== 0) {
        return [avgLat, avgLng];
      }
    }
    return defaultCenter;
  }, [vendors, currentLocation]);

  const getCurrentLocation = async () => {
    setIsLocating(true);
    try {
      const loc = await locationService.getCurrentPosition();
      setCurrentLocation({ lat: loc.latitude, lng: loc.longitude });
    } catch (error) {
      console.error('Error getting location:', error);
    } finally {
      setIsLocating(false);
    }
  };

  useEffect(() => {
    if (showCurrentLocation) {
      getCurrentLocation();
    }
  }, [showCurrentLocation]);

  // Generate mock locations for vendors that don't have GPS data
  const getVendorLocation = (vendor: Vendor, index: number): [number, number] | null => {
    if (vendor.location?.latitude && vendor.location?.longitude) {
      return [vendor.location.latitude, vendor.location.longitude];
    }
    // Generate consistent mock location based on vendor ID
    const baseLat = 28.6;
    const baseLng = 77.2;
    const offset = (index * 0.05) % 0.5;
    return [baseLat + offset, baseLng + (index % 2 === 0 ? offset : -offset)];
  };

  return (
    <div className="space-y-4">
      {/* Stats & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow"></div>
            <span className="text-sm text-gray-600">Your Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow"></div>
            <span className="text-sm text-gray-600">Farmer</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow"></div>
            <span className="text-sm text-gray-600">Seller</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-purple-500 border-2 border-white shadow"></div>
            <span className="text-sm text-gray-600">Influencer</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-amber-500 border-2 border-white shadow"></div>
            <span className="text-sm text-gray-600">Vet</span>
          </div>
        </div>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={getCurrentLocation}
          disabled={isLocating}
        >
          <Crosshair className="w-4 h-4 mr-2" />
          {isLocating ? 'Locating...' : 'My Location'}
        </Button>
      </div>

      {/* Map Container */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div style={{ height, width: '100%' }}>
            <MapContainer
              center={mapCenter}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              <MapRecenter center={mapCenter} />
              
              {/* Current Location Marker (RED) */}
              {currentLocation && (
                <>
                  <Marker
                    position={[currentLocation.lat, currentLocation.lng]}
                    icon={createCurrentLocationIcon()}
                  >
                    <Popup>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <Navigation className="w-4 h-4 text-red-500" />
                          <span className="font-semibold">Your Current Location</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                  {/* Accuracy circle */}
                  <Circle
                    center={[currentLocation.lat, currentLocation.lng]}
                    radius={100}
                    pathOptions={{
                      color: '#EF4444',
                      fillColor: '#EF4444',
                      fillOpacity: 0.1,
                      weight: 1,
                    }}
                  />
                </>
              )}
              
              {/* Vendor Markers */}
              {vendors.map((vendor, index) => {
                const location = getVendorLocation(vendor, index);
                if (!location) return null;
                
                return (
                  <Marker
                    key={vendor.id}
                    position={location}
                    icon={createVendorIcon(vendor.type)}
                  >
                    <Popup>
                      <div className="min-w-[200px]">
                        <div className="flex items-center gap-3 mb-2">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className={stakeholderTypeColors[vendor.type]}>
                              {vendor.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-sm">{vendor.name}</p>
                            {vendor.businessName && (
                              <p className="text-xs text-gray-500">{vendor.businessName}</p>
                            )}
                            <Badge className={`text-xs mt-1 ${stakeholderTypeColors[vendor.type]}`}>
                              {stakeholderTypeLabels[vendor.type]}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-1 text-xs">
                          {vendor.phone && (
                            <div className="flex items-center gap-1 text-gray-600">
                              <Phone className="w-3 h-3" />
                              {vendor.phone}
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-gray-600">
                            <MapPin className="w-3 h-3" />
                            {vendor.village}
                            {vendor.district && `, ${vendor.district}`}
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mt-2">
                          {vendor.totalPurchases > 0 && (
                            <div className="flex items-center gap-1 text-xs bg-emerald-50 px-2 py-1 rounded">
                              <DollarSign className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700">₹{vendor.totalRevenue.toLocaleString()}</span>
                            </div>
                          )}
                          {vendor.totalMeetings > 0 && (
                            <div className="flex items-center gap-1 text-xs bg-blue-50 px-2 py-1 rounded">
                              <UserCheck className="w-3 h-3 text-blue-600" />
                              <span className="text-blue-700">{vendor.totalMeetings}</span>
                            </div>
                          )}
                          {vendor.totalSamples > 0 && (
                            <div className="flex items-center gap-1 text-xs bg-amber-50 px-2 py-1 rounded">
                              <Package className="w-3 h-3 text-amber-600" />
                              <span className="text-amber-700">{vendor.totalSamples}</span>
                            </div>
                          )}
                        </div>
                        
                        {vendor.notes && (
                          <p className="text-xs text-gray-500 mt-2 italic">
                            "{vendor.notes}"
                          </p>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </CardContent>
      </Card>

      {/* Vendor Count */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Showing {vendors.length} vendors on map</span>
        {currentLocation && (
          <span className="flex items-center gap-1 text-red-600">
            <Navigation className="w-4 h-4" />
            Your location: {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
          </span>
        )}
      </div>
    </div>
  );
};

export default VendorMap;
