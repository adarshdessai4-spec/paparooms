import React from "react";
import { useNavigate, useParams } from "react-router-dom";

const cityData = {
  gujarat: {
    title: "Gujarat",
    popular: ["Ahmedabad", "Vadodara", "Surat", "Rajkot"],
    all: ["Ahmedabad", "Vadodara", "Surat", "Rajkot", "Bhavnagar", "Dwarka", "Junagadh", "Kutch"],
  },
};

const MobileCityLocalities = () => {
  const navigate = useNavigate();
  const { city } = useParams();
  const key = (city || "gujarat").toLowerCase();
  const data = cityData[key] || cityData.gujarat;

  const openHotels = (locality) => {
    navigate(`/m/city/${encodeURIComponent(data.title.toLowerCase())}/hotels?locality=${encodeURIComponent(locality)}`);
  };

  return (
    <div className="mobile-city-localities">
      <header>
        <button type="button" onClick={() => navigate(-1)}>
          ←
        </button>
        <div>{data.title}</div>
        <button type="button" onClick={() => navigate("/")}>
          ×
        </button>
      </header>

      <button type="button" className="all-link" onClick={() => openHotels(data.title)}>
        All of {data.title}
      </button>

      <section>
        <p className="section-label">Popular localities</p>
        <div className="locality-chips">
          {data.popular.map((locality) => (
            <button key={locality} type="button" onClick={() => openHotels(locality)}>
              {locality}
            </button>
          ))}
        </div>
      </section>

      <section>
        <p className="section-label">All localities</p>
        <ul>
          {data.all.map((locality) => (
            <li key={locality}>
              <button type="button" onClick={() => openHotels(locality)}>
                {locality}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default MobileCityLocalities;
