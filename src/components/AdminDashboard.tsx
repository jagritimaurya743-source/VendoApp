import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardService, userService } from '@/services/dataService';
import VendorSearch from './VendorSearch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
  BarChart, Bar
} from 'recharts';
import { 
  LayoutDashboard, Users, MapPin, TrendingUp, DollarSign, 
  Package, Calendar, LogOut, Activity, ArrowUpRight, 
  ArrowDownRight, UserCheck, Store, ChevronRight, Search
} from 'lucide-react';

// Chart colors available for use
// const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [dailyMetrics, setDailyMetrics] = useState<any[]>([]);
  const [userMetrics, setUserMetrics] = useState<any[]>([]);
  const [territoryMetrics, setTerritoryMetrics] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    setStats(dashboardService.getSummaryStats());
    setDailyMetrics(dashboardService.getDailyMetrics());
    setUserMetrics(dashboardService.getUserMetrics());
    setTerritoryMetrics(dashboardService.getTerritoryMetrics());
    setRecentActivity(dashboardService.getRecentActivity());
  };

  const handleLogout = () => {
    logout();
  };

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Occamy Bioscience</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="territory">Territory</TabsTrigger>
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Meetings</p>
                      <p className="text-2xl font-bold">{stats.totalMeetings}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs text-emerald-600">+12% this week</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-emerald-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Sales</p>
                      <p className="text-2xl font-bold">{stats.totalSales}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <ArrowUpRight className="w-4 h-4 text-blue-500" />
                        <span className="text-xs text-blue-600">+8% this week</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Revenue</p>
                      <p className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <ArrowUpRight className="w-4 h-4 text-amber-500" />
                        <span className="text-xs text-amber-600">+15% this week</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Samples Distributed</p>
                      <p className="text-2xl font-bold">{stats.totalSamples} kg</p>
                      <div className="flex items-center gap-1 mt-1">
                        <ArrowDownRight className="w-4 h-4 text-red-500" />
                        <span className="text-xs text-red-600">-3% this week</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Revenue Trend (Last 30 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={dailyMetrics}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={(date) => new Date(date).getDate().toString()} />
                      <YAxis />
                      <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                      <Area type="monotone" dataKey="revenue" stroke="#10B981" fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sales Split (B2C vs B2B)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'B2C Sales', value: stats.b2cRevenue },
                          { name: 'B2B Sales', value: stats.b2bRevenue },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#3B82F6" />
                        <Cell fill="#10B981" />
                      </Pie>
                      <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Activity Feed */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.userName}</p>
                        <p className="text-sm text-gray-600">{activity.details}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Daily Activity (Last 30 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dailyMetrics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={(date) => new Date(date).getDate().toString()} />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="meetings" stroke="#3B82F6" name="Meetings" />
                      <Line type="monotone" dataKey="sales" stroke="#10B981" name="Sales" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Distance Traveled (km)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dailyMetrics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={(date) => new Date(date).getDate().toString()} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="distanceTraveled" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Conversion Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { label: 'People Met', value: stats.totalMeetings * 3, color: 'bg-blue-500' },
                    { label: 'Meetings', value: stats.totalMeetings, color: 'bg-emerald-500' },
                    { label: 'Samples Given', value: stats.totalSamples, color: 'bg-amber-500' },
                    { label: 'Trials', value: Math.floor(stats.totalSamples * 0.6), color: 'bg-purple-500' },
                    { label: 'Sales', value: stats.totalSales, color: 'bg-rose-500' },
                  ].map((item, index) => (
                    <div key={index} className="text-center">
                      <div className={`${item.color} text-white rounded-lg p-4 mb-2`}>
                        <p className="text-2xl font-bold">{item.value}</p>
                      </div>
                      <p className="text-sm text-gray-600">{item.label}</p>
                      {index < 4 && (
                        <div className="hidden md:flex justify-center mt-2">
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Team Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Field Officer</TableHead>
                      <TableHead>Territory</TableHead>
                      <TableHead className="text-right">Meetings</TableHead>
                      <TableHead className="text-right">Sales</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Distance (km)</TableHead>
                      <TableHead className="text-right">Conversion</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userMetrics.map((user) => (
                      <TableRow key={user.userId}>
                        <TableCell className="font-medium">{user.userName}</TableCell>
                        <TableCell>{user.territory}</TableCell>
                        <TableCell className="text-right">{user.totalMeetings}</TableCell>
                        <TableCell className="text-right">{user.totalSales}</TableCell>
                        <TableCell className="text-right">₹{user.totalRevenue.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{user.totalDistance}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={user.conversionRate >= 60 ? 'default' : 'secondary'}>
                            {user.conversionRate}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top Performers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userMetrics
                      .sort((a, b) => b.totalRevenue - a.totalRevenue)
                      .slice(0, 3)
                      .map((user, index) => (
                        <div key={user.userId} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                            index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-600'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{user.userName}</p>
                            <p className="text-sm text-gray-500">{user.territory}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">₹{user.totalRevenue.toLocaleString()}</p>
                            <p className="text-sm text-gray-500">{user.totalSales} sales</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Team Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <UserCheck className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Field Officers</p>
                          <p className="text-sm text-gray-500">Active ground team</p>
                        </div>
                      </div>
                      <p className="text-2xl font-bold">{userService.getFieldOfficers().length}</p>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <Store className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-medium">Distributors</p>
                          <p className="text-sm text-gray-500">B2B partners</p>
                        </div>
                      </div>
                      <p className="text-2xl font-bold">{userService.getDistributors().length}</p>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-medium">Territories</p>
                          <p className="text-sm text-gray-500">Active regions</p>
                        </div>
                      </div>
                      <p className="text-2xl font-bold">{new Set(userMetrics.map(u => u.territory)).size}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Territory Tab */}
          <TabsContent value="territory" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Territory Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>State</TableHead>
                      <TableHead>District</TableHead>
                      <TableHead>Village</TableHead>
                      <TableHead className="text-right">Meetings</TableHead>
                      <TableHead className="text-right">Sales</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Penetration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {territoryMetrics.map((territory, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{territory.state}</TableCell>
                        <TableCell>{territory.district}</TableCell>
                        <TableCell>{territory.village}</TableCell>
                        <TableCell className="text-right">{territory.meetings}</TableCell>
                        <TableCell className="text-right">{territory.sales}</TableCell>
                        <TableCell className="text-right">₹{territory.revenue.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${territory.penetrationRate}%` }}
                              />
                            </div>
                            <span className="text-sm">{territory.penetrationRate}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Top State', value: 'Uttar Pradesh', metric: '₹2,85,000', icon: MapPin },
                { label: 'Top District', value: 'Meerut', metric: '₹2,85,000', icon: Calendar },
                { label: 'Top Village', value: 'Meerut City', metric: '81% Penetration', icon: TrendingUp },
              ].map((item, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <item.icon className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{item.label}</p>
                        <p className="text-lg font-bold">{item.value}</p>
                        <p className="text-sm text-emerald-600">{item.metric}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Vendors Tab */}
          <TabsContent value="vendors" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Search className="w-6 h-6" />
                  Vendor Search
                </h2>
                <p className="text-gray-500">Search and manage farmers, sellers, veterinarians, and other stakeholders</p>
              </div>
            </div>
            <VendorSearch />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
