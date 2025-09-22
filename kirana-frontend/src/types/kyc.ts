// src/types/kyc.ts

export type KycStatus = 'unsubmitted' | 'pending' | 'verified' | 'rejected';

export type GovernmentIdType = 'aadhaar' | 'pan' | 'voter_id' | 'driving_license' | 'passport';

export type BusinessType = 'individual' | 'partnership' | 'private_limited' | 'public_limited' | 'llp';

export type DocumentType =
  | 'government_id_front'
  | 'government_id_back'
  | 'address_proof'
  | 'business_registration'
  | 'tax_certificate'
  | 'bank_statement'
  | 'other';

export interface KycDocument {
  documentType: DocumentType;
  documentName: string;
  documentUrl: string;
  fileSizeBytes?: number;
  mimeType?: string;
}

export interface KycStatusData {
  userId: string;
  status: KycStatus;
  submissionId?: number;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  lastUpdated: string;
  legalName?: string;
  governmentIdType?: GovernmentIdType;
  businessType?: BusinessType;
  submissionDate?: string;
}

export interface KycSubmissionData {
  legalName: string;
  governmentId: string;
  governmentIdType: GovernmentIdType;
  taxId?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  businessType: BusinessType;
  businessName?: string;
  documents?: KycDocument[];
}

export interface KycSubmissionHistory {
  submissionId: number;
  userId: string;
  legalName: string;
  governmentIdType: GovernmentIdType;
  businessType: BusinessType;
  status: 'pending' | 'verified' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  documents: KycDocument[];
}

export interface KycApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
  action?: string;
}