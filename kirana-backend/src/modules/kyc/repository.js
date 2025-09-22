import { query } from "../../db/connection.js";

// ===== KYC Status Management =====

export async function getSellerKycStatus(userId) {
  const rows = await query(
    `SELECT
       sks.user_id,
       sks.status,
       sks.current_submission_id,
       sks.verified_at,
       sks.verified_by,
       sks.rejection_reason,
       sks.updated_at,
       ks.legal_name,
       ks.government_id_type,
       ks.business_type,
       ks.created_at as submission_date
     FROM seller_kyc_status sks
     LEFT JOIN kyc_submissions ks ON sks.current_submission_id = ks.submission_id
     WHERE sks.user_id = ?`,
    [userId]
  );
  return rows[0];
}

export async function createKycStatus(userId, status = 'unsubmitted') {
  await query(
    "INSERT INTO seller_kyc_status (user_id, status) VALUES (?, ?)",
    [userId, status]
  );
}

export async function updateKycStatus(userId, status, submissionId = null, verifiedBy = null, rejectionReason = null) {
  const updates = [];
  const values = [];

  updates.push("status = ?");
  values.push(status);

  if (submissionId !== null) {
    updates.push("current_submission_id = ?");
    values.push(submissionId);
  }

  if (verifiedBy !== null) {
    updates.push("verified_by = ?");
    values.push(verifiedBy);
  }

  if (status === 'verified') {
    updates.push("verified_at = NOW()");
  }

  if (rejectionReason !== null) {
    updates.push("rejection_reason = ?");
    values.push(rejectionReason);
  }

  values.push(userId);

  await query(
    `UPDATE seller_kyc_status SET ${updates.join(", ")} WHERE user_id = ?`,
    values
  );
}

// ===== KYC Submissions =====

export async function createKycSubmission(submissionData) {
  const {
    userId,
    legalName,
    governmentId,
    governmentIdType,
    taxId,
    addressLine1,
    addressLine2,
    city,
    state,
    pincode,
    country,
    businessType,
    businessName
  } = submissionData;

  const result = await query(
    `INSERT INTO kyc_submissions
     (user_id, legal_name, government_id, government_id_type, tax_id,
      address_line1, address_line2, city, state, pincode, country,
      business_type, business_name, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [
      userId, legalName, governmentId, governmentIdType, taxId,
      addressLine1, addressLine2, city, state, pincode, country,
      businessType, businessName
    ]
  );

  return result.insertId;
}

export async function getKycSubmission(submissionId) {
  const rows = await query(
    `SELECT * FROM kyc_submissions WHERE submission_id = ?`,
    [submissionId]
  );
  return rows[0];
}

export async function getKycSubmissionsByUser(userId, limit = 10) {
  const rows = await query(
    `SELECT * FROM kyc_submissions
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT ?`,
    [userId, limit]
  );
  return rows;
}

export async function updateKycSubmissionStatus(submissionId, status, reviewedBy = null, rejectionReason = null, adminNotes = null) {
  const updates = [];
  const values = [];

  updates.push("status = ?");
  values.push(status);

  if (reviewedBy !== null) {
    updates.push("reviewed_by = ?", "reviewed_at = NOW()");
    values.push(reviewedBy);
  }

  if (rejectionReason !== null) {
    updates.push("rejection_reason = ?");
    values.push(rejectionReason);
  }

  if (adminNotes !== null) {
    updates.push("admin_notes = ?");
    values.push(adminNotes);
  }

  values.push(submissionId);

  await query(
    `UPDATE kyc_submissions SET ${updates.join(", ")} WHERE submission_id = ?`,
    values
  );
}

// ===== KYC Documents =====

export async function addKycDocument(documentData) {
  const {
    submissionId,
    userId,
    documentType,
    documentName,
    documentUrl,
    fileSizeBytes,
    mimeType
  } = documentData;

  const result = await query(
    `INSERT INTO kyc_documents
     (submission_id, user_id, document_type, document_name, document_url, file_size_bytes, mime_type)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [submissionId, userId, documentType, documentName, documentUrl, fileSizeBytes, mimeType]
  );

  return result.insertId;
}

export async function getKycDocuments(submissionId) {
  const rows = await query(
    `SELECT * FROM kyc_documents WHERE submission_id = ? ORDER BY uploaded_at`,
    [submissionId]
  );
  return rows;
}

export async function verifyKycDocument(documentId, verifiedBy, notes = null) {
  await query(
    `UPDATE kyc_documents
     SET is_verified = TRUE, verified_by = ?, verified_at = NOW(), verification_notes = ?
     WHERE document_id = ?`,
    [verifiedBy, notes, documentId]
  );
}

// ===== KYC Status History =====

export async function addKycStatusHistory(userId, submissionId, fromStatus, toStatus, changedBy, reason = null, adminNotes = null) {
  await query(
    `INSERT INTO kyc_status_history
     (user_id, submission_id, from_status, to_status, changed_by, reason, admin_notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, submissionId, fromStatus, toStatus, changedBy, reason, adminNotes]
  );
}

export async function getKycStatusHistory(userId, limit = 20) {
  const rows = await query(
    `SELECT ksh.*, u.name as changed_by_name
     FROM kyc_status_history ksh
     LEFT JOIN users u ON ksh.changed_by = u.user_id
     WHERE ksh.user_id = ?
     ORDER BY ksh.changed_at DESC
     LIMIT ?`,
    [userId, limit]
  );
  return rows;
}

// ===== Admin Queries =====

export async function getPendingKycSubmissions(limit = 50, offset = 0) {
  const rows = await query(
    `SELECT
       ks.submission_id,
       ks.user_id,
       ks.legal_name,
       ks.government_id_type,
       ks.business_type,
       ks.business_name,
       ks.created_at,
       u.name as seller_name,
       u.email as seller_email,
       u.phone as seller_phone
     FROM kyc_submissions ks
     JOIN users u ON ks.user_id = u.user_id
     WHERE ks.status = 'pending'
     ORDER BY ks.created_at ASC
     LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  return rows;
}

export async function getKycSubmissionWithDocuments(submissionId) {
  // Get submission details
  const submission = await getKycSubmission(submissionId);
  if (!submission) return null;

  // Get associated documents
  const documents = await getKycDocuments(submissionId);

  return {
    ...submission,
    documents
  };
}

// ===== Utility Functions =====

export async function getKycStatsForAdmin() {
  const rows = await query(`
    SELECT
      status,
      COUNT(*) as count
    FROM seller_kyc_status
    GROUP BY status
  `);

  const stats = {
    unsubmitted: 0,
    pending: 0,
    verified: 0,
    rejected: 0
  };

  rows.forEach(row => {
    stats[row.status] = row.count;
  });

  return stats;
}