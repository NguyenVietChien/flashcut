-- PlanDisplay table — presentation data for landing page
-- This is a 1:1 extension of Plan, keeping Plan as a pure business entity

CREATE TABLE IF NOT EXISTS "PlanDisplay" (
    "id"          TEXT    NOT NULL,
    "planId"      TEXT    NOT NULL,
    "taglineVi"   TEXT,
    "taglineEn"   TEXT,
    "highlightVi" TEXT,
    "highlightEn" TEXT,
    "ctaVi"       TEXT,
    "ctaEn"       TEXT,
    "emoji"       TEXT,
    "sortOrder"   INTEGER NOT NULL DEFAULT 0,
    "isFeatured"  BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PlanDisplay_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "PlanDisplay_planId_fkey" FOREIGN KEY ("planId")
        REFERENCES "Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "PlanDisplay_planId_key" ON "PlanDisplay"("planId");
