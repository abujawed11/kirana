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

// Apply authentication to all KYC routes
router.use(authenticateToken);

// Custom rate limiter for KYC operations
const kycLimiter = createCustomLimiter({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // 20 requests per 10 minutes per user
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

export default router;