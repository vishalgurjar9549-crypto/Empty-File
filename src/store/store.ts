// src/store/store.ts
/**
 * ✅ UPDATED: Added homeSections reducer
 * ✅ UPDATED: Added stats reducer for platform-wide statistics
 */

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/auth.slice';
import roomsReducer from './slices/rooms.slice';
import bookingsReducer from './slices/bookings.slice';
import ownerReducer from './slices/owner.slice';
import uiReducer from './slices/ui.slice';
import adminReducer from './slices/admin.slice';
import subscriptionReducer from './slices/subscription.slice';
import metadataReducer from './slices/metadata.slice';
import agentReducer from './slices/agent.slice';
import tenantDashboardReducer from './slices/tenantDashboard.slice';
import otpReducer from './slices/otp.slice';
import reviewsReducer from './slices/reviews.slice';
import favoritesReducer from './slices/favorites.slice';
import notificationsReducer from './slices/notifications.slice';
// ✅ NEW: Import isolated home sections reducer
import homeSectionsReducer from './slices/homeSections.slice';
// ✅ NEW: Import stats reducer for global platform stats
import statsReducer from './slices/stats.slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    rooms: roomsReducer,
    bookings: bookingsReducer,
    owner: ownerReducer,
    ui: uiReducer,
    admin: adminReducer,
    subscription: subscriptionReducer,
    metadata: metadataReducer,
    agent: agentReducer,
    tenantDashboard: tenantDashboardReducer,
    otp: otpReducer,
    reviews: reviewsReducer,
    favorites: favoritesReducer,
    notifications: notificationsReducer,
    // ✅ NEW: Add isolated home sections state
    homeSections: homeSectionsReducer,
    // ✅ NEW: Add platform stats state
    stats: statsReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: ['persist/PERSIST', 'otp/openOtpModal'],
      ignoredPaths: ['otp.pendingRequest']
    }
  })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
