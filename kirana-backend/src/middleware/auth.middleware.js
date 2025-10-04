// src/middleware/auth.middleware.js
import { verifyToken } from "../utils/jwt.js";

export function requireAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return res.status(401).json({ success: false, message: "No token" });
  try {
    req.user = verifyToken(token); // { uid, role }
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
}

export function sellerOnly(req, res, next) {
  if (req.user?.role !== "SELLER") {
    return res.status(403).json({ success: false, message: "Sellers only" });
  }
  next();
}
