# Database Migrations

## How to Apply Migrations

### Migration 003: KYC System Tables

**To Apply:**
```sql
-- Connect to your MySQL database and run:
SOURCE db/migrations/003_kyc_tables.sql;
```

**To Rollback:**
```sql
-- Connect to your MySQL database and run:
SOURCE db/migrations/rollback_003_kyc_tables.sql;
```

### Manual Migration Steps

1. **Connect to database:**
   ```bash
   mysql -u [username] -p [database_name]
   ```

2. **Apply migration:**
   ```sql
   SOURCE db/migrations/003_kyc_tables.sql;
   ```

3. **Verify tables created:**
   ```sql
   SHOW TABLES LIKE '%kyc%';
   DESCRIBE seller_kyc_status;
   ```

### Migration Summary

**Tables Created:**
- `seller_kyc_status` - Current KYC status per seller
- `kyc_submissions` - Historical submissions for audit trail
- `kyc_documents` - Document storage with flexible URLs
- `kyc_status_history` - Audit trail for status changes

**Triggers Created:**
- `create_kyc_status_for_new_seller` - Auto-creates KYC status for new sellers

**Initial Data:**
- All existing sellers get `unsubmitted` KYC status