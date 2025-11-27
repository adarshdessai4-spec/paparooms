import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const popularCities = [
  { label: "Near me", type: "icon" },
  { label: "Gujarat" },
  { label: "Bangalore" },
  { label: "Chennai" },
  { label: "Delhi" },
  { label: "Gurgaon" },
];

const allCities = [
  "4 Chn",
  "Abdullapur Modi",
  "Abhaypur",
  "Abu Road",
  "Achakari",
  "Achankovil",
  "Adampur",
  "Afzalgarh",
  "Agartala",
  "Ahmedabad",
  "Ajmer",
  "Alleppey",
  "Ambala",
  "Amritsar",
  "Anand",
].sort();

const MobileSearchOverlay = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const filteredCities = useMemo(() => {
    if (!query.trim()) return allCities;
    return allCities.filter((city) =>
      city.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  const handleSelect = (city) => {
    if (city === "Near me") {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          ({ coords }) =>
            navigate(`/listings?near=true&lat=${coords.latitude}&lng=${coords.longitude}`),
          () => navigate("/listings?near=true")
        );
      } else {
        navigate("/listings?near=true");
      }
      return;
    }
    if (city.toLowerCase() === "gujarat") {
      navigate("/m/city/gujarat");
      return;
    }
    navigate(`/listings?city=${encodeURIComponent(city)}`);
  };

  return (
    <div className="mobile-search-overlay">
      <header className="overlay-head">
        <button type="button" onClick={() => navigate(-1)} aria-label="Go back">
          ←
        </button>
        <input
          type="text"
          placeholder="Search for city, location or hotel"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="button" aria-label="Change language">
          文
        </button>
      </header>

      <section className="overlay-section">
        <p className="section-label">Popular cities</p>
        <div className="overlay-chips">
          {popularCities.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handleSelect(item.label)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <section className="overlay-section">
        <p className="section-label">All cities</p>
        <ul className="overlay-list">
          {filteredCities.map((city) => (
            <li key={city}>
              <button type="button" onClick={() => handleSelect(city)}>
                {city}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default MobileSearchOverlay;
