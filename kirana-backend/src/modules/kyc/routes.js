import { Router } from "express";
import {
  getKycStatus,
  submitKyc,
  getSubmissionHistory,
  getPendingSubmissions,
  getSubmissionDetails,
  reviewSubmission,
  getKycDashboardStats,
  uploadDocument
} from "./controller.js";
import { authenticateToken, requireSeller, requireAdmin } from "../../middleware/auth.js";
import { authLimiter, createCustomLimiter } from "../../middleware/rateLimit.js";

const router = Router();

// Add logging to KYC routes
router.use((req, res, next) => {
  console.log(`[KYC] ${req.method} ${req.path} - User: ${req.user?.user_id || 'No user'}`);
  next();
});

// Apply authentication to all KYC routes
router.use(authenticateToken);

// Custom rate limiter for KYC operations
const kycLimiter = createCustomLimiter({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 50, // 50 requests per 10 minutes per user
  message: "Too many KYC requests, please slow down"
});

// ===== Seller KYC Routes =====

// Get current KYC status
router.get("/status", requireSeller, kycLimiter, getKycStatus);

// Submit KYC application
router.post("/submit", requireSeller, authLimiter, submitKyc);

// Get submission history
router.get("/submissions", requireSeller, kycLimiter, getSubmissionHistory);

// Upload document (placeholder for future file upload)
router.post("/upload", requireSeller, authLimiter, uploadDocument);

// ===== Admin KYC Routes =====

// Get pending submissions for review
router.get("/admin/pending", requireAdmin, kycLimiter, getPendingSubmissions);

// Get specific submission details
router.get("/admin/submissions/:submissionId", requireAdmin, kycLimiter, getSubmissionDetails);

// Review submission (approve/reject)
router.post("/admin/submissions/:submissionId/review", requireAdmin, authLimiter, reviewSubmission);

// Get KYC dashboard statistics
router.get("/admin/stats", requireAdmin, kycLimiter, getKycDashboardStats);

// ===== TESTING ONLY - Remove in production =====
if (process.env.NODE_ENV === 'development') {
  // Quick test endpoint to auto-verify KYC
  router.post("/test/auto-verify", requireSeller, async (req, res) => {
    try {
      console.log("[KYC TEST] Auto-verify endpoint hit by user:", req.user?.user_id);
      const { user_id: userId } = req.user;

      // Direct database update for testing
      const db = await import('../../db/connection.js');

      await db.default.execute(`
        INSERT INTO seller_kyc_status (user_id, status, verified_at, verified_by, updated_at)
        VALUES (?, 'verified', NOW(), NULL, NOW())
        ON DUPLICATE KEY UPDATE
        status = 'verified',
        verified_at = NOW(),
        verified_by = NULL,
        updated_at = NOW()
      `, [userId]);

      console.log("[KYC TEST] Successfully auto-verified user:", userId);
      res.json({ success: true, message: "KYC auto-verified for testing" });
    } catch (error) {
      console.error("[KYC TEST] Auto-verify error:", error);
      res.status(500).json({ success: false, error: "Failed to auto-verify" });
    }
  });

  // Quick test endpoint to revert KYC status
  router.post("/test/revert", requireSeller, async (req, res) => {
    try {
      console.log("[KYC TEST] Revert endpoint hit by user:", req.user?.user_id);
      const { user_id: userId } = req.user;

      // Direct database update for testing
      const db = await import('../../db/connection.js');

      await db.default.execute(`
        UPDATE seller_kyc_status
        SET status = 'unsubmitted',
            verified_at = NULL,
            verified_by = NULL,
            updated_at = NOW()
        WHERE user_id = ?
      `, [userId]);

      console.log("[KYC TEST] Successfully reverted user:", userId);
      res.json({ success: true, message: "KYC status reverted to unsubmitted for testing" });
    } catch (error) {
      console.error("[KYC TEST] Revert error:", error);
      res.status(500).json({ success: false, error: "Failed to revert KYC status" });
    }
  });

  console.log("[KYC] Test auto-verify and revert endpoints registered in development mode");
}

export default router;