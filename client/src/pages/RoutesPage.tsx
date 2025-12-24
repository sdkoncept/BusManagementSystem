import { useEffect, useState } from 'react';
import { MapPin, Plus, Edit, Trash2 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

interface RoutesPageProps {
  admin?: boolean;
}

export default function RoutesPage({ admin }: RoutesPageProps) {
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    try {
      const response = await api.get('/routes', { params: { isActive: 'true' } });
      setRoutes(response.data);
    } catch (error) {
      toast.error('Failed to load routes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Routes</h1>
          <p className="text-gray-600 mt-2">Explore our network of routes</p>
        </div>
        {admin && (
          <button className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Add Route</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">Loading routes...</div>
      ) : routes.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600">No routes available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {routes.map((route) => (
            <div key={route.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{route.name}</h3>
                  <p className="text-sm text-gray-600">Code: {route.code}</p>
                </div>
                {admin && (
                  <div className="flex space-x-2">
                    <button className="text-primary-600 hover:text-primary-700">
                      <Edit className="h-5 w-5" />
                    </button>
                    <button className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
              {route.description && <p className="text-gray-600 mb-4">{route.description}</p>}
              {route.routeStations && route.routeStations.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Stations:</p>
                  <div className="space-y-1">
                    {route.routeStations.map((rs: any, index: number) => (
                      <div key={rs.id} className="flex items-center space-x-2 text-sm">
                        <MapPin className="h-4 w-4 text-primary-600" />
                        <span>
                          {index + 1}. {rs.station.name} - {rs.station.city}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {route.distance && (
                <p className="text-sm text-gray-600 mt-4">
                  Distance: {route.distance} km
                  {route.duration && ` • Duration: ${route.duration} min`}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}






