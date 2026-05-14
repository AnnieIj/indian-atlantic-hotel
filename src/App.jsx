import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppContext } from './context/AppContext';
import MainLayout from './components/MainLayout';
import Home from './pages/Home';
import Rooms from './pages/Rooms';
import RoomDetails from './pages/RoomDetails';
import Checkout from './pages/Checkout';
import BookingStatus from './pages/BookingStatus';

import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBookings from './pages/admin/AdminBookings';
import AdminRooms from './pages/admin/AdminRooms';
import AddRoom from './pages/admin/AddRoom';
import AdminPayments from './pages/admin/AdminPayments';
import WhatsAppWidget from './components/WhatsAppWidget';
import ScrollToTop from './components/ScrollToTop';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useContext(AppContext);
  const token = localStorage.getItem('token');
  
  if (!token || !currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Main Site Routes with Header & Footer */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/room/:id" element={<RoomDetails />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/booking-status/:bookingId" element={<BookingStatus />} />
        </Route>

        {/* Admin Routes */}
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
      <WhatsAppWidget />
    </>
  );
}

export default App;
