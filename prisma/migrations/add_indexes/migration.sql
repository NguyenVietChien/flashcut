-- Add performance indexes to Order, License, and ActivationLog tables
-- Safe to run multiple times (CREATE INDEX IF NOT EXISTS)

-- Order indexes
CREATE INDEX IF NOT EXISTS "Order_userId_idx" ON "Order" ("userId");
CREATE INDEX IF NOT EXISTS "Order_status_idx" ON "Order" ("status");
CREATE INDEX IF NOT EXISTS "Order_createdAt_idx" ON "Order" ("createdAt");
CREATE INDEX IF NOT EXISTS "Order_productId_idx" ON "Order" ("productId");

-- License indexes
CREATE INDEX IF NOT EXISTS "License_userId_idx" ON "License" ("userId");
CREATE INDEX IF NOT EXISTS "License_productId_idx" ON "License" ("productId");
CREATE INDEX IF NOT EXISTS "License_status_idx" ON "License" ("status");
CREATE INDEX IF NOT EXISTS "License_email_idx" ON "License" ("email");
CREATE INDEX IF NOT EXISTS "License_hwidHash_idx" ON "License" ("hwidHash");
CREATE INDEX IF NOT EXISTS "License_createdAt_idx" ON "License" ("createdAt");

-- ActivationLog indexes
CREATE INDEX IF NOT EXISTS "activation_logs_license_id_idx" ON "activation_logs" ("license_id");
CREATE INDEX IF NOT EXISTS "activation_logs_hwid_hash_idx" ON "activation_logs" ("hwid_hash");
