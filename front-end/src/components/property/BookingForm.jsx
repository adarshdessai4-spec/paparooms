/**
 * Booking form component for property reservations
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { createBooking } from '../../services/propertyService';
import { calculateBookingTotals, formatDate, formatPrice } from '../../utils/formatters';
import { showToast } from '../common/Toast';

const BookingForm = ({ property, isOpen, onClose }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    checkIn: '',
    nights: '2',
    guests: '2',
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    requests: ''
  });
  const [loading, setLoading] = useState(false);
  const [totals, setTotals] = useState(null);

  // Initialize form with user data and default dates
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        guestName: user.name || '',
        guestEmail: user.email || '',
        guestPhone: user.phone || ''
      }));
    }

    // Set default dates
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 7);
    
    setFormData(prev => ({
      ...prev,
      checkIn: formatDate(tomorrow, { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-')
    }));
  }, [user]);

  // Calculate totals when form data changes
  useEffect(() => {
    if (property && formData.nights) {
      const calculatedTotals = calculateBookingTotals(property, formData.nights);
      setTotals(calculatedTotals);
    }
  }, [property, formData.nights]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.checkIn) {
      showToast('Please select a check-in date', 'warning');
      return;
    }

    if (!formData.guestName || !formData.guestEmail) {
      showToast('Please provide your name and email', 'warning');
      return;
    }

    if (formData.guests > property.maxGuests) {
      showToast(`This property allows up to ${property.maxGuests} guests`, 'warning');
      return;
    }

    setLoading(true);

    const bookingData = {
      propertyId: property.id,
      checkIn: formData.checkIn,
      nights: parseInt(formData.nights),
      guests: parseInt(formData.guests),
      guest: {
        name: formData.guestName,
        email: formData.guestEmail,
        phone: formData.guestPhone
      },
      requests: formData.requests,
      total: totals?.total || 0
    };

    try {
      const result = await createBooking(bookingData);
      
      if (result.success) {
        showToast('Booking confirmed! Check your bookings page.', 'success');
        onClose();
      } else {
        showToast(result.error || 'Booking failed. Please try again.', 'error');
      }
    } catch (error) {
      showToast('An error occurred. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !property) return null;

  const checkOutDate = formData.checkIn && formData.nights 
    ? new Date(new Date(formData.checkIn).getTime() + parseInt(formData.nights) * 24 * 60 * 60 * 1000)
    : null;

  return (
    <div className="reserve-modal is-open">
      <div className="reserve-backdrop" onClick={onClose}></div>
      <div className="reserve-dialog">
        <button 
          className="modal-close" 
          onClick={onClose}
          aria-label="Close booking form"
        >
          ×
        </button>

        <div className="reserve-layout">
          <div className="reserve-form">
            <h2>Reserve {property.name}</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="reserve-grid">
                <div className="field">
                  <label htmlFor="check-in-date">Check-in date</label>
                  <input
                    id="check-in-date"
                    name="checkIn"
                    type="date"
                    value={formData.checkIn}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="nights">Nights</label>
                  <select
                    id="nights"
                    name="nights"
                    value={formData.nights}
                    onChange={handleChange}
                  >
                    <option value="1">1 night</option>
                    <option value="2">2 nights</option>
                    <option value="3">3 nights</option>
                    <option value="4">4 nights</option>
                    <option value="5">5 nights</option>
                    <option value="7">1 week</option>
                    <option value="14">2 weeks</option>
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="guests">Guests</label>
                  <select
                    id="guests"
                    name="guests"
                    value={formData.guests}
                    onChange={handleChange}
                  >
                    {Array.from({ length: property.maxGuests }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} guest{i > 0 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field field-full">
                  <label htmlFor="guest-name">Your name</label>
                  <input
                    id="guest-name"
                    name="guestName"
                    type="text"
                    value={formData.guestName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="guest-email">Email</label>
                  <input
                    id="guest-email"
                    name="guestEmail"
                    type="email"
                    value={formData.guestEmail}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="guest-phone">Phone</label>
                  <input
                    id="guest-phone"
                    name="guestPhone"
                    type="tel"
                    value={formData.guestPhone}
                    onChange={handleChange}
                  />
                </div>

                <div className="field field-full">
                  <label htmlFor="requests">Special requests (optional)</label>
                  <textarea
                    id="requests"
                    name="requests"
                    value={formData.requests}
                    onChange={handleChange}
                    placeholder="Any special requirements or requests..."
                  />
                </div>
              </div>

              <div className="reserve-disclaimer">
                <p>This is a reservation hold. You'll receive confirmation details via email.</p>
              </div>

              <button 
                type="submit" 
                className="btn primary full"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Confirm reservation hold'}
              </button>
            </form>
          </div>

          <div className="reserve-summary">
            <div className="reserve-card">
              <div className="reserve-image">
                <img 
                  src={property.images?.[0]?.src || property.image} 
                  alt={property.name}
                />
              </div>
              <div className="reserve-card-body">
                <h3 data-reserve-property>{property.name}</h3>
                <p data-reserve-location>
                  {property.area}, {property.city}
                </p>
              </div>
            </div>

            {totals && (
              <div className="reserve-cost">
                <div>
                  <span data-reserve-nightly>
                    {formatPrice(totals.nightlyRate, totals.currency)} × {totals.nights} nights
                  </span>
                  <span data-reserve-subtotal>
                    {formatPrice(totals.subtotal, totals.currency)}
                  </span>
                </div>
                
                <div>
                  <span>Taxes & fees</span>
                  <span data-reserve-taxes>
                    {formatPrice(totals.tax, totals.currency)}
                  </span>
                </div>
                
                <div>
                  <span>Service fee</span>
                  <span data-reserve-fees>
                    {formatPrice(totals.fees, totals.currency)}
                  </span>
                </div>
                
                <div className="reserve-total">
                  <strong>Total</strong>
                  <strong data-reserve-total>
                    {formatPrice(totals.total, totals.currency)}
                  </strong>
                </div>
              </div>
            )}

            <div className="reserve-perks">
              <h4>What's included:</h4>
              <ul>
                <li>Free cancellation up to 24 hours before check-in</li>
                <li>24/7 customer support</li>
                <li>Best price guarantee</li>
                <li>Instant confirmation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
