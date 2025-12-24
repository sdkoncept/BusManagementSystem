import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock, Users, Plus, X } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function EnhancedBookingForm() {
  const navigate = useNavigate();
  const [tripType, setTripType] = useState<'one-way' | 'round'>('one-way');
  const [pickupFrom, setPickupFrom] = useState('');
  const [travelTo, setTravelTo] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [stops, setStops] = useState<string[]>([]);
  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStations();
    const today = new Date();
    setDate(today.toISOString().split('T')[0]);
    setTime('09:00');
  }, []);

  const loadStations = async () => {
    try {
      const response = await api.get('/stations');
      setStations(response.data);
    } catch (error) {
      console.error('Failed to load stations:', error);
    }
  };

  const addStop = () => {
    setStops([...stops, '']);
  };

  const removeStop = (index: number) => {
    setStops(stops.filter((_, i) => i !== index));
  };

  const updateStop = (index: number, value: string) => {
    const newStops = [...stops];
    newStops[index] = value;
    setStops(newStops);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupFrom || !travelTo) {
      toast.error('Please select pickup and destination');
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        origin: pickupFrom,
        destination: travelTo,
        date: date || new Date().toISOString().split('T')[0],
        passengers: passengers.toString(),
      });
      navigate(`/trips?${params.toString()}`);
    } catch (error) {
      toast.error('Failed to search trips');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AllRide Bus Booking Form</h1>
        </div>

        {/* Bus Tab */}
        <div className="mb-4">
          <span className="inline-block bg-green-500 text-white px-4 py-2 rounded-t-lg text-sm font-medium">
            Bus
          </span>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Book Bus Online</h2>
            <div className="flex space-x-4 text-sm text-blue-600">
              <button className="hover:underline">View</button>
              <button className="hover:underline">Edit</button>
              <button className="hover:underline">Cancel</button>
            </div>
          </div>

          <form onSubmit={handleSearch} className="space-y-6">
            {/* Trip Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trip type</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="tripType"
                    value="one-way"
                    checked={tripType === 'one-way'}
                    onChange={(e) => setTripType(e.target.value as 'one-way' | 'round')}
                    className="mr-2"
                  />
                  <span>One Way Trip</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="tripType"
                    value="round"
                    checked={tripType === 'round'}
                    onChange={(e) => setTripType(e.target.value as 'one-way' | 'round')}
                    className="mr-2"
                  />
                  <span>Round Trip</span>
                </label>
              </div>
            </div>

            {/* Pickup From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pickup From</label>
              <select
                value={pickupFrom}
                onChange={(e) => setPickupFrom(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select city/ stop location</option>
                {stations.map((station) => (
                  <option key={station.id} value={station.id}>
                    {station.name}, {station.city}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={addStop}
                className="mt-2 text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1"
              >
                <Plus className="h-4 w-4" />
                <span>+ Add A Stop</span>
              </button>
            </div>

            {/* Stops */}
            {stops.map((stop, index) => (
              <div key={index} className="flex items-center space-x-2">
                <select
                  value={stop}
                  onChange={(e) => updateStop(index, e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select stop location</option>
                  {stations.map((station) => (
                    <option key={station.id} value={station.id}>
                      {station.name}, {station.city}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removeStop(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ))}

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">On</label>
                <div className="relative">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 pl-10"
                    required
                  />
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">At</label>
                <div className="relative">
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 pl-10"
                    required
                  />
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Travel To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Travel To</label>
              <select
                value={travelTo}
                onChange={(e) => setTravelTo(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select your city/ stop location</option>
                {stations.map((station) => (
                  <option key={station.id} value={station.id}>
                    {station.name}, {station.city}
                  </option>
                ))}
              </select>
            </div>

            {/* Number of Passengers */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">No. Of Passengers</label>
              <select
                value={passengers}
                onChange={(e) => setPassengers(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'Passenger' : 'Passengers'}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Searching...' : 'Search Now'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

