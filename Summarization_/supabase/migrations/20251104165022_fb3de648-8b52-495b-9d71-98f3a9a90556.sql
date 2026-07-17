-- Create connection requests table (like LinkedIn connect)
CREATE TABLE public.connection_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lawyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_id, lawyer_id)
);

-- Create ratings table
CREATE TABLE public.lawyer_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lawyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating NUMERIC NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(lawyer_id, client_id)
);

-- Enable RLS
ALTER TABLE public.connection_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lawyer_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for connection_requests
CREATE POLICY "Users can view their own connection requests"
ON public.connection_requests FOR SELECT
USING (auth.uid() = client_id OR auth.uid() = lawyer_id);

CREATE POLICY "Clients can create connection requests"
ON public.connection_requests FOR INSERT
WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Lawyers can update connection requests"
ON public.connection_requests FOR UPDATE
USING (auth.uid() = lawyer_id);

-- RLS Policies for lawyer_ratings
CREATE POLICY "Anyone can view ratings"
ON public.lawyer_ratings FOR SELECT
USING (true);

CREATE POLICY "Clients with accepted connections can rate lawyers"
ON public.lawyer_ratings FOR INSERT
WITH CHECK (
  auth.uid() = client_id AND
  EXISTS (
    SELECT 1 FROM public.connection_requests
    WHERE client_id = auth.uid() 
    AND lawyer_id = lawyer_ratings.lawyer_id
    AND status = 'accepted'
  )
);

-- Function to calculate average lawyer rating
CREATE OR REPLACE FUNCTION public.calculate_lawyer_rating(lawyer_user_id UUID)
RETURNS NUMERIC AS $$
  SELECT COALESCE(AVG(rating), 0)
  FROM public.lawyer_ratings
  WHERE lawyer_id = lawyer_user_id;
$$ LANGUAGE SQL STABLE;

-- Update lawyers table to remove default rating
ALTER TABLE public.lawyers ALTER COLUMN rating DROP DEFAULT;

-- Add trigger to update connection_requests updated_at
CREATE TRIGGER update_connection_requests_updated_at
BEFORE UPDATE ON public.connection_requests
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();