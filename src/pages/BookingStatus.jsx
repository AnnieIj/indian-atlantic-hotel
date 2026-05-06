import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { CheckCircle, Clock, XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

const BookingStatus = () => {
  const { bookingId } = useParams();
  const { bookings, payments } = useContext(AppContext);
  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching delay
    const timer = setTimeout(() => {
      const foundBooking = bookings.find(b => b.id === bookingId);
      if (foundBooking) {
        setBooking(foundBooking);
        const foundPayment = payments.find(p => p.bookingId === foundBooking.id);
        setPayment(foundPayment);
      }
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [bookingId, bookings, payments]);

  if (loading) {
    return (
      <main className="pt-32 pb-20 bg-light min-h-screen">
        <div className="container text-center py-20">
          <div className="skeleton mx-auto" style={{ width: '80px', height: '80px', borderRadius: '50%' }}></div>
          <div className="skeleton mx-auto mt-6" style={{ width: '200px', height: '24px' }}></div>
          <div className="skeleton mx-auto mt-4" style={{ width: '300px', height: '16px' }}></div>
        </div>
      </main>
    );
  }

  if (!booking) {
    return (
      <main className="pt-32 pb-20 bg-light min-h-screen">
        <div className="container text-center py-20">
          <XCircle size={64} className="text-danger mx-auto mb-4" />
          <h2>Booking Not Found</h2>
          <p className="mt-4">We couldn't find a booking with the ID #{bookingId}.</p>
          <Link to="/rooms" className="btn btn-primary mt-8">Back to Rooms</Link>
        </div>
      </main>
    );
  }

  const renderStatus = () => {
    switch (booking.status) {
      case 'pending':
        return (
          <div className="status-card pending glass-panel text-center py-12 px-6">
            <Clock size={64} className="text-warning mx-auto mb-6 shimmer" />
            <h2 className="text-navy">Verification In Progress</h2>
            <p className="mt-4 text-muted max-w-md mx-auto">
              Your payment is currently being verified by our finance team. 
              This typically takes 30-60 minutes during business hours.
            </p>
            <div className="mt-8 p-4 bg-light rounded-lg inline-block">
              <RefreshCw size={16} className="spin mr-2 inline" /> 
              <span className="text-sm font-medium">Checking for updates every minute...</span>
            </div>
          </div>
        );
      case 'confirmed':
        return (
          <div className="status-card approved glass-panel text-center py-12 px-6">
            <CheckCircle size={64} className="text-success mx-auto mb-6" />
            <h2 className="text-navy">Booking Successful ✅</h2>
            <p className="mt-4 text-muted max-w-md mx-auto">
              Your payment has been verified! We look forward to welcoming you at Indian Atlantic Hotel.
            </p>
            <div className="mt-8 flex gap-4 justify-center">
              <button className="btn btn-primary" onClick={() => window.print()}>Print Receipt</button>
              <Link to="/" className="btn btn-outline">Return Home</Link>
            </div>
          </div>
        );
      case 'cancelled':
        return (
          <div className="status-card rejected glass-panel text-center py-12 px-6">
            <XCircle size={64} className="text-danger mx-auto mb-6" />
            <h2 className="text-navy">Payment Failed / Rejected ❌</h2>
            <p className="mt-4 text-muted max-w-md mx-auto">
              Unfortunately, your payment could not be verified. This might be due to an incorrect amount or broken receipt image.
            </p>
            <div className="mt-8 flex gap-4 justify-center">
              <Link to="/rooms" className="btn btn-primary">Try Again</Link>
              <Link to="/" className="btn btn-outline">Contact Support</Link>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main className="pt-32 pb-20 bg-light min-h-screen">
      <div className="container max-w-2xl">
        <Link to="/" className="flex items-center gap-2 text-navy mb-8 hover:text-gold transition-colors">
          <ArrowLeft size={18} /> Back to Home
        </Link>

        {renderStatus()}

        <div className="booking-details-card mt-8 glass-panel p-8">
          <h3 className="border-b pb-4 mb-6">Booking Details</h3>
          <div className="grid grid-cols-2 gap-y-6">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted font-bold">Booking ID</p>
              <p className="font-semibold text-navy">#{booking.id}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted font-bold">Room</p>
              <p className="font-semibold text-navy">{booking.roomName}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted font-bold">Guest Name</p>
              <p className="font-semibold text-navy">{booking.guestName}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted font-bold">Amount Paid</p>
              <p className="font-semibold text-gold">₦{booking.totalAmount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted font-bold">Check-in</p>
              <p className="font-semibold text-navy">{booking.checkIn}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted font-bold">Check-out</p>
              <p className="font-semibold text-navy">{booking.checkOut}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default BookingStatus;
