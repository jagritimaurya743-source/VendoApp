import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { saleService, workLogService, locationService } from '@/services/dataService';
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
  Clock, TrendingUp, DollarSign, LogOut, 
  Play, Square, Store, ChevronRight, Plus, 
  Package, Navigation, BarChart3
} from 'lucide-react';
import type { SaleType, PaymentMode } from '@/types';

const DistributorDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isWorking, setIsWorking] = useState(false);
  const [workStartTime, setWorkStartTime] = useState<Date | null>(null);
  const [location, setLocation] = useState<{lat: number; lng: number} | null>(null);
  const [mySales, setMySales] = useState<any[]>([]);
  const [showSaleForm, setShowSaleForm] = useState(false);

  useEffect(() => {
    if (user) {
      loadMyData();
      checkWorkStatus();
      getCurrentLocation();
    }
  }, [user]);

  const loadMyData = () => {
    if (!user) return;
    setMySales(saleService.getByUserId(user.id));
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
      notes: 'Started distribution work',
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
      notes: 'Ended distribution work',
    });
    setIsWorking(false);
    setWorkStartTime(null);
  };

  const handleLogout = () => {
    logout();
  };

  const stats = {
    todaySales: mySales.filter(s => new Date(s.createdAt).toDateString() === new Date().toDateString()).length,
    todayRevenue: mySales
      .filter(s => new Date(s.createdAt).toDateString() === new Date().toDateString())
      .reduce((sum, s) => sum + s.totalValue, 0),
    totalSales: mySales.length,
    totalRevenue: mySales.reduce((sum, s) => sum + s.totalValue, 0),
    b2bSales: mySales.filter(s => s.type === 'b2b').length,
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-500 to-orange-600 text-white sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold">Distributor</h1>
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="sales">My Sales</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.todaySales}</p>
                      <p className="text-xs text-gray-500">Today's Sales</p>
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
                      <p className="text-2xl font-bold">₹{stats.todayRevenue.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Today's Revenue</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.totalSales}</p>
                      <p className="text-xs text-gray-500">Total Sales</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Total Revenue</p>
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
                  onClick={() => setShowSaleForm(true)}
                >
                  <span className="flex items-center"><DollarSign className="w-4 h-4 mr-2" /> Record B2B Sale</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => setActiveTab('sales')}
                >
                  <span className="flex items-center"><Package className="w-4 h-4 mr-2" /> View All Sales</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Performance Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">B2B Orders</span>
                    <span className="font-bold">{stats.b2bSales}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Average Order Value</span>
                    <span className="font-bold">
                      ₹{stats.totalSales > 0 ? Math.round(stats.totalRevenue / stats.totalSales).toLocaleString() : 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Territory</span>
                    <span className="font-bold">{user?.territory || 'N/A'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sales Tab */}
          <TabsContent value="sales" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">My Sales Orders</h2>
              <Button size="sm" onClick={() => setShowSaleForm(true)}>
                <Plus className="w-4 h-4 mr-1" /> Add Order
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
                        {sale.businessName && (
                          <p className="text-sm text-gray-500">{sale.businessName}</p>
                        )}
                        <p className="text-sm text-gray-500">{sale.village}</p>
                        <p className="text-sm font-medium text-emerald-600 mt-1">
                          ₹{sale.totalValue.toLocaleString()} • {sale.productName}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">{sale.paymentMode}</Badge>
                          <Badge variant="outline" className="text-xs">{sale.quantity} x {sale.packSize}</Badge>
                          {sale.isRepeatOrder && (
                            <Badge variant="outline" className="text-xs bg-amber-50 text-amber-600">Repeat</Badge>
                          )}
                        </div>
                        {sale.deliveryTimeline && (
                          <p className="text-xs text-gray-500 mt-1">
                            Delivery: {sale.deliveryTimeline}
                          </p>
                        )}
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
        </Tabs>
      </main>

      {/* Sale Form Dialog */}
      <SaleFormDialog 
        open={showSaleForm} 
        onClose={() => { setShowSaleForm(false); loadMyData(); }}
        userId={user?.id || ''}
      />
    </div>
  );
};

// Sale Form Dialog Component
const SaleFormDialog: React.FC<{ open: boolean; onClose: () => void; userId: string }> = ({ open, onClose, userId }) => {
  const [formData, setFormData] = useState({
    type: 'b2b' as SaleType,
    customerName: '',
    customerContact: '',
    businessName: '',
    productSku: 'OB-CF-001',
    productName: 'Cattle Feed Supplement - Premium',
    packSize: '5kg',
    quantity: '10',
    unitPrice: '380',
    paymentMode: 'credit' as PaymentMode,
    village: '',
    deliveryTimeline: '',
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
        businessName: formData.businessName,
        productSku: formData.productSku,
        productName: formData.productName,
        packSize: formData.packSize,
        quantity,
        unitPrice,
        totalValue: quantity * unitPrice,
        paymentMode: formData.paymentMode,
        location,
        village: formData.village,
        deliveryTimeline: formData.deliveryTimeline,
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
          <DialogTitle>Record B2B Order</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Business Name *</Label>
            <Input 
              value={formData.businessName} 
              onChange={(e) => setFormData({...formData, businessName: e.target.value})}
              placeholder="Enter business name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Contact Person *</Label>
            <Input 
              value={formData.customerName} 
              onChange={(e) => setFormData({...formData, customerName: e.target.value})}
              placeholder="Enter contact name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input 
              value={formData.customerContact} 
              onChange={(e) => setFormData({...formData, customerContact: e.target.value})}
              placeholder="+91-XXXXXXXXXX"
            />
          </div>

          <div className="space-y-2">
            <Label>Location/Village *</Label>
            <Input 
              value={formData.village} 
              onChange={(e) => setFormData({...formData, village: e.target.value})}
              placeholder="Enter location"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Product</Label>
            <Select value={formData.productSku} onValueChange={(v) => {
              const product = v === 'OB-CF-001' 
                ? { name: 'Cattle Feed Supplement - Premium', price: '380' }
                : { name: 'Cattle Feed Supplement - Standard', price: '620' };
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
              Order Total: <span className="font-bold text-lg">
                ₹{(parseInt(formData.quantity || '0') * parseFloat(formData.unitPrice || '0')).toLocaleString()}
              </span>
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

          <div className="space-y-2">
            <Label>Delivery Timeline</Label>
            <Input 
              value={formData.deliveryTimeline} 
              onChange={(e) => setFormData({...formData, deliveryTimeline: e.target.value})}
              placeholder="e.g., 3 days, Same day"
            />
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

          <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Record Order'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DistributorDashboard;
