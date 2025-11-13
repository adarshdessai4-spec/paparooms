/**
 * Application constants
 */

export const API_BASE_URL = 'https://oyo-plus-test-osn4.onrender.com/api';

export const STORAGE_KEYS = Object.freeze({
  authToken: 'authToken',
  user: 'oyoplus:user',
  bookings: 'oyoplus:bookings'
});

export const BOOKING_CONSTANTS = Object.freeze({
  taxRate: 0.12,
  serviceFee: 299
});

export const STATE_LIST = Object.freeze([
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh',
  'Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland',
  'Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal'
]);

// export const ROUTES = Object.freeze({
//   HOME: '/',
//   AUTH: '/auth',
//   USER: '/user',
//   LISTINGS: '/listings',
//   // property detail stays as you had:
//   PROPERTY_DETAIL: '/property/:id',
//   BOOKINGS: '/bookings',
//   ABOUT: '/about',
//   CORPORATE: '/corporate',
//   SUPPORT: '/support',
//   OFFERS: '/offers',
//   KYC_SUBMITTED: '/kyc-submitted',
//   SEARCH: '/search',
//   ACCOUNT: '/account',
//   BECAMEAMEMBER: '/became-a-member',
//   BECAMEAMEMBER_HOST: '/became-a-member-host',
//   // NEW:
//   LISTING_CREATE: '/listings/create',
//   LISTING_EDIT: '/property/:id/edit',
// });
// src/utils/constants.js

export const ROUTES = Object.freeze({
  HOME: '/',
  AUTH: '/auth',
  USER: '/user',
  LISTINGS: '/listings',
  PROPERTY_DETAIL: '/property/:id',
  BOOKINGS: '/bookings',
  ABOUT: '/about',
  CORPORATE: '/corporate',
  SUPPORT: '/support',
  OFFERS: '/offers',
  KYC_SUBMITTED: '/kyc-submitted',
  SEARCH: '/search',
  ACCOUNT: '/account',
  BECAMEAMEMBER: '/became-a-member',
  BECAMEAMEMBER_HOST: '/became-a-member-host',
  LISTING_CREATE: '/listings/create',
  LISTING_EDIT: '/property/:id/edit',
  
});

export const TOAST_TYPES = Object.freeze({
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
});

export const VALIDATION_RULES = Object.freeze({
  PASSWORD: {
    minLength: 8, requireUppercase: true, requireLowercase: true, requireNumber: true, requireSpecialChar: true
  },
  PHONE: { pattern: /^[6-9]\d{9}$/, length: 10 },
  EMAIL: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
});
