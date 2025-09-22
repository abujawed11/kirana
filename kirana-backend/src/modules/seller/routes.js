import { Router } from "express";
import { authenticateToken, requireSeller } from "../../middleware/auth.js";
import { createCustomLimiter } from "../../middleware/rateLimit.js";

const router = Router();

// Apply auth middleware to all seller routes
router.use(authenticateToken);
router.use(requireSeller);

// Custom rate limiter for seller operations
const sellerLimiter = createCustomLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // 50 requests per 5 minutes per IP
  message: "Too many seller operations, please slow down"
});

router.use(sellerLimiter);

// Seller profile endpoints
router.get("/profile", async (req, res) => {
  try {
    // Return seller profile data
    const { user_id } = req.user;

    // In a real app, you'd fetch detailed profile from database
    res.json({
      success: true,
      data: {
        user_id,
        message: "Seller profile endpoint - protected route working!"
      }
    });
  } catch (error) {
    console.error("Get seller profile error:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

router.put("/profile", async (req, res) => {
  try {
    const { user_id } = req.user;
    const updateData = req.body;

    // In a real app, you'd update the seller profile in database
    res.json({
      success: true,
      data: {
        user_id,
        message: "Profile updated successfully",
        updated: updateData
      }
    });
  } catch (error) {
    console.error("Update seller profile error:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// Seller dashboard stats
router.get("/dashboard/stats", async (req, res) => {
  try {
    const { user_id } = req.user;

    // Mock dashboard stats
    res.json({
      success: true,
      data: {
        totalOrders: 150,
        totalRevenue: 45000,
        pendingOrders: 12,
        productsListed: 45,
        user_id
      }
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

export default router;