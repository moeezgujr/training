import type { Express, RequestHandler } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { env } from "@shared/env";

// Simple session setup without complex OIDC
export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  return session({
    secret: env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  });
}

// Simple authentication setup
export function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  
  // Import and setup Google OAuth (optional)
  import('./google-auth').then(({ setupGoogleAuth }) => {
    setupGoogleAuth(app);
  }).catch(error => {
    // Google OAuth setup failed - app will continue with email/password auth only
    console.info('INFO: Google OAuth setup skipped -', error.message);
  });
  
  // Authentication with password  
  // Registration endpoint
  app.post("/api/signup", async (req, res) => {
    const { firstName, lastName, email, password, role = 'learner' } = req.body;
    
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    try {
      const bcrypt = await import("bcrypt");
      const { storage } = await import("./storage/index");
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: "User with this email already exists" });
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create user with extended data
      const user = await storage.createExtendedUser({
        id: Math.random().toString(36).substring(2),
        email,
        firstName,
        lastName,
        passwordHash,
        role,
        profileImageUrl: null
      });

      // Send notification to admin about new registration
      try {
        const { notifyStudentRegistration } = await import('./notification-service');
        await notifyStudentRegistration(email, firstName);
      } catch (notificationError) {
        console.error('Failed to send registration notification:', notificationError);
      }

      res.status(201).json({ 
        message: "Account created successfully",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(500).json({ 
        message: error.message || "Failed to create account" 
      });
    }
  });

  app.post("/api/login", async (req, res) => {
    const { email, password, loginType } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    try {
      // Import bcrypt and storage here to avoid circular dependency
      const bcrypt = await import("bcrypt");
      const { storage } = await import("./storage/index");
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Debug logging
      console.log('Login attempt:', { email, hasPassword: !!user.passwordHash, userRole: user.role });
      
      // Check password
      if (!user.passwordHash) {
        console.log('No password hash found for user:', email);
        return res.status(401).json({ message: "Password not set for this account" });
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // For admin login, verify the role
      if (loginType === 'admin' && user.role !== 'admin') {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }

      // Set user in session
      (req.session as any).user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profileImageUrl: user.profileImageUrl
      };

      // Save the session explicitly and respond
      req.session.save((err: any) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ message: "Session could not be saved" });
        }
        
        res.json({ 
          message: "Login successful",
          user: (req.session as any).user
        });
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get("/api/login", (_req, res) => {
    res.json({ message: "Use POST /api/login with email and loginType" });
  });
  
  app.get("/api/logout", (req, res) => {
    req.session.destroy(() => {
      res.redirect("/login");
    });
  });
  
  app.get("/api/auth/user", (req, res) => {
    // For development, return a mock user or unauthorized
    if (req.session && (req.session as any).user) {
      res.json((req.session as any).user);
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  });
}

// Simple authentication middleware
export const isAuthenticated: RequestHandler = (req, res, next) => {
  // For development, allow all requests or check simple session
  console.log("isAuthenticated check - Session exists:", !!req.session, "User exists:", !!((req.session as any)?.user));
  if (req.session && (req.session as any).user) {
    console.log("User authenticated:", (req.session as any).user.email, "Role:", (req.session as any).user.role);
    next();
  } else {
    console.log("Authentication failed - No session or user");
    res.status(401).json({ message: "Unauthorized" });
  }
};