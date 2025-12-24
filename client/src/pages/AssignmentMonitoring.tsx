import { useState, useEffect } from 'react';
import { Calendar, Bus, User, MapPin, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function AssignmentMonitoring() {
  const [monitoringData, setMonitoringData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    loadMonitoringData();
  }, [selectedDate, filterStatus]);

  const loadMonitoringData = async () => {
    try {
      const params: any = { date: selectedDate };
      if (filterStatus) {
        params.status = filterStatus;
      }
      const response = await api.get('/trips/monitoring/assignments', { params });
      setMonitoringData(response.data);
    } catch (error) {
      toast.error('Failed to load monitoring data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      SCHEDULED: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      IN_PROGRESS: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      COMPLETED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      CANCELLED: { color: 'bg-red-100 text-red-800', icon: XCircle },
      DELAYED: { color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
    };

    const config = statusConfig[status] || statusConfig.SCHEDULED;
    const Icon = config.icon;

    return (
      <span className={`px-2 py-1 rounded text-xs flex items-center space-x-1 ${config.color}`}>
        <Icon className="h-3 w-3" />
        <span>{status}</span>
      </span>
    );
  };

  if (loading) {
    return <div className="text-center py-12">Loading monitoring data...</div>;
  }

  if (!monitoringData) {
    return <div className="text-center py-12">No data available</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Assignment Monitoring Dashboard</h1>
          <p className="text-gray-600">Track and monitor bus-driver-trip assignments</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-2" />
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
              >
                <option value="">All Statuses</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="DELAYED">Delayed</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={loadMonitoringData}
                className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
              >
                Refresh Data
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Trips</p>
                <p className="text-2xl font-bold text-gray-900">{monitoringData.trips?.length || 0}</p>
              </div>
              <MapPin className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unassigned Buses</p>
                <p className="text-2xl font-bold text-red-600">{monitoringData.unassignedBuses?.length || 0}</p>
              </div>
              <Bus className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unassigned Drivers</p>
                <p className="text-2xl font-bold text-red-600">{monitoringData.unassignedDrivers?.length || 0}</p>
              </div>
              <User className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Assignments</p>
                <p className="text-2xl font-bold text-green-600">
                  {monitoringData.trips?.filter((t: any) => t.bus && t.driver).length || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Trips Table */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Trip Assignments</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trip Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bus
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Riders
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {monitoringData.trips?.map((trip: any) => (
                  <tr key={trip.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {trip.origin?.name} → {trip.destination?.name}
                      </div>
                      <div className="text-sm text-gray-500">{trip.route?.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {trip.bus ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">{trip.bus.plateNumber}</div>
                          <div className="text-sm text-gray-500">{trip.bus.model}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-red-600 flex items-center">
                          <XCircle className="h-4 w-4 mr-1" />
                          Not Assigned
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {trip.driver ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {trip.driver.firstName} {trip.driver.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{trip.driver.driversLicense}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-red-600 flex items-center">
                          <XCircle className="h-4 w-4 mr-1" />
                          Not Assigned
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {format(new Date(trip.departureTime), 'MMM dd, hh:mm a')}
                      </div>
                      <div className="text-sm text-gray-500">
                        Arr: {format(new Date(trip.arrivalTime), 'hh:mm a')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(trip.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {trip._count?.bookings || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bus Assignments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Bus Assignments</h2>
            <div className="space-y-4">
              {monitoringData.busAssignments?.map((assignment: any) => (
                <div
                  key={assignment.bus.id}
                  className={`p-4 rounded-lg border-2 ${
                    assignment.assignedTrips.length > 0
                      ? 'border-green-200 bg-green-50'
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Bus className="h-5 w-5 text-primary-600" />
                      <span className="font-semibold text-gray-900">{assignment.bus.plateNumber}</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {assignment.assignedTrips.length} trip(s)
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">{assignment.bus.model}</div>
                  {assignment.assignedTrips.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {assignment.assignedTrips.map((trip: any) => (
                        <div key={trip.id} className="text-xs text-gray-600">
                          • {format(new Date(trip.departureTime), 'MMM dd, hh:mm')} - {trip.origin?.name} →{' '}
                          {trip.destination?.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Driver Assignments */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Driver Assignments</h2>
            <div className="space-y-4">
              {monitoringData.driverAssignments?.map((assignment: any) => (
                <div
                  key={assignment.driver.id}
                  className={`p-4 rounded-lg border-2 ${
                    assignment.assignedTrips.length > 0
                      ? 'border-green-200 bg-green-50'
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-5 w-5 text-primary-600" />
                      <span className="font-semibold text-gray-900">
                        {assignment.driver.firstName} {assignment.driver.lastName}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {assignment.assignedTrips.length} trip(s)
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">License: {assignment.driver.driversLicense}</div>
                  {assignment.assignedTrips.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {assignment.assignedTrips.map((trip: any) => (
                        <div key={trip.id} className="text-xs text-gray-600">
                          • {format(new Date(trip.departureTime), 'MMM dd, hh:mm')} - {trip.origin?.name} →{' '}
                          {trip.destination?.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

