/**
 * Listings page wired to backend + PropertyCard/PropertyFilters UI
 */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import PropertyCard from "../components/property/PropertyCard";
import PropertyFilters from "../components/property/PropertyFilters";
import { fetchListings } from "../services/listings";
import { ROUTES } from "../utils/constants";
import { useAuth } from "../contexts/AuthContext";
import { getLocalProperties } from "../services/propertyService";

// ✅ use your storage helpers so cookies/sessions stay untouched
import {
  hasToken as storageHasToken,
  isEmailVerified as storageIsEmailVerified,
} from "../utils/storage";

// Map backend Listing -> PropertyCard shape (non-breaking)
const toPropertyCardModel = (l) => ({
  id: l._id,
  name: l.title,
  shortDescription: l.description || '',
  image: l.coverImage || l.images?.[0]?.url || '',
  imageAlt: l.title,
  rating:  (l.rating ?? 4.5),
  area:    l.address?.line1 || '',
  city:    l.address?.city || '',
  type:    'Hotel',
  badge:   l.status ? `${l.status} • PAPA Rooms` : undefined,
  amenities: l.amenities || [],
  price:   l.price ?? null,
  currency: "INR",
  workspace: {}, wellness: [],
  categories: [],
});

const DEFAULT_FILTERS = {
  city: "",
  state: "",
  guests: "",
  budget: "any",
  type: "any",
  rating: "any",
  workspace: false,
  wellness: false,
  near: false,
  payAtHotel: false,
  wizardOnly: false,
  priceMin: 300,
  priceMax: 8000,
};

const CITY_ALIASES = {
  bangalore: ["bengaluru"],
  bengaluru: ["bangalore"],
  bombay: ["mumbai"],
  mumbai: ["bombay"],
  delhi: ["new delhi", "ncr"],
  "new delhi": ["delhi"],
  gurgaon: ["gurugram"],
  gurugram: ["gurgaon"],
  chennai: ["madras"],
  madras: ["chennai"],
  hyderabad: ["secunderabad"],
  secunderabad: ["hyderabad"],
  kolkata: ["calcutta"],
  calcutta: ["kolkata"],
  goa: ["panaji"],
  panaji: ["goa"],
};

const normalize = (value = "") => String(value).trim().toLowerCase();

const matchesCityFilter = (city = "", query = "") => {
  const prop = normalize(city);
  const target = normalize(query);
  if (!target) return true;
  if (!prop) return false;
  if (prop.includes(target)) return true;
  const aliases = CITY_ALIASES[target] || [];
  return aliases.some((alias) => alias && prop.includes(alias));
};

