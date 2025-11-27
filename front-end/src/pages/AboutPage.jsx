/**
 * About page component (no header; header is global)
 */

import React, { useMemo } from "react";
import { NavLink, Link } from "react-router-dom";
import { CountUp } from "./CountUp";

const ABOUT_STATS = [
  { value: "22+", label: "States covered" },
  { value: "300+", label: "Cities served" },
  { value: "50,000+", label: "Hotels & homes" },
  { value: "24/7", label: "Guest support" },
];

const MILESTONES = [
  { year: "2018", title: "Founding", text: "Launched with a mission to standardize budget stays." },
  { year: "2020", title: "Quality bar", text: "Rolled out property verification & hygiene audits." },
  { year: "2022", title: "Work-ready", text: "Introduced remote-ready rooms and long-stay plans." },
  { year: "2024", title: "PAPA Rooms", text: "Curated, verified stays across India’s top cities." },
];

const CULTURE = [
  { title: "Customer first", text: "We obsess over check-in smiles and friction-free stays." },
  { title: "Build fast", text: "Bias to action, measurable impact, and continuous iteration." },
  { title: "Own it", text: "High trust, high accountability, zero micromanagement." },
  { title: "Win together", text: "Cross-functional squads, candid feedback, and shared goals." },
];

const AboutPage = () => {
  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <div data-page="about">
      {/* Main */}
      <main className="page about">
        {/* Hero */}
        <section className="page-hero">
          <p className="eyebrow accent">Our story</p>
          <h1>We make reliable stays accessible to everyone who loves to travel</h1>
          <p>
            PAPA Rooms is a hospitality technology platform that partners with independent hotels and
            homeowners across India to deliver consistent, quality stays in every major state.
          </p>
        </section>

        {/* Stats */}
      <section>
  <div className="stats-grid" data-slot="about-stats">
    {ABOUT_STATS.map((s) => (
      <div className="stat flex flex-col items-center text-center" key={s.label}>
        <img
          src={
            s.img ||
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjuyF_XlkJc7N12XmYWdvJYL9I1sKtNvcapw&s"
          }
          alt={s.alt || s.label}
          className="pb-4 w-20 h-20 rounded-full object-cover"
        />
        <strong className="text-2xl">
          <CountUp end={s.value} />
        </strong>
        <span className="opacity-80">{s.label}</span>
      </div>
    ))}
  </div>
</section>


        {/* Milestones */}
        <section>
          <div className="section-head">
            <h2>Milestones that shaped PAPA Rooms</h2>
          </div>
          <div className="timeline" data-slot="about-timeline">
            {MILESTONES.map((m) => (
              <article className="timeline-item" key={m.year}>
                <div className="timeline-dot" aria-hidden="true" />
                <div className="timeline-body">
                  <h3>
                    {m.year} — {m.title}
                  </h3>
                  <p>{m.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Careers / Culture */}
        <section id="careers">
          <div className="section-head">
            <h2>Life at PAPA Rooms</h2>
            <a className="link" href="#careers-open-roles">
              View open roles
            </a>
          </div>
          <p>
            We are a distributed team of product builders, hospitality experts, and traveller
            advocates solving real-world lodging challenges. We move fast, listen to guests, and
            measure success by the smiles at check-in.
          </p>

          <div className="culture-grid" data-slot="about-culture">
            {CULTURE.map((c) => (
              <article className="culture-card animate-in" key={c.title}>
                <h3>{c.title}</h3>
                <p>{c.text}</p>
              </article>
            ))}
          </div>

          {/* Optional anchor section for open roles */}
          <div id="careers-open-roles" className="careers-cta">
            <NavLink className="btn primary" to="/about#careers">
              Explore roles
            </NavLink>
            <NavLink className="btn ghost" to="/about">
              Learn more
            </NavLink>
          </div>
        </section>
      </main>

      {/* Mobile footer CTA */}
      <div className="mobile-footer-cta">
        <a className="btn ghost" href="/#download">
          Download app
        </a>
        <NavLink className="btn primary" to="/listings">
          Book now
        </NavLink>
      </div>

 
    </div>
  );
};

export default AboutPage;
