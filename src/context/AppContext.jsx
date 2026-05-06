import React, { createContext, useState, useEffect } from 'react';
import { generateRooms, mockUsers, mockBookings, mockTestimonials } from '../data/mockData';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Load from local storage or initialize with mock data
    // Force reload new inventory and clear old local storage data
    localStorage.removeItem('iah_rooms');
    localStorage.removeItem('iah_bookings');
    setRooms(generateRooms());
    setBookings(mockBookings);
    
    // Initialize mock payments
    const mockPayments = mockBookings.map(b => ({
      id: `p${b.id}`,
      bookingId: b.id,
      amount: b.totalPrice,
      method: 'Paystack',
      paystackRef: 'mock_ref_' + b.id,
      status: 'success',
      createdAt: b.createdAt
    }));
    setPayments(mockPayments);
    
    const localUsers = localStorage.getItem('iah_users');
    if (localUsers) {
      let parsedUsers = JSON.parse(localUsers);
      parsedUsers = parsedUsers.map(u => u.role === 'admin' ? { ...u, email: 'admin@gmail.com' } : u);
      setUsers(parsedUsers);
    } else {
      setUsers(mockUsers);
    }
    
    const localTestimonials = localStorage.getItem('iah_testimonials');
    if (localTestimonials) {
      setTestimonials(JSON.parse(localTestimonials));
    } else {
      setTestimonials(mockTestimonials);
    }
    
    const loggedInUser = localStorage.getItem('iah_currentUser');
    if (loggedInUser) setCurrentUser(JSON.parse(loggedInUser));
  }, []);

  // Save to local storage whenever state changes
  useEffect(() => {
    if (rooms.length > 0) localStorage.setItem('iah_rooms', JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    if (bookings.length > 0) localStorage.setItem('iah_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    if (payments.length > 0) localStorage.setItem('iah_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    if (users.length > 0) localStorage.setItem('iah_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (testimonials.length > 0) localStorage.setItem('iah_testimonials', JSON.stringify(testimonials));
  }, [testimonials]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('iah_currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('iah_currentUser');
    }
  }, [currentUser]);

  // Actions
  const login = (email, password) => {
    const user = users.find(u => u.email === email);
    if (email === 'admin@gmail.com' && password === 'admin123') {
      const admin = users.find(u => u.role === 'admin');
      setCurrentUser(admin);
      return { success: true, user: admin };
    } else if (user) {
      setCurrentUser(user);
      return { success: true, user };
    }
    return { success: false, message: 'Invalid credentials' };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const checkAvailability = (roomId, checkIn, checkOut) => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    const overlaps = bookings.some(b => {
      if (b.roomId !== roomId || b.status === 'cancelled') return false;
      const bCheckIn = new Date(b.checkIn);
      const bCheckOut = new Date(b.checkOut);
      return (checkInDate < bCheckOut && checkOutDate > bCheckIn);
    });
    
    return !overlaps;
  };

  const createBooking = async (bookingData) => {
    if (!checkAvailability(bookingData.roomId, bookingData.checkIn, bookingData.checkOut)) {
      return { success: false, message: 'Room is not available for these dates' };
    }
    
    if (bookingData.paymentMethod === 'Bank Transfer') {
      const newBooking = {
        ...bookingData,
        id: `b${Date.now()}`,
        status: 'pending', // Pending verification for bank transfer
        paymentStatus: 'pending',
        createdAt: new Date().toISOString()
      };
      
      setBookings(prev => [...prev, newBooking]);
      
      const newPayment = {
        id: `p${Date.now()}`,
        bookingId: newBooking.id,
        amount: newBooking.totalPrice,
        method: 'Bank Transfer',
        status: 'pending',
        receipt: bookingData.receipt, // Store receipt name or data
        createdAt: newBooking.createdAt
      };
      setPayments(prev => [...prev, newPayment]);
      setRooms(prevRooms => prevRooms.map(r => r.id === bookingData.roomId ? { ...r, status: 'booked' } : r));
      
      return { success: true, booking: newBooking };
    }
    
    return new Promise((resolve) => {
      const handler = window.PaystackPop.setup({
        key: 'pk_test_f68bf2750d5f94a2ca50db5dd38ca683f2d45152',
        email: currentUser?.email || bookingData.guestEmail,
        amount: bookingData.totalPrice * 100,
        currency: 'NGN',
        ref: 'IAH_' + Date.now(),
        callback: (response) => {
          const newBooking = {
            ...bookingData,
            id: `b${Date.now()}`,
            createdAt: new Date().toISOString()
          };
          
          setBookings(prev => [...prev, newBooking]);
          
          // Create linked payment log
          const newPayment = {
            id: `p${Date.now()}`,
            bookingId: newBooking.id,
            amount: newBooking.totalPrice,
            method: 'Paystack',
            status: 'success',
            paystackRef: response.reference,
            createdAt: newBooking.createdAt
          };
          setPayments(prev => [...prev, newPayment]);
          
          // Automatically update the room status to 'booked' so it shows as unavailable on the frontend
          setRooms(prevRooms => prevRooms.map(r => r.id === bookingData.roomId ? { ...r, status: 'booked' } : r));
          
          resolve({ success: true, booking: newBooking });
        },
        onClose: () => {
          resolve({ success: false, message: 'Payment cancelled' });
        }
      });
      handler.openIframe();
    });
  };

  const updateBookingStatus = (id, status) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    
    // Also update associated payment if it exists
    setPayments(prev => prev.map(p => p.bookingId === id ? { ...p, status: status === 'confirmed' ? 'success' : status === 'cancelled' ? 'failed' : 'pending' } : p));
  };

  const getBookingById = (id) => {
    return bookings.find(b => b.id === id);
  };

  const updateRoom = (id, data) => {
    setRooms(rooms.map(r => r.id === id ? { ...r, ...data } : r));
  };

  const addTestimonial = (testimonial) => {
    const newTestimonial = {
      ...testimonial,
      id: Date.now()
    };
    setTestimonials(prev => [newTestimonial, ...prev]);
    return { success: true };
  };

  return (
    <AppContext.Provider value={{
      rooms, setRooms, updateRoom,
      bookings, setBookings, updateBookingStatus, createBooking, checkAvailability,
      payments, setPayments,
      users, setUsers,
      testimonials, addTestimonial,
      currentUser, login, logout
    }}>
      {children}
    </AppContext.Provider>
  );
};;
