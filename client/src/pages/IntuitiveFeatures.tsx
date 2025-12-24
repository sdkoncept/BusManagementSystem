import { Bell, Calendar, Headphones, MapPin } from 'lucide-react';

export default function IntuitiveFeatures() {
  const features = [
    {
      icon: Bell,
      title: 'Notifications and Alerts',
      description: 'Get complete details of bus routes, timings, seat booking and others with push notifications & alerts.',
    },
    {
      icon: Calendar,
      title: 'Scheduled Booking',
      description: 'For regular routes and journeys, let the app do the booking automatically.',
    },
    {
      icon: Headphones,
      title: 'Help and Support',
      description: 'The app always connects your user with you throughout the ride - hear them, support them!',
    },
    {
      icon: MapPin,
      title: 'Digital Mapping',
      description: 'Map and track the current route of your bus - anytime and from anywhere!',
    },
  ];

  return (
    <div className="bg-yellow-50 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Intuitive Features like Trip Booking, Trip Tracking and Chat Support
          </h2>
          <p className="text-lg text-gray-700">
            The mandate features you need to integrate into any modern on-demand bus booking app development process.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow"
              >
                <div className="mb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-lg">
                    <Icon className="h-8 w-8 text-gray-700" />
                    {feature.icon === Bell && (
                      <div className="absolute -mt-2 -mr-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        1
                      </div>
                    )}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

