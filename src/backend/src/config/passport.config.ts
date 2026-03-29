import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from './env';
import { getPrismaClient } from '../utils/prisma';
import { logger } from '../utils/logger';
import bcrypt from 'bcryptjs';
import { userRepository } from '../repositories';
import { IdentityLinkingService } from '../services/IdentityLinkingService';

const prisma = getPrismaClient();
const identityLinking = new IdentityLinkingService(userRepository);

/**
 * GOOGLE OAUTH CONFIGURATION
 *
 * Strategy: Find or create user using identity resolution.
 *
 * Resolution order:
 * 1. If email exists → use that user + link Google ID
 * 2. Else → create new user with Google ID
 *
 * Flow:
 * 1. User clicks "Continue with Google"
 * 2. Redirected to Google for authentication
 * 3. Google redirects back with profile data
 * 4. We find or create user by email
 * 5. Auto-link Google ID + auto-verify email
 * 6. Issue JWT token (same as email/password login)
 *
 * Security:
 * - Email is primary identity (prevents duplicate accounts)
 * - If user exists with email, link Google ID
 * - If user doesn't exist, create new account with Google ID
 * - Email auto-verified (Google already confirmed it)
 */

passport.use(new GoogleStrategy({
  clientID: env.GOOGLE_CLIENT_ID as string,
  clientSecret: env.GOOGLE_CLIENT_SECRET as string,
  callbackURL: env.GOOGLE_CALLBACK_URL as string,
  scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Extract email and Google ID from profile
    const email = profile.emails?.[0]?.value;
    const googleId = profile.id;
    const name = profile.displayName || 'Google User';

    if (!email) {
      return done(new Error('No email provided by Google'), undefined);
    }

    // ═════════════════════════════════════════════════════════════════════
    // USE IDENTITY LINKING: Find or create user
    // ═════════════════════════════════════════════════════════════════════
    let user = await identityLinking.findOrCreateUserByIdentity({
      email,
      name,
      role: 'TENANT'
    });

    // ═════════════════════════════════════════════════════════════════════
    // LINK GOOGLE ID to user (if not already linked)
    // ═════════════════════════════════════════════════════════════════════
    if (!user.googleId) {
      user = await identityLinking.linkGoogleIdToUser(user.id, googleId);
      logger.info('Linked Google ID to user', {
        userId: user.id,
        email,
        isNewAccount: false
      });
    } else {
      logger.info('User already has Google ID linked', {
        userId: user.id,
        email
      });
    }

    // Return user (passport will attach to req.user)
    return done(null, user);
  } catch (error: any) {
    logger.error('Google OAuth error', {
      error: error.message,
      stack: error.stack
    });
    return done(error, undefined);
  }
}));

// Serialize user for session (not used in JWT strategy, but required by passport)
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session (not used in JWT strategy, but required by passport)
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id
      }
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
export default passport;