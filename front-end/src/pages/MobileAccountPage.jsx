import React, { useMemo, useState } from "react";

const items = [
  "Download iOS App",
  "Log in or create an account",
  "Play & win",
  "Invite & Earn",
  "Switch language",
  "Guest policy",
  "Partner with PAPA Rooms",
  "Call us",
  "Our story",
];

const featuredCards = [
  {
    title: "Become a Member",
    subtitle: "Additional 10% off on stays",
    action: "Join now",
    plan: "silver",
  },
  {
    title: "PAPA Rooms for Business",
    subtitle: "Trusted by 5000 Corporates",
    action: "Get started",
    plan: "gold",
  },
  {
    title: "List your property",
    subtitle: "Start earning in 30 mins",
    action: "Apply",
    plan: "blue",
  },
];

const wizardPlans = [
  {
    id: "blue",
    label: "Blue",
    accent: "#1d9bf0",
    description: "Best for quick weekend stays",
    price: "₹99",
    strikePrice: "₹199",
    perks: [
      { title: "Reward night after 7 room nights", detail: "Earn 1 night as reward night" },
      { title: "5% discount on base hotels", detail: "Set two wizard hotels as base hotels." },
      { title: "2% discount on Wizard hotels", detail: "Extra discount on all Wizard network hotels" },
      { title: "Partner coupons worth Rs.3500", detail: "External partner coupons" },
      { title: "Free Membership Renewal", detail: "If benefits availed < membership fee" },
      { title: "Validity", detail: "6 months" },
    ],
  },
  {
    id: "silver",
    label: "Silver",
    accent: "#e5e7eb",
    description: "Balance of perks vs price",
    price: "₹199",
    strikePrice: "₹399",
    perks: [
      { title: "Reward night after 6 room nights", detail: "Earn 1 night as reward night" },
      { title: "5% discount on base hotels", detail: "Set two wizard hotels as base hotels." },
      { title: "2% discount on Wizard hotels", detail: "Extra discount on all Wizard network hotels" },
      { title: "Exclusive Benefits", detail: "Priority customer support" },
      { title: "Partner coupons worth Rs.5500", detail: "External partner coupons" },
      { title: "Super Discount Coupon(s)", detail: "40% super coupon x 1" },
      { title: "Free Membership Renewal", detail: "No fee if benefits < fee" },
    ],
  },
  {
    id: "gold",
    label: "Gold",
    accent: "#fbbf24",
    tag: "Recommended",
    description: "Ultimate perks for frequent stays",
    price: "₹399",
    strikePrice: "₹799",
    perks: [
      { title: "Reward night after 5 room nights", detail: "Earn 1 night as reward night" },
      { title: "5% discount on base hotels", detail: "Set two wizard hotels as base hotels." },
      { title: "2% discount on Wizard hotels", detail: "Extra discount on all Wizard network hotels" },
      { title: "Exclusive Benefits", detail: "Priority support & Pay at hotel" },
      { title: "Partner coupons worth Rs.5500", detail: "External partner coupons" },
      { title: "Super Discount Coupon(s)", detail: "40% super coupon x 2" },
    ],
  },
];

const MobileAccountPage = () => {
  const [showWizard, setShowWizard] = useState(false);
  const [activePlan, setActivePlan] = useState("silver");

  const plan = useMemo(
    () => wizardPlans.find((wizardPlan) => wizardPlan.id === activePlan) ?? wizardPlans[0],
    [activePlan]
  );

  const openWizard = (planId) => {
    setActivePlan(planId || "silver");
    setShowWizard(true);
  };

  return (
    <div className="mobile-account-page">
      <header>
        <h1>My PAPA Rooms</h1>
      </header>

      <section className="account-card">
        <p>Enjoy upto 10% off on your bookings*</p>
        <button type="button" onClick={() => openWizard("silver")}>
          Be a Wizard Member
        </button>
      </section>

      <div className="account-grid">
        {featuredCards.map((card) => (
          <article key={card.title} className="account-mini-card">
            <div>
              <p className="mini-card__eyebrow">{card.title}</p>
              <h3>{card.subtitle}</h3>
            </div>
            <button type="button" onClick={() => openWizard(card.plan)}>
              {card.action}
            </button>
          </article>
        ))}
      </div>

      <ul className="account-list">
        {items.map((label) => (
          <li key={label}>
            <button type="button">{label}</button>
          </li>
        ))}
      </ul>

      {showWizard && (
        <div className="wizard-overlay">
          <div className="wizard-backdrop" onClick={() => setShowWizard(false)} />
          <div className="wizard-panel">
            <header className="wizard-panel__header">
              <div>
                <p className="wizard-eyebrow">Wizard Plans</p>
                <span>{plan.description}</span>
              </div>
              <button type="button" className="wizard-close" onClick={() => setShowWizard(false)}>
                ✕
              </button>
            </header>

            <div className="wizard-tabs">
              {wizardPlans.map((wizardPlan) => (
                <button
                  key={wizardPlan.id}
                  type="button"
                  className={`wizard-tab ${activePlan === wizardPlan.id ? "is-active" : ""}`}
                  onClick={() => setActivePlan(wizardPlan.id)}
                >
                  <span
                    className="wizard-tab__icon"
                    style={{ borderColor: wizardPlan.accent, color: wizardPlan.accent }}
                  />
                  <span className="wizard-tab__label">{wizardPlan.label}</span>
                  {wizardPlan.tag && <span className="wizard-tab__tag">{wizardPlan.tag}</span>}
                </button>
              ))}
            </div>

            <ul className="wizard-perks">
              {plan.perks.map((perk) => (
                <li key={perk.title}>
                  <span className="wizard-tick" style={{ color: plan.accent }}>
                    ✓
                  </span>
                  <div>
                    <p>{perk.title}</p>
                    {perk.detail && <small>{perk.detail}</small>}
                  </div>
                </li>
              ))}
            </ul>

            <button type="button" className="wizard-cta" style={{ background: plan.accent }}>
              Get wizard {plan.label} for {plan.price}{" "}
              {plan.strikePrice && <span className="strike">{plan.strikePrice}</span>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileAccountPage;
