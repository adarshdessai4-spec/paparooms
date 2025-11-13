// src/services/bookings.js
import api from './api';

const LONG_TIMEOUT = 45000; // keep long timeout for cold starts

// ---- Helper: normalize any backend shape into a plain array of bookings ----
function extractList(payload) {
  // If backend already returns an array
  if (Array.isArray(payload)) return payload;

  // Common shapes: { data: [...] } or { bookings: [...] }
  if (payload && typeof payload === 'object') {
    // 1) direct arrays under known keys
    for (const k of ['bookings', 'data', 'results', 'items', 'docs', 'list', 'rows']) {
      if (Array.isArray(payload[k])) return payload[k];
    }

    // 2) nested object in payload.data
    const d = payload.data;
    if (Array.isArray(d)) return d;
    if (d && typeof d === 'object') {
      for (const k of ['bookings', 'data', 'results', 'items', 'docs', 'list', 'rows']) {
        if (Array.isArray(d[k])) return d[k];
      }
    }

    // 3) sometimes { success: true, data: { ... } }
    if (payload.success && d) {
      if (Array.isArray(d)) return d;
      if (d && typeof d === 'object') {
        for (const k of ['bookings', 'data', 'results', 'items', 'docs', 'list', 'rows']) {
          if (Array.isArray(d[k])) return d[k];
        }
      }
    }
  }

  // Fallback: nothing recognizable
  return [];
}

// ---- API calls ----
export const createBooking = async (payload) => {
  const res = await api.post('/bookings', payload, { timeout: LONG_TIMEOUT });
  return res.data; // keep original shape for result page
};

export const getMyBookings = async () => {
  const res = await api.get('/bookings/my', { timeout: LONG_TIMEOUT });
  return extractList(res.data); // <-- always an array here
};

export const getOwnerBookings = async () => {
  const res = await api.get('/bookings/owner', { timeout: LONG_TIMEOUT });
  return extractList(res.data); // <-- always an array here
};

export const cancelBooking = async (bookingId) => {
  const res = await api.put(`/bookings/${bookingId}/cancel`, null, { timeout: LONG_TIMEOUT });
  return res.data;
};
