import React, { useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { showToast } from "../components/common/Toast";

const featuredDeal = {
  heading: "No Cap, Just Crazy Deals! 🔥",
  heroImage:
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=900&q=80",
  heroLineOne: "Monsoon’s here.",
  heroLineTwo: "Where are you?",
  discountLabel: "Up to",
  discountValue: "75%",
  discountSuffix: "off",
  subHeading: "Pack Your Bags, We Got the Deals! 🎒",
  couponCode: "WELCOME75",
  expiry: "31 Dec, 2025",
};

const cityList = [
  "Latur",
  "Karimnagar",
  "Udaipur",
  "Chandigarh",
  "Nagpur",
  "Pune",
  "Hyderabad",
  "Goa",
  "Nashik",
];

const OffersPage = () => {
  const [copied, setCopied] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const filteredCities = useMemo(() => {
    if (!query.trim()) {
      return cityList;
    }
    const lower = query.trim().toLowerCase();
    return cityList.filter((city) => city.toLowerCase().includes(lower));
  }, [query]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(featuredDeal.couponCode);
      setCopied(true);
      showToast?.("Coupon copied!", "success");
      setTimeout(() => setCopied(false), 1600);
    } catch (err) {
      showToast?.("Unable to copy the coupon", "error");
    }
  };

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return (
    <main className="deal-screen" data-page="offers">
      <div className="deal-shell" aria-live="polite">
        <header className="deal-toolbar">
          <button
            type="button"
            className="deal-icon-btn"
            aria-label="Go back"
            onClick={handleBack}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                d="m15 19-7-7 7-7"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <h1>Deal</h1>
          <button type="button" className="deal-link-btn">
            View T&C
          </button>
        </header>

        <section className="deal-hero" aria-label="Featured offer">
          <p className="deal-tagline">{featuredDeal.heading}</p>
          <article className="deal-hero-card">
            <img
              src={featuredDeal.heroImage}
              alt="Guest enjoying a relaxed stay"
              loading="lazy"
            />
            <div className="deal-hero-overlay">
              <div>
                <span>{featuredDeal.heroLineOne}</span>
                <span>{featuredDeal.heroLineTwo}</span>
              </div>
              <div className="deal-hero-discount">
                <span>{featuredDeal.discountLabel}</span>
                <strong>{featuredDeal.discountValue}</strong>
                <small>{featuredDeal.discountSuffix}</small>
              </div>
            </div>
          </article>
        </section>

        <section className="deal-details" aria-label="Deal information">
          <h2>{featuredDeal.subHeading}</h2>

          <div className="deal-meta-grid">
            <button
              type="button"
              className={`deal-meta deal-meta-code ${
                copied ? "is-copied" : ""
              }`}
              onClick={handleCopyCode}
              aria-live="assertive"
            >
              <span className="deal-meta-label">Coupon code</span>
              <span className="deal-meta-value">{featuredDeal.couponCode}</span>
              <span className="deal-meta-pill">
                {copied ? "Copied" : "Tap to copy"}
              </span>
            </button>
            <div className="deal-meta">
              <span className="deal-meta-label">Offer ends on</span>
              <span className="deal-meta-value">{featuredDeal.expiry}</span>
            </div>
          </div>
        </section>

        <section
          className="deal-search-section"
          aria-labelledby="deal-search-label"
        >
          <label id="deal-search-label" className="sr-only" htmlFor="deal-city">
            Search for a city
          </label>
          <div className="deal-search-box">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="deal-search-icon"
            >
              <path
                d="M20.5 20.5 16 16m2-5a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <input
              type="search"
              id="deal-city"
              placeholder="Search for a city"
              autoComplete="off"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </section>

        <section
          className="deal-cities"
          aria-labelledby="deal-cities-heading"
          aria-live="polite"
        >
          <p id="deal-cities-heading" className="deal-cities-label">
            ALL CITIES
          </p>
          <ul>
            {filteredCities.length ? (
              filteredCities.map((city) => (
                <li key={city}>
                  <span>{city}</span>
                </li>
              ))
            ) : (
              <li className="deal-cities-empty">No cities match your search.</li>
            )}
          </ul>
        </section>
      </div>
    </main>
  );
};

export default OffersPage;
