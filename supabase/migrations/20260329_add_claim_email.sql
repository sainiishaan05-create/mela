-- Add claim_email column to vendors table
-- This stores the email submitted by the claimant (not vendor.email which may be null)
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS claim_email text;
