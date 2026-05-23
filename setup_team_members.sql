-- Create team_members table
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    org_id UUID NOT NULL,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('Owner', 'Admin', 'Analyst', 'Viewer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.team_members;

-- Create policy for authenticated users (for MVP we allow all authenticated users)
CREATE POLICY "Enable all operations for authenticated users"
ON public.team_members
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_members;

-- Insert a default owner if table is empty
INSERT INTO public.team_members (org_id, email, name, role)
SELECT 
    '11111111-1111-1111-1111-111111111111', 
    'admin@example.com', 
    'Thejeshwaar Paasila', 
    'Owner'
WHERE NOT EXISTS (SELECT 1 FROM public.team_members);
