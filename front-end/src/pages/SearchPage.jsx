/**
 * Search page component
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import PropertyCard from '../components/property/PropertyCard';
import PropertyFilters from '../components/property/PropertyFilters';
import { getLocalProperties } from '../services/propertyService';
import MobileSearchOverlay from './MobileSearchOverlay';

const DEFAULT_FILTERS = {
  city: '',
  state: '',
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

const SearchPage = () => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  if (isMobile) {
    return <MobileSearchOverlay />;
  }

  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  useEffect(() => {
    loadProperties();
  }, []);

  useEffect(() => {
    // Apply initial filters from URL params
    const initialFilters = {
      city: searchParams.get('city') || '',
      guests: searchParams.get('guests') || '',
      budget: searchParams.get('budget') || 'any',
      type: searchParams.get('type') || 'any',
      rating: searchParams.get('rating') || 'any',
      workspace: searchParams.get('workspace') === 'true' || false,
      wellness: searchParams.get('wellness') === 'true' || false,
      near: searchParams.get('near') === 'true' || false,
      payAtHotel: searchParams.get('payAtHotel') === 'true' || false,
      wizardOnly: searchParams.get('wizardOnly') === 'true' || false,
      state: searchParams.get('state') || '',
      priceMin: parseInt(searchParams.get('priceMin') || '', 10) || DEFAULT_FILTERS.priceMin,
      priceMax: parseInt(searchParams.get('priceMax') || '', 10) || DEFAULT_FILTERS.priceMax,
    };
    setFilters({
      ...DEFAULT_FILTERS,
      ...initialFilters,
    });
  }, [searchParams]);

  const loadProperties = async () => {
    try {
      const result = await getLocalProperties();
      if (result.success) {
        setProperties(result.properties);
        setFilteredProperties(result.properties);
      }
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (next) => {
    setFilters(next);
  };

  const applyFilters = useCallback((filterValues) => {
    let filtered = [...properties];

    // Apply city filter
    if (filterValues.city) {
      filtered = filtered.filter(property =>
        property.city.toLowerCase().includes(filterValues.city.toLowerCase()) ||
        property.area.toLowerCase().includes(filterValues.city.toLowerCase())
      );
    }

    // Apply state filter
    if (filterValues.state) {
      filtered = filtered.filter(property =>
        property.state === filterValues.state
      );
    }

    // Apply guests filter
    if (filterValues.guests) {
      filtered = filtered.filter(property =>
        property.maxGuests >= parseInt(filterValues.guests)
      );
    }

    // Apply budget filter
    if (filterValues.budget && filterValues.budget !== 'any') {
      filtered = filtered.filter(property => {
        const price = property.price;
        if (filterValues.budget.endsWith('+')) {
          const min = parseInt(filterValues.budget.replace('+', ''));
          return price >= min;
        }
        const value = parseInt(filterValues.budget);
        if (value <= 1500) return price <= 1500;
        if (value <= 3000) return price > 1500 && price <= 3000;
        if (value <= 5000) return price > 3000 && price <= 5000;
        return true;
      });
    }

    if (typeof filterValues.priceMin === 'number') {
      filtered = filtered.filter(property => (property.price ?? Infinity) >= filterValues.priceMin);
    }
    if (typeof filterValues.priceMax === 'number') {
      filtered = filtered.filter(property => (property.price ?? 0) <= filterValues.priceMax);
    }

    // Apply type filter
    if (filterValues.type && filterValues.type !== 'any') {
      filtered = filtered.filter(property =>
        property.categories?.map(c => c.toLowerCase()).includes(filterValues.type.toLowerCase()) ||
        property.type?.toLowerCase() === filterValues.type.toLowerCase()
      );
    }

    // Apply rating filter
    if (filterValues.rating && filterValues.rating !== 'any') {
      filtered = filtered.filter(property =>
        property.rating >= parseFloat(filterValues.rating)
      );
    }

    // Apply workspace filter
    if (filterValues.workspace) {
      filtered = filtered.filter(property =>
        Boolean(property.workspace?.type)
      );
    }

    // Apply wellness filter
    if (filterValues.wellness) {
      filtered = filtered.filter(property =>
        Array.isArray(property.wellness) && property.wellness.length > 0
      );
    }

    setFilteredProperties(filtered);
  }, [properties]);

  useEffect(() => {
    applyFilters(filters);
  }, [filters, applyFilters]);

  if (loading) {
    return (
      <div className="search-page">
        <div className="loading-state">
          <p>Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="search-page">
      <div className="search-header">
        <h1>Search Results</h1>
        <p>Find your perfect stay</p>
      </div>

      <div className="search-layout">
        <aside className="filters-sidebar">
          <PropertyFilters filters={filters} onFiltersChange={handleFiltersChange} />
        </aside>

        <main className="search-main">
          <div className="search-header-bar">
            <h2>
              {filteredProperties.length} stay{filteredProperties.length !== 1 ? 's' : ''} found
            </h2>
            <div className="sort-controls">
              <select className="sort-select">
                <option value="relevance">Sort by relevance</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Rating: High to Low</option>
                <option value="distance">Distance</option>
              </select>
            </div>
          </div>

          {filteredProperties.length === 0 ? (
            <div className="empty-state">
              <h3>No properties found</h3>
              <p>Try adjusting your filters to see more results.</p>
            </div>
          ) : (
            <div className="property-grid">
              {filteredProperties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SearchPage;
