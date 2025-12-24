import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import RoutesPage from './pages/RoutesPage';
import StationsPage from './pages/StationsPage';
import TripsPage from './pages/TripsPage';
import BookingsPage from './pages/BookingsPage';
import BookingForm from './pages/BookingForm';
import BusesPage from './pages/BusesPage';
import DriversPage from './pages/DriversPage';
import TripTracking from './pages/TripTracking';
import EnhancedBookingForm from './pages/EnhancedBookingForm';
import IntuitiveFeatures from './pages/IntuitiveFeatures';
import AdminTripManagement from './pages/AdminTripManagement';
import AdminRouteManagement from './pages/AdminRouteManagement';
import AdminStationManagement from './pages/AdminStationManagement';
import OnlineReservation from './pages/OnlineReservation';
import EnhancedSettings from './pages/EnhancedSettings';
import DetailedTripView from './pages/DetailedTripView';
import AssignmentMonitoring from './pages/AssignmentMonitoring';
import FrontOfficeView from './pages/FrontOfficeView';
import DriverView from './pages/DriverView';
import InventoryManagement from './pages/InventoryManagement';
import AdminInventoryManagement from './pages/AdminInventoryManagement';
import AdminDashboard from './pages/AdminDashboard';
import RequestsApprovalPage from './pages/RequestsApprovalPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  // Store keepers should only access inventory
  if (user?.role === 'STORE_KEEPER') {
    return <Navigate to="/inventory" />;
  }
  return user ? <>{children}</> : <Navigate to="/login" />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  return user && (user.role === 'ADMIN' || user.role === 'STAFF') ? (
    <>{children}</>
  ) : (
    <Navigate to="/" />
  );
}

function StaffRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  return user && user.role === 'STAFF' ? (
    <>{children}</>
  ) : (
    <Navigate to="/" />
  );
}

function DriverRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  // Drivers must have DRIVER role
  return user && user.role === 'DRIVER' ? (
    <>{children}</>
  ) : (
    <Navigate to="/" />
  );
}

function StoreKeeperRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  return user && user.role === 'STORE_KEEPER' ? (
    <>{children}</>
  ) : (
    <Navigate to="/" />
  );
}

function StoreKeeperRedirect({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  // Redirect store keepers to inventory page
  if (user?.role === 'STORE_KEEPER') {
    return <Navigate to="/inventory" />;
  }
  return <>{children}</>;
}

function DriverRedirect({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  // Redirect drivers to driver app
  if (user?.role === 'DRIVER') {
    return <Navigate to="/driver" />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <StoreKeeperRedirect>
              <DriverRedirect>
                <Layout>
                  <Home />
                </Layout>
              </DriverRedirect>
            </StoreKeeperRedirect>
          }
        />
        <Route
          path="/book-online"
          element={
            <StoreKeeperRedirect>
              <DriverRedirect>
                <Layout>
                  <EnhancedBookingForm />
                </Layout>
              </DriverRedirect>
            </StoreKeeperRedirect>
          }
        />
        <Route
          path="/features"
          element={
            <StoreKeeperRedirect>
              <DriverRedirect>
                <Layout>
                  <IntuitiveFeatures />
                </Layout>
              </DriverRedirect>
            </StoreKeeperRedirect>
          }
        />
        <Route
          path="/reservation"
          element={
            <StoreKeeperRedirect>
              <DriverRedirect>
                <Layout>
                  <OnlineReservation />
                </Layout>
              </DriverRedirect>
            </StoreKeeperRedirect>
          }
        />
        <Route
          path="/admin/routes"
          element={
            <AdminRoute>
              <Layout>
                <AdminRouteManagement />
              </Layout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/stations"
          element={
            <AdminRoute>
              <Layout>
                <AdminStationManagement />
              </Layout>
            </AdminRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/routes"
          element={
            <StoreKeeperRedirect>
              <DriverRedirect>
                <Layout>
                  <RoutesPage />
                </Layout>
              </DriverRedirect>
            </StoreKeeperRedirect>
          }
        />
        <Route
          path="/stations"
          element={
            <StoreKeeperRedirect>
              <DriverRedirect>
                <Layout>
                  <StationsPage />
                </Layout>
              </DriverRedirect>
            </StoreKeeperRedirect>
          }
        />
        <Route
          path="/trips"
          element={
            <StoreKeeperRedirect>
              <DriverRedirect>
                <Layout>
                  <TripsPage />
                </Layout>
              </DriverRedirect>
            </StoreKeeperRedirect>
          }
        />
        <Route
          path="/trips/:id/track"
          element={
            <StoreKeeperRedirect>
              <DriverRedirect>
                <Layout>
                  <TripTracking />
                </Layout>
              </DriverRedirect>
            </StoreKeeperRedirect>
          }
        />
        <Route
          path="/admin/trips/:id"
          element={
            <AdminRoute>
              <Layout>
                <DetailedTripView />
              </Layout>
            </AdminRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <PrivateRoute>
              <Layout>
                <BookingsPage />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/book/:tripId"
          element={
            <PrivateRoute>
              <Layout>
                <BookingForm />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/buses"
          element={
            <AdminRoute>
              <Layout>
                <BusesPage />
              </Layout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/drivers"
          element={
            <AdminRoute>
              <Layout>
                <DriversPage />
              </Layout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/routes"
          element={
            <AdminRoute>
              <Layout>
                <RoutesPage admin />
              </Layout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/stations"
          element={
            <AdminRoute>
              <Layout>
                <StationsPage admin />
              </Layout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/trips"
          element={
            <AdminRoute>
              <Layout>
                <AdminTripManagement />
              </Layout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <AdminRoute>
              <Layout>
                <BookingsPage admin />
              </Layout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <Layout>
                <AdminDashboard />
              </Layout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/requests"
          element={
            <AdminRoute>
              <Layout>
                <RequestsApprovalPage />
              </Layout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <AdminRoute>
              <Layout>
                <EnhancedSettings />
              </Layout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/monitoring"
          element={
            <AdminRoute>
              <Layout>
                <AssignmentMonitoring />
              </Layout>
            </AdminRoute>
          }
        />
        <Route
          path="/front-office"
          element={
            <StaffRoute>
              <Layout>
                <FrontOfficeView />
              </Layout>
            </StaffRoute>
          }
        />
        <Route
          path="/driver"
          element={
            <DriverRoute>
              <Layout>
                <DriverView />
              </Layout>
            </DriverRoute>
          }
        />
        <Route
          path="/admin/inventory"
          element={
            <AdminRoute>
              <Layout>
                <AdminInventoryManagement />
              </Layout>
            </AdminRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <StoreKeeperRoute>
              <Layout>
                <InventoryManagement />
              </Layout>
            </StoreKeeperRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;






