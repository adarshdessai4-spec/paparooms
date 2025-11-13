// src/pages/MyBookingsPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { getMyBookings } from '../services/bookings';

function money(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return '—';
  return `₹${n.toLocaleString('en-IN')}`;
}

function BookingCard({ b }) {
  const title =
    b?.room?.title ||
    b?.roomTitle ||
    b?.listing?.title ||
    b?.title ||
    'Room';

  const total =
    (typeof b?.totalAmount === 'number' && b.totalAmount) ||
    (typeof b?.amount === 'number' && b.amount) ||
    null;

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        <span className="text-sm px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border">
          {b?.status || 'pending'}
        </span>
      </div>
      <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-gray-700">
        <div><b>Check-in:</b> {b?.checkIn ? new Date(b.checkIn).toDateString() : '—'}</div>
        <div><b>Check-out:</b> {b?.checkOut ? new Date(b.checkOut).toDateString() : '—'}</div>
        <div><b>Guests:</b> {b?.guests ?? '—'}</div>
        <div><b>Total:</b> {total !== null ? money(total) : '—'}</div>
      </div>
    </div>
  );
}

export default function MyBookingsPage() {
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setErr('');
    try {
      // quick retry to handle cold-start
      let arr;
      try {
        arr = await getMyBookings(); // <-- already an array
      } catch {
        await new Promise(r => setTimeout(r, 900));
        arr = await getMyBookings();
      }
      setList(Array.isArray(arr) ? arr : []);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Could not load your bookings.';
      setErr(msg);
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-4">
        <div className="animate-pulse grid gap-3">
          <div className="h-6 w-48 bg-gray-200 rounded" />
          <div className="h-24 bg-gray-200 rounded" />
          <div className="h-24 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="rounded-lg border border-amber-300 bg-amber-50 text-amber-800 p-3">
          {err.includes('timeout') || err.includes('Network')
            ? 'The server is waking up. Please try again.'
            : err}
        </div>
        <button onClick={load} className="mt-3 px-4 py-2 rounded border cursor-pointer">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">My bookings</h1>
      {list && list.length > 0 ? (
        <div className="grid gap-3">
          {list.map((b) => <BookingCard key={b?._id || b?.id} b={b} />)}
        </div>
      ) : (
        <p className="text-gray-600">No bookings yet.</p>
      )}
    </div>
  );
}
