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
    favorites: favoritesReducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: {
      // Ignore these action types
      ignoredActions: ['persist/PERSIST', 'otp/openOtpModal'],
      // Ignore these paths in the state
      ignoredPaths: ['otp.pendingRequest']
    }
  })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;