import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock, User, Phone, Mail } from 'lucide-react';
import api from '../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function BookingForm() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<any>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    passengerName: '',
    passengerPhone: '',
    passengerEmail: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTrip();
  }, [tripId]);

  const loadTrip = async () => {
    try {
      const response = await api.get(`/trips/${tripId}`);
      setTrip(response.data);
    } catch (error) {
      toast.error('Failed to load trip details');
      navigate('/trips');
    } finally {
      setLoading(false);
    }
  };

  const toggleSeat = (seatNumber: string) => {
    const seat = trip.seats.find((s: any) => s.seatNumber === seatNumber);
    if (!seat || seat.status !== 'AVAILABLE') return;

    setSelectedSeats((prev) =>
      prev.includes(seatNumber) ? prev.filter((s) => s !== seatNumber) : [...prev, seatNumber]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/bookings', {
        tripId,
        seatNumbers: selectedSeats,
        ...formData,
      });
      toast.success('Booking confirmed!');
      navigate('/bookings');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!trip) {
    return null;
  }

  // Generate seat layout (simple grid for demo)
  const totalSeats = trip.bus.capacity;
  const seatsPerRow = 4;
  const rows = Math.ceil(totalSeats / seatsPerRow);

  return (
    <div className="px-4 py-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Complete Your Booking</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trip Details */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Trip Details</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-primary-600" />
                <span className="font-medium">
                  {trip.origin.name} → {trip.destination.name}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-primary-600" />
                <span>{format(new Date(trip.departureTime), 'MMMM dd, yyyy')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-primary-600" />
                <span>{format(new Date(trip.departureTime), 'hh:mm a')}</span>
              </div>
              <div>
                <span className="font-semibold text-lg">₦{trip.price.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span className="text-gray-600 ml-2">per seat</span>
              </div>
            </div>
          </div>

          {/* Seat Selection */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Select Seats</h2>
            <div className="mb-4 flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-green-200 border border-green-400"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-red-200 border border-red-400"></div>
                <span>Occupied</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-200 border border-blue-400"></div>
                <span>Selected</span>
              </div>
            </div>
            <div className="space-y-2">
              {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={rowIndex} className="flex justify-center space-x-2">
                  {Array.from({ length: seatsPerRow }).map((_, colIndex) => {
                    const seatNumber = String(rowIndex * seatsPerRow + colIndex + 1);
                    if (parseInt(seatNumber) > totalSeats) return null;
                    const seat = trip.seats.find((s: any) => s.seatNumber === seatNumber);
                    const isSelected = selectedSeats.includes(seatNumber);
                    const isAvailable = seat?.status === 'AVAILABLE';

                    return (
                      <button
                        key={seatNumber}
                        onClick={() => toggleSeat(seatNumber)}
                        disabled={!isAvailable}
                        className={`w-10 h-10 rounded border-2 ${
                          isSelected
                            ? 'bg-blue-200 border-blue-400'
                            : isAvailable
                            ? 'bg-green-200 border-green-400 hover:bg-green-300'
                            : 'bg-red-200 border-red-400 cursor-not-allowed opacity-50'
                        }`}
                      >
                        {seatNumber}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
            {selectedSeats.length > 0 && (
              <p className="mt-4 text-sm text-gray-600">
                Selected: {selectedSeats.join(', ')} ({selectedSeats.length} seat
                {selectedSeats.length > 1 ? 's' : ''})
              </p>
            )}
          </div>
        </div>

        {/* Booking Form */}
        <div className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 sticky top-6">
            <h2 className="text-xl font-semibold mb-4">Passenger Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.passengerName}
                  onChange={(e) => setFormData({ ...formData, passengerName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center">
                  <Phone className="h-4 w-4 mr-1" />
                  Phone
                </label>
                <input
                  type="tel"
                  required
                  value={formData.passengerPhone}
                  onChange={(e) => setFormData({ ...formData, passengerPhone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center">
                  <Mail className="h-4 w-4 mr-1" />
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={formData.passengerEmail}
                  onChange={(e) => setFormData({ ...formData, passengerEmail: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="pt-4 border-t">
                <div className="flex justify-between mb-2">
                  <span>Seats ({selectedSeats.length})</span>
                  <span>₦{(trip.price * selectedSeats.length).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₦{(trip.price * selectedSeats.length).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting || selectedSeats.length === 0}
                className="w-full bg-primary-600 text-white py-3 rounded-md font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Processing...' : 'Confirm Booking'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
