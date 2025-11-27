import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SignupForm from '../components/auth/SignupForm';
import LoginForm from '../components/auth/LoginForm';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('login');

  return (
    <main className="auth-page">
      <div className="auth-page__backdrop" />
      <section className="auth-page__content">
        <div className="auth-hero-copy">
          <p className="auth-hero-copy__eyebrow">Hotels and homes across 800 cities, 24+ countries</p>
          <h1>There’s a smarter way to PAPA Rooms around</h1>
          <p>
            Sign up with your phone number and get exclusive access to discounts and savings on PAPA Rooms stays
            and with our many travel partners.
          </p>
        </div>

        <div className="auth-panel" data-auth>
          <div className="auth-panel__offer">Sign up &amp; Get ₹500 PAPA Rooms Money</div>
          <h2>Login / Signup</h2>
          <p className="auth-panel__subtitle">Choose how you want to continue</p>

          <div className="auth-toggle" role="tablist" aria-label="Login or Sign up">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'login'}
              className={`auth-tab ${activeTab === 'login' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('login')}
              id="login-tab"
            >
              Login
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'signup'}
              className={`auth-tab ${activeTab === 'signup' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('signup')}
              id="signup-tab"
            >
              Create account
            </button>
          </div>

          <p className="auth-panel__hint">
            Prefer to sign in with password instead?{" "}
            <button type="button" onClick={() => setActiveTab('login')}>Click here</button>
          </p>

          <LoginForm isActive={activeTab === 'login'} />
          <SignupForm isActive={activeTab === 'signup'} />

          <div className="auth-panel__meta">
            <span>Or sign in as</span>
            <div>
              <Link to="/support#travel-agent">Travel Agent</Link>
              <span aria-hidden="true">›</span>
              <Link to="/corporate">Corporate</Link>
              <span aria-hidden="true">›</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
