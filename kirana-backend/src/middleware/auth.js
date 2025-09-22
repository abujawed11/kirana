import jwt from "jsonwebtoken";
import { findUserById } from "../modules/auth/repository.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

// Token blacklist (in production, use Redis or database)
const tokenBlacklist = new Set();

export function blacklistToken(token) {
  tokenBlacklist.add(token);
}

export function isTokenBlacklisted(token) {
  return tokenBlacklist.has(token);
}

export async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    // Check if token is blacklisted
    if (isTokenBlacklisted(token)) {
      return res.status(401).json({
        success: false,
        error: 'Token has been revoked'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Additional security: verify user still exists and is active
    const user = await findUserById(decoded.sub);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        error: 'Account is inactive'
      });
    }

    // Attach user info to request
    req.user = {
      user_id: decoded.sub,
      role: decoded.role,
      token: token
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    } else {
      console.error('Auth middleware error:', error);
      return res.status(500).json({
        success: false,
        error: 'Authentication error'
      });
    }
  }
}

// Middleware for seller-only routes
export async function requireSeller(req, res, next) {
  if (req.user?.role !== 'seller') {
    return res.status(403).json({
      success: false,
      error: 'Seller access required'
    });
  }
  next();
}

// Middleware for admin-only routes
export async function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }
  next();
}

// Optional auth middleware (doesn't fail if no token)
export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token && !isTokenBlacklisted(token)) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await findUserById(decoded.sub);

      if (user && user.is_active) {
        req.user = {
          user_id: decoded.sub,
          role: decoded.role,
          token: token
        };
      }
    }
  } catch (error) {
    // Ignore auth errors for optional auth
    console.log('Optional auth failed:', error.message);
  }

  next();
}