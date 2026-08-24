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

// If the token is missing/expired/invalid the server replies 401/403. Clear the
// stale session and bounce admins back to login so the next sign-in works,
// instead of every save failing silently.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if ((status === 401 || status === 403) && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      if (window.location.pathname.startsWith('/admin') &&
          window.location.pathname !== '/admin/login') {
        window.location.assign('/admin/login');
      }
    }
    return Promise.reject(error);
  }
);

export const AppContext = createContext({
  rooms: [], setRooms: () => {}, updateRoom: () => {}, fetchRooms: async () => {}, loading: false, roomsError: null,
  bookings: [], setBookings: () => {}, updateBookingStatus: () => {}, createBooking: async () => ({}), checkAvailability: async () => true, fetchBookings: async () => {}, deleteBooking: async () => {},
  payments: [], setPayments: () => {}, fetchPayments: async () => {}, confirmPayment: async () => ({}), deletePayment: async () => {}, clearAllRecords: async () => ({}),
  paymentsLoading: false, paymentsError: null,
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
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsError, setPaymentsError] = useState(null);

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

      // Rooms, prices, images and availability come straight from the database
      // (admin dashboard is the single source of truth). No frontend overrides.

      // Filter out Room 113 per request since it doesn't exist
      result = result.filter(r => String(r.roomNumber) !== '113');

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

  // The database is the single source of truth for status. The old
  // `bookingOverrides` / `paymentOverrides` localStorage maps were added
  // because the admin PATCH looked like it "didn't persist" - it actually does
  // (see the Edge Function), the errors were just being swallowed. Layering
  // local state on top meant a genuinely failed update still looked applied,
  // and a stale entry pinned a row to the wrong status on that device forever.
  const fetchBookings = async () => {
    try {
      localStorage.removeItem('bookingOverrides');
      const { data } = await api.get('/bookings');
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('fetchBookings:', err.message);
      throw err;
    }
  };

  const fetchPayments = async () => {
    setPaymentsLoading(true);
    setPaymentsError(null);
    try {
      localStorage.removeItem('paymentOverrides');
      const { data } = await api.get('/payments');
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('fetchPayments:', err.message);
      setPaymentsError(err.message || 'Failed to load payment data.');
    } finally {
      setPaymentsLoading(false);
    }
  };

  // ── Auto-load on mount ───────────────────────────────────
  useEffect(() => {
    fetchRooms();
    // Also load admin data if a token already exists (page refresh)
    if (localStorage.getItem('token')) {
      fetchBookings().catch(() => {});
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
    // Let errors propagate so the caller (admin UI) can show them instead of
    // silently "succeeding". A 401 here is handled by the response interceptor.
    await api.patch(`/rooms/${id}`, data);
    await fetchRooms(true);
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
      // Both are admin-only endpoints; a guest booking from the public checkout
      // gets a 401 here. The booking itself already succeeded, so a refresh
      // failure must not be reported back as a booking failure.
      await Promise.allSettled([fetchBookings(), fetchPayments()]);
      return { success: true, booking: newBooking };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Booking failed' };
    }
  };

  const updateBookingStatus = async (id, status) => {
    // Errors propagate so the admin UI can report what actually happened.
    const { data } = await api.patch(`/bookings/${id}`, { status });
    setBookings(prev => prev.map(b => (b.id === id ? { ...b, ...data, status } : b)));
    await fetchBookings();
    return data;
  };

  const deleteBooking = async (id) => {
    await api.delete(`/bookings/${id}`);
    setBookings(prev => prev.filter(b => b.id !== id));
    await Promise.all([fetchBookings(), fetchPayments()]);
  };

  // ── Payments ─────────────────────────────────────────────
  // Approve / reject a transaction. The Edge Function updates the payment, the
  // booking and the room in one call, so all that is left here is to re-read
  // server state. Errors are thrown, never swallowed: a row that still says
  // "Pending" after this resolves really is still pending.
  const confirmPayment = async (id, status, adminNotes) => {
    const { data } = await api.patch(`/payments/${id}/confirm`, { status, adminNotes });

    // Paint the new status immediately so the badge flips on the same click,
    // then reconcile with the server.
    const bookingId = data?.payment?.bookingId ?? payments.find(p => p.id === id)?.bookingId;
    const bookingStatus = status === 'success' ? 'confirmed' : 'cancelled';
    setPayments(prev => prev.map(p => (p.id === id ? { ...p, ...(data?.payment || {}), status } : p)));
    setBookings(prev => prev.map(b => (
      b.id === bookingId ? { ...b, status: bookingStatus, paymentStatus: status } : b
    )));

    await Promise.all([fetchPayments(), fetchBookings(), fetchRooms(true)]);
    return { success: true, apiPersisted: true, payment: data?.payment };
  };

  const deletePayment = async (id) => {
    await api.delete(`/payments/${id}`);
    setPayments(prev => prev.filter(p => p.id !== id));
    await fetchPayments();
  };

  // Danger zone: wipes every booking, payment and guest account, and releases
  // booked rooms. Backs the dashboard's "Clear All Records" action.
  const clearAllRecords = async () => {
    const { data } = await api.delete('/admin/records');
    localStorage.removeItem('bookingOverrides');
    localStorage.removeItem('paymentOverrides');
    setBookings([]);
    setPayments([]);
    await Promise.all([fetchBookings(), fetchPayments(), fetchRooms(true)]);
    return data;
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
        bookings, setBookings, updateBookingStatus, createBooking, checkAvailability, fetchBookings, deleteBooking,
        payments, setPayments, fetchPayments, confirmPayment, deletePayment, clearAllRecords,
        paymentsLoading, paymentsError,
        users, setUsers,
        testimonials, addTestimonial,
        currentUser, login, logout
      }}
    >
      {children}
    </AppContext.Provider>
  );
};