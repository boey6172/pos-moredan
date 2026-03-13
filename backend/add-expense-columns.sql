-- Add missing columns to "Expenses" table (safe to run multiple times).
-- Fixes: column "particulars" does not exist (and any other missing columns).

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Expenses' AND column_name = 'particulars') THEN
    ALTER TABLE "Expenses" ADD COLUMN "particulars" TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Expenses' AND column_name = 'tinNumber') THEN
    ALTER TABLE "Expenses" ADD COLUMN "tinNumber" VARCHAR(255);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Expenses' AND column_name = 'address') THEN
    ALTER TABLE "Expenses" ADD COLUMN "address" TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Expenses' AND column_name = 'referenceNo') THEN
    ALTER TABLE "Expenses" ADD COLUMN "referenceNo" VARCHAR(255);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Expenses' AND column_name = 'createdAt') THEN
    ALTER TABLE "Expenses" ADD COLUMN "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();
  END IF;
END $$;
