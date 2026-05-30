-- Migration: Solo Founder OS Tables

-- 1. Platform Config (for launch_date)
CREATE TABLE IF NOT EXISTS platform_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default launch_date if not exists (set to today or actual launch date)
INSERT INTO platform_config (key, value) 
VALUES ('launch_date', '2026-04-10T00:00:00Z')
ON CONFLICT (key) DO NOTHING;

-- 2. Founder Checkins
CREATE TABLE IF NOT EXISTS founder_checkins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    week_number INTEGER NOT NULL,
    year INTEGER NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    metrics_input JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL CHECK (status IN ('on_track', 'behind', 'critical')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies (Admin only protection)
ALTER TABLE platform_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE founder_checkins ENABLE ROW LEVEL SECURITY;

-- Allow hotosevents@gmail.com (admin) to manage all
CREATE POLICY "Admin full access platform_config" 
ON platform_config 
FOR ALL 
TO authenticated 
USING (auth.jwt() ->> 'email' = 'hotosevents@gmail.com');

CREATE POLICY "Admin full access founder_checkins" 
ON founder_checkins 
FOR ALL 
TO authenticated 
USING (auth.jwt() ->> 'email' = 'hotosevents@gmail.com');
