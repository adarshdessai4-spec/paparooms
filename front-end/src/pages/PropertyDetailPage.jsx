// src/pages/PropertyDetailPage.jsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  fetchListingById,
  deleteListing as apiDeleteListing,
  publishListing as apiPublishListing,
} from '../services/listings';
import { listRoomsByListing } from '../services/roomsService';
import { getUser, isEmailVerified } from '../utils/storage';
import { ROUTES, API_BASE_URL } from '../utils/constants';
import { useAuth } from '../contexts/AuthContext';

// ===== Embla (Carousel)
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

/* -------------------- OYO-style Embla Carousel -------------------- */
function EmblaOyo({ images = [], title = '' }) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: images.length > 1 },
    [Autoplay({ playOnInit: false })]
  );

  const [emblaLbRef, emblaLbApi] = useEmblaCarousel(
    { loop: images.length > 1 },
    []
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (emblaApi) emblaApi.on('select', onSelect);
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!lightbox || !emblaLbApi) return;
    emblaLbApi.scrollTo(index, true);
  }, [lightbox, emblaLbApi, index]);

  const prev = () => emblaApi && emblaApi.scrollPrev();
  const next = () => emblaApi && emblaApi.scrollNext();

  if (!images?.length) return null;

  return (
    <>
      {/* HERO — show full image (no crop) */}
      <div className="relative w-full bg-black rounded-2xl overflow-hidden">
        <div className="h-[280px] sm:h-[360px] md:h-[440px] lg:h-[520px] xl:h-[560px]">
          <div className="overflow-hidden h-full" ref={emblaRef}>
            <div className="flex h-full">
              {images.map((src, i) => (
                <div className="min-w-0 flex-[0_0_100%] h-full grid place-items-center bg-black" key={src + i}>
                  <img
                    src={src}
                    alt={title}
                    className="max-h-full max-w-full object-contain cursor-zoom-in"
                    onClick={() => setLightbox(true)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 grid place-items-center h-10 w-10 rounded-full bg-white/90 hover:bg-white cursor-pointer"
              aria-label="Prev"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 absolute"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 grid place-items-center h-10 w-10 rounded-full bg-white/90 hover:bg-white cursor-pointer"
              aria-label="Next"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 absolute"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </>
        )}
      </div>

      {/* THUMBS */}
      {images.length > 1 && (
        <div className="mt-3 flex gap-3 overflow-x-auto no-scrollbar">
          {images.map((u, i) => (
            <button
              key={u + i}
              type="button"
              onClick={() => emblaApi && emblaApi.scrollTo(i)}
              className={`h-20 w-32 sm:h-24 sm:w-40 flex-none rounded-lg overflow-hidden p-0! cursor-pointer transition
                ${i === index ? 'ring-2 ring-black' : 'hover:opacity-90'}`}
              title={`Image ${i + 1}`}
            >
              <img
                src={u}
                alt=""
                className="h-full w-full object-cover pointer-events-none select-none"
              />
            </button>
          ))}
        </div>
      )}

      {/* LIGHTBOX (already contain) */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90">
          <button
            type="button"
            onClick={() => setLightbox(false)}
            className="thumb-btn absolute top-4 right-4 grid place-items-center h-10 w-10 rounded-full bg-white/20 hover:bg-white/30 text-white"
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6 absolute"><path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>

          <div className="h-full w-full flex flex-col place-items-center px-4 justify-center">
            <div className="relative w-full max-w-6xl -z-10">
              <div className="overflow-hidden" ref={emblaLbRef}>
                <div className="flex">
                  {images.map((src, i) => (
                    <div className="min-w-0 flex-[0_0_100%]" key={'lb' + src + i}>
                      <img src={src} alt="" className="w-full max-h-[80vh] object-contain flex items-center justify-center mt-12" />
                    </div>
                  ))}
                </div>
              </div>

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => emblaLbApi && emblaLbApi.scrollPrev()}
                    className="thumb-btn absolute left-2 top-1/2 -translate-y-1/2 grid place-items-center h-12 w-12 rounded-full bg-white/20 hover:bg-white/30 text-white"
                  >
                    <svg viewBox="0 0 24 24" className="h-7 w-7 absolute"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => emblaLbApi && emblaLbApi.scrollNext()}
                    className="thumb-btn absolute right-2 top-1/2 -translate-y-1/2 grid place-items-center h-12 w-12 rounded-full bg-white/20 hover:bg-white/30 text-white"
                  >
                    <svg viewBox="0 0 24 24" className="h-7 w-7 absolute"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar w-full max-w-6xl justify-center">
                {images.map((u, i) => (
                  <button
                    key={'lbl' + u + i}
                    type="button"
                    onClick={() => emblaLbApi && emblaLbApi.scrollTo(i)}
                    className={`thumb-btn h-16 w-24 flex-none rounded-md overflow-hidden border cursor-pointer
                      ${i === index ? 'ring-2 ring-white' : ''}`}
                  >
                    <img
                      src={u}
                      alt=""
                      className="h-full w-full object-cover pointer-events-none select-none"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar{display:none}
        .no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
        button, [role="button"] { -webkit-tap-highlight-color: transparent; }
        .thumb-btn { background: transparent !important; padding: 0 !important; outline: none !important; box-shadow: none !important; }
        .thumb-btn:focus,.thumb-btn:active,.thumb-btn:hover { background: transparent !important; }
        .thumb-btn::-moz-focus-inner { border: 0; padding: 0; }
      `}</style>
    </>
  );
}
/* -------------------- /Embla -------------------- */

const getOwnerId = (ownerId) => ownerId?.['_id'] || ownerId?.id || ownerId || '';
const getUserId  = (u) => u?._id || u?.id || '';
const normId = (v) => (v?.['_id'] || v?.id || v || '');

function resolveRoomImage(item, apiOrigin) {
  if (typeof item === 'string') {
    if (/^https?:\/\//i.test(item)) return item;
    if (item.startsWith('/uploads/')) return `${apiOrigin}${item}`;
    if (!item.includes('/')) return `${apiOrigin}/uploads/rooms/${item}`;
    return `${apiOrigin}/${item.replace(/^\/+/, '')}`;
  }
  if (item && typeof item === 'object') {
    const u = item.url || item.path || item.imageUrl || item.src || '';
    if (u) return resolveRoomImage(u, apiOrigin);
    if (item.filename) return `${apiOrigin}/uploads/rooms/${item.filename}`;
  }
  return '';
}

// Helper to show 10–30 words (default ~24 words) before "Read more"
const truncateWords = (str, maxWords = 24) => {
  if (!str) return '';
  const words = String(str).trim().split(/\s+/);
  if (words.length <= maxWords) return str;
  return words.slice(0, maxWords).join(' ') + '…';
};

const PropertyDetailPage = () => {
  const { id } = useParams(); // /property/:id
  const navigate = useNavigate();

  // ✅ Use cookie-session auth (no bearer token needed)
  const { isAuthenticated, user } = useAuth();
  const authedFallback = localStorage.getItem('oyoplus:isAuthed') === 'true';
  const authed = isAuthenticated || authedFallback;

  const me = user ?? getUser();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(true);

  const API_ORIGIN = useMemo(() => API_BASE_URL.replace(/\/api\/?$/, ''), []);

  const canEdit = useMemo(() => {
    if (!data || !me) return false;
    const myId = String(getUserId(me));
    const owner = String(getOwnerId(data.ownerId));
    return !!myId && (myId === owner || me?.role === 'admin');
  }, [data, me]);

  const verified = isEmailVerified(); // ✅ require verified for owner actions

  // ---- NEW: Description expand/collapse state ----
  const [descExpanded, setDescExpanded] = useState(false);
  const rawDesc = useMemo(() => (data?.description || '—'), [data]);
  const descNeedsToggle = useMemo(() => {
    const w = String(rawDesc).trim().split(/\s+/).length;
    return w > 24; // show toggle only if more than teaser length
  }, [rawDesc]);
  const shownDesc = useMemo(
    () => (descExpanded ? rawDesc : truncateWords(rawDesc, 24)),
    [descExpanded, rawDesc]
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const payload = await fetchListingById(id);
        const doc = payload?.data || payload;
        if (mounted) setData(doc);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!id) return;
      try {
        setRoomsLoading(true);
        const res = await listRoomsByListing(id);
        if (mounted) setRooms(Array.isArray(res) ? res : (res?.data || []));
      } catch (e) {
        console.error(e);
        if (mounted) setRooms([]);
      } finally {
        if (mounted) setRoomsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const onDelete = async () => {
    if (!window.confirm('Delete this listing? This cannot be undone.')) return;
    try {
      await apiDeleteListing(id);
      navigate(ROUTES.LISTINGS);
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || 'Delete failed');
    }
  };

  const onPublish = async (action) => {
    try {
      const updated = await apiPublishListing(id, action);
      const doc = updated?.data || updated;
      setData(doc);
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || 'Action failed');
    }
  };

  if (loading) return <div className="max-w-5xl mx-auto px-4 py-8">Loading…</div>;
  if (!data)   return <div className="max-w-5xl mx-auto px-4 py-8">Not found</div>;

  const galleryImages = (() => {
    const urls = (data.images || [])
      .map((i) => i?.url || i)
      .filter(Boolean);
    if (data.coverImage && !urls.includes(data.coverImage)) return [data.coverImage, ...urls];
    return urls;
  })();

  const { _id: listingId } = data || {};
  const fullAddress = [
    data.address?.line1,
    data.address?.city,
    data.address?.state,
    data.address?.country,
    data.address?.pincode,
  ].filter(Boolean).join(', ');

  const coords = Array.isArray(data.location?.coordinates) ? data.location.coordinates : null; // [lng, lat]

  /* -------- Small UI helpers -------- */
  // const RoomRow = ({ room }) => {
  //   const priceStr = typeof room.pricePerNight === 'number'
  //     ? room.pricePerNight.toLocaleString('en-IN')
  //     : room.pricePerNight;

  //   const img = (() => {
  //     const arr = Array.isArray(room.images) ? room.images : [];
  //     if (!arr.length) return '';
  //     return resolveRoomImage(arr[0], API_ORIGIN);
  //   })();

  //   return (
  //     <div className="border rounded-xl overflow-hidden bg-white w-full md:w-[571px]">
  //       <div className="flex flex-col-reverse md:flex-row justify-between w-full">
  //         {/* left: details */}
  //         <div className="p-4 flex flex-col justify-between">
  //           <div className="flex flex-col gap-3">
  //            <div className='flex items-center justify-between gap-3'>
  //              <h3 className="text-lg font-semibold line-clamp-1">{room.title}</h3>
  //             <span className="text-xs px-2 py-1 rounded bg-green-500 text-white border">{(room.type || '').toUpperCase()}</span>
  //            </div>
  //             <p className="text-sm text-gray-600 mt-1">
  //             Room size: {room.roomSize ? `${room.roomSize} sq ft approx` : '—'}
  //           </p>
  //           </div>
            

  //           <div className="mt-3 flex items-center justify-between">
  //             <div className="text-xl font-bold text-red-600">₹{priceStr}</div>
  //             <button
  //               className="px-4 py-2 rounded border hover:bg-gray-50"
  //               onClick={() => navigate(`/listings/${listingId}/rooms/${room._id}`)}
  //             >
  //               Select
  //             </button>
  //           </div>
  //         </div>

  //         {/* right: image */}
  //         <div className="w-full h-80 md:w-40 md:!h-40 ">
  //           {img ? (
  //             <img
  //               src={img}
  //               alt=""
  //               className="w-full !h-full object-center md:object-fil"
  //               onError={(e) => {
  //                 const src = e.currentTarget.getAttribute('src') || '';
  //                 if (src.includes('/uploads/images/')) {
  //                   e.currentTarget.src = src.replace('/uploads/images/', '/uploads/rooms/');
  //                 } else {
  //                   e.currentTarget.style.display = 'none';
  //                 }
  //               }}
  //             />
  //           ) : (
  //             <div className="w-full h-full grid place-items-center text-gray-500">No image</div>
  //           )}
  //         </div>
  //       </div>
  //     </div>
  //   );
  // };
// inside PropertyDetailPage.jsx
const RoomRow = ({ room }) => {
  const priceStr = typeof room.pricePerNight === 'number'
    ? room.pricePerNight.toLocaleString('en-IN')
    : room.pricePerNight;

  const img = (() => {
    const arr = Array.isArray(room.images) ? room.images : [];
    if (!arr.length) return '';
    return resolveRoomImage(arr[0], API_ORIGIN);
  })();

  return (
    <div className="border rounded-xl bg-white w-full md:w-[571px] overflow-hidden">
      {/* Keep content + image on their own columns, never overlapping */}
      <div className="flex flex-col-reverse md:flex-row items-stretch gap-4 p-4">
        {/* left: details */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold line-clamp-1">{room.title}</h3>
              <span className="text-xs px-2 py-1 rounded bg-green-500 text-white border">
                {(room.type || '').toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Room size: {room.roomSize ? `${room.roomSize} sq ft approx` : '—'}
            </p>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="text-xl font-bold text-red-600">₹{priceStr}</div>
            <button
              className="px-4 py-2 rounded text-white cursor-pointer transition
                         bg-gradient-to-r from-rose-500 via-fuchsia-500 to-indigo-500
                         hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fuchsia-400"
              onClick={() => navigate(`/listings/${listingId}/rooms/${room._id}`)}
            >
              Select
            </button>
          </div>
        </div>

        {/* right: image — square on desktop, tidy on mobile; never stretches */}
        <div className="w-full md:w-40">
          {/* Aspect wrapper ensures perfect square on md+, nice 4:3 on mobile */}
          <div className="relative w-full aspect-[8/6]  overflow-hidden rounded-md bg-gray-100">
            {img ? (
              <img
                src={img}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                onError={(e) => {
                  const src = e.currentTarget.getAttribute('src') || '';
                  if (src.includes('/uploads/images/')) {
                    e.currentTarget.src = src.replace('/uploads/images/', '/uploads/rooms/');
                  } else {
                    e.currentTarget.style.display = 'none';
                  }
                }}
              />
            ) : (
              <div className="absolute inset-0 grid place-items-center text-gray-500">No image</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Gallery */}
      <EmblaOyo images={galleryImages} title={data.title} />

      {/* Header + CTAs */}
      <div className="mt-6 space-y-3">
        <div className="text-xs uppercase text-gray-500">
          {data.address?.city}, {data.address?.state}
        </div>
        <h1 className="text-3xl font-bold pb-6">{data.title}</h1>

        {/* About / Description */}
        <div className="text-gray-700 flex flex-col gap-2.5">
          <span className="text-2xl font-bold text-black">About this OYO</span>

          {/* NEW: teaser/full text with toggle */}
          <p
            id="listing-desc"
            className={`text-[15px] leading-6 ${
              descExpanded ? 'text-gray-800' : 'text-gray-700'
            } bg-gradient-to-r from-rose-50 to-rose-100/60 rounded-xl px-3 py-2`}
          >
            {shownDesc}
          </p>

          {descNeedsToggle && (
            <button
              type="button"
              aria-controls="listing-desc"
              aria-expanded={descExpanded}
              onClick={() => setDescExpanded((v) => !v)}
              className="self-start text-sm px-3 py-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition"
            >
              {descExpanded ? 'Read less' : 'Read more'}
            </button>
          )}
        </div>

        <div className="pt-4">
          <div className="text-sm font-semibold mb-1">Status</div>
          <div className="inline-block text-xs px-2 py-1 bg-gray-100 rounded-full">{data.status}</div>
        </div>

        {/* Owner/admin actions (kept) */}
        {canEdit && authed && verified && (
          <div className="pt-4 flex flex-wrap gap-2">
            <Link
              to={`/property/${listingId}/edit`}
              style={{ color: 'white' }}
              className="px-4 py-2 rounded-lg bg-black text-white hover:opacity-90 cursor-pointer"
            >
              Edit
            </Link>
            <button
              type="button"
              onClick={onDelete}
              className="px-4 py-2 rounded-lg border hover:bg-gray-50 cursor-pointer"
            >
              Delete
            </button>
            {data.status !== 'published' && (
              <button
                type="button"
                onClick={() => onPublish('publish')}
                className="px-3 py-2 rounded-lg bg-green-600 text-white hover:opacity-90 cursor-pointer"
              >
                Publish
              </button>
            )}
            {data.status === 'published' && (
              <button
                type="button"
                onClick={() => onPublish('unpublish')}
                className="px-3 py-2 rounded-lg bg-yellow-500 text-white hover:opacity-90 cursor-pointer"
              >
                Unpublish
              </button>
            )}
            <button
              type="button"
              onClick={() => onPublish('archive')}
              className="px-3 py-2 rounded-lg bg-gray-700 text-white hover:opacity-90 cursor-pointer"
            >
              Archive
            </button>
            <Link
              to={`/listings/${listingId}/rooms/new`}
              className="px-4 py-2 rounded-lg bg-cyan-200 text-white hover:opacity-90 cursor-pointer"
            >
              Create Room
            </Link>
          </div>
        )}
      </div>

      {/* Choose your room */}
      <section className="mt-8">
        <h2 className="text-2xl font-bold mb-3">Choose your room</h2>
        {roomsLoading ? (
          <div className="p-4 border rounded-xl bg-white">Loading rooms…</div>
        ) : rooms.length === 0 ? (
          <div className="p-4 border rounded-xl bg-white">No rooms available for this listing.</div>
        ) : (
          <div className="flex flex-col gap-4">
            {rooms.map((r, i) => (
              <RoomRow key={r._id || i} room={r} />
            ))}
          </div>
        )}
      </section>

      {/* Amenities (listing-level) */}
      <section className="mt-8  rounded-xl p-4 bg-white">
        <h2 className="text-xl font-semibold mb-3">Amenities</h2>
        {Array.isArray(data.amenities) && data.amenities.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {data.amenities.map((a, i) => (
              <span key={i} className="inline-block px-3 py-1 rounded-full text-xs border text-white bg-gray-400">
                {a}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-sm">No amenities listed.</p>
        )}
      </section>

      {/* Map */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Location</h2>
        <div className="text-sm text-gray-700 mb-2">{fullAddress || '—'}</div>
        <div className="w-full h-[320px] rounded-xl overflow-hidden border bg-gray-100">
          {coords && coords.length === 2 ? (
            <iframe
              title="map"
              width="100%" height="100%" loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${encodeURIComponent(coords[1] + ',' + coords[0])}&z=15&output=embed`}
            />
          ) : fullAddress ? (
            <iframe
              title="map"
              width="100%" height="100%" loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${encodeURIComponent(fullAddress)}&z=15&output=embed`}
            />
          ) : (
            <div className="w-full h-full grid place-items-center text-gray-500">Map not available</div>
          )}
        </div>
      </section>

      {/* Reviews (static placeholder) */}
      <section className="mt-8  rounded-xl p-4 bg-white">
        <h2 className="text-xl font-semibold mb-3">Ratings and Reviews</h2>
        <div className="flex items-center gap-3">
          <div className="text-2xl font-bold bg-green-400 px-2 py-2 rounded-md text-white">4.3</div>
          <div className="text-sm text-orange-600">Very good • 120 reviews</div>
        </div>
        <ul className="mt-3 list-disc pl-5 text-sm text-gray-700 space-y-1">
          <li>Clean rooms and friendly staff.</li>
          <li>Great location near transit.</li>
          <li>Breakfast could be improved.</li>
        </ul>
      </section>

      {/* Hotel Rules / Policies */}
      <section className="mt-8  rounded-xl p-4 bg-white">
        <h2 className="text-xl font-semibold mb-3">Hotel Rules & Policies</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="border rounded-lg p-3">
            <div className="text-sm text-red-600">Check-in</div>
            <div className="text-lg font-semibold">12:00 PM</div>
          </div>
          <div className="border rounded-lg p-3">
            <div className="text-sm text-green-600">Check-out</div>
            <div className="text-lg font-semibold">11:00 AM</div>
          </div>
        </div>
        <ul className="mt-4 list-disc pl-5 text-sm text-gray-700 space-y-1">
          <li>Valid government ID required at check-in.</li>
          <li>No smoking in rooms.</li>
          <li>Pets not allowed unless specified.</li>
        </ul>
      </section>
    </div>
  );
};

export default PropertyDetailPage;
