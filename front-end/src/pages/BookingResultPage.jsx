// src/pages/BookingResultPage.jsx
import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';

export default function BookingResultPage() {
  const { bookingId } = useParams();
  const { state } = useLocation();
  const booking = state?.booking;
  const room = state?.room;
  const listingTitle = state?.listingTitle;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">Booking Created</h1>
      <p className="text-gray-700 mb-4">
        Your booking request has been created. Please check your email for details.
      </p>

      <div className="rounded-lg border bg-white p-4 space-y-2">
        <div><b>Booking ID:</b> {booking?._id || bookingId}</div>
        {room?.title && <div><b>Room:</b> {room.title}</div>}
        {listingTitle && <div><b>Listing:</b> {listingTitle}</div>}
        {booking?.checkIn && <div><b>Check-in:</b> {new Date(booking.checkIn).toDateString()}</div>}
        {booking?.checkOut && <div><b>Check-out:</b> {new Date(booking.checkOut).toDateString()}</div>}
        {typeof booking?.totalAmount === 'number' && (
          <div><b>Total:</b> ₹{booking.totalAmount.toLocaleString('en-IN')}</div>
        )}
        <div><b>Status:</b> {booking?.status || 'pending'}</div>
        <div><b>Payment:</b> {booking?.paymentStatus || 'unpaid'}</div>
      </div>

      <div className="mt-4 flex gap-2">
        <Link to="/bookings" className="px-4 py-2 rounded border cursor-pointer">My bookings</Link>
        <Link to="/" className="px-4 py-2 rounded border cursor-pointer">Go to home</Link>
      </div>
    </div>
  );
}
