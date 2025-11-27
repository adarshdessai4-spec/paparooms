import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const MobileBookingsPrompt = () => {
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();

  const isValid = phone.trim().length >= 10;

  const handleContinue = () => {
    if (!isValid) return;
    navigate("/auth");
  };

  return (
    <div className="mobile-bookings-prompt">
      <header>
        <button
          type="button"
          className="header-btn"
          onClick={() => navigate(-1)}
          aria-label="Back"
        >
          ×
        </button>
        <span className="brand">PAPA</span>
        <button type="button" aria-label="Language" className="header-btn">
          文
        </button>
      </header>

      <main>
        <h1>Please login to view your bookings</h1>
        <div className="phone-field">
          <select>
            <option value="+91">+91</option>
          </select>
          <input
            type="tel"
            placeholder="Enter your mobile number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <button
          type="button"
          className="continue-btn"
          disabled={!isValid}
          onClick={handleContinue}
        >
          Continue
        </button>
        <p>We will send you a 4-digit code via SMS to verify your mobile number.</p>
      </main>
    </div>
  );
};

export default MobileBookingsPrompt;
