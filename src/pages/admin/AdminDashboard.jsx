import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { Calendar, DollarSign, BedDouble, AlertCircle, Clock } from 'lucide-react';

const AdminDashboard = () => {
  const { bookings, rooms, payments } = useContext(AppContext);

  const totalBookings = bookings.length;

  const totalRevenue = bookings.reduce((acc, b) => acc + (b.totalAmount || b.totalPrice || 0), 0);

  const availableRooms = rooms.filter(r => r.status === 'available').length;

  const pendingBookings = bookings.filter(b => b.status === 'pending').length;

  const recentBookings = bookings.slice().reverse().slice(0, 10);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed': return { bg: '#d1fae5', color: '#065f46' };
      case 'checked-in': return { bg: '#dbeafe', color: '#1e40af' };
      case 'checked-out': return { bg: '#f1f5f9', color: '#475569' };
      case 'cancelled': return { bg: '#fee2e2', color: '#991b1b' };
      default: return { bg: '#fef3c7', color: '#92400e' }; // pending
    }
  };

  return (
    <div>
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
          <div className="stat-icon gold"><DollarSign /></div>
          <div className="stat-details">
            <h4>Total Revenue</h4>
            <p>₦{totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green"><BedDouble /></div>
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
                  const room = rooms.find(r => r.id === booking.roomId);
                  const badge = getStatusBadge(booking.status);
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
                      <td style={{ fontWeight: 600 }}>₦{(booking.totalAmount || booking.totalPrice || 0).toLocaleString()}</td>
                      <td>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: badge.bg,
                          color: badge.color,
                          textTransform: 'capitalize'
                        }}>
                          {booking.status || 'pending'}
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
    </div>
  );
};

export default AdminDashboard;