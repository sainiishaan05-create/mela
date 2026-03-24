CREATE TABLE outreach (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_name TEXT NOT NULL,
  instagram TEXT,
  whatsapp TEXT,
  email TEXT,
  category TEXT,
  city TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'listed', 'rejected')),
  message_sent TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE outreach ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin only" ON outreach USING (true);
