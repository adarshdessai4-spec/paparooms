/**
 * Property service functions
 */

import api from './api';

/**
 * Get all properties
 * @returns {Promise<Array>} Array of properties
 */
export const getProperties = async () => {
  try {
    const response = await api.get('/properties');
    return { success: true, properties: response.data };
  } catch (error) {
    console.error('Get properties error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to load properties',
      properties: [],
    };
  }
};

/**
 * Get property by ID
 * @param {string} id - Property ID
 * @returns {Promise<Object>} Property data
 */
export const getPropertyById = async (id) => {
  try {
    const response = await api.get(`/properties/${id}`);
    return { success: true, property: response.data };
  } catch (error) {
    console.error('Get property error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Property not found',
      property: null,
    };
  }
};

/**
 * Search properties with filters
 * @param {Object} filters - Search filters
 * @returns {Promise<Array>} Array of filtered properties
 */
export const searchProperties = async (filters) => {
  try {
    const response = await api.get('/properties/search', { params: filters });
    return { success: true, properties: response.data };
  } catch (error) {
    console.error('Search properties error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Search failed',
      properties: [],
    };
  }
};

/**
 * Get properties from local JSON file (fallback)
 * @returns {Promise<Array>} Array of properties
 */
// src/services/propertyService.js
export const getLocalProperties = async () => {
  try {
    const res = await fetch('/data/properties.json', { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Local properties file missing (${res.status})`);
    }
    const data = await res.json();
    const list = Array.isArray(data) ? data : data.properties || [];
    return {
      success: true,
      properties: list,
    };
  } catch (error) {
    console.error('Get local properties error:', error);
    return {
      success: false,
      properties: [],
      error: error.message || 'Unable to load local properties',
    };
  }
};


/**
 * Create booking
 * @param {Object} bookingData - Booking data
 * @returns {Promise<Object>} Booking response
 */
export const createBooking = async (bookingData) => {
  try {
    const response = await api.post('/bookings', bookingData);
    return { success: true, booking: response.data };
  } catch (error) {
    console.error('Create booking error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to create booking',
    };
  }
};

/**
 * Get user bookings
 * @returns {Promise<Array>} Array of user bookings
 */
export const getUserBookings = async () => {
  try {
    const response = await api.get('/bookings');
    return { success: true, bookings: response.data };
  } catch (error) {
    console.error('Get bookings error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to load bookings',
      bookings: [],
    };
  }
};

/**
 * Cancel booking
 * @param {string} bookingId - Booking ID
 * @returns {Promise<Object>} Cancel response
 */
export const cancelBooking = async (bookingId) => {
  try {
    const response = await api.delete(`/bookings/${bookingId}`);
    return { success: true, booking: response.data };
  } catch (error) {
    console.error('Cancel booking error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to cancel booking',
    };
  }
};
