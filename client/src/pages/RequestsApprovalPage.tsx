import { useEffect, useState } from 'react';
import { AlertCircle, Fuel, Phone, Package, CheckCircle, XCircle, Clock, MapPin, User } from 'lucide-react';
import api from '../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

type RequestTab = 'all' | 'fuel' | 'help' | 'inventory';

export default function RequestsApprovalPage() {
  const [activeTab, setActiveTab] = useState<RequestTab>('all');
  const [requests, setRequests] = useState<any[]>([]);
  const [stockRequests, setStockRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    loadRequests();
    loadStockRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const response = await api.get('/requests');
      setRequests(response.data || []);
    } catch (error) {
      console.error('Failed to load requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStockRequests = async () => {
    try {
      const response = await api.get('/inventory/requests/all');
      setStockRequests(response.data || []);
    } catch (error) {
      console.error('Failed to load stock requests:', error);
      setStockRequests([]);
    }
  };

  const handleApproveRequest = async (requestId: string, type: 'fuel' | 'help' | 'inventory') => {
    try {
      if (type === 'inventory') {
        await api.patch(`/inventory/requests/${requestId}/approve`);
        toast.success('Stock request approved');
      } else {
        await api.patch(`/requests/${requestId}/respond`, { 
          status: 'APPROVED', 
          response: responseText || 'Request approved' 
        });
        toast.success('Request approved');
      }
      loadRequests();
      loadStockRequests();
      setSelectedRequest(null);
      setResponseText('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve request');
    }
  };

  const handleRejectRequest = async (requestId: string, type: 'fuel' | 'help' | 'inventory') => {
    if (!responseText.trim() && type !== 'inventory') {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      if (type === 'inventory') {
        await api.patch(`/inventory/requests/${requestId}/reject`, { notes: responseText || 'Request rejected' });
        toast.success('Stock request rejected');
      } else {
        await api.patch(`/requests/${requestId}/respond`, { 
          status: 'REJECTED', 
          response: responseText 
        });
        toast.success('Request rejected');
      }
      loadRequests();
      loadStockRequests();
      setSelectedRequest(null);
      setResponseText('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject request');
    }
  };

  const filteredRequests = activeTab === 'all' 
    ? requests 
    : requests.filter((r) => r.type === activeTab.toUpperCase());

  const pendingStockRequests = stockRequests.filter((r) => r.status === 'PENDING');
  const pendingRequests = filteredRequests.filter((r) => r.status === 'PENDING');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Requests Approval</h1>
          <p className="text-gray-600">Review and approve/reject driver requests and stock requisitions</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold text-gray-900">{pendingRequests.length + pendingStockRequests.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Fuel Requests</p>
                <p className="text-2xl font-bold text-gray-900">
                  {requests.filter((r) => r.type === 'FUEL' && r.status === 'PENDING').length}
                </p>
              </div>
              <Fuel className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Help Requests</p>
                <p className="text-2xl font-bold text-gray-900">
                  {requests.filter((r) => r.type === 'HELP' && r.status === 'PENDING').length}
                </p>
              </div>
              <Phone className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Stock Requests</p>
                <p className="text-2xl font-bold text-gray-900">{pendingStockRequests.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'all'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              All Requests ({pendingRequests.length + pendingStockRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('fuel')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'fuel'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Fuel ({requests.filter((r) => r.type === 'FUEL' && r.status === 'PENDING').length})
            </button>
            <button
              onClick={() => setActiveTab('help')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'help'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Help ({requests.filter((r) => r.type === 'HELP' && r.status === 'PENDING').length})
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'inventory'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Stock ({pendingStockRequests.length})
            </button>
          </div>
        </div>

        {/* Requests List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {loading ? (
              <div className="text-center py-12">Loading requests...</div>
            ) : (
              <div className="space-y-4">
                {/* Driver Requests (Fuel/Help) */}
                {(activeTab === 'all' || activeTab === 'fuel' || activeTab === 'help') && (
                  <>
                    {pendingRequests.length === 0 ? (
                      <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
                        No pending {activeTab === 'all' ? '' : activeTab} requests
                      </div>
                    ) : (
                      pendingRequests.map((request) => (
                        <div
                          key={request.id}
                          className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              {request.type === 'FUEL' ? (
                                <Fuel className="h-6 w-6 text-orange-600" />
                              ) : (
                                <Phone className="h-6 w-6 text-red-600" />
                              )}
                              <div>
                                <h3 className="font-semibold text-lg">
                                  {request.type === 'FUEL' ? 'Fuel Request' : 'Help Request'}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {request.user?.firstName} {request.user?.lastName}
                                </p>
                              </div>
                            </div>
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                              PENDING
                            </span>
                          </div>

                          <div className="space-y-2 mb-4">
                            <p className="text-gray-700">{request.description}</p>
                            {request.location && (
                              <div className="flex items-center space-x-1 text-sm text-gray-600">
                                <MapPin className="h-4 w-4" />
                                <span>{request.location}</span>
                              </div>
                            )}
                            {request.fuelAmount && (
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">Amount:</span> ₦{request.fuelAmount.toLocaleString()}
                              </div>
                            )}
                            <div className="text-xs text-gray-500">
                              <Clock className="h-3 w-3 inline mr-1" />
                              {format(new Date(request.createdAt), 'MMM dd, yyyy hh:mm a')}
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedRequest({ ...request, requestType: request.type.toLowerCase() });
                                setResponseText('');
                              }}
                              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2"
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRequest({ ...request, requestType: request.type.toLowerCase() });
                                setResponseText('');
                              }}
                              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center justify-center space-x-2"
                            >
                              <XCircle className="h-4 w-4" />
                              <span>Reject</span>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </>
                )}

                {/* Stock Requests */}
                {(activeTab === 'all' || activeTab === 'inventory') && (
                  <>
                    {pendingStockRequests.length === 0 ? (
                      activeTab === 'inventory' && (
                        <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
                          No pending stock requests
                        </div>
                      )
                    ) : (
                      pendingStockRequests.map((request) => (
                        <div
                          key={request.id}
                          className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <Package className="h-6 w-6 text-blue-600" />
                              <div>
                                <h3 className="font-semibold text-lg">Stock Request</h3>
                                <p className="text-sm text-gray-600">
                                  {request.requestedBy?.firstName} {request.requestedBy?.lastName}
                                </p>
                              </div>
                            </div>
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                              PENDING
                            </span>
                          </div>

                          <div className="space-y-2 mb-4">
                            <p className="font-medium text-gray-900">
                              {request.inventory?.name || request.inventoryItem?.name}
                            </p>
                            <p className="text-gray-700">
                              Quantity: {request.quantity} {request.inventory?.unit || request.inventoryItem?.unit}
                            </p>
                            {request.reason && (
                              <p className="text-sm text-gray-600 italic">"{request.reason}"</p>
                            )}
                            <div className="text-xs text-gray-500">
                              <Clock className="h-3 w-3 inline mr-1" />
                              {format(new Date(request.createdAt), 'MMM dd, yyyy hh:mm a')}
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleApproveRequest(request.id, 'inventory')}
                              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2"
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRequest({ ...request, requestType: 'inventory' });
                                setResponseText('');
                              }}
                              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center justify-center space-x-2"
                            >
                              <XCircle className="h-4 w-4" />
                              <span>Reject</span>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Response Panel */}
          {selectedRequest && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">
                    {selectedRequest.requestType === 'inventory' ? 'Reject Stock Request' : 'Respond to Request'}
                  </h3>
                  <button
                    onClick={() => {
                      setSelectedRequest(null);
                      setResponseText('');
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {selectedRequest.requestType === 'inventory' ? 'Rejection Reason' : 'Response Message'}
                    </label>
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                      rows={4}
                      placeholder={
                        selectedRequest.requestType === 'inventory'
                          ? 'Why are you rejecting this request?'
                          : 'Enter your response...'
                      }
                    />
                  </div>

                  <div className="flex space-x-2">
                    {selectedRequest.requestType === 'inventory' ? (
                      <button
                        onClick={() => handleRejectRequest(selectedRequest.id, 'inventory')}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                      >
                        Reject Request
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleApproveRequest(selectedRequest.id, selectedRequest.type?.toLowerCase() as any)}
                          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectRequest(selectedRequest.id, selectedRequest.type?.toLowerCase() as any)}
                          className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