const ListingsPage = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Optional: if your AuthContext is present, we'll read it,
  // but final decision uses storage helpers to keep behavior consistent.
  const { isAuthenticated } = useAuth?.() || { isAuthenticated: false };

  // 🔐 Final gate: user must be logged in (cookie or token) AND verified
  const isLoggedIn = Boolean(isAuthenticated || storageHasToken());
  const isVerified = storageIsEmailVerified();
  const canCreate = isLoggedIn && isVerified;

  const [properties, setProperties] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sort, setSort] = useState("relevance");
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [showSortSheet, setShowSortSheet] = useState(false);

  const mapLocalProperty = useCallback((p) => ({
    id: p.id || p._id,
    name: p.name || p.title,
    shortDescription: p.shortDescription || p.description || "",
    image: p.image || p.images?.[0]?.src || p.coverImage || "",
    imageAlt: p.imageAlt || p.name || p.title || "Property",
    rating: p.rating ?? 4.5,
    area: p.area || p.locality || p.address?.line1 || "",
    city: p.city || p.address?.city || "",
    type: p.type || "Hotel",
    badge: p.badge || p.status,
    amenities: p.amenities || [],
    price: p.price ?? null,
    currency: p.currency || "INR",
    workspace: p.workspace || {},
    wellness: p.wellness || [],
    categories: p.categories || [],
  }), []);

  const loadLocalFallback = useCallback(async () => {
    try {
      const local = await getLocalProperties();
      if (local?.success) {
        const mapped = (local.properties || []).map(mapLocalProperty);
        setProperties(mapped);
        setFiltered(mapped);
        return mapped.length > 0;
      }
    } catch (error) {
      console.error("Local fallback failed:", error);
    }
    setProperties([]);
    setFiltered([]);
    return false;
  }, [mapLocalProperty]);

  const loadListings = useCallback(async () => {
    setLoading(true);
    try {
      const payload = await fetchListings({ page: 1, limit: 60, sortBy: 'createdAt' });
      const list = Array.isArray(payload) ? payload : (payload?.data || []);
      const mapped = list.map(toPropertyCardModel);
      if (mapped.length) {
        setProperties(mapped);
        setFiltered(mapped);
      } else {
        await loadLocalFallback();
      }
    } catch (err) {
      console.error("Error loading listings:", err);
      await loadLocalFallback();
    } finally {
      setLoading(false);
    }
  }, [loadLocalFallback]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  // URL → filters (initial)
  useEffect(() => {
    const initial = {
      city: searchParams.get("city") || "",
      state: searchParams.get("state") || "",
      guests: searchParams.get("guests") || "",
      budget: searchParams.get("budget") || "any",
      type: searchParams.get("type") || "any",
      rating: searchParams.get("rating") || "any",
      workspace: searchParams.get("workspace") === "true" || false,
      wellness: searchParams.get("wellness") === "true" || false,
      near: searchParams.get("near") === "true" || false,
      priceMin: parseInt(searchParams.get("priceMin") || "", 10) || DEFAULT_FILTERS.priceMin,
      priceMax: parseInt(searchParams.get("priceMax") || "", 10) || DEFAULT_FILTERS.priceMax,
    };
    setFilters({
      ...DEFAULT_FILTERS,
      ...initial,
    });
  }, [searchParams]);

  // Filters -> URL
  const pushFiltersToUrl = (nextFilters) => {
    const params = new URLSearchParams();
    Object.entries(nextFilters).forEach(([k, v]) => {
      if (typeof v === "boolean") {
        if (v) params.set(k, "true");
      } else if (typeof v === "number") {
        params.set(k, String(v));
      } else if (v && v !== "any") {
        params.set(k, String(v));
      }
    });
    navigate(`${location.pathname}?${params.toString()}`, { replace: false });
  };

  // Apply filters
  const applyFilters = useCallback((fv) => {
    let out = [...properties];

    if (fv.city) {
      const q = fv.city.toLowerCase();
      out = out.filter(
        (p) =>
          matchesCityFilter(p.city, fv.city) ||
          ((p.area || "").toLowerCase().includes(q))
      );
    }
    if (fv.state) {
      out = out.filter((p) => p.state === fv.state);
    }
    if (fv.guests) {
      // no-op for now
    }
    if (fv.budget && fv.budget !== "any") {
      out = out.filter((p) => {
        const price = p.price ?? 0;
        if (!price) return false;
        if (fv.budget.endsWith("+")) {
          const min = parseInt(fv.budget, 10);
          return price >= min;
        }
        const value = parseInt(fv.budget, 10);
        if (value <= 1500) return price <= 1500;
        if (value <= 3000) return price > 1500 && price <= 3000;
        if (value <= 5000) return price > 3000 && price <= 5000;
        return true;
      });
    }
    if (typeof fv.priceMin === "number") {
      out = out.filter((p) => (p.price ?? Infinity) >= fv.priceMin);
    }
    if (typeof fv.priceMax === "number") {
      out = out.filter((p) => (p.price ?? 0) <= fv.priceMax);
    }
    if (fv.type && fv.type !== "any") {
      const t = fv.type.toLowerCase();
      out = out.filter(
        (p) =>
          p.type?.toLowerCase() === t ||
          (Array.isArray(p.categories) &&
            p.categories.map((c) => String(c).toLowerCase()).includes(t))
      );
    }
    if (fv.rating && fv.rating !== "any") {
      const r = parseFloat(fv.rating);
      out = out.filter((p) => (p.rating ?? 0) >= r);
    }
    if (fv.workspace) out = out.filter((p) => Boolean(p.workspace?.type));
    if (fv.wellness) out = out.filter((p) => Array.isArray(p.wellness) && p.wellness.length > 0);
    if (fv.near) out.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

    setFiltered(out);
  }, [properties]);

  // From sidebar
  const handleFiltersChange = (next) => {
    setFilters(next);
    pushFiltersToUrl(next);
  };

  // Sorting
  const sorted = useMemo(() => {
    const list = [...filtered];
    switch (sort) {
      case "price-low":
        list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        break;
      case "price-high":
        list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
        break;
      case "rating":
        list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case "distance":
        break;
      default:
        break;
    }
    return list;
  }, [filtered, sort]);

  // Re-apply when backend list loads
  useEffect(() => {
    applyFilters(filters);
  }, [filters, applyFilters]);

  const titleCase = (text = "") =>
    text
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  const displayCity = filters.city ? titleCase(filters.city) : "India";
  const stayLabel = `${sorted.length} stay${sorted.length !== 1 ? "s" : ""}`;
  const heroLine = loading
    ? "Fetching curated stays near you..."
    : `${stayLabel} open for your dates in ${displayCity}.`;
  const totalOyOs = properties.length || sorted.length;
  const heroHeading = filters.city ? `Hotels in ${displayCity}` : "Find an PAPA Rooms stay that fits every plan";
  const heroCount = filters.city ? `(${totalOyOs} PAPA Rooms)` : "";

  return (
    <div data-page="listings" className="listings-page">
      <main className="listings-shell">
        <section className="listings-hero animate-in">
          <p className="breadcrumbs">
            <Link to="/">India</Link> &nbsp;/&nbsp; <span>{displayCity} Hotels</span>
          </p>
          <h1>
            {heroHeading} <span className="hero-count">{heroCount}</span>
          </h1>
          <p>{heroLine}</p>
          {canCreate && (
            <Link className="btn secondary" to={ROUTES.LISTING_CREATE}>
              + List your property
            </Link>
          )}
        </section>

        <div className="listings-body">
          <aside className="filters-panel">
            <div className="filters-panel__inner">
              <PropertyFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                variant="sidebar"
              />
            </div>
          </aside>

          <section className="results-panel">
            <div className="results-header animate-in">
              <div>
                <h2>{loading ? "Loading stays..." : `${stayLabel} found`}</h2>
                <small>Sorted by your preferences</small>
              </div>
              <div className="results-tools">
                <label className="map-toggle">
                  <input type="checkbox" disabled />
                  <span>Map view</span>
                </label>
                <select
                  className="sort-select oy-select"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  aria-label="Sort results"
                >
                  <option value="relevance">Sort by relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Rating: High to Low</option>
                  <option value="distance">Distance</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="listings-results skeletons">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="skeleton skeleton-property" style={{ height: 220, borderRadius: 16 }} />
                ))}
              </div>
            ) : sorted.length === 0 ? (
              <div className="empty-state animate-in">
                <h3>No properties found</h3>
                <p>Try adjusting your filters to see more results.</p>
              </div>
            ) : (
              <div className="listings-results" aria-live="polite" id="listing-results">
                {sorted.map((property, i) => (
                  <div
                    key={property.id}
                    className="animate-in"
                    style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
                  >
                    <PropertyCard property={property} variant="list" />
                  </div>
                ))}
              </div>
            )}

            <div className="results-toolbar">
              <button type="button" className="toolbar-btn" onClick={() => setShowFilterSheet(true)}>
                <span aria-hidden="true">☰</span>
                Filter
              </button>
              <button type="button" className="toolbar-btn" onClick={() => setShowSortSheet(true)}>
                <span aria-hidden="true">⇅</span>
                Sort
              </button>
              <button
                type="button"
                className="toolbar-btn"
                onClick={() => alert("Map view coming soon")}
              >
                <span aria-hidden="true">🗺</span>
                Map
              </button>
            </div>

            <p className="muted mt-4" id="listing-message" role="status" aria-live="polite">
              {sorted.length > 0 && !loading
                ? "Showing the best matches based on your filters."
                : loading
                ? "Loading stays..."
                : "No matches for the selected filters."}
            </p>
          </section>
        </div>
      </main>

      {showFilterSheet && (
        <div className="filter-overlay" role="dialog" aria-modal="true">
          <div className="filter-overlay__bg" onClick={() => setShowFilterSheet(false)} />
          <PropertyFilters
            variant="sheet"
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClose={() => setShowFilterSheet(false)}
            onApply={() => setShowFilterSheet(false)}
          />
        </div>
      )}

      {showSortSheet && (
        <div className="filter-overlay" role="dialog" aria-modal="true">
          <div className="filter-overlay__bg" onClick={() => setShowSortSheet(false)} />
          <div className="sort-sheet">
            <header>
              <button type="button" onClick={() => setShowSortSheet(false)}>
                ×
              </button>
              <span>Sort by</span>
              <div />
            </header>
            <ul>
              {[
                { value: "relevance", label: "Recommended" },
                { value: "price-low", label: "Price: Low to High" },
                { value: "price-high", label: "Price: High to Low" },
                { value: "rating", label: "Rating: High to Low" },
              ].map((option) => (
                <li key={option.value}>
                  <button
                    type="button"
                    className={sort === option.value ? "active" : ""}
                    onClick={() => {
                      setSort(option.value);
                      setShowSortSheet(false);
                    }}
                  >
                    {option.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingsPage;
