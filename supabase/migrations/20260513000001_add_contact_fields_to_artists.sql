-- Migration: Add contact details (email, phone) to artists table for administrative use
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS contact_phone TEXT;

-- Optional Comments for documentation
COMMENT ON COLUMN public.artists.contact_email IS 'Administrative contact email for coordinating with the artist';
COMMENT ON COLUMN public.artists.contact_phone IS 'Administrative phone number for direct coordination';
