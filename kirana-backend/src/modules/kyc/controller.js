import {
  getSellerKycStatusService,
  submitKycApplication,
  getKycSubmissionHistory,
  reviewKycSubmission,
  getPendingKycSubmissionsService,
  getKycSubmissionDetailsService,
  getKycDashboardStatsService
} from "./service.js";

// ===== Seller KYC Controllers =====

export async function getKycStatus(req, res) {
  try {
    const { user_id: userId } = req.user;

    const result = await getSellerKycStatusService(userId);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }

    return res.status(200).json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error("Get KYC status controller error:", error);
    return res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
}

export async function submitKyc(req, res) {
  try {
    const { user_id: userId } = req.user;
    const kycData = req.body;

    // Basic request validation
    if (!kycData || typeof kycData !== 'object') {
      return res.status(400).json({
        success: false,
        error: "Invalid KYC data provided"
      });
    }

    const result = await submitKycApplication(userId, kycData);

    if (!result.success) {
      return res.status(result.status || 400).json({
        success: false,
        error: result.error
      });
    }

    return res.status(201).json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error("Submit KYC controller error:", error);
    return res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
}

export async function getSubmissionHistory(req, res) {
  try {
    const { user_id: userId } = req.user;
    const limit = parseInt(req.query.limit) || 10;

    if (limit > 50) {
      return res.status(400).json({
        success: false,
        error: "Limit cannot exceed 50"
      });
    }

    const result = await getKycSubmissionHistory(userId, limit);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }

    return res.status(200).json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error("Get submission history controller error:", error);
    return res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
}

// ===== Admin KYC Controllers =====

export async function getPendingSubmissions(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        error: "Invalid pagination parameters"
      });
    }

    const result = await getPendingKycSubmissionsService(page, limit);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }

    return res.status(200).json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error("Get pending submissions controller error:", error);
    return res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
}

export async function getSubmissionDetails(req, res) {
  try {
    const { submissionId } = req.params;

    if (!submissionId || isNaN(parseInt(submissionId))) {
      return res.status(400).json({
        success: false,
        error: "Invalid submission ID"
      });
    }

    const result = await getKycSubmissionDetailsService(parseInt(submissionId));

    if (!result.success) {
      return res.status(result.status || 500).json({
        success: false,
        error: result.error
      });
    }

    return res.status(200).json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error("Get submission details controller error:", error);
    return res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
}

export async function reviewSubmission(req, res) {
  try {
    const { submissionId } = req.params;
    const { action, rejectionReason, adminNotes } = req.body;
    const { user_id: adminUserId } = req.user;

    // Validation
    if (!submissionId || isNaN(parseInt(submissionId))) {
      return res.status(400).json({
        success: false,
        error: "Invalid submission ID"
      });
    }

    if (!action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: "Action must be 'approve' or 'reject'"
      });
    }

    if (action === 'reject' && (!rejectionReason || rejectionReason.trim() === '')) {
      return res.status(400).json({
        success: false,
        error: "Rejection reason is required when rejecting"
      });
    }

    const result = await reviewKycSubmission(
      adminUserId,
      parseInt(submissionId),
      action,
      rejectionReason,
      adminNotes
    );

    if (!result.success) {
      return res.status(result.status || 500).json({
        success: false,
        error: result.error
      });
    }

    return res.status(200).json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error("Review submission controller error:", error);
    return res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
}

export async function getKycDashboardStats(req, res) {
  try {
    const result = await getKycDashboardStatsService();

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }

    return res.status(200).json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error("Get KYC dashboard stats controller error:", error);
    return res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
}

// ===== Utility Controllers =====

export async function uploadDocument(req, res) {
  try {
    // For now, this is a placeholder for document upload
    // In the future, this would handle file uploads to cloud storage
    // and return secure URLs

    const { documentType, fileName } = req.body;

    if (!documentType || !fileName) {
      return res.status(400).json({
        success: false,
        error: "Document type and file name are required"
      });
    }

    // Placeholder: return a mock URL
    // In production, this would:
    // 1. Validate file type and size
    // 2. Generate secure upload URL (presigned S3 URL, etc.)
    // 3. Return upload URL and final storage URL

    const mockUrl = `https://storage.example.com/kyc-documents/${Date.now()}-${fileName}`;

    return res.status(200).json({
      success: true,
      data: {
        uploadUrl: mockUrl, // Where to upload the file
        documentUrl: mockUrl, // Final URL to store in database
        expiresIn: 3600 // Upload URL expiry in seconds
      }
    });

  } catch (error) {
    console.error("Upload document controller error:", error);
    return res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
}