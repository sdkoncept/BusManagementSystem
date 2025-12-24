import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Play, User, Phone } from 'lucide-react';
import api from '../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function DetailedTripView() {
  const { id } = useParams();
  const [trip, setTrip] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedRider, setSelectedRider] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadTrip();
      loadBookings();
    }
  }, [id]);

  const loadTrip = async () => {
    try {
      const response = await api.get(`/trips/${id}`);
      setTrip(response.data);
    } catch (error) {
      toast.error('Failed to load trip details');
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    try {
      const response = await api.get('/bookings', { params: { tripId: id } });
      setBookings(response.data);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading trip details...</div>;
  }

  if (!trip) {
    return <div className="text-center py-12">Trip not found</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-500';
      case 'IN_PROGRESS':
      case 'RUNNING':
        return 'bg-green-500';
      case 'SCHEDULED':
      case 'WAITING':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bus Trip Management</h1>
          <p className="text-gray-600">Add and manage bus routes efficiently</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Trip List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex space-x-4 mb-4">
                <input
                  type="text"
                  placeholder="Search trip"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button className="bg-green-500 text-white px-4 py-2 rounded-lg">Filter</button>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-lg border-2 border-blue-500 bg-blue-50">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-semibold">{trip.bus?.plateNumber || 'Bus Plate'}</span>
                    <span className={`w-2 h-2 rounded-full ${getStatusColor(trip.status)}`}></span>
                    <span className="text-sm text-gray-600 capitalize">{trip.status}</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    Started: {format(new Date(trip.departureTime), "dd MMM 'yy, hh:mm a")}
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="h-4 w-4 text-green-500" />
                    <span className="text-sm">
                      {trip.origin?.name} → {trip.destination?.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Revenue: ₦{(bookings.length * trip.price).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <span>Riders: {bookings.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Center Panel - Trip Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-white">
                    {trip.bus?.plateNumber?.charAt(0) || 'B'}
                  </span>
                </div>
                <h3 className="text-xl font-bold">
                  {trip.bus?.plateNumber || 'Bus Plate'} • Trip {trip.status}
                </h3>
                <p className="text-gray-600">City Services Bus Company</p>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Start Station</h4>
                  <p className="text-gray-700">{trip.origin?.name}</p>
                  <p className="text-sm text-gray-500">
                    Start Time: {format(new Date(trip.departureTime), "dd MMM yyyy, hh:mm a")}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">End Station</h4>
                  <p className="text-gray-700">{trip.destination?.name}</p>
                  <p className="text-sm text-gray-500">
                    End Time: {format(new Date(trip.arrivalTime), "dd MMM yyyy, hh:mm a")}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Driver</h4>
                  <p className="text-primary-600">
                    {trip.driver ? `${trip.driver.firstName} ${trip.driver.lastName}` : 'Not Assigned'}
                  </p>
                  {trip.driver && (
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <p>License: {trip.driver.driversLicense}</p>
                      <p>Phone: {trip.driver.phoneNumber}</p>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold mb-2">No. of Riders</h4>
                  <p className="text-gray-700">{bookings.length}</p>
                </div>

                <div className="relative mt-6">
                  <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 opacity-20"></div>
                    <Play className="h-16 w-16 text-blue-500 relative z-10" />
                  </div>
                </div>
              </div>
            </div>

            {/* Map Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                <MapPin className="h-12 w-12 text-gray-400" />
              </div>
            </div>

            {/* Riders List */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h4 className="font-semibold mb-4">Riders in the Trip</h4>
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {bookings.map((booking) => (
                  <button
                    key={booking.id}
                    onClick={() => setSelectedRider(booking)}
                    className="flex-shrink-0 flex flex-col items-center space-y-2 p-2 hover:bg-gray-50 rounded-lg"
                  >
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {booking.passengerName.charAt(0)}
                      </span>
                    </div>
                    <span className="text-xs text-center max-w-[60px] truncate">
                      {booking.passengerName.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Rider Details */}
          {selectedRider && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {selectedRider.passengerName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{selectedRider.passengerName}</h3>
                    <p className="text-sm text-gray-600">{selectedRider.passengerPhone}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Pickup Stop</span>
                    </div>
                    <div className="ml-6">
                      <div className="w-0.5 h-8 bg-green-500"></div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Dropoff Stop</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Charged Amount:</span>
                      <span className="font-bold text-lg">₦{selectedRider.totalAmount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Sit No.:</span>
                      <span className="font-semibold">{selectedRider.seatNumbers.join(', ')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

