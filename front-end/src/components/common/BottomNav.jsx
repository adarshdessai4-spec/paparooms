import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';

const tabs = [
  { id: 'home', label: 'Home', to: ROUTES.HOME, icon: 'home' },
  { id: 'search', label: 'Search', to: ROUTES.MOBILE_SEARCH, icon: 'search' },
  { id: 'bookings', label: 'Bookings', to: ROUTES.MOBILE_BOOKINGS, icon: 'calendar' },
  { id: 'offers', label: 'Offers', to: ROUTES.OFFERS, icon: 'gift' },
  { id: 'account', label: 'Account', to: ROUTES.MOBILE_ACCOUNT, icon: 'user' },
];

const icons = {
  home: (
    <>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 10v10h14V10" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M16 3v4" />
      <path d="M8 3v4" />
    </>
  ),
  gift: (
    <>
      <path d="M20 12H4v8h16z" />
      <path d="M4 12h16V8H4z" />
      <path d="M12 20V4" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
};

const BottomNav = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const active =
    tabs.find((tab) => {
      if (tab.to === ROUTES.HOME) return pathname === ROUTES.HOME;
      return pathname.startsWith(tab.to);
    })?.id || 'home';

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Primary (mobile)">
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          to={tab.to}
          className={`tab ${active === tab.id ? 'active' : ''}`}
          aria-current={active === tab.id ? 'page' : undefined}
        >
          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            {icons[tab.icon]}
          </svg>
          <span>{tab.label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default BottomNav;
