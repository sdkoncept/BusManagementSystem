import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Navigation, Clock, Bus } from 'lucide-react';
import api from '../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function TripTracking() {
  const { id } = useParams();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrip();
    const interval = setInterval(loadTrip, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [id]);

  const loadTrip = async () => {
    try {
      const response = await api.get(`/trips/${id}`);
      setTrip(response.data);
    } catch (error) {
      toast.error('Failed to load trip details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading trip details...</div>;
  }

  if (!trip) {
    return <div className="text-center py-12">Trip not found</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      case 'DELAYED':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="px-4 py-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Trip Tracking</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Trip Information</h2>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(trip.status)}`}>
            {trip.status}
          </span>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <MapPin className="h-5 w-5 text-primary-600" />
            <div>
              <p className="font-medium">{trip.origin.name}</p>
              <p className="text-sm text-gray-600">{trip.origin.address}, {trip.origin.city}</p>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="h-12 w-0.5 bg-gray-300"></div>
          </div>

          <div className="flex items-center space-x-3">
            <Navigation className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium">{trip.destination.name}</p>
              <p className="text-sm text-gray-600">{trip.destination.address}, {trip.destination.city}</p>
            </div>
          </div>

          {trip.currentLocation && (
            <div className="mt-4 p-4 bg-primary-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Current Location</p>
              <p className="font-medium">{trip.currentLocation}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-gray-600">Departure</p>
              <p className="font-medium">
                <Clock className="h-4 w-4 inline mr-1" />
                {format(new Date(trip.departureTime), 'MMM dd, yyyy hh:mm a')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Expected Arrival</p>
              <p className="font-medium">
                <Clock className="h-4 w-4 inline mr-1" />
                {format(new Date(trip.arrivalTime), 'MMM dd, yyyy hh:mm a')}
              </p>
            </div>
          </div>

          {trip.delayMinutes && trip.delayMinutes > 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">
                <strong>Delay:</strong> {trip.delayMinutes} minutes
              </p>
            </div>
          )}

          <div className="pt-4 border-t">
            <div className="flex items-center space-x-2">
              <Bus className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Bus</p>
                <p className="font-medium">{trip.bus.plateNumber} - {trip.bus.model}</p>
              </div>
            </div>
            {trip.driver && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">Driver</p>
                <p className="font-medium">
                  {trip.driver.firstName} {trip.driver.lastName}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> This page automatically refreshes every 30 seconds to show the latest trip status.
        </p>
      </div>
    </div>
  );
}






