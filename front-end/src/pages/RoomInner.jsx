import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getRoomById, deleteRoom } from '../services/roomsService';
import { API_BASE_URL } from '../utils/constants';
import { fetchListingById } from '../services/listings';
import { getUser, isEmailVerified } from '../utils/storage';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

const normId = (v) => (v?.['_id'] || v?.id || v || '');
const getUserId  = (u) => u?._id || u?.id || '';

function Chip({ children }) {
  return (
    <span className="inline-block px-3 py-1 rounded-full text-xs border bg-white text-rose-600">{children}</span>
  );
}

function resolveImageUrl(item, apiOrigin) {
  if (typeof item === 'string') {
    if (/^https?:\/\//i.test(item)) return item;
    if (item.startsWith('/uploads/')) return `${apiOrigin}${item}`;
    if (!item.includes('/')) return `${apiOrigin}/uploads/images/${item}`;
    return `${apiOrigin}/${item.replace(/^\/+/, '')}`;
  }
  if (item && typeof item === 'object') {
    const u = item.url || item.path || item.imageUrl || item.src || '';
    if (u) return resolveImageUrl(u, apiOrigin);
    if (item.filename) return `${apiOrigin}/uploads/images/${item.filename}`;
  }
  return '';
}

function toAmenityArray(v) {
  const out = new Set();
  const addFromString = (s) => {
    const t = String(s || '').trim();
    if (!t) return;
    if (/^\s*\[.*\]\s*$/.test(t)) {
      try {
        const parsed = JSON.parse(t);
        if (Array.isArray(parsed)) {
          parsed.forEach(x => {
            const y = String(x || '').replace(/^"+|"+$/g, '').trim();
            if (y) out.add(y);
          });
          return;
        }
      } catch {}
    }
    t.replace(/^\[|\]$/g, '')
      .split(',')
      .map(x => x.replace(/^"+|"+$/g, '').trim())
      .filter(Boolean)
      .forEach(x => out.add(x));
  };
  if (Array.isArray(v)) {
    v.forEach(item => {
      if (typeof item === 'string') addFromString(item);
      else if (Array.isArray(item)) item.forEach(x => { const y = String(x || '').trim(); if (y) out.add(y); });
      else if (item != null) { const y = String(item).trim(); if (y) out.add(y); }
    });
  } else if (typeof v === 'string') addFromString(v);

  const cleaned = Array.from(out)
    .map(s => s.replace(/^"+|"+$/g, '').trim())
    .filter(Boolean)
    .filter(s => !/^\s*\[.*\]\s*$/.test(s) && s.toLowerCase() !== 'null' && s !== '[]');

  return Array.from(new Set(cleaned));
}

function EmblaOyo({ images = [], title = '' }) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: images.length > 1 }, [Autoplay({ playOnInit: false })]);
  const [emblaLbRef, emblaLbApi] = useEmblaCarousel({ loop: images.length > 1 }, []);
  const onSelect = useCallback(() => { if (emblaApi) setIndex(emblaApi.selectedScrollSnap()); }, [emblaApi]);
  useEffect(() => { emblaApi?.on('select', onSelect); }, [emblaApi, onSelect]);
  useEffect(() => { if (lightbox && emblaLbApi) emblaLbApi.scrollTo(index, true); }, [lightbox, emblaLbApi, index]);

  if (!images?.length) {
    return (
      <div className="w-full aspect-[16/9] rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 grid place-items-center text-slate-300 animate-fade-in">
        No image added
      </div>
    );
  }

  const swapFolder = (src) => {
    if (src.includes('/uploads/images/')) return src.replace('/uploads/images/', '/uploads/rooms/');
    if (src.includes('/uploads/rooms/')) return src.replace('/uploads/rooms/', '/uploads/images/');
    return src;
  };

  return (
    <>
      <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 to-black animate-fade-in">
        <div className="h-[280px] sm:h-[360px] md:h-[440px] lg:h-[520px] xl:h-[560px]">
          <div className="overflow-hidden h-full" ref={emblaRef}>
            <div className="flex h-full">
              {images.map((src, i) => (
                <div className="min-w-0 flex-[0_0_100%] h-full grid place-items-center bg-black" key={src + i}>
                  <img
                    src={src}
                    alt={title}
                    className="max-h-full max-w-full object-contain cursor-zoom-in transition-transform duration-300 hover:scale-[1.015]"
                    onClick={() => setLightbox(true)}
                    onError={(e) => {
                      const current = e.currentTarget.getAttribute('src') || '';
                      const swapped = swapFolder(current);
                      if (swapped !== current) e.currentTarget.src = swapped;
                      else e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={() => emblaApi && emblaApi.scrollPrev()}
              className="absolute left-3 top-1/2 -translate-y-1/2 grid place-items-center h-10 w-10 rounded-full bg-white/90 hover:bg-white shadow"
              aria-label="Prev"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 absolute"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button
              onClick={() => emblaApi && emblaApi.scrollNext()}
              className="absolute right-3 top-1/2 -translate-y-1/2 grid place-items-center h-10 w-10 rounded-full bg-white/90 hover:bg-white shadow"
              aria-label="Next"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 absolute"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-3 overflow-x-auto no-scrollbar">
          {images.map((u, i) => (
            <button
              key={u + i}
              onClick={() => emblaApi && emblaApi.scrollTo(i)}
              className={`h-20 w-32 sm:h-24 sm:w-40 flex-none rounded-lg overflow-hidden cursor-pointer transition
                ${i === index ? 'ring-2 ring-rose-500' : 'hover:opacity-90'}`}
            >
              <img
                src={u}
                alt=""
                className="h-full w-full object-cover"
                onError={(e) => {
                  const cur = e.currentTarget.getAttribute('src') || '';
                  const swapped = cur.includes('/uploads/images/') ? cur.replace('/uploads/images/', '/uploads/rooms/') : cur;
                  if (swapped !== cur) e.currentTarget.src = swapped;
                }}
              />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90">
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-4 right-4 grid place-items-center h-10 w-10 rounded-full bg-white/20 hover:bg-white/30 text-white"
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6 absolute"><path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>

          <div className="h-full w-full flex flex-col place-items-center px-4 justify-center">
            <div className="relative w-full max-w-6xl">
              <div className="overflow-hidden" ref={emblaLbRef}>
                <div className="flex">
                  {images.map((src, i) => (
                    <div className="min-w-0 flex-[0_0_100%]" key={'lb' + src + i}>
                      <img
                        src={src}
                        alt=""
                        className="w-full max-h-[80vh] object-contain"
                        onError={(e) => {
                          const cur = e.currentTarget.getAttribute('src') || '';
                          const swapped = cur.includes('/uploads/images/') ? cur.replace('/uploads/images/', '/uploads/rooms/') : cur;
                          if (swapped !== cur) e.currentTarget.src = swapped;
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {images.length > 1 && (
                <>
                  <button
                    onClick={() => emblaLbApi && emblaLbApi.scrollPrev()}
                    className="absolute left-2 top-1/2 -translate-y-1/2 grid place-items-center h-12 w-12 rounded-full bg-white/20 hover:bg-white/30 text-white"
                  >
                    <svg viewBox="0 0 24 24" className="h-7 w-7 absolute"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                  <button
                    onClick={() => emblaLbApi && emblaLbApi.scrollNext()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 grid place-items-center h-12 w-12 rounded-full bg-white/20 hover:bg-white/30 text-white"
                  >
                    <svg viewBox="0 0 24 24" className="h-7 w-7 absolute"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
      .animate-fade-in{animation:fadein .5s ease-out}@keyframes fadein{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </>
  );
}

export default function RoomInner() {
  const { listingId, id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canEdit, setCanEdit] = useState(false);
  const [loadError, setLoadError] = useState('');

  const verified = isEmailVerified();
  const API_ORIGIN = useMemo(() => API_BASE_URL.replace(/\/api\/?$/, ''), []);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const obj = await getRoomById(listingId, id);
      setRoom(obj || null);

      // owner check
      const me = getUser();
      const myId = String(getUserId(me));
      const candidates = new Set([]);
      try {
        const listingRes = await fetchListingById(listingId);
        candidates.add(String(normId(listingRes?.data?.ownerId)));
        candidates.add(String(normId(listingRes?.data?.owner)));
        candidates.add(String(normId(listingRes?.data?.createdBy)));
        candidates.add(String(normId(listingRes?.data?.userId)));
      } catch {}

      candidates.add(String(normId(obj?.ownerId)));
      candidates.add(String(normId(obj?.owner)));
      candidates.add(String(normId(obj?.createdBy)));
      candidates.add(String(normId(obj?.userId)));

      setCanEdit(Boolean(myId && (candidates.has(myId) || me?.role === 'admin')));
      if (!obj) setLoadError('Room not found.');
    } catch (e) {
      setRoom(null);
      const msg = e?.response?.data?.message || e?.message || 'Failed to load room.';
      setLoadError(msg);
      setCanEdit(false);
    } finally {
      setLoading(false);
    }
  }, [listingId, id]);

  useEffect(() => { load(); }, [load]);

  const safeImages = useMemo(
    () => (room?.images || []).map((it) => resolveImageUrl(it, API_ORIGIN)).filter(Boolean),
    [room, API_ORIGIN]
  );

  if (loading) return <div className="max-w-6xl mx-auto p-4">Loading…</div>;

  if (!room) {
    return (
      <div className="max-w-6xl mx-auto p-4 space-y-3">
        <p className="text-red-600">{loadError || 'Room not found.'}</p>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded border" onClick={() => navigate(`/listings/${listingId}/rooms`)}>Go to Rooms</button>
          <button className="px-4 py-2 rounded border" onClick={load}>Try Again</button>
        </div>
      </div>
    );
  }

  const createdStr = room.createdAt ? new Date(room.createdAt).toLocaleString() : '(not set)';
  const priceStr = typeof room.pricePerNight === 'number'
    ? room.pricePerNight.toLocaleString('en-IN')
    : room.pricePerNight;

  const handleDelete = async () => {
    if (!window.confirm('Delete this room?')) return;
    try {
      await deleteRoom(listingId, room._id);
      navigate(`/listings/${listingId}/rooms`);
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-0 sm:p-4">
      {/* gallery */}
      <EmblaOyo images={safeImages} title={room.title} />

      {/* header */}
      <div className="px-4 sm:px-0 mt-4 sm:mt-6 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl sm:text-2xl font-bold">{room.title}</h1>
          <div className="text-right">
            <div className="text-xl sm:text-2xl font-bold text-emerald-500">₹{priceStr}</div>
            <div className="text-xs text-rose-500">per night</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip>{(room.type || '').toUpperCase()}</Chip>
          <Chip>Max {room.maxGuests ?? room.maxGuest} Guest(s)</Chip>
          <Chip>{room.bedInfo || '(no bed info)'}</Chip>
          <Chip>Created: {createdStr}</Chip>
        </div>
      </div>

      {/* grid */}
      <div className="px-4 sm:px-0 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* amenities */}
          {(() => {
            const Amenities = () => {
              const [showAll, setShowAll] = useState(false);
              const Fallback = (
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" />
                </svg>
              );
              const norm = (s) => String(s || '').toLowerCase().trim();
              const icons = {
                wifi: (<svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 9a16 16 0 0 1 20 0" /><path d="M5 12.5a11 11 0 0 1 14 0" /><path d="M8.5 15.5a6 6 0 0 1 7 0" /><path d="M12 18h.01" /></svg>),
                ac: (<svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 8h18M7 16v-4m10 4v-4M5 12h14a2 2 0 0 0 0-4H5a2 2 0 0 0 0 4Z" /></svg>),
                tv: (<svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M12 18v3" /></svg>),
                parking: (<svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 20V4h7a4 4 0 0 1 0 8H6" /></svg>),
                breakfast: (<svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 10h12a4 4 0 0 0 0-8H4zM4 10v8a2 2 0 0 0 2 2h8" /></svg>),
                pool: (<svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 16c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2 2 2 4 2" /><path d="M6 6c0-2 4-2 4 0v10" /><path d="M14 6c0-2 4-2 4 0v10" /></svg>),
                gym: (<svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 6l12 12M18 6L6 18" /></svg>),
                lift: (<svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="6" y="3" width="12" height="18" rx="2" /><path d="M10 7h4M10 12h4M10 17h4" /></svg>),
                'power backup': (<svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" /></svg>),
                heater: (<svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 20s2-2 2-6-2-6-2-6M12 20s2-2 2-6-2-6-2-6M18 20s2-2 2-6-2-6-2-6" /></svg>),
                'room service': (<svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15H3a6 6 0 0 1 12 0" /><path d="M12 9V7" /></svg>),
              };
              const getIcon = (label) => icons[norm(label)] || Fallback;

              const list = useMemo(() => toAmenityArray(room?.amenities), [room]);
              const visible = showAll ? list : list.slice(0, 6);

              return (
                <section className="rounded-xl p-4 bg-gradient-to-br from-white to-rose-50/60">
                  <h2 className="text-lg font-semibold mb-3">Amenities</h2>
                  {list.length ? (
                    <>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {visible.map((a, i) => (
                          <span key={i} className="inline-flex items-center gap-2 text-xs sm:text-sm px-3 py-2 rounded-full border bg-white/90">
                            <span className="shrink-0 text-gray-700">{getIcon(a)}</span>
                            <span className="truncate">{a}</span>
                          </span>
                        ))}
                      </div>
                      {list.length > 6 && (
                        <button
                          type="button"
                          onClick={() => setShowAll((v) => !v)}
                          className="mt-3 text-xs sm:text-sm px-3 py-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition"
                        >
                          {showAll ? 'Show less' : 'Show more'}
                        </button>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-600 text-sm">No amenities listed.</p>
                  )}
                </section>
              );
            };
            return <Amenities />;
          })()}

          <section className="rounded-xl p-4 bg-gradient-to-br from-white to-amber-50/60">
            <h2 className="text-lg font-semibold mb-2">Cancellation Policy</h2>
            <p className="font-medium pl-1 pt-2 text-amber-700">{room.cancellationPolicy || '—'}</p>
          </section>
        </div>

        {/* booking widget (dates are required before navigation) */}
        <aside className="rounded-xl p-4 bg-white/60 backdrop-blur space-y-3 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
          <h3 className="text-lg font-bold mb-3 text-2xl">Book this stay</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-600" htmlFor="bk-checkin">Check-in</label>
              <input id="bk-checkin" type="date" className="mt-1 w-full border rounded p-2" />
            </div>
            <div>
              <label className="text-xs text-gray-600" htmlFor="bk-checkout">Check-out</label>
              <input id="bk-checkout" type="date" className="mt-1 w-full border rounded p-2" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-600" htmlFor="bk-guests">Guests</label>
            <input
              id="bk-guests"
              type="number"
              min="1"
              max={room.maxGuests ?? room.maxGuest ?? 10}
              className="mt-1 w-full border rounded p-2"
              defaultValue={1}
            />
          </div>
          <button
            className="w-full py-2 rounded bg-emerald-500 text-white cursor-pointer hover:bg-emerald-600 transition"
            onClick={() => {
              const ci = document.getElementById('bk-checkin')?.value;
              const co = document.getElementById('bk-checkout')?.value;
              const gs = Number(document.getElementById('bk-guests')?.value || 1);

              if (!ci || !co) {
                alert('Please select both Check-in and Check-out dates.');
                return;
              }
              const A = new Date(ci); A.setHours(0,0,0,0);
              const B = new Date(co); B.setHours(0,0,0,0);
              if (B <= A) {
                alert('Check-out must be after check-in.');
                return;
              }

              // ✅ route matches App.jsx: /book/:roomId
              navigate(`/book/${room._id}`, {
                state: { listingId, room, seed: { checkIn: ci, checkOut: co, guests: gs } }
              });
            }}
          >
            Continue
          </button>
          <p className="text-xs text-gray-500">You’ll review before creating the booking.</p>
        </aside>
      </div>

      {/* actions */}
      <div className="px-4 sm:px-0 my-8 flex items-center justify-between">
        <Link className="px-4 py-2 rounded border cursor-pointer" to={`/listings/${listingId}/rooms`}>Back to list</Link>
        {canEdit && verified && (
          <div className="flex gap-2">
            <Link className="px-4 py-2 rounded border cursor-pointer" to={`/listings/${listingId}/rooms/${room._id}/edit`}>Edit</Link>
            <button className="px-4 py-2 rounded border text-red-600 cursor-pointer" onClick={handleDelete}>Delete</button>
          </div>
        )}
      </div>
    </div>
  );
}
