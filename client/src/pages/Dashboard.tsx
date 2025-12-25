import { useEffect, useState, useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Ticket, Clock } from 'lucide-react';
import api from '../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Memoize stats calculations to avoid recalculating on every render
  const stats = useMemo(() => {
    const upcoming = bookings.filter((b) => b.status === 'CONFIRMED' && b.trip && new Date(b.trip.departureTime) > new Date()).length;
    const completed = bookings.filter((b) => b.status === 'COMPLETED').length;
    return {
      total: bookings.length,
      upcoming,
      completed,
    };
  }, [bookings]);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      // Only load recent bookings for dashboard (limit to 10)
      const response = await api.get('/bookings', {
        params: { limit: 10 }
      });
      setBookings(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error('Failed to load bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user?.firstName}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Bookings</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Ticket className="h-12 w-12 text-primary-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Upcoming Trips</p>
              <p className="text-3xl font-bold text-gray-900">{stats.upcoming}</p>
            </div>
            <Calendar className="h-12 w-12 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Completed</p>
              <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
            </div>
            <Clock className="h-12 w-12 text-gray-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Recent Bookings</h2>
        </div>
        {loading ? (
          <div className="p-6 text-center">Loading...</div>
        ) : bookings.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>No bookings yet.</p>
            <Link to="/trips" className="text-primary-600 hover:underline mt-2 inline-block">
              Book a trip
            </Link>
          </div>
        ) : (
          <div className="divide-y">
            {bookings.slice(0, 5).map((booking) => (
              <div key={booking.id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <span className="font-medium">
                        {booking.trip?.origin?.name || 'N/A'} → {booking.trip?.destination?.name || 'N/A'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <Calendar className="h-4 w-4 inline mr-1" />
                        {booking.trip?.departureTime ? format(new Date(booking.trip.departureTime), 'MMM dd, yyyy hh:mm a') : 'N/A'}
                      </p>
                      <p>Seats: {booking.seatNumbers.join(', ')}</p>
                      <p>Passenger: {booking.passengerName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        booking.status === 'CONFIRMED'
                          ? 'bg-green-100 text-green-800'
                          : booking.status === 'CANCELLED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {booking.status}
                    </span>
                    <p className="text-lg font-bold text-gray-900 mt-2">₦{booking.totalAmount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
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






