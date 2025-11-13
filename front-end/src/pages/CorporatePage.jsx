/**
 * Corporate page component (full JSX conversion)
 */

import React, { useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { CountUp } from "./CountUp";

const cityButtons = [
  { label: "Gujarat", q: { state: "Gujarat" } },
  { label: "Bengaluru", q: { city: "Bengaluru" } },
  { label: "Chennai", q: { city: "Chennai" } },
  { label: "Delhi", q: { city: "Delhi" } },
  { label: "Gurgaon", q: { city: "Gurgaon" } },
  { label: "Hyderabad", q: { city: "Hyderabad" } },
  { label: "Kolkata", q: { city: "Kolkata" } },
  { label: "Mumbai", q: { city: "Mumbai" } },
  { label: "More cities", q: {} },
];

const programCards = [
  {
    badge: "SMBs",
    title: "Starter",
    desc: "Set up corporate rates, central billing, and basic reporting in minutes.",
    bullets: ["Up to 50 travelers", "Negotiated rates", "Email support", "Basic monthly reports"],
    cta: { label: "Get started", hash: "#enquire" },
  },
  {
    badge: "Scaleups",
    title: "Growth",
    desc: "Add policy controls, approvals, and deeper analytics as you scale.",
    bullets: ["Unlimited travelers", "Approval flows", "GST-compliant invoicing", "Quarterly reviews"],
    cta: { label: "Talk to sales", hash: "#enquire" },
  },
  {
    badge: "Enterprises",
    title: "Enterprise",
    desc: "Bespoke SLAs, custom integrations, and dedicated account management.",
    bullets: ["Custom SLAs", "SAML SSO", "ERP/AP integrations", "Dedicated CSM"],
    cta: { label: "Book a demo", hash: "#enquire" },
  },
];

const stats = [
  { value: "7,500+", label: "Verified stays" },
  { value: "300+", label: "Cities covered" },
  { value: "24×7", label: "Priority support" },
  { value: "₹ Crores", label: "Annual savings unlocked" },
];

const CorporatePage = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  // Enquiry form state
  const [form, setForm] = useState({
    company: "",
    email: "",
    team_size: "1-20",
    cities: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [responseMsg, setResponseMsg] = useState("");

  const currentYear = useMemo(() => new Date().getFullYear(), []);

  const queryToString = (q) => {
    const p = new URLSearchParams();
    Object.entries(q).forEach(([k, v]) => {
      if (v) p.set(k, v);
    });
    return p.toString();
  };

  const handleCityClick = (q) => {
    const qs = queryToString(q);
    navigate(qs ? `/listings?${qs}` : "/listings");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    if (!form.company.trim()) return "Please enter your company name.";
    if (!form.email.trim()) return "Please enter your work email.";
    // very light email check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      return "Please enter a valid email address.";
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setResponseMsg("");
    const err = validate();
    if (err) {
      setResponseMsg(err);
      return;
    }
    try {
      setSubmitting(true);
      // Simulate a request – plug your API here
      await new Promise((r) => setTimeout(r, 700));
      setResponseMsg(
        "Thanks! Our team will reach out within 1 business day to tailor a program for you."
      );
      // Optional: clear form
      setForm({
        company: "",
        email: "",
        team_size: "1-20",
        cities: "",
        notes: "",
      });
    } catch {
      setResponseMsg("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div data-page="corporate">

      

      {/* Main */}
      <main className="page corporate">
        {/* Hero */}
        <section className="page-hero">
          <p className="eyebrow accent">OYO.plus for Business</p>
          <h1>Power your company's travel with OYO.plus stays</h1>
          <p>
            Unlock centralised billing, negotiated rates, and 24x7 support across 7,500+ OYO.plus
            verified hotels, homes, and serviced apartments.
          </p>
          <div className="store-links">
            <a className="btn primary" href="#enquire">
              Book a demo
            </a>
            <a className="btn ghost" href="#programs">
              Explore programs
            </a>
          </div>
        </section>

        {/* Programs */}
        <section id="programs">
          <div className="section-head">
            <h2>Built for modern travel teams</h2>
            <a className="link" href="#enquire">
              Talk to an expert
            </a>
          </div>

          <div className="program-grid" data-slot="corporate-programs">
            {programCards.map((p) => (
              <article className="program-card animate-in" key={p.title}>
                {p.badge && <span className="badge">{p.badge}</span>}
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
                <ul>
                  {p.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
                <a className="link" href={p.cta.hash}>
                  {p.cta.label}
                </a>
              </article>
            ))}
          </div>
        </section>

        {/* Stats */}
      <section>
  <div className="stats-grid" data-slot="corporate-stats">
    {stats.map((s) => (
      <div className="stat flex flex-col items-center text-center" key={s.label}>
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjuyF_XlkJc7N12XmYWdvJYL9I1sKtNvcapw&s"
          className="pb-4 w-20 h-20 rounded-full"
          alt=""
        />
        <strong className="text-2xl">
          <CountUp end={s.value} />
        </strong>
        <span>{s.label}</span>
      </div>
    ))}
  </div>
</section>


        {/* Enquiry */}
        <section id="enquire">
          <div className="section-head">
            <h2>Let's design a travel program that scales with you</h2>
          </div>

          <div className="filter-card">
            <form className="filter-grid" id="corporate-form" noValidate onSubmit={onSubmit}>
              <div className="field">
                <label htmlFor="biz-name">Company name</label>
                <input
                  id="biz-name"
                  type="text"
                  name="company"
                  placeholder="Acme Corp"
                  required
                  value={form.company}
                  onChange={onChange}
                />
              </div>
              <div className="field">
                <label htmlFor="biz-email">Work email</label>
                <input
                  id="biz-email"
                  type="email"
                  name="email"
                  placeholder="you@company.com"
                  required
                  value={form.email}
                  onChange={onChange}
                />
              </div>
              <div className="field">
                <label htmlFor="biz-size">Team size travelling monthly</label>
                <select
                  id="biz-size"
                  name="team_size"
                  value={form.team_size}
                  onChange={onChange}
                >
                  <option value="1-20">1-20</option>
                  <option value="21-50">21-50</option>
                  <option value="51-100">51-100</option>
                  <option value="100+">100+</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="biz-city">Primary travel cities</label>
                <input
                  id="biz-city"
                  type="text"
                  name="cities"
                  placeholder="Mumbai, Delhi, Bengaluru"
                  value={form.cities}
                  onChange={onChange}
                />
              </div>
              <div className="field">
                <label htmlFor="biz-notes">Key requirements</label>
                <input
                  id="biz-notes"
                  type="text"
                  name="notes"
                  placeholder="Central billing, long stays, events"
                  value={form.notes}
                  onChange={onChange}
                />
              </div>
              <button className="btn primary" type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit enquiry"}
              </button>
            </form>

            <p className="muted" id="corporate-response" role="status" aria-live="polite">
              {responseMsg}
            </p>
          </div>
        </section>
      </main>

          
    </div>
  );
};

export default CorporatePage;
