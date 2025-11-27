import React from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

const hotels = [
  {
    name: "Super Townhouse Navrangpura",
    area: "Navrangpura, Ahmedabad",
    price: 2450,
    strike: 3999,
    rating: 4.7,
  },
  {
    name: "Palette - Heritage Haveli",
    area: "Mandvi, Kutch",
    price: 3150,
    strike: 5200,
    rating: 4.5,
  },
  {
    name: "Townhouse Vadodara Central",
    area: "Akota, Vadodara",
    price: 1999,
    strike: 2899,
    rating: 4.8,
  },
];

const MobileCityHotels = () => {
  const navigate = useNavigate();
  const { city } = useParams();
  const [params] = useSearchParams();
  const locality = params.get("locality");

  return (
    <div className="mobile-city-hotels">
      <header>
        <button type="button" onClick={() => navigate(-1)}>
          ←
        </button>
        <div>{locality || (city || "Gujarat")}</div>
        <button type="button" onClick={() => navigate("/")}>
          ×
        </button>
      </header>

      <section className="stay-summary">
        <div>
          <strong>Mon, 17 Nov</strong>
          <span>12:00 PM</span>
        </div>
        <div>
          <strong>Tue, 18 Nov</strong>
          <span>11:00 AM</span>
        </div>
        <div>
          <strong>1 Room</strong>
          <span>1 Guest</span>
        </div>
      </section>

      <section className="hotel-list">
        {hotels.map((hotel) => (
          <article key={hotel.name}>
            <div className="hotel-image" />
            <div className="hotel-body">
              <h3>{hotel.name}</h3>
              <p className="area">{hotel.area}</p>
              <div className="price">
                ₹{hotel.price}
                <span>₹{hotel.strike}</span>
                <em>75% off</em>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
};

export default MobileCityHotels;
