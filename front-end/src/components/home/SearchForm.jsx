/**
 * Search form component for home page
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchForm = ({ showQuickTags = true }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    city: '',
    checkIn: '',
    checkOut: '',
    rooms: '1',
    guests: '2'
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Set default dates
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    setFormData(prev => ({
      ...prev,
      checkIn: formatDate(today),
      checkOut: formatDate(tomorrow)
    }));
  }, []);

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).format(date);
  };

  const dateSummary = useMemo(() => {
    if (!formData.checkIn || !formData.checkOut) return '';
    return `${formatDisplayDate(formData.checkIn)} — ${formatDisplayDate(formData.checkOut)}`;
  }, [formData.checkIn, formData.checkOut]);

  const staySummary = useMemo(() => {
    const rooms = Number(formData.rooms) || 1;
    const guests = Number(formData.guests) || 1;
    const roomLabel = rooms > 1 ? 'Rooms' : 'Room';
    const guestLabel = guests > 1 ? 'Guests' : 'Guest';
    return `${rooms} ${roomLabel}, ${guests} ${guestLabel}`;
  }, [formData.rooms, formData.guests]);

  const adjustRooms = (delta) => {
    setFormData((prev) => {
      const next = Math.min(5, Math.max(1, Number(prev.rooms) + delta));
      return { ...prev, rooms: String(next) };
    });
  };

  const adjustGuests = (delta) => {
    setFormData((prev) => {
      const next = Math.min(6, Math.max(1, Number(prev.guests) + delta));
      return { ...prev, guests: String(next) };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.city.trim()) {
      handleQuickSearch({ near: true });
      return;
    }

    // Build search URL with parameters
    const params = new URLSearchParams();
    params.set('city', formData.city);
    params.set('checkIn', formData.checkIn);
    params.set('checkOut', formData.checkOut);
    params.set('rooms', formData.rooms);
    params.set('guests', formData.guests);

    navigate(`/listings?${params.toString()}`);
  };

  const handleQuickSearch = (searchData) => {
    const params = new URLSearchParams();
    
    if (searchData.city) params.set('city', searchData.city);
    if (searchData.near) params.set('near', 'true');
    if (searchData.type) params.set('type', searchData.type);
    if (searchData.workspace) params.set('workspace', 'true');
    if (searchData.wellness) params.set('wellness', 'true');

    navigate(`/listings?${params.toString()}`);
  };

  return (
    <>
      <form className="search-card luxe" onSubmit={handleSubmit}>
        <div className="field field-destination">
          <label htmlFor="search-city">Destination</label>
          <div className="field-shell destination-shell">
            <input
              id="search-city"
              name="city"
              type="text"
              placeholder="Around Me"
              value={formData.city}
              onChange={handleChange}
              autoComplete="off"
              inputMode="search"
            />
            <button
              className="near-me-chip"
              type="button"
              onClick={() => handleQuickSearch({ near: true })}
            >
              Near me
            </button>
          </div>
        </div>

        <div className="field field-dates">
          <label htmlFor="check-in">Dates</label>
          <div className="field-shell field-shell--overlay field-shell--dates">
            <span className="field-value">{dateSummary}</span>
            <input
              id="check-in"
              name="checkIn"
              type="date"
              value={formData.checkIn}
              onChange={handleChange}
              className="native-date native-date--start"
              aria-label="Check-in date"
            />
            <input
              id="check-out"
              name="checkOut"
              type="date"
              value={formData.checkOut}
              onChange={handleChange}
              className="native-date native-date--end"
              aria-label="Check-out date"
            />
          </div>
        </div>

        <div className="field field-occupancy">
          <div className="occupancy-pills">
            <div className="occupancy-pill">
              <div className="pill-text">
                <span className="pill-label">Rooms</span>
                <span className="pill-value">{formData.rooms}</span>
              </div>
              <div className="pill-controls">
                <button
                  type="button"
                  className="pill-btn"
                  onClick={() => adjustRooms(-1)}
                  aria-label="Decrease rooms"
                  disabled={Number(formData.rooms) <= 1}
                >
                  &minus;
                </button>
                <button
                  type="button"
                  className="pill-btn"
                  onClick={() => adjustRooms(1)}
                  aria-label="Increase rooms"
                  disabled={Number(formData.rooms) >= 5}
                >
                  +
                </button>
              </div>
            </div>

            <div className="occupancy-pill">
              <div className="pill-text">
                <span className="pill-label">Guests</span>
                <span className="pill-value">{formData.guests}</span>
              </div>
              <div className="pill-controls">
                <button
                  type="button"
                  className="pill-btn"
                  onClick={() => adjustGuests(-1)}
                  aria-label="Decrease guests"
                  disabled={Number(formData.guests) <= 1}
                >
                  &minus;
                </button>
                <button
                  type="button"
                  className="pill-btn"
                  onClick={() => adjustGuests(1)}
                  aria-label="Increase guests"
                  disabled={Number(formData.guests) >= 6}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        <button className="search-cta" type="submit">
          Search
        </button>
      </form>

      {showQuickTags && (
        <div className="hero-tags" role="list">
          <button type="button" className="tag" onClick={() => handleQuickSearch({ near: true })}>
            Near me
          </button>
          <button type="button" className="tag" onClick={() => handleQuickSearch({ type: 'apartment' })}>
            Weekly rentals
          </button>
          <button type="button" className="tag" onClick={() => handleQuickSearch({ workspace: true })}>
            Work pods
          </button>
          <button type="button" className="tag" onClick={() => handleQuickSearch({ wellness: true })}>
            Wellness add-ons
          </button>
        </div>
      )}
    </>
  );
};

export default SearchForm;
