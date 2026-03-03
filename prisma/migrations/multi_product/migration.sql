-- Multi-Product Backend Migration
-- This migration adds Product, Plan tables and unifies License system

-- ─── Step 1: Create Product table ──────────────────────────────
CREATE TABLE IF NOT EXISTS "Product" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'desktop',
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Product_slug_key" ON "Product"("slug");

-- ─── Step 2: Create Plan table ─────────────────────────────────
CREATE TABLE IF NOT EXISTS "Plan" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priceVnd" INTEGER NOT NULL,
    "priceUsd" INTEGER,
    "durationDays" INTEGER,
    "maxActivations" INTEGER NOT NULL DEFAULT 1,
    "usageLimit" INTEGER,
    "features" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Plan_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT
);
CREATE UNIQUE INDEX IF NOT EXISTS "Plan_productId_slug_key" ON "Plan"("productId", "slug");

-- ─── Step 3: Seed FlashCut product ─────────────────────────────
INSERT INTO "Product" ("id", "slug", "name", "type", "description")
VALUES ('prod_flashcut', 'flashcut', 'FlashCut AI', 'desktop', 'AI Video Automation for CapCut')
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "Plan" ("id", "productId", "slug", "name", "priceVnd", "priceUsd", "durationDays", "maxActivations", "usageLimit")
VALUES 
    ('plan_fc_basic', 'prod_flashcut', 'basic', 'Basic', 299000, 12, 180, 1, 10),
    ('plan_fc_pro', 'prod_flashcut', 'pro', 'Pro', 599000, 25, 365, 1, NULL)
ON CONFLICT ("productId", "slug") DO NOTHING;

-- ─── Step 4: Modify Order table ────────────────────────────────
-- Make userId nullable (guest buyers)
ALTER TABLE "Order" ALTER COLUMN "userId" DROP NOT NULL;

-- Add new columns
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "productId" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "buyerEmail" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "source" TEXT NOT NULL DEFAULT 'web';

-- Set existing orders to FlashCut product
UPDATE "Order" SET "productId" = 'prod_flashcut' WHERE "productId" IS NULL;

-- Add foreign key
ALTER TABLE "Order" ADD CONSTRAINT "Order_productId_fkey" 
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL;

-- Change user relation to SET NULL instead of CASCADE
ALTER TABLE "Order" DROP CONSTRAINT IF EXISTS "Order_userId_fkey";
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL;

-- ─── Step 5: Modify License table ──────────────────────────────
-- Make userId and orderId nullable
ALTER TABLE "License" ALTER COLUMN "userId" DROP NOT NULL;
ALTER TABLE "License" ALTER COLUMN "orderId" DROP NOT NULL;
ALTER TABLE "License" ALTER COLUMN "expiresAt" DROP NOT NULL;

-- Add new columns
ALTER TABLE "License" ADD COLUMN IF NOT EXISTS "productId" TEXT;
ALTER TABLE "License" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "License" ADD COLUMN IF NOT EXISTS "contactInfo" TEXT;
ALTER TABLE "License" ADD COLUMN IF NOT EXISTS "source" TEXT NOT NULL DEFAULT 'web';
ALTER TABLE "License" ADD COLUMN IF NOT EXISTS "tier" TEXT NOT NULL DEFAULT 'basic';
ALTER TABLE "License" ADD COLUMN IF NOT EXISTS "hwidHash" TEXT;
ALTER TABLE "License" ADD COLUMN IF NOT EXISTS "maxActivations" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "License" ADD COLUMN IF NOT EXISTS "currentActivations" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "License" ADD COLUMN IF NOT EXISTS "usageLimit" INTEGER;
ALTER TABLE "License" ADD COLUMN IF NOT EXISTS "currentUsage" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "License" ADD COLUMN IF NOT EXISTS "lastSeen" TIMESTAMP(3);
ALTER TABLE "License" ADD COLUMN IF NOT EXISTS "note" TEXT;
ALTER TABLE "License" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Set existing licenses to FlashCut product
UPDATE "License" SET "productId" = 'prod_flashcut' WHERE "productId" IS NULL;

-- Add foreign key
ALTER TABLE "License" ADD CONSTRAINT "License_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL;

-- Change user relation to SET NULL
ALTER TABLE "License" DROP CONSTRAINT IF EXISTS "License_userId_fkey";
ALTER TABLE "License" ADD CONSTRAINT "License_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL;

-- ─── Step 6: Migrate DesktopLicense data to License ────────────
INSERT INTO "License" (
    "id", "productId", "key", "tier", "hwidHash", 
    "maxActivations", "currentActivations", "usageLimit", "currentUsage",
    "lastSeen", "status", "plan", "source", "activatedAt", "expiresAt", "createdAt"
)
SELECT 
    dl."id",
    'prod_flashcut',
    dl."license_key",
    dl."tier",
    dl."hwid_hash",
    dl."max_activations",
    dl."current_activations",
    dl."usage_limit",
    dl."current_usage",
    dl."last_seen",
    CASE WHEN dl."is_active" THEN 'active' ELSE 'inactive' END,
    dl."tier",  -- use tier as plan
    'admin',    -- desktop licenses were created by admin
    dl."created_at",
    dl."expires_at",
    dl."created_at"
FROM "desktop_licenses" dl
WHERE NOT EXISTS (
    SELECT 1 FROM "License" WHERE "key" = dl."license_key"
);

-- ─── Step 7: Update ActivationLog to reference unified License ──
-- ActivationLog already references by license_id which maps to the same IDs
-- No data changes needed since we preserve the IDs from DesktopLicense

-- ─── Step 8: Drop DesktopLicense table ─────────────────────────
-- Update foreign key on activation_logs first
ALTER TABLE "activation_logs" DROP CONSTRAINT IF EXISTS "activation_logs_license_id_fkey";
ALTER TABLE "activation_logs" DROP CONSTRAINT IF EXISTS "ActivationLog_license_id_fkey";
ALTER TABLE "activation_logs" ADD CONSTRAINT "ActivationLog_license_id_fkey"
    FOREIGN KEY ("license_id") REFERENCES "License"("id") ON DELETE RESTRICT;

-- Now safe to drop
DROP TABLE IF EXISTS "desktop_licenses";
