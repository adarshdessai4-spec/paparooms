import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { listRoomsByListing } from '../services/roomsService';
import { API_BASE_URL } from '../utils/constants';

import { fetchListingById } from '../services/listings';
import { getUser, isEmailVerified } from '../utils/storage';

const getOwnerId = (ownerId) => ownerId?.['_id'] || ownerId?.id || ownerId || '';
const getUserId = (u) => u?._id || u?.id || '';

function EmptyState({ onCreate, listingId, canEdit }) {
  return (
    <div className="text-center p-10 border rounded-xl bg-white">
      <h3 className="text-lg font-semibold">No rooms yet</h3>
      <p className="text-gray-600 mt-1">Nothing to show here.</p>
      {canEdit && listingId ? (
        <button onClick={() => onCreate(listingId)} className="mt-4 px-4 py-2 rounded bg-black text-white">
          Create a Room
        </button>
      ) : null}
    </div>
  );
}

function RoomCard({ room, onOpen, apiOrigin }) {
  const priceStr = typeof room.pricePerNight === 'number'
    ? room.pricePerNight.toLocaleString('en-IN')
    : room.pricePerNight;

  let firstImageUrl = null;
  if (Array.isArray(room.images) && room.images.length > 0) {
    const x = room.images[0];
    if (typeof x === 'string') firstImageUrl = /^https?:\/\//i.test(x) ? x :
      (x.startsWith('/uploads/') ? `${apiOrigin}${x}` :
        (x.includes('/') ? `${apiOrigin}/${x.replace(/^\/+/, '')}` : `${apiOrigin}/uploads/images/${x}`));
    else if (x?.url) firstImageUrl = x.url;
    else if (x?.filename) firstImageUrl = `${apiOrigin}/uploads/images/${x.filename}`;
  }

  return (
    <button
      onClick={onOpen}
      className="text-left border rounded-xl overflow-hidden bg-white hover:shadow-md transition"
      title={room.title}
    >
      <div className="w-full aspect-[16/10] bg-gray-100">
        {firstImageUrl ? (
          <img
            src={firstImageUrl}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              const src = e.currentTarget.getAttribute('src') || '';
              if (src.includes('/uploads/images/')) {
                e.currentTarget.src = src.replace('/uploads/images/', '/uploads/rooms/');
              } else if (src.includes('/uploads/rooms/')) {
                e.currentTarget.src = src.replace('/uploads/rooms/', '/uploads/images/');
              } else {
                e.currentTarget.style.display = 'none';
              }
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">No image</div>
        )}
      </div>
      <div className="p-3 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold line-clamp-1">{room.title}</h3>
          <span className="shrink-0 text-sm font-medium bg-gray-50 border rounded px-2 py-0.5">
            {(room.type || '').toUpperCase()}
          </span>
        </div>
        <p className="text-sm text-gray-600">₹{priceStr}/night • max {room.maxGuests ?? room.maxGuest} guest(s)</p>
        <p className="text-xs text-gray-500">{room.bedInfo || '(no bed info)'}</p>
      </div>
    </button>
  );
}

export default function RoomsListPage() {
  const navigate = useNavigate();
  const { listingId } = useParams();

  const [rooms, setRooms] = useState([]);
  const [q, setQ] = useState('');
  const [type, setType] = useState('all');
  const [sort, setSort] = useState('new');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const [listingTitle, setListingTitle] = useState('');
  const [canEdit, setCanEdit] = useState(false);

  const API_ORIGIN = useMemo(() => API_BASE_URL.replace(/\/api\/?$/, ''), []);

  const reload = useCallback(async () => {
    setLoading(true);
    setErr('');
    try {
      if (!listingId) {
        setRooms([]);
        setCanEdit(false);
        setListingTitle('');
        return;
      }

      const data = await listRoomsByListing(listingId);
      setRooms(data || []);

      // 👇 Ownership check for cookie sessions (no token required)
      try {
        const res = await fetchListingById(listingId);
        const me = getUser();
        const myId = String(getUserId(me));

        const candidates = new Set([
          String(getOwnerId(res?.data?.ownerId)),
          String(getOwnerId(res?.data?.owner)),
          String(getOwnerId(res?.data?.createdBy)),
          String(getOwnerId(res?.data?.userId)),
        ].filter(Boolean));

        setListingTitle(res?.data?.title || '');
        // ✅ require verified too to show Create button
        setCanEdit(Boolean(myId && isEmailVerified() && (candidates.has(myId) || me?.role === 'admin')));
      } catch {
        setCanEdit(false);
        setListingTitle('');
      }
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || 'Failed to load rooms');
      setRooms([]);
      setCanEdit(false);
      setListingTitle('');
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  useEffect(() => { reload(); }, [reload]);

  const filtered = useMemo(() => {
    let list = [...rooms];
    const query = q.trim().toLowerCase();

    if (query) {
      list = list.filter(
        (r) =>
          (r.title || '').toLowerCase().includes(query) ||
          (r.type || '').toLowerCase().includes(query) ||
          (Array.isArray(r.amenities) ? r.amenities : []).some((a) =>
            (a || '').toLowerCase().includes(query)
          )
      );
    }

    if (type !== 'all') list = list.filter((r) => (r.type || '').toLowerCase() === type);

    if (sort === 'new') {
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (sort === 'priceLow') {
      list.sort((a, b) => (a.pricePerNight || 0) - (b.pricePerNight || 0));
    } else if (sort === 'priceHigh') {
      list.sort((a, b) => (b.pricePerNight || 0) - (a.pricePerNight || 0));
    }

    return list;
  }, [rooms, q, type, sort]);

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Rooms</h1>
          <p className="text-gray-600 text-sm">
            Listing: <span className="font-mono">{listingId || '(none)'}</span>
            {listingTitle ? <span className="ml-2 text-gray-500">— {listingTitle}</span> : null}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full sm:w-auto">
          <input
            className="border rounded p-2"
            placeholder="Search title/type/amenity…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select className="border rounded p-2" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="all">All types</option>
            <option value="single">Single</option>
            <option value="double">Double</option>
            <option value="suite">Suite</option>
          </select>
          <select className="border rounded p-2" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="new">Newest</option>
            <option value="priceLow">Price: Low → High</option>
            <option value="priceHigh">Price: High → Low</option>
          </select>
        </div>
      </div>

      {!listingId ? (
        <div className="p-4 border rounded bg-white text-sm">
          This page lists rooms under a listing. Open it as:
          <pre className="mt-2 p-2 bg-gray-50 rounded">/listings/&lt;listingId&gt;/rooms</pre>
        </div>
      ) : loading ? (
        <p>Loading…</p>
      ) : err ? (
        <div className="p-4 border rounded bg-white">
          <p className="text-red-600 mb-2">{err}</p>
          <button className="px-3 py-1 rounded border" onClick={reload}>
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          onCreate={(id) => navigate(`/listings/${id}/rooms/new`)}
          listingId={listingId}
          canEdit={canEdit}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r) => (
            <RoomCard
              key={r._id}
              room={r}
              apiOrigin={API_ORIGIN}
              onOpen={() => navigate(`/listings/${listingId}/rooms/${r._id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
