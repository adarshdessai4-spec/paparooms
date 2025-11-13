// src/components/property/PropertyFilters.jsx
import React, { useEffect, useMemo, useState } from 'react';

const DEFAULT_FILTERS = {
  city: '',
  guests: '',
  budget: 'any',
  type: 'any',
  rating: 'any',
  workspace: false,
  wellness: false,
  near: false,
  priceMin: 300,
  priceMax: 8000,
};

const mergeFilters = (next = {}) => ({ ...DEFAULT_FILTERS, ...next });

const shallowEqual = (a = {}, b = {}) => {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of keys) {
    if (a[key] !== b[key]) return false;
  }
  return true;
};

const POPULAR_LOCATIONS = ['Majestic', 'Koramangala', 'Marathahalli', 'HSR Layout', 'Indiranagar'];

const STATIC_SECTIONS = [
  {
    id: 'collections',
    title: 'Collections',
    options: ['Family OYOs', 'Your friendly neighbourhood stay', 'For Group Travellers', 'Local ID accepted', 'OYO welcomes couples'],
  },
  {
    id: 'categories',
    title: 'Categories',
    options: ['OYO Rooms', 'Premium', 'Townhouse', 'Flagship', 'Home'],
  },
  {
    id: 'accommodation',
    title: 'Accommodation Type',
    options: ['OYO Home', 'Hotel'],
  },
  {
    id: 'facilities',
    title: 'Hotel Facilities',
    options: ['Seating area', 'King Sized Bed', 'Queen Sized Bed', 'Mini Fridge', 'TV'],
  },
];

const PropertyFilters = ({
  filters: controlledFilters,
  initialFilters,
  onFiltersChange,
  onFilterChange,
  variant = 'card',
  className = '',
}) => {
  const isControlled = typeof controlledFilters !== 'undefined';
  const [localFilters, setLocalFilters] = useState(() =>
    mergeFilters(isControlled ? controlledFilters : initialFilters)
  );

  const filters = useMemo(
    () => (isControlled ? mergeFilters(controlledFilters) : localFilters),
    [controlledFilters, isControlled, localFilters]
  );

  const priceMinValue = Number(filters.priceMin ?? DEFAULT_FILTERS.priceMin);
  const priceMaxValue = Number(filters.priceMax ?? DEFAULT_FILTERS.priceMax);

  const emitChange = (next) => {
    onFiltersChange?.(next);
    onFilterChange?.(next);
  };

  const updateFilters = (updater) => {
    const next = typeof updater === 'function' ? updater(filters) : updater;
    const merged = mergeFilters(next);
    if (!isControlled) {
      setLocalFilters((prev) => (shallowEqual(prev, merged) ? prev : merged));
    }
    emitChange(merged);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let nextValue = type === 'checkbox' ? checked : value;
    if (name === 'priceMin' || name === 'priceMax') {
      const numeric = Number(nextValue);
      if (Number.isNaN(numeric)) return;
      if (name === 'priceMin') {
        nextValue = Math.min(numeric, priceMaxValue - 100);
      } else {
        nextValue = Math.max(numeric, priceMinValue + 100);
      }
    }
    updateFilters({ ...filters, [name]: nextValue });
  };

  const handleReset = () => {
    updateFilters({ ...DEFAULT_FILTERS });
  };

  const handleChipClick = (value) => {
    updateFilters({ ...filters, city: value });
  };

  useEffect(() => {
    if (isControlled || !initialFilters) return;
    setLocalFilters((prev) => {
      const merged = mergeFilters(initialFilters);
      return shallowEqual(prev, merged) ? prev : merged;
    });
  }, [initialFilters, isControlled]);

  const classes = ['filter-card'];
  if (variant === 'sidebar') classes.push('filter-card--sidebar');
  if (className) classes.push(className);

  return (
    <div className={classes.join(' ')}>
      <div className="filter-grid">
        <div className="field">
          <label htmlFor="filter-city">Popular locations in {filters.city || 'Bangalore'}</label>
          <input
            id="filter-city"
            name="city"
            type="text"
            placeholder="Search locality"
            value={filters.city}
            onChange={handleChange}
          />
          <div className="chip-row">
            {POPULAR_LOCATIONS.map((chip) => (
              <button
                key={chip}
                type="button"
                className={`chip ${filters.city === chip ? 'chip--active' : ''}`}
                onClick={() => handleChipClick(chip)}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <label htmlFor="filter-guests">Guests</label>
          <select id="filter-guests" name="guests" value={filters.guests} onChange={handleChange}>
            <option value="">Any</option>
            <option value="1">1 guest</option>
            <option value="2">2 guests</option>
            <option value="3">3 guests</option>
            <option value="4">4 guests</option>
            <option value="5">5+ guests</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="filter-budget">Budget</label>
          <select id="filter-budget" name="budget" value={filters.budget} onChange={handleChange}>
            <option value="any">Any budget</option>
            <option value="1500">Under ₹1,500</option>
            <option value="3000">₹1,500 - ₹3,000</option>
            <option value="5000">₹3,000 - ₹5,000</option>
            <option value="5000+">Above ₹5,000</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="filter-type">Property type</label>
          <select id="filter-type" name="type" value={filters.type} onChange={handleChange}>
            <option value="any">Any type</option>
            <option value="hotel">Hotel</option>
            <option value="villa">Villa</option>
            <option value="apartment">Apartment</option>
            <option value="hostel">Hostel</option>
            <option value="resort">Resort</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="filter-rating">Minimum rating</label>
          <select id="filter-rating" name="rating" value={filters.rating} onChange={handleChange}>
            <option value="any">Any rating</option>
            <option value="4.0">4.0+ stars</option>
            <option value="4.5">4.5+ stars</option>
            <option value="4.8">4.8+ stars</option>
          </select>
        </div>
      </div>

      <div className="price-slider">
        <div className="slider-header">
          <span>Price</span>
          <strong>
            ₹{priceMinValue} &ndash; ₹{priceMaxValue}
          </strong>
        </div>
        <div className="slider-inputs">
          <input
            type="range"
            min="300"
            max="15000"
            step="100"
            name="priceMin"
            value={priceMinValue}
            onChange={handleChange}
          />
          <input
            type="range"
            min="800"
            max="20000"
            step="100"
            name="priceMax"
            value={priceMaxValue}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="checkbox-group">
        <label className="checkbox">
          <input type="checkbox" name="workspace" checked={filters.workspace} onChange={handleChange} />
          Remote-ready workspace
        </label>
        <label className="checkbox">
          <input type="checkbox" name="wellness" checked={filters.wellness} onChange={handleChange} />
          Wellness amenities
        </label>
        <label className="checkbox">
          <input type="checkbox" name="near" checked={filters.near} onChange={handleChange} />
          Sort by distance
        </label>
      </div>

      {STATIC_SECTIONS.map((section) => (
        <div className="filter-section" key={section.id}>
          <div className="filter-section__head">
            <span>{section.title}</span>
            <button type="button" className="link-btn">+ View More</button>
          </div>
          <div className="filter-section__options">
            {section.options.map((label, idx) => (
              <label key={label} className="checkbox">
                <input type="checkbox" name={`${section.id}-${idx}`} />
                {label}
              </label>
            ))}
          </div>
        </div>
      ))}

      <div className="wizard-card">
        <strong>Wizard Member OYOs</strong>
        <p>Get 5% off on member hotels</p>
        <button type="button" className="btn ghost">Know more</button>
      </div>

      <div className="filter-actions">
        <button type="button" className="btn ghost" onClick={handleReset}>
          Reset filters
        </button>
      </div>
    </div>
  );
};

export default PropertyFilters;
