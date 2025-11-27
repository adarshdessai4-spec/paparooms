import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getUserInitials } from '../../utils/formatters';
import {
  CITY_LINKS,
  CONTACT_NUMBER,
  LS_AUTH_KEY,
  LS_USER_KEY,
  PRIMARY_ACTIONS,
} from '../../constants/menu';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const readLocalUser = () => {
    try {
      return JSON.parse(localStorage.getItem(LS_USER_KEY) || 'null');
    } catch {
      return null;
    }
  };

  const [localAuthed, setLocalAuthed] = useState(
    () => localStorage.getItem(LS_AUTH_KEY) === 'true'
  );
  const [localUser, setLocalUser] = useState(readLocalUser);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAuthed = isAuthenticated || localAuthed;
  const displayUser = user || localUser;

  const userBtnRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === LS_AUTH_KEY) setLocalAuthed(e.newValue === 'true');
      if (e.key === LS_USER_KEY) setLocalUser(readLocalUser());
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  useEffect(() => {
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    setLocalAuthed(localStorage.getItem(LS_AUTH_KEY) === 'true');
    setLocalUser(readLocalUser());
  }, [location.pathname, location.search, location.hash]);

  useEffect(() => {
    const handler = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  useEffect(() => {
    const onDocClick = (e) => {
      if (
        isUserMenuOpen &&
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target) &&
        userBtnRef.current &&
        !userBtnRef.current.contains(e.target)
      ) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [isUserMenuOpen]);

  const initials = useMemo(
    () => getUserInitials(displayUser?.name || displayUser?.email || ''),
    [displayUser]
  );

  const greeting = useMemo(() => {
    if (displayUser?.name) return `Hi, ${displayUser.name.split(' ')[0]}!`;
    if (displayUser?.email) return `Hi, ${displayUser.email.split('@')[0]}!`;
    return 'Hi there!';
  }, [displayUser]);

  const handleLogout = () => {
    try {
      logout?.();
    } catch {
      /* noop */
    }
    localStorage.removeItem(LS_AUTH_KEY);
    localStorage.removeItem(LS_USER_KEY);
    setLocalAuthed(false);
    setLocalUser(null);
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const handleCityClick = (city) => {
    navigate(`/listings?city=${encodeURIComponent(city)}`);
  };

  return (
    <>
      <a href="#main-content" className="sr-only sr-only-focusable">
        Skip to main content
      </a>

      <header className="oyo-header">
        <div className="oyo-header__top">
          <div className="oyo-brand-cluster">
            <Link className="oyo-mark" to="/" aria-label="PAPA home">
              <img src="/brand-logo.png" alt="PAPA Rooms" />
            </Link>
          </div>

          <button
            type="button"
            className="mobile-menu-toggle"
            aria-expanded={isMobileMenuOpen}
            aria-controls="oyo-header-menu"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          >
            <span className="sr-only">Toggle navigation</span>
            <span className="mobile-menu-toggle__icon" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>

          <div
            id="oyo-header-menu"
            className={`oyo-top-right${isMobileMenuOpen ? ' is-open' : ''}`}
          >
            <nav aria-label="Primary actions" className="oyo-primary-links">
              {PRIMARY_ACTIONS.map((action) => (
                <Link key={action.label} to={action.to} className="primary-link">
                  <span>{action.label}</span>
                  <small>{action.description}</small>
                </Link>
              ))}
            </nav>

            <div className="oyo-header__meta">
              <a className="contact-link" href={`tel:${CONTACT_NUMBER.replace(/-/g, '')}`}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.86 19.86 0 0 1 3.11 5.18 2 2 0 0 1 5.11 3h3a2 2 0 0 1 2 1.72c.12.86.34 1.7.65 2.49a2 2 0 0 1-.45 2.11l-1.27 1.27a16 16 0 0 0 6.86 6.86l1.27-1.27a2 2 0 0 1 2.11-.45c.79.31 1.63.53 2.49.65A2 2 0 0 1 22 16.92Z" />
                </svg>
                <span>
                  {CONTACT_NUMBER}
                  <small>Call us to Book now</small>
                </span>
              </a>

              <button type="button" className="language-btn">
                English
                <svg viewBox="0 0 12 12" aria-hidden="true">
                  <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </button>

              {isAuthed ? (
                <div className="oyo-user">
                  <button
                    ref={userBtnRef}
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded={isUserMenuOpen}
                    className="user-avatar"
                    onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  >
                    {initials || 'U'}
                  </button>

                  {isUserMenuOpen && (
                    <div ref={userMenuRef} className="user-menu" role="menu">
                      <p>{greeting}</p>
                      <Link to="/user" role="menuitem">
                        My account
                      </Link>
                      <button type="button" onClick={handleLogout} role="menuitem">
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/auth" className="login-link">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4 0-7 2-7 4v2h14v-2c0-2-3-4-7-4Z" />
                  </svg>
                  Login / Signup
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="oyo-header__cities">
          {CITY_LINKS.map((city) => (
            <button
              key={city}
              type="button"
              className="city-link"
              onClick={() => handleCityClick(city)}
            >
              {city}
              <svg viewBox="0 0 12 12" aria-hidden="true">
                <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </button>
          ))}
          <button type="button" className="city-link city-link--all" onClick={() => navigate('/listings')}>
            All Cities
            <svg viewBox="0 0 12 12" aria-hidden="true">
              <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </button>
        </div>
      </header>
    </>
  );
};

export default Header;
