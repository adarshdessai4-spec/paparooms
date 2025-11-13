// src/services/api.js
import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';
import { getToken } from '../utils/storage';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    // If you also support Bearer tokens, keep this:
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;

    // ✅ If sending FormData, let Axios set proper multipart boundaries
    if (config.data instanceof FormData) {
      // Remove any preset content-type so Axios can add it with boundary
      if (config.headers && config.headers['Content-Type']) {
        delete config.headers['Content-Type'];
      }
    }

    return config;
  },
  (err) => Promise.reject(err)
);

// ❌ No global redirects; let each page handle 401s.
api.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err)
);

export default api;
