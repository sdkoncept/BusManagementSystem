import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Menu, X, Bus, LogOut, User } from 'lucide-react';
import { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isAdmin = user?.role === 'ADMIN';
  const isStaff = user?.role === 'STAFF';
  const isDriver = user?.role === 'DRIVER';
  const isStoreKeeper = user?.role === 'STORE_KEEPER';

  // Store keepers only see inventory-related navigation
  // Drivers only see driver app
  const navLinks = isStoreKeeper
    ? [
        { path: '/inventory', label: 'Inventory Management' },
      ]
    : isDriver
    ? [
        { path: '/driver', label: 'Driver App' },
      ]
    : [
        { path: '/', label: 'Home' },
        { path: '/routes', label: 'Routes' },
        { path: '/stations', label: 'Stations' },
        { path: '/trips', label: 'Search Trips' },
        ...(user && user.role === 'RIDER' ? [{ path: '/dashboard', label: 'Dashboard' }] : []),
        ...(user && user.role === 'RIDER' ? [{ path: '/bookings', label: 'My Bookings' }] : []),
        ...(isStaff
          ? [
              { path: '/front-office', label: 'Front Office' },
            ]
          : []),
        ...(isAdmin
          ? [
              { path: '/admin/dashboard', label: 'Dashboard' },
              { path: '/admin/trips', label: 'Manage Trips' },
              { path: '/admin/bookings', label: 'All Bookings' },
              { path: '/admin/buses', label: 'Buses' },
              { path: '/admin/drivers', label: 'Drivers' },
              { path: '/admin/inventory', label: 'Inventory' },
              { path: '/admin/requests', label: 'Requests' },
              { path: '/admin/monitoring', label: 'Monitoring' },
              { path: '/admin/settings', label: 'Settings' },
            ]
          : []),
      ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to={isStoreKeeper ? "/inventory" : isDriver ? "/driver" : "/"} className="flex items-center space-x-2">
                <Bus className="h-8 w-8 text-primary-600" />
                <span className="text-xl font-bold text-gray-900">Eagle Line</span>
                {isStoreKeeper && (
                  <span className="text-sm text-gray-500 ml-2">- Inventory</span>
                )}
                {isDriver && (
                  <span className="text-sm text-gray-500 ml-2">- Driver App</span>
                )}
              </Link>
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      location.pathname === link.path
                        ? 'border-primary-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <div className="hidden md:flex items-center space-x-2 text-sm text-gray-700">
                    <User className="h-4 w-4" />
                    <span>{user.firstName} {user.lastName}</span>
                    <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded">
                      {user.role}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-gray-500 hover:text-gray-700"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="hidden md:inline">Logout</span>
                  </button>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700"
                  >
                    Register
                  </Link>
                </div>
              )}
              <button
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === link.path
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}






