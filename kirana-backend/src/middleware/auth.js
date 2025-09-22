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
    console.log('[AUTH] Processing auth for:', req.method, req.path);
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log('[AUTH] Auth header:', authHeader ? 'Present' : 'Missing');
    console.log('[AUTH] Token:', token ? 'Present' : 'Missing');

    if (!token) {
      console.log('[AUTH] No token provided');
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    // Check if token is blacklisted
    if (isTokenBlacklisted(token)) {
      console.log('[AUTH] Token is blacklisted');
      return res.status(401).json({
        success: false,
        error: 'Token has been revoked'
      });
    }

    // Verify token
    console.log('[AUTH] Verifying token...');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('[AUTH] Decoded token:', decoded);

    // Additional security: verify user still exists and is active
    console.log('[AUTH] Looking up user:', decoded.sub);
    const user = await findUserById(decoded.sub);
    console.log('[AUTH] User found:', user ? 'Yes' : 'No');

    if (!user) {
      console.log('[AUTH] User not found in database');
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    if (!user.is_active) {
      console.log('[AUTH] User account is inactive');
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

    console.log('[AUTH] User authenticated successfully:', req.user);
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