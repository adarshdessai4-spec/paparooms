import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import { createBooking } from '../services/bookings';
import { BOOKING_CONSTANTS, ROUTES, API_BASE_URL } from '../utils/constants';
import { getUser, isEmailVerified } from '../utils/storage';
import { fetchListingById } from '../services/listings';
import { getRoomById } from '../services/roomsService';

const toISODate = (d) => { const x = new Date(d); x.setHours(0,0,0,0); return x.toISOString().slice(0,10); };
const daysDiff = (a, b) => { const A = new Date(a); A.setHours(0,0,0,0); const B = new Date(b); B.setHours(0,0,0,0); return Math.round((B - A) / (1000*60*60*24)); };

function PriceBox({ nights, pricePerNight }) {
  const base = Math.max(nights, 0) * (Number(pricePerNight) || 0);
  const tax = base * BOOKING_CONSTANTS.taxRate;
  const total = base + tax + BOOKING_CONSTANTS.serviceFee;
  return (
    <aside className="rounded-xl p-4 bg-white/60 backdrop-blur space-y-3 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
      <h3 className="text-lg font-bold mb-3 text-2xl">Price Summary</h3>
      <div className="text-sm grid gap-2">
        <div className="flex justify-between"><span>{nights} night{nights===1?'':'s'} × ₹{(pricePerNight||0).toLocaleString('en-IN')}</span><span>₹{base.toLocaleString('en-IN')}</span></div>
        <div className="flex justify-between"><span>Tax ({Math.round(BOOKING_CONSTANTS.taxRate*100)}%)</span><span>₹{tax.toFixed(0).toLocaleString('en-IN')}</span></div>
        <div className="flex justify-between"><span>Service fee</span><span>₹{BOOKING_CONSTANTS.serviceFee.toLocaleString('en-IN')}</span></div>
        <hr />
        <div className="flex justify-between font-bold text-lg"><span>Total</span><span className="text-green-600">₹{total.toFixed(0).toLocaleString('en-IN')}</span></div>
      </div>
    </aside>
  );
}

export default function BookingPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const user = getUser();
  const verified = isEmailVerified(); // banner only

  const stateListingId = location.state?.listingId;
  const seed = location.state?.seed || {};
  const prefilledRoom = location.state?.room;

  const today = useMemo(() => toISODate(new Date()), []);
  const [checkIn, setCheckIn] = useState(seed.checkIn || today);
  const [checkOut, setCheckOut] = useState(seed.checkOut || toISODate(new Date(Date.now() + 86400000)));
  const [guests, setGuests] = useState(seed.guests || 1);
  const nights = useMemo(() => Math.max(0, daysDiff(checkIn, checkOut)), [checkIn, checkOut]);

  const [room, setRoom] = useState(null);
  const [listingTitle, setListingTitle] = useState('');
  const [loading, setLoading] = useState(true);

  const API_ORIGIN = useMemo(() => API_BASE_URL.replace(/\/api\/?$/, ''), []);
  const imageUrl = useMemo(() => {
    const img = room?.images?.[0];
    if (!img) return '';
    if (typeof img === 'string') {
      if (/^https?:\/\//.test(img)) return img;
      if (img.startsWith('/uploads/')) return `${API_ORIGIN}${img}`;
      if (!img.includes('/')) return `${API_ORIGIN}/uploads/images/${img}`;
      return `${API_ORIGIN}/${img.replace(/^\/+/, '')}`;
    }
    return img?.url || img?.path || '';
  }, [room, API_ORIGIN]);

  useEffect(() => {
    (async () => {
      try {
        if (!stateListingId) {
          alert('Missing listing reference. Please start from the room page.');
          navigate(-1);
          return;
        }
        setLoading(true);
        if (prefilledRoom && prefilledRoom._id === roomId) setRoom(prefilledRoom);
        else {
          const r = await getRoomById(stateListingId, roomId);
          setRoom(r || null);
        }
        const lres = await fetchListingById(stateListingId);
        setListingTitle(lres?.data?.title || lres?.data?.name || '');
      } catch (e) {
        alert(e?.response?.data?.message || 'Failed to load room/listing');
      } finally {
        setLoading(false);
      }
    })();
  }, [roomId, stateListingId, prefilledRoom, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    if (!user) { navigate(ROUTES.AUTH); return; } // login required
    if (!room?._id) return;
    if (daysDiff(checkIn, checkOut) <= 0) { alert('Check-out must be after check-in.'); return; }

    try {
      const payload = { roomId: room._id, checkIn, checkOut, guests: Number(guests) || 1 };
      const data = await createBooking(payload);
      if (data?.success) {
        navigate(`/book/${data.booking._id}/result`, {
          state: { booking: data.booking, listingTitle, room }
        });
      } else {
        alert(data?.message || 'Booking failed.');
      }
    } catch (err) {
      alert(err?.response?.data?.message || 'Booking failed.');
    }
  };

  if (loading) return <div className="max-w-6xl mx-auto p-4">Loading booking…</div>;
  if (!room) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <p className="text-red-600">Room not found.</p>
        <button className="mt-3 px-4 py-2 rounded border cursor-pointer" onClick={() => navigate(-1)}>Go back</button>
      </div>
    );
  }

  const price = Number(room.pricePerNight) || 0;

  return (
    <div className="max-w-6xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <section className="lg:col-span-2 space-y-4">
        <div className="flex gap-3 items-center">
          {imageUrl ? (
            <img src={imageUrl} alt={room.title} className="h-20 w-28 object-cover rounded-lg" />
          ) : (
            <div className="h-20 w-28 rounded-lg bg-gray-200 grid place-items-center text-xs text-gray-600">No image</div>
          )}
          <div>
            <h1 className="text-xl font-bold">{room.title}</h1>
            <p className="text-sm text-gray-600">{listingTitle || '—'}</p>
          </div>
        </div>

        {!verified && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 text-amber-800 p-3 text-sm">
            Tip: Verify email & complete KYC later to unlock host features. You can still book now. ✨
          </div>
        )}

        <form onSubmit={submit} className="rounded-xl p-4 bg-white space-y-4 border">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-600">Check-in</label>
              <input
                type="date"
                className="mt-1 w-full border rounded p-2"
                min={toISODate(new Date())}
                value={checkIn}
                onChange={e => {
                  const v = e.target.value;
                  setCheckIn(v);
                  if (daysDiff(v, checkOut) <= 0) {
                    const d = new Date(v); d.setDate(d.getDate()+1);
                    setCheckOut(toISODate(d));
                  }
                }}
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Check-out</label>
              <input
                type="date"
                className="mt-1 w-full border rounded p-2"
                min={toISODate(new Date(new Date(checkIn).getTime() + 86400000))}
                value={checkOut}
                onChange={e => setCheckOut(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Guests</label>
              <input
                type="number"
                min="1"
                max={room.maxGuests ?? room.maxGuest ?? 10}
                className="mt-1 w-full border rounded p-2"
                value={guests}
                onChange={e => setGuests(e.target.value)}
              />
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <span className="font-medium">{nights}</span> night{nights===1?'':'s'} • ₹{price.toLocaleString('en-IN')} per night
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" className="px-5 py-2 rounded bg-emerald-500 text-white cursor-pointer">Create Booking</button>
            <Link to={ROUTES.PROPERTY_DETAIL.replace(':id', room.listingId || stateListingId)} className="px-4 py-2 rounded border cursor-pointer">Back to property</Link>
          </div>

          <p className="text-xs text-gray-500">You’ll receive emails for the booking and next steps.</p>
        </form>
      </section>

      <PriceBox nights={nights} pricePerNight={price} />
    </div>
  );
}
