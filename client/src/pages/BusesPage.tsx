import { useEffect, useState } from 'react';
import { Bus, Plus, Edit, Trash2, X } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function BusesPage() {
  const [buses, setBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBus, setEditingBus] = useState<any>(null);
  const [formData, setFormData] = useState({
    plateNumber: '',
    vehicleType: 'Bus',
    model: '',
    manufacturer: '',
    year: new Date().getFullYear(),
    capacity: 50,
    seatLayout: '{"rows": 13, "cols": 4}',
    amenities: '',
    isActive: true,
  });

  useEffect(() => {
    loadBuses();
  }, []);

  const loadBuses = async () => {
    try {
      const response = await api.get('/buses');
      setBuses(response.data);
    } catch (error) {
      toast.error('Failed to load buses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBus) {
        await api.put(`/buses/${editingBus.id}`, {
          ...formData,
          seatLayout: JSON.parse(formData.seatLayout),
          amenities: formData.amenities ? JSON.parse(formData.amenities) : null,
        });
        toast.success('Bus updated successfully');
      } else {
        await api.post('/buses', {
          ...formData,
          seatLayout: JSON.parse(formData.seatLayout),
          amenities: formData.amenities ? JSON.parse(formData.amenities) : null,
        });
        toast.success('Bus created successfully');
      }
      setShowModal(false);
      setEditingBus(null);
      setFormData({
        plateNumber: '',
        vehicleType: 'Bus',
        model: '',
        manufacturer: '',
        year: new Date().getFullYear(),
        capacity: 50,
        seatLayout: '{"rows": 13, "cols": 4}',
        amenities: '',
        isActive: true,
      });
      loadBuses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save bus');
    }
  };

  const handleEdit = (bus: any) => {
    setEditingBus(bus);
    setFormData({
      plateNumber: bus.plateNumber,
      vehicleType: bus.vehicleType || 'Bus',
      model: bus.model,
      manufacturer: bus.manufacturer,
      year: bus.year,
      capacity: bus.capacity,
      seatLayout: typeof bus.seatLayout === 'string' ? bus.seatLayout : JSON.stringify(bus.seatLayout || { rows: 13, cols: 4 }),
      amenities: bus.amenities ? (typeof bus.amenities === 'string' ? bus.amenities : JSON.stringify(bus.amenities)) : '',
      isActive: bus.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bus?')) return;
    try {
      await api.delete(`/buses/${id}`);
      toast.success('Bus deleted successfully');
      loadBuses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete bus');
    }
  };

  const openNewModal = () => {
    setEditingBus(null);
    setFormData({
      plateNumber: '',
      model: '',
      manufacturer: '',
      year: new Date().getFullYear(),
      capacity: 50,
      seatLayout: '{"rows": 13, "cols": 4}',
      amenities: '',
      isActive: true,
    });
    setShowModal(true);
  };

  return (
    <div className="px-4 py-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bus Fleet</h1>
          <p className="text-gray-600 mt-2">Manage your bus fleet</p>
        </div>
        <button
          onClick={openNewModal}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Bus</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading buses...</div>
      ) : buses.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600">No buses in the fleet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {buses.map((bus) => (
            <div key={bus.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start space-x-3">
                  <Bus className="h-6 w-6 text-primary-600 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{bus.plateNumber}</h3>
                    <p className="text-sm text-gray-600">
                      {bus.vehicleType || 'Bus'} • {bus.manufacturer} {bus.model} ({bus.year})
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(bus)}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(bus.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Capacity:</span>
                  <span className="font-medium text-gray-900">{bus.capacity} seats</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      bus.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {bus.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {bus._count && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Trips:</span>
                    <span className="font-medium text-gray-900">{bus._count.trips}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingBus ? 'Edit Bus' : 'Add New Bus'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      License Plate Number *
                    </label>
                    <input
                      type="text"
                      value={formData.plateNumber}
                      onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value.toUpperCase() })}
                      placeholder="e.g., ABC123XY"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vehicle Type *
                    </label>
                    <select
                      value={formData.vehicleType}
                      onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                      required
                    >
                      <option value="Bus">Bus</option>
                      <option value="Sienna">Sienna</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Manufacturer *
                    </label>
                    <input
                      type="text"
                      value={formData.manufacturer}
                      onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Model *
                    </label>
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year *
                    </label>
                    <input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                      min="2000"
                      max={new Date().getFullYear() + 1}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Capacity *
                    </label>
                    <input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                      min="1"
                      max="100"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                      required
                    />
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seat Layout (JSON)
                  </label>
                  <input
                    type="text"
                    value={formData.seatLayout}
                    onChange={(e) => setFormData({ ...formData, seatLayout: e.target.value })}
                    placeholder='{"rows": 13, "cols": 4}'
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amenities (JSON, optional)
                  </label>
                  <input
                    type="text"
                    value={formData.amenities}
                    onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                    placeholder='["WiFi", "AC", "USB Charging"]'
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white font-mono text-sm"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    {editingBus ? 'Update Bus' : 'Create Bus'}
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
