/**
 * Offers page component (no header, no footer)
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { showToast } from "../components/common/Toast";

const OffersPage = () => {
  const [copiedCode, setCopiedCode] = useState("");

  // Source of truth for offers
  const offers = [
    {
      id: "welcome20",
      title: "20% off first booking",
      description:
        "New members get instant discount on their first OYO.plus stay",
      code: "WELCOME20",
      validUntil: "2025-12-31",
      type: "discount",
      discount: "20%",
      badge: "Limited time",
    },
    {
      id: "weekend",
      title: "Free breakfast",
      description:
        "Complimentary breakfast for all weekend stays at premium properties",
      code: "BREAKFAST",
      validUntil: "2025-12-31",
      type: "perk",
      discount: "Free",
      badge: "Weekend special",
    },
    {
      id: "corporate",
      title: "Corporate discount",
      description: "Special rates for business travelers with corporate bookings",
      code: "CORP15",
      validUntil: "2025-12-31",
      type: "discount",
      discount: "15%",
      badge: "Business travel",
    },
    {
      id: "longstay",
      title: "Extended stay bonus",
      description: "Extra 10% off for stays longer than 7 nights",
      code: "LONGSTAY",
      validUntil: "2025-12-31",
      type: "discount",
      discount: "10%",
      badge: "Long stays",
    },
  ];

  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      showToast?.(`Code ${code} copied to clipboard!`, "success");
      setTimeout(() => setCopiedCode(""), 1800);
    } catch {
      showToast?.("Failed to copy code", "error");
    }
  };

  return (
    <main className="offers-page boxed" data-page="offers">
      <section className="offers" id="offers" aria-labelledby="offers-title">
        <div className="section-head">
          <h1 id="offers-title">Latest offers</h1>
        </div>

        {/* Track/grid that mirrors the static HTML’s .offer-track */}
        <div className="offer-track" data-slot="offers" role="list">
          {offers.map((offer) => (
            <article key={offer.id} className="offer-card animate-in" role="listitem">
              {offer.badge && <span className="badge">{offer.badge}</span>}

              <h3>{offer.title}</h3>
              <p>{offer.description}</p>

              <div className="offer-meta">
                <div className="offer-code">
                  <span className="code-label">Use code:</span>
                  <span className="code-value" aria-live="polite">
                    {offer.code}
                  </span>
                </div>
                <div className="offer-validity">
                  <span>
                    Valid until:{" "}
                    {new Date(offer.validUntil).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="offer-actions">
                <button
                  type="button"
                  className={`badge-btn btn ${
                    copiedCode === offer.code ? "success" : "primary"
                  }`}
                  aria-label={`Copy promo code ${offer.code}`}
                  onClick={() => handleCopyCode(offer.code)}
                >
                  {copiedCode === offer.code ? "Copied!" : "Copy code"}
                </button>

                <Link to="/listings" className="btn ghost">
                  Book now
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Optional info/terms sections to match your JSX version */}
        <div className="offers-info">
          <h2>How to use offers</h2>
          <div className="steps">
            <div className="step">
              <span className="step-number">1</span>
              <div className="step-content">
                <h3>Copy the code</h3>
                <p>Click “Copy code” on an offer you want to use.</p>
              </div>
            </div>
            <div className="step">
              <span className="step-number">2</span>
              <div className="step-content">
                <h3>Search & select</h3>
                <p>Find your preferred property and proceed to booking.</p>
              </div>
            </div>
            <div className="step">
              <span className="step-number">3</span>
              <div className="step-content">
                <h3>Apply code</h3>
                <p>Paste the code in the promo field at checkout.</p>
              </div>
            </div>
            <div className="step">
              <span className="step-number">4</span>
              <div className="step-content">
                <h3>Enjoy savings</h3>
                <p>Complete your booking and enjoy your discounted stay!</p>
              </div>
            </div>
          </div>
        </div>

        <div className="offers-terms">
          <h2>Terms & Conditions</h2>
          <ul>
            <li>Offers are subject to availability and may be withdrawn at any time.</li>
            <li>Some offers may not be combinable with other promotions.</li>
            <li>Discounts apply to the base room rate only, excluding taxes and fees.</li>
            <li>Offers are valid for new bookings only.</li>
            <li>OYO.plus reserves the right to modify or cancel offers without notice.</li>
          </ul>
        </div>
      </section>
    </main>
  );
};

export default OffersPage;
