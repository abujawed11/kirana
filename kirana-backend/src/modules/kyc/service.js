import {
  getSellerKycStatus,
  createKycStatus,
  updateKycStatus,
  createKycSubmission,
  getKycSubmission,
  getKycSubmissionsByUser,
  updateKycSubmissionStatus,
  addKycDocument,
  getKycDocuments,
  addKycStatusHistory,
  getPendingKycSubmissions,
  getKycSubmissionWithDocuments,
  getKycStatsForAdmin
} from "./repository.js";
import { findUserById } from "../auth/repository.js";

// ===== KYC Status Services =====

export async function getSellerKycStatusService(userId) {
  try {
    let kycStatus = await getSellerKycStatus(userId);

    // Create status if it doesn't exist (fallback for existing users)
    if (!kycStatus) {
      await createKycStatus(userId, 'unsubmitted');
      kycStatus = await getSellerKycStatus(userId);
    }

    return {
      success: true,
      data: {
        userId: kycStatus.user_id,
        status: kycStatus.status,
        submissionId: kycStatus.current_submission_id,
        verifiedAt: kycStatus.verified_at,
        verifiedBy: kycStatus.verified_by,
        rejectionReason: kycStatus.rejection_reason,
        lastUpdated: kycStatus.updated_at,
        // Include submission details if available
        legalName: kycStatus.legal_name,
        governmentIdType: kycStatus.government_id_type,
        businessType: kycStatus.business_type,
        submissionDate: kycStatus.submission_date
      }
    };
  } catch (error) {
    console.error("Get KYC status error:", error);
    return {
      success: false,
      error: "Failed to fetch KYC status"
    };
  }
}

// ===== KYC Submission Services =====

export async function submitKycApplication(userId, kycData) {
  try {
    // Validate required fields
    const requiredFields = [
      'legalName', 'governmentId', 'governmentIdType',
      'addressLine1', 'city', 'state', 'pincode', 'businessType'
    ];

    for (const field of requiredFields) {
      if (!kycData[field] || kycData[field].toString().trim() === '') {
        return {
          success: false,
          status: 400,
          error: `${field} is required`
        };
      }
    }

    // Validate government ID type
    const validIdTypes = ['aadhaar', 'pan', 'voter_id', 'driving_license', 'passport'];
    if (!validIdTypes.includes(kycData.governmentIdType)) {
      return {
        success: false,
        status: 400,
        error: "Invalid government ID type"
      };
    }

    // Validate business type
    const validBusinessTypes = ['individual', 'partnership', 'private_limited', 'public_limited', 'llp'];
    if (!validBusinessTypes.includes(kycData.businessType)) {
      return {
        success: false,
        status: 400,
        error: "Invalid business type"
      };
    }

    // Get current KYC status
    const currentStatus = await getSellerKycStatus(userId);

    // Don't allow new submissions if already verified
    if (currentStatus && currentStatus.status === 'verified') {
      return {
        success: false,
        status: 400,
        error: "KYC is already verified. Contact admin for changes."
      };
    }

    // Create submission
    const submissionData = {
      userId,
      legalName: kycData.legalName.trim(),
      governmentId: kycData.governmentId.trim(),
      governmentIdType: kycData.governmentIdType,
      taxId: kycData.taxId ? kycData.taxId.trim() : null,
      addressLine1: kycData.addressLine1.trim(),
      addressLine2: kycData.addressLine2 ? kycData.addressLine2.trim() : null,
      city: kycData.city.trim(),
      state: kycData.state.trim(),
      pincode: kycData.pincode.trim(),
      country: kycData.country || 'India',
      businessType: kycData.businessType,
      businessName: kycData.businessName ? kycData.businessName.trim() : null
    };

    const submissionId = await createKycSubmission(submissionData);

    // Process documents if provided
    if (kycData.documents && Array.isArray(kycData.documents)) {
      for (const doc of kycData.documents) {
        if (doc.documentType && doc.documentUrl) {
          await addKycDocument({
            submissionId,
            userId,
            documentType: doc.documentType,
            documentName: doc.documentName || 'Uploaded document',
            documentUrl: doc.documentUrl,
            fileSizeBytes: doc.fileSizeBytes || null,
            mimeType: doc.mimeType || null
          });
        }
      }
    }

    // Update seller KYC status
    const previousStatus = currentStatus ? currentStatus.status : 'unsubmitted';
    await updateKycStatus(userId, 'pending', submissionId);

    // Add status history
    await addKycStatusHistory(userId, submissionId, previousStatus, 'pending', userId, 'KYC application submitted');

    console.log(`KYC submission created for user ${userId}, submission ${submissionId}`);

    return {
      success: true,
      data: {
        submissionId,
        status: 'pending',
        message: "KYC application submitted successfully. It will be reviewed within 2-3 business days."
      }
    };

  } catch (error) {
    console.error("KYC submission error:", error);
    return {
      success: false,
      status: 500,
      error: "Failed to submit KYC application"
    };
  }
}

