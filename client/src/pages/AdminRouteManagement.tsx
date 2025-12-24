import { useState, useEffect } from 'react';
import { Search, Filter, Plus, MapPin, GripVertical, Trash2, X, Edit } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function AdminRouteManagement() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [stations, setStations] = useState<any[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [showNewRoute, setShowNewRoute] = useState(false);
  const [editingRoute, setEditingRoute] = useState<any>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    startTime: '07:00',
    endTime: '16:00',
    interval: 60,
    price: 0,
    isActive: true,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    startStation: '',
    endStation: '',
    stops: [] as string[],
    isActive: true,
  });

  useEffect(() => {
    loadRoutes();
    loadStations();
  }, []);

  const loadRoutes = async () => {
    try {
      const response = await api.get('/routes');
      setRoutes(response.data);
      // Update selected route if it exists
      if (selectedRoute) {
        const updatedRoute = response.data.find((r: any) => r.id === selectedRoute.id);
        if (updatedRoute) {
          setSelectedRoute(updatedRoute);
        }
      }
    } catch (error) {
      toast.error('Failed to load routes');
    }
  };

  const loadStations = async () => {
    try {
      const response = await api.get('/stations');
      setStations(response.data);
    } catch (error) {
      toast.error('Failed to load stations');
    }
  };

  const addStop = () => {
    setFormData({ ...formData, stops: [...formData.stops, ''] });
  };

  const removeStop = (index: number) => {
    setFormData({ ...formData, stops: formData.stops.filter((_, i) => i !== index) });
  };

  const updateStop = (index: number, value: string) => {
    const newStops = [...formData.stops];
    newStops[index] = value;
    setFormData({ ...formData, stops: newStops });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const routeStations = [
        { stationId: formData.startStation, order: 1, distance: 0 },
        ...formData.stops.map((stopId, index) => ({
          stationId: stopId,
          order: index + 2,
          distance: null,
        })),
        { stationId: formData.endStation, order: formData.stops.length + 2, distance: null },
      ];

      if (editingRoute) {
        await api.put(`/routes/${editingRoute.id}`, {
          name: formData.name,
          code: formData.code,
          stations: routeStations,
          isActive: formData.isActive,
        });
        toast.success('Route updated successfully');
      } else {
        await api.post('/routes', {
          name: formData.name,
          code: formData.code,
          stations: routeStations,
          isActive: formData.isActive,
        });
        toast.success('Route created successfully');
      }

      setShowNewRoute(false);
      setEditingRoute(null);
      setFormData({ name: '', code: '', startStation: '', endStation: '', stops: [], isActive: true });
      loadRoutes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save route');
    }
  };

  const handleEdit = (route: any) => {
    setEditingRoute(route);
    const routeStations = route.routeStations || [];
    setFormData({
      name: route.name,
      code: route.code,
      startStation: routeStations[0]?.stationId || '',
      endStation: routeStations[routeStations.length - 1]?.stationId || '',
      stops: routeStations.slice(1, -1).map((rs: any) => rs.stationId),
      isActive: route.isActive,
    });
    setShowNewRoute(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this route?')) return;
    try {
      await api.delete(`/routes/${id}`);
      toast.success('Route deleted successfully');
      loadRoutes();
      if (selectedRoute?.id === id) {
        setSelectedRoute(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete route');
    }
  };

  const loadSchedule = async (routeId: string) => {
    try {
      const response = await api.get(`/routes/${routeId}/schedule`);
      setScheduleData({
        startTime: response.data.startTime || '07:00',
        endTime: response.data.endTime || '16:00',
        interval: response.data.interval || 60,
        price: response.data.price || 0,
        isActive: response.data.isActive !== undefined ? response.data.isActive : true,
      });
    } catch (error) {
      // Schedule doesn't exist yet, use defaults
      setScheduleData({
        startTime: '07:00',
        endTime: '16:00',
        interval: 60,
        price: 0,
        isActive: true,
      });
    }
  };

  const handleSaveSchedule = async () => {
    if (!selectedRoute) return;
    try {
      await api.post(`/routes/${selectedRoute.id}/schedule`, scheduleData);
      toast.success('Schedule saved successfully');
      setShowScheduleModal(false);
      loadRoutes();
      // Reload selected route to get updated schedule
      const response = await api.get(`/routes/${selectedRoute.id}`);
      setSelectedRoute(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save schedule');
    }
  };

  const openScheduleModal = async () => {
    if (!selectedRoute) {
      toast.error('Please select a route first');
      return;
    }
    await loadSchedule(selectedRoute.id);
    setShowScheduleModal(true);
  };

  const filteredRoutes = routes.filter((route) =>
    route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bus Route Management</h1>
          <p className="text-gray-600">Create and manage bus routes with stoppages</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Route List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Bus Route Management</h2>
              <p className="text-sm text-gray-600 mb-4">Add and manage bus routes efficiently</p>

              <div className="flex space-x-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search route"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                  />
                </div>
                <button className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-700">
                  <Filter className="h-5 w-5" />
                  <span>Filter {routes.length}</span>
                </button>
              </div>

              <div className="space-y-4">
                {filteredRoutes.map((route) => (
                  <div
                    key={route.id}
                    onClick={() => setSelectedRoute(route)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedRoute?.id === route.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">{route.name}</h3>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(route);
                          }}
                          className="text-primary-600 hover:text-primary-700 p-1"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(route.id);
                          }}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <span className="text-sm text-gray-600">{route.routeStations?.length || 0} Stops</span>
                        <span className={`w-2 h-2 rounded-full ${route.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className="text-sm text-gray-600">{route.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 text-green-500" />
                      <span>
                        {route.routeStations?.[0]?.station?.name || 'Start'} →{' '}
                        {route.routeStations?.[route.routeStations.length - 1]?.station?.name || 'End'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - New Route Form or Route Details */}
          <div className="lg:col-span-1">
            {showNewRoute ? (
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">{editingRoute ? 'Edit Route' : 'New Route'}</h2>
                  <button
                    onClick={() => {
                      setShowNewRoute(false);
                      setEditingRoute(null);
                      setFormData({ name: '', code: '', startStation: '', endStation: '', stops: [], isActive: true });
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Route Title</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Route title"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Route Code</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="e.g., BEN-LOS"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">ARRANGE ROUTE</label>
                    <p className="text-xs text-gray-600 mb-3">
                      Drag the positions up and down to rearrange stops.
                    </p>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium mb-1">Start Station</label>
                        <select
                          value={formData.startStation}
                          onChange={(e) => setFormData({ ...formData, startStation: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                          required
                        >
                          <option value="">Select station</option>
                          {stations.map((station) => (
                            <option key={station.id} value={station.id}>
                              {station.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {formData.stops.map((stop, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <GripVertical className="h-5 w-5 text-gray-400" />
                          <span className="text-sm font-medium w-6">{index + 1}</span>
                          <select
                            value={stop}
                            onChange={(e) => updateStop(index, e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                          >
                            <option value="">Select station</option>
                            {stations.map((station) => (
                              <option key={station.id} value={station.id}>
                                {station.name}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => removeStop(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={addStop}
                        className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1"
                      >
                        <Plus className="h-4 w-4" />
                        <span>+ Add stop</span>
                      </button>

                      <div>
                        <label className="block text-xs font-medium mb-1">End Station</label>
                        <select
                          value={formData.endStation}
                          onChange={(e) => setFormData({ ...formData, endStation: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                          required
                        >
                          <option value="">Select Station</option>
                          {stations.map((station) => (
                            <option key={station.id} value={station.id}>
                              {station.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewRoute(false);
                        setEditingRoute(null);
                        setFormData({ name: '', code: '', startStation: '', endStation: '', stops: [], isActive: true });
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                      {editingRoute ? 'Update Route' : 'Add Route'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                <button
                  onClick={() => {
                    setEditingRoute(null);
                    setFormData({ name: '', code: '', startStation: '', endStation: '', stops: [], isActive: true });
                    setShowNewRoute(true);
                  }}
                  className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 flex items-center justify-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>Create New Route</span>
                </button>

                {selectedRoute && (
                  <div className="mt-6">
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-2xl font-bold text-white">
                          {selectedRoute.name.charAt(0)}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg text-gray-900">{selectedRoute.name}</h3>
                      <p className="text-sm text-gray-600">{selectedRoute.routeStations?.length || 0} Stops</p>
                    </div>
                    
                    {/* Schedule Management */}
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-sm mb-2 text-gray-900">Daily Schedule</h4>
                      {selectedRoute.schedule ? (
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Time: {selectedRoute.schedule.startTime} - {selectedRoute.schedule.endTime}</p>
                          <p>Interval: Every {selectedRoute.schedule.interval} minutes</p>
                          <p>Price: ₦{selectedRoute.schedule.price.toFixed(2)}</p>
                          <button
                            onClick={openScheduleModal}
                            className="mt-2 text-primary-600 hover:text-primary-700 text-xs"
                          >
                            Edit Schedule
                          </button>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-600">
                          <p className="mb-2">No schedule set</p>
                          <button
                            onClick={openScheduleModal}
                            className="text-primary-600 hover:text-primary-700 text-xs"
                          >
                            Create Schedule
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="text-sm">Start Station: {selectedRoute.routeStations?.[0]?.station?.name}</span>
                      </div>
                      {selectedRoute.routeStations?.slice(1, -1).map((rs: any, index: number) => (
                        <div key={rs.id} className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                          <span className="text-sm">Stop {index + 2}: {rs.station?.name || 'Stop title'}</span>
                        </div>
                      ))}
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="text-sm">
                          End Station: {selectedRoute.routeStations?.[selectedRoute.routeStations.length - 1]?.station?.name}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && selectedRoute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Route Schedule: {selectedRoute.name}
                </h2>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time (Daily)
                  </label>
                  <input
                    type="time"
                    value={scheduleData.startTime}
                    onChange={(e) => setScheduleData({ ...scheduleData, startTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Default: 7:00 AM</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time (Daily)
                  </label>
                  <input
                    type="time"
                    value={scheduleData.endTime}
                    onChange={(e) => setScheduleData({ ...scheduleData, endTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Default: 4:00 PM</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interval (minutes)
                  </label>
                  <input
                    type="number"
                    value={scheduleData.interval}
                    onChange={(e) => setScheduleData({ ...scheduleData, interval: parseInt(e.target.value) || 60 })}
                    min="15"
                    max="240"
                    step="15"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">How often buses run (e.g., 60 = every hour)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Price (₦)
                  </label>
                  <input
                    type="number"
                    value={scheduleData.price}
                    onChange={(e) => setScheduleData({ ...scheduleData, price: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={scheduleData.isActive}
                      onChange={(e) => setScheduleData({ ...scheduleData, isActive: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Active Schedule</span>
                  </label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowScheduleModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveSchedule}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Save Schedule
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

