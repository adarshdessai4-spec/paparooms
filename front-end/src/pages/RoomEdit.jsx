// src/pages/RoomEdit.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getRoomById, updateRoom } from '../services/roomsService';
import { API_BASE_URL } from '../utils/constants';
import { fetchListingById } from '../services/listings';
import { useAuth } from '../contexts/AuthContext';
import { getUser, hasToken, isEmailVerified } from '../utils/storage';

const AMENITIES = ['WiFi','AC','TV','Heater','Geyser','Breakfast','Parking','Power Backup','Elevator'];
const TYPES = ['single', 'double', 'suite'];
const getOwnerId = (ownerId) => ownerId?.['_id'] || ownerId?.id || ownerId || '';
const getUserId  = (u) => u?._id || u?.id || '';

// 👉 Safe-normalizer: always return string[].
function toAmenityArray(v) {
  try {
    if (Array.isArray(v)) return v.map(String);
    if (typeof v === 'string') {
      const s = v.trim();
      if (!s) return [];
      // Try JSON first: '["WiFi","AC"]'
      if ((s.startsWith('[') && s.endsWith(']')) || (s.startsWith('"') && s.endsWith('"'))) {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed)) return parsed.map(String);
      }
      // Fallback: split on commas
      return s
        .replace(/^[\[\]]/g, '')
        .split(',')
        .map((x) => x.replace(/^"+|"+$/g, '').trim())
        .filter(Boolean);
    }
    return [];
  } catch {
    return [];
  }
}

export default function RoomEdit() {
  const { listingId, id } = useParams();
  const navigate = useNavigate();

  // 🚧 Hard gate
  useEffect(() => {
    if (!hasToken() || !isEmailVerified()) {
      navigate('/became-a-member', { replace: true });
    }
  }, [navigate]);

  const { isAuthenticated, user } = useAuth();
  const me = user ?? getUser();

  const [canEdit, setCanEdit] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [room, setRoom] = useState(null);

  const [title, setTitle] = useState('');
  const [type, setType] = useState('single');
  const [pricePerNight, setPricePerNight] = useState('');
  const [maxGuests, setMaxGuests] = useState(1);
  const [bedInfo, setBedInfo] = useState('');
  const [amenities, setAmenities] = useState([]);            // <-- array (multi-select)
  const [cancellationPolicy, setCancellationPolicy] = useState('');
  const [removeImages, setRemoveImages] = useState([]); // filenames[]
  const newImagesRef = useRef(null);

  const API_ORIGIN = useMemo(() => API_BASE_URL.replace(/\/api\/?$/, ''), []);

  // Owner/admin gate + verified
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetchListingById(listingId);
        if (!mounted) return;
        const myId = String(getUserId(me));
        const owner = String(getOwnerId(res?.data?.ownerId ?? res?.ownerId));
        const authed = isAuthenticated || localStorage.getItem('oyoplus:isAuthed') === 'true';
        setCanEdit(!!myId && authed && isEmailVerified() && (myId === owner || me?.role === 'admin'));
      } catch {
        if (!mounted) return;
        setCanEdit(false);
      }
    })();
    return () => { mounted = false; };
  }, [listingId, isAuthenticated, me]);

  // Load existing room
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getRoomById(listingId, id);
        const r = res?.data?.data ?? res?.data ?? res ?? null;
        if (!mounted) return;
        setRoom(r || null);
        if (r) {
          setTitle(r.title || '');
          setType(r.type || 'single');
          setPricePerNight(r.pricePerNight ?? '');
          setMaxGuests(r.maxGuests ?? 1);
          setBedInfo(r.bedInfo || '');
          // ✅ normalize to array (handles API sending string)
          setAmenities(toAmenityArray(r.amenities));
          setCancellationPolicy(r.cancellationPolicy || '');
        }
      } catch (e) {
        if (!mounted) return;
        setError(e?.response?.data?.message || 'Failed to load room');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [listingId, id]);

  const currentImages = useMemo(() => {
    return (room?.images || []).map((x) => {
      if (!x) return { url: '', filename: '' };
      if (typeof x === 'string') {
        return { url: x.startsWith('http') ? x : `${API_ORIGIN}/${x.replace(/^\/+/, '')}`, filename: x.split('/').pop() || '' };
        }
      if (x.url) return { url: x.url, filename: x.filename || (x.url.split('/').pop() || '') };
      if (x.filename) return { url: `${API_ORIGIN}/uploads/rooms/${x.filename}`, filename: x.filename };
      return { url: '', filename: '' };
    });
  }, [room, API_ORIGIN]);

  const toggleRemove = (filename) => {
    setRemoveImages((prev) =>
      prev.includes(filename) ? prev.filter((f) => f !== filename) : [...prev, filename]
    );
  };

  const toggleAmenity = (a) => {
    setAmenities((prev) => (prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // double-check guard
    if (!hasToken() || !isEmailVerified()) {
      navigate('/became-a-member', { replace: true });
      return;
    }

    setSaving(true); setError('');
    try {
      const payload = {
        title,
        type,
        pricePerNight: Number(pricePerNight),
        maxGuests: Number(maxGuests),
        bedInfo,
        amenities,                    // <-- send array directly
        cancellationPolicy,
        removeImages,
      };

      const files = Array.from(newImagesRef.current?.files || []);
      if (files.length) payload.images = files;

      await updateRoom(listingId, id, payload);
      navigate(`/listings/${listingId}/rooms/${id}`);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (!canEdit) {
    return (
      <div className="max-w-5xl mx-auto p-4">
        <h1 className="text-xl font-semibold mb-2">Not authorized</h1>
        <p className="text-gray-600">Only the listing owner or an admin with a verified email can edit rooms.</p>
        <div className="mt-4">
          <Link className="px-4 py-2 rounded border" to={`/listings/${listingId}/rooms/${id}`}>Back to Room</Link>
        </div>
      </div>
    );
  }

  if (loading) return <div className="max-w-5xl mx-auto p-4">Loading…</div>;
  if (!room) {
    return (
      <div className="max-w-5xl mx-auto p-4">
        <p className="mb-4 text-gray-700">Room not found.</p>
        <Link className="px-4 py-2 rounded border" to={`/listings/${listingId}/rooms`}>Back</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit Room</h1>
        <Link className="px-4 py-2 rounded border" to={`/listings/${listingId}/rooms/${room._id}`}>
          View
        </Link>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Title</label>
            <input
              className="mt-1 w-full border rounded p-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={140}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Type</label>
            <select
              className="mt-1 w-full border rounded p-2"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Price per Night</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="mt-1 w-full border rounded p-2"
              value={pricePerNight}
              onChange={(e) => setPricePerNight(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Max Guests</label>
            <input
              type="number"
              min="1"
              className="mt-1 w-full border rounded p-2"
              value={maxGuests}
              onChange={(e) => setMaxGuests(e.target.value)}
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">Bed Info (text)</label>
            <input
              className="mt-1 w-full border rounded p-2"
              value={bedInfo}
              onChange={(e) => setBedInfo(e.target.value)}
              placeholder="e.g., 1× King, 1× Single"
            />
          </div>

          {/* Amenities as checkbox grid */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">Amenities</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
              {AMENITIES.map((a) => (
                <label key={a} className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={amenities.includes(a)}
                    onChange={() => toggleAmenity(a)}
                  />
                  <span>{a}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">These will be saved as an array on update.</p>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">Cancellation Policy</label>
            <textarea
              rows={3}
              className="mt-1 w-full border rounded p-2"
              value={cancellationPolicy}
              onChange={(e) => setCancellationPolicy(e.target.value)}
              placeholder="Free cancellation up to 24 hours before check-in…"
            />
          </div>
        </div>

        {/* Existing Images (select to remove) */}
        <section className="border rounded p-3">
          <h3 className="font-medium mb-2">Existing Images</h3>
          {currentImages.length === 0 ? (
            <p className="text-sm text-gray-600">No images uploaded.</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {currentImages.map((img, i) => {
                const checked = removeImages.includes(img.filename);
                return (
                  <label key={i} className="inline-flex flex-col items-center gap-2">
                    <img
                      src={img.url}
                      alt=""
                      className={`h-20 w-28 object-cover rounded border ${checked ? 'opacity-50' : ''}`}
                      onError={(e) => {
                        const src = e.currentTarget.getAttribute('src') || '';
                        if (src.includes('/uploads/images/')) {
                          e.currentTarget.src = src.replace('/uploads/images/', '/uploads/rooms/');
                        } else {
                          e.currentTarget.style.display = 'none';
                        }
                      }}
                    />
                    <div className="text-xs text-gray-600 max-w-28 break-words text-center">
                      {img.filename}
                    </div>
                    <div className="text-xs">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleRemove(img.filename)}
                      />{' '}
                      Remove
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </section>

        {/* Add new images */}
        <section className="border rounded p-3">
          <h3 className="font-medium mb-2">Add Images</h3>
          <input type="file" multiple accept="image/*" ref={newImagesRef} />
          <p className="text-xs text-gray-500 mt-1">You can add up to 5 images per update.</p>
        </section>

        {error && <p className="text-red-600">{error}</p>}

        <div className="flex items-center justify-end gap-2">
          <Link to={`/listings/${listingId}/rooms/${id}`} className="px-4 py-2 rounded border">Cancel</Link>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
