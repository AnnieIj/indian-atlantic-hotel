import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { Search, CheckCircle, XCircle } from 'lucide-react';
import {
  BOOKING_STATUS,
  normalizeBookingStatus,
  bookingStatusLabel,
  bookingStatusBadge,
  receiptUrlOf,
  naira,
} from '../../utils/status';
import { displayGuestEmail } from '../../utils/guest';

const AdminBookings = () => {
  const { bookings, rooms, updateBookingStatus, fetchBookings } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState(null); // { type, msg }

  useEffect(() => {
    fetchBookings().catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 5000);
  };

  // Status changes now report what actually happened. The previous version
  // swallowed API errors and wrote the new status to localStorage, so a
  // rejected update still looked applied until the next hard refresh.
  const changeStatus = async (id, status) => {
    setBusyId(id);
    try {
      await updateBookingStatus(id, status);
      showToast('success', `Booking #${id.substring(0, 8)} is now ${bookingStatusLabel(status)}.`);
    } catch (err) {
      showToast('error', err?.response?.data?.message || err.message || 'Could not update the booking.');
    } finally {
      setBusyId(null);
    }
  };

  const filteredBookings = bookings.filter(b => {
    const room = rooms.find(r => r.id === b.roomId);
    const haystack = [
      b.guestName,
      displayGuestEmail(b.guestEmail),
      b.guestPhone,
      b.id,
      b.confirmationCode,
      room?.name,
      b.room?.name,
    ].filter(Boolean).join(' ').toLowerCase();
    return haystack.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="admin-table-container">
      {toast && (
        <div style={{
          position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999,
          background: toast.type === 'success' ? '#10b981' : '#ef4444',
          color: '#fff', padding: '1rem 1.5rem', borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center',
          gap: '0.75rem', fontWeight: 600, fontSize: '0.9rem', maxWidth: '360px'
        }}>
          {toast.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
          {toast.msg}
        </div>
      )}

      <div style={{padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem'}}>
        <h3 style={{margin: 0, color: 'var(--color-primary-navy)'}}>Booking Management</h3>
        <div style={{position: 'relative', width: '300px'}}>
          <Search size={18} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8'}} />
          <input
            type="text"
            placeholder="Search by name, ID, code or room..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', border: '1px solid #e2e8f0', borderRadius: '25px', outline: 'none'}}
          />
        </div>
      </div>
      <div style={{overflowX: 'auto'}}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Guest</th>
              <th>Room</th>
              <th>Dates</th>
              <th>Total</th>
              <th>Code</th>
              <th>Receipt</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length > 0 ? (
              filteredBookings.map(booking => {
                const room = booking.room || rooms.find(r => r.id === booking.roomId);
                // Receipts live on the payment record; older payloads put a
                // `receipt` field on the booking itself.
                const receiptUrl = receiptUrlOf(booking.payment) || receiptUrlOf(booking);
                const status = normalizeBookingStatus(booking.status);
                const badge = bookingStatusBadge(status);
                const busy = busyId === booking.id;

                return (
                  <tr key={booking.id}>
                    <td style={{fontSize: '0.8rem', color: '#64748b'}}>#{booking.id.substring(0, 8)}</td>
                    <td>
                      <div style={{fontWeight: 500}}>{booking.guestName || 'Guest'}</div>
                      <div style={{fontSize: '0.8rem', color: '#64748b'}}>
                        {displayGuestEmail(booking.guestEmail) || booking.guestPhone || ''}
                      </div>
                    </td>
                    <td>{room?.name || booking.roomId}</td>
                    <td>
                      <div style={{fontSize: '0.9rem'}}>{new Date(booking.checkIn).toLocaleDateString()} -</div>
                      <div style={{fontSize: '0.9rem'}}>{new Date(booking.checkOut).toLocaleDateString()}</div>
                    </td>
                    <td style={{fontWeight: 600}}>{naira(booking.totalAmount || booking.totalPrice)}</td>
                    <td>
                      <div style={{
                        fontFamily: 'monospace',
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        color: '#1e293b',
                        letterSpacing: '2px'
                      }}>
                        {booking.confirmationCode || 'N/A'}
                      </div>
                    </td>
                    <td>
                      {receiptUrl ? (
                        <button
                          onClick={() => window.open(receiptUrl, '_blank')}
                          style={{ background: 'none', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.25rem 0.6rem', fontSize: '0.75rem', color: '#475569', cursor: 'pointer' }}
                        >
                          View
                        </button>
                      ) : <span style={{ color: '#cbd5e1' }}>&mdash;</span>}
                    </td>
                    <td>
                      <span className={`badge ${badge.cls}`}>
                        {bookingStatusLabel(status)}
                      </span>
                    </td>
                    <td>
                      <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                        {status === BOOKING_STATUS.PENDING && (
                          <>
                            <button disabled={busy} className="btn btn-primary" style={{padding: '0.4rem 0.8rem', fontSize: '0.75rem', background: '#10b981', borderColor: '#10b981'}} onClick={() => changeStatus(booking.id, BOOKING_STATUS.CONFIRMED)}>
                              {busy ? '...' : 'Approve'}
                            </button>
                            <button disabled={busy} className="btn btn-outline" style={{padding: '0.4rem 0.8rem', fontSize: '0.75rem', color: '#ef4444', borderColor: '#ef4444'}} onClick={() => changeStatus(booking.id, BOOKING_STATUS.CANCELLED)}>
                              Reject
                            </button>
                          </>
                        )}
                        {status === BOOKING_STATUS.CONFIRMED && (
                          <button disabled={busy} className="btn btn-primary" style={{padding: '0.4rem 0.8rem', fontSize: '0.75rem'}} onClick={() => changeStatus(booking.id, BOOKING_STATUS.CHECKED_IN)}>
                            {busy ? '...' : 'Check In'}
                          </button>
                        )}
                        {status === BOOKING_STATUS.CHECKED_IN && (
                          <button disabled={busy} className="btn btn-outline" style={{padding: '0.4rem 0.8rem', fontSize: '0.75rem'}} onClick={() => changeStatus(booking.id, BOOKING_STATUS.CHECKED_OUT)}>
                            {busy ? '...' : 'Check Out'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" style={{textAlign: 'center', padding: '3rem', color: '#94a3b8'}}>No bookings found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminBookings;
