import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { CheckCircle, Clock, XCircle, ArrowLeft, RefreshCw, Hash, BedDouble, User, CreditCard, CalendarDays, CalendarCheck } from 'lucide-react';

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

        <div className="mt-8 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-gray-100">
          <div className="bg-[#f8fafc] px-8 py-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="m-0 text-[#1e293b] font-bold text-xl flex items-center gap-2">
              <span style={{ fontSize: '1.4rem' }}>✨</span> Booking Summary
            </h3>
            <span className="bg-[#fef3c7] text-[#92400e] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {booking.status}
            </span>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Card item */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] transition-colors border border-transparent hover:border-gray-200">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Hash size={18} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#64748b] font-bold mb-1">Booking ID</p>
                  <p className="font-bold text-[#1e293b]">#{booking.id}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] transition-colors border border-transparent hover:border-gray-200">
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                  <BedDouble size={18} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#64748b] font-bold mb-1">Room</p>
                  <p className="font-bold text-[#1e293b]">{booking.roomName}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] transition-colors border border-transparent hover:border-gray-200">
                <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <User size={18} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#64748b] font-bold mb-1">Guest Name</p>
                  <p className="font-bold text-[#1e293b]">{booking.guestName}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] transition-colors border border-transparent hover:border-gray-200">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <CreditCard size={18} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#64748b] font-bold mb-1">Amount Paid</p>
                  <p className="font-black text-[#10b981] text-lg">₦{(booking.totalAmount || booking.totalPrice || 0).toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] transition-colors border border-transparent hover:border-gray-200">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <CalendarDays size={18} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#64748b] font-bold mb-1">Check-in</p>
                  <p className="font-bold text-[#1e293b]">{booking.checkIn}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] transition-colors border border-transparent hover:border-gray-200">
                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  <CalendarCheck size={18} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#64748b] font-bold mb-1">Check-out</p>
                  <p className="font-bold text-[#1e293b]">{booking.checkOut}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-dashed border-gray-200 text-center">
              <p className="text-sm text-[#64748b] italic">
                A copy of these details has been sent to your email.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default BookingStatus;
