import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import {
  Calendar, DollarSign, BedDouble, Clock, Wallet,
  Trash2, AlertTriangle, CheckCircle, XCircle, Loader2,
} from 'lucide-react';
import {
  BOOKING_STATUS,
  normalizeBookingStatus,
  bookingStatusLabel,
  bookingStatusBadge,
  naira,
} from '../../utils/status';

const AdminDashboard = () => {
  const { bookings, rooms, payments, fetchBookings, fetchPayments, clearAllRecords } = useContext(AppContext);
  const [clearOpen, setClearOpen] = useState(false);
  const [clearPhrase, setClearPhrase] = useState('');
  const [clearPasscode, setClearPasscode] = useState('');
  const [clearing, setClearing] = useState(false);
  const [clearProgress, setClearProgress] = useState(null); // { done, total }
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchBookings().catch(() => {});
    fetchPayments();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 6000);
  };

  const totalBookings = bookings.length;

  // Money is tracked off the payment ledger, not off booking totals, so that
  // approving a transaction visibly moves the amount out of Outstanding and
  // into Received on the very next render.
  const outstanding = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const received = payments
    .filter(p => p.status === 'success')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const pendingCount = payments.filter(p => p.status === 'pending').length;

  const availableRooms = rooms.filter(r => r.status === 'available').length;
  const pendingBookings = bookings.filter(
    b => normalizeBookingStatus(b.status) === BOOKING_STATUS.PENDING,
  ).length;

  // The API already returns newest-first.
  const recentBookings = bookings.slice(0, 10);

  // A mis-click guard, not a security boundary: the endpoint itself is gated by
  // the admin JWT. Anyone who can read the JS bundle can read this value, so do
  // not treat it as a secret.
  const CLEAR_PASSCODE = '3696';

  const phraseOk = clearPhrase.trim().toUpperCase() === 'CLEAR';
  const passcodeOk = clearPasscode.trim() === CLEAR_PASSCODE;
  const canClear = phraseOk && passcodeOk && !clearing;

  const resetClearForm = () => {
    setClearOpen(false);
    setClearPhrase('');
    setClearPasscode('');
    setClearProgress(null);
  };

  const handleClear = async () => {
    if (clearing) return;
    if (!phraseOk) {
      showToast('error', 'Type CLEAR in the confirmation box first.');
      return;
    }
    if (!passcodeOk) {
      showToast('error', 'Incorrect passcode.');
      return;
    }

    setClearing(true);
    setClearProgress(null);
    try {
      const result = await clearAllRecords(CLEAR_PASSCODE, (done, total) => {
        setClearProgress({ done, total });
      });
      const d = result?.deleted || {};
      showToast(
        result?.partial ? 'error' : 'success',
        result?.partial
          ? result.message
          : `Cleared ${d.bookings ?? 0} booking(s) and ${d.payments ?? 0} transaction(s). ${result?.roomsReleased ?? 0} room(s) released.`,
      );
      resetClearForm();
    } catch (err) {
      const status = err?.response?.status;
      showToast(
        'error',
        status === 401 || status === 403
          ? 'Your admin session expired. Sign in again and retry.'
          : err?.response?.data?.message || err.message || 'Could not clear the records.',
      );
    } finally {
      setClearing(false);
      setClearProgress(null);
    }
  };

  return (
    <div>
      {toast && (
        <div style={{
          position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999,
          background: toast.type === 'success' ? '#10b981' : '#ef4444',
          color: '#fff', padding: '1rem 1.5rem', borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center',
          gap: '0.75rem', fontWeight: 600, fontSize: '0.9rem', maxWidth: '400px'
        }}>
          {toast.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
          {toast.msg}
        </div>
      )}

      {/* STATS */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-icon blue"><Calendar /></div>
          <div className="stat-details">
            <h4>Total Bookings</h4>
            <p>{totalBookings}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green"><DollarSign /></div>
          <div className="stat-details">
            <h4>Received</h4>
            <p>{naira(received)}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber"><Wallet /></div>
          <div className="stat-details">
            <h4>Outstanding</h4>
            <p>{naira(outstanding)}</p>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              {pendingCount} transaction{pendingCount === 1 ? '' : 's'} awaiting approval
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon gold"><BedDouble /></div>
          <div className="stat-details">
            <h4>Available Rooms</h4>
            <p>{availableRooms} / {rooms.length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon red"><Clock /></div>
          <div className="stat-details">
            <h4>Pending Bookings</h4>
            <p>{pendingBookings}</p>
          </div>
        </div>
      </div>

      {/* RECENT BOOKINGS TABLE */}
      <div className="admin-table-container" style={{ marginTop: '2rem' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, color: 'var(--color-primary-navy)' }}>Recent Bookings</h3>
          {totalBookings === 0 && (
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>No bookings yet</span>
          )}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Guest</th>
                <th>Room</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.length > 0 ? (
                recentBookings.map((booking) => {
                  const room = booking.room || rooms.find(r => r.id === booking.roomId);
                  const badge = bookingStatusBadge(booking.status);
                  return (
                    <tr key={booking.id}>
                      <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        #{booking.id?.substring(0, 8)}
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{booking.guestName || 'Guest'}</div>
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{booking.guestEmail}</div>
                      </td>
                      <td>{room?.name || booking.roomName || 'N/A'}</td>
                      <td>{booking.checkIn ? new Date(booking.checkIn).toLocaleDateString() : 'N/A'}</td>
                      <td>{booking.checkOut ? new Date(booking.checkOut).toLocaleDateString() : 'N/A'}</td>
                      <td style={{ fontWeight: 600 }}>{naira(booking.totalAmount || booking.totalPrice)}</td>
                      <td>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: badge.bg,
                          color: badge.color,
                        }}>
                          {bookingStatusLabel(booking.status)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    No bookings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DANGER ZONE */}
      <div style={{
        marginTop: '2rem', border: '2px solid #fecaca', borderRadius: '14px',
        background: '#fef2f2', padding: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
          <AlertTriangle size={20} color="#dc2626" />
          <h3 style={{ margin: 0, color: '#991b1b' }}>Danger Zone</h3>
        </div>
        <p style={{ color: '#7f1d1d', fontSize: '0.875rem', margin: '0 0 1rem', maxWidth: '640px' }}>
          Permanently deletes every booking, every payment transaction and the guest accounts
          created by them, then releases all booked rooms back to available. Your rooms, prices,
          images and admin account are untouched. This cannot be undone.
        </p>

        {!clearOpen ? (
          <button
            onClick={() => setClearOpen(true)}
            style={{
              background: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px',
              padding: '0.6rem 1.2rem', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}
          >
            <Trash2 size={16} /> Clear All Records
          </button>
        ) : (
          <div style={{ background: '#fff', border: '1px solid #fecaca', borderRadius: '10px', padding: '1rem', maxWidth: '460px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#7f1d1d', marginBottom: '0.5rem' }}>
              1. Type <strong>CLEAR</strong> to confirm deleting {bookings.length} booking(s) and {payments.length} transaction(s):
            </label>
            <input
              value={clearPhrase}
              onChange={e => setClearPhrase(e.target.value)}
              placeholder="CLEAR"
              disabled={clearing}
              style={{ width: '100%', padding: '0.6rem 0.75rem', border: `1px solid ${clearPhrase && !phraseOk ? '#fca5a5' : '#e2e8f0'}`, borderRadius: '8px', outline: 'none', fontSize: '0.9rem', marginBottom: '0.9rem' }}
            />

            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#7f1d1d', marginBottom: '0.5rem' }}>
              2. Enter the admin passcode:
            </label>
            <input
              value={clearPasscode}
              onChange={e => setClearPasscode(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && canClear) handleClear(); }}
              type="password"
              inputMode="numeric"
              autoComplete="off"
              placeholder="Passcode"
              disabled={clearing}
              style={{ width: '100%', padding: '0.6rem 0.75rem', border: `1px solid ${clearPasscode && !passcodeOk ? '#fca5a5' : '#e2e8f0'}`, borderRadius: '8px', outline: 'none', fontSize: '0.9rem', marginBottom: '0.4rem', letterSpacing: '3px' }}
            />
            {clearPasscode && !passcodeOk && (
              <div style={{ fontSize: '0.78rem', color: '#dc2626', marginBottom: '0.5rem' }}>Incorrect passcode.</div>
            )}

            {clearProgress && (
              <div style={{ fontSize: '0.8rem', color: '#7f1d1d', margin: '0.5rem 0 0.75rem' }}>
                Deleting {clearProgress.done} of {clearProgress.total}...
                <div style={{ height: '6px', background: '#fee2e2', borderRadius: '999px', marginTop: '0.35rem', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${clearProgress.total ? (clearProgress.done / clearProgress.total) * 100 : 0}%`,
                    background: '#dc2626', transition: 'width 0.2s ease'
                  }} />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.75rem' }}>
              <button
                onClick={resetClearForm}
                disabled={clearing}
                style={{ flex: 1, padding: '0.6rem', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc', color: '#64748b', fontWeight: 600, cursor: clearing ? 'not-allowed' : 'pointer', fontSize: '0.85rem' }}
              >
                Cancel
              </button>
              <button
                onClick={handleClear}
                disabled={!canClear}
                style={{
                  flex: 2, padding: '0.6rem', border: 'none', borderRadius: '8px',
                  background: canClear ? '#dc2626' : '#fca5a5',
                  color: '#fff', fontWeight: 700,
                  cursor: canClear ? 'pointer' : 'not-allowed',
                  fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                }}
              >
                {clearing ? <><Loader2 size={16} className="spin" /> Clearing...</> : <><Trash2 size={16} /> Delete Everything</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
