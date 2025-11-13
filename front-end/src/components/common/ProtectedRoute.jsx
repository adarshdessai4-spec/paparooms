// src/components/common/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { hasToken, isEmailVerified } from '../../utils/storage';
import { ROUTES } from '../../utils/constants';

const ProtectedRoute = ({ children, blockIfAuthed = false, requireUnverified = false }) => {
  const authed = hasToken();
  const location = useLocation();

  // Block guest pages (e.g., /auth) when logged in
  if (blockIfAuthed) {
    return authed ? <Navigate to={ROUTES.HOME} replace /> : children;
  }

  // Normal protected pages
  if (!authed) {
    return <Navigate to={ROUTES.AUTH} replace state={{ from: location }} />;
  }

  // Pages only for logged-in but UNverified users
  if (requireUnverified) {
    if (isEmailVerified()) {
      return <Navigate to={ROUTES.BECAMEAMEMBER_HOST} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
