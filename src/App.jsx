import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import MainLayout from './components/MainLayout';
import Home from './pages/Home';
import Rooms from './pages/Rooms';
import RoomDetails from './pages/RoomDetails';
import Checkout from './pages/Checkout';

import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBookings from './pages/admin/AdminBookings';
import AdminRooms from './pages/admin/AdminRooms';
import AdminPayments from './pages/admin/AdminPayments';
import WhatsAppWidget from './components/WhatsAppWidget';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* Main Site Routes with Header & Footer */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/room/:id" element={<RoomDetails />} />
            <Route path="/checkout" element={<Checkout />} />
          </Route>
          
          {/* Admin Routes - No Main Site Header/Footer */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="rooms" element={<AdminRooms />} />
            <Route path="payments" element={<AdminPayments />} />
          </Route>
        </Routes>
        <WhatsAppWidget />
      </Router>
    </AppProvider>
  );
}

export default App;
