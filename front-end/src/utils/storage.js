// src/utils/storage.js
import { STORAGE_KEYS } from './constants';

const ALT_TOKEN_KEYS = ['authToken', 'token', 'accessToken', 'auth_token'];
const LS_AUTH_KEY = 'oyoplus:isAuthed';

/* ===== TOKEN ===== */
export const saveToken = (token) => {
  try {
    if (!token || typeof token !== 'string' || !token.trim()) return;

    const trimmed = token.trim();
    const existing = localStorage.getItem(STORAGE_KEYS.authToken);

    // avoid overwriting if same
    if (existing === trimmed) return;

    localStorage.setItem(STORAGE_KEYS.authToken, trimmed);
    localStorage.setItem('token', trimmed);

    ALT_TOKEN_KEYS.forEach((k) => {
      try { localStorage.setItem(k, trimmed); } catch {}
    });
  } catch (e) {
    console.warn('saveToken error:', e);
  }
};

export const getToken = () => {
  try {
    let t = localStorage.getItem(STORAGE_KEYS.authToken);
    if (t && typeof t === 'string' && t.trim()) return t.trim();

    for (const k of ALT_TOKEN_KEYS) {
      t = localStorage.getItem(k);
      if (t && typeof t === 'string' && t.trim()) {
        const trimmed = t.trim();
        localStorage.setItem(STORAGE_KEYS.authToken, trimmed);
        return trimmed;
      }
    }
    return null;
  } catch (e) {
    console.warn('getToken error:', e);
    return null;
  }
};

export const removeToken = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.authToken);
    ALT_TOKEN_KEYS.forEach((k) => {
      try { localStorage.removeItem(k); } catch {}
    });
  } catch (e) {
    console.warn('removeToken error:', e);
  }
};

// ✅ hasToken: treat either a stored token OR an active cookie session as authed.
// Cookie-session path sets oyoplus:isAuthed = 'true' in your forms/services.
export const hasToken = () => {
  try {
    const t = getToken();
    if (t) return true;
    const authedFlag = localStorage.getItem(LS_AUTH_KEY);
    return authedFlag === 'true';
  } catch (e) {
    console.warn('hasToken', e);
    return false;
  }
};

/* ===== USER ===== */
export const saveUser = (user) => {
  try {
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    // also broadcast a storage event so Header re-renders without reload
    try {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: STORAGE_KEYS.user,
          newValue: JSON.stringify(user),
        })
      );
    } catch {}
  } catch (e) { console.warn('saveUser', e); }
};

export const getUser = () => {
  try {
    const s = localStorage.getItem(STORAGE_KEYS.user);
    return s ? JSON.parse(s) : null;
  } catch (e) { console.warn('getUser', e); return null; }
};

export const removeUser = () => {
  try { localStorage.removeItem(STORAGE_KEYS.user); }
  catch (e) { console.warn('removeUser', e); }
};

/**
 * Single source of truth for "is this email verified?"
 * Supports multiple backend field names present on the stored user.
 */
export const isEmailVerified = () => {
  const u = getUser();
  return !!(
    u?.emailVerified ||
    u?.isEmailVerified ||
    u?.verified ||
    u?.isVerified
  );
};

/**
 * When user verifies email, call this to mark them as verified in localStorage.
 * (Keeps your schema flexible by setting all common flags.)
 */
export const markUserVerified = () => {
  try {
    const u = getUser() || {};
    const updated = {
      ...u,
      emailVerified: true,
      isEmailVerified: true,
      verified: true,
      isVerified: true,
    };
    saveUser(updated);
  } catch (e) {
    console.warn('markUserVerified failed', e);
  }
};

// was: both token AND user.
// we'll keep it for backward compatibility.
export const isAuthenticated = () => !!(getToken() && getUser());

export const clearAuth = () => { removeToken(); removeUser(); };

/* ===== BOOKINGS (for UserPage) ===== */
export const saveBookings = (bookings) => {
  try { localStorage.setItem(STORAGE_KEYS.bookings, JSON.stringify(bookings || [])); }
  catch (e) { console.warn('saveBookings', e); }
};

export const getBookings = () => {
  try {
    const s = localStorage.getItem(STORAGE_KEYS.bookings);
    const parsed = s ? JSON.parse(s) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) { console.warn('getBookings', e); return []; }
};

export const addBooking = (booking) => {
  if (!booking) return;
  const cur = getBookings().filter(b => b?.id !== booking?.id);
  cur.push(booking);
  cur.sort((a,b) => new Date(a?.checkIn||0) - new Date(b?.checkIn||0));
  saveBookings(cur);
};

export const clearBookings = () => {
  try { localStorage.removeItem(STORAGE_KEYS.bookings); }
  catch (e) { console.warn('clearBookings', e); }
};
