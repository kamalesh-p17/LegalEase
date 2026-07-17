-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  user_type TEXT CHECK (user_type IN ('client', 'lawyer')) DEFAULT 'client',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create lawyers table
CREATE TABLE public.lawyers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  location TEXT NOT NULL,
  experience_years INTEGER NOT NULL,
  rating DECIMAL(3,2) DEFAULT 0.0,
  bio TEXT,
  phone TEXT,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for lawyers
ALTER TABLE public.lawyers ENABLE ROW LEVEL SECURITY;

-- Policies for lawyers (publicly readable for search)
CREATE POLICY "Lawyers are publicly readable"
  ON public.lawyers FOR SELECT
  USING (true);

CREATE POLICY "Lawyers can update their own profile"
  ON public.lawyers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Lawyers can insert their own profile"
  ON public.lawyers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert sample lawyers
INSERT INTO public.lawyers (full_name, specialization, location, experience_years, rating, bio, email, phone) VALUES
  ('Sarah Johnson', 'Criminal Law', 'New York, NY', 15, 4.8, 'Experienced criminal defense attorney with a track record of successful cases.', 'sarah.johnson@legalai.com', '+1-555-0101'),
  ('Michael Chen', 'Corporate Law', 'San Francisco, CA', 12, 4.9, 'Specializing in business formation, contracts, and corporate governance.', 'michael.chen@legalai.com', '+1-555-0102'),
  ('Emily Rodriguez', 'Family Law', 'Los Angeles, CA', 10, 4.7, 'Compassionate advocate for family matters including divorce and custody.', 'emily.rodriguez@legalai.com', '+1-555-0103'),
  ('David Thompson', 'Immigration Law', 'Miami, FL', 8, 4.6, 'Helping families navigate complex immigration processes.', 'david.thompson@legalai.com', '+1-555-0104'),
  ('Lisa Anderson', 'Real Estate Law', 'Chicago, IL', 20, 4.9, 'Expert in property transactions, zoning, and real estate disputes.', 'lisa.anderson@legalai.com', '+1-555-0105');