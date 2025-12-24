import { Link } from 'react-router-dom';
import { Search, MapPin, Calendar, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Home() {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    originId: '',
    destinationId: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadStations = async () => {
    try {
      const response = await api.get('/stations');
      setStations(response.data);
    } catch (error) {
      console.error('Failed to load stations:', error);
    }
  };

  useEffect(() => {
    loadStations();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchData.originId || !searchData.destinationId) {
      toast.error('Please select origin and destination');
      return;
    }

    setLoading(true);
    try {
      navigate(`/trips?origin=${searchData.originId}&destination=${searchData.destinationId}&date=${searchData.date}`);
    } catch (error) {
      toast.error('Failed to search trips');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to Eagle Line
          </h1>
          <p className="text-xl mb-8">
            Your trusted partner for comfortable and reliable bus travel
          </p>

          <div className="mb-6">
            <Link
              to="/book-online"
              className="inline-block bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Book Bus Online →
            </Link>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-xl p-6 text-gray-900">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">From</label>
                <select
                  value={searchData.originId}
                  onChange={(e) => setSearchData({ ...searchData, originId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  required
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
                <label className="block text-sm font-medium mb-2">To</label>
                <select
                  value={searchData.destinationId}
                  onChange={(e) => setSearchData({ ...searchData, destinationId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  required
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
                <label className="block text-sm font-medium mb-2">Date</label>
                <input
                  type="date"
                  value={searchData.date}
                  onChange={(e) => setSearchData({ ...searchData, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 rounded-md font-medium hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Search className="h-5 w-5" />
              <span>{loading ? 'Searching...' : 'Search Trips'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Eagle Line?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Multiple Routes</h3>
              <p className="text-gray-600">Extensive network covering major destinations</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
              <p className="text-gray-600">Book your seat online in just a few clicks</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Comfortable Travel</h3>
              <p className="text-gray-600">Spacious seats and modern amenities</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Tracking</h3>
              <p className="text-gray-600">Track your bus in real-time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
