import { useEffect, useState, useRef } from 'react';
import { MapPin, Search, Filter, X } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../services/api';
import toast from 'react-hot-toast';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Nigerian states list
const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
  'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
  'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

// Component to handle map zoom changes
function MapZoomHandler({ onZoomChange }: { onZoomChange: (zoom: number) => void }) {
  const map = useMap();
  
  useEffect(() => {
    const handleZoom = () => {
      onZoomChange(map.getZoom());
    };
    
    map.on('zoomend', handleZoom);
    return () => {
      map.off('zoomend', handleZoom);
    };
  }, [map, onZoomChange]);
  
  return null;
}

interface StationsPageProps {
  admin?: boolean;
}

export default function StationsPage({ admin }: StationsPageProps) {
  const [stations, setStations] = useState<any[]>([]);
  const [filteredStations, setFilteredStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState<string>('');
  const [addressFilter, setAddressFilter] = useState('');
  const [mapZoom, setMapZoom] = useState(6); // Default zoom for Nigeria
  const [mapCenter, setMapCenter] = useState<[number, number]>([9.0820, 8.6753]); // Center of Nigeria

  useEffect(() => {
    loadStations();
  }, []);

  useEffect(() => {
    filterStations();
  }, [stations, selectedState, addressFilter]);

  const loadStations = async () => {
    try {
      const response = await api.get('/stations');
      const stationsData = response.data;
      setStations(stationsData);
      
      // Set map center based on stations if available
      if (stationsData.length > 0) {
        const stationsWithCoords = stationsData.filter(
          (s: any) => s.latitude && s.longitude
        );
        if (stationsWithCoords.length > 0) {
          const avgLat = stationsWithCoords.reduce((sum: number, s: any) => sum + s.latitude, 0) / stationsWithCoords.length;
          const avgLng = stationsWithCoords.reduce((sum: number, s: any) => sum + s.longitude, 0) / stationsWithCoords.length;
          setMapCenter([avgLat, avgLng]);
        }
      }
    } catch (error) {
      toast.error('Failed to load stations');
    } finally {
      setLoading(false);
    }
  };

  const filterStations = () => {
    let filtered = [...stations];

    // Filter by state
    if (selectedState) {
      filtered = filtered.filter(
        (station) => station.state?.toLowerCase() === selectedState.toLowerCase()
      );
    }

    // Filter by address
    if (addressFilter) {
      const searchTerm = addressFilter.toLowerCase();
      filtered = filtered.filter(
        (station) =>
          station.address?.toLowerCase().includes(searchTerm) ||
          station.name?.toLowerCase().includes(searchTerm) ||
          station.city?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredStations(filtered);
  };

  const handleZoomChange = (zoom: number) => {
    setMapZoom(zoom);
  };

  // Determine if we should show globe/world view (zoom < 4)
  const showGlobeView = mapZoom < 4;

  // Create custom icon for markers
  const createCustomIcon = (color: string = '#3B82F6') => {
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">
        <div style="
          transform: rotate(45deg);
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <span style="color: white; font-size: 12px;">📍</span>
        </div>
      </div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 24],
      popupAnchor: [0, -24],
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading stations...</p>
        </div>
      </div>
    );
  }

  const stationsWithCoords = filteredStations.filter(
    (s) => s.latitude && s.longitude
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Station Locations</h1>
          <p className="text-gray-600">View all bus stations on the map of Nigeria</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* State Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by State
              </label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                >
                  <option value="">All States</option>
                  {NIGERIAN_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Address/Name Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search by Address or Name
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search stations..."
                  value={addressFilter}
                  onChange={(e) => setAddressFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                />
                {addressFilter && (
                  <button
                    onClick={() => setAddressFilter('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Results Count */}
            <div className="flex items-end">
              <div className="bg-primary-50 rounded-lg p-3 w-full">
                <p className="text-sm text-gray-600">Showing</p>
                <p className="text-2xl font-bold text-primary-600">
                  {filteredStations.length} {filteredStations.length === 1 ? 'Station' : 'Stations'}
                </p>
                {selectedState && (
                  <button
                    onClick={() => setSelectedState('')}
                    className="text-xs text-primary-600 hover:text-primary-700 mt-1"
                  >
                    Clear state filter
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="relative" style={{ height: '600px' }}>
            {showGlobeView ? (
              // World/Globe view when zoomed out
              <MapContainer
                center={[20, 0]}
                zoom={2}
                style={{ height: '100%', width: '100%' }}
                zoomControl={true}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapZoomHandler onZoomChange={handleZoomChange} />
                {stationsWithCoords.map((station) => (
                  <Marker
                    key={station.id}
                    position={[station.latitude, station.longitude]}
                    icon={createCustomIcon('#3B82F6')}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-semibold text-gray-900">{station.name}</h3>
                        <p className="text-sm text-gray-600">{station.address}</p>
                        <p className="text-xs text-gray-500">
                          {station.city}, {station.state}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            ) : (
              // Nigeria-focused view
              <MapContainer
                center={mapCenter}
                zoom={mapZoom}
                style={{ height: '100%', width: '100%' }}
                zoomControl={true}
                scrollWheelZoom={true}
                minZoom={2}
                maxZoom={18}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapZoomHandler onZoomChange={handleZoomChange} />
                {stationsWithCoords.map((station) => (
                  <Marker
                    key={station.id}
                    position={[station.latitude, station.longitude]}
                    icon={createCustomIcon('#3B82F6')}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-semibold text-gray-900 mb-1">{station.name}</h3>
                        <p className="text-sm text-gray-600 mb-1">{station.address}</p>
                        <p className="text-xs text-gray-500 mb-2">
                          {station.city}, {station.state}
                        </p>
                        {station.code && (
                          <p className="text-xs text-gray-400">Code: {station.code}</p>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}
          </div>
        </div>

        {/* Station List */}
        {filteredStations.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Station Details ({filteredStations.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStations.map((station) => (
                <div
                  key={station.id}
                  className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-primary-600 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{station.name}</h3>
                      <p className="text-sm text-gray-600 mb-1">{station.address}</p>
                      <p className="text-xs text-gray-500">
                        {station.city}, {station.state}
                      </p>
                      {station.latitude && station.longitude && (
                        <p className="text-xs text-gray-400 mt-1">
                          📍 {station.latitude.toFixed(4)}, {station.longitude.toFixed(4)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredStations.length === 0 && !loading && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No stations found matching your filters.</p>
            {(selectedState || addressFilter) && (
              <button
                onClick={() => {
                  setSelectedState('');
                  setAddressFilter('');
                }}
                className="mt-4 text-primary-600 hover:text-primary-700 text-sm"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      <style>{`
        .custom-marker {
          background: transparent;
          border: none;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}
