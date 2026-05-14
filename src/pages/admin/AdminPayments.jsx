import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { CreditCard, CheckCircle, XCircle, Eye, AlertTriangle, Clock, FileText } from 'lucide-react';

const AdminPayments = () => {
  const { payments, bookings, confirmPayment, fetchPayments, fetchBookings } = useContext(AppContext);
  const [actionPayment, setActionPayment] = useState(null); // payment being acted on
  const [actionType, setActionType] = useState(''); // 'approve' or 'reject'
  const [adminNotes, setAdminNotes] = useState('');
  const [toast, setToast] = useState(null); // { type: 'success'|'error', msg }
  const [receiptModal, setReceiptModal] = useState(null); // receipt data URL or URL to view

  useEffect(() => {
    fetchPayments();
    fetchBookings();
  }, []);

  const pendingPayments = payments.filter(p => p.status === 'pending' && p.receipt);
  const allPayments = payments.slice().reverse();

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
    if (!actionPayment) return;
    const newStatus = actionType === 'approve' ? 'success' : 'failed';

    await confirmPayment(actionPayment.id, newStatus, adminNotes);

    showToast(
      actionType === 'approve' ? 'success' : 'error',
      actionType === 'approve'
        ? `Payment #${actionPayment.id} approved. Booking confirmed.`
        : `Payment #${actionPayment.id} rejected. Booking cancelled.`
    );

    setActionPayment(null);
    setAdminNotes('');
  };

  // Safe cancel
  const handleCancel = () => {
    setActionPayment(null);
    setAdminNotes('');
  };

  const statusBadge = (status) => {
    const map = {
      success: { cls: 'badge-success', icon: <CheckCircle size={12} />, label: 'Success' },
      failed: { cls: 'badge-danger', icon: <XCircle size={12} />, label: 'Rejected' },
      pending: { cls: 'badge-warning', icon: <Clock size={12} />, label: 'Pending' },
    };
    const s = map[status] || map.pending;
    return (
      <span className={`badge ${s.cls}`} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', width: 'fit-content' }}>
        {s.icon} {s.label}
      </span>
    );
  };

  const getReceiptUrl = (receipt) => {
    return typeof receipt === 'string' ? receipt : receipt?.url;
  };

  return (
    <div style={{ position: 'relative' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999,
          background: toast.type === 'success' ? '#10b981' : '#ef4444',
          color: '#fff', padding: '1rem 1.5rem', borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          fontWeight: 600, fontSize: '0.9rem', maxWidth: '360px'
        }}>
          {toast.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
          {toast.msg}
        </div>
      )}

      {/* ===== PENDING PAYMENTS SECTION ===== */}
      {pendingPayments.length > 0 && (
        <div className="admin-table-container" style={{ marginBottom: '2rem', border: '2px solid #f59e0b' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #fef3c7', background: '#fffbeb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <AlertTriangle size={20} color="#f59e0b" />
              <h3 style={{ margin: 0, color: '#92400e' }}>Pending Payment Reviews</h3>
            </div>
            <span className="badge badge-warning">{pendingPayments.length} Awaiting Review</span>
          </div>

          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pendingPayments.map(payment => {
              const booking = bookings.find(b => b.id === payment.bookingId);
              const receiptUrl = getReceiptUrl(payment.receipt);
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

      {/* ===== ALL PAYMENTS LOG ===== */}
      <div className="admin-table-container">
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, color: 'var(--color-primary-navy)' }}>All Payment Logs</h3>
          <span className="badge badge-info">Total: {payments.length}</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Booking ID</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Receipt</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allPayments.length > 0 ? (
                allPayments.map(payment => {
                  const receiptUrl = getReceiptUrl(payment.receipt);
                  return (
                    <tr key={payment.id}>
                      <td style={{ fontSize: '0.8rem', color: '#64748b' }}>#{payment.id.substring(0,8)}</td>
                      <td style={{ fontSize: '0.9rem' }}>#{payment.bookingId.substring(0,8)}</td>
                      <td style={{ fontWeight: 600 }}>₦{payment.amount?.toLocaleString()}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                          <CreditCard size={14} /> {payment.method}
                        </div>
                      </td>
                      <td>
                        {receiptUrl ? (
                          <button
                            onClick={() => window.open(receiptUrl, '_blank')}
                            style={{ background: 'none', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.2rem 0.6rem', fontSize: '0.75rem', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                          >
                            <Eye size={12} /> View
                          </button>
                        ) : <span style={{ color: '#cbd5e1' }}>—</span>}
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{new Date(payment.createdAt).toLocaleDateString()}</td>
                      <td>{statusBadge(payment.status)}</td>
                      <td>
                        {payment.status === 'pending' && (
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button onClick={() => openAction(payment, 'approve')} style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.3rem 0.7rem', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}>Approve</button>
                            <button onClick={() => openAction(payment, 'reject')} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.3rem 0.7rem', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}>Reject</button>
                          </div>
                        )}
                      </td>
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

      {/* ===== CONFIRM ACTION DIALOG ===== */}
      {actionPayment && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '1rem' }}>
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
                style={{ flex: 1, padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc', color: '#64748b', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                style={{
                  flex: 2, padding: '0.75rem', border: 'none', borderRadius: '8px',
                  background: actionType === 'approve' ? '#10b981' : '#ef4444',
                  color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                }}
              >
                {actionType === 'approve' ? <><CheckCircle size={16} /> Confirm Approval</> : <><XCircle size={16} /> Confirm Rejection</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;