export async function getKycSubmissionHistory(userId, limit = 10) {
  try {
    const submissions = await getKycSubmissionsByUser(userId, limit);

    const submissionsWithDocuments = await Promise.all(
      submissions.map(async (submission) => {
        const documents = await getKycDocuments(submission.submission_id);
        return {
          ...submission,
          documents
        };
      })
    );

    return {
      success: true,
      data: submissionsWithDocuments
    };
  } catch (error) {
    console.error("Get KYC submission history error:", error);
    return {
      success: false,
      error: "Failed to fetch submission history"
    };
  }
}

// ===== Admin Services =====

export async function reviewKycSubmission(adminUserId, submissionId, action, rejectionReason = null, adminNotes = null) {
  try {
    // Validate action
    if (!['approve', 'reject'].includes(action)) {
      return {
        success: false,
        status: 400,
        error: "Invalid action. Must be 'approve' or 'reject'"
      };
    }

    // Get submission details
    const submission = await getKycSubmission(submissionId);
    if (!submission) {
      return {
        success: false,
        status: 404,
        error: "Submission not found"
      };
    }

    // Don't allow review of already reviewed submissions
    if (submission.status !== 'pending') {
      return {
        success: false,
        status: 400,
        error: `Submission already ${submission.status}`
      };
    }

    // Validate rejection reason for rejections
    if (action === 'reject' && (!rejectionReason || rejectionReason.trim() === '')) {
      return {
        success: false,
        status: 400,
        error: "Rejection reason is required when rejecting"
      };
    }

    const newStatus = action === 'approve' ? 'verified' : 'rejected';

    // Update submission status
    await updateKycSubmissionStatus(
      submissionId,
      newStatus,
      adminUserId,
      action === 'reject' ? rejectionReason : null,
      adminNotes
    );

    // Update seller KYC status
    await updateKycStatus(
      submission.user_id,
      newStatus,
      submissionId,
      action === 'approve' ? adminUserId : null,
      action === 'reject' ? rejectionReason : null
    );

    // Add status history
    await addKycStatusHistory(
      submission.user_id,
      submissionId,
      'pending',
      newStatus,
      adminUserId,
      action === 'reject' ? rejectionReason : 'KYC application approved',
      adminNotes
    );

    console.log(`KYC submission ${submissionId} ${action}d by admin ${adminUserId}`);

    return {
      success: true,
      data: {
        submissionId,
        status: newStatus,
        message: `KYC application ${action}d successfully`
      }
    };

  } catch (error) {
    console.error("KYC review error:", error);
    return {
      success: false,
      status: 500,
      error: "Failed to review KYC application"
    };
  }
}

export async function getPendingKycSubmissionsService(page = 1, limit = 20) {
  try {
    const offset = (page - 1) * limit;
    const submissions = await getPendingKycSubmissions(limit, offset);

    // Get documents for each submission
    const submissionsWithDocuments = await Promise.all(
      submissions.map(async (submission) => {
        const documents = await getKycDocuments(submission.submission_id);
        return {
          ...submission,
          documents
        };
      })
    );

    return {
      success: true,
      data: {
        submissions: submissionsWithDocuments,
        pagination: {
          page,
          limit,
          total: submissions.length // This is approximate, ideally we'd get total count
        }
      }
    };

  } catch (error) {
    console.error("Get pending KYC submissions error:", error);
    return {
      success: false,
      error: "Failed to fetch pending submissions"
    };
  }
}

export async function getKycSubmissionDetailsService(submissionId) {
  try {
    const submission = await getKycSubmissionWithDocuments(submissionId);

    if (!submission) {
      return {
        success: false,
        status: 404,
        error: "Submission not found"
      };
    }

    // Get user details
    const user = await findUserById(submission.user_id);

    return {
      success: true,
      data: {
        ...submission,
        seller: {
          userId: user.user_id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          createdAt: user.created_at
        }
      }
    };

  } catch (error) {
    console.error("Get KYC submission details error:", error);
    return {
      success: false,
      error: "Failed to fetch submission details"
    };
  }
}

export async function getKycDashboardStatsService() {
  try {
    const stats = await getKycStatsForAdmin();

    return {
      success: true,
      data: {
        ...stats,
        total: Object.values(stats).reduce((sum, count) => sum + count, 0)
      }
    };

  } catch (error) {
    console.error("Get KYC dashboard stats error:", error);
    return {
      success: false,
      error: "Failed to fetch KYC statistics"
    };
  }
}

// ===== Utility Services =====

export async function isKycVerified(userId) {
  try {
    const kycStatus = await getSellerKycStatus(userId);
    return kycStatus && kycStatus.status === 'verified';
  } catch (error) {
    console.error("Check KYC verification error:", error);
    return false;
  }
}

export async function getKycBlockingReason(userId) {
  try {
    const kycStatus = await getSellerKycStatus(userId);

    if (!kycStatus) {
      return "KYC status not found. Please contact support.";
    }

    switch (kycStatus.status) {
      case 'unsubmitted':
        return "Please complete your KYC verification to access seller features.";
      case 'pending':
        return "Your KYC application is under review. Please wait for approval.";
      case 'rejected':
        return `Your KYC application was rejected. ${kycStatus.rejection_reason || 'Please submit a new application.'}`;
      case 'verified':
        return null; // No blocking
      default:
        return "Unknown KYC status. Please contact support.";
    }
  } catch (error) {
    console.error("Get KYC blocking reason error:", error);
    return "Unable to verify KYC status. Please contact support.";
  }
}