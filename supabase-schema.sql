-- ====================================================================
-- OFFICIAL SUPABASE POSTGRESQL SCHEMA & SERVER-SIDE RLS POLICIES
-- ====================================================================
-- Purpose: Real Authentication & Database Authorization for Portfolio CMS
-- Admin Account: gursimranaidev@gmail.com
-- Connected Project ID: bufvzcvlmibayhwgvnsr
-- Instructions:
-- 1. Open your Supabase Project Dashboard (https://supabase.com)
-- 2. Go to "SQL Editor" -> Click "New Query"
-- 3. Paste this complete SQL script and click "RUN"
-- ====================================================================

-- 1. Create Profiles Table (Role-Based Authorization)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user', -- Only 'admin' role grants CMS privileges
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on Profiles Table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profile RLS Policies: Owners can view their own profile
DROP POLICY IF EXISTS "Profiles viewable by owner" ON public.profiles;
CREATE POLICY "Profiles viewable by owner" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

-- Prevent users from modifying their own role column from frontend
DROP POLICY IF EXISTS "Prevent client-side role escalation" ON public.profiles;
CREATE POLICY "Prevent client-side role escalation" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- 2. Create Trigger Function to Automatically Create User Profiles on Signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    CASE 
      WHEN LOWER(NEW.email) = 'gursimranaidev@gmail.com' THEN 'admin'
      ELSE 'user'
    END
  )
  ON CONFLICT (id) DO UPDATE SET 
    email = EXCLUDED.email,
    role = CASE 
      WHEN LOWER(EXCLUDED.email) = 'gursimranaidev@gmail.com' THEN 'admin'
      ELSE public.profiles.role
    END,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind Trigger to Auth.Users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Retroactively Sync Existing Account (gursimranaidev@gmail.com) into Profiles as Admin
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'admin'
FROM auth.users
WHERE LOWER(email) = 'gursimranaidev@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin', updated_at = NOW();

-- 3. Create Articles Table
CREATE TABLE IF NOT EXISTS public.articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  author TEXT DEFAULT 'Gursimran Singh',
  content TEXT NOT NULL,
  category TEXT DEFAULT 'AI/ML',
  type TEXT DEFAULT 'Article',
  tags TEXT[] DEFAULT '{}',
  cover_image TEXT,
  read_time TEXT,
  word_count INT DEFAULT 0,
  status TEXT DEFAULT 'Draft', -- 'Draft', 'Published', 'Scheduled', 'Unpublished'
  published BOOLEAN DEFAULT false,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  seo_title TEXT,
  seo_description TEXT
);

-- Enable Row Level Security (RLS) on Articles Table
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- ====================================================================
-- SERVER-SIDE ROW LEVEL SECURITY (RLS) POLICIES ON ARTICLES
-- ====================================================================

-- 1. PUBLIC READ POLICY: Public visitors can ONLY read published articles
DROP POLICY IF EXISTS "Public users can view published articles" ON public.articles;
CREATE POLICY "Public users can view published articles" 
  ON public.articles
  FOR SELECT 
  USING (published = true AND status = 'Published');

-- 2. ADMIN READ POLICY: Admin can view all items (drafts + published)
DROP POLICY IF EXISTS "Admin can view all articles" ON public.articles;
CREATE POLICY "Admin can view all articles" 
  ON public.articles
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
      AND LOWER(profiles.email) = 'gursimranaidev@gmail.com'
    )
  );

-- 3. ADMIN INSERT POLICY: Only verified admin profile can create articles
DROP POLICY IF EXISTS "Admin can insert articles" ON public.articles;
CREATE POLICY "Admin can insert articles" 
  ON public.articles
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
      AND LOWER(profiles.email) = 'gursimranaidev@gmail.com'
    )
  );

-- 4. ADMIN UPDATE POLICY: Only verified admin profile can edit/publish/unpublish
DROP POLICY IF EXISTS "Admin can update articles" ON public.articles;
CREATE POLICY "Admin can update articles" 
  ON public.articles
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
      AND LOWER(profiles.email) = 'gursimranaidev@gmail.com'
    )
  );

-- 5. ADMIN DELETE POLICY: Only verified admin profile can delete articles
DROP POLICY IF EXISTS "Admin can delete articles" ON public.articles;
CREATE POLICY "Admin can delete articles" 
  ON public.articles
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
      AND LOWER(profiles.email) = 'gursimranaidev@gmail.com'
    )
  );

-- Insert Initial Real Content Item
INSERT INTO public.articles (
  title, 
  slug, 
  description, 
  author, 
  content, 
  category, 
  type, 
  tags, 
  read_time, 
  status, 
  published
) VALUES (
  'Complete AI & ML Journey',
  'complete-ai-ml-journey',
  'A structured and continuously evolving AI & Machine Learning journey covering Python, NumPy, Pandas, data analysis, visualization, statistics, machine learning fundamentals, hands-on notebooks, experiments, and practical projects.',
  'Gursimran Singh',
  '<h2>About My AI & ML Learning Journey</h2><p>Welcome to my public learning repository! As a B.Tech student specializing in Artificial Intelligence & Machine Learning, I document my progress, experiments, notebooks, and projects in real time.</p><h3>Core Learning Modules</h3><ul><li><strong>Python Core & OOP:</strong> Data structures, functions, modular architecture, and algorithms.</li><li><strong>Data Manipulation with NumPy & Pandas:</strong> Array computing, DataFrame operations, vectorization, and data cleaning pipelines.</li><li><strong>Exploratory Data Analysis (EDA):</strong> Statistical summary, handling missing values, feature correlation analysis, and distributions.</li><li><strong>Data Visualization:</strong> Communicating data insights through Matplotlib & Seaborn visualizations.</li><li><strong>Machine Learning Foundations:</strong> Supervised learning, classification, regression, clustering, and evaluation metrics with Scikit-Learn.</li></ul>',
  'AI/ML',
  'Learning Repository',
  ARRAY['Python', 'NumPy', 'Pandas', 'Data Science', 'Machine Learning', 'Jupyter Notebook'],
  'Ongoing Series',
  'Published',
  true
) ON CONFLICT (slug) DO NOTHING;
