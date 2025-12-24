import { useState, useEffect } from 'react';
import { Search, Filter, Plus, MapPin, X, Edit, Trash2 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function AdminStationManagement() {
  const [stations, setStations] = useState<any[]>([]);
  const [selectedStation, setSelectedStation] = useState<any>(null);
  const [showNewStation, setShowNewStation] = useState(false);
  const [editingStation, setEditingStation] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    city: '',
    state: '',
    country: 'Nigeria',
    type: 'Bus Stop',
    category: 'Bus',
    latitude: '',
    longitude: '',
  });

  const nigerianStates = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
    'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa',
    'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger',
    'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
    'FCT Abuja'
  ];

  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    try {
      const response = await api.get('/stations');
      setStations(response.data);
    } catch (error) {
      toast.error('Failed to load stations');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      };
      
      if (editingStation) {
        await api.put(`/stations/${editingStation.id}`, submitData);
        toast.success('Station updated successfully');
      } else {
        await api.post('/stations', submitData);
        toast.success('Station created successfully');
      }
      setShowNewStation(false);
      setEditingStation(null);
      setFormData({
        name: '',
        code: '',
        address: '',
        city: '',
        state: '',
        country: 'Nigeria',
        type: 'Bus Stop',
        category: 'Bus',
        latitude: '',
        longitude: '',
      });
      loadStations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save station');
    }
  };

  const handleEdit = (station: any) => {
    setEditingStation(station);
    setFormData({
      name: station.name,
      code: station.code,
      address: station.address,
      city: station.city,
      state: station.state || '',
      country: station.country || 'Nigeria',
      type: station.type || 'Bus Stop',
      category: station.category || 'Bus',
      latitude: station.latitude?.toString() || '',
      longitude: station.longitude?.toString() || '',
    });
    setShowNewStation(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this station?')) return;
    try {
      await api.delete(`/stations/${id}`);
      toast.success('Station deleted successfully');
      loadStations();
      if (selectedStation?.id === id) {
        setSelectedStation(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete station');
    }
  };

  const filteredStations = stations.filter((station) =>
    station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    station.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bus Station Management</h1>
          <p className="text-gray-600">Manage and update bus stations with stop type and location seamlessly</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Station List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Bus Station Management</h2>
              <p className="text-sm text-gray-600 mb-4">Add and manage stations efficiently</p>

              <div className="flex space-x-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Q Search station"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                  />
                </div>
                <button className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-700">
                  <Filter className="h-5 w-5" />
                  <span>Filter {stations.length}</span>
                </button>
              </div>

              <div className="space-y-4">
                {filteredStations.map((station) => (
                  <div
                    key={station.id}
                    onClick={() => setSelectedStation(station)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedStation?.id === station.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {station.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">{station.name}</h3>
                            <p className="text-sm text-gray-600">
                              Type: {station.type || 'Bus Station'}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 ml-16">{station.address}</p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(station);
                          }}
                          className="text-primary-600 hover:text-primary-700 p-1"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(station.id);
                          }}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - New Station Form */}
          <div className="lg:col-span-1">
            {showNewStation ? (
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">{editingStation ? 'Edit Station' : 'New Station'}</h2>
                  <button
                    onClick={() => {
                      setShowNewStation(false);
                      setEditingStation(null);
                      setFormData({
                        name: '',
                        code: '',
                        address: '',
                        city: '',
                        state: '',
                        country: 'Nigeria',
                        type: 'Bus Stop',
                        category: 'Bus',
                      });
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Station Category</label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="category"
                          value="Bus"
                          checked={formData.category === 'Bus'}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="mr-2"
                        />
                        <span>Bus</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="category"
                          value="Scooter"
                          checked={formData.category === 'Scooter'}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="mr-2"
                        />
                        <span>Scooter</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Station Title</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Station title"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Station Code</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="e.g., BEN"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                    >
                      <option>Bus Stop</option>
                      <option>Bus Station</option>
                      <option>Terminal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Add Location</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Enter address"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="City"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">State</label>
                    <select
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                    >
                      <option value="">Select State</option>
                      {nigerianStates.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Latitude (Optional)</label>
                      <input
                        type="number"
                        step="any"
                        value={formData.latitude}
                        onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                        placeholder="e.g., 6.5244"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                      />
                      <p className="text-xs text-gray-500 mt-1">For map display</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Longitude (Optional)</label>
                      <input
                        type="number"
                        step="any"
                        value={formData.longitude}
                        onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                        placeholder="e.g., 3.3792"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                      />
                      <p className="text-xs text-gray-500 mt-1">For map display</p>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewStation(false);
                        setEditingStation(null);
                        setFormData({
                          name: '',
                          code: '',
                          address: '',
                          city: '',
                          state: '',
                          country: 'Nigeria',
                          type: 'Bus Stop',
                          category: 'Bus',
                          latitude: '',
                          longitude: '',
                        });
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                      {editingStation ? 'Update Station' : 'Add Station'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                <button
                  onClick={() => {
                    setEditingStation(null);
                    setFormData({
                      name: '',
                      code: '',
                      address: '',
                      city: '',
                      state: '',
                      country: 'Nigeria',
                      type: 'Bus Stop',
                      category: 'Bus',
                    });
                    setShowNewStation(true);
                  }}
                  className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 flex items-center justify-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>Create New Station</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

