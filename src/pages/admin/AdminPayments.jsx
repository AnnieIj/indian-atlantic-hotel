import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { CreditCard, CheckCircle, XCircle, ExternalLink } from 'lucide-react';

const AdminPayments = () => {
  const { payments, bookings } = useContext(AppContext);

  return (
    <div className="admin-table-container">
      <div style={{padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h3 style={{margin: 0, color: 'var(--color-primary-navy)'}}>Payment Logs</h3>
        <span className="badge badge-info">Transaction Count: {payments.length}</span>
      </div>
      <div style={{overflowX: 'auto'}}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Booking ID</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Paystack Ref</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.length > 0 ? (
              payments.slice().reverse().map(payment => (
                <tr key={payment.id}>
                  <td style={{fontSize: '0.8rem', color: '#64748b'}}>#{payment.id}</td>
                  <td>
                    <div style={{fontSize: '0.9rem'}}>#{payment.bookingId}</div>
                  </td>
                  <td style={{fontWeight: 600}}>₦{payment.amount.toLocaleString()}</td>
                  <td>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem'}}>
                      <CreditCard size={14} /> {payment.method}
                    </div>
                  </td>
                  <td style={{fontSize: '0.8rem', color: '#64748b'}}>{payment.paystackRef || '-'}</td>
                  <td style={{fontSize: '0.9rem'}}>{new Date(payment.createdAt).toLocaleString()}</td>
                  <td>
                    <span className={`badge ${payment.status === 'success' ? 'badge-success' : 'badge-danger'}`} style={{display: 'flex', alignItems: 'center', gap: '0.3rem', width: 'fit-content'}}>
                      {payment.status === 'success' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{textAlign: 'center', padding: '3rem', color: '#94a3b8'}}>No payment records found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPayments;
