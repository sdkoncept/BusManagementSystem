import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Filter, Plus, MapPin, Users, Play, User, Bus, X, Edit } from 'lucide-react';
import api from '../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function AdminTripManagement() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<any[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [completedTrips, setCompletedTrips] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [stations, setStations] = useState<any[]>([]);
  const [assignForm, setAssignForm] = useState({
    busId: '',
    driverId: '',
  });
  const [editForm, setEditForm] = useState({
    routeId: '',
    busId: '',
    driverId: '',
    originId: '',
    destinationId: '',
    departureTime: '',
    arrivalTime: '',
    price: 0,
    status: 'SCHEDULED',
  });

  useEffect(() => {
    loadTrips();
    loadBuses();
    loadDrivers();
    loadRoutes();
    loadStations();
  }, []);

  useEffect(() => {
    if (showCompleted) {
      loadCompletedTrips();
    }
  }, [showCompleted]);

  const loadTrips = async () => {
    try {
      const response = await api.get('/trips', { params: { includeCompleted: 'false' } });
      setTrips(response.data);
      if (response.data.length > 0 && !selectedTrip && !showCompleted) {
        setSelectedTrip(response.data[0]);
      }
    } catch (error) {
      toast.error('Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  const loadCompletedTrips = async () => {
    try {
      const response = await api.get('/trips/completed');
      setCompletedTrips(response.data);
    } catch (error) {
      toast.error('Failed to load completed trips');
    }
  };

  const loadBuses = async () => {
    try {
      const response = await api.get('/buses', { params: { isActive: true } });
      setBuses(response.data);
    } catch (error) {
      console.error('Failed to load buses');
    }
  };

  const loadDrivers = async () => {
    try {
      const response = await api.get('/drivers', { params: { isActive: true } });
      setDrivers(response.data);
    } catch (error) {
      console.error('Failed to load drivers');
    }
  };

  const loadRoutes = async () => {
    try {
      const response = await api.get('/routes', { params: { isActive: true } });
      setRoutes(response.data);
    } catch (error) {
      console.error('Failed to load routes');
    }
  };

  const loadStations = async () => {
    try {
      const response = await api.get('/stations');
      setStations(response.data);
    } catch (error) {
      console.error('Failed to load stations');
    }
  };

  const handleAssignDriver = async () => {
    if (!selectedTrip) return;
    if (!assignForm.driverId) {
      toast.error('Please select a driver');
      return;
    }

    try {
      await api.patch(`/trips/${selectedTrip.id}/assign-driver`, {
        driverId: assignForm.driverId,
      });
      toast.success('Driver assigned successfully');
      setShowAssignModal(false);
      loadTrips();
      // Update selected trip
      const updatedTrip = trips.find((t) => t.id === selectedTrip.id);
      if (updatedTrip) {
        const response = await api.get(`/trips/${selectedTrip.id}`);
        setSelectedTrip(response.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to assign driver');
    }
  };

  const handleAssignBus = async () => {
    if (!selectedTrip) return;
    if (!assignForm.busId) {
      toast.error('Please select a bus');
      return;
    }

    try {
      await api.patch(`/trips/${selectedTrip.id}/assign-bus`, {
        busId: assignForm.busId,
      });
      toast.success('Bus assigned successfully');
      setShowAssignModal(false);
      loadTrips();
      // Update selected trip
      const response = await api.get(`/trips/${selectedTrip.id}`);
      setSelectedTrip(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to assign bus');
    }
  };

  const handleAssignBoth = async () => {
    if (!selectedTrip) return;
    if (!assignForm.busId || !assignForm.driverId) {
      toast.error('Please select both bus and driver');
      return;
    }

    try {
      await Promise.all([
        api.patch(`/trips/${selectedTrip.id}/assign-bus`, { busId: assignForm.busId }),
        api.patch(`/trips/${selectedTrip.id}/assign-driver`, { driverId: assignForm.driverId }),
      ]);
      toast.success('Bus and driver assigned successfully');
      setShowAssignModal(false);
      loadTrips();
      // Update selected trip
      const response = await api.get(`/trips/${selectedTrip.id}`);
      setSelectedTrip(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to assign bus and driver');
    }
  };

  const openAssignModal = () => {
    if (!selectedTrip) {
      toast.error('Please select a trip first');
      return;
    }
    setAssignForm({
      busId: selectedTrip.busId || '',
      driverId: selectedTrip.driverId || '',
    });
    setShowAssignModal(true);
  };

  const openEditModal = async () => {
    if (!selectedTrip) {
      toast.error('Please select a trip first');
      return;
    }
    
    // Load full trip details
    try {
      const response = await api.get(`/trips/${selectedTrip.id}`);
      const trip = response.data;
      
      setEditForm({
        routeId: trip.routeId || '',
        busId: trip.busId || '',
        driverId: trip.driverId || '',
        originId: trip.originId || '',
        destinationId: trip.destinationId || '',
        departureTime: format(new Date(trip.departureTime), "yyyy-MM-dd'T'HH:mm"),
        arrivalTime: format(new Date(trip.arrivalTime), "yyyy-MM-dd'T'HH:mm"),
        price: trip.price || 0,
        status: trip.status || 'SCHEDULED',
      });
      setShowEditModal(true);
    } catch (error) {
      toast.error('Failed to load trip details');
    }
  };

  const handleRouteChange = (routeId: string) => {
    const route = routes.find((r) => r.id === routeId);
    if (route && route.routeStations && route.routeStations.length > 0) {
      const origin = route.routeStations[0]?.station;
      const destination = route.routeStations[route.routeStations.length - 1]?.station;
      setEditForm({
        ...editForm,
        routeId,
        originId: origin?.id || editForm.originId,
        destinationId: destination?.id || editForm.destinationId,
      });
    } else {
      setEditForm({ ...editForm, routeId });
    }
  };

  const handleUpdateTrip = async () => {
    if (!selectedTrip) return;

    try {
      await api.put(`/trips/${selectedTrip.id}`, editForm);
      setShowEditModal(false);
      
      // If trip was marked as completed, move it to completed trips
      if (editForm.status === 'COMPLETED') {
        toast.success('Trip marked as completed and moved to completed trips');
        setShowCompleted(true);
        setSelectedTrip(null);
        loadTrips(); // Refresh active trips (will remove the completed one)
        loadCompletedTrips(); // Load completed trips
      } else {
        toast.success('Trip updated successfully');
        loadTrips(); // Reload active trips
        // Reload selected trip
        const response = await api.get(`/trips/${selectedTrip.id}`);
        setSelectedTrip(response.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update trip');
    }
  };

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

  const filteredTrips = (showCompleted ? completedTrips : trips).filter((trip) =>
    trip.bus?.plateNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.origin?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.destination?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.driver?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.driver?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Bus Trip Management</h1>
              <p className="text-gray-600">Add and manage bus trips efficiently</p>
            </div>
          <div className="flex space-x-3">
            <button
              onClick={async () => {
                try {
                  const today = new Date().toISOString().split('T')[0];
                  const response = await api.post('/trips/generate-daily', { date: today });
                  toast.success(response.data.message || 'Daily trips generated successfully');
                  loadTrips();
                } catch (error: any) {
                  toast.error(error.response?.data?.message || 'Failed to generate daily trips');
                }
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Generate Today's Trips
            </button>
            <button
              onClick={() => {
                setShowCompleted(!showCompleted);
                setSelectedTrip(null);
              }}
              className={`px-4 py-2 rounded-lg ${
                showCompleted
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {showCompleted ? 'Show Active Trips' : 'Show Completed Trips'}
            </button>
            <Link
              to="/admin/monitoring"
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 inline-block"
            >
              View Monitoring Dashboard
            </Link>
          </div>
          </div>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Trips</p>
                  <p className="text-2xl font-bold text-gray-900">{trips.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed Trips</p>
                  <p className="text-2xl font-bold text-gray-900">{completedTrips.length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₦{completedTrips.reduce((sum, trip) => sum + (trip._count?.bookings || 0) * (trip.price || 0), 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">₦</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Trip List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {showCompleted ? 'Completed Trips' : 'Active Trips'}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {showCompleted
                      ? `Viewing ${completedTrips.length} completed trip(s)`
                      : `Managing ${trips.length} active trip(s)`}
                  </p>
                </div>
                {showCompleted && (
                  <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    Completed
                  </div>
                )}
              </div>

              <div className="flex space-x-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search trip"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                  />
                </div>
                <button className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-700">
                  <Filter className="h-5 w-5" />
                  <span>Filter all</span>
                </button>
                <button className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-700">
                  <Plus className="h-5 w-5" />
                  <span>Add Trip</span>
                </button>
              </div>

              <div className="space-y-4">
                {filteredTrips.length === 0 ? (
                  <div className="text-center py-12 text-gray-600">
                    {showCompleted ? 'No completed trips found' : 'No active trips found'}
                  </div>
                ) : (
                  filteredTrips.map((trip) => (
                    <div
                      key={trip.id}
                      onClick={() => {
                        if (!showCompleted) {
                          setSelectedTrip(trip);
                          navigate(`/admin/trips/${trip.id}`);
                        }
                      }}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        showCompleted
                          ? 'border-gray-200 bg-gray-50'
                          : selectedTrip?.id === trip.id
                          ? 'border-primary-500 bg-primary-50 cursor-pointer'
                          : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                      }`}
                    >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{trip.bus?.plateNumber || 'No Bus'}</span>
                        <span className={`w-2 h-2 rounded-full ${getStatusColor(trip.status)}`}></span>
                        <span className="text-sm text-gray-600 capitalize">{trip.status}</span>
                      </div>
                      {!showCompleted && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTrip(trip);
                            openEditModal();
                          }}
                          className="text-primary-600 hover:text-primary-700 p-1"
                          title="Edit trip"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="text-sm text-gray-600 mb-2">
                      {trip.status === 'COMPLETED' || trip.status === 'IN_PROGRESS' ? (
                        <span>
                          Started: {format(new Date(trip.departureTime), "dd MMM 'yy, hh:mm a")}
                        </span>
                      ) : (
                        <span>
                          Scheduled: {format(new Date(trip.departureTime), "dd MMM 'yy, hh:mm a")}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="h-4 w-4 text-green-500" />
                      <span className="text-sm">
                        {trip.origin?.name} → {trip.destination?.name}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 text-sm mb-2">
                      <div className="flex items-center space-x-1">
                        <Bus className="h-4 w-4 text-gray-500" />
                        <span className={trip.bus ? 'text-gray-900' : 'text-red-600'}>
                          {trip.bus ? trip.bus.plateNumber : 'No Bus'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className={trip.driver ? 'text-gray-900' : 'text-red-600'}>
                          {trip.driver ? `${trip.driver.firstName} ${trip.driver.lastName}` : 'No Driver'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <span className="font-semibold">
                            Revenue: ₦{trip._count?.bookings ? (trip._count.bookings * trip.price).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span>Riders: {trip._count?.bookings || 0}</span>
                        </div>
                      </div>
                    </div>
                    {showCompleted && (
                      <div className="mt-2 text-xs text-gray-500">
                        Completed: {format(new Date(trip.arrivalTime || trip.departureTime), "dd MMM yyyy, hh:mm a")}
                      </div>
                    )}
                  </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Trip Details */}
          {selectedTrip && !showCompleted && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl font-bold text-white">
                      {selectedTrip.bus?.plateNumber?.charAt(0) || 'T'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedTrip.bus?.plateNumber || 'Trip'} • {selectedTrip.status}
                  </h3>
                  <p className="text-gray-600">Eagle Line</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-gray-900">Start Station</h4>
                    <p className="text-gray-700">{selectedTrip.origin?.name}</p>
                    <p className="text-sm text-gray-500">
                      Start Time: {format(new Date(selectedTrip.departureTime), "dd MMM yyyy, hh:mm a")}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 text-gray-900">End Station</h4>
                    <p className="text-gray-700">{selectedTrip.destination?.name}</p>
                    <p className="text-sm text-gray-500">
                      End Time: {format(new Date(selectedTrip.arrivalTime), "dd MMM yyyy, hh:mm a")}
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-gray-900">Bus</h4>
                      {!selectedTrip.bus && (
                        <span className="text-xs text-red-600">Not Assigned</span>
                      )}
                    </div>
                    <p className={selectedTrip.bus ? 'text-gray-700' : 'text-red-600'}>
                      {selectedTrip.bus ? `${selectedTrip.bus.plateNumber} (${selectedTrip.bus.model})` : 'Not Assigned'}
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-gray-900">Driver</h4>
                      {!selectedTrip.driver && (
                        <span className="text-xs text-red-600">Not Assigned</span>
                      )}
                    </div>
                    <p className={selectedTrip.driver ? 'text-primary-600' : 'text-red-600'}>
                      {selectedTrip.driver
                        ? `${selectedTrip.driver.firstName} ${selectedTrip.driver.lastName}`
                        : 'Not Assigned'}
                    </p>
                    {selectedTrip.driver && (
                      <p className="text-sm text-gray-500 mt-1">
                        License: {selectedTrip.driver.driversLicense}
                      </p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 text-gray-900">No. of Riders</h4>
                    <p className="text-gray-700">{selectedTrip._count?.bookings || 0}</p>
                  </div>

                  <div className="flex space-x-2 mt-4">
                    <button
                      onClick={openEditModal}
                      className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 flex items-center justify-center space-x-2"
                    >
                      <Edit className="h-5 w-5" />
                      <span>Edit Trip</span>
                    </button>
                    <button
                      onClick={openAssignModal}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2"
                    >
                      <User className="h-5 w-5" />
                      <span>Assign</span>
                    </button>
                  </div>

                  <div className="relative mt-6">
                    <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Play className="h-16 w-16 text-primary-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Assignment Modal */}
      {showAssignModal && selectedTrip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Assign Bus & Driver</h2>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Bus *
                  </label>
                  <select
                    value={assignForm.busId}
                    onChange={(e) => setAssignForm({ ...assignForm, busId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                  >
                    <option value="">Select a bus</option>
                    {buses.map((bus) => (
                      <option key={bus.id} value={bus.id}>
                        {bus.plateNumber} - {bus.manufacturer} {bus.model} ({bus.capacity} seats)
                      </option>
                    ))}
                  </select>
                  {selectedTrip.bus && (
                    <p className="text-sm text-gray-500 mt-1">
                      Current: {selectedTrip.bus.plateNumber}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Driver *
                  </label>
                  <select
                    value={assignForm.driverId}
                    onChange={(e) => setAssignForm({ ...assignForm, driverId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                  >
                    <option value="">Select a driver</option>
                    {drivers.map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.firstName} {driver.lastName} - {driver.driversLicense}
                      </option>
                    ))}
                  </select>
                  {selectedTrip.driver && (
                    <p className="text-sm text-gray-500 mt-1">
                      Current: {selectedTrip.driver.firstName} {selectedTrip.driver.lastName}
                    </p>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowAssignModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAssignBus}
                    disabled={!assignForm.busId}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Assign Bus Only
                  </button>
                  <button
                    onClick={handleAssignDriver}
                    disabled={!assignForm.driverId}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Assign Driver Only
                  </button>
                  <button
                    onClick={handleAssignBoth}
                    disabled={!assignForm.busId || !assignForm.driverId}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Assign Both
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Trip Modal */}
      {showEditModal && selectedTrip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Trip</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleUpdateTrip(); }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Route *
                    </label>
                    <select
                      value={editForm.routeId}
                      onChange={(e) => handleRouteChange(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                      required
                    >
                      <option value="">Select route</option>
                      {routes.map((route) => (
                        <option key={route.id} value={route.id}>
                          {route.name} ({route.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status *
                    </label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                      required
                    >
                      <option value="SCHEDULED">Scheduled</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                      <option value="DELAYED">Delayed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bus *
                    </label>
                    <select
                      value={editForm.busId}
                      onChange={(e) => setEditForm({ ...editForm, busId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                      required
                    >
                      <option value="">Select a bus</option>
                      {buses.map((bus) => (
                        <option key={bus.id} value={bus.id}>
                          {bus.plateNumber} - {bus.manufacturer} {bus.model}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Driver
                    </label>
                    <select
                      value={editForm.driverId}
                      onChange={(e) => setEditForm({ ...editForm, driverId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                    >
                      <option value="">No driver</option>
                      {drivers.map((driver) => (
                        <option key={driver.id} value={driver.id}>
                          {driver.firstName} {driver.lastName} - {driver.driversLicense}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Origin Station *
                    </label>
                    <select
                      value={editForm.originId}
                      onChange={(e) => setEditForm({ ...editForm, originId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Destination Station *
                    </label>
                    <select
                      value={editForm.destinationId}
                      onChange={(e) => setEditForm({ ...editForm, destinationId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Departure Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={editForm.departureTime}
                      onChange={(e) => setEditForm({ ...editForm, departureTime: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Arrival Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={editForm.arrivalTime}
                      onChange={(e) => setEditForm({ ...editForm, arrivalTime: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (₦) *
                    </label>
                    <input
                      type="number"
                      value={editForm.price}
                      onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                      required
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Update Trip
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
