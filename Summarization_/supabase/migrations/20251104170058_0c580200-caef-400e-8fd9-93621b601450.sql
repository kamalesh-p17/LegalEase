-- Allow null ratings for lawyers who haven't been rated yet
ALTER TABLE public.lawyers ALTER COLUMN rating DROP NOT NULL;