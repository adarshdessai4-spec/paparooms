/**
 * Home page component (full JSX conversion)
 */
import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import SearchForm from "../components/home/SearchForm";
import MobileHero from "../components/home/MobileHero";
import PropertyCard from "../components/property/PropertyCard";
import { getLocalProperties } from "../services/propertyService";
import { showToast } from "../components/common/Toast";

const HomePage = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [dealEmail, setDealEmail] = useState("");
  const continueSearch = [
    { label: "Around Me - 13 Nov - 14 Nov | 1 Guest", data: { near: true, guests: 1 } },
    { label: "Koramangala • Guests", data: { city: "Koramangala", guests: 2 } },
    { label: "Bangalore • Guests", data: { city: "Bangalore", guests: 2 } },
  ];

  const footerNav = [
    ['About Us', 'Teams / Careers', 'Blogs', 'Support'],
    ['Official PAPA Rooms Blog', 'Investor Relations', 'PAPA Rooms Circle', 'PAPA Rooms Frames'],
    ['Terms and conditions', 'Guest Policies', 'Privacy Policy', 'Trust And Safety'],
    ['Cyber Security', 'Cyber Security Awareness', 'Responsible Disclosure', 'Advertise your Homes'],
  ];

  const footerHotels = [
    'Hotels near me','Hotels in Manali','Hotels in Nainital','Hotels in Mount Abu','Hotels in Agra','Hotels in Haridwar','Hotels in Gurgaon','Hotels in Coimbatore','Hotels in UK','Vacation Homes in Europe',
    'Hotels in Goa','Hotels in Udaipur','Hotels in Lonavala','Hotels in Kodaikanal','Hotels in Gangtok','Hotels in Kolkata','Hotels in Mandarmoni','Hotels in Kasauli','Hotels in USA','Premium Hotels',
    'Hotels in Puri','Hotels in Mussoorie','Hotels in Munnar','Hotels in Hyderabad','Hotels in Coorg','Hotels in Ahmedabad','Hotels in Daman','Hotels in Dehradun','Hotels in Mexico','Homes in Southern Europe',
    'Hotels in Mahabaleshwar','Hotels in Pondicherry','Hotels in Bangalore','Hotels in Pune','Hotels in Chennai','Hotels in Shillong','Hotels in Yercaud','Travel Guide','Hotels in Brasil','Belvilla Holiday Homes',
    'Hotels in Jaipur','Hotels in Delhi','Hotels in Mysore','Hotels in Chandigarh','Hotels in Tirupati','Hotels in Rishikesh','Hotels in Amritsar','All Cities Hotels','Hotels in Japan','Traum Vacation Apartments',
    'Hotels in Shimla','Hotels in Mumbai','Hotels in Darjeeling','Hotels in Shirdi','Hotels in Dalhousie','Hotels in Varanasi','Hotels in Madurai','Coupons','Hotels in Indonesia','Traum Holiday Homes'
  ];
  const hotelsPerColumn = Math.ceil(footerHotels.length / 5);
  const hotelColumns = Array.from({ length: 5 }, (_, i) =>
    footerHotels.slice(i * hotelsPerColumn, (i + 1) * hotelsPerColumn)
  );

  const handleDealsSubmit = (e) => {
    e.preventDefault();
    if (!dealEmail.trim()) {
      showToast("Please enter your email", "warning");
      return;
    }
    showToast("Thanks! We'll send you the best deals soon.", "success");
    setDealEmail("");
  };

  useEffect(() => {
    (async () => {
      try {
        const result = await getLocalProperties();
        if (result?.success) setProperties(result.properties || []);
      } catch (e) {
        console.error("Error loading properties:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const redirectToListings = (searchData = {}) => {
    const params = new URLSearchParams();
    Object.entries(searchData).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      if (typeof value === "boolean") {
        if (value) params.set(key, "true");
      } else {
        params.set(key, String(value));
      }
    });
    navigate(params.toString() ? `/listings?${params.toString()}` : "/listings");
  };

  const handleSearch = (searchData) => {
    const shouldRedirect =
      searchData?.city ||
      searchData?.state ||
      searchData?.near ||
      searchData?.type ||
      searchData?.workspace ||
      searchData?.wellness;

    if (shouldRedirect) {
      redirectToListings(searchData);
      return;
    }

    let filtered = [...properties];

    if (searchData?.guests) {
      const g = parseInt(searchData.guests, 10);
      if (!Number.isNaN(g)) {
        filtered = filtered.filter((p) => (p.maxGuests ?? 1) >= g);
      }
    }

    setSearchResults(filtered);
    setShowSearchResults(true);
  };

  const clearSearchResults = () => {
    setShowSearchResults(false);
    setSearchResults([]);
  };

  const copyCode = async (code, setLabel) => {
    try {
      await navigator.clipboard.writeText(code);
      setLabel("Copied!");
      setTimeout(() => setLabel("Copy code"), 1500);
    } catch {
      setLabel(code);
      setTimeout(() => setLabel("Copy code"), 1500);
    }
  };

  return (
    <div data-page="home">
      <MobileHero />
      <main id="main-content">
        <section className="oyo-hero">
          <div className="oyo-hero__inner">
            <p className="oyo-hero__eyebrow">Over 174,000+ hotels and homes across 35+ countries</p>
            <div className="oyo-hero__search">
              <div className="oyo-hero__search-card">
                <SearchForm showQuickTags={false} />
              </div>
              <div className="oyo-hero__continue">
                <span>Continue your search</span>
                <div className="oyo-hero__chips" role="list">
                  {continueSearch.map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      className="oyo-chip"
                      onClick={() => handleSearch(chip.data)}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="oyo-banner" aria-label="Current offer">
          <div className="oyo-banner__card">
            <div className="promo-qr">
              <img src="/qr-oyoplus.svg" alt="Scan to download the PAPA Rooms app" />
              <p>Scan to download the App</p>
            </div>
            <div className="promo-copy">
              <p className="promo-overline">Limited time</p>
              <h2>Book 1, get 1 free!</h2>
              <p>Book for 2 nights, pay for 1 across selected city partners.</p>
              <button type="button" className="btn primary">Book now</button>
            </div>
          </div>
        </section>

        {/* Explore destinations (kept minimal – can be fed by data later) */}
        <section className="explore-destinations" aria-labelledby="explore-destinations-title">
          <div className="section-head">
            <h2 id="explore-destinations-title" className="font-bold">Explore your next destination</h2>
          </div>
          <div className="explore-track" role="list" data-slot="explore-track" />
        </section>

        {/* Search Results */}
        {showSearchResults && (
          <section className="search-results" aria-live="polite">
            <div className="section-head">
              <h2>Matched stays for you</h2>
              <div className="controls">
                <NavLink className="pill" to="/listings">
                  View all
                </NavLink>
                <button className="pill" type="button" onClick={clearSearchResults}>
                  Clear
                </button>
              </div>
            </div>
            <div className="property-grid condensed">
              {searchResults.slice(0, 3).map((property) => (
                <PropertyCard key={property.id} property={property} compact />
              ))}
            </div>
            <p className="muted">
              {searchResults.length} stay{searchResults.length !== 1 ? "s" : ""} match your filters.
            </p>
          </section>
        )}

        {/* Premium banner */}
        <section className="premium-banner">
          <div className="premium-banner__image" role="presentation" />
          <div className="premium-banner__copy">
            <h2>India's no.1 premium value hotels</h2>
            <ul>
              <li>Assured Check-in</li>
              <li>Spacious clean rooms</li>
              <li>1000+ new properties</li>
            </ul>
            <div className="premium-banner__cta">
              <button type="button" className="btn primary">Book now</button>
              <span className="price-tag">Starting from ₹999</span>
            </div>
          </div>
        </section>

        {/* Deals form */}
        <section className="deals-strip">
          <div className="deals-strip__info">
            <span className="icon">🔥</span>
            <div>
              <p>Get access to exclusive deals</p>
              <small>Only the best deals reach your inbox</small>
            </div>
          </div>
          <form className="deals-strip__form" onSubmit={handleDealsSubmit}>
            <label htmlFor="deals-email" className="sr-only">Email address</label>
            <input
              id="deals-email"
              type="email"
              placeholder="e.g., john@email.com"
              value={dealEmail}
              onChange={(e) => setDealEmail(e.target.value)}
            />
            <button type="submit">Notify me</button>
          </form>
        </section>

        {/* Global reach */}
        <section className="global-reach">
          <div className="global-reach__map">
            <img
              loading="lazy"
              src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80"
              alt="Global presence illustration"
            />
          </div>
          <div className="global-reach__copy">
            <p className="eyebrow">There's an PAPA Rooms around. Always.</p>
            <h2>More destinations. More ease. More affordable.</h2>
            <p>Plan business trips, weekend breaks, or workations with curated stays available in major countries.</p>
            <div className="global-stats">
              <div>
                <strong>35+</strong>
                <span>Countries</span>
              </div>
              <div>
                <strong>174,000+</strong>
                <span>Hotels &amp; Homes</span>
              </div>
            </div>
            <div className="global-tags">
              {['Indonesia','Malaysia','Denmark','UAE','USA','Japan'].map((country) => (
                <button key={country} type="button">{country}</button>
              ))}
            </div>
          </div>
        </section>

        {/* Destinations */}
        <section className="destinations" id="destinations">
          <div className="section-head flex !justify-between">
            <h2 className="font-bold">Trending destinations</h2>
            <NavLink className=" flex justify-end items-end link border-2 border-red-300 px-2 rounded-2xl" to="/listings">
              View all cities
            </NavLink>
          </div>
          <div className="destination-grid">
            {[
              { city: "Goa", count: "120+ stays" },
              { city: "Mumbai", count: "200+ stays" },
              { city: "Delhi", count: "180+ stays" },
              { city: "Bengaluru", count: "150+ stays" },
              { city: "Hyderabad", count: "90+ stays" },
              { city: "Chennai", count: "110+ stays" },
            ].map((d) => (
              <NavLink
                className="destination-card animate-in"
                key={d.city}
                to={`/listings?city=${encodeURIComponent(d.city)}`}
              >
                <span className="city">{d.city}</span>
                <span className="count">{d.count}</span>
              </NavLink>
            ))}
          </div>
        </section>

        {/* Directory / Footer prelude */}
        <section className="oyo-directory">
          <div className="directory-top">
            <div>
              <p className="eyebrow">PAPA Rooms</p>
              <h2>World's leading chain of hotels and homes</h2>
            </div>
            <button type="button" className="btn secondary">List your property</button>
          </div>
          <div className="directory-links">
            {footerNav.map((column, idx) => (
              <ul key={`nav-${idx}`}>
                {column.map((item) => (
                  <li key={item}>
                    <a href="#!">{item}</a>
                  </li>
                ))}
              </ul>
            ))}
          </div>
          <div className="directory-hotels">
            <h3>PAPA Rooms Hotels</h3>
            <div className="directory-hotels__grid">
              {hotelColumns.map((column, idx) => (
                <ul key={`hotel-col-${idx}`}>
                  {column.map((hotel) => (
                    <li key={hotel}>
                      <a href="#!">{hotel}</a>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
          <div className="directory-meta">
            <div className="store-links horizontal">
              <a className="store-btn dark" href="#!">Download on the App Store</a>
              <a className="store-btn dark" href="#!">Get it on Google Play</a>
            </div>
            <div className="social-icons">
              {['facebook','instagram','twitter','youtube','pinterest'].map((icon) => (
                <button key={icon} type="button" aria-label={icon}>
                  <span aria-hidden="true">•</span>
                </button>
              ))}
            </div>
            <p className="small-print">2013-2024 © Oravel Stays Limited</p>
          </div>
        </section>

      </main>



    </div>
  );
};

export default HomePage;
