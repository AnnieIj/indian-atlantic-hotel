import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { Search, CheckCircle, LogOut, XCircle, Eye } from 'lucide-react';
import { subDays, startOfWeek, endOfWeek, subWeeks, startOfMonth, endOfMonth, subMonths, isWithinInterval, parseISO, format, isSameMonth } from 'date-fns';

const AdminBookings = () => {
  const { bookings, rooms, updateBookingStatus, fetchBookings, payments, fetchPayments } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [dateFilter, setDateFilter] = useState('This Month');
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedDateDetails, setSelectedDateDetails] = useState(null);

  useEffect(() => {
    fetchBookings();
    if (fetchPayments) {
      fetchPayments();
    }
  }, []);

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

  // --- Analytics Calculations ---
  const successfulPayments = (payments || []).filter(p => p.status === 'success');

  // Filter payments by date range
  const getFilteredPayments = () => {
    const now = new Date();
    let start, end;
    
    switch (dateFilter) {
      case 'Today':
        start = new Date(now.setHours(0,0,0,0));
        end = new Date(now.setHours(23,59,59,999));
        break;
      case 'Yesterday':
        const yesterday = subDays(new Date(), 1);
        start = new Date(yesterday.setHours(0,0,0,0));
        end = new Date(yesterday.setHours(23,59,59,999));
        break;
      case 'Last 7 Days':
        start = new Date(subDays(new Date(), 7).setHours(0,0,0,0));
        end = new Date();
        break;
      case 'This Week':
        start = startOfWeek(new Date());
        end = endOfWeek(new Date());
        break;
      case 'Last Week':
        start = startOfWeek(subWeeks(new Date(), 1));
        end = endOfWeek(subWeeks(new Date(), 1));
        break;
      case 'This Month':
        start = startOfMonth(new Date());
        end = endOfMonth(new Date());
        break;
      case 'Last Month':
        start = startOfMonth(subMonths(new Date(), 1));
        end = endOfMonth(subMonths(new Date(), 1));
        break;
      case 'Custom Date':
        // For simplicity, default Custom Date to This Month until explicitly built if needed.
        start = startOfMonth(new Date());
        end = endOfMonth(new Date());
        break;
      default:
        start = startOfMonth(new Date());
        end = endOfMonth(new Date());
    }
    
    return successfulPayments.filter(p => {
      const pDate = new Date(p.createdAt || p.created_at);
      if (isNaN(pDate.getTime())) return false;
      return isWithinInterval(pDate, { start, end });
    });
  };

  const filteredAnalyticsPayments = getFilteredPayments();

  // Group by date formatted as 'MMM dd, yyyy'
  const dailyActivityMap = {};
  filteredAnalyticsPayments.forEach(p => {
    const pDate = new Date(p.createdAt || p.created_at);
    if (isNaN(pDate.getTime())) return;
    const dateStr = format(pDate, 'MMM dd, yyyy');
    
    if (!dailyActivityMap[dateStr]) {
      dailyActivityMap[dateStr] = {
        date: dateStr,
        paymentsCount: 0,
        amount: 0,
        customerIds: new Set(),
        transactions: []
      };
    }
    
    dailyActivityMap[dateStr].paymentsCount += 1;
    dailyActivityMap[dateStr].amount += Number(p.amount || 0);
    dailyActivityMap[dateStr].customerIds.add(p.bookingId || p.guestEmail || p.id);
    
    const booking = (bookings || []).find(b => b.id === p.bookingId);
    dailyActivityMap[dateStr].transactions.push({
      ...p,
      guestName: booking?.guestName || 'Unknown',
      paymentTime: format(pDate, 'hh:mm a')
    });
  });

  const dailyActivityList = Object.values(dailyActivityMap).sort((a, b) => new Date(b.date) - new Date(a.date));

  // --- Monthly Summary Calculation ---
  const monthlyPayments = successfulPayments.filter(p => {
      const pDate = new Date(p.createdAt || p.created_at);
      if (isNaN(pDate.getTime())) return false;
      return isSameMonth(pDate, selectedMonth);
  });
  
  const monthlyCustomers = new Set(monthlyPayments.map(p => p.bookingId || p.guestEmail || p.id)).size;
  const monthlyTotalAmount = monthlyPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const monthlyTotalPayments = monthlyPayments.length;
  
  const monthlyActivityMap = {};
  monthlyPayments.forEach(p => {
    const pDate = new Date(p.createdAt || p.created_at);
    if (isNaN(pDate.getTime())) return;
    const dateStr = format(pDate, 'MMM d');
    
    if (!monthlyActivityMap[dateStr]) {
      monthlyActivityMap[dateStr] = {
        dateStr,
        amount: 0,
        customers: new Set(),
        timestamp: pDate.getTime()
      };
    }
    monthlyActivityMap[dateStr].amount += Number(p.amount || 0);
    monthlyActivityMap[dateStr].customers.add(p.bookingId || p.guestEmail || p.id);
  });
  
  const monthlyActivityList = Object.values(monthlyActivityMap).sort((a, b) => a.timestamp - b.timestamp);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* ===== ANALYTICS SECTION ===== */}
      <div>
        {/* Filters Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['Today', 'Yesterday', 'Last 7 Days', 'This Week', 'Last Week', 'This Month', 'Last Month'].map(f => (
              <button 
                key={f}
                onClick={() => setDateFilter(f)}
                style={{
                  padding: '0.6rem 1.2rem', 
                  borderRadius: '25px', 
                  border: dateFilter === f ? 'none' : '1px solid #cbd5e1', 
                  background: dateFilter === f ? 'var(--color-primary-navy)' : '#fff',
                  color: dateFilter === f ? '#fff' : '#475569',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  transition: 'all 0.2s'
                }}
              >
                {f}
              </button>
            ))}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
             <span style={{ fontWeight: 600, color: '#1e293b' }}>Month</span>
             <input 
               type="month" 
               value={format(selectedMonth, 'yyyy-MM')}
               onChange={(e) => {
                 if (e.target.value) {
                   setSelectedMonth(parseISO(e.target.value + '-01'));
                 }
               }}
               style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontFamily: 'inherit', fontWeight: 500 }}
             />
          </div>
        </div>

        {/* Daily Activity Table */}
        <div className="admin-table-container">
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
            <h3 style={{ margin: 0, color: '#1e293b' }}>Daily Payment Activity ({dateFilter})</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Customers Paid</th>
                  <th style={{ textAlign: 'right' }}>Payments</th>
                  <th style={{ textAlign: 'right' }}>Amount Received</th>
                  <th style={{ textAlign: 'center' }}>View</th>
                </tr>
              </thead>
              <tbody>
                {dailyActivityList.length > 0 ? (
                  dailyActivityList.map(activity => (
                    <tr key={activity.date}>
                      <td style={{ fontWeight: 600, color: '#334155' }}>{activity.date}</td>
                      <td style={{ textAlign: 'right', fontWeight: 500 }}>{activity.customerIds.size}</td>
                      <td style={{ textAlign: 'right', fontWeight: 500 }}>{activity.paymentsCount}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#10b981' }}>₦{activity.amount.toLocaleString()}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          onClick={() => setSelectedDateDetails(activity)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary-navy)', padding: '0.4rem', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                          title="View Details"
                        >
                          <Eye size={20} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', fontSize: '1rem' }}>
                      <strong>0 payments — ₦0</strong>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ===== MONTHLY SUMMARY ===== */}
      <div className="admin-table-container" style={{ padding: '2rem', background: '#fff' }}>
        <h3 style={{ margin: '0 0 1.5rem 0', color: '#1e293b', fontSize: '1.5rem' }}>{format(selectedMonth, 'MMMM yyyy')} Summary</h3>
        
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
          <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', flex: 1, minWidth: '200px' }}>
            <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Customers Who Paid</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a' }}>{monthlyCustomers}</div>
          </div>
          <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', flex: 1, minWidth: '200px' }}>
            <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Payments</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a' }}>{monthlyTotalPayments}</div>
          </div>
          <div style={{ background: '#f0fdf4', padding: '1.5rem', borderRadius: '12px', border: '1px solid #bbf7d0', flex: 2, minWidth: '250px' }}>
            <div style={{ color: '#166534', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Amount Received</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#15803d' }}>₦{monthlyTotalAmount.toLocaleString()}</div>
          </div>
        </div>

        <div>
          <h4 style={{ margin: '0 0 1.25rem 0', color: '#334155', fontSize: '1.1rem' }}>Daily activity for {format(selectedMonth, 'MMMM yyyy')}</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
             {monthlyActivityList.length > 0 ? (
               monthlyActivityList.map(item => (
                 <div key={item.dateStr} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                   <div style={{ fontWeight: 600, color: '#475569', width: '100px' }}>{item.dateStr}</div>
                   <div style={{ color: '#94a3b8' }}>→</div>
                   <div style={{ fontWeight: 700, color: '#1e293b' }}>₦{item.amount.toLocaleString()}</div>
                   <div style={{ color: '#64748b', fontSize: '0.85rem', marginLeft: 'auto' }}>{item.customers.size} customer{item.customers.size !== 1 ? 's' : ''}</div>
                 </div>
               ))
             ) : (
               <div style={{ color: '#94a3b8', fontStyle: 'italic', padding: '1rem 0' }}>No payments recorded in this month.</div>
             )}
          </div>
        </div>
      </div>

      {/* ===== ORIGINAL BOOKING MANAGEMENT ===== */}
      <div className="admin-table-container">
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ margin: 0, color: 'var(--color-primary-navy)' }}>Booking Records</h3>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Search by name, ID or room..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', border: '1px solid #e2e8f0', borderRadius: '25px', outline: 'none' }}
            />
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
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
                filteredBookings.slice().reverse().map(booking => {
                  const room = rooms.find(r => r.id === booking.roomId);
                  const receiptUrl = typeof booking.receipt === 'string' ? booking.receipt : booking.receipt?.url;
                  
                  return (
                    <tr key={booking.id}>
                      <td style={{ fontSize: '0.8rem', color: '#64748b' }}>#{booking.id.substring(0, 8)}</td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{booking.guestName || 'Guest'}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{booking.guestEmail}</div>
                      </td>
                      <td>{room?.name || booking.roomId}</td>
                      <td>
                        <div style={{ fontSize: '0.9rem' }}>{new Date(booking.checkIn).toLocaleDateString()} -</div>
                        <div style={{ fontSize: '0.9rem' }}>{new Date(booking.checkOut).toLocaleDateString()}</div>
                      </td>
                      <td style={{ fontWeight: 600 }}>₦{(booking.totalAmount || booking.totalPrice || 0).toLocaleString()}</td>
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
                          <img 
                            src={receiptUrl} 
                            alt="Receipt" 
                            style={{ width: '50px', height: '50px', borderRadius: '4px', cursor: 'pointer', objectFit: 'cover' }}
                            onClick={() => window.open(receiptUrl, '_blank')}
                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                          />
                        ) : '-'}
                        {receiptUrl && <a href={receiptUrl} target="_blank" rel="noreferrer" style={{ display: 'none', fontSize: '0.75rem' }}>View File</a>}
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadge(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {booking.status === 'pending' && (
                            <>
                              <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', background: '#10b981', borderColor: '#10b981' }} onClick={() => updateBookingStatus(booking.id, 'confirmed')}>Approve</button>
                              <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', color: '#ef4444', borderColor: '#ef4444' }} onClick={() => updateBookingStatus(booking.id, 'cancelled')}>Reject</button>
                            </>
                          )}
                          {booking.status === 'confirmed' && (
                            <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={() => updateBookingStatus(booking.id, 'checked-in')}>Check In</button>
                          )}
                          {booking.status === 'checked-in' && (
                            <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={() => updateBookingStatus(booking.id, 'checked-out')}>Check Out</button>
                          )}
                          {receiptUrl && (
                             <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={() => window.open(receiptUrl, '_blank')}>Receipt</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No bookings found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== DATE DETAILS MODAL ===== */}
      {selectedDateDetails && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.5rem' }}>Payments — {selectedDateDetails.date}</h2>
              <button 
                onClick={() => setSelectedDateDetails(null)} 
                style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b', padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <XCircle size={24} />
              </button>
            </div>
            
            <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
              <p style={{ fontWeight: 700, color: '#475569', margin: '0 0 1.5rem 0', fontSize: '1.1rem' }}>
                {selectedDateDetails.customerIds.size} customer{selectedDateDetails.customerIds.size !== 1 ? 's' : ''} made payments
              </p>
              
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                <table className="admin-table" style={{ width: '100%', margin: 0, border: 'none' }}>
                  <thead style={{ background: '#f8fafc' }}>
                    <tr>
                      <th style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Customer</th>
                      <th style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Booking ID</th>
                      <th style={{ textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>Amount</th>
                      <th style={{ textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>Payment Status</th>
                      <th style={{ textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>Payment Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDateDetails.transactions.map((tx, idx) => (
                      <tr key={idx} style={{ borderBottom: idx !== selectedDateDetails.transactions.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                        <td style={{ fontWeight: 600, color: '#1e293b' }}>{tx.guestName}</td>
                        <td style={{ color: '#64748b', fontFamily: 'monospace' }}>{tx.bookingId?.substring(0,8) || 'N/A'}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>₦{Number(tx.amount || 0).toLocaleString()}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ background: '#dcfce7', color: '#166534', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>Paid</span>
                        </td>
                        <td style={{ textAlign: 'right', color: '#64748b', fontSize: '0.9rem' }}>{tx.paymentTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ padding: '1.5rem 2rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, color: '#475569', fontSize: '1.1rem' }}>{selectedDateDetails.customerIds.size} Customers</div>
              <div style={{ fontWeight: 800, fontSize: '1.5rem', color: '#10b981' }}>Total Received: ₦{selectedDateDetails.amount.toLocaleString()}</div>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminBookings;

