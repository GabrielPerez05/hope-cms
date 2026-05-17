ALTER TABLE public.customer
ADD COLUMN IF NOT EXISTS record_status VARCHAR(10) NOT NULL DEFAULT 'ACTIVE';

ALTER TABLE public.customer
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE public.customer
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE public.customer
ADD COLUMN IF NOT EXISTS stamp VARCHAR(60);

ALTER TABLE public.customer
ADD COLUMN IF NOT EXISTS created_by VARCHAR(50);

ALTER TABLE public.customer
ADD COLUMN IF NOT EXISTS updated_by VARCHAR(50);

DO $$
BEGIN
  ALTER TABLE public.customer
  ADD CONSTRAINT customer_record_status_ck
  CHECK (record_status IN ('ACTIVE', 'INACTIVE'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

UPDATE public.customer
SET record_status = 'ACTIVE'
WHERE record_status IS NULL;
