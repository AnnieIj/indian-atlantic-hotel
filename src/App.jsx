import React, { useContext, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppContext } from './context/AppContext';
import MainLayout from './components/MainLayout';
import WhatsAppWidget from './components/WhatsAppWidget';
import ScrollToTop from './components/ScrollToTop';

const Home = lazy(() => import('./pages/Home'));
const Rooms = lazy(() => import('./pages/Rooms'));
const RoomDetails = lazy(() => import('./pages/RoomDetails'));
const Checkout = lazy(() => import('./pages/Checkout'));
const BookingStatus = lazy(() => import('./pages/BookingStatus'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminBookings = lazy(() => import('./pages/admin/AdminBookings'));
const AdminRooms = lazy(() => import('./pages/admin/AdminRooms'));
const AddRoom = lazy(() => import('./pages/admin/AddRoom'));
const AdminPayments = lazy(() => import('./pages/admin/AdminPayments'));

const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
    <div className="loading-spinner"></div>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useContext(AppContext);
  const token = localStorage.getItem('token');
  if (!token || !currentUser || currentUser.role?.toLowerCase() !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/room/:id" element={<RoomDetails />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/booking-status/:bookingId" element={<BookingStatus />} />
          </Route>

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="rooms" element={<AdminRooms />} />
            <Route path="add-room" element={<AddRoom />} />
            <Route path="payments" element={<AdminPayments />} />
          </Route>
        </Routes>
      </Suspense>
      <WhatsAppWidget />
    </>
  );
}

export default App;
