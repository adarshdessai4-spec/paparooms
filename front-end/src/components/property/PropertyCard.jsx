// src/components/property/PropertyCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/formatters';

const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-family="sans-serif" font-size="20">No image</text></svg>`
  );

const normalizeImage = (img) => {
  if (!img) return null;
  if (typeof img === 'string') return img;
  return img.url || img.src || img.path || null;
};

const PropertyCard = ({ property, compact = false, variant = 'grid' }) => {
  if (!property) return null;
  const classes = ['property-card', 'animate-in'];
  if (compact) classes.push('compact');
  if (variant === 'list') classes.push('property-card--list');

  const gallery = [property.image, ...(property.images || [])]
    .map(normalizeImage)
    .filter(Boolean)
    .slice(0, 2);
  if (!gallery.length) gallery.push(PLACEHOLDER);

  const imgAlt = property.imageAlt || property.name || 'Property';
  const locationLine = [property.area, property.city].filter(Boolean).join(', ');
  const reviews = property.reviewsCount || property.reviews || 120;
  const strikePrice = property.strikePrice ?? (property.price ? Math.round(property.price * 1.25) : null);
  const discountPercent = strikePrice ? Math.max(5, Math.round((1 - (property.price || 0) / strikePrice) * 100)) : null;
  const offerText = property.offer || (discountPercent ? `${discountPercent}% off` : null);
  const priceCopy = property.priceCopy || '+ ₹120 taxes & fees per room per night';
  const bookingAlert =
    property.bookingAlert || '7 people booked this hotel in last 6 hours';
  const badgeText = property.badge;
  const maxAmenities = variant === 'list' ? 6 : 4;
  const cardTag = property.categories?.[0];
  const wizardTag = property.membershipTag || (property.wizard ? 'Wizard' : null);

  return (
    <article className={classes.join(' ')}>
      <div className="property-card__media">
        {gallery.map((src, index) => (
          <div key={index} className="property-card__photo">
            <img
              loading="lazy"
              src={src}
              alt={imgAlt}
              onError={(e) => {
                if (e.currentTarget.src !== PLACEHOLDER) e.currentTarget.src = PLACEHOLDER;
              }}
            />
          </div>
        ))}
        {badgeText && <span className="media-badge">{badgeText}</span>}
        <button type="button" className="media-favorite" aria-label="Save to wishlist">
          ♥
        </button>
      </div>

      <div className="property-card__body">
        <div className="property-card__meta">
          <span className="rating-chip" aria-label={`Rated ${property.rating} out of 5`}>
            ★ {Number(property.rating || 0).toFixed(1)} <span>({reviews})</span>
          </span>
          {wizardTag && <span className="wizard-pill">{wizardTag}</span>}
          {cardTag && <span className="wizard-pill ghost">{cardTag}</span>}
        </div>

        <h3 className="property-card__title">{property.name}</h3>
        <p className="property-card__location">{locationLine}</p>

        {bookingAlert && (
          <p className="property-card__alert">
            <span role="img" aria-hidden="true">
              ⚡
            </span>
            {bookingAlert}
          </p>
        )}

        <div className="property-card__amenities">
          {property.amenities?.slice(0, maxAmenities).map((a, i) => (
            <span key={i}>{a}</span>
          ))}
        </div>

        <div className="property-card__price-row">
          <div>
            <div className="property-card__price">
              {property.price ? formatPrice(property.price, property.currency) : '—'}
              {strikePrice && (
                <span className="strike">{formatPrice(strikePrice, property.currency)}</span>
              )}
            </div>
            {offerText && <span className="offer-text">{offerText}</span>}
            <small className="price-copy">{priceCopy}</small>
          </div>
          <div className="property-card__actions">
            <Link className="btn ghost" to={`/property/${property.id}`}>
              View details
            </Link>
            <button type="button" className="btn primary-alt">
              Call to book
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default PropertyCard;
