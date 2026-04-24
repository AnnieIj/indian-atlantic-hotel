import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { Calendar, DollarSign, BedDouble, AlertCircle } from 'lucide-react';

const AdminDashboard = () => {
  const { bookings, rooms } = useContext(AppContext);

  // Calculate KPIs
  const totalBookings = bookings.length;
  const totalRevenue = bookings.filter(b => b.paymentStatus === 'success').reduce((acc, curr) => acc + curr.totalAmount, 0);
  const availableRooms = rooms.filter(r => r.status === 'available').length;
  const pendingPayments = bookings.filter(b => b.paymentStatus === 'pending').length;

  return (
    <div>
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
            <p>{availableRooms}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><AlertCircle /></div>
          <div className="stat-details">
            <h4>Pending Payments</h4>
            <p>{pendingPayments}</p>
          </div>
        </div>
      </div>

      <div className="admin-table-container">
        <div style={{padding: '1.5rem', borderBottom: '1px solid #e2e8f0'}}>
          <h3 style={{margin: 0, color: 'var(--color-primary-navy)'}}>Recent Bookings</h3>
        </div>
        <div style={{overflowX: 'auto'}}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Room</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {bookings.slice().reverse().slice(0, 5).map(booking => {
                const room = rooms.find(r => r.id === booking.roomId);
                return (
                  <tr key={booking.id}>
                    <td>{booking.id}</td>
                    <td>{room?.name}</td>
                    <td>{booking.checkIn}</td>
                    <td>{booking.checkOut}</td>
                    <td>
                      <span className={`badge ${booking.status === 'confirmed' ? 'badge-success' : booking.status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${booking.paymentStatus === 'success' ? 'badge-success' : 'badge-warning'}`}>
                        {booking.paymentStatus}
                      </span>
                    </td>
                    <td>₦{booking.totalAmount.toLocaleString()}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
