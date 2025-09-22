-- Migration 003: KYC System Tables
-- Description: Creates tables for seller KYC status, submissions, and documents
-- Date: 2025-09-22

-- KYC Status enum values: unsubmitted, pending, verified, rejected

-- 1. Seller KYC Status Table (current status per seller)
CREATE TABLE seller_kyc_status (
    user_id VARCHAR(20) PRIMARY KEY,
    status ENUM('unsubmitted', 'pending', 'verified', 'rejected') NOT NULL DEFAULT 'unsubmitted',
    current_submission_id INT NULL,
    verified_at TIMESTAMP NULL,
    verified_by VARCHAR(20) NULL,
    rejection_reason TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (current_submission_id) REFERENCES kyc_submissions(submission_id) ON DELETE SET NULL
);

-- 2. KYC Submissions Table (audit trail of all submissions)
CREATE TABLE kyc_submissions (
    submission_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(20) NOT NULL,

    -- Business Identity Fields
    legal_name VARCHAR(255) NOT NULL,
    government_id VARCHAR(50) NOT NULL,
    government_id_type ENUM('aadhaar', 'pan', 'voter_id', 'driving_license', 'passport') NOT NULL,
    tax_id VARCHAR(50) NULL,

    -- Address Fields
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255) NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'India',

    -- Business Information
    business_type ENUM('individual', 'partnership', 'private_limited', 'public_limited', 'llp') NOT NULL DEFAULT 'individual',
    business_name VARCHAR(255) NULL,

    -- Status and Review
    status ENUM('pending', 'verified', 'rejected') NOT NULL DEFAULT 'pending',
    reviewed_by VARCHAR(20) NULL,
    reviewed_at TIMESTAMP NULL,
    rejection_reason TEXT NULL,
    admin_notes TEXT NULL,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(user_id) ON DELETE SET NULL,

    INDEX idx_user_submissions (user_id, created_at),
    INDEX idx_status_review (status, created_at)
);

-- 3. KYC Documents Table (flexible document storage)
CREATE TABLE kyc_documents (
    document_id INT AUTO_INCREMENT PRIMARY KEY,
    submission_id INT NOT NULL,
    user_id VARCHAR(20) NOT NULL,

    -- Document Details
    document_type ENUM('government_id_front', 'government_id_back', 'address_proof', 'business_registration', 'tax_certificate', 'bank_statement', 'other') NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    document_url TEXT NOT NULL,
    file_size_bytes INT NULL,
    mime_type VARCHAR(100) NULL,

    -- Verification
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by VARCHAR(20) NULL,
    verified_at TIMESTAMP NULL,
    verification_notes TEXT NULL,

    -- Timestamps
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (submission_id) REFERENCES kyc_submissions(submission_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(user_id) ON DELETE SET NULL,

    INDEX idx_submission_docs (submission_id),
    INDEX idx_user_docs (user_id),
    INDEX idx_document_type (document_type)
);

-- 4. KYC Status History Table (audit trail for status changes)
CREATE TABLE kyc_status_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(20) NOT NULL,
    submission_id INT NULL,

    -- Status Change
    from_status ENUM('unsubmitted', 'pending', 'verified', 'rejected') NULL,
    to_status ENUM('unsubmitted', 'pending', 'verified', 'rejected') NOT NULL,

    -- Review Details
    changed_by VARCHAR(20) NULL,
    reason TEXT NULL,
    admin_notes TEXT NULL,

    -- Timestamp
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (submission_id) REFERENCES kyc_submissions(submission_id) ON DELETE SET NULL,
    FOREIGN KEY (changed_by) REFERENCES users(user_id) ON DELETE SET NULL,

    INDEX idx_user_history (user_id, changed_at),
    INDEX idx_status_changes (to_status, changed_at)
);

-- 5. Initialize KYC status for existing sellers
INSERT INTO seller_kyc_status (user_id, status)
SELECT user_id, 'unsubmitted'
FROM users
WHERE role = 'seller'
ON DUPLICATE KEY UPDATE status = status; -- Don't override existing status

-- 6. Create trigger to auto-create KYC status for new sellers
DELIMITER //
CREATE TRIGGER create_kyc_status_for_new_seller
    AFTER INSERT ON users
    FOR EACH ROW
BEGIN
    IF NEW.role = 'seller' THEN
        INSERT INTO seller_kyc_status (user_id, status)
        VALUES (NEW.user_id, 'unsubmitted');
    END IF;
END//
DELIMITER ;

-- 7. Create indexes for performance
CREATE INDEX idx_kyc_status_lookup ON seller_kyc_status(user_id, status);
CREATE INDEX idx_pending_submissions ON kyc_submissions(status, created_at) WHERE status = 'pending';

-- Migration completed successfully