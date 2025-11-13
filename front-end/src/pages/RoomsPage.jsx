import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createRoom } from '../services/roomsService';
import { fetchListingById } from '../services/listings';
import { getUser, hasToken, isEmailVerified } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';

const AMENITIES = ['WiFi','AC','TV','Heater','Geyser','Breakfast','Parking','Power Backup','Elevator'];
const TYPES = ['single','double','suite'];

const getOwnerId = (ownerId) => ownerId?.['_id'] || ownerId?.id || ownerId || '';
const getUserId  = (u) => u?._id || u?.id || '';

function FilePreview({ files = [] }) {
  if (!files.length) return null;
  return (
    <div className="flex gap-2 flex-wrap mt-2">
      {files.map((f, i) => {
        const src = URL.createObjectURL(f);
        return (
          <div key={i} className="h-20 w-28 rounded overflow-hidden border">
            <img
              src={src}
              alt={f.name}
              className="h-full w-full object-cover"
              onLoad={() => URL.revokeObjectURL(src)}
            />
          </div>
        );
      })}
    </div>
  );
}

export default function RoomsPage() {
  const navigate = useNavigate();
  const { listingId } = useParams();

  // 🚧 Hard gate: must be logged-in AND verified
  useEffect(() => {
    if (!hasToken() || !isEmailVerified()) {
      navigate('/became-a-member', { replace: true });
    }
  }, [navigate]);

  const { isAuthenticated, user } = useAuth();
  const me = user ?? getUser();

  const [canEdit, setCanEdit] = useState(false);

  const [title, setTitle] = useState('');
  const [type, setType] = useState('single');
  const [pricePerNight, setPricePerNight] = useState('');
  const [maxGuests, setMaxGuests] = useState(1);
  const [bedInfo, setBedInfo] = useState('');
  const [amenities, setAmenities] = useState([]);
  const [cancellationPolicy, setCancellationPolicy] = useState('');
  const [images, setImages] = useState([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!listingId) return;
        const res = await fetchListingById(listingId);
        if (!mounted) return;
        const myId = String(getUserId(me));
        const owner = String(getOwnerId(res?.data?.ownerId ?? res?.ownerId));
        const authed = isAuthenticated || localStorage.getItem('oyoplus:isAuthed') === 'true';
        // also require verified
        setCanEdit(!!myId && authed && isEmailVerified() && (myId === owner || me?.role === 'admin'));
      } catch {
        if (!mounted) return;
        setCanEdit(false);
      }
    })();
    return () => { mounted = false; };
  }, [listingId, isAuthenticated, me]);

  const toggleAmenity = (a) => {
    setAmenities((prev) => (prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]));
  };

  const errors = useMemo(() => {
    const e = {};
    if (!listingId) e.listingId = 'Listing ID is required in the URL: /listings/:listingId/rooms/new';
    if (!title?.trim()) e.title = 'Title is required';
    if (!TYPES.includes(type)) e.type = 'Type must be single, double, or suite';
    if (pricePerNight === '' || Number(pricePerNight) < 0) e.pricePerNight = 'Enter a valid price';
    if (!Number.isInteger(Number(maxGuests)) || Number(maxGuests) < 1) e.maxGuests = 'Min 1 guest';
    return e;
  }, [listingId, title, type, pricePerNight, maxGuests]);

  const handleCreate = async (e) => {
    e.preventDefault();

    // double-check guard in case of race
    if (!hasToken() || !isEmailVerified()) {
      navigate('/became-a-member', { replace: true });
      return;
    }

    if (Object.keys(errors).length) return;

    try {
      setSaving(true);
      setError('');

      const payload = {
        title,
        type,
        pricePerNight: Number(pricePerNight),
        maxGuests: Number(maxGuests),
        bedInfo,
        amenities,
        cancellationPolicy,
        images,
      };

      const created = await createRoom(listingId, payload);
      const newId = created?._id || created?.id || created?.room?._id || created?.room?.id;

      if (newId) {
        navigate(`/listings/${listingId}/rooms/${newId}`);
      } else {
        setError('Created, but no room id returned. Please refresh Rooms list.');
        navigate(`/listings/${listingId}/rooms`);
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to create room');
    } finally {
      setSaving(false);
    }
  };

  if (!listingId) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <p className="text-red-600">Listing ID is required in the URL: /listings/:listingId/rooms/new</p>
        <Link className="mt-2 inline-block px-4 py-2 rounded border" to="/listings">Back to Listings</Link>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-xl font-semibold mb-2">Not authorized</h1>
        <p className="text-gray-600">Only the listing owner or an admin with a verified email can create rooms.</p>
        <div className="mt-4">
          <Link className="px-4 py-2 rounded border" to={`/property/${listingId}`}>Back to Property</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Create a Room</h1>
        <div className="text-xs">
          <span className="px-2 py-1 border rounded bg-gray-50">
            Listing ID: <span className="font-mono">{listingId}</span>
          </span>
        </div>
      </div>

      <form onSubmit={handleCreate} className="space-y-6 p-4 border rounded bg-white">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input
            className="mt-1 w-full border rounded p-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={140}
            placeholder="e.g., Deluxe King with City View"
            required
          />
          {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">Type</label>
            <select
              className="mt-1 w-full border rounded p-2"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            {errors.type && <p className="text-red-600 text-sm mt-1">{errors.type}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Price per Night</label>
            <input
              type="number" min="0" step="0.01"
              className="mt-1 w-full border rounded p-2"
              value={pricePerNight}
              onChange={(e) => setPricePerNight(e.target.value)}
              placeholder="5499" required
            />
            {errors.pricePerNight && <p className="text-red-600 text-sm mt-1">{errors.pricePerNight}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Max Guests</label>
            <input
              type="number" min="1"
              className="mt-1 w-full border rounded p-2"
              value={maxGuests}
              onChange={(e) => setMaxGuests(e.target.value)}
              placeholder="2" required
            />
            {errors.maxGuests && <p className="text-red-600 text-sm mt-1">{errors.maxGuests}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Bed Info (text)</label>
            <input
              className="mt-1 w-full border rounded p-2"
              value={bedInfo}
              onChange={(e) => setBedInfo(e.target.value)}
              placeholder="e.g., 1× King, 1× Single"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Amenities</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
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
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Images (up to 5)</label>
          <input
            className="mt-1" type="file" accept="image/*" multiple
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              setImages(files.slice(0, 5));
            }}
          />
          <FilePreview files={images} />
        </div>

        <div>
          <label className="block text-sm font-medium">Cancellation Policy</label>
          <textarea
            className="mt-1 w-full border rounded p-2"
            rows={3}
            value={cancellationPolicy}
            onChange={(e) => setCancellationPolicy(e.target.value)}
            placeholder="Free cancellation up to 24 hours before check-in…"
          />
        </div>

        {error && <p className="text-red-600">{error}</p>}

        <div className="pt-2">
          <button
            type="submit"
            disabled={!!saving || Object.keys(errors).length > 0}
            className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save & View'}
          </button>
        </div>
      </form>
    </div>
  );
}
