import { useEffect, useState } from 'react';
import { Package, CheckCircle, XCircle, Clock, Search } from 'lucide-react';
import api from '../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

export default function InventoryManagement() {
  const { user } = useAuthStore();
  const isStoreKeeper = user?.role === 'STORE_KEEPER';
  // This page is only for store keepers - admins use AdminInventoryManagement

  const [items, setItems] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', lowStock: false });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadItems();
    loadRequests();
  }, [filters]);

  const loadItems = async () => {
    try {
      const params: any = {};
      if (filters.category) params.category = filters.category;
      if (filters.lowStock) params.lowStock = 'true';

      const response = await api.get('/inventory', { params });
      setItems(response.data);
    } catch (error) {
      toast.error('Failed to load inventory items');
    } finally {
      setLoading(false);
    }
  };

  const loadRequests = async () => {
    try {
      const response = await api.get('/inventory/requests/all');
      setRequests(response.data);
    } catch (error) {
      toast.error('Failed to load requests');
    }
  };


  const handleFulfillRequest = async (requestId: string) => {
    try {
      await api.patch(`/inventory/requests/${requestId}/fulfill`);
      toast.success('Request fulfilled and stock updated');
      loadRequests();
      loadItems();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fulfill request');
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingRequests = requests.filter((r) => r.status === 'PENDING');
  const approvedRequests = requests.filter((r) => r.status === 'APPROVED');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Management</h1>
            <p className="text-gray-600">
              View stock items and fulfill approved requests
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{items.length}</p>
              </div>
              <Package className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-red-600">
                  {items.filter((i) => i.quantity <= i.minQuantity).length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingRequests.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved (Ready)</p>
                <p className="text-2xl font-bold text-green-600">{approvedRequests.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inventory Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Inventory Items</h2>
                <div className="flex space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search items (e.g., brake pads, spark plugs, tires, oil, air filters)..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white"
                    />
                  </div>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white"
                  >
                    <option value="">All Categories</option>
                    <option value="Spare Parts">Spare Parts</option>
                    <option value="Tools">Tools</option>
                    <option value="Fluids">Fluids</option>
                    <option value="Supplies">Supplies</option>
                  </select>
                  <button
                    onClick={() => setFilters({ ...filters, lowStock: !filters.lowStock })}
                    className={`px-4 py-2 rounded-lg text-sm ${
                      filters.lowStock
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Low Stock
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12">Loading...</div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-12 text-gray-600">No items found</div>
              ) : (
                <div className="space-y-4">
                  {filteredItems.map((item) => {
                    const isLowStock = item.quantity <= item.minQuantity;
                    return (
                      <div
                        key={item.id}
                        className={`border rounded-lg p-4 ${
                          isLowStock ? 'border-red-300 bg-red-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold text-gray-900">{item.name}</h3>
                              {isLowStock && (
                                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                                  Low Stock
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Quantity: </span>
                                <span className="font-semibold">{item.quantity} {item.unit}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Min: </span>
                                <span>{item.minQuantity} {item.unit}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Category: </span>
                                <span>{item.category}</span>
                              </div>
                              {item.location && (
                                <div>
                                  <span className="text-gray-600">Location: </span>
                                  <span>{item.location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Requests Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Requests</h2>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {requests.length === 0 ? (
                  <div className="text-center py-8 text-gray-600 text-sm">No requests</div>
                ) : (
                  requests.map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="text-sm mb-2">
                        <div className="font-semibold text-gray-900">{request.inventory?.name}</div>
                        <div className="text-gray-600">Qty: {request.quantity} {request.inventory?.unit}</div>
                        {request.reason && (
                          <div className="text-gray-500 text-xs mt-1">{request.reason}</div>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            request.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-700'
                              : request.status === 'APPROVED'
                              ? 'bg-green-100 text-green-700'
                              : request.status === 'REJECTED'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {request.status}
                        </span>
                        {isStoreKeeper && request.status === 'APPROVED' && (
                          <button
                            onClick={() => handleFulfillRequest(request.id)}
                            className="text-xs bg-primary-600 text-white px-2 py-1 rounded hover:bg-primary-700"
                          >
                            Fulfill
                          </button>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {format(new Date(request.createdAt), 'MMM dd, hh:mm a')}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

