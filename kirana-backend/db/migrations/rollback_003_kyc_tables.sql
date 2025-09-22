-- Rollback Migration 003: Remove KYC System Tables
-- Description: Drops all KYC-related tables and triggers
-- Date: 2025-09-22

-- Drop trigger first
DROP TRIGGER IF EXISTS create_kyc_status_for_new_seller;

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS kyc_status_history;
DROP TABLE IF EXISTS kyc_documents;
DROP TABLE IF EXISTS kyc_submissions;
DROP TABLE IF EXISTS seller_kyc_status;

-- Rollback completed successfully