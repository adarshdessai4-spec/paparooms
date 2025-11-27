import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileSearchForm from "./MobileSearchForm";

const quickDestinations = [
  { label: "Near me", type: "icon" },
  {
    label: "Gujarat",
    img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=240&q=80",
    city: "Gujarat",
  },
  {
    label: "Bangalore",
    img: "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?auto=format&fit=crop&w=240&q=80",
    city: "Bangalore",
  },
  {
    label: "Chennai",
    img: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=240&q=80",
    city: "Chennai",
  },
  {
    label: "Delhi",
    img: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=240&q=80",
    city: "Delhi",
  },
  {
    label: "Gurgaon",
    img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=240&q=80",
    city: "Gurgaon",
  },
];

const MobileHero = () => {
  const navigate = useNavigate();
  const [showLanguage, setShowLanguage] = useState(false);

  const handleDestinationClick = (item) => {
    if (item.type === "icon") {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          ({ coords }) => {
            navigate(`/listings?near=true&lat=${coords.latitude}&lng=${coords.longitude}`);
          },
          () => navigate("/listings?near=true")
        );
      } else {
        navigate("/listings?near=true");
      }
      return;
    }
    const city = item.city || item.label;
    if (city.toLowerCase() === "gujarat") {
      navigate("/m/city/gujarat");
      return;
    }
    navigate(`/listings?city=${encodeURIComponent(city)}`);
  };

  return (
    <>
    <section className="mobile-hero" aria-label="Quick mobile search">
      <header className="mobile-hero__top">
        <div className="mobile-hero__spacer" />
        <div className="mobile-hero__logo">
          <img src="/brand-logo.png" alt="PAPA Rooms" />
        </div>
        <div className="mobile-hero__actions">
          <button aria-label="Change language" className="icon-btn" onClick={() => setShowLanguage(true)}>
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M4 5h16M5 5s0 7 7 7m0 0a4 4 0 0 0 4 4m1 4-2.5-6M4 19l4.5-11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <a aria-label="Call support" className="icon-btn" href="tel:+911246201611">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M6.5 4h1.3a1 1 0 0 1 .942.671l1.148 3.244a1 1 0 0 1-.272 1.05L8 10.5a9.5 9.5 0 0 0 5.5 5.5l1.535-1.618a1 1 0 0 1 1.05-.272l3.244 1.148a1 1 0 0 1 .671.942V17.5A2.5 2.5 0 0 1 17.5 20 13.5 13.5 0 0 1 4 6.5 2.5 2.5 0 0 1 6.5 4Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </header>

      <div className="mobile-hero__body">
        <h1>Find hotels at best prices</h1>

        <MobileSearchForm />

        <div className="mobile-explore">
          <h2>Explore your next destination</h2>
          <div className="mobile-explore__track" role="list">
            {quickDestinations.map((item) => (
              <button
                key={item.label}
                type="button"
                className="explore-chip"
                role="listitem"
                onClick={() => handleDestinationClick(item)}
              >
                <div className="chip-thumb">
                  {item.type === "icon" ? (
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M4 12h12m0 0-3-3m3 3-3 3"
                        stroke="#1DA1F2"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <img src={item.img} alt={item.label} />
                  )}
                </div>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mobile-banner mobile-banner--primary">
          <img
            src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80"
            alt="Call to book offer"
          />
          <div className="banner-content">
            <p className="banner-title">Book 1, get 1 free!</p>
            <p className="banner-sub">Book for 2 nights, pay for 1</p>
            <button type="button" className="cta-pill">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M6.5 4h1.3a1 1 0 0 1 .942.671l1.148 3.244a1 1 0 0 1-.272 1.05L8 10.5a9.5 9.5 0 0 0 5.5 5.5l1.535-1.618a1 1 0 0 1 1.05-.272l3.244 1.148a1 1 0 0 1 .671.942V17.5A2.5 2.5 0 0 1 17.5 20 13.5 13.5 0 0 1 4 6.5 2.5 2.5 0 0 1 6.5 4Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Call to book
            </button>
          </div>
        </div>
      </div>
    </section>
    {showLanguage && (
      <div className="language-sheet">
        <div className="language-sheet__backdrop" onClick={() => setShowLanguage(false)} />
        <div className="language-sheet__panel">
          <h3>Select language</h3>
          <ul>
            {["English", "Hindi", "Marathi", "Gujarati"].map((lang) => (
              <li key={lang}>
                <button type="button" onClick={() => setShowLanguage(false)}>
                  {lang}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )}
    </>
  );
};

export default MobileHero;
