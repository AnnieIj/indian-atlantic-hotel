import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { CreditCard, CheckCircle, XCircle, Eye, AlertTriangle, Clock, FileText, Search, RefreshCw, Loader2 } from 'lucide-react';
import { paymentStatusLabel, receiptUrlOf, isBookingClosed, naira } from '../../utils/status';
import { isPlaceholderEmail } from '../../utils/guest';
import { subDays, startOfWeek, endOfWeek, subWeeks, startOfMonth, endOfMonth, subMonths, isWithinInterval, parseISO, format, isSameMonth, startOfDay, endOfDay } from 'date-fns';

const AdminPayments = () => {
  const { payments, bookings, confirmPayment, fetchPayments, fetchBookings, paymentsLoading, paymentsError } = useContext(AppContext);
  const [actionPayment, setActionPayment] = useState(null);
  const [actionType, setActionType] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [toast, setToast] = useState(null);

  // Analytics state
  const [dateFilter, setDateFilter] = useState('This Month');
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedDateDetails, setSelectedDateDetails] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [bulkRunning, setBulkRunning] = useState(false);

  useEffect(() => {
    fetchPayments();
    fetchBookings();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefresh = () => {
    fetchPayments();
    fetchBookings();
  };

  // Every pending transaction is actionable, with or without an uploaded
  // receipt. This used to also require `p.receipt` - a field the API never
  // returns (it sends `receiptUrl`) - so the review queue was always empty and
  // approvals had to be hunted down in the log table below.
  const pendingPayments = payments.filter(p => p.status === 'pending');

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const openAction = (payment, type) => {
    setActionPayment(payment);
    setActionType(type);
    setAdminNotes('');
  };

  const handleConfirm = async () => {
    if (!actionPayment || submitting) return;
    const newStatus = actionType === 'approve' ? 'success' : 'failed';
    const shortId = actionPayment.id.substring(0, 8);

    setSubmitting(true);
    try {
      await confirmPayment(actionPayment.id, newStatus, adminNotes);
      showToast(
        actionType === 'approve' ? 'success' : 'error',
        actionType === 'approve'
          ? `Payment #${shortId} approved - ${naira(actionPayment.amount)} cleared from outstanding.`
          : `Payment #${shortId} rejected. Booking cancelled and room released.`
      );
      setActionPayment(null);
      setAdminNotes('');
    } catch (err) {
      // The dialog stays open on failure: the row really is still pending, and
      // the admin needs the reason rather than a "saved on this device" toast.
      showToast('error', err?.response?.data?.message || err.message || 'Could not update the payment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Clears the whole pending queue in one pass, counting failures instead of
  // silently leaving rows behind.
  const handleApproveAll = async () => {
    if (bulkRunning || pendingPayments.length === 0) return;
    const queue = [...pendingPayments];
    const total = queue.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    if (!window.confirm(`Approve all ${queue.length} pending transaction(s) totalling ${naira(total)}?`)) return;

    setBulkRunning(true);
    let ok = 0;
    const failures = [];
    for (const p of queue) {
      try {
        await confirmPayment(p.id, 'success', 'Bulk approved from admin dashboard');
        ok += 1;
      } catch (err) {
        failures.push(`#${p.id.substring(0, 8)}: ${err?.response?.data?.message || err.message}`);
      }
    }
    setBulkRunning(false);
    showToast(
      failures.length ? 'error' : 'success',
      failures.length
        ? `${ok} approved, ${failures.length} failed - ${failures[0]}`
        : `${ok} transaction(s) approved. Outstanding reduced by ${naira(total)}.`
    );
  };

  const handleCancel = () => {
    setActionPayment(null);
    setAdminNotes('');
  };

  const statusBadge = (status) => {
    const map = {
      success: { cls: 'badge-success', icon: <CheckCircle size={12} />, label: paymentStatusLabel('success') },
      failed: { cls: 'badge-danger', icon: <XCircle size={12} />, label: paymentStatusLabel('failed') },
      pending: { cls: 'badge-warning', icon: <Clock size={12} />, label: 'Pending' },
      refunded: { cls: 'badge-muted', icon: <XCircle size={12} />, label: 'Refunded' },
      completed: { cls: 'badge-success', icon: <CheckCircle size={12} />, label: 'Approved' },
      paid: { cls: 'badge-success', icon: <CheckCircle size={12} />, label: 'Approved' },
      cancelled: { cls: 'badge-danger', icon: <XCircle size={12} />, label: 'Cancelled' },
    };
    const s = map[status] || { cls: 'badge-warning', icon: <Clock size={12} />, label: status || 'Pending' };
    return (
      <span className={`badge ${s.cls}`} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', width: 'fit-content' }}>
        {s.icon} {s.label}
      </span>
    );
  };

  // Reads `receiptUrl` (what the API actually sends) and still tolerates the
  // older `receipt` string/object shape.
  const getReceiptUrl = (payment) => receiptUrlOf(payment);

  // --- ANALYTICS CALCULATIONS ---
  // 1. Core effective arrays (payments already have paymentOverrides applied by AppContext)
  //    isSuccessful covers 'success', 'completed', 'paid' to handle any backend status variation.
  const isSuccessStatus = (s) => s === 'success' || s === 'completed' || s === 'paid';
  const successfulPayments = payments.filter(p => isSuccessStatus(p.status));
  const pendingAllPayments = payments.filter(p => p.status === 'pending');

  // Helper for unique customer identity.
  // Priority: guestEmail from booking > guestEmail on payment > booking.id as last resort.
  // We deliberately avoid guestName because different people can share names.
  // We deliberately avoid 'unknown-customer' string because all email-less guests
  // would be counted as ONE customer, which is wrong.
  const getCustomerId = (p) => {
    const b = bookings.find(bk => bk.id === p.bookingId);
    const email = b?.guestEmail || p.guestEmail;
    // Placeholder addresses are minted per booking, so they identify a booking
    // rather than a person - fall through to the booking id for those.
    if (email && email.trim() && !isPlaceholderEmail(email)) return email.trim().toLowerCase();
    // Fall back to the booking ID (unique per booking, not per customer, but
    // better than grouping all email-less guests together)
    return p.bookingId || p.id;
  };

  // Helper: get canonical booking amount (backend uses both totalAmount and totalPrice)
  const getBookingTotal = (booking) => Number(booking.totalAmount || booking.totalPrice || 0);

  // 2. Top Cards & Outstanding Calculation
  // FIX: Do NOT mutate a shared `now` object. Use separate `new Date()` instances.
  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());

  const getAmountForInterval = (start, end) => {
    return successfulPayments
      .filter(p => {
        const d = new Date(p.createdAt || p.created_at);
        if (isNaN(d.getTime())) return false;
        return isWithinInterval(d, { start, end });
      })
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);
  };

  const todayAmount = getAmountForInterval(todayStart, todayEnd);
  
  const todayCustomers = new Set(
    payments
      .filter(p => {
        const d = new Date(p.createdAt || p.created_at);
        if (isNaN(d.getTime())) return false;
        return isWithinInterval(d, { start: todayStart, end: todayEnd });
      })
      .map(getCustomerId)
  ).size;

  const weekStart = startOfWeek(new Date());
  const weekEnd = endOfWeek(new Date());
  const weekAmount = getAmountForInterval(weekStart, weekEnd);

  const thisMonthStart = startOfMonth(new Date());
  const thisMonthEnd = endOfMonth(new Date());
  const thisMonthAmount = getAmountForInterval(thisMonthStart, thisMonthEnd);

  // OUTSTANDING: Per-booking, max(bookingTotal - paidForBooking, 0). Then sum.
  // This prevents double-counting when a booking has multiple payment records.
  // Cancelled and checked-out bookings are settled - counting their totals kept
  // money on the Outstanding card that nobody actually owes.
  let calculatedOutstanding = 0;
  (bookings || []).filter(b => !isBookingClosed(b.status)).forEach(booking => {
    const paidForBooking = successfulPayments
      .filter(p => p.bookingId === booking.id)
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const balance = Math.max(getBookingTotal(booking) - paidForBooking, 0);
    calculatedOutstanding += balance;
  });
  const outstandingAmount = calculatedOutstanding;

  // 3. Daily Activity Chart (based on date filter)
  const getFilteredPayments = () => {
    let start, end;
    switch (dateFilter) {
      case 'Today': start = todayStart; end = todayEnd; break;
      case 'Yesterday': 
        start = startOfDay(subDays(new Date(), 1));
        end = endOfDay(subDays(new Date(), 1));
        break;
      case 'Last 7 Days': start = startOfDay(subDays(new Date(), 7)); end = todayEnd; break;
      case 'This Week': start = weekStart; end = weekEnd; break;
      case 'Last Week': start = startOfWeek(subWeeks(new Date(), 1)); end = endOfWeek(subWeeks(new Date(), 1)); break;
      case 'This Month': start = thisMonthStart; end = thisMonthEnd; break;
      case 'Last Month': start = startOfMonth(subMonths(new Date(), 1)); end = endOfMonth(subMonths(new Date(), 1)); break;
      default: start = thisMonthStart; end = thisMonthEnd;
    }
    // Return ALL payments (all statuses) in the interval to accurately count customers and transactions
    return payments.filter(p => {
      const pDate = new Date(p.createdAt || p.created_at);
      if (isNaN(pDate.getTime())) return false;
      return isWithinInterval(pDate, { start, end });
    });
  };

  const filteredAnalyticsPayments = getFilteredPayments();

  const dailyActivityMap = {};
  filteredAnalyticsPayments.forEach(p => {
    const pDate = new Date(p.createdAt || p.created_at);
    if (isNaN(pDate.getTime())) return;
    const dateStr = format(pDate, 'MMM dd, yyyy');
    if (!dailyActivityMap[dateStr]) {
      dailyActivityMap[dateStr] = { 
        date: dateStr, 
        transactionsCount: 0, 
        successCount: 0,
        pendingCount: 0,
        revenue: 0, 
        customerIds: new Set(), 
        transactions: [] 
      };
    }
    
    dailyActivityMap[dateStr].transactionsCount += 1;
    dailyActivityMap[dateStr].customerIds.add(getCustomerId(p));
    
    if (isSuccessStatus(p.status)) {
      dailyActivityMap[dateStr].successCount += 1;
      dailyActivityMap[dateStr].revenue += Number(p.amount || 0);
    } else if (p.status === 'pending') {
      dailyActivityMap[dateStr].pendingCount += 1;
    }
    
    const booking = (bookings || []).find(b => b.id === p.bookingId);
    dailyActivityMap[dateStr].transactions.push({
      ...p,
      guestName: booking?.guestName || 'Unknown',
      roomName: booking?.roomName || booking?.roomId || 'N/A',
      paymentTime: format(pDate, 'hh:mm a')
    });
  });

  const dailyActivityList = Object.values(dailyActivityMap).sort((a, b) => new Date(b.date) - new Date(a.date));

  // 4. Monthly summary — includes all statuses, separates revenue
  const monthlyPayments = payments.filter(p => {
    const pDate = new Date(p.createdAt || p.created_at);
    if (isNaN(pDate.getTime())) return false;
    return isSameMonth(pDate, selectedMonth);
  });
  
  const monthlyCustomers = new Set(monthlyPayments.map(getCustomerId)).size;
  const monthlyTotalTransactions = monthlyPayments.length;
  const monthlyTotalRevenue = monthlyPayments
    .filter(p => isSuccessStatus(p.status))
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);
  
  const monthlyActivityMap = {};
  monthlyPayments.forEach(p => {
    const pDate = new Date(p.createdAt || p.created_at);
    if (isNaN(pDate.getTime())) return;
    const dateStr = format(pDate, 'MMM d');
    if (!monthlyActivityMap[dateStr]) {
      monthlyActivityMap[dateStr] = { dateStr, revenue: 0, transactionsCount: 0, customers: new Set(), timestamp: pDate.getTime() };
    }
    
    monthlyActivityMap[dateStr].transactionsCount += 1;
    monthlyActivityMap[dateStr].customers.add(getCustomerId(p));
    if (isSuccessStatus(p.status)) {
      monthlyActivityMap[dateStr].revenue += Number(p.amount || 0);
    }
  });
  
  const monthlyActivityList = Object.values(monthlyActivityMap).sort((a, b) => a.timestamp - b.timestamp);

  // 5. Search History — all payments reversed (newest first)
  const allPayments = payments.slice().reverse();
  const searchedPayments = allPayments.filter(p => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    const booking = bookings.find(b => b.id === p.bookingId);
    const gName = (booking?.guestName || '').toLowerCase();
    const bId = (p.bookingId || '').toLowerCase();
    const pId = (p.id || '').toLowerCase();
    return gName.includes(s) || bId.includes(s) || pId.includes(s);
  });

  // --- RENDER ---

  // Loading state
  if (paymentsLoading && payments.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '1rem' }}>
        <RefreshCw size={36} style={{ color: 'var(--color-primary-navy)', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#64748b', fontWeight: 600 }}>Loading payment data...</p>
      </div>
    );
  }

  // Error state
  if (paymentsError && payments.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '1rem', textAlign: 'center', padding: '2rem' }}>
        <AlertTriangle size={48} style={{ color: '#ef4444' }} />
        <h3 style={{ color: '#1e293b', margin: 0 }}>Unable to Load Payment Data</h3>
        <p style={{ color: '#64748b', maxWidth: '400px' }}>{paymentsError}</p>
        <button
          onClick={handleRefresh}
          style={{ background: 'var(--color-primary-navy)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.75rem 1.5rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative' }}>

      {/* ===== TOAST ===== */}
      {toast && (
        <div style={{
          position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999,
          background: toast.type === 'success' ? '#10b981' : toast.type === 'warning' ? '#f59e0b' : '#ef4444',
          color: '#fff', padding: '1rem 1.5rem', borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          fontWeight: 600, fontSize: '0.9rem', maxWidth: '400px'
        }}>
          {toast.type === 'success' ? <CheckCircle size={20} /> : toast.type === 'warning' ? <AlertTriangle size={20} /> : <XCircle size={20} />}
          {toast.msg}
        </div>
      )}

      {/* ===== PAGE HEADER WITH REFRESH ===== */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ margin: 0, color: 'var(--color-primary-navy)', fontSize: '1.5rem' }}>Payments &amp; Revenue</h2>
        <button
          onClick={handleRefresh}
          disabled={paymentsLoading}
          style={{ background: 'var(--color-primary-navy)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.6rem 1.2rem', fontWeight: 600, cursor: paymentsLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: paymentsLoading ? 0.7 : 1 }}
        >
          <RefreshCw size={16} style={{ animation: paymentsLoading ? 'spin 1s linear infinite' : 'none' }} />
          {paymentsLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Soft error banner when data already loaded but refresh fails */}
      {paymentsError && payments.length > 0 && (
        <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '10px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#92400e' }}>
          <AlertTriangle size={16} />
          <span>Data may be stale: {paymentsError}</span>
          <button onClick={handleRefresh} style={{ marginLeft: 'auto', background: 'none', border: '1px solid #f59e0b', borderRadius: '6px', padding: '0.25rem 0.75rem', color: '#92400e', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}>Retry</button>
        </div>
      )}

      {/* ===== TOP SUMMARY CARDS ===== */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Today's Revenue</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b' }}>₦{todayAmount.toLocaleString()}</div>
        </div>
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Today's Customers</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b' }}>{todayCustomers}</div>
        </div>
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total Pending</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b' }}>{pendingAllPayments.length} <span style={{fontSize:'1rem', fontWeight: 600, color: '#94a3b8'}}>tx</span></div>
        </div>
        <div style={{ background: '#fffbf1', padding: '1.5rem', borderRadius: '12px', border: '1px solid #fde68a', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ color: '#b45309', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total Outstanding</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#92400e' }}>₦{outstandingAmount.toLocaleString()}</div>
        </div>
      </div>

      {/* ===== PENDING PAYMENTS SECTION ===== */}
      {pendingPayments.length > 0 && (
        <div className="admin-table-container" style={{ border: '2px solid #f59e0b' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #fef3c7', background: '#fffbeb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <AlertTriangle size={20} color="#f59e0b" />
              <h3 style={{ margin: 0, color: '#92400e' }}>Pending Payment Reviews</h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span className="badge badge-warning">
                {pendingPayments.length} Awaiting Review &middot; {naira(pendingPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0))}
              </span>
              <button
                onClick={handleApproveAll}
                disabled={bulkRunning}
                style={{
                  background: bulkRunning ? '#94a3b8' : '#10b981', color: '#fff', border: 'none',
                  borderRadius: '8px', padding: '0.5rem 1rem', fontWeight: 700, fontSize: '0.78rem',
                  cursor: bulkRunning ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem'
                }}
              >
                {bulkRunning ? <Loader2 size={14} className="spin" /> : <CheckCircle size={14} />}
                {bulkRunning ? 'Approving...' : 'Approve All'}
              </button>
            </div>
          </div>

          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pendingPayments.map(payment => {
              const booking = bookings.find(b => b.id === payment.bookingId);
              const receiptUrl = getReceiptUrl(payment);
              return (
                <div key={payment.id} style={{
                  background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px',
                  padding: '1.25rem', display: 'grid',
                  gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'center'
                }}>
                  <div>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 700, color: '#1e293b' }}>#{payment.id.substring(0,8)}</span>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Booking #{payment.bookingId.substring(0,8)}</span>
                      {statusBadge(payment.status)}
                    </div>
                    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', fontSize: '0.875rem', color: '#475569' }}>
                      <span>💰 <strong style={{ color: '#1e293b' }}>₦{payment.amount?.toLocaleString()}</strong></span>
                      <span>🏠 {booking?.roomName || booking?.roomId || 'N/A'}</span>
                      <span>👤 {booking?.guestName || 'Guest'}</span>
                      <span>📅 {new Date(payment.createdAt).toLocaleDateString()}</span>
                      <span style={{color: 'var(--color-primary-navy)', fontWeight: 600}}>🎫 Code: <span style={{fontFamily: 'monospace', letterSpacing: '1px'}}>{booking?.confirmationCode || 'N/A'}</span></span>
                    </div>
                    {!receiptUrl && (
                      <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={14} color="#94a3b8" />
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                          No receipt uploaded ({payment.method || 'unknown method'})
                        </span>
                      </div>
                    )}
                    {receiptUrl && (
                      <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={14} color="#64748b" />
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Receipt uploaded</span>
                        <button
                          onClick={() => window.open(receiptUrl, '_blank')}
                          style={{ background: 'none', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.2rem 0.6rem', fontSize: '0.75rem', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <Eye size={12} /> View Receipt
                        </button>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => openAction(payment, 'approve')}
                      style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.5rem 1.1rem', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <CheckCircle size={15} /> Approve
                    </button>
                    <button
                      onClick={() => openAction(payment, 'reject')}
                      style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.5rem 1.1rem', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <XCircle size={15} /> Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== DATE FILTER & DAILY ACTIVITY ===== */}
      <div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
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

        <div className="admin-table-container">
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
            <h3 style={{ margin: 0, color: '#1e293b' }}>Payment Activity ({dateFilter})</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Customers</th>
                  <th style={{ textAlign: 'right' }}>Transactions</th>
                  <th style={{ textAlign: 'right' }}>Revenue</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {dailyActivityList.length > 0 ? (
                  dailyActivityList.map(activity => (
                    <tr key={activity.date}>
                      <td style={{ fontWeight: 600, color: '#334155' }}>{activity.date}</td>
                      <td style={{ textAlign: 'right', fontWeight: 500 }}>{activity.customerIds.size}</td>
                      <td style={{ textAlign: 'right', fontWeight: 500 }}>
                        {activity.transactionsCount} 
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginTop: '0.1rem' }}>
                          ({activity.successCount} success, {activity.pendingCount} pend)
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#10b981' }}>₦{activity.revenue.toLocaleString()}</td>
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
                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                      <strong>No payment activity found for this period.</strong>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.5rem' }}>Monthly Summary</h3>
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
        
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
          <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', flex: 1, minWidth: '200px' }}>
            <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Customers Who Paid</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a' }}>{monthlyCustomers}</div>
          </div>
          <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', flex: 1, minWidth: '200px' }}>
            <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Transactions</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a' }}>{monthlyTotalTransactions}</div>
          </div>
          <div style={{ background: '#f0fdf4', padding: '1.5rem', borderRadius: '12px', border: '1px solid #bbf7d0', flex: 2, minWidth: '250px' }}>
            <div style={{ color: '#166534', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Revenue</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#15803d' }}>₦{monthlyTotalRevenue.toLocaleString()}</div>
          </div>
        </div>

        <div>
          <h4 style={{ margin: '0 0 1.25rem 0', color: '#334155', fontSize: '1.1rem' }}>Daily Revenue — {format(selectedMonth, 'MMMM yyyy')}</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
             {monthlyActivityList.length > 0 ? (
               monthlyActivityList.map(item => (
                 <div key={item.dateStr} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                   <div style={{ fontWeight: 600, color: '#475569', width: '100px' }}>{item.dateStr}</div>
                   <div style={{ color: '#94a3b8' }}>→</div>
                   <div style={{ fontWeight: 700, color: '#1e293b' }}>₦{item.revenue.toLocaleString()}</div>
                   <div style={{ color: '#64748b', fontSize: '0.85rem', marginLeft: 'auto' }}>
                      {item.customers.size} customer{item.customers.size !== 1 ? 's' : ''} ({item.transactionsCount} tx)
                   </div>
                 </div>
               ))
             ) : (
               <div style={{ color: '#94a3b8', fontStyle: 'italic', padding: '1rem 0' }}>No transactions recorded in this month.</div>
             )}
          </div>
        </div>
      </div>

      {/* ===== ALL PAYMENTS LOG (SEARCHABLE HISTORY) ===== */}
      <div className="admin-table-container">
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ margin: 0, color: 'var(--color-primary-navy)' }}>Payment History</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <span className="badge badge-info" style={{ whiteSpace: 'nowrap' }}>Total: {payments.length}</span>
            <div style={{ position: 'relative', width: '250px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="text" 
                placeholder="Search history..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.2rem', border: '1px solid #e2e8f0', borderRadius: '25px', outline: 'none', fontSize: '0.85rem' }}
              />
            </div>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Booking ID</th>
                <th>Room</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Method</th>
                <th>Reference</th>
              </tr>
            </thead>
            <tbody>
              {searchedPayments.length > 0 ? (
                searchedPayments.map(payment => {
                  const booking = bookings.find(b => b.id === payment.bookingId);
                  return (
                    <tr key={payment.id}>
                      <td style={{ fontWeight: 500 }}>{booking?.guestName || 'Unknown'}</td>
                      <td style={{ fontSize: '0.9rem', fontFamily: 'monospace' }}>#{payment.bookingId.substring(0,8)}</td>
                      <td style={{ fontSize: '0.9rem' }}>{booking?.roomName || booking?.roomId || 'N/A'}</td>
                      <td style={{ fontSize: '0.85rem' }}>{new Date(payment.createdAt).toLocaleDateString()}</td>
                      <td style={{ fontWeight: 600 }}>₦{payment.amount?.toLocaleString()}</td>
                      <td>{statusBadge(payment.status)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}>
                          <CreditCard size={14} /> <span style={{textTransform: 'capitalize'}}>{payment.method}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: '#64748b', fontFamily: 'monospace' }}>#{payment.id.substring(0,8)}</td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No payment records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== DATE DETAILS MODAL ===== */}
      {selectedDateDetails && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
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
                {selectedDateDetails.customerIds.size} customer{selectedDateDetails.customerIds.size !== 1 ? 's' : ''} — {selectedDateDetails.transactions.length} transaction{selectedDateDetails.transactions.length !== 1 ? 's' : ''}
              </p>
              
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                <table className="admin-table" style={{ width: '100%', margin: 0, border: 'none' }}>
                  <thead style={{ background: '#f8fafc' }}>
                    <tr>
                      <th style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Customer</th>
                      <th style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Booking ID</th>
                      <th style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Room</th>
                      <th style={{ textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>Amount</th>
                      <th style={{ textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>Status</th>
                      <th style={{ textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDateDetails.transactions.map((tx, idx) => (
                      <tr key={idx} style={{ borderBottom: idx !== selectedDateDetails.transactions.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                        <td style={{ fontWeight: 600, color: '#1e293b' }}>{tx.guestName}</td>
                        <td style={{ color: '#64748b', fontFamily: 'monospace' }}>{tx.bookingId?.substring(0,8) || 'N/A'}</td>
                        <td style={{ color: '#64748b', fontSize: '0.9rem' }}>{tx.roomName}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>₦{Number(tx.amount || 0).toLocaleString()}</td>
                        <td style={{ textAlign: 'center' }}>
                          {tx.status === 'success' ? (
                            <span style={{ background: '#dcfce7', color: '#166534', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>Success</span>
                          ) : tx.status === 'pending' ? (
                            <span style={{ background: '#fef3c7', color: '#92400e', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>Pending</span>
                          ) : (
                            <span style={{ background: '#fee2e2', color: '#991b1b', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>Failed</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right', color: '#64748b', fontSize: '0.9rem' }}>{tx.paymentTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ padding: '1.5rem 2rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: '1.5rem', color: '#10b981' }}>Total Received: ₦{selectedDateDetails.revenue.toLocaleString()}</div>
            </div>
            
          </div>
        </div>
      )}

      {/* ===== CONFIRM ACTION DIALOG ===== */}
      {actionPayment && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '460px', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              {actionType === 'approve'
                ? <CheckCircle size={28} color="#10b981" />
                : <XCircle size={28} color="#ef4444" />}
              <h3 style={{ margin: 0, color: '#1e293b' }}>
                {actionType === 'approve' ? 'Approve Payment' : 'Reject Payment'}
              </h3>
            </div>

            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              {actionType === 'approve'
                ? `This will confirm payment #${actionPayment.id.substring(0,8)} and mark booking #${actionPayment.bookingId.substring(0,8)} as confirmed.`
                : `This will reject payment #${actionPayment.id.substring(0,8)} and cancel booking #${actionPayment.bookingId.substring(0,8)}. The room will become available again.`}
            </p>

            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: '0.25rem' }}>Guest Confirmation Code</div>
              <div style={{ fontFamily: 'monospace', fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary-navy)', letterSpacing: '3px' }}>
                {bookings.find(b => b.id === actionPayment.bookingId)?.confirmationCode || 'N/A'}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: '#374151', marginBottom: '0.5rem' }}>
                Admin Notes (optional)
              </label>
              <textarea
                value={adminNotes}
                onChange={e => setAdminNotes(e.target.value)}
                placeholder={actionType === 'approve' ? 'e.g. Payment verified via bank statement' : 'e.g. Receipt image unclear, amount does not match'}
                rows={3}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', resize: 'vertical', outline: 'none', fontSize: '0.875rem', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={handleCancel}
                disabled={submitting}
                style={{ flex: 1, padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc', color: '#64748b', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', fontSize: '0.875rem' }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={submitting}
                style={{
                  flex: 2, padding: '0.75rem', border: 'none', borderRadius: '8px',
                  background: submitting ? '#94a3b8' : (actionType === 'approve' ? '#10b981' : '#ef4444'),
                  color: '#fff', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', fontSize: '0.875rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                }}
              >
                {submitting
                  ? <><Loader2 size={16} className="spin" /> Working...</>
                  : actionType === 'approve'
                    ? <><CheckCircle size={16} /> Confirm Approval</>
                    : <><XCircle size={16} /> Confirm Rejection</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;
