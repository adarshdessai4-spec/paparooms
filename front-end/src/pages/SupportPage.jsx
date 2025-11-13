/**
 * Support page component (Tailwind-styled)
 * - Keeps your original classNames (e.g., "support-page", "tab", "faq-item", etc.)
 * - Adds Tailwind utilities for colors, spacing, responsiveness
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const SupportPage = () => {
  const [activeTab, setActiveTab] = useState('faq');

  const faqs = [
    {
      question: "How do I book a stay?",
      answer: "Simply search for your destination, select your dates, and choose from our verified properties. Click 'Book Now' and follow the booking process."
    },
    {
      question: "What is your cancellation policy?",
      answer: "We offer flexible cancellation policies. Most bookings can be cancelled free of charge up to 24 hours before check-in."
    },
    {
      question: "How do I contact customer support?",
      answer: "You can reach our 24/7 customer support team via phone at +91 9090-123-456 or email at support@oyo.plus"
    },
    {
      question: "Do you offer group bookings?",
      answer: "Yes, we offer special rates for group bookings. Contact our support team for assistance with group reservations."
    },
    {
      question: "What amenities are included?",
      answer: "Each property listing shows detailed amenities. Common amenities include Wi-Fi, AC, daily housekeeping, and 24/7 support."
    }
  ];

  return (
    <div className="support-page min-h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-pink-50 text-gray-800">
      {/* Hero */}
      <div className="support-hero relative overflow-hidden">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-pink-200/60 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-indigo-200/60 blur-3xl" />

        <div className="container mx-auto px-4 py-14 sm:py-16 md:py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-600">
              Help Center
            </h1>
            <p className="mt-4 text-base sm:text-lg text-gray-600">
              Find answers to common questions or get in touch with our support team
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="support-content container mx-auto px-4 pb-16">
        {/* Tabs */}
        <div className="support-tabs flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8">
          <button
            className={`tab ${activeTab === 'faq' ? 'is-active' : ''} px-4 sm:px-5 py-2 rounded-full text-sm font-semibold transition
              ${activeTab === 'faq'
                ? 'bg-white text-indigo-600 shadow ring-1 ring-indigo-100'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
            onClick={() => setActiveTab('faq')}
          >
            FAQ
          </button>
          <button
            className={`tab ${activeTab === 'contact' ? 'is-active' : ''} px-4 sm:px-5 py-2 rounded-full text-sm font-semibold transition
              ${activeTab === 'contact'
                ? 'bg-white text-pink-600 shadow ring-1 ring-pink-100'
                : 'bg-pink-50 text-pink-700 hover:bg-pink-100'}`}
            onClick={() => setActiveTab('contact')}
          >
            Contact Us
          </button>
          <button
            className={`tab ${activeTab === 'policies' ? 'is-active' : ''} px-4 sm:px-5 py-2 rounded-full text-sm font-semibold transition
              ${activeTab === 'policies'
                ? 'bg-white text-emerald-600 shadow ring-1 ring-emerald-100'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
            onClick={() => setActiveTab('policies')}
          >
            Policies
          </button>
        </div>

        {/* Main */}
        <div className="support-main">
          {/* FAQ */}
          {activeTab === 'faq' && (
            <div className="faq-section">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center">
                Frequently Asked Questions
              </h2>

              <div className="faq-list mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="faq-item group rounded-2xl bg-white p-5 sm:p-6 shadow-sm ring-1 ring-gray-100 hover:shadow-md transition"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 flex items-start">
                      <span className="mr-2 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold">
                        {index + 1}
                      </span>
                      {faq.question}
                    </h3>
                    <p className="mt-2 text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact */}
          {activeTab === 'contact' && (
            <div className="contact-section">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center">
                Contact Support
              </h2>

              <div className="contact-methods mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="contact-method rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 hover:shadow-md transition">
                  <h3 className="text-lg font-semibold text-gray-900">Phone Support</h3>
                  <p className="mt-1 text-gray-600">Available 24/7</p>
                  <a
                    href="tel:+919090123456"
                    className="contact-link mt-3 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 !text-white font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    +91 9090-123-456
                  </a>
                </div>

                <div className="contact-method rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 hover:shadow-md transition">
                  <h3 className="text-lg font-semibold text-gray-900">Email Support</h3>
                  <p className="mt-1 text-gray-600">Response within 2 hours</p>
                  <a
                    href="mailto:support@oyo.plus"
                    className="contact-link mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-300 px-4 py-2 text-white font-medium hover:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
                  >
                    support@oyo.plus
                  </a>
                </div>

                <div className="contact-method rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 hover:shadow-md transition">
                  <h3 className="text-lg font-semibold text-gray-900">Live Chat</h3>
                  <p className="mt-1 text-gray-600">Available 9 AM - 9 PM</p>
                  <button
                    className="btn primary mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white font-medium hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    Start Chat
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Policies */}
          {activeTab === 'policies' && (
            <div className="policies-section">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center">
                Our Policies
              </h2>

              <div className="policy-list mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="policy-item rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 hover:shadow-md transition">
                  <h3 className="text-lg font-semibold text-gray-900">Cancellation Policy</h3>
                  <p className="mt-2 text-gray-600 leading-relaxed">
                    Most bookings can be cancelled free of charge up to 24 hours before check-in.
                    Some special rate bookings may have different cancellation terms.
                  </p>
                </div>

                <div className="policy-item rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 hover:shadow-md transition">
                  <h3 className="text-lg font-semibold text-gray-900">Privacy Policy</h3>
                  <p className="mt-2 text-gray-600 leading-relaxed">
                    We are committed to protecting your privacy. Your personal information is
                    securely stored and never shared with third parties without your consent.
                  </p>
                </div>

                <div className="policy-item rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 hover:shadow-md transition">
                  <h3 className="text-lg font-semibold text-gray-900">Terms of Service</h3>
                  <p className="mt-2 text-gray-600 leading-relaxed">
                    By using our platform, you agree to our terms of service. Please read
                    our complete terms and conditions for detailed information.
                  </p>
                </div>

                <div className="policy-item rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 hover:shadow-md transition">
                  <h3 className="text-lg font-semibold text-gray-900">Responsible Disclosure</h3>
                  <p className="mt-2 text-gray-600 leading-relaxed">
                    We take security seriously. If you discover a security vulnerability,
                    please report it responsibly through our security team.
                  </p>
                </div>
              </div>

              {/* Helpful links row */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/terms"
                  className="inline-flex items-center rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-100 hover:bg-gray-50"
                >
                  Read Terms
                </Link>
                <Link
                  to="/privacy"
                  className="inline-flex items-center rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-100 hover:bg-gray-50"
                >
                  Privacy Details
                </Link>
                <Link
                  to="/refunds"
                  className="inline-flex items-center rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-100 hover:bg-gray-50"
                >
                  Refund Policy
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
