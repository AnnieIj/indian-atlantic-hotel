import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create an Axios instance for clean API integration
const api = axios.create({
  baseURL: '/api'
});

// Intercept requests to attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const AppContext = createContext({
  rooms: [], setRooms: () => {}, updateRoom: () => {}, fetchRooms: async () => {}, loading: false, roomsError: null,
  bookings: [], setBookings: () => {}, updateBookingStatus: () => {}, createBooking: async () => ({}), checkAvailability: async () => true, fetchBookings: async () => {},
  payments: [], setPayments: () => {}, fetchPayments: async () => {}, confirmPayment: async () => {},
  users: [], setUsers: () => {},
  testimonials: [], addTestimonial: () => {},
  currentUser: null, login: async () => {}, logout: () => {}
});

let roomsCache = { data: null, fetchedAt: 0 };
const ROOMS_TTL = 5 * 60 * 1000;

export const AppProvider = ({ children }) => {
  const [rooms, setRooms] = useState(() => roomsCache.data || []);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('currentUser');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [roomsError, setRoomsError] = useState(null);

  // ── Fetchers ────────────────────────────────────────────
  const fetchRooms = async (force = false) => {
    const now = Date.now();
    if (!force && roomsCache.data && now - roomsCache.fetchedAt < ROOMS_TTL) {
      setRooms(roomsCache.data);
      return;
    }
    setLoading(true);
    setRoomsError(null);
    try {
      const { data } = await api.get('/rooms');
      let result = Array.isArray(data) ? data : [];
      result.sort((a, b) => {
        const roomA = a.roomNumber ? String(a.roomNumber) : (a.name ? String(a.name) : '');
        const roomB = b.roomNumber ? String(b.roomNumber) : (b.name ? String(b.name) : '');
        
        const numA = parseInt(roomA.replace(/\D/g, ''), 10);
        const numB = parseInt(roomB.replace(/\D/g, ''), 10);
        
        if (!isNaN(numA) && !isNaN(numB)) {
          if (numA !== numB) {
            return numA - numB;
          }
        }
        return roomA.localeCompare(roomB, undefined, { numeric: true, sensitivity: 'base' });
      });
      roomsCache = { data: result, fetchedAt: Date.now() };
      setRooms(result);
    } catch (err) {
      console.error('fetchRooms:', err.message);
      setRoomsError(err.message || 'Failed to connect to the backend server.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const { data } = await api.get('/bookings');
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('fetchBookings:', err.message);
    }
  };

  const fetchPayments = async () => {
    try {
      const { data } = await api.get('/payments');
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('fetchPayments:', err.message);
    }
  };

  // ── Auto-load on mount ───────────────────────────────────
  useEffect(() => {
    fetchRooms();
    // Also load admin data if a token already exists (page refresh)
    if (localStorage.getItem('token')) {
      fetchBookings();
      fetchPayments();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auth ─────────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const { access_token, user } = data;
      if (access_token && user?.role?.toLowerCase() === 'admin') {
        localStorage.setItem('token', access_token);
        localStorage.setItem('currentUser', JSON.stringify(user));
        setCurrentUser(user);
        return { success: true, user };
      }
      return { success: false, message: 'Access denied. Admins only.' };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Invalid credentials' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setBookings([]);
    setPayments([]);
  };

  // ── Rooms ────────────────────────────────────────────────
  const updateRoom = async (id, data) => {
    try {
      await api.patch(`/rooms/${id}`, data);
      await fetchRooms(true);
    } catch (err) {
      console.error('updateRoom:', err.message);
    }
  };

  const checkAvailability = async (roomId, checkIn, checkOut) => {
    try {
      const { data } = await api.get(`/rooms/${roomId}/availability`, { params: { checkIn, checkOut } });
      return data.available;
    } catch (err) {
      console.error('checkAvailability:', err.message);
      // If endpoint doesn't exist, allow booking to proceed
      return true;
    }
  };

  // ── Bookings ─────────────────────────────────────────────
  const createBooking = async (bookingData) => {
    try {
      let newBooking;
      if (bookingData.receipt instanceof File) {
        const formData = new FormData();
        Object.keys(bookingData).forEach(key => formData.append(key, bookingData[key]));
        const { data } = await api.post('/bookings', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        newBooking = data;
      } else {
        const { data } = await api.post('/bookings', bookingData);
        newBooking = data;
      }
      await fetchBookings();
      await fetchPayments();
      return { success: true, booking: newBooking };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Booking failed' };
    }
  };

  const updateBookingStatus = async (id, status) => {
    try {
      await api.patch(`/bookings/${id}`, { status });
      await fetchBookings();
    } catch (err) {
      console.error('updateBookingStatus:', err.message);
    }
  };

  // ── Payments ─────────────────────────────────────────────
  const confirmPayment = async (id, status, adminNotes) => {
    try {
      await api.patch(`/payments/${id}/confirm`, { status, adminNotes });
      await fetchPayments();
      await fetchBookings();
    } catch (err) {
      console.error('confirmPayment:', err.message);
    }
  };

  // ── Testimonials (local only) ─────────────────────────────
  const addTestimonial = (testimonial) => {
    setTestimonials(prev => [{ ...testimonial, id: Date.now() }, ...prev]);
    return { success: true };
  };

  return (
    <AppContext.Provider
      value={{
        rooms, setRooms, updateRoom, fetchRooms, loading, roomsError,
        bookings, setBookings, updateBookingStatus, createBooking, checkAvailability, fetchBookings,
        payments, setPayments, fetchPayments, confirmPayment,
        users, setUsers,
        testimonials, addTestimonial,
        currentUser, login, logout
      }}
    >
      {children}
    </AppContext.Provider>
  );
};