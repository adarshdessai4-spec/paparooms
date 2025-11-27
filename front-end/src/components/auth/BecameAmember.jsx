import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  sendEmailOtp,
  verifyEmailOtp,
  resendEmailOtp,
} from '../../services/verifyEmail';
import {
  markUserVerified,
  getUser,
  isEmailVerified as storageIsEmailVerified,
} from '../../utils/storage';

/* ---------- Per-user KYC helpers ---------- */
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
/* ----------------------------------------- */

const BecameAmember = () => {
  const navigate = useNavigate();

  const [otp, setOtp] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [loadingSend, setLoadingSend] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [loadingResend, setLoadingResend] = useState(false);

  // control UI state
  const [otpRequested, setOtpRequested] = useState(false);

  // preload user email from localStorage
  const [email, setEmail] = useState('');
  useEffect(() => {
    const u = getUser();
    if (u?.email) setEmail(u.email);
  }, []);

  // ✅ Guard: if already verified, send them to the right place automatically
  useEffect(() => {
    if (storageIsEmailVerified()) {
      if (isKycSubmitted()) {
        navigate('/kyc-submitted', { replace: true });
      } else {
        navigate('/became-a-member-host', { replace: true });
      }
    }
  }, [navigate]);

  // STEP 1: Generate OTP
  const handleSendOtp = async () => {
    setLoadingSend(true);
    setStatusMsg('');
    try {
      const res = await sendEmailOtp();

      if (res.success) {
        setStatusMsg(res.message || 'OTP sent to your email');
        setOtpRequested(true);
      } else {
        // maybe they're already verified
        if (
          /already verified/i.test(res.error || '') ||
          res.code === 409
        ) {
          setStatusMsg('Email already verified');
          setOtpRequested(false);
          markUserVerified();
          // ➜ go to KYC immediately
          navigate('/became-a-member-host', { replace: true });
        } else {
          setStatusMsg(res.error || 'Failed to send OTP');
        }
      }
    } catch (err) {
      setStatusMsg('Something went wrong. Please try again.');
    } finally {
      setLoadingSend(false);
    }
  };

  // STEP 2: Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) {
      setStatusMsg('Please enter the 6-digit code');
      return;
    }

    setLoadingVerify(true);
    setStatusMsg('');
    try {
      const res = await verifyEmailOtp(otp);

      if (res.success) {
        setStatusMsg('Email verified!');
        markUserVerified();
        // ➜ proceed to KYC form
        navigate('/became-a-member-host', { replace: true });
      } else {
        if (/already verified/i.test(res.error || '')) {
          setStatusMsg('Email already verified');
          markUserVerified();
          // ➜ proceed to KYC form
          navigate('/became-a-member-host', { replace: true });
        } else {
          setStatusMsg(res.error || 'OTP is invalid');
        }
      }
    } catch (err) {
      setStatusMsg('Failed to verify OTP. Try again.');
    } finally {
      setLoadingVerify(false);
    }
  };

  // STEP 3: Resend OTP
  const handleResend = async () => {
    setLoadingResend(true);
    setStatusMsg('');
    try {
      const res = await resendEmailOtp();
      if (res.success) {
        setStatusMsg(res.message || 'OTP re-sent');
        setOtpRequested(true);
      } else {
        if (/already verified/i.test(res.error || '')) {
          setStatusMsg('Email already verified');
          setOtpRequested(false);
          markUserVerified();
          // ➜ proceed to KYC form
          navigate('/became-a-member-host', { replace: true });
        } else {
          setStatusMsg(res.error || 'Failed to resend OTP');
        }
      }
    } catch (err) {
      setStatusMsg('Could not resend OTP, please try later.');
    } finally {
      setLoadingResend(false);
    }
  };

  // only allow digits, max length 6
  const handleOtpChange = (e) => {
    const raw = e.target.value;
    const digitsOnly = raw.replace(/\D/g, '').slice(0, 6);
    setOtp(digitsOnly);
  };

  return (
    <section className="w-full flex justify-center bg-gradient-to-b from-rose-50/60 to-white py-16 px-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl ring-1 ring-black/5 p-6 sm:p-8">
        {/* badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-rose-300/60 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 mb-4">
          <span className="inline-flex items-center justify-center font-bold text-[10px] leading-none bg-white text-rose-600 border border-rose-300 rounded-full w-5 h-5">
            OY
          </span>
          <span>PAPA Rooms Membership</span>
        </div>

        {/* heading */}
        <h1 className="text-3xl font-semibold text-gray-900 leading-tight mb-2">
          Verify your email
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          We’ll send a one-time password to your email for verification.
        </p>

        {/* email (read-only) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email || ''}
            disabled
            className="w-full rounded-lg border border-gray-300 bg-gray-100 text-gray-700 px-3 py-2 text-sm outline-none cursor-not-allowed"
          />
          <p className="text-[11px] text-gray-500 mt-1">
            We’ll send the OTP to this email.
          </p>
        </div>

        {/* Generate OTP button (step 1) */}
        <button
          type="button"
          onClick={handleSendOtp}
          disabled={loadingSend}
          className="w-full rounded-lg bg-rose-500 text-white font-medium py-3 text-center text-sm shadow-sm hover:bg-rose-600 disabled:opacity-60 disabled:cursor-not-allowed transition mb-6"
        >
          {loadingSend ? 'Sending OTP…' : 'Generate OTP'}
        </button>

        {/* OTP + Verify only after OTP requested */}
        {otpRequested && (
          <>
            {/* OTP input */}
            <div className="mb-4">
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Enter OTP
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="6-digit code"
                value={otp}
                onChange={handleOtpChange}
                className="w-full rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400"
              />
            </div>

            {/* Verify button */}
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={loadingVerify}
              className="w-full rounded-lg bg-rose-500 text-white font-medium py-3 text-center text-sm shadow-sm hover:bg-rose-600 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {loadingVerify ? 'Verifying…' : 'Verify OTP'}
            </button>

            {/* Resend row */}
            <div className="flex items-center justify-between text-sm mt-4">
              <span className="text-gray-500">
                Didn’t receive the code?
              </span>
              <button
                type="button"
                disabled={loadingResend}
                onClick={handleResend}
                className="text-rose-600 font-medium hover:text-rose-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loadingResend ? 'Resending…' : 'Resend OTP'}
              </button>
            </div>
          </>
        )}

        {/* status / error message */}
        {statusMsg && (
          <p className="mt-4 text-center text-sm text-rose-600 font-medium">
            {statusMsg}
          </p>
        )}
      </div>
    </section>
  );
};

export default BecameAmember;
