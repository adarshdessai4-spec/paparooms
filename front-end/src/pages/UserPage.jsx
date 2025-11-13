/**
 * User dashboard page component
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserInitials } from '../utils/formatters';
import { getBookings } from '../utils/storage';

const UserPage = () => {
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = () => {
    const userBookings = getBookings();
    setBookings(userBookings);
  };

  const handleLogout = () => {
    logout();
  };

  const userInitials = user ? getUserInitials(user.name) : 'OY';

  return (
    <div className="user-page">
      <div className="user-header">
        <div className="user-info">
          <div className="user-avatar">
            <span>{userInitials}</span>
          </div>
          <div className="user-details">
            <h1>Welcome back, {user?.name || 'Traveller'}!</h1>
            <p>{user?.email}</p>
          </div>
        </div>
        <button className="btn ghost" onClick={handleLogout}>
          Sign Out
        </button>
      </div>

      <div className="user-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === 'bookings' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          My Bookings
        </button>
        <button
          className={`tab ${activeTab === 'profile' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
      </div>

      <div className="user-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Bookings</h3>
                <p className="stat-number">{bookings.length}</p>
              </div>
              <div className="stat-card">
                <h3>Upcoming Stays</h3>
                <p className="stat-number">
                  {bookings.filter(booking => 
                    new Date(booking.checkIn) > new Date() && 
                    booking.status === 'Reserved'
                  ).length}
                </p>
              </div>
              <div className="stat-card">
                <h3>Completed Stays</h3>
                <p className="stat-number">
                  {bookings.filter(booking => 
                    new Date(booking.checkIn) < new Date() && 
                    booking.status === 'Completed'
                  ).length}
                </p>
              </div>
            </div>

            <div className="quick-actions">
              <h2>Quick Actions</h2>
              <div className="action-grid">
                <Link to="/listings" className="action-card">
                  <h3>Book a Stay</h3>
                  <p>Find and book your next accommodation</p>
                </Link>
                <Link to="/bookings" className="action-card">
                  <h3>View Bookings</h3>
                  <p>Manage your current and past bookings</p>
                </Link>
                <Link to="/offers" className="action-card">
                  <h3>Special Offers</h3>
                  <p>Check out exclusive deals and discounts</p>
                </Link>
                <Link to="/support" className="action-card">
                  <h3>Get Help</h3>
                  <p>Contact support or view FAQs</p>
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bookings-tab">
            <h2>My Bookings</h2>
            {bookings.length === 0 ? (
              <div className="empty-state">
                <p>No bookings found. Start exploring and book your first stay!</p>
                <Link to="/listings" className="btn primary">
                  Find Stays
                </Link>
              </div>
            ) : (
              <div className="bookings-list">
                {bookings.map(booking => (
                  <div key={booking.id} className="booking-card">
                    <div className="booking-image">
                      <img src={booking.propertyImage} alt={booking.propertyName} />
                    </div>
                    <div className="booking-details">
                      <h3>{booking.propertyName}</h3>
                      <p className="booking-location">{booking.city}</p>
                      <div className="booking-dates">
                        <span>Check-in: {new Date(booking.checkIn).toLocaleDateString()}</span>
                        <span>Nights: {booking.nights}</span>
                      </div>
                      <div className="booking-status">
                        <span className={`status ${booking.status.toLowerCase()}`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                    <div className="booking-actions">
                      <Link to={`/property/${booking.propertyId}`} className="btn ghost">
                        View Property
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="profile-tab">
            <h2>Profile Information</h2>
            <div className="profile-form">
              <div className="field">
                <label htmlFor="profile-name">Full Name</label>
                <input
                  id="profile-name"
                  type="text"
                  value={user?.name || ''}
                  readOnly
                />
              </div>
              <div className="field">
                <label htmlFor="profile-email">Email</label>
                <input
                  id="profile-email"
                  type="email"
                  value={user?.email || ''}
                  readOnly
                />
              </div>
              <div className="field">
                <label htmlFor="profile-phone">Phone</label>
                <input
                  id="profile-phone"
                  type="tel"
                  value={user?.phone || ''}
                  readOnly
                />
              </div>
              <div className="profile-actions">
                <button className="btn primary" disabled>
                  Edit Profile (Coming Soon)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPage;
