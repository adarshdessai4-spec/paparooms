// src/services/listings.js
import api from '../services/api';

// Returns: { success, data, page } OR sometimes just an array depending on backend
export const fetchListings = async (params = {}) => {
  const res = await api.get('/listings', { params });
  return res.data;
};

// Returns: { success, data } OR a listing object
export const fetchListingById = async (id) => {
  const res = await api.get(`/listings/${id}`);
  return res.data;
};

// Returns: created listing object (must include _id)
export const createListing = async (formData) => {
  const res = await api.post('/listings', formData);
  return res.data;
};

// Returns: updated listing object (must include _id)
export const updateListing = async (id, formData) => {
  const res = await api.put(`/listings/${id}`, formData);
  return res.data;
};

// Returns: delete result or deleted doc
export const deleteListing = async (id) => {
  const res = await api.delete(`/listings/${id}`);
  return res.data;
};

// Returns: updated listing (with new status)
export const publishListing = async (id, action) => {
  const res = await api.post(`/listings/${id}/publish`, { action });
  return res.data;
};
