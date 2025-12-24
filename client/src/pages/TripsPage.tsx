import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MapPin, Calendar, Clock, Bus } from 'lucide-react';
import api from '../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

interface TripsPageProps {
  admin?: boolean;
}

export default function TripsPage({ admin }: TripsPageProps) {
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    originId: searchParams.get('origin') || '',
    destinationId: searchParams.get('destination') || '',
    date: searchParams.get('date') || new Date().toISOString().split('T')[0],
  });
  const [stations, setStations] = useState<any[]>([]);

  useEffect(() => {
    loadStations();
  }, []);

  useEffect(() => {
    loadTrips();
  }, [filters]);

  const loadStations = async () => {
    try {
      const response = await api.get('/stations');
      setStations(response.data);
    } catch (error) {
      console.error('Failed to load stations:', error);
    }
  };

  const loadTrips = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filters.originId) params.originId = filters.originId;
      if (filters.destinationId) params.destinationId = filters.destinationId;
      if (filters.date) params.date = filters.date;
      
      // For passenger view, only show available trips (with bus and driver)
      if (!admin) {
        params.availableOnly = 'true';
      }

      const response = await api.get('/trips', { params });
      // Filter to only show trips with bus and driver for passenger view
      const availableTrips = admin 
        ? response.data 
        : response.data.filter((trip: any) => trip.isAvailable && trip.availableSeats > 0);
      setTrips(availableTrips);
    } catch (error) {
      toast.error('Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadTrips();
  };

  return (
    <div className="px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{admin ? 'Manage Trips' : 'Search Trips'}</h1>
        <p className="text-gray-600 mt-2">
          {admin ? 'View and manage all trips' : 'Find and book your next journey'}
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">From</label>
            <select
              value={filters.originId}
              onChange={(e) => setFilters({ ...filters, originId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Origins</option>
              {stations.map((station) => (
                <option key={station.id} value={station.id}>
                  {station.name}, {station.city}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">To</label>
            <select
              value={filters.destinationId}
              onChange={(e) => setFilters({ ...filters, destinationId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Destinations</option>
              {stations.map((station) => (
                <option key={station.id} value={station.id}>
                  {station.name}, {station.city}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Date</label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        <button
          type="submit"
          className="mt-4 bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
        >
          Search
        </button>
      </form>

      {/* Trips List */}
      {loading ? (
        <div className="text-center py-12">Loading trips...</div>
      ) : trips.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Bus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No trips found. Try adjusting your search criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {trips.map((trip) => (
            <div key={trip.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col md:flex-row justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <MapPin className="h-5 w-5 text-primary-600" />
                    <div>
                      <p className="font-semibold text-lg">
                        {trip.origin.name} → {trip.destination.name}
                      </p>
                      <p className="text-sm text-gray-600">{trip.route.name}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <Calendar className="h-4 w-4 inline mr-1" />
                      <span>{format(new Date(trip.departureTime), 'MMM dd, yyyy')}</span>
                    </div>
                    <div>
                      <Clock className="h-4 w-4 inline mr-1" />
                      <span>{format(new Date(trip.departureTime), 'hh:mm a')}</span>
                    </div>
                    <div>
                      <Bus className="h-4 w-4 inline mr-1" />
                      <span>{trip.bus?.plateNumber || 'Not Assigned'}</span>
                    </div>
                    {!admin && trip.availableSeats !== undefined && (
                      <div className="text-sm text-gray-600">
                        {trip.availableSeats} seats available
                      </div>
                    )}
                    <div>
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
                    </div>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 md:ml-6 text-right">
                  <p className="text-2xl font-bold text-gray-900 mb-2">
                    ₦{trip.price.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  {admin ? (
                    <div className="space-y-2">
                      <Link
                        to={`/admin/trips/${trip.id}/edit`}
                        className="block bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
                      >
                        Edit
                      </Link>
                      <Link
                        to={`/trips/${trip.id}/track`}
                        className="block bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                      >
                        Track
                      </Link>
                    </div>
                  ) : (
                    <div>
                      {trip.isAvailable && trip.availableSeats > 0 ? (
                        <Link
                          to={`/book/${trip.id}`}
                          className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 inline-block"
                        >
                          {user ? 'Book Now' : 'Login to Book'}
                        </Link>
                      ) : (
                        <div className="text-sm text-red-600">
                          {!trip.bus || !trip.driver ? 'Not Available' : 'Fully Booked'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}






