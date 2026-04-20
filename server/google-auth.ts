import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import type { Express } from 'express';
import { storage } from './storage/index';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  // Google OAuth is optional - app will function without it using email/password auth
  console.info('INFO: Google OAuth disabled - GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not provided');
}

export function setupGoogleAuth(app: Express) {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return;
  }

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: `${BASE_URL}/auth/google/callback`
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      if (!email) {
        return done(new Error('No email found in Google profile'));
      }

      // Check if user exists
      let user = await storage.getUserByEmail(email);
      
      if (!user) {
        // Create new user from Google profile
        user = await storage.createExtendedUser({
          id: profile.id,
          email: email,
          firstName: profile.name?.givenName || '',
          lastName: profile.name?.familyName || '',
          profileImageUrl: profile.photos?.[0]?.value || '',
          role: 'learner'
        });
        
        // Send notification about new student registration
        try {
          const { notifyStudentRegistration } = await import('./notification-service');
          await notifyStudentRegistration(email, profile.name?.givenName || '');
        } catch (notificationError) {
          console.error('Failed to send registration notification:', notificationError);
        }
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Google OAuth routes
  app.get('/auth/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/auth/login?error=auth_failed' }),
    (req, res) => {
      // Successful authentication
      const user = req.user as any;
      if (user.role === 'admin') {
        res.redirect('/admin');
      } else if (user.role === 'instructor') {
        res.redirect('/instructor');
      } else {
        res.redirect('/dashboard');
      }
    }
  );
}