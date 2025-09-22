import { isKycVerified, getKycBlockingReason } from "../modules/kyc/service.js";

/**
 * KYC Gate Middleware
 * Blocks seller access to product/inventory features unless KYC is verified
 */
export async function requireKycVerified(req, res, next) {
  try {
    const { user_id: userId, role } = req.user;

    // Only apply KYC gate to sellers
    if (role !== 'seller') {
      return next();
    }

    // Check if KYC is verified
    const isVerified = await isKycVerified(userId);

    if (!isVerified) {
      // Get specific blocking reason
      const blockingReason = await getKycBlockingReason(userId);

      return res.status(403).json({
        success: false,
        error: "KYC verification required",
        message: blockingReason,
        code: "KYC_VERIFICATION_REQUIRED",
        action: "redirect_to_kyc"
      });
    }

    // KYC is verified, proceed
    next();

  } catch (error) {
    console.error("KYC gate middleware error:", error);
    return res.status(500).json({
      success: false,
      error: "Unable to verify KYC status",
      code: "KYC_VERIFICATION_ERROR"
    });
  }
}

/**
 * Optional KYC Check Middleware
 * Adds KYC status to request object without blocking
 */
export async function addKycStatus(req, res, next) {
  try {
    const { user_id: userId, role } = req.user;

    if (role === 'seller') {
      const isVerified = await isKycVerified(userId);
      req.kycStatus = {
        isVerified,
        userId
      };
    }

    next();

  } catch (error) {
    console.error("Add KYC status middleware error:", error);
    // Don't block request, just log error
    req.kycStatus = {
      isVerified: false,
      error: true
    };
    next();
  }
}

/**
 * Flexible KYC Gate
 * Can be configured to block specific actions or just warn
 */
export function createKycGate(options = {}) {
  const {
    blockAccess = true,
    allowedPaths = [],
    customMessage = null
  } = options;

  return async (req, res, next) => {
    try {
      const { user_id: userId, role } = req.user;

      // Only apply to sellers
      if (role !== 'seller') {
        return next();
      }

      // Check if current path is allowed without KYC
      const currentPath = req.path;
      if (allowedPaths.some(path => currentPath.includes(path))) {
        return next();
      }

      // Check KYC status
      const isVerified = await isKycVerified(userId);

      if (!isVerified) {
        if (blockAccess) {
          const blockingReason = customMessage || await getKycBlockingReason(userId);

          return res.status(403).json({
            success: false,
            error: "KYC verification required",
            message: blockingReason,
            code: "KYC_VERIFICATION_REQUIRED",
            action: "redirect_to_kyc",
            path: currentPath
          });
        } else {
          // Just add warning to response
          req.kycWarning = await getKycBlockingReason(userId);
        }
      }

      next();

    } catch (error) {
      console.error("KYC gate middleware error:", error);

      if (blockAccess) {
        return res.status(500).json({
          success: false,
          error: "Unable to verify KYC status",
          code: "KYC_VERIFICATION_ERROR"
        });
      }

      // If not blocking, continue with warning
      req.kycWarning = "Unable to verify KYC status";
      next();
    }
  };
}