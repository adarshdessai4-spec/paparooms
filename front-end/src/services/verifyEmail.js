// src/services/verifyEmail.js
import api from './api';
import { markUserVerified, saveUser } from '../utils/storage';

export const sendEmailOtp = async () => {
  try {
    const res = await api.post('/verify-email/send');
    console.log("sendEmailOtp response:", res.data);
    return { success: true, message: res.data?.message || 'OTP sent' };
  } catch (err) {
    console.error("sendEmailOtp error:", err);
    return {
      success: false,
      error: err?.response?.data?.message || 'Failed to send OTP. Please try again.',
      code: err?.response?.status,
    };
  }
};

export const verifyEmailOtp = async (otp) => {
  try {
    const res = await api.post('/verify-email/verify', { otp });

    // ✅ Immediately persist verified status (no cookie/session changes)
    markUserVerified();

    // If backend returns user, persist and normalize verified fields
    const user = res?.data?.user;
    if (user) {
      if (
        user.isEmailVerified === undefined &&
        user.emailVerified === undefined &&
        user.verified === undefined &&
        user.isVerified === undefined
      ) {
        user.isEmailVerified = true;
      }
      saveUser(user);
    }

    return { success: true, data: res.data };
  } catch (err) {
    return {
      success: false,
      error: err?.response?.data?.message || 'Failed to verify OTP. Please try again.',
      code: err?.response?.status,
    };
  }
};

export const resendEmailOtp = async () => {
  try {
    const res = await api.post('/verify-email/resend');
    return { success: true, message: res.data?.message || 'OTP re-sent' };
  } catch (err) {
    return {
      success: false,
      error: err?.response?.data?.message || 'Failed to resend OTP. Please try again.',
      code: err?.response?.status,
    };
  }
};
