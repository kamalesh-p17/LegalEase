-- Fix function security by setting search_path
DROP FUNCTION IF EXISTS public.calculate_lawyer_rating(UUID);

CREATE OR REPLACE FUNCTION public.calculate_lawyer_rating(lawyer_user_id UUID)
RETURNS NUMERIC
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(AVG(rating), 0)
  FROM public.lawyer_ratings
  WHERE lawyer_id = lawyer_user_id;
$$;