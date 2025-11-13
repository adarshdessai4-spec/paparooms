import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import UserPage from './pages/UserPage';
import ListingsPage from './pages/ListingsPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import BookingsPage from './pages/BookingsPage'; // if you still have this legacy page
import AboutPage from './pages/AboutPage';
import CorporatePage from './pages/CorporatePage';
import SupportPage from './pages/SupportPage';
import OffersPage from './pages/OffersPage';
import SearchPage from './pages/SearchPage';

import CreateListingPage from './pages/CreateListingPage';
import EditListingPage from './pages/EditListingPage';

import BecameAmember from './components/auth/BecameAmember';
import BecameAmemberHost from './pages/BecameMemberHostPage';
import KycSubmittedPage from './pages/KycSubmittedPage';

import Header from './components/common/Header';
import Footer from './components/common/Footer';
import BottomNav from './components/common/BottomNav';
import ProtectedRoute from './components/common/ProtectedRoute';
import Toast from './components/common/Toast';

import RoomsPage from './pages/RoomsPage';
import RoomInner from './pages/RoomInner';
import RoomsListPage from './pages/RoomsListPage';
import RoomEdit from './pages/RoomEdit';

import { ROUTES } from './utils/constants';
import BookingPage from './pages/BookingPage';
import BookingResultPage from './pages/BookingResultPage';
import MyBookingsPage from './pages/MyBookingsPage';
import OwnerBookingsPage from './pages/OwnerBookingsPage';

import { isEmailVerified as storageIsEmailVerified } from './utils/storage';

function RequireOwner({ children }) {
  const verified = storageIsEmailVerified();
  return verified ? children : <Navigate to="/became-a-member-host" replace />;
}

function App() {
  return (
    <div className="App">
      <Header />
      <main id="main-content">
        <Routes>
          <Route path={ROUTES.HOME} element={<HomePage />} />

          {/* Rooms (child of Listing) */}
          <Route path="/listings/:listingId/rooms" element={<RoomsListPage />} />
          <Route path="/listings/:listingId/rooms/new" element={<RoomsPage />} />
          <Route path="/listings/:listingId/rooms/:id" element={<RoomInner />} />
          <Route path="/listings/:listingId/rooms/:id/edit" element={<RoomEdit />} />

          {/* Auth */}
          <Route
            path={ROUTES.AUTH}
            element={
              <ProtectedRoute blockIfAuthed={true}>
                <AuthPage />
              </ProtectedRoute>
            }
          />

          {/* Booking (must be logged-in; verification NOT required) */}
          <Route
            path="/book/:roomId"
            element={
              <ProtectedRoute>
                <BookingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/book/:bookingId/result"
            element={
              <ProtectedRoute>
                <BookingResultPage />
              </ProtectedRoute>
            }
          />

          {/* My bookings (any logged-in user) */}
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />

          {/* Owner bookings (must be verified / KYC done) */}
          <Route
            path="/owner/bookings"
            element={
              <ProtectedRoute>
                <RequireOwner>
                  <OwnerBookingsPage />
                </RequireOwner>
              </ProtectedRoute>
            }
          />

          {/* Listings & property */}
          <Route path={ROUTES.LISTINGS} element={<ListingsPage />} />
          <Route path={ROUTES.PROPERTY_DETAIL} element={<PropertyDetailPage />} />

          <Route
            path={ROUTES.LISTING_CREATE}
            element={
              <ProtectedRoute>
                <CreateListingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.LISTING_EDIT}
            element={
              <ProtectedRoute>
                <EditListingPage />
              </ProtectedRoute>
            }
          />

          <Route path={ROUTES.ABOUT} element={<AboutPage />} />
          <Route path={ROUTES.CORPORATE} element={<CorporatePage />} />
          <Route path={ROUTES.SUPPORT} element={<SupportPage />} />
          <Route path={ROUTES.OFFERS} element={<OffersPage />} />
          <Route path={ROUTES.SEARCH} element={<SearchPage />} />

          <Route
            path={ROUTES.BECAMEAMEMBER}
            element={
              <ProtectedRoute requireUnverified={true}>
                <BecameAmember />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.BECAMEAMEMBER_HOST}
            element={
              <ProtectedRoute>
                <BecameAmemberHost />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.KYC_SUBMITTED}
            element={
              <ProtectedRoute>
                <KycSubmittedPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.USER}
            element={
              <ProtectedRoute>
                <UserPage />
              </ProtectedRoute>
            }
          />

          {/* keep legacy if used */}
          <Route
            path={ROUTES.BOOKINGS}
            element={
              <ProtectedRoute>
                <BookingsPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
        </Routes>
      </main>

      <Footer />
      <BottomNav />
      <Toast />
    </div>
  );
}

export default App;
