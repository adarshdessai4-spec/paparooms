// src/components/common/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { hasToken } from '../../utils/storage';
import { ROUTES } from '../../utils/constants';

/**
 * Modes:
 * - blockIfAuthed = true  => guest-only page (like /auth)
 *   If authed -> send to /
 *   If NOT authed -> allow children
 *
 * - blockIfAuthed = false => protected page (like /user, /bookings)
 *   If authed -> allow children
 *   If NOT authed -> send to /auth
 */
const ProtectedRoute = ({ children, blockIfAuthed = false }) => {
  const location = useLocation();
  const authed = hasToken();
  console.log('[ProtectedRoute] blockIfAuthed=', blockIfAuthed, ' authed=', authed, ' path=', location.pathname);

  // --- guest-only mode (eg /auth) ---
  if (blockIfAuthed) {
    if (authed) {
      // logged in -> shouldn't see /auth
      return <Navigate to={ROUTES.HOME} replace />;
    }
    // not logged in -> allowed to see /auth
    return children;
  }

  // --- normal protected mode (/user, /bookings, etc.) ---
  if (!authed) {
    // not logged in -> bounce to /auth
    return (
      <Navigate
        to={ROUTES.AUTH}
        replace
        state={{ from: location }}
      />
    );
  }

  // logged in -> allowed
  return children;
};

export default ProtectedRoute;
