// src/services/roomsService.js
import api from './api';

// ---------- tiny helpers ----------
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const hasId = (o) => !!(o && (o._id || o.id));
const getId = (o) => (o?._id || o?.id || null);

// unwrap a single room from many envelopes
const unwrapRoom = (resp) => {
  const r = resp?.data ?? resp;
  // common shapes
  const room = r?.room ?? r?.data ?? r;
  if (Array.isArray(room)) return null;
  return room || null;
};

// unwrap a list of rooms from many envelopes
const unwrapRooms = (resp) => {
  const r = resp?.data ?? resp;
  const list =
    r?.rooms ??
    r?.data ??
    (Array.isArray(r) ? r : null);
  return Array.isArray(list) ? list : [];
};

// do a request with a custom timeout (per-request), preserving cookies via api
async function withTimeout(getPromise, ms) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort('timeout'), ms);
  try {
    const res = await getPromise(controller.signal);
    return res;
  } finally {
    clearTimeout(t);
  }
}

// ---------- CREATE ----------
export async function createRoom(listingId, payload) {
  const fd = new FormData();
  fd.append('title', payload.title);
  fd.append('type', payload.type);
  fd.append('pricePerNight', String(payload.pricePerNight));
  fd.append('maxGuests', String(payload.maxGuests));
  if (payload.bedInfo) fd.append('bedInfo', payload.bedInfo);
  if (payload.cancellationPolicy) fd.append('cancellationPolicy', payload.cancellationPolicy);

  if (Array.isArray(payload.amenities)) {
    fd.append('amenities', JSON.stringify(payload.amenities));
  } else if (payload.amenities) {
    fd.append('amenities', payload.amenities);
  }

  (payload.images || []).forEach((f) => fd.append('images', f));

  // keep cookies, but extend timeout just for this call (e.g., image processing)
  const resp = await api.post(`/listings/${listingId}/rooms`, fd, { timeout: 25000 });
  // some backends return {data:{room}}, others {data:{...}}, others just room
  const created =
    resp?.data?.room ??
    resp?.data?.data ??
    resp?.data ??
    null;

  // if create oddly returns array, pick first
  if (Array.isArray(created)) return created[0] || null;
  return created;
}

// ---------- LIST (fallbacks) ----------
export async function listRoomsByListing(listingId) {
  // 1) primary nested route
  try {
    const resp = await withTimeout(
      (signal) => api.get(`/listings/${listingId}/rooms`, { timeout: 20000, signal }),
      20000
    );
    const arr = unwrapRooms(resp);
    if (arr.length) return arr;
  } catch (_) { /* fall through */ }

  // 2) fallback: flat route with query
  try {
    const resp = await withTimeout(
      (signal) => api.get(`/rooms`, { params: { listingId }, timeout: 20000, signal }),
      20000
    );
    const arr = unwrapRooms(resp);
    return arr;
  } catch (_) { /* fall through */ }

  // 3) final: empty list
  return [];
}

// ---------- DETAIL (multi-try) ----------
export async function getRoomById(listingId, roomId) {
  let lastError = null;

  // try sequence with short backoffs
  const tries = [
    () => api.get(`/listings/${listingId}/rooms/${roomId}`, { timeout: 20000 }),
    () => api.get(`/rooms/${roomId}`, { timeout: 20000 }),
    () => api.get(`/rooms/${roomId}`, { params: { listingId }, timeout: 20000 }),
    async () => {
      const list = await listRoomsByListing(listingId);
      return list.find((r) => String(getId(r)) === String(roomId)) || null;
    },
  ];

  for (let i = 0; i < tries.length; i++) {
    try {
      const res = await tries[i]();
      // list fallback returns an object already
      const room = i === 3 ? res : unwrapRoom(res);
      if (room && hasId(room)) return room;
      if (room) return room; // sometimes missing _id but still valid
    } catch (e) {
      lastError = e;
      // small backoff before next try (avoid hammering)
      await sleep(300);
      continue;
    }
  }

  // if all failed, throw the most informative error
  if (lastError) throw lastError;
  return null;
}

// ---------- UPDATE ----------
export async function updateRoom(listingId, roomId, payload) {
  const fd = new FormData();
  if (payload.title != null) fd.append('title', payload.title);
  if (payload.type != null) fd.append('type', payload.type);
  if (payload.pricePerNight != null) fd.append('pricePerNight', String(payload.pricePerNight));
  if (payload.maxGuests != null) fd.append('maxGuests', String(payload.maxGuests));
  if (payload.bedInfo != null) fd.append('bedInfo', payload.bedInfo);
  if (payload.cancellationPolicy != null) fd.append('cancellationPolicy', payload.cancellationPolicy);

  if (payload.amenities != null) {
    fd.append(
      'amenities',
      Array.isArray(payload.amenities) ? JSON.stringify(payload.amenities) : payload.amenities
    );
  }

  if (payload.removeImages) {
    (Array.isArray(payload.removeImages) ? payload.removeImages : [payload.removeImages])
      .forEach((filename) => fd.append('removeImages', filename));
  }

  (payload.images || []).forEach((file) => fd.append('images', file));

  const resp = await api.put(`/listings/${listingId}/rooms/${roomId}`, fd, { timeout: 25000 });
  return unwrapRoom(resp);
}

// ---------- DELETE ----------
export async function deleteRoom(listingId, roomId) {
  const resp = await api.delete(`/listings/${listingId}/rooms/${roomId}`, { timeout: 15000 });
  const r = resp?.data ?? resp;
  return r?.message ?? r?.data ?? r ?? { success: true };
}
