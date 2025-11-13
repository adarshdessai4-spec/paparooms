/**
 * Footer component (global)
 * - Compact, link blocks + bottom row
 * - Keeps your class names; more a11y + external target hygiene
 */

import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="site-footer" id="support">
      <div className="footer-columns">
        <div>
          <h4>OYO.plus</h4>
          <p>
            Leading travel technology platform that makes staying easy, affordable, and dependable.
          </p>
        </div>

        <div>
          <h4>Company</h4>
          <ul>
            <li><Link to="/about">About us</Link></li>
            <li><Link to="/about#careers">Careers</Link></li>
            <li><a href="#" rel="noopener">Press</a></li>
            <li><a href="#" rel="noopener">Investors</a></li>
          </ul>
        </div>

        <div>
          <h4>Support</h4>
          <ul>
            <li><Link to="/support">Help center</Link></li>
            <li><Link to="/support#contact">Contact us</Link></li>
            <li><a href="#" rel="noopener">Responsible disclosure</a></li>
            <li><a href="#" rel="noopener">Cancellation policy</a></li>
          </ul>
        </div>

        <div>
          <h4>Discover</h4>
          <ul>
            <li><Link to="/listings">Stays with kitchens</Link></li>
            <li><Link to="/listings">Long-term rentals</Link></li>
            <li><Link to="/listings">Pet-friendly stays</Link></li>
            <li><Link to="/listings">Self check-in homes</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <span>&copy; {new Date().getFullYear()} OYO.plus</span>
        <div className="policy-links">
          <a href="#" rel="noopener">Terms</a>
          <a href="#" rel="noopener">Privacy</a>
          <a href="#" rel="noopener">Cookie policy</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
