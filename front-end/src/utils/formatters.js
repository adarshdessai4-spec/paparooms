/**
 * Utility functions for formatting data
 */

/**
 * Format price with currency
 * @param {number} value - Price value
 * @param {string} currency - Currency code (default: 'INR')
 * @returns {string} Formatted price string
 */
export const formatPrice = (value, currency = 'INR') => {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0
  });
  
  return formatter.format(value);
};

/**
 * Format date for display
 * @param {string|Date} value - Date value
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDate = (value, options = { day: 'numeric', month: 'short', year: 'numeric' }) => {
  try {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    return date.toLocaleDateString('en-IN', options);
  } catch (error) {
    console.warn('Unable to format date:', error);
    return '';
  }
};

/**
 * Format membership date
 * @param {string|Date} value - Date value
 * @returns {string} Formatted membership date
 */
export const formatMembershipDate = (value) => {
  const formatted = formatDate(value);
  if (formatted) return formatted;
  return formatDate(new Date()) || '';
};

/**
 * Format booking status
 * @param {string} status - Booking status
 * @returns {string} Formatted status string
 */
export const formatBookingStatus = (status) => {
  if (!status) return 'Reserved';
  
  const normalized = status.toLowerCase();
  const statusMap = {
    'reserved': 'Reserved',
    'pending_payment': 'Pending payment',
    'confirmed': 'Confirmed',
    'cancelled': 'Cancelled'
  };
  
  return statusMap[normalized] || status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

/**
 * Get user initials from name
 * @param {string} name - User's full name
 * @returns {string} User initials
 */
export const getUserInitials = (name) => {
  if (!name) return 'OY';
  
  const parts = name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase());
  
  if (parts.length === 0) return 'OY';
  return parts.slice(0, 2).join('');
};

/**
 * Calculate booking totals
 * @param {Object} property - Property object
 * @param {number} nights - Number of nights
 * @returns {Object} Booking totals object
 */
export const calculateBookingTotals = (property, nights = 1) => {
  if (!property) {
    return {
      nightlyRate: 0,
      nights: 0,
      subtotal: 0,
      tax: 0,
      fees: 299,
      total: 299,
      currency: 'INR'
    };
  }
  
  const nightsCount = Math.max(1, Number(nights) || 1);
  const nightlyRate = Number(property.price) || 0;
  const subtotal = nightlyRate * nightsCount;
  const tax = Math.round(subtotal * 0.12); // 12% tax
  const fees = 299; // Service fee
  const total = subtotal + tax + fees;
  
  return {
    nightlyRate,
    nights: nightsCount,
    subtotal,
    tax,
    fees,
    total,
    currency: property.currency || 'INR'
  };
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid and errors
 */
export const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
export const validatePhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  return /^[6-9]\d{9}$/.test(cleaned);
};

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Generate unique ID
 * @returns {string} Unique identifier
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
