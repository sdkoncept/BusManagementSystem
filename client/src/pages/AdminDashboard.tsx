import { useEffect, useState } from 'react';
import { 
  Bus, Users, MapPin, Calendar, DollarSign, TrendingUp, 
  AlertCircle, CheckCircle, Clock, Edit, Save, X 
} from 'lucide-react';
import api from '../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalTrips: 0,
    activeTrips: 0,
    totalBookings: 0,
    totalRevenue: 0,
    totalBuses: 0,
    activeBuses: 0,
    totalDrivers: 0,
    activeDrivers: 0,
    totalRoutes: 0,
    totalStations: 0,
    pendingRequests: 0,
    todayBookings: 0,
    todayRevenue: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [upcomingTrips, setUpcomingTrips] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSettings, setEditingSettings] = useState<any>(null);
  const [settings, setSettings] = useState({
    companyName: 'Eagle Line',
    contactEmail: 'info@eagleline.com',
    contactPhone: '+234 XXX XXX XXXX',
    bookingFee: 0,
    cancellationFee: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load all data in parallel
      const [tripsRes, bookingsRes, busesRes, driversRes, routesRes, stationsRes, requestsRes, inventoryRes] = await Promise.all([
        api.get('/trips', { params: { includeCompleted: 'true' } }),
        api.get('/bookings'),
        api.get('/buses'),
        api.get('/drivers'),
        api.get('/routes'),
        api.get('/stations'),
        api.get('/requests'),
        api.get('/inventory'),
      ]);

      const trips = tripsRes.data;
      const bookings = bookingsRes.data;
      const buses = busesRes.data;
      const drivers = driversRes.data;
      const routes = routesRes.data;
      const stations = stationsRes.data;
      const requests = requestsRes.data || [];
      const inventory = inventoryRes.data || [];

      // Calculate stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayBookings = bookings.filter((b: any) => {
        const bookingDate = new Date(b.bookingDate);
        bookingDate.setHours(0, 0, 0, 0);
        return bookingDate.getTime() === today.getTime();
      });

      const todayRevenue = todayBookings.reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0);
      const totalRevenue = bookings.reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0);

      setStats({
        totalTrips: trips.length,
        activeTrips: trips.filter((t: any) => t.status === 'IN_PROGRESS' || t.status === 'SCHEDULED').length,
        totalBookings: bookings.length,
        totalRevenue,
        totalBuses: buses.length,
        activeBuses: buses.filter((b: any) => b.isActive).length,
        totalDrivers: drivers.length,
        activeDrivers: drivers.filter((d: any) => d.isActive).length,
        totalRoutes: routes.length,
        totalStations: stations.length,
        pendingRequests: requests.filter((r: any) => r.status === 'PENDING').length,
        todayBookings: todayBookings.length,
        todayRevenue,
      });

      // Recent bookings (last 10)
      setRecentBookings(bookings.slice(0, 10));

      // Upcoming trips (next 5)
      const upcoming = trips
        .filter((t: any) => new Date(t.departureTime) > new Date())
        .sort((a: any, b: any) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime())
        .slice(0, 5);
      setUpcomingTrips(upcoming);

      // Low stock items
      const lowStock = inventory.filter((item: any) => item.quantity <= item.minQuantity);
      setLowStockItems(lowStock);
    } catch (error: any) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSetting = async (key: string, value: any) => {
    try {
      // In a real app, you'd save to backend
      setSettings({ ...settings, [key]: value });
      toast.success('Setting updated');
      setEditingSettings(null);
    } catch (error) {
      toast.error('Failed to update setting');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Overview of your bus management system</p>
          </div>
          <div className="text-sm text-gray-500">
            Last updated: {format(new Date(), 'MMM dd, yyyy hh:mm a')}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₦{stats.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">Today: ₦{stats.todayRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Trips</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeTrips}</p>
                <p className="text-xs text-gray-500 mt-1">Total: {stats.totalTrips}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
                <p className="text-xs text-green-600 mt-1">Today: {stats.todayBookings}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingRequests}</p>
                <p className="text-xs text-yellow-600 mt-1">Requires attention</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Buses</p>
                <p className="text-xl font-bold text-gray-900">{stats.activeBuses}/{stats.totalBuses}</p>
              </div>
              <Bus className="h-6 w-6 text-primary-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Drivers</p>
                <p className="text-xl font-bold text-gray-900">{stats.activeDrivers}/{stats.totalDrivers}</p>
              </div>
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Routes</p>
                <p className="text-xl font-bold text-gray-900">{stats.totalRoutes}</p>
              </div>
              <MapPin className="h-6 w-6 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Stations</p>
                <p className="text-xl font-bold text-gray-900">{stats.totalStations}</p>
              </div>
              <MapPin className="h-6 w-6 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Low Stock</p>
                <p className="text-xl font-bold text-red-600">{lowStockItems.length}</p>
              </div>
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Bookings */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Recent Bookings</h2>
                <a href="/admin/bookings" className="text-primary-600 hover:text-primary-700 text-sm">
                  View All →
                </a>
              </div>
              {recentBookings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No recent bookings</div>
              ) : (
                <div className="space-y-3">
                  {recentBookings.map((booking) => (
                    <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">
                              {booking.trip?.origin?.name} → {booking.trip?.destination?.name}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>
                              <Calendar className="h-3 w-3 inline mr-1" />
                              {format(new Date(booking.trip?.departureTime || booking.bookingDate), 'MMM dd, hh:mm a')}
                            </p>
                            <p>Passenger: {booking.passengerName} • Seats: {booking.seatNumbers?.join(', ') || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              booking.status === 'CONFIRMED'
                                ? 'bg-green-100 text-green-800'
                                : booking.status === 'CANCELLED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {booking.status}
                          </span>
                          <p className="text-lg font-bold text-gray-900 mt-2">₦{booking.totalAmount?.toFixed(2) || '0.00'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Trips */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Upcoming Trips</h2>
                <a href="/admin/trips" className="text-primary-600 hover:text-primary-700 text-sm">
                  Manage Trips →
                </a>
              </div>
              {upcomingTrips.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No upcoming trips</div>
              ) : (
                <div className="space-y-3">
                  {upcomingTrips.map((trip) => (
                    <div key={trip.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <MapPin className="h-4 w-4 text-primary-600" />
                            <span className="font-medium">
                              {trip.origin?.name} → {trip.destination?.name}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>
                              <Clock className="h-3 w-3 inline mr-1" />
                              {format(new Date(trip.departureTime), 'MMM dd, yyyy hh:mm a')}
                            </p>
                            <p>
                              Bus: {trip.bus?.plateNumber || 'Not assigned'} • Driver: {trip.driver ? `${trip.driver.firstName} ${trip.driver.lastName}` : 'Not assigned'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              trip.status === 'SCHEDULED'
                                ? 'bg-blue-100 text-blue-800'
                                : trip.status === 'IN_PROGRESS'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {trip.status}
                          </span>
                          <p className="text-lg font-bold text-gray-900 mt-2">₦{trip.price?.toFixed(2) || '0.00'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Settings */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Quick Settings</h2>
                <Edit className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Company Name</label>
                  {editingSettings === 'companyName' ? (
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={settings.companyName}
                        onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm text-gray-900 bg-white"
                      />
                      <button
                        onClick={() => handleUpdateSetting('companyName', settings.companyName)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditingSettings(null)}
                        className="text-gray-600 hover:text-gray-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-900">{settings.companyName}</p>
                      <button
                        onClick={() => setEditingSettings('companyName')}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Contact Email</label>
                  {editingSettings === 'contactEmail' ? (
                    <div className="flex space-x-2">
                      <input
                        type="email"
                        value={settings.contactEmail}
                        onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm text-gray-900 bg-white"
                      />
                      <button
                        onClick={() => handleUpdateSetting('contactEmail', settings.contactEmail)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditingSettings(null)}
                        className="text-gray-600 hover:text-gray-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-900">{settings.contactEmail}</p>
                      <button
                        onClick={() => setEditingSettings('contactEmail')}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Contact Phone</label>
                  {editingSettings === 'contactPhone' ? (
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={settings.contactPhone}
                        onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm text-gray-900 bg-white"
                      />
                      <button
                        onClick={() => handleUpdateSetting('contactPhone', settings.contactPhone)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditingSettings(null)}
                        className="text-gray-600 hover:text-gray-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-900">{settings.contactPhone}</p>
                      <button
                        onClick={() => setEditingSettings('contactPhone')}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Low Stock Alerts */}
            {lowStockItems.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <h2 className="text-xl font-semibold text-red-900">Low Stock Alert</h2>
                </div>
                <div className="space-y-2">
                  {lowStockItems.slice(0, 5).map((item) => (
                    <div key={item.id} className="text-sm">
                      <p className="font-medium text-red-900">{item.name}</p>
                      <p className="text-red-700">
                        Stock: {item.quantity} {item.unit} (Min: {item.minQuantity})
                      </p>
                    </div>
                  ))}
                </div>
                <a
                  href="/admin/inventory"
                  className="mt-4 block text-center text-sm text-red-700 hover:text-red-900 font-medium"
                >
                  View Inventory →
                </a>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <a
                  href="/admin/requests"
                  className="block w-full bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 text-center"
                >
                  Review Requests ({stats.pendingRequests})
                </a>
                <a
                  href="/admin/trips"
                  className="block w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 text-center"
                >
                  Manage Trips
                </a>
                <a
                  href="/admin/bookings"
                  className="block w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-center"
                >
                  View All Bookings
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

