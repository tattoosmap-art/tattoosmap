-- Recommendation Engine: Fetch Similar Designs
-- Combines collaborative filtering (users who saved this also saved...) 
-- with weighted tag and style matching.

CREATE OR REPLACE FUNCTION get_similar_designs(current_design_id UUID, limit_count INT DEFAULT 12)
RETURNS SETOF designs AS $$
DECLARE
    target_styles TEXT[];
    target_tags TEXT[];
BEGIN
    -- Get styles and tags of the current design
    SELECT style, tags INTO target_styles, target_tags
    FROM designs WHERE id = current_design_id;

    RETURN QUERY
    WITH collaborative_matches AS (
        -- Tier 1: Collaborative Filtering (Users who saved this also saved...)
        SELECT s2.design_id, count(*) * 5 as weight 
        FROM user_saves s1
        JOIN user_saves s2 ON s1.user_id = s2.user_id
        WHERE s1.design_id = current_design_id
          AND s2.design_id != current_design_id
        GROUP BY s2.design_id
    ),
    tag_matches AS (
        -- Tier 2: Content-Based Filtering (Matching styles or tags)
        SELECT d.id as design_id, 
               (cardinality(ARRAY(SELECT unnest(d.style) INTERSECT SELECT unnest(target_styles))) +
                cardinality(ARRAY(SELECT unnest(d.tags) INTERSECT SELECT unnest(target_tags)))) as weight
        FROM designs d
        WHERE d.id != current_design_id
          AND (d.style && target_styles OR d.tags && target_tags)
    ),
    combined_scores AS (
        SELECT design_id, sum(weight) as total_weight
        FROM (
            SELECT * FROM collaborative_matches
            UNION ALL
            SELECT * FROM tag_matches
        ) s
        GROUP BY design_id
    )
    SELECT d.*
    FROM designs d
    JOIN combined_scores cs ON d.id = cs.design_id
    ORDER BY cs.total_weight DESC, d.save_count DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE;
