-- Migration: Amazon-Style Recommendation Engine
-- Description: Adds Weighted Similarity RPC and ultra-fast indexing for the Similar Designs horizontal bar.

-- 1. Create Index for Artist Name (B-Tree for exact string match)
CREATE INDEX IF NOT EXISTS idx_designs_artist ON public.designs (artist_name);

-- 2. Create GIN Indexes for Array columns (for lightning fast '&&' overlap checks)
CREATE INDEX IF NOT EXISTS idx_designs_style ON public.designs USING GIN (style);
CREATE INDEX IF NOT EXISTS idx_designs_body_part ON public.designs USING GIN (body_part);

-- 3. Create the Weighted RPC Engine
CREATE OR REPLACE FUNCTION get_weighted_similar_designs(
    target_id uuid,
    limit_val int DEFAULT 10,
    offset_val int DEFAULT 0
) RETURNS SETOF public.designs AS $$
DECLARE
    t_style text[];
    t_body_part text[];
    t_artist_name text;
BEGIN
    -- Extract target features to compare against
    SELECT style, body_part, artist_name 
    INTO t_style, t_body_part, t_artist_name
    FROM public.designs 
    WHERE id = target_id;

    -- Return mathematically ranked designs
    RETURN QUERY
    SELECT d.*
    FROM public.designs d
    WHERE d.id != target_id AND d.is_published = true
    ORDER BY
        (
            CASE 
                -- Priority 1: Same Style AND Same Body Part
                WHEN (d.style && t_style) AND (d.body_part && t_body_part) THEN 3
                -- Priority 2: Same Artist
                WHEN d.artist_name = t_artist_name THEN 2
                -- Priority 3: Same Style Only
                WHEN (d.style && t_style) THEN 1
                -- Base
                ELSE 0
            END
        ) DESC,
        -- Tie breaker: freshest designs first
        d.uploaded_at DESC
    LIMIT limit_val 
    OFFSET offset_val;
END;
$$ LANGUAGE plpgsql STABLE;
