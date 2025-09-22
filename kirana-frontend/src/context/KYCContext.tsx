// src/context/KYCContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { api } from "@/api/client";

export type KycStatus = 'unsubmitted' | 'pending' | 'verified' | 'rejected';

export interface KycStatusData {
  userId: string;
  status: KycStatus;
  submissionId?: number;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  lastUpdated: string;
  legalName?: string;
  governmentIdType?: string;
  businessType?: string;
  submissionDate?: string;
}

export interface KycDocument {
  documentType: 'government_id_front' | 'government_id_back' | 'address_proof' | 'business_registration' | 'tax_certificate' | 'bank_statement' | 'other';
  documentName: string;
  documentUrl: string;
  fileSizeBytes?: number;
  mimeType?: string;
}

export interface KycSubmissionData {
  legalName: string;
  governmentId: string;
  governmentIdType: 'aadhaar' | 'pan' | 'voter_id' | 'driving_license' | 'passport';
  taxId?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  businessType: 'individual' | 'partnership' | 'private_limited' | 'public_limited' | 'llp';
  businessName?: string;
  documents?: KycDocument[];
}

interface KycContextValue {
  kycStatus: KycStatusData | null;
  loading: boolean;
  error: string | null;
  isVerified: boolean;
  needsKyc: boolean;
  blockingReason: string | null;
  refreshKycStatus: () => Promise<void>;
  submitKyc: (data: KycSubmissionData) => Promise<{ success: boolean; error?: string; submissionId?: number }>;
  checkKycGate: () => Promise<boolean>;
}

const KycContext = createContext<KycContextValue | undefined>(undefined);

export function KycProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [kycStatus, setKycStatus] = useState<KycStatusData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch KYC status
  const refreshKycStatus = useCallback(async () => {
    if (!isAuthenticated || !user || user.role !== 'seller') {
      setKycStatus(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await api.get<{ success: boolean; data: KycStatusData }>('/kyc/status');

      if (response.success) {
        setKycStatus(response.data);
      } else {
        throw new Error('Failed to fetch KYC status');
      }
    } catch (err: any) {
      console.error('Error fetching KYC status:', err);
      setError(err.message || 'Failed to fetch KYC status');
      setKycStatus(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // Submit KYC application
  const submitKyc = useCallback(async (data: KycSubmissionData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post<{
        success: boolean;
        data?: { submissionId: number; status: string; message: string };
        error?: string;
      }>('/kyc/submit', data);

      if (response.success && response.data) {
        // Refresh status after successful submission
        await refreshKycStatus();

        return {
          success: true,
          submissionId: response.data.submissionId
        };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to submit KYC application'
        };
      }
    } catch (err: any) {
      console.error('Error submitting KYC:', err);
      setError(err.message || 'Failed to submit KYC application');

      return {
        success: false,
        error: err.message || 'Failed to submit KYC application'
      };
    } finally {
      setLoading(false);
    }
  }, [refreshKycStatus]);

  // Check if user can access KYC-gated features
  const checkKycGate = useCallback(async (): Promise<boolean> => {
    if (!isAuthenticated || !user || user.role !== 'seller') {
      return true; // Non-sellers are not gated
    }

    try {
      // Try to access a KYC-protected endpoint
      await api.get('/seller/products');
      return true;
    } catch (err: any) {
      if (err.status === 403 && err.data?.code === 'KYC_VERIFICATION_REQUIRED') {
        return false;
      }
      // Other errors don't indicate KYC blocking
      return true;
    }
  }, [isAuthenticated, user]);

  // Load KYC status when auth state changes
  useEffect(() => {
    if (isAuthenticated && user?.role === 'seller') {
      refreshKycStatus();
    } else {
      setKycStatus(null);
      setError(null);
    }
  }, [isAuthenticated, user, refreshKycStatus]);

  // Computed values
  const isVerified = kycStatus?.status === 'verified';
  const needsKyc = user?.role === 'seller' && !isVerified;

  const blockingReason = needsKyc ? (() => {
    switch (kycStatus?.status) {
      case 'unsubmitted':
        return 'Please complete your KYC verification to access seller features.';
      case 'pending':
        return 'Your KYC application is under review. Please wait for approval.';
      case 'rejected':
        return `Your KYC application was rejected. ${kycStatus.rejectionReason || 'Please submit a new application.'}`;
      default:
        return 'Please complete your KYC verification to access seller features.';
    }
  })() : null;

  const value: KycContextValue = {
    kycStatus,
    loading,
    error,
    isVerified,
    needsKyc,
    blockingReason,
    refreshKycStatus,
    submitKyc,
    checkKycGate
  };

  return <KycContext.Provider value={value}>{children}</KycContext.Provider>;
}

export function useKyc(): KycContextValue {
  const context = useContext(KycContext);
  if (!context) {
    throw new Error('useKyc must be used within a KycProvider');
  }
  return context;
}