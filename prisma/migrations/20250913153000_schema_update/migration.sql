-- Align database schema with prisma/schema.prisma (remove Course model,
-- change Timeslot to teacher-based, extend User fields, and update Booking)

BEGIN;

-- ============================
-- User: add new optional profile fields
-- ============================
ALTER TABLE "public"."User"
  ADD COLUMN IF NOT EXISTS "profileImage" TEXT,
  ADD COLUMN IF NOT EXISTS "bio" TEXT,
  ADD COLUMN IF NOT EXISTS "specialties" TEXT[],
  ADD COLUMN IF NOT EXISTS "experience" INTEGER,
  ADD COLUMN IF NOT EXISTS "education" TEXT,
  ADD COLUMN IF NOT EXISTS "phone" TEXT;

-- ============================
-- Timeslot: switch from Course to Teacher relations
-- ============================
-- Drop FK and index referencing Course
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    WHERE t.relname = 'Timeslot' AND c.conname = 'Timeslot_courseId_fkey'
  ) THEN
    ALTER TABLE "public"."Timeslot" DROP CONSTRAINT "Timeslot_courseId_fkey";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class WHERE relname = 'Timeslot_courseId_idx'
  ) THEN
    DROP INDEX "public"."Timeslot_courseId_idx";
  END IF;
END $$;

-- Add teacher relation columns
ALTER TABLE "public"."Timeslot"
  ADD COLUMN IF NOT EXISTS "teacherId" TEXT,
  ADD COLUMN IF NOT EXISTS "isAvailable" BOOLEAN NOT NULL DEFAULT true;

-- Make teacherId required if table has no rows (will succeed when empty)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM "public"."Timeslot" LIMIT 1) THEN
    ALTER TABLE "public"."Timeslot" ALTER COLUMN "teacherId" SET NOT NULL;
  END IF;
END $$;

-- Drop old columns
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='Timeslot' AND column_name='courseId'
  ) THEN
    ALTER TABLE "public"."Timeslot" DROP COLUMN "courseId";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='Timeslot' AND column_name='maxSeat'
  ) THEN
    ALTER TABLE "public"."Timeslot" DROP COLUMN "maxSeat";
  END IF;
END $$;

-- Add index and FK for teacherId
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class WHERE relname = 'Timeslot_teacherId_idx'
  ) THEN
    CREATE INDEX "Timeslot_teacherId_idx" ON "public"."Timeslot"("teacherId");
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c JOIN pg_class t ON t.oid = c.conrelid
    WHERE t.relname = 'Timeslot' AND c.conname = 'Timeslot_teacherId_fkey'
  ) THEN
    ALTER TABLE "public"."Timeslot"
      ADD CONSTRAINT "Timeslot_teacherId_fkey"
      FOREIGN KEY ("teacherId") REFERENCES "public"."User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- ============================
-- Booking: add teacherId + notes
-- ============================
ALTER TABLE "public"."Booking"
  ADD COLUMN IF NOT EXISTS "teacherId" TEXT,
  ADD COLUMN IF NOT EXISTS "notes" TEXT;

-- Make teacherId required if table has no rows
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM "public"."Booking" LIMIT 1) THEN
    ALTER TABLE "public"."Booking" ALTER COLUMN "teacherId" SET NOT NULL;
  END IF;
END $$;

-- Index + FK for teacherId
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class WHERE relname = 'Booking_teacherId_idx'
  ) THEN
    CREATE INDEX "Booking_teacherId_idx" ON "public"."Booking"("teacherId");
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c JOIN pg_class t ON t.oid = c.conrelid
    WHERE t.relname = 'Booking' AND c.conname = 'Booking_teacherId_fkey'
  ) THEN
    ALTER TABLE "public"."Booking"
      ADD CONSTRAINT "Booking_teacherId_fkey"
      FOREIGN KEY ("teacherId") REFERENCES "public"."User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- ============================
-- Drop Course table (legacy)
-- ============================
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='Course'
  ) THEN
    DROP TABLE "public"."Course";
  END IF;
END $$;

COMMIT;

