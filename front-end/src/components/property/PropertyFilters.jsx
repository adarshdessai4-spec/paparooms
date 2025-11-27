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
  payAtHotel: false,
  wizardOnly: false,
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
    id: 'oyoType',
    title: 'OYO Type',
    options: ['PAPA Rooms', 'Premium', 'Townhouse', 'Flagship', 'Home', 'Capital O', 'Collection O', 'Spot On', 'Townhouse Oak'],
  },
  {
    id: 'accommodation',
    title: 'Accommodation Type',
    options: ['PAPA Rooms Home', 'Hotel'],
  },
  {
    id: 'facilities',
    title: 'Hotel Facilities',
    options: ['Seating area', 'King Sized Bed', 'Queen Sized Bed', 'Mini Fridge', 'TV'],
  },
  {
    id: 'collections',
    title: 'Collections',
    options: ['Family PAPA Rooms', 'Your friendly neighbourhood stay'],
  },
];

const PropertyFilters = ({
  filters: controlledFilters,
  initialFilters,
  onFiltersChange,
  onFilterChange,
  variant = 'card',
  className = '',
  onClose,
  onApply,
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

  const handleApply = () => {
    onApply?.(filters);
    onClose?.();
  };

  const baseContent = (
    <>
      <div className="filter-fieldset">
        <label htmlFor="filter-city">Location</label>
        <input
          id="filter-city"
          name="city"
          type="text"
          placeholder="Search city or locality"
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

      <div className="filter-toggle">
        <label className="checkbox detail">
          <input type="checkbox" name="payAtHotel" checked={filters.payAtHotel} onChange={handleChange} />
          <div>
            <span>Pay at Hotel</span>
            <small>Pay during check-in</small>
          </div>
        </label>
        <label className="checkbox detail">
          <input type="checkbox" name="wizardOnly" checked={filters.wizardOnly} onChange={handleChange} />
          <div>
            <span>Show Only Wizard Member OYOs</span>
            <small>Get 5% off on member hotels</small>
          </div>
        </label>
        <label className="checkbox detail">
          <input type="checkbox" name="workspace" checked={filters.workspace} onChange={handleChange} />
          <div>
            <span>Remote-ready workspace</span>
            <small>Desk, chair &amp; Wi-Fi</small>
          </div>
        </label>
        <label className="checkbox detail">
          <input type="checkbox" name="wellness" checked={filters.wellness} onChange={handleChange} />
          <div>
            <span>Wellness amenities</span>
            <small>Spa, pool &amp; more</small>
          </div>
        </label>
        <label className="checkbox detail">
          <input type="checkbox" name="near" checked={filters.near} onChange={handleChange} />
          <div>
            <span>Sort by distance</span>
            <small>Show closest stays first</small>
          </div>
        </label>
      </div>

      <div className="price-slider">
        <div className="slider-header">
          <span>Price (excl. taxes & fee)</span>
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

      {STATIC_SECTIONS.map((section) => (
        <div className="filter-section" key={section.id}>
          <div className="filter-section__head">
            <span>{section.title}</span>
          </div>
          <div className="filter-section__options">
            {section.options.map((label, idx) => (
              <label key={label} className="checkbox simple">
                <input type="checkbox" name={`${section.id}-${idx}`} />
                {label}
              </label>
            ))}
          </div>
        </div>
      ))}
    </>
  );

  if (variant === 'sheet') {
    return (
      <div className={`filter-sheet ${className}`}>
        <header className="filter-sheet__header">
          <button type="button" className="sheet-close" onClick={onClose} aria-label="Close filters">
            ×
          </button>
          <span>Filters</span>
          <button type="button" className="sheet-clear" onClick={handleReset}>
            Clear all
          </button>
        </header>
        <div className="filter-sheet__body">{baseContent}</div>
        <div className="filter-sheet__footer">
          <button type="button" className="btn primary" onClick={handleApply}>
            Apply
          </button>
        </div>
      </div>
    );
  }

  const classes = ['filter-card'];
  if (variant === 'sidebar') classes.push('filter-card--sidebar');
  if (className) classes.push(className);

  return (
    <div className={classes.join(' ')}>
      {baseContent}
      <div className="filter-actions">
        <button type="button" className="btn ghost" onClick={handleReset}>
          Reset filters
        </button>
      </div>
    </div>
  );
};

export default PropertyFilters;
