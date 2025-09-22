import { Router } from "express";
import { authenticateToken, requireSeller } from "../../middleware/auth.js";
import { requireKycVerified, addKycStatus } from "../../middleware/kycGate.js";
import { createCustomLimiter } from "../../middleware/rateLimit.js";

const router = Router();

// Apply auth middleware to all seller routes
router.use(authenticateToken);
router.use(requireSeller);

// Apply KYC verification to product/inventory routes
// Dashboard and profile routes have optional KYC status for display
router.use("/profile", addKycStatus);
router.use("/dashboard", addKycStatus);

// Block access to business operations unless KYC verified
router.use("/products", requireKycVerified);
router.use("/inventory", requireKycVerified);
router.use("/orders", requireKycVerified);
router.use("/analytics", requireKycVerified);

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
    // Return seller profile data with KYC status
    const { user_id } = req.user;
    const kycStatus = req.kycStatus || { isVerified: false };

    // In a real app, you'd fetch detailed profile from database
    res.json({
      success: true,
      data: {
        user_id,
        kycVerified: kycStatus.isVerified,
        kycWarning: req.kycWarning || null,
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

// Seller dashboard stats (includes KYC status for display)
router.get("/dashboard/stats", async (req, res) => {
  try {
    const { user_id } = req.user;
    const kycStatus = req.kycStatus || { isVerified: false };

    // Mock dashboard stats
    res.json({
      success: true,
      data: {
        totalOrders: kycStatus.isVerified ? 150 : 0,
        totalRevenue: kycStatus.isVerified ? 45000 : 0,
        pendingOrders: kycStatus.isVerified ? 12 : 0,
        productsListed: kycStatus.isVerified ? 45 : 0,
        kycVerified: kycStatus.isVerified,
        kycWarning: req.kycWarning || null,
        user_id
      }
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// Add placeholder routes for KYC-protected operations
router.get("/products", async (req, res) => {
  res.json({
    success: true,
    data: {
      products: [],
      message: "Products endpoint - requires KYC verification"
    }
  });
});

router.get("/inventory", async (req, res) => {
  res.json({
    success: true,
    data: {
      inventory: [],
      message: "Inventory endpoint - requires KYC verification"
    }
  });
});

router.get("/orders", async (req, res) => {
  res.json({
    success: true,
    data: {
      orders: [],
      message: "Orders endpoint - requires KYC verification"
    }
  });
});

export default router;