import { Request, Response, NextFunction } from "express";
import { storage } from "./storage";

// Extend Express Request to include user and registrationRole
declare module "express-serve-static-core" {
  interface Request {
    user?: {
      id: string;
      role: 'learner' | 'instructor' | 'admin';
      // add other fields you actually use on user
    };
    registrationRole?: 'learner' | 'instructor';
  }
}

// Enhanced role validation middleware
export const requireRole = (requiredRole: 'learner' | 'instructor' | 'admin') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Debug logs (added at top)
      console.log('[AUTH] Request path:', req.path);
      console.log('[AUTH] Cookies header:', req.headers.cookie || 'NO COOKIES SENT');
      console.log('[AUTH] Session exists?', !!req.session);
      console.log('[AUTH] Session user:', req.session?.user ? JSON.stringify(req.session.user) : 'NO USER');

      // Check session-based authentication
      if (!req.session || !req.session.user) {
        console.log('[AUTH] Rejected — no session or no user');
        return res.status(401).json({ 
          message: "Authentication required",
          redirect: "/auth/login"
        });
      }

      const user = req.session.user;
      
      if (!user || !user.id) {
        return res.status(401).json({ 
          message: "User not found in session",
          redirect: "/auth/login"
        });
      }

      // Check if user has the required role
      if (user.role !== requiredRole && !(requiredRole === 'instructor' && user.role === 'admin')) {
        console.log(`Access denied: User ${user.id} (${user.role}) tried to access ${requiredRole} resource`);
        
        return res.status(403).json({ 
          message: `Access denied. ${requiredRole} privileges required.`,
          userRole: user.role,
          requiredRole,
          redirect: user.role === 'learner' ? '/dashboard' : '/instructor'
        });
      }

      // Attach user to request for route handlers
      req.user = user;
      next();
    } catch (error) {
      console.error('Role validation error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
};

// Middleware to prevent role escalation
export const preventRoleEscalation = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user is logged in
    if (!req.session?.user) {
      return next();
    }

    const user = req.session.user;
    
    // Block if user tries to change role via request body
    if (req.body?.role && req.body.role !== user.role) {
      console.log(`Role escalation attempt blocked: User ${user.id} tried to change role from ${user.role} to ${req.body.role}`);
      
      return res.status(403).json({
        message: "Role modification not allowed",
        currentRole: user.role
      });
    }

    next();
  } catch (error) {
    console.error('Role escalation prevention error:', error);
    next();
  }
};

// Role-specific middlewares
export const requireInstructor = requireRole('instructor');
export const requireAdmin = requireRole('admin');
export const requireLearner = requireRole('learner');

// Middleware to ensure proper role assignment during registration
export const validateRegistrationRole = (req: Request, res: Response, next: NextFunction) => {
  const requestedRole = req.query.role || req.body.role;
  
  // Only allow 'learner' or 'instructor' during registration
  if (requestedRole && !['learner', 'instructor'].includes(requestedRole as string)) {
    return res.status(400).json({
      message: "Invalid role specified. Only 'learner' and 'instructor' roles are allowed during registration."
    });
  }
  
  // Default to learner if no role specified
  req.registrationRole = (requestedRole || 'learner') as 'learner' | 'instructor';
  next();
};