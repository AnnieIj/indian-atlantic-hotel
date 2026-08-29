// Guests no longer enter an email address when booking online — phone is the
// contact channel. The API still requires a `guestEmail` (the column is NOT
// NULL and it keys the auto-created guest user record), so we mint a unique
// placeholder per booking.
//
// `.invalid` is reserved by RFC 2606 precisely for this: it can never resolve,
// so nothing will ever try to deliver mail to it. Uniqueness matters because
// `users.email` is UNIQUE — a single shared placeholder would collapse every
// guest onto one account.

const PLACEHOLDER_DOMAIN = 'noemail.invalid';

export const makePlaceholderEmail = () => {
  const rand = Math.random().toString(36).slice(2, 8);
  return `guest-${Date.now().toString(36)}-${rand}@${PLACEHOLDER_DOMAIN}`;
};

/** True for an address minted by makePlaceholderEmail (or an empty one). */
export const isPlaceholderEmail = (email) => {
  if (!email || !String(email).trim()) return true;
  return String(email).trim().toLowerCase().endsWith(`@${PLACEHOLDER_DOMAIN}`);
};

/**
 * What the admin UI should show in a "guest email" slot: the real address if
 * the guest has one, otherwise nothing (so staff aren't shown a fake address
 * and try to mail it).
 */
export const displayGuestEmail = (email) => (isPlaceholderEmail(email) ? '' : email);
