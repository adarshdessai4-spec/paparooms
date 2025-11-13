import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { hasToken, isEmailVerified, getUser } from '../utils/storage';
import { ROUTES } from '../utils/constants';

/* ---------- Per-user helpers ---------- */
function getCurrentUid() {
  const u = getUser() || {};
  return (
    u._id || u.id || u.userId || u.uid || u.email || u.phone || u.username || 'me'
  );
}
function isKycSubmitted() {
  try {
    const uid = getCurrentUid();
    return localStorage.getItem(`oyoplus:kyc:submitted:${uid}`) === 'true';
  } catch {
    return false;
  }
}
/* ------------------------------------- */

const KycSubmittedPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!hasToken()) {
      navigate(ROUTES.AUTH, { replace: true, state: { from: location } });
      return;
    }
    if (!isEmailVerified()) {
      navigate(ROUTES.BECAMEAMEMBER, { replace: true, state: { from: location } });
      return;
    }
    if (!isKycSubmitted()) {
      navigate(ROUTES.BECAMEAMEMBER_HOST, { replace: true, state: { from: location } });
      return;
    }
    setAllowed(true);
  }, [navigate, location]);

  if (!allowed) return null;

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md bg-white shadow-md rounded-xl p-8 text-center">
        <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-xl font-semibold text-gray-800">Thank you! 🎉</h1>

        <p className="text-sm text-gray-600 mt-2">
          Your KYC has been submitted and is now under verification. You can hear from us in 48–78 hours.
        </p>

        <p className="text-[11px] text-gray-400 mt-4 leading-relaxed">
          We’ll review your documents and activate payouts once your account is approved.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Link to="/" className="w-full inline-flex justify-center items-center text-sm font-medium text-red bg-gray-800 rounded-lg px-4 py-2.5" style={{ color: 'white' }}>
            Go to Home
          </Link>
          <Link to="/account" className="w-full inline-flex justify-center items-center text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg px-4 py-2.5">
            View Account
          </Link>
        </div>
      </div>
    </section>
  );
};

export default KycSubmittedPage;
