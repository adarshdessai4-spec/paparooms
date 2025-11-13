/**
 * Authentication service functions
 */
import api from './api';
import { saveToken, saveUser, clearAuth } from '../utils/storage';

const LS_AUTH_KEY = 'oyoplus:isAuthed';

/**
 * Login user
 */
export const login = async (email, password) => {
  try {
    const res = await api.post('/auth/login', { email, password });
    const { user } = res.data || {};
    // 🔹 Prefer token from response body, else fallback to response headers
    const token = res.data?.token || res.headers['x-auth-token'] || null;

    saveToken(token);
    saveUser(user);
    try { localStorage.setItem(LS_AUTH_KEY, 'true'); } catch {}

    return { success: true, user, token };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Login failed. Please try again.',
    };
  }
};

/**
 * Signup user
 */
export const signup = async (userData) => {
  try {
    const res = await api.post('/auth/signup', userData);
    const { user } = res.data || {};
    const token = res.data?.token || res.headers['x-auth-token'] || null;

    saveToken(token);
    saveUser(user);
    try { localStorage.setItem(LS_AUTH_KEY, 'true'); } catch {}

    return { success: true, user, token };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Signup failed. Please try again.',
    };
  }
};

/**
 * Logout
 */
export const logout = () => {
  clearAuth();
  try { localStorage.setItem(LS_AUTH_KEY, 'false'); } catch {}
};

/**
 * Current user
 */
export const getCurrentUser = async () => {
  try {
    const res = await api.get('/auth/me');
    // Optional: refresh stored user
    if (res?.data) saveUser(res.data);
    return { success: true, user: res.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to get user data',
    };
  }
};
