// src/components/property/PropertyCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/formatters';

const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-family="sans-serif" font-size="20">No image</text></svg>`
  );

const PropertyCard = ({ property, compact = false, variant = 'grid' }) => {
  if (!property) return null;
  const classes = ['property-card', 'animate-in'];
  if (compact) classes.push('compact');
  if (variant === 'list') classes.push('property-card--list');

  // Ensure we always have a valid src
  const imgSrc = property.image || PLACEHOLDER;
  const imgAlt = property.imageAlt || property.name || 'Property';
  const locationLine = [property.area, property.city].filter(Boolean).join(', ');
  const reviews = property.reviewsCount || property.reviews || 120;
  const strikePrice = property.strikePrice ?? (property.price ? Math.round(property.price * 1.25) : null);
  const discountPercent = strikePrice ? Math.max(5, Math.round((1 - (property.price || 0) / strikePrice) * 100)) : null;
  const offerText = property.offer || (discountPercent ? `${discountPercent}% off` : null);
  const priceCopy = property.priceCopy || '+ ₹120 taxes & fees per room per night';
  const bookingAlert =
    property.bookingAlert || '7 people booked this hotel in last 6 hours';
  const badgeText = property.badge || 'Company-Serviced';
  const maxAmenities = variant === 'list' ? 6 : 4;

  return (
    <article className={classes.join(' ')}>
      <div className="property-media">
        <img
          loading="lazy"
          src={imgSrc}
          alt={imgAlt}
          onError={(e) => {
            if (e.currentTarget.src !== PLACEHOLDER) e.currentTarget.src = PLACEHOLDER;
          }}
        />
        <span className="media-badge">{badgeText}</span>
      </div>

      <div className="property-body">
        <div className="card-top">
          <div className="rating-chip" aria-label={`Rated ${property.rating} out of 5`}>
            <strong>{Number(property.rating || 0).toFixed(1)}</strong>
            <span>
              ({reviews} Ratings) • {property.ratingLabel || 'Excellent'}
            </span>
          </div>
          {variant === 'list' && (
            <span className="booking-alert">{bookingAlert}</span>
          )}
        </div>

        <h3 className="line-clamp-2">{property.name}</h3>
        <p className="location-line">{locationLine}</p>

        <div className="amenities">
          {property.amenities?.slice(0, maxAmenities).map((a, i) => (
            <span key={i}>{a}</span>
          ))}
        </div>

        <div className="property-highlights">
          {property.workspace?.type && <span className="highlight-pill">{property.workspace.type}</span>}
          {property.wellness?.length > 0 && <span className="highlight-pill">{property.wellness[0]}</span>}
          {property.type && <span className="highlight-pill">{property.type}</span>}
        </div>

        <div className="price-row">
          <div className="price-block">
            <span className="price">
              {property.price ? formatPrice(property.price, property.currency) : '—'}
            </span>
            {strikePrice && (
              <small className="strike">{formatPrice(strikePrice, property.currency)}</small>
            )}
            {offerText && <small className="offer-text">{offerText}</small>}
            <small className="price-copy">{priceCopy}</small>
          </div>
          <div className="card-cta">
            <Link className="btn ghost" to={`/property/${property.id}`}>
              View details
            </Link>
            {variant === 'list' && (
              <Link className="btn btn-success" to={`/property/${property.id}`}>
                Book Now
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default PropertyCard;
