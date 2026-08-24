// Single place where booking/payment status values and their labels live.
//
// The Postgres enums are the contract:
//   BookingStatus: pending | confirmed | checked_in | checked_out | cancelled
//   PaymentStatus: pending | success | failed | refunded
//
// Parts of the admin UI used to send and match on hyphenated values
// ("checked-in"), which Postgres rejects and which made every unmatched status
// fall through to the yellow "pending" badge. Everything now goes through here.

export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CHECKED_IN: 'checked_in',
  CHECKED_OUT: 'checked_out',
  CANCELLED: 'cancelled',
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

/** Accepts legacy hyphenated values and normalises to the DB enum spelling. */
export const normalizeBookingStatus = (status) =>
  String(status || BOOKING_STATUS.PENDING).trim().toLowerCase().replace(/-/g, '_');

const BOOKING_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  checked_in: 'Checked In',
  checked_out: 'Checked Out',
  cancelled: 'Cancelled',
};

const BOOKING_BADGES = {
  pending: { cls: 'badge-warning', bg: '#fef3c7', color: '#92400e' },
  confirmed: { cls: 'badge-success', bg: '#d1fae5', color: '#065f46' },
  checked_in: { cls: 'badge-info', bg: '#dbeafe', color: '#1e40af' },
  checked_out: { cls: 'badge-muted', bg: '#f1f5f9', color: '#475569' },
  cancelled: { cls: 'badge-danger', bg: '#fee2e2', color: '#991b1b' },
};

export const bookingStatusLabel = (status) =>
  BOOKING_LABELS[normalizeBookingStatus(status)] || normalizeBookingStatus(status);

export const bookingStatusBadge = (status) =>
  BOOKING_BADGES[normalizeBookingStatus(status)] || BOOKING_BADGES.pending;

const PAYMENT_LABELS = {
  pending: 'Pending',
  // The admin action is "Approve", so the resulting state reads "Approved"
  // rather than the raw DB value "success".
  success: 'Approved',
  failed: 'Rejected',
  refunded: 'Refunded',
};

export const paymentStatusLabel = (status) =>
  PAYMENT_LABELS[String(status || 'pending').toLowerCase()] || String(status);

export const isPaymentSettled = (status) =>
  ['success', 'failed', 'refunded'].includes(String(status || '').toLowerCase());

/** Booking rows that no longer owe money / occupy a room. */
export const isBookingClosed = (status) =>
  [BOOKING_STATUS.CANCELLED, BOOKING_STATUS.CHECKED_OUT].includes(
    normalizeBookingStatus(status),
  );

export const naira = (n) => `₦${Number(n || 0).toLocaleString()}`;

/** Receipts come back as `receiptUrl` from the API; older shapes used `receipt`. */
export const receiptUrlOf = (record) => {
  if (!record) return null;
  if (record.receiptUrl) return record.receiptUrl;
  const r = record.receipt;
  if (!r) return null;
  return typeof r === 'string' ? r : r.url || null;
};
