import { useEffect, useState } from 'react';
import { Search, Calendar, MapPin, Clock, User, Phone, Mail, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function FrontOfficeView() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<any[]>([]);
  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    passengerName: '',
    passengerPhone: '',
    passengerEmail: '',
  });
  const [filters, setFilters] = useState({
    originId: '',
    destinationId: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadStations();
    loadTrips();
  }, [filters]);

  const loadStations = async () => {
    try {
      const response = await api.get('/stations');
      setStations(response.data);
    } catch (error) {
      toast.error('Failed to load stations');
    }
  };

  const loadTrips = async () => {
    setLoading(true);
    try {
      const params: any = { availableOnly: true };
      if (filters.originId) params.originId = filters.originId;
      if (filters.destinationId) params.destinationId = filters.destinationId;
      if (filters.date) params.date = filters.date;

      const response = await api.get('/trips', { params });
      setTrips(response.data);
    } catch (error) {
      toast.error('Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  const loadTripDetails = async (tripId: string) => {
    try {
      const response = await api.get(`/trips/${tripId}`);
      setSelectedTrip(response.data);
      setSelectedSeats([]);
    } catch (error) {
      toast.error('Failed to load trip details');
    }
  };

  const toggleSeat = (seatNumber: string) => {
    if (!selectedTrip) return;
    const seat = selectedTrip.seats.find((s: any) => s.seatNumber === seatNumber);
    if (!seat || seat.status !== 'AVAILABLE') return;

    setSelectedSeats((prev) =>
      prev.includes(seatNumber) ? prev.filter((s) => s !== seatNumber) : [...prev, seatNumber]
    );
  };

  const handleBooking = async () => {
    if (!selectedTrip) return;
    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat');
      return;
    }
    if (!formData.passengerName || !formData.passengerPhone) {
      toast.error('Please fill in passenger details');
      return;
    }

    try {
      await api.post('/bookings', {
        tripId: selectedTrip.id,
        seatNumbers: selectedSeats,
        ...formData,
      });
      toast.success('Booking confirmed!');
      setSelectedTrip(null);
      setSelectedSeats([]);
      setFormData({ passengerName: '', passengerPhone: '', passengerEmail: '' });
      loadTrips();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Booking failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Front Office - Passenger Booking</h1>
          <p className="text-gray-600">Book passengers on trips from the front desk</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Trip Search & Selection */}
          <div className="lg:col-span-2">
            {/* Search Filters */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Search Trips</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Origin</label>
                  <select
                    value={filters.originId}
                    onChange={(e) => setFilters({ ...filters, originId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                  >
                    <option value="">Select origin</option>
                    {stations.map((station) => (
                      <option key={station.id} value={station.id}>
                        {station.name}, {station.city}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
                  <select
                    value={filters.destinationId}
                    onChange={(e) => setFilters({ ...filters, destinationId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                  >
                    <option value="">Select destination</option>
                    {stations.map((station) => (
                      <option key={station.id} value={station.id}>
                        {station.name}, {station.city}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={filters.date}
                    onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Available Trips */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Available Trips</h2>
              {loading ? (
                <div className="text-center py-12">Loading trips...</div>
              ) : trips.length === 0 ? (
                <div className="text-center py-12 text-gray-600">No trips available</div>
              ) : (
                <div className="space-y-4">
                  {trips.map((trip) => {
                    const availableSeats = trip.seats?.filter((s: any) => s.status === 'AVAILABLE').length || 0;
                    return (
                      <div
                        key={trip.id}
                        onClick={() => loadTripDetails(trip.id)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedTrip?.id === trip.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <MapPin className="h-5 w-5 text-primary-600" />
                              <span className="font-semibold text-lg">
                                {trip.origin?.name} → {trip.destination?.name}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{format(new Date(trip.departureTime), 'MMM dd, yyyy')}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{format(new Date(trip.departureTime), 'hh:mm a')}</span>
                              </div>
                              <div>Price: ₦{trip.price.toFixed(2)}</div>
                              <div>Available: {availableSeats} seats</div>
                            </div>
                            {trip.bus && (
                              <div className="text-sm text-gray-500 mt-2">
                                Bus: {trip.bus.plateNumber} | Driver: {trip.driver ? `${trip.driver.firstName} ${trip.driver.lastName}` : 'Not assigned'}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Booking Form */}
          {selectedTrip && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                <h2 className="text-xl font-semibold mb-4">Book Passenger</h2>

                {/* Trip Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="text-sm font-semibold mb-2">
                    {selectedTrip.origin?.name} → {selectedTrip.destination?.name}
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>{format(new Date(selectedTrip.departureTime), 'MMM dd, yyyy hh:mm a')}</div>
                    <div>Price: ₦{selectedTrip.price.toFixed(2)} per seat</div>
                  </div>
                </div>

                {/* Seat Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Seats</label>
                  <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                    {selectedTrip.seats?.map((seat: any) => {
                      const isSelected = selectedSeats.includes(seat.seatNumber);
                      const isAvailable = seat.status === 'AVAILABLE';
                      return (
                        <button
                          key={seat.id}
                          type="button"
                          onClick={() => toggleSeat(seat.seatNumber)}
                          disabled={!isAvailable}
                          className={`p-2 rounded text-sm font-medium transition-all ${
                            isSelected
                              ? 'bg-primary-600 text-white'
                              : isAvailable
                              ? 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                              : 'bg-red-100 text-red-600 cursor-not-allowed'
                          }`}
                        >
                          {seat.seatNumber}
                        </button>
                      );
                    })}
                  </div>
                  {selectedSeats.length > 0 && (
                    <div className="mt-2 text-sm text-primary-600">
                      Selected: {selectedSeats.join(', ')} | Total: ₦{(selectedSeats.length * selectedTrip.price).toFixed(2)}
                    </div>
                  )}
                </div>

                {/* Passenger Information */}
                <div className="space-y-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      Passenger Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.passengerName}
                      onChange={(e) => setFormData({ ...formData, passengerName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.passengerPhone}
                      onChange={(e) => setFormData({ ...formData, passengerPhone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={formData.passengerEmail}
                      onChange={(e) => setFormData({ ...formData, passengerEmail: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                    />
                  </div>
                </div>

                <button
                  onClick={handleBooking}
                  disabled={selectedSeats.length === 0 || !formData.passengerName || !formData.passengerPhone}
                  className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="h-5 w-5" />
                  <span>Confirm Booking</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

