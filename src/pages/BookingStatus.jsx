import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { CheckCircle, Clock, XCircle, ArrowLeft, RefreshCw, Hash, BedDouble, User, CreditCard, CalendarDays, CalendarCheck } from 'lucide-react';
import axios from 'axios';
import { BOOKING_STATUS, normalizeBookingStatus, bookingStatusLabel, bookingStatusBadge } from '../utils/status';

// The old Render backend is dead. Every request goes to the Supabase Edge
// Function through the /api rewrite (vercel.json in prod, vite proxy in dev).
const BASE_URL = '/api';
const POLL_MS = 30000;

const BookingStatus = () => {
  const { bookingId } = useParams();
  const { bookings, payments } = useContext(AppContext);
  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async ({ preferServer = false } = {}) => {
    // The context copy is only useful on the first paint right after booking;
    // once we are waiting on an admin decision the server is the truth.
    let foundBooking = preferServer ? null : bookings.find(b => b.id === bookingId);

    if (!foundBooking) {
      try {
        const res = await axios.get(`${BASE_URL}/bookings/${bookingId}`);
        foundBooking = res.data;
      } catch (err) {
        console.error('Failed to fetch booking:', err.message);
      }
    }

    if (foundBooking) {
      setBooking(foundBooking);
      // The booking payload embeds its payment; fall back to context.
      setPayment(
        foundBooking.payment || payments.find(p => p.bookingId === foundBooking.id) || null,
      );
    }
    return foundBooking;
  }, [bookingId, bookings, payments]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await load();
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [bookingId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep the latest loader in a ref so the poll interval below is not torn down
  // and rebuilt every time a fetch replaces the booking object.
  const loadRef = useRef(load);
  useEffect(() => { loadRef.current = load; }, [load]);

  const isPending = !!booking && normalizeBookingStatus(booking.status) === BOOKING_STATUS.PENDING;

  // "Checking for updates" used to be decoration — nothing actually re-read the
  // booking, so a guest sat on "Verification In Progress" even after an admin
  // approved the payment. Poll the server while the booking is still pending.
  useEffect(() => {
    if (!isPending) return undefined;
    const timer = setInterval(() => { loadRef.current({ preferServer: true }); }, POLL_MS);
    return () => clearInterval(timer);
  }, [isPending]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await load({ preferServer: true });
    setRefreshing(false);
  };

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
    switch (normalizeBookingStatus(booking.status)) {
      case BOOKING_STATUS.PENDING:
        // existing pending card is fine for Bank Transfer
        // For Pay on Arrival, status will be 'confirmed' already so no change needed
        return (
          <div className="status-card pending glass-panel text-center py-12 px-6">
            <Clock size={64} className="text-warning mx-auto mb-6 shimmer" />
            <h2 className="text-navy">Verification In Progress</h2>
            <p className="mt-4 text-muted max-w-md mx-auto">
              Your payment is currently being verified by our finance team. 
              This typically takes 30-60 minutes during business hours.
            </p>
            <div className="mt-8 p-4 bg-light rounded-lg inline-block">
              <RefreshCw size={16} className={`mr-2 inline ${refreshing ? 'spin' : ''}`} />
              <span className="text-sm font-medium">Checking for updates every 30 seconds...</span>
            </div>
            <div className="mt-4">
              <button className="btn btn-outline" onClick={handleManualRefresh} disabled={refreshing}>
                {refreshing ? 'Checking...' : 'Check now'}
              </button>
            </div>
          </div>
        );
      case BOOKING_STATUS.CONFIRMED:
        return (
          <div className="status-card approved glass-panel text-center py-12 px-6">
            <CheckCircle size={64} className="text-success mx-auto mb-6" />
            <h2 className="text-navy">Booking Successful ✅</h2>
            <p className="mt-4 text-muted max-w-md mx-auto">
              {(booking.payment?.method === 'Pay on Arrival' || payment?.method === 'Pay on Arrival')
                ? "Your booking is confirmed! We look forward to welcoming you at Indian Atlantic Hotel and Suites."
                : "Your payment has been verified! We look forward to welcoming you at Indian Atlantic Hotel and Suites."}
            </p>
            <div className="mt-8 flex gap-4 justify-center">
              <button className="btn btn-primary" onClick={() => window.print()}>Print Receipt</button>
              <Link to="/" className="btn btn-outline">Return Home</Link>
            </div>
          </div>
        );
      case BOOKING_STATUS.CANCELLED:
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
      case BOOKING_STATUS.CHECKED_IN:
        return (
          <div className="status-card approved glass-panel text-center py-12 px-6">
            <CheckCircle size={64} className="text-success mx-auto mb-6" />
            <h2 className="text-navy">Checked In</h2>
            <p className="mt-4 text-muted max-w-md mx-auto">
              You are checked in. Enjoy your stay at Indian Atlantic Hotel and Suites.
            </p>
          </div>
        );
      case BOOKING_STATUS.CHECKED_OUT:
        return (
          <div className="status-card glass-panel text-center py-12 px-6">
            <CheckCircle size={64} className="text-muted mx-auto mb-6" />
            <h2 className="text-navy">Stay Completed</h2>
            <p className="mt-4 text-muted max-w-md mx-auto">
              Thank you for staying with us. We hope to welcome you back soon.
            </p>
            <div className="mt-8">
              <Link to="/rooms" className="btn btn-primary">Book Again</Link>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const summaryBadge = bookingStatusBadge(booking.status);

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
            <span
              className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider"
              style={{ backgroundColor: summaryBadge.bg, color: summaryBadge.color }}
            >
              {bookingStatusLabel(booking.status)}
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

            {(booking.payment?.method === 'Pay on Arrival' || payment?.method === 'Pay on Arrival') && (
              <div style={{margin:'2rem 0', background:'#d4af37', borderRadius:'12px', padding:'2rem', textAlign:'center'}}>
                <p style={{fontWeight:'bold', fontSize:'0.85rem', letterSpacing:'2px', textTransform:'uppercase', color:'#1a2332', marginBottom:'0.5rem'}}>
                  Your Check-In Code
                </p>
                <p style={{fontSize:'3rem', fontWeight:'900', letterSpacing:'12px', color:'#1a2332', margin:'0.5rem 0'}}>
                  {booking.confirmationCode}
                </p>
                <p style={{fontSize:'0.8rem', color:'#1a2332', opacity:0.75}}>
                  Show this to reception when you arrive
                </p>
              </div>
            )}
            
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
