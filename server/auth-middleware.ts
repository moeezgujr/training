import { RequestHandler } from "express";
import { storage } from "./storage";

// Enhanced role validation middleware
export const requireRole = (requiredRole: string): RequestHandler => {
  return async (req, res, next) => {
    try {
      // Check session-based authentication
      if (!req.session || !(req.session as any).user) {
        return res.status(401).json({ 
          message: "Authentication required",
          redirect: "/auth/login"
        });
      }

      const user = (req.session as any).user;
      
      if (!user) {
        return res.status(401).json({ 
          message: "User not found",
          redirect: "/auth/login"
        });
      }

      // Check if user has the required role
      if (user.role !== requiredRole && !(requiredRole === 'instructor' && user.role === 'admin')) {
        console.log(`Access denied: User ${user.id} (${user.role}) tried to access ${requiredRole} resource`);
        
        return res.status(403).json({ 
          message: `Access denied. ${requiredRole} privileges required.`,
          userRole: user.role,
          requiredRole: requiredRole,
          redirect: user.role === 'learner' ? '/dashboard' : '/instructor'
        });
      }

      // Add user info to request for use in route handlers
      (req as any).user = user;
      next();
    } catch (error) {
      console.error('Role validation error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
};

// Middleware to prevent role escalation
export const preventRoleEscalation: RequestHandler = async (req, res, next) => {
  try {
    // Check session-based authentication
    if (!req.session || !(req.session as any).user) {
      return next();
    }

    const user = (req.session as any).user;
    
    // If user exists and tries to change role via request body
    if (user && req.body?.role && req.body.role !== user.role) {
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

// Check if user can access instructor features
export const requireInstructor = requireRole('instructor');

// Check if user can access admin features  
export const requireAdmin = requireRole('admin');

// Check if user is a learner (for learner-specific features)
export const requireLearner = requireRole('learner');

// Middleware to ensure proper role assignment during registration
export const validateRegistrationRole: RequestHandler = (req, res, next) => {
  const requestedRole = req.query.role || req.body.role;
  
  // Only allow 'learner' or 'instructor' during registration
  if (requestedRole && !['learner', 'instructor'].includes(requestedRole as string)) {
    return res.status(400).json({
      message: "Invalid role specified. Only 'learner' and 'instructor' roles are allowed during registration."
    });
  }
  
  // Default to learner if no role specified
  req.registrationRole = requestedRole || 'learner';
  next();
};