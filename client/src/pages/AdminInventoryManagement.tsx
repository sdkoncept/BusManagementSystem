import { useEffect, useState } from 'react';
import { Package, Plus, Edit, Trash2, CheckCircle, XCircle, Clock, Filter, Search, TrendingDown, TrendingUp } from 'lucide-react';
import api from '../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function AdminInventoryManagement() {
  const [items, setItems] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [filters, setFilters] = useState({ category: '', lowStock: false });
  const [searchTerm, setSearchTerm] = useState('');

  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    category: '',
    unit: '',
    quantity: 0,
    minQuantity: 0,
    unitPrice: 0,
    location: '',
  });

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

  const handleCreateItem = async () => {
    if (!itemForm.name || !itemForm.category || !itemForm.unit) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (selectedItem) {
        await api.put(`/inventory/${selectedItem.id}`, itemForm);
        toast.success('Inventory item updated');
      } else {
        await api.post('/inventory', itemForm);
        toast.success('Inventory item created');
      }
      setShowItemModal(false);
      setSelectedItem(null);
      setItemForm({
        name: '',
        description: '',
        category: '',
        unit: '',
        quantity: 0,
        minQuantity: 0,
        unitPrice: 0,
        location: '',
      });
      loadItems();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save item');
    }
  };

  const handleUpdateItem = async (item: any) => {
    setSelectedItem(item);
    setItemForm({
      name: item.name,
      description: item.description || '',
      category: item.category,
      unit: item.unit,
      quantity: item.quantity,
      minQuantity: item.minQuantity,
      unitPrice: item.unitPrice,
      location: item.location || '',
    });
    setShowItemModal(true);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await api.delete(`/inventory/${itemId}`);
      toast.success('Item deleted');
      loadItems();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete item');
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      await api.patch(`/inventory/requests/${requestId}/approve`);
      toast.success('Request approved');
      loadRequests();
      loadItems();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve request');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await api.patch(`/inventory/requests/${requestId}/reject`);
      toast.success('Request rejected');
      loadRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject request');
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingRequests = requests.filter((r) => r.status === 'PENDING');
  const approvedRequests = requests.filter((r) => r.status === 'APPROVED');
  const lowStockItems = items.filter((i) => i.quantity <= i.minQuantity);
  const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Management</h1>
            <p className="text-gray-600">Manage inventory items, approve requests, and monitor stock levels</p>
          </div>
          <button
            onClick={() => {
              setSelectedItem(null);
              setItemForm({
                name: '',
                description: '',
                category: '',
                unit: '',
                quantity: 0,
                minQuantity: 0,
                unitPrice: 0,
                location: '',
              });
              setShowItemModal(true);
            }}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add Item</span>
          </button>
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
                <p className="text-2xl font-bold text-red-600">{lowStockItems.length}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
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
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-green-600">₦{totalValue.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
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
                      placeholder="Search items..."
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
                    className={`px-4 py-2 rounded-lg text-sm flex items-center space-x-2 ${
                      filters.lowStock
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    <Filter className="h-4 w-4" />
                    <span>Low Stock</span>
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
                          isLowStock ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold text-lg text-gray-900">{item.name}</h3>
                              {isLowStock && (
                                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded font-semibold">
                                  Low Stock
                                </span>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                            )}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Quantity: </span>
                                <span className={`font-semibold ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
                                  {item.quantity} {item.unit}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Min: </span>
                                <span>{item.minQuantity} {item.unit}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Category: </span>
                                <span>{item.category}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Price: </span>
                                <span>₦{item.unitPrice.toLocaleString()}</span>
                              </div>
                              {item.location && (
                                <div className="col-span-2">
                                  <span className="text-gray-600">Location: </span>
                                  <span>{item.location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => handleUpdateItem(item)}
                              className="text-primary-600 hover:text-primary-700 p-2"
                              title="Edit item"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-red-600 hover:text-red-700 p-2"
                              title="Delete item"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
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
                <h2 className="text-xl font-semibold">Stock Requests</h2>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {requests.length === 0 ? (
                  <div className="text-center py-8 text-gray-600 text-sm">No requests</div>
                ) : (
                  requests.map((request) => (
                    <div
                      key={request.id}
                      className={`border rounded-lg p-3 ${
                        request.status === 'PENDING'
                          ? 'border-yellow-300 bg-yellow-50'
                          : request.status === 'APPROVED'
                          ? 'border-green-300 bg-green-50'
                          : request.status === 'REJECTED'
                          ? 'border-red-300 bg-red-50'
                          : 'border-blue-300 bg-blue-50'
                      }`}
                    >
                      <div className="text-sm mb-2">
                        <div className="font-semibold text-gray-900">
                          {request.inventory?.name}
                        </div>
                        <div className="text-gray-600">
                          Qty: {request.quantity} {request.inventory?.unit}
                        </div>
                        {request.reason && (
                          <div className="text-gray-500 text-xs mt-1 italic">"{request.reason}"</div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          By: {request.requestedBy?.firstName} {request.requestedBy?.lastName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {format(new Date(request.createdAt), 'MMM dd, hh:mm a')}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span
                          className={`text-xs px-2 py-1 rounded font-semibold ${
                            request.status === 'PENDING'
                              ? 'bg-yellow-200 text-yellow-800'
                              : request.status === 'APPROVED'
                              ? 'bg-green-200 text-green-800'
                              : request.status === 'REJECTED'
                              ? 'bg-red-200 text-red-800'
                              : 'bg-blue-200 text-blue-800'
                          }`}
                        >
                          {request.status}
                        </span>
                        {request.status === 'PENDING' && (
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleApproveRequest(request.id)}
                              className="text-green-600 hover:text-green-700 p-1"
                              title="Approve"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleRejectRequest(request.id)}
                              className="text-red-600 hover:text-red-700 p-1"
                              title="Reject"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Add/Edit Item Modal */}
        {showItemModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-semibold mb-4">
                {selectedItem ? 'Edit Item' : 'Add New Item'}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    value={itemForm.name}
                    onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                    placeholder="e.g., Brake Pads"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    value={itemForm.category}
                    onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                  >
                    <option value="">Select category</option>
                    <option value="Spare Parts">Spare Parts</option>
                    <option value="Tools">Tools</option>
                    <option value="Fluids">Fluids</option>
                    <option value="Supplies">Supplies</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unit *</label>
                  <input
                    type="text"
                    value={itemForm.unit}
                    onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })}
                    placeholder="e.g., pieces, liters, kg"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Initial Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={itemForm.quantity}
                    onChange={(e) => setItemForm({ ...itemForm, quantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Quantity (Alert)</label>
                  <input
                    type="number"
                    min="0"
                    value={itemForm.minQuantity}
                    onChange={(e) => setItemForm({ ...itemForm, minQuantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unit Price (₦)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={itemForm.unitPrice}
                    onChange={(e) => setItemForm({ ...itemForm, unitPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={itemForm.description}
                    onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                    rows={2}
                    placeholder="Item description"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={itemForm.location}
                    onChange={(e) => setItemForm({ ...itemForm, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                    placeholder="e.g., Warehouse A, Shelf 3"
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowItemModal(false);
                    setSelectedItem(null);
                    setItemForm({
                      name: '',
                      description: '',
                      category: '',
                      unit: '',
                      quantity: 0,
                      minQuantity: 0,
                      unitPrice: 0,
                      location: '',
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateItem}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  {selectedItem ? 'Update Item' : 'Create Item'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

