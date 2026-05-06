import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { Search, CheckCircle, LogOut, XCircle } from 'lucide-react';

const AdminBookings = () => {
  const { bookings, rooms, updateBookingStatus } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBookings = bookings.filter(b => {
    const room = rooms.find(r => r.id === b.roomId);
    const guestName = b.guestName || 'N/A';
    const guestEmail = b.guestEmail || 'N/A';
    const roomName = room?.name || 'N/A';
    const bookingId = b.id || '';

    return guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
           roomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           guestEmail.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed': return 'badge-success';
      case 'checked-in': return 'badge-info';
      case 'checked-out': return 'badge-muted';
      case 'cancelled': return 'badge-danger';
      default: return 'badge-warning';
    }
  };

  return (
    <div className="admin-table-container">
      <div style={{padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem'}}>
        <h3 style={{margin: 0, color: 'var(--color-primary-navy)'}}>Booking Management</h3>
        <div style={{position: 'relative', width: '300px'}}>
          <Search size={18} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8'}} />
          <input 
            type="text" 
            placeholder="Search by name, ID or room..." 
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
              <th>Receipt</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length > 0 ? (
              filteredBookings.slice().reverse().map(booking => {
                const room = rooms.find(r => r.id === booking.roomId);
                return (
                  <tr key={booking.id}>
                    <td style={{fontSize: '0.8rem', color: '#64748b'}}>#{booking.id}</td>
                    <td>
                      <div style={{fontWeight: 500}}>{booking.guestName || 'Guest'}</div>
                      <div style={{fontSize: '0.8rem', color: '#64748b'}}>{booking.guestEmail}</div>
                    </td>
                    <td>{room?.name}</td>
                    <td>
                      <div style={{fontSize: '0.9rem'}}>{new Date(booking.checkIn).toLocaleDateString()} -</div>
                      <div style={{fontSize: '0.9rem'}}>{new Date(booking.checkOut).toLocaleDateString()}</div>
                    </td>
                    <td style={{fontWeight: 600}}>₦{(booking.totalAmount || booking.totalPrice || 0).toLocaleString()}</td>
                    <td>
                      {booking.receipt ? (
                        <img 
                          src="https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&q=80&w=200" 
                          alt="Receipt" 
                          style={{ width: '50px', height: '50px', borderRadius: '4px', cursor: 'pointer', objectFit: 'cover' }}
                          onClick={() => window.open('https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&q=80&w=800', '_blank')}
                        />
                      ) : '-'}
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                        {booking.status === 'pending' && (
                          <>
                            <button className="btn btn-primary" style={{padding: '0.4rem 0.8rem', fontSize: '0.75rem', background: '#10b981', borderColor: '#10b981'}} onClick={() => updateBookingStatus(booking.id, 'confirmed')}>Approve</button>
                            <button className="btn btn-outline" style={{padding: '0.4rem 0.8rem', fontSize: '0.75rem', color: '#ef4444', borderColor: '#ef4444'}} onClick={() => updateBookingStatus(booking.id, 'cancelled')}>Reject</button>
                          </>
                        )}
                        {booking.status === 'confirmed' && (
                          <button className="btn btn-primary" style={{padding: '0.4rem 0.8rem', fontSize: '0.75rem'}} onClick={() => updateBookingStatus(booking.id, 'checked-in')}>Check In</button>
                        )}
                        {booking.status === 'checked-in' && (
                          <button className="btn btn-outline" style={{padding: '0.4rem 0.8rem', fontSize: '0.75rem'}} onClick={() => updateBookingStatus(booking.id, 'checked-out')}>Check Out</button>
                        )}
                        {booking.receipt && (
                           <button className="btn btn-outline" style={{padding: '0.4rem 0.8rem', fontSize: '0.75rem'}} onClick={() => window.open('https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&q=80&w=800', '_blank')}>Receipt</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" style={{textAlign: 'center', padding: '3rem', color: '#94a3b8'}}>No bookings found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminBookings;
