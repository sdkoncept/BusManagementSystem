import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Clock, DollarSign, X, Search, Filter, User, Phone, Mail, Ticket, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

interface BookingsPageProps {
  admin?: boolean;
}

export default function BookingsPage({ admin }: BookingsPageProps) {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const response = await api.get('/bookings');
      setBookings(response.data || []);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await api.patch(`/bookings/${bookingId}/cancel`);
      toast.success('Booking cancelled');
      loadBookings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch = 
      booking.passengerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.trip?.origin?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.trip?.destination?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || booking.status === statusFilter;
    
    const matchesDate = !dateFilter || (() => {
      const bookingDate = new Date(booking.bookingDate || booking.trip?.departureTime);
      const filterDate = new Date(dateFilter);
      return bookingDate.toDateString() === filterDate.toDateString();
    })();

    return matchesSearch && matchesStatus && matchesDate;
  });

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter((b) => b.status === 'CONFIRMED').length,
    cancelled: bookings.filter((b) => b.status === 'CANCELLED').length,
    completed: bookings.filter((b) => b.status === 'COMPLETED').length,
    totalRevenue: bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
    todayRevenue: bookings
      .filter((b) => {
        const bookingDate = new Date(b.bookingDate);
        const today = new Date();
        return bookingDate.toDateString() === today.toDateString();
      })
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0),
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{admin ? 'All Bookings' : 'My Bookings'}</h1>
          <p className="text-gray-600">
            {admin ? 'Manage and monitor all customer bookings' : 'View and manage your bookings'}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Ticket className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₦{stats.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">Today: ₦{stats.todayRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
              </div>
              <X className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by passenger, route, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="COMPLETED">Completed</option>
            </select>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
            />
          </div>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="text-center py-12">Loading bookings...</div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Ticket className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No bookings found.</p>
            {!admin && (
              <Link to="/trips" className="text-primary-600 hover:underline">
                Book a trip
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col lg:flex-row justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-3">
                      <MapPin className="h-5 w-5 text-primary-600" />
                      <span className="font-semibold text-lg">
                        {booking.trip?.origin?.name} → {booking.trip?.destination?.name}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(booking.trip?.departureTime || booking.bookingDate), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{format(new Date(booking.trip?.departureTime || booking.bookingDate), 'hh:mm a')}</span>
                      </div>
                      <div>
                        <span className="font-medium">Seats:</span> {booking.seatNumbers?.join(', ') || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Passenger:</span> {booking.passengerName}
                      </div>
                    </div>

                    {admin && booking.user && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-sm">
                            {booking.user.firstName} {booking.user.lastName}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Mail className="h-3 w-3" />
                            <span>{booking.user.email}</span>
                          </div>
                          {booking.user.phone && (
                            <div className="flex items-center space-x-1">
                              <Phone className="h-3 w-3" />
                              <span>{booking.user.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-gray-500">
                      Booking ID: {booking.id} • Booked on: {format(new Date(booking.bookingDate), 'MMM dd, yyyy hh:mm a')}
                    </div>
                  </div>

                  <div className="mt-4 lg:mt-0 lg:ml-6 lg:text-right">
                    <div className="mb-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          booking.status === 'CONFIRMED'
                            ? 'bg-green-100 text-green-800'
                            : booking.status === 'CANCELLED'
                            ? 'bg-red-100 text-red-800'
                            : booking.status === 'COMPLETED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-4">₦{booking.totalAmount?.toFixed(2) || '0.00'}</p>
                    <div className="space-y-2">
                      {booking.status === 'CONFIRMED' && (
                        <Link
                          to={`/trips/${booking.trip?.id}/track`}
                          className="block bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 text-sm text-center"
                        >
                          Track Trip
                        </Link>
                      )}
                      {booking.status === 'CONFIRMED' && !admin && (
                        <button
                          onClick={() => handleCancel(booking.id)}
                          className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm flex items-center justify-center space-x-1"
                        >
                          <X className="h-4 w-4" />
                          <span>Cancel</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
