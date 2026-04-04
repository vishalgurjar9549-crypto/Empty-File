import { Router } from 'express';
import authRoutes from './auth.routes';
import roomRoutes from './room.routes';
import bookingRoutes from './booking.routes';
import profileRoutes from './profile.routes';
import ownerRoutes from './owner.routes';
import adminRoutes from './admin.routes';
import agentRoutes from './agent.routes';
import paymentRoutes from './payment.routes';
import tenantSubscriptionRoutes from './tenant-subscription.routes';
import healthRoutes from './health.routes';
import metadataRoutes from './metadata.routes';
import cloudinaryRoutes from './cloudinary.routes';
import { propertyNotesRouter, notesRouter } from './property-note.routes';
import notificationRoutes from './notification.routes';
import tenantDashboardRoutes from './tenant-dashboard.routes';
import contactRoutes from './contact.routes';
import reviewRoutes from './reviews.routes';
import favoritesRoutes from './favorites.routes';
import statsRoutes from './stats.routes';
import homepageRoutes from './homepage.routes';
const router = Router();
router.use('/auth', authRoutes);
router.use('/rooms', roomRoutes);
router.use('/bookings', bookingRoutes);
router.use('/profile', profileRoutes);
router.use('/owners', ownerRoutes);
router.use('/admin', adminRoutes);
router.use('/agent', agentRoutes);
router.use('/payments', paymentRoutes);
router.use('/tenant-subscriptions', tenantSubscriptionRoutes);
router.use('/tenant', tenantDashboardRoutes);
router.use('/health', healthRoutes);
router.use('/metadata', metadataRoutes);
router.use('/cloudinary', cloudinaryRoutes);
router.use('/contacts', contactRoutes);
router.use('/reviews', reviewRoutes);
router.use('/favorites', favoritesRoutes);
router.use('/stats', statsRoutes);
router.use('/homepage-data', homepageRoutes);
console.log("ROUTES FILE LOADED");
// Property Notes Routes
// POST/GET /api/properties/:propertyId/notes
router.use('/properties/:propertyId/notes', propertyNotesRouter);

// Note-specific Routes
// PATCH/DELETE /api/notes/:noteId
router.use('/notes', notesRouter);

// Notification Routes
// GET/PATCH /api/notifications
router.use('/notifications', notificationRoutes);
export default router;