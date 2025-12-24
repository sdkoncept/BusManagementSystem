import { useEffect, useState } from 'react';
import { User, Plus, Edit, Trash2, X, Calendar, Phone, CreditCard, Droplet, Home, Clock } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function DriversPage() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState<any>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phoneNumber: '',
    driversLicense: '',
    licenseExpiryDate: '',
    bloodGroup: '',
    nextOfKinName: '',
    nextOfKinPhone: '',
    nextOfKinRelation: '',
    homeAddress: '',
    yearsInService: 0,
    isActive: true,
  });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    try {
      const response = await api.get('/drivers');
      setDrivers(response.data);
    } catch (error) {
      toast.error('Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDriver) {
        await api.put(`/drivers/${editingDriver.id}`, formData);
        toast.success('Driver updated successfully');
      } else {
        await api.post('/drivers', formData);
        toast.success('Driver created successfully');
      }
      setShowModal(false);
      setEditingDriver(null);
      resetForm();
      loadDrivers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save driver');
    }
  };

  const handleEdit = (driver: any) => {
    setEditingDriver(driver);
    setFormData({
      firstName: driver.firstName,
      lastName: driver.lastName,
      dateOfBirth: format(new Date(driver.dateOfBirth), 'yyyy-MM-dd'),
      phoneNumber: driver.phoneNumber,
      driversLicense: driver.driversLicense,
      licenseExpiryDate: format(new Date(driver.licenseExpiryDate), 'yyyy-MM-dd'),
      bloodGroup: driver.bloodGroup,
      nextOfKinName: driver.nextOfKinName,
      nextOfKinPhone: driver.nextOfKinPhone,
      nextOfKinRelation: driver.nextOfKinRelation,
      homeAddress: driver.homeAddress,
      yearsInService: driver.yearsInService,
      isActive: driver.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this driver?')) return;
    try {
      await api.delete(`/drivers/${id}`);
      toast.success('Driver deleted successfully');
      loadDrivers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete driver');
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      phoneNumber: '',
      driversLicense: '',
      licenseExpiryDate: '',
      bloodGroup: '',
      nextOfKinName: '',
      nextOfKinPhone: '',
      nextOfKinRelation: '',
      homeAddress: '',
      yearsInService: 0,
      isActive: true,
    });
  };

  const openNewModal = () => {
    setEditingDriver(null);
    resetForm();
    setShowModal(true);
  };

  return (
    <div className="px-4 py-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Driver Management</h1>
          <p className="text-gray-600 mt-2">Manage your driver fleet</p>
        </div>
        <button
          onClick={openNewModal}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Driver</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading drivers...</div>
      ) : drivers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600">No drivers in the system.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drivers.map((driver) => (
            <div key={driver.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {driver.firstName} {driver.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">License: {driver.driversLicense}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(driver)}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(driver.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-900">{driver.phoneNumber}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Droplet className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-900">Blood Group: {driver.bloodGroup}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-900">{driver.yearsInService} years in service</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-gray-600">Status:</span>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      driver.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {driver.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {driver._count && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Trips:</span>
                    <span className="font-medium text-gray-900">{driver._count.trips}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingDriver ? 'Edit Driver' : 'Add New Driver'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingDriver(null);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Driver's License *
                    </label>
                    <input
                      type="text"
                      value={formData.driversLicense}
                      onChange={(e) => setFormData({ ...formData, driversLicense: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      License Expiry Date *
                    </label>
                    <input
                      type="date"
                      value={formData.licenseExpiryDate}
                      onChange={(e) => setFormData({ ...formData, licenseExpiryDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blood Group *
                    </label>
                    <select
                      value={formData.bloodGroup}
                      onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                      required
                    >
                      <option value="">Select Blood Group</option>
                      {bloodGroups.map((bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Years in Service *
                    </label>
                    <input
                      type="number"
                      value={formData.yearsInService}
                      onChange={(e) => setFormData({ ...formData, yearsInService: parseInt(e.target.value) || 0 })}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Home Address *
                  </label>
                  <textarea
                    value={formData.homeAddress}
                    onChange={(e) => setFormData({ ...formData, homeAddress: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                    required
                  />
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Next of Kin Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Next of Kin Name *
                      </label>
                      <input
                        type="text"
                        value={formData.nextOfKinName}
                        onChange={(e) => setFormData({ ...formData, nextOfKinName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Next of Kin Phone *
                      </label>
                      <input
                        type="tel"
                        value={formData.nextOfKinPhone}
                        onChange={(e) => setFormData({ ...formData, nextOfKinPhone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                        required
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Relationship *
                      </label>
                      <input
                        type="text"
                        value={formData.nextOfKinRelation}
                        onChange={(e) => setFormData({ ...formData, nextOfKinRelation: e.target.value })}
                        placeholder="e.g., Spouse, Parent, Sibling"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.isActive ? 'active' : 'inactive'}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingDriver(null);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    {editingDriver ? 'Update Driver' : 'Create Driver'}
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

