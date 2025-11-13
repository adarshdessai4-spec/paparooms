// src/pages/OwnerBookingsPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { getOwnerBookings } from '../services/bookings';

function money(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return '—';
  return `₹${n.toLocaleString('en-IN')}`;
}

function Row({ b }) {
  const guest =
    b?.guest?.name ||
    b?.guest?.email ||
    b?.guestName ||
    '—';

  const roomTitle =
    b?.room?.title ||
    b?.roomTitle ||
    b?.listing?.title ||
    '—';

  const total =
    (typeof b?.totalAmount === 'number' && b.totalAmount) ||
    (typeof b?.amount === 'number' && b.amount) ||
    null;

  return (
    <tr className="border-b">
      <td className="p-2">{guest}</td>
      <td className="p-2">{roomTitle}</td>
      <td className="p-2">{b?.checkIn ? new Date(b.checkIn).toDateString() : '—'}</td>
      <td className="p-2">{b?.checkOut ? new Date(b.checkOut).toDateString() : '—'}</td>
      <td className="p-2">{b?.status || 'pending'}</td>
      <td className="p-2">{total !== null ? money(total) : '—'}</td>
    </tr>
  );
}

export default function OwnerBookingsPage() {
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setErr('');
    try {
      let arr;
      try {
        arr = await getOwnerBookings(); // <-- already an array
      } catch {
        await new Promise(r => setTimeout(r, 900));
        arr = await getOwnerBookings();
      }
      setRows(Array.isArray(arr) ? arr : []);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Could not load owner bookings.';
      setErr(msg);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="animate-pulse grid gap-3">
          <div className="h-6 w-60 bg-gray-200 rounded" />
          <div className="h-40 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="max-w-4xl mx-auto p-4">
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
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-3">Owner bookings</h1>
      {rows && rows.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="p-2 text-left">Guest</th>
                <th className="p-2 text-left">Room</th>
                <th className="p-2 text-left">Check-in</th>
                <th className="p-2 text-left">Check-out</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => <Row key={b?._id || b?.id} b={b} />)}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-600">No bookings for your properties yet.</p>
      )}
    </div>
  );
}
