import { useEffect, useState } from 'react';
import { MapPin, Calendar, Clock, Bus, User, Fuel, Phone, AlertCircle, CheckCircle, Package, History, UserCircle, Filter } from 'lucide-react';
import api from '../services/api';
import { format, startOfWeek, startOfMonth, startOfYear, endOfWeek, endOfMonth, endOfYear } from 'date-fns';
import toast from 'react-hot-toast';

type TabType = 'current' | 'profile' | 'requisition' | 'sos' | 'history';

export default function DriverView() {
  const [activeTab, setActiveTab] = useState<TabType>('current');
  const [trips, setTrips] = useState<any[]>([]);
  const [tripHistory, setTripHistory] = useState<any[]>([]);
  const [driverProfile, setDriverProfile] = useState<any>(null);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showFuelModal, setShowFuelModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showRequisitionModal, setShowRequisitionModal] = useState(false);
  const [fuelForm, setFuelForm] = useState({ amount: '', description: '', location: '' });
  const [helpForm, setHelpForm] = useState({ description: '', location: '' });
  const [requisitionForm, setRequisitionForm] = useState({ inventoryId: '', quantity: 0, reason: '' });
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [historyFilter, setHistoryFilter] = useState<'week' | 'month' | 'year' | 'all'>('all');

  useEffect(() => {
    loadTrips();
    loadDriverProfile();
    loadInventoryItems();
  }, []);

  useEffect(() => {
    if (activeTab === 'history') {
      loadTripHistory();
    }
  }, [activeTab, historyFilter]);

  const loadTrips = async () => {
    try {
      const response = await api.get('/trips/driver/my-trips');
      setTrips(response.data);
      if (response.data.length > 0) {
        setSelectedTrip(response.data[0]);
      }
    } catch (error: any) {
      if (error.response?.status === 403) {
        toast.error('You are not linked to a driver account');
      } else {
        toast.error('Failed to load trips');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadDriverProfile = async () => {
    try {
      const response = await api.get('/drivers/me');
      setDriverProfile(response.data);
    } catch (error: any) {
      console.error('Failed to load driver profile:', error);
    }
  };

  const loadInventoryItems = async () => {
    try {
      const response = await api.get('/inventory');
      setInventoryItems(response.data);
    } catch (error: any) {
      console.error('Failed to load inventory items:', error);
    }
  };

  const loadTripHistory = async () => {
    setHistoryLoading(true);
    try {
      const params: any = {};
      if (historyFilter !== 'all') {
        params.period = historyFilter;
      }
      const response = await api.get('/trips/driver/history', { params });
      setTripHistory(response.data);
    } catch (error: any) {
      toast.error('Failed to load trip history');
      console.error(error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleFuelRequest = async () => {
    if (!fuelForm.amount || !fuelForm.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await api.post('/requests/fuel', {
        amount: parseFloat(fuelForm.amount),
        description: fuelForm.description,
        location: fuelForm.location,
      });
      toast.success('Fuel request submitted successfully');
      setShowFuelModal(false);
      setFuelForm({ amount: '', description: '', location: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit fuel request');
    }
  };

  const handleHelpRequest = async () => {
    if (!helpForm.description) {
      toast.error('Please describe your situation');
      return;
    }

    try {
      await api.post('/requests/help', {
        description: helpForm.description,
        location: helpForm.location,
      });
      toast.success('SOS request submitted. Admin will contact you shortly.');
      setShowHelpModal(false);
      setHelpForm({ description: '', location: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit help request');
    }
  };

  const handleRequisition = async () => {
    if (!requisitionForm.inventoryId || !requisitionForm.quantity || requisitionForm.quantity <= 0) {
      toast.error('Please select an item and enter a valid quantity');
      return;
    }

    try {
      await api.post('/inventory/requests', {
        inventoryId: requisitionForm.inventoryId,
        quantity: requisitionForm.quantity,
        reason: requisitionForm.reason,
      });
      toast.success('Requisition submitted to store keeper');
      setShowRequisitionModal(false);
      setRequisitionForm({ inventoryId: '', quantity: 0, reason: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit requisition');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const currentTrip = trips.find((t) => t.status === 'IN_PROGRESS' || t.status === 'SCHEDULED');
  const upcomingTrips = trips.filter((t) => t.status === 'SCHEDULED' && new Date(t.departureTime) > new Date());

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Tab Navigation */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex overflow-x-auto space-x-1">
            <button
              onClick={() => setActiveTab('current')}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 ${
                activeTab === 'current'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Bus className="h-4 w-4 inline mr-2" />
              Current Trip
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 ${
                activeTab === 'profile'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <UserCircle className="h-4 w-4 inline mr-2" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('requisition')}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 ${
                activeTab === 'requisition'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Package className="h-4 w-4 inline mr-2" />
              Requisition
            </button>
            <button
              onClick={() => setActiveTab('sos')}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 ${
                activeTab === 'sos'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <AlertCircle className="h-4 w-4 inline mr-2" />
              SOS
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 ${
                activeTab === 'history'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <History className="h-4 w-4 inline mr-2" />
              Trip History
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Current Trip Tab */}
        {activeTab === 'current' && (
          <>
            {/* Current/Active Trip Card */}
            {currentTrip && (
              <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white p-6 mb-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4">Current Trip</h2>
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
                  <div className="flex items-center space-x-2 mb-3">
                    <MapPin className="h-5 w-5" />
                    <span className="text-xl font-semibold">
                      {currentTrip.origin?.name} → {currentTrip.destination?.name}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Bus className="h-4 w-4" />
                      <span>Bus: {currentTrip.bus?.plateNumber || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>Departure: {format(new Date(currentTrip.departureTime), 'hh:mm a')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>Passengers: {currentTrip.passengerCount || 0}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(currentTrip.departureTime), 'MMM dd')}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => setShowFuelModal(true)}
                className="bg-yellow-500 text-white p-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-yellow-600 shadow-md"
              >
                <Fuel className="h-6 w-6" />
                <span>Request Fuel</span>
              </button>
              <button
                onClick={() => setShowHelpModal(true)}
                className="bg-red-500 text-white p-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-red-600 shadow-md"
              >
                <AlertCircle className="h-6 w-6" />
                <span>Call for Help</span>
              </button>
            </div>

            {/* Upcoming Trips */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Upcoming Trips</h2>
              {upcomingTrips.length === 0 ? (
                <div className="text-center py-8 text-gray-600">No upcoming trips</div>
              ) : (
                <div className="space-y-4">
                  {upcomingTrips.map((trip) => (
                    <div key={trip.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <MapPin className="h-5 w-5 text-primary-600" />
                        <span className="font-semibold">
                          {trip.origin?.name} → {trip.destination?.name}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Bus className="h-4 w-4" />
                          <span>{trip.bus?.plateNumber || 'Not assigned'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{format(new Date(trip.departureTime), 'MMM dd, hh:mm a')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{trip.passengerCount || 0} passengers</span>
                        </div>
                        <div className="text-primary-600 font-medium">{trip.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Driver Profile Tab */}
        {activeTab === 'profile' && driverProfile && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6">Driver Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Full Name</h3>
                <p className="text-lg font-semibold">{driverProfile.firstName} {driverProfile.lastName}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Phone Number</h3>
                <p className="text-lg">{driverProfile.phoneNumber}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Driver's License</h3>
                <p className="text-lg">{driverProfile.driversLicense}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">License Expiry</h3>
                <p className="text-lg">{format(new Date(driverProfile.licenseExpiryDate), 'MMM dd, yyyy')}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Date of Birth</h3>
                <p className="text-lg">{format(new Date(driverProfile.dateOfBirth), 'MMM dd, yyyy')}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Blood Group</h3>
                <p className="text-lg">{driverProfile.bloodGroup}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Years in Service</h3>
                <p className="text-lg">{driverProfile.yearsInService} years</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Total Trips</h3>
                <p className="text-lg">{driverProfile._count?.trips || 0}</p>
              </div>
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Home Address</h3>
                <p className="text-lg">{driverProfile.homeAddress}</p>
              </div>
              <div className="md:col-span-2 border-t pt-4">
                <h3 className="text-lg font-semibold mb-3">Next of Kin</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Name</h4>
                    <p>{driverProfile.nextOfKinName}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Phone</h4>
                    <p>{driverProfile.nextOfKinPhone}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Relation</h4>
                    <p>{driverProfile.nextOfKinRelation}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Requisition Tab */}
        {activeTab === 'requisition' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Requisition to Store Keeper</h2>
              <button
                onClick={() => setShowRequisitionModal(true)}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center space-x-2"
              >
                <Package className="h-5 w-5" />
                <span>New Requisition</span>
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Request items from the store keeper. Your requests will be reviewed and approved by admin.
            </p>
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>No requisitions yet. Click "New Requisition" to request items.</p>
            </div>
          </div>
        )}

        {/* SOS Tab */}
        {activeTab === 'sos' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Emergency SOS</h2>
              <button
                onClick={() => setShowHelpModal(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
              >
                <AlertCircle className="h-5 w-5" />
                <span>Call for Help</span>
              </button>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-6 w-6 text-red-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-1">Emergency Contact</h3>
                  <p className="text-red-800 text-sm">
                    Your SOS requests are routed directly to admin. In case of immediate emergency, please call:
                  </p>
                  <p className="text-red-900 font-bold mt-2">+234 XXX XXX XXXX</p>
                </div>
              </div>
            </div>
            <p className="text-gray-600">
              Use the "Call for Help" button to send an SOS request. Admin will be notified immediately.
            </p>
          </div>
        )}

        {/* Trip History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Trip History</h2>
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-500" />
                <select
                  value={historyFilter}
                  onChange={(e) => setHistoryFilter(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                >
                  <option value="all">All Time</option>
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="year">Last Year</option>
                </select>
              </div>
            </div>

            {historyLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Loading trip history...</p>
              </div>
            ) : tripHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-600">No trip history found</div>
            ) : (
              <div className="space-y-4">
                {tripHistory.map((trip) => (
                  <div key={trip.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-5 w-5 text-primary-600" />
                        <div>
                          <span className="font-semibold text-lg">
                            {trip.origin?.name} → {trip.destination?.name}
                          </span>
                          <div className="text-sm text-gray-600 mt-1">
                            {trip.origin?.city}, {trip.origin?.state} → {trip.destination?.city}, {trip.destination?.state}
                          </div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        trip.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {trip.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center space-x-1 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(trip.departureTime), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{format(new Date(trip.departureTime), 'hh:mm a')} - {format(new Date(trip.arrivalTime), 'hh:mm a')}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-600">
                        <Bus className="h-4 w-4" />
                        <span>{trip.bus?.plateNumber || 'N/A'}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-600">
                        <User className="h-4 w-4" />
                        <span>{trip._count?.bookings || 0} passengers</span>
                      </div>
                    </div>
                    {trip.route?.distance && (
                      <div className="mt-2 text-sm text-gray-500">
                        Distance: {trip.route.distance} km | Duration: {trip.route.duration} minutes
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fuel Request Modal */}
      {showFuelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold mb-4">Request Fuel Approval</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₦) *</label>
                <input
                  type="number"
                  value={fuelForm.amount}
                  onChange={(e) => setFuelForm({ ...fuelForm, amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={fuelForm.description}
                  onChange={(e) => setFuelForm({ ...fuelForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                  rows={3}
                  placeholder="Reason for fuel request"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location (Optional)</label>
                <input
                  type="text"
                  value={fuelForm.location}
                  onChange={(e) => setFuelForm({ ...fuelForm, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                  placeholder="Current location"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowFuelModal(false);
                    setFuelForm({ amount: '', description: '', location: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFuelRequest}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Request Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold mb-4">SOS - Call for Help</h3>
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-800">
                  <AlertCircle className="h-4 w-4 inline mr-1" />
                  This request will be routed directly to admin for immediate assistance.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Describe Your Situation *</label>
                <textarea
                  value={helpForm.description}
                  onChange={(e) => setHelpForm({ ...helpForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                  rows={4}
                  placeholder="What help do you need?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Location</label>
                <input
                  type="text"
                  value={helpForm.location}
                  onChange={(e) => setHelpForm({ ...helpForm, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                  placeholder="Current location"
                />
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                <Phone className="h-4 w-4 inline mr-1" />
                Emergency? Call: +234 XXX XXX XXXX
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowHelpModal(false);
                    setHelpForm({ description: '', location: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleHelpRequest}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Request Help
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Requisition Modal */}
      {showRequisitionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold mb-4">Request Item from Store Keeper</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Item *</label>
                <select
                  value={requisitionForm.inventoryId}
                  onChange={(e) => setRequisitionForm({ ...requisitionForm, inventoryId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                >
                  <option value="">Select item</option>
                  {inventoryItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.quantity} {item.unit} available)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                <input
                  type="number"
                  min="1"
                  value={requisitionForm.quantity}
                  onChange={(e) => setRequisitionForm({ ...requisitionForm, quantity: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                  placeholder="Enter quantity"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                <textarea
                  value={requisitionForm.reason}
                  onChange={(e) => setRequisitionForm({ ...requisitionForm, reason: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                  rows={3}
                  placeholder="Why do you need this item?"
                />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <p>Your request will be reviewed by admin and then fulfilled by the store keeper.</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowRequisitionModal(false);
                    setRequisitionForm({ inventoryId: '', quantity: 0, reason: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequisition}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
