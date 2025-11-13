/**
 * Bookings page component (no header, no footer)
 */

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getBookings } from "../utils/storage";
import { formatDate } from "../utils/formatters";

const BookingsPage = () => {
  const { isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    try {
      const userBookings = getBookings();
      setBookings(userBookings);
    } catch (error) {
      console.error("Error loading bookings:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const getFilteredBookings = () => {
    if (activeFilter === "all") return bookings;

    const now = new Date();
    return bookings.filter((booking) => {
      const checkInDate = new Date(booking.checkIn);
      const checkOutDate = new Date(checkInDate);
      checkOutDate.setDate(checkOutDate.getDate() + booking.nights);

      switch (activeFilter) {
        case "upcoming":
          return checkInDate > now && booking.status === "Reserved";
        case "past":
          return checkOutDate < now || booking.status === "Completed";
        case "cancelled":
          return booking.status === "Cancelled";
        default:
          return true;
      }
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "reserved":
        return "status-reserved";
      case "completed":
        return "status-completed";
      case "cancelled":
        return "status-cancelled";
      default:
        return "status-default";
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="bookings-page" aria-label="Your bookings">
        <header className="search-page__header">
          <h1>Sign in required</h1>
          <p>Please sign in to view and manage your bookings.</p>
        </header>

        <section className="bookings-empty">
          <div className="bookings-empty__icon" aria-hidden="true">
            🔐
          </div>
          <h2>Access your stays</h2>
          <p>View upcoming trips, past invoices, and manage changes in one place.</p>
          <Link className="btn primary" to="/auth">
            Sign in
          </Link>
        </section>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="bookings-page">
        <div className="loading-state">
          <p>Loading your bookings...</p>
        </div>
      </main>
    );
  }

  const filteredBookings = getFilteredBookings();
  const upcomingCount = bookings.filter((b) => {
    const checkInDate = new Date(b.checkIn);
    return checkInDate > new Date() && b.status === "Reserved";
  }).length;
  const pastCount = bookings.filter((b) => {
    const checkInDate = new Date(b.checkIn);
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkOutDate.getDate() + b.nights);
    return checkOutDate < new Date() || b.status === "Completed";
  }).length;
  const cancelledCount = bookings.filter((b) => b.status === "Cancelled").length;

  return (
    <main className="bookings-page" aria-label="Your bookings">
      {/* Page header (hero-ish, matches HTML tone) */}
      <header className="search-page__header">
        <h1>Your upcoming stays</h1>
        <p>View, modify, or manage every booking you’ve made with OYO.plus.</p>
      </header>

      {/* Filters */}
      <div className="bookings-filters" role="tablist" aria-label="Filter bookings">
        <button
          className={`filter-btn ${activeFilter === "all" ? "active" : ""}`}
          onClick={() => setActiveFilter("all")}
          role="tab"
          aria-selected={activeFilter === "all"}
        >
          All ({bookings.length})
        </button>
        <button
          className={`filter-btn ${activeFilter === "upcoming" ? "active" : ""}`}
          onClick={() => setActiveFilter("upcoming")}
          role="tab"
          aria-selected={activeFilter === "upcoming"}
        >
          Upcoming ({upcomingCount})
        </button>
        <button
          className={`filter-btn ${activeFilter === "past" ? "active" : ""}`}
          onClick={() => setActiveFilter("past")}
          role="tab"
          aria-selected={activeFilter === "past"}
        >
          Past ({pastCount})
        </button>
        <button
          className={`filter-btn ${activeFilter === "cancelled" ? "active" : ""}`}
          onClick={() => setActiveFilter("cancelled")}
          role="tab"
          aria-selected={activeFilter === "cancelled"}
        >
          Cancelled ({cancelledCount})
        </button>
      </div>

      {/* Empty state */}
      {filteredBookings.length === 0 ? (
        <>
          <section className="bookings-empty">
            <div className="bookings-empty__icon" aria-hidden="true">
              🧳
            </div>
            <h2>
              {activeFilter === "all"
                ? "No bookings yet"
                : `No ${activeFilter} bookings`}
            </h2>
            <p>
              {activeFilter === "all"
                ? "Plan your next stay and it will appear here. You can rebook in a tap and download invoices."
                : "Try switching filters or make a new booking."}
            </p>
            <Link className="btn primary" to="/listings">
              Find a stay
            </Link>
          </section>

          <section className="bookings-benefits">
            <h2>Why book with OYO.plus?</h2>
            <ul>
              <li>Instant refunds on cancellations via the app.</li>
              <li>Priority support from your dedicated concierge.</li>
              <li>GST-ready invoices delivered to your inbox.</li>
            </ul>
          </section>
        </>
      ) : (
        // Bookings list
        <section className="bookings-list" aria-live="polite">
          {filteredBookings.map((booking) => {
            const checkInDate = new Date(booking.checkIn);
            const checkOutDate = new Date(checkInDate);
            checkOutDate.setDate(checkOutDate.getDate() + booking.nights);

            return (
              <article key={booking.id} className="booking-card">
                <div className="booking-image">
                  {/* Fallback alt text */}
                  <img
                    src={booking.propertyImage}
                    alt={booking.propertyName || "Booked property"}
                    loading="lazy"
                  />
                </div>

                <div className="booking-details">
                  <h3>{booking.propertyName}</h3>
                  {booking.city && (
                    <p className="booking-location">{booking.city}</p>
                  )}

                  <div className="booking-dates" role="group" aria-label="Stay details">
                    <div className="date-info">
                      <span className="date-label">Check-in</span>
                      <span className="date-value">{formatDate(checkInDate)}</span>
                    </div>
                    <div className="date-info">
                      <span className="date-label">Check-out</span>
                      <span className="date-value">{formatDate(checkOutDate)}</span>
                    </div>
                    <div className="date-info">
                      <span className="date-label">Nights</span>
                      <span className="date-value">{booking.nights}</span>
                    </div>
                    <div className="date-info">
                      <span className="date-label">Guests</span>
                      <span className="date-value">{booking.guests}</span>
                    </div>
                  </div>

                  <div className="booking-status">
                    <span className={`status ${getStatusColor(booking.status)}`}>
                      {booking.status || "Reserved"}
                    </span>
                  </div>

                  {typeof booking.totalAmount === "number" && (
                    <div className="booking-total">
                      <span className="total-label">Total Amount</span>
                      <span className="total-value">
                        ₹{booking.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="booking-actions">
                  {booking.propertyId && (
                    <Link to={`/property/${booking.propertyId}`} className="btn ghost">
                      View Property
                    </Link>
                  )}
                  {booking.status === "Reserved" && (
                    <button className="btn primary" type="button">
                      Manage Booking
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
};

export default BookingsPage;
