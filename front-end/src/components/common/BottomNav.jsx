/**
 * Bottom navigation component for mobile
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const BottomNav = () => {
  const location = useLocation();

  const getActiveTab = () => {
    const path = location.pathname;
    
    if (path === '/') return 'home';
    if (path === '/listings' || path.startsWith('/property/')) return 'search';
    if (path === '/bookings' || path === '/user') return 'bookings';
    if (path === '/offers') return 'offers';
    if (path === '/account' || path === '/auth') return 'account';
    
    return 'home';
  };

  const activeTab = getActiveTab();

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Primary (mobile)">
      <Link 
        to="/" 
        className={`tab ${activeTab === 'home' ? 'active' : ''}`}
        data-nav="home"
        aria-current={activeTab === 'home' ? 'page' : undefined}
      >
        <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 10v10h14V10" />
        </svg>
        <span>Home</span>
      </Link>
      
      <Link 
        to="/listings" 
        className={`tab ${activeTab === 'search' ? 'active' : ''}`}
        data-nav="search"
        aria-current={activeTab === 'search' ? 'page' : undefined}
      >
        <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <span>Search</span>
      </Link>
      
      <Link 
        to="/bookings" 
        className={`tab ${activeTab === 'bookings' ? 'active' : ''}`}
        data-nav="bookings"
        aria-current={activeTab === 'bookings' ? 'page' : undefined}
      >
        <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M16 3v4" />
          <path d="M8 3v4" />
        </svg>
        <span>Bookings</span>
      </Link>
      
      <Link 
        to="/offers" 
        className={`tab ${activeTab === 'offers' ? 'active' : ''}`}
        data-nav="offers"
        aria-current={activeTab === 'offers' ? 'page' : undefined}
      >
        <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12l5-5 6 6 7-7" />
          <path d="M14 7h7v7" />
        </svg>
        <span>Offers</span>
      </Link>
      
      <Link 
        to="/account" 
        className={`tab ${activeTab === 'account' ? 'active' : ''}`}
        data-nav="account"
        aria-current={activeTab === 'account' ? 'page' : undefined}
      >
        <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
        <span>Account</span>
      </Link>
    </nav>
  );
};

export default BottomNav;
