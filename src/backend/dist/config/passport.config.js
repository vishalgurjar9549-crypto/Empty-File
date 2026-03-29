"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const env_1 = require("./env");
const prisma_1 = require("../utils/prisma");
const logger_1 = require("../utils/logger");
const repositories_1 = require("../repositories");
const IdentityLinkingService_1 = require("../services/IdentityLinkingService");
const prisma = (0, prisma_1.getPrismaClient)();
const identityLinking = new IdentityLinkingService_1.IdentityLinkingService(repositories_1.userRepository);
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
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: env_1.env.GOOGLE_CLIENT_ID,
    clientSecret: env_1.env.GOOGLE_CLIENT_SECRET,
    callbackURL: env_1.env.GOOGLE_CALLBACK_URL,
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
            logger_1.logger.info('Linked Google ID to user', {
                userId: user.id,
                email,
                isNewAccount: false
            });
        }
        else {
            logger_1.logger.info('User already has Google ID linked', {
                userId: user.id,
                email
            });
        }
        // Return user (passport will attach to req.user)
        return done(null, user);
    }
    catch (error) {
        logger_1.logger.error('Google OAuth error', {
            error: error.message,
            stack: error.stack
        });
        return done(error, undefined);
    }
}));
// Serialize user for session (not used in JWT strategy, but required by passport)
passport_1.default.serializeUser((user, done) => {
    done(null, user.id);
});
// Deserialize user from session (not used in JWT strategy, but required by passport)
passport_1.default.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id
            }
        });
        done(null, user);
    }
    catch (error) {
        done(error, null);
    }
});
exports.default = passport_1.default;
//# sourceMappingURL=passport.config.js.map