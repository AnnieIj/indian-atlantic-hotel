import React, { createContext, useState, useEffect } from 'react';
import { generateRooms, mockUsers, mockBookings } from '../data/mockData';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('iah_theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('iah_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

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
      method: 'Card',
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

  const createBooking = (bookingData) => {
    if (!checkAvailability(bookingData.roomId, bookingData.checkIn, bookingData.checkOut)) {
      return { success: false, message: 'Room is not available for these dates' };
    }
    
    const newBooking = {
      ...bookingData,
      id: `b${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    setBookings([...bookings, newBooking]);
    
    // Create linked payment log
    const newPayment = {
      id: `p${Date.now()}`,
      bookingId: newBooking.id,
      amount: newBooking.totalPrice,
      method: 'Card',
      status: 'success',
      createdAt: newBooking.createdAt
    };
    setPayments([...payments, newPayment]);
    
    // Automatically update the room status to 'booked' so it shows as unavailable on the frontend
    setRooms(rooms.map(r => r.id === bookingData.roomId ? { ...r, status: 'booked' } : r));
    
    return { success: true, booking: newBooking };
  };

  const updateBookingStatus = (id, status) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
  };

  const updateRoom = (id, data) => {
    setRooms(rooms.map(r => r.id === id ? { ...r, ...data } : r));
  };

  return (
    <AppContext.Provider value={{
      rooms, setRooms, updateRoom,
      bookings, setBookings, updateBookingStatus, createBooking, checkAvailability,
      payments, setPayments,
      users, setUsers,
      currentUser, login, logout,
      theme, toggleTheme
    }}>
      {children}
    </AppContext.Provider>
  );
};
