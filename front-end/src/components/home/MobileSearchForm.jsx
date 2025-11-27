import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
  }).format(date);
};

const MobileSearchForm = ({ className = "" }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    city: '',
    checkIn: '',
    checkOut: '',
    rooms: 1,
    guests: 1,
  });

  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    setFormData((prev) => ({
      ...prev,
      checkIn: formatDate(today),
      checkOut: formatDate(tomorrow),
    }));
  }, []);

  const dateSummary = useMemo(() => {
    if (!formData.checkIn || !formData.checkOut) return 'Select dates';
    return `${formatDisplayDate(formData.checkIn)} – ${formatDisplayDate(formData.checkOut)}`;
  }, [formData.checkIn, formData.checkOut]);

  const roomSummary = useMemo(() => {
    const rooms = Number(formData.rooms) || 1;
    return `${rooms} room${rooms > 1 ? "s" : ""}`;
  }, [formData.rooms]);

  const guestSummary = useMemo(() => {
    const guests = Number(formData.guests) || 1;
    return `${guests} guest${guests > 1 ? "s" : ""}`;
  }, [formData.guests]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (formData.city.trim()) params.set('city', formData.city.trim());
    if (formData.checkIn) params.set('checkIn', formData.checkIn);
    if (formData.checkOut) params.set('checkOut', formData.checkOut);
    params.set('rooms', String(formData.rooms));
    params.set('guests', String(formData.guests));

    navigate(`/listings?${params.toString()}`);
  };

  return (
    <form className={`mobile-search-card luxe ${className}`} onSubmit={handleSubmit}>
      <div className="mobile-card-row">
        <div className="mobile-card-section">
          <label className="card-label" htmlFor="mobile-destination">
            Destination
          </label>
        <input
          id="mobile-destination"
          className="card-input"
          name="city"
          type="text"
          placeholder="Search for city, location or hotel"
          autoComplete="off"
          value={formData.city}
          onChange={handleChange}
          onFocus={() => navigate(ROUTES.MOBILE_SEARCH)}
        />
        </div>
      </div>

      <div className="mobile-card-split compact">
        <div className="mobile-card-cell">
          <p className="card-label">Date</p>
          <p className="card-value">{dateSummary}</p>
          <div className="mobile-date-inputs">
            <input
              type="date"
              name="checkIn"
              value={formData.checkIn}
              onChange={handleChange}
              aria-label="Check-in date"
            />
            <input
              type="date"
              name="checkOut"
              value={formData.checkOut}
              onChange={handleChange}
              aria-label="Check-out date"
            />
          </div>
        </div>
        <div className="mobile-card-cell simple">
          <p className="card-label">Rooms and guests</p>
          <p className="card-value">
            {roomSummary} · {guestSummary}
          </p>
          <div className="mobile-select-overlay">
            <select name="rooms" value={formData.rooms} onChange={handleChange} aria-label="Select rooms">
              {[1, 2, 3, 4, 5].map((count) => (
                <option key={count} value={count}>
                  {count} room{count > 1 ? "s" : ""}
                </option>
              ))}
            </select>
            <select name="guests" value={formData.guests} onChange={handleChange} aria-label="Select guests">
              {[1, 2, 3, 4, 5, 6].map((count) => (
                <option key={count} value={count}>
                  {count} guest{count > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <button type="submit" className="mobile-search-btn">
        Search
      </button>
    </form>
  );
};

export default MobileSearchForm;
