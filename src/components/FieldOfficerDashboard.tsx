import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { meetingService, saleService, sampleService, workLogService, locationService } from '@/services/dataService';
import VendorSearch from './VendorSearch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MapPin, Clock, Users, Package, DollarSign, LogOut, 
  Play, Square, ChevronRight, Plus, 
  User, Navigation, CheckCircle, Search
} from 'lucide-react';
import type { MeetingType, MeetingCategory, StakeholderType, SaleType, PaymentMode, DistributionPurpose } from '@/types';

const FieldOfficerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isWorking, setIsWorking] = useState(false);
  const [workStartTime, setWorkStartTime] = useState<Date | null>(null);
  const [location, setLocation] = useState<{lat: number; lng: number} | null>(null);
  const [myMeetings, setMyMeetings] = useState<any[]>([]);
  const [mySales, setMySales] = useState<any[]>([]);
  const [mySamples, setMySamples] = useState<any[]>([]);
  
  // Form states
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [showSampleForm, setShowSampleForm] = useState(false);

  useEffect(() => {
    if (user) {
      loadMyData();
      checkWorkStatus();
      getCurrentLocation();
    }
  }, [user]);

  const loadMyData = () => {
    if (!user) return;
    setMyMeetings(meetingService.getByUserId(user.id));
    setMySales(saleService.getByUserId(user.id));
    setMySamples(sampleService.getByUserId(user.id));
  };

  const checkWorkStatus = () => {
    if (!user) return;
    const todayLog = workLogService.getTodayLog(user.id);
    if (todayLog.start && !todayLog.end) {
      setIsWorking(true);
      setWorkStartTime(todayLog.start.timestamp);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const loc = await locationService.getCurrentPosition();
      setLocation({ lat: loc.latitude, lng: loc.longitude });
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const handleStartWork = async () => {
    if (!user) return;
    const loc = await locationService.getCurrentPosition();
    workLogService.create({
      userId: user.id,
      type: 'start',
      timestamp: new Date(),
      location: loc,
      notes: 'Started field work',
    });
    setIsWorking(true);
    setWorkStartTime(new Date());
  };

  const handleEndWork = async () => {
    if (!user) return;
    const loc = await locationService.getCurrentPosition();
    workLogService.create({
      userId: user.id,
      type: 'end',
      timestamp: new Date(),
      location: loc,
      notes: 'Ended field work',
    });
    setIsWorking(false);
    setWorkStartTime(null);
  };

  const handleLogout = () => {
    logout();
  };

  const stats = {
    todayMeetings: myMeetings.filter(m => new Date(m.createdAt).toDateString() === new Date().toDateString()).length,
    todaySales: mySales.filter(s => new Date(s.createdAt).toDateString() === new Date().toDateString()).length,
    todayRevenue: mySales
      .filter(s => new Date(s.createdAt).toDateString() === new Date().toDateString())
      .reduce((sum, s) => sum + s.totalValue, 0),
    totalSamples: mySamples.reduce((sum, s) => sum + s.quantity, 0),
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold">Field Officer</h1>
                <p className="text-xs text-white/80">{user?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {location && (
                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                  <Navigation className="w-3 h-3 mr-1" />
                  GPS Active
                </Badge>
              )}
              <Button variant="ghost" size="icon" onClick={handleLogout} className="text-white hover:bg-white/20">
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Work Status Bar */}
      <div className={`px-4 py-3 ${isWorking ? 'bg-emerald-50 border-b border-emerald-100' : 'bg-amber-50 border-b border-amber-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isWorking ? 'bg-emerald-100' : 'bg-amber-100'}`}>
              <Clock className={`w-5 h-5 ${isWorking ? 'text-emerald-600' : 'text-amber-600'}`} />
            </div>
            <div>
              <p className="text-sm font-medium">{isWorking ? 'Currently Working' : 'Not Started'}</p>
              {isWorking && workStartTime && (
                <p className="text-xs text-gray-500">
                  Started at {workStartTime.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
          <Button
            size="sm"
            onClick={isWorking ? handleEndWork : handleStartWork}
            className={isWorking ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'}
          >
            {isWorking ? (
              <><Square className="w-4 h-4 mr-1" /> End</>
            ) : (
              <><Play className="w-4 h-4 mr-1" /> Start</>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Home</TabsTrigger>
            <TabsTrigger value="meetings">Meetings</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="samples">Samples</TabsTrigger>
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.todayMeetings}</p>
                      <p className="text-xs text-gray-500">Today's Meetings</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">₹{stats.todayRevenue.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Today's Revenue</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.totalSamples}</p>
                      <p className="text-xs text-gray-500">Samples (kg)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.todaySales}</p>
                      <p className="text-xs text-gray-500">Today's Sales</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-between bg-emerald-500 hover:bg-emerald-600"
                  onClick={() => setShowMeetingForm(true)}
                >
                  <span className="flex items-center"><Users className="w-4 h-4 mr-2" /> Log Meeting</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button 
                  className="w-full justify-between bg-blue-500 hover:bg-blue-600"
                  onClick={() => setShowSaleForm(true)}
                >
                  <span className="flex items-center"><DollarSign className="w-4 h-4 mr-2" /> Record Sale</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button 
                  className="w-full justify-between bg-amber-500 hover:bg-amber-600"
                  onClick={() => setShowSampleForm(true)}
                >
                  <span className="flex items-center"><Package className="w-4 h-4 mr-2" /> Distribute Sample</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {myMeetings.slice(0, 3).map((meeting) => (
                    <div key={meeting.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{meeting.contactName}</p>
                        <p className="text-xs text-gray-500">{meeting.village} • {meeting.type}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {new Date(meeting.createdAt).toLocaleDateString()}
                      </Badge>
                    </div>
                  ))}
                  {myMeetings.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No recent meetings</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Meetings Tab */}
          <TabsContent value="meetings" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">My Meetings</h2>
              <Button size="sm" onClick={() => setShowMeetingForm(true)}>
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>
            <div className="space-y-3">
              {myMeetings.map((meeting) => (
                <Card key={meeting.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{meeting.contactName}</p>
                          <Badge variant={meeting.type === 'one_on_one' ? 'default' : 'secondary'} className="text-xs">
                            {meeting.type === 'one_on_one' ? '1-on-1' : 'Group'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">{meeting.village}</p>
                        <p className="text-sm text-gray-600 mt-1">{meeting.notes}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">{meeting.category}</Badge>
                          <Badge variant="outline" className="text-xs">{meeting.stakeholderType}</Badge>
                        </div>
                        {meeting.attendanceCount && (
                          <p className="text-xs text-gray-500 mt-1">
                            Attendance: {meeting.attendanceCount} people
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {myMeetings.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No meetings recorded yet</p>
                    <Button className="mt-3" onClick={() => setShowMeetingForm(true)}>
                      Log Your First Meeting
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Sales Tab */}
          <TabsContent value="sales" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">My Sales</h2>
              <Button size="sm" onClick={() => setShowSaleForm(true)}>
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>
            <div className="space-y-3">
              {mySales.map((sale) => (
                <Card key={sale.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <DollarSign className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{sale.customerName}</p>
                          <Badge variant={sale.type === 'b2c' ? 'default' : 'secondary'} className="text-xs">
                            {sale.type === 'b2c' ? 'B2C' : 'B2B'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">{sale.village}</p>
                        <p className="text-sm font-medium text-emerald-600 mt-1">
                          ₹{sale.totalValue.toLocaleString()} • {sale.productName}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">{sale.paymentMode}</Badge>
                          {sale.isRepeatOrder && (
                            <Badge variant="outline" className="text-xs bg-amber-50 text-amber-600">Repeat</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {mySales.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No sales recorded yet</p>
                    <Button className="mt-3" onClick={() => setShowSaleForm(true)}>
                      Record Your First Sale
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Samples Tab */}
          <TabsContent value="samples" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Sample Distribution</h2>
              <Button size="sm" onClick={() => setShowSampleForm(true)}>
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>
            <div className="space-y-3">
              {mySamples.map((sample) => (
                <Card key={sample.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="w-5 h-5 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{sample.recipientName}</p>
                        <p className="text-sm text-gray-500">{sample.village}</p>
                        <p className="text-sm font-medium text-amber-600 mt-1">
                          {sample.quantity} {sample.unit} • {sample.productName}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">{sample.purpose}</Badge>
                          <Badge variant="outline" className="text-xs">{sample.stakeholderType}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {mySamples.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No samples distributed yet</p>
                    <Button className="mt-3" onClick={() => setShowSampleForm(true)}>
                      Distribute Your First Sample
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Vendors Tab */}
          <TabsContent value="vendors" className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Search className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-bold">Search Vendors</h2>
            </div>
            <p className="text-sm text-gray-500 -mt-2 mb-2">
              Find farmers, sellers, veterinarians, and other stakeholders
            </p>
            <VendorSearch />
          </TabsContent>
        </Tabs>
      </main>

      {/* Meeting Form Dialog */}
      <MeetingFormDialog 
        open={showMeetingForm} 
        onClose={() => { setShowMeetingForm(false); loadMyData(); }}
        userId={user?.id || ''}
      />

      {/* Sale Form Dialog */}
      <SaleFormDialog 
        open={showSaleForm} 
        onClose={() => { setShowSaleForm(false); loadMyData(); }}
        userId={user?.id || ''}
      />

      {/* Sample Form Dialog */}
      <SampleFormDialog 
        open={showSampleForm} 
        onClose={() => { setShowSampleForm(false); loadMyData(); }}
        userId={user?.id || ''}
      />
    </div>
  );
};

// Meeting Form Dialog Component
const MeetingFormDialog: React.FC<{ open: boolean; onClose: () => void; userId: string }> = ({ open, onClose, userId }) => {
  const [formData, setFormData] = useState({
    type: 'one_on_one' as MeetingType,
    category: 'product_demo' as MeetingCategory,
    stakeholderType: 'farmer' as StakeholderType,
    contactName: '',
    contactPhone: '',
    village: '',
    attendanceCount: '',
    businessPotential: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const location = await locationService.getCurrentPosition();
      meetingService.create({
        userId,
        type: formData.type,
        category: formData.category,
        stakeholderType: formData.stakeholderType,
        contactName: formData.contactName,
        contactPhone: formData.contactPhone,
        village: formData.village,
        location,
        attendanceCount: formData.attendanceCount ? parseInt(formData.attendanceCount) : undefined,
        businessPotential: formData.businessPotential,
        notes: formData.notes,
        photos: [],
      });
      onClose();
    } catch (error) {
      console.error('Error creating meeting:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log Meeting</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Meeting Type</Label>
            <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v as MeetingType})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="one_on_one">One-on-One</SelectItem>
                <SelectItem value="group">Group Meeting</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v as MeetingCategory})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="product_demo">Product Demo</SelectItem>
                <SelectItem value="farmer_training">Farmer Training</SelectItem>
                <SelectItem value="feedback_session">Feedback Session</SelectItem>
                <SelectItem value="sales_event">Sales Event</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Stakeholder Type</Label>
            <Select value={formData.stakeholderType} onValueChange={(v) => setFormData({...formData, stakeholderType: v as StakeholderType})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="farmer">Farmer</SelectItem>
                <SelectItem value="seller">Seller</SelectItem>
                <SelectItem value="influencer">Influencer</SelectItem>
                <SelectItem value="veterinarian">Veterinarian</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Contact Name *</Label>
            <Input 
              value={formData.contactName} 
              onChange={(e) => setFormData({...formData, contactName: e.target.value})}
              placeholder="Enter name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input 
              value={formData.contactPhone} 
              onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
              placeholder="+91-XXXXXXXXXX"
            />
          </div>

          <div className="space-y-2">
            <Label>Village *</Label>
            <Input 
              value={formData.village} 
              onChange={(e) => setFormData({...formData, village: e.target.value})}
              placeholder="Enter village name"
              required
            />
          </div>

          {formData.type === 'group' && (
            <div className="space-y-2">
              <Label>Attendance Count</Label>
              <Input 
                type="number"
                value={formData.attendanceCount} 
                onChange={(e) => setFormData({...formData, attendanceCount: e.target.value})}
                placeholder="Number of attendees"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Business Potential</Label>
            <Input 
              value={formData.businessPotential} 
              onChange={(e) => setFormData({...formData, businessPotential: e.target.value})}
              placeholder="e.g., 5-10 kg"
            />
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea 
              value={formData.notes} 
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Meeting notes..."
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Meeting'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Sale Form Dialog Component
const SaleFormDialog: React.FC<{ open: boolean; onClose: () => void; userId: string }> = ({ open, onClose, userId }) => {
  const [formData, setFormData] = useState({
    type: 'b2c' as SaleType,
    customerName: '',
    customerContact: '',
    customerType: 'farmer' as StakeholderType,
    businessName: '',
    productSku: 'OB-CF-001',
    productName: 'Cattle Feed Supplement - Premium',
    packSize: '5kg',
    quantity: '1',
    unitPrice: '450',
    paymentMode: 'cash' as PaymentMode,
    village: '',
    isRepeatOrder: false,
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const location = await locationService.getCurrentPosition();
      const quantity = parseInt(formData.quantity);
      const unitPrice = parseFloat(formData.unitPrice);
      saleService.create({
        userId,
        type: formData.type,
        customerName: formData.customerName,
        customerContact: formData.customerContact,
        customerType: formData.customerType,
        businessName: formData.type === 'b2b' ? formData.businessName : undefined,
        productSku: formData.productSku,
        productName: formData.productName,
        packSize: formData.packSize,
        quantity,
        unitPrice,
        totalValue: quantity * unitPrice,
        paymentMode: formData.paymentMode,
        location,
        village: formData.village,
        isRepeatOrder: formData.isRepeatOrder,
        notes: formData.notes,
      });
      onClose();
    } catch (error) {
      console.error('Error creating sale:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Sale</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Sale Type</Label>
            <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v as SaleType})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="b2c">B2C - Direct Farmer</SelectItem>
                <SelectItem value="b2b">B2B - Distributor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Customer Name *</Label>
            <Input 
              value={formData.customerName} 
              onChange={(e) => setFormData({...formData, customerName: e.target.value})}
              placeholder="Enter customer name"
              required
            />
          </div>

          {formData.type === 'b2b' && (
            <div className="space-y-2">
              <Label>Business Name</Label>
              <Input 
                value={formData.businessName} 
                onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                placeholder="Enter business name"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input 
              value={formData.customerContact} 
              onChange={(e) => setFormData({...formData, customerContact: e.target.value})}
              placeholder="+91-XXXXXXXXXX"
            />
          </div>

          <div className="space-y-2">
            <Label>Village *</Label>
            <Input 
              value={formData.village} 
              onChange={(e) => setFormData({...formData, village: e.target.value})}
              placeholder="Enter village name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Product</Label>
            <Select value={formData.productSku} onValueChange={(v) => {
              const product = v === 'OB-CF-001' 
                ? { name: 'Cattle Feed Supplement - Premium', price: '450' }
                : { name: 'Cattle Feed Supplement - Standard', price: '750' };
              setFormData({...formData, productSku: v, productName: product.name, unitPrice: product.price});
            }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="OB-CF-001">Cattle Feed Supplement - Premium</SelectItem>
                <SelectItem value="OB-CF-002">Cattle Feed Supplement - Standard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input 
                type="number"
                value={formData.quantity} 
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label>Unit Price (₹)</Label>
              <Input 
                type="number"
                value={formData.unitPrice} 
                onChange={(e) => setFormData({...formData, unitPrice: e.target.value})}
              />
            </div>
          </div>

          <div className="p-3 bg-emerald-50 rounded-lg">
            <p className="text-sm text-emerald-700">
              Total: <span className="font-bold">₹{(parseInt(formData.quantity || '0') * parseFloat(formData.unitPrice || '0')).toLocaleString()}</span>
            </p>
          </div>

          <div className="space-y-2">
            <Label>Payment Mode</Label>
            <Select value={formData.paymentMode} onValueChange={(v) => setFormData({...formData, paymentMode: v as PaymentMode})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="digital">Digital/UPI</SelectItem>
                <SelectItem value="credit">Credit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="checkbox"
              id="repeat"
              checked={formData.isRepeatOrder}
              onChange={(e) => setFormData({...formData, isRepeatOrder: e.target.checked})}
              className="rounded"
            />
            <Label htmlFor="repeat" className="text-sm cursor-pointer">Repeat Customer</Label>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea 
              value={formData.notes} 
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Additional notes..."
              rows={2}
            />
          </div>

          <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Record Sale'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Sample Form Dialog Component
const SampleFormDialog: React.FC<{ open: boolean; onClose: () => void; userId: string }> = ({ open, onClose, userId }) => {
  const [formData, setFormData] = useState({
    recipientName: '',
    recipientContact: '',
    stakeholderType: 'farmer' as StakeholderType,
    productSku: 'OB-CF-001',
    productName: 'Cattle Feed Supplement - Premium',
    quantity: '1',
    unit: 'kg',
    batchNumber: '',
    purpose: 'trial' as DistributionPurpose,
    village: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const location = await locationService.getCurrentPosition();
      sampleService.create({
        userId,
        recipientName: formData.recipientName,
        recipientContact: formData.recipientContact,
        stakeholderType: formData.stakeholderType,
        productSku: formData.productSku,
        productName: formData.productName,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        batchNumber: formData.batchNumber,
        purpose: formData.purpose,
        location,
        village: formData.village,
        notes: formData.notes,
      });
      onClose();
    } catch (error) {
      console.error('Error creating sample record:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Distribute Sample</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Recipient Name *</Label>
            <Input 
              value={formData.recipientName} 
              onChange={(e) => setFormData({...formData, recipientName: e.target.value})}
              placeholder="Enter recipient name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input 
              value={formData.recipientContact} 
              onChange={(e) => setFormData({...formData, recipientContact: e.target.value})}
              placeholder="+91-XXXXXXXXXX"
            />
          </div>

          <div className="space-y-2">
            <Label>Stakeholder Type</Label>
            <Select value={formData.stakeholderType} onValueChange={(v) => setFormData({...formData, stakeholderType: v as StakeholderType})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="farmer">Farmer</SelectItem>
                <SelectItem value="seller">Seller</SelectItem>
                <SelectItem value="influencer">Influencer</SelectItem>
                <SelectItem value="veterinarian">Veterinarian</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Village *</Label>
            <Input 
              value={formData.village} 
              onChange={(e) => setFormData({...formData, village: e.target.value})}
              placeholder="Enter village name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Product</Label>
            <Select value={formData.productSku} onValueChange={(v) => {
              const product = v === 'OB-CF-001' 
                ? { name: 'Cattle Feed Supplement - Premium' }
                : { name: 'Cattle Feed Supplement - Standard' };
              setFormData({...formData, productSku: v, productName: product.name});
            }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="OB-CF-001">Cattle Feed Supplement - Premium</SelectItem>
                <SelectItem value="OB-CF-002">Cattle Feed Supplement - Standard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input 
                type="number"
                step="0.1"
                value={formData.quantity} 
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                min="0.1"
              />
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <Select value={formData.unit} onValueChange={(v) => setFormData({...formData, unit: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="g">g</SelectItem>
                  <SelectItem value="units">units</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Batch Number</Label>
            <Input 
              value={formData.batchNumber} 
              onChange={(e) => setFormData({...formData, batchNumber: e.target.value})}
              placeholder="e.g., BATCH-2026-001"
            />
          </div>

          <div className="space-y-2">
            <Label>Purpose</Label>
            <Select value={formData.purpose} onValueChange={(v) => setFormData({...formData, purpose: v as DistributionPurpose})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="demo">Demo</SelectItem>
                <SelectItem value="follow_up">Follow-up</SelectItem>
                <SelectItem value="promotional">Promotional</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea 
              value={formData.notes} 
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Additional notes..."
              rows={2}
            />
          </div>

          <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Distribute Sample'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FieldOfficerDashboard;
