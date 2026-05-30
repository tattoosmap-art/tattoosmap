import { supabaseAnon as supabase } from '@/lib/supabase-anon';
import { Design, Post } from '@/types/database.types';
import { MOCK_DESIGNS } from '@/lib/mock-data';

/**
 * Service to handle all design and post related data fetching from Supabase.
 * Implements a graceful fallback to mock data if the database is empty or the fetch fails.
 */

const ensureArray = (val: any) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
        const trimmed = val.trim();
        // Handle JSON stringified arrays
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            try { return JSON.parse(trimmed); } catch (e) { }
        }
        // Handle Postgres string-formatted arrays if they slip through
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
            return trimmed.slice(1, -1).split(',').map(s => s.trim().replace(/^"|"$/g, ''));
        }
        return [trimmed];
    }
    return [];
};

const getFakeMetrics = (id: string, realSaves: number = 0, realViews: number = 0) => {
    let hash = 0;
    const strId = String(id);
    for (let i = 0; i < strId.length; i++) {
        hash = (hash << 5) - hash + strId.charCodeAt(i);
        hash |= 0;
    }
    const absHash = Math.abs(hash);
    
    // Base views: realistic range between 120 and 580 (not too big)
    const baseViews = 120 + (absHash % 460);
    // Base saves: realistic ratio between 2.5% and 4.5% of views
    const savePercentage = 0.025 + ((absHash % 5) / 200);
    const baseSaves = Math.round(baseViews * savePercentage);
    
    return {
        save_count: baseSaves + realSaves,
        view_count: baseViews + realViews
    };
};


export const designService = {
    /**
     * Test connection to Supabase.
     */
    async testConnection(): Promise<{ success: boolean; error?: string }> {
        try {
            const { data, error } = await supabase
                .from('designs')
                .select('id')
                .limit(1);

            if (error) throw error;
            return { success: true };
        } catch (err: any) {
            console.error('Connection test failed:', err);
            return { success: false, error: err.message || 'Unknown database error' };
        }
    },

    /**
     * Fetch all designs for the gallery.
     */
    async getDesigns(): Promise<Design[]> {
        try {
            const { data, error } = await supabase
                .from('designs')
                .select('*')
                .eq('is_published', true)
                .order('uploaded_at', { ascending: false });

            if (error || !data || data.length === 0) {
                console.warn('Supabase fetch designs empty or failed, falling back to mock data.');
                return MOCK_DESIGNS;
            }

            // Map the new SEO schema to the old V1 Types to prevent the UI from crashing
            const mappedData = data.map(dbRow => ({
                id: dbRow.id,
                slug: dbRow.slug || String(dbRow.id),
                title: dbRow.title || dbRow.subject || "Untitled",
                image_url: dbRow.image_url,
                alt_text: dbRow.alt_text,
                uploaded_at: dbRow.updated_at,
                image_width: dbRow.image_width || 800,
                image_height: dbRow.image_height || 1000,
                style: ensureArray(dbRow.style).length > 0 ? ensureArray(dbRow.style) : [dbRow.public_category].filter(Boolean),
                body_part: ensureArray(dbRow.body_part),
                gender: (dbRow.gender === 'Unisex' ? 'Men and Women' : dbRow.gender) || "Men and Women",
                tags: ensureArray(dbRow.elements),
                subject: dbRow.subject,
                public_category: dbRow.public_category,
                gender_suitability: (dbRow.gender_suitability === 'Unisex' ? 'Men and Women' : (dbRow.gender_suitability || dbRow.gender)) || "Men and Women",
                save_count: getFakeMetrics(dbRow.id, dbRow.save_count || 0, dbRow.view_count || 0).save_count,
                view_count: getFakeMetrics(dbRow.id, dbRow.save_count || 0, dbRow.view_count || 0).view_count,
                real_save_count: dbRow.save_count || 0,
                real_view_count: dbRow.view_count || 0,
                artist_name: dbRow.artist_name || null,
                artist_instagram: dbRow.artist_instagram || null,

                // Injecting Rich AI Metadata simulation for all live designs
                meaning: dbRow.meaning || `This ${dbRow.subject || "design"} captures the raw duality of modern existence. The composition symbolizes resilience and organic growth, acting as a permanent digital-to-analog memory anchor.`,
                artist_technical_notes: dbRow.artist_technical_notes || "Use a 3RL needle for structural linework. Recommended to apply soft whip-shading in the lower quadrants to build volume without crowding the delicate intersections.",
                aging_prediction: dbRow.aging_prediction || "Over a 5-year period, the microscopic ink particles will gently disperse in the dermis, creating a beautifully softened, charcoal-like appearance.",
                pain_level_map: dbRow.pain_level_map || { "forearm_outer": "low", "wrist": "medium", "ribs": "high" },
                image_shaded_url: dbRow.image_shaded_url || dbRow.image_url,
                
                // Point to high-end AI composites for the demonstration Whale design
                image_fresh_url: dbRow.image_fresh_url || (dbRow.subject?.toLowerCase().includes('whale') ? "/designs/fresh-whale.png" : dbRow.image_url),
                image_healed_url: dbRow.image_healed_url || (dbRow.subject?.toLowerCase().includes('whale') ? "/designs/healed-whale.png" : dbRow.image_url),

                // Generative Engine Optimization (SGE) Fields
                sge_snippet: dbRow.sge_snippet || null,
                semantic_entities: ensureArray(dbRow.semantic_entities),
                conversational_faqs: ensureArray(dbRow.conversational_faqs)
            }));

            return mappedData as unknown as Design[];
        } catch (err) {
            console.error('Error fetching designs:', err);
            return MOCK_DESIGNS;
        }
    },

    /**
     * Fetch a single design by ID.
     */
    async getDesignById(id: string): Promise<Design | null> {
        try {
            // Smart Lookup: Try UUID first, then Slug
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
            
            let query = supabase.from('designs').select('*');
            if (isUuid) {
                query = query.eq('id', id);
            } else {
                query = query.eq('slug', id);
            }

            const { data, error } = await query.eq('is_published', true).single();

            if (error || !data) {
                // Find in mock data by id or slug
                return MOCK_DESIGNS.find(d => d.id === id || d.slug === id) || null;
            }
            return {
                id: data.id,
                slug: data.slug || String(data.id),
                title: data.title || data.subject || "Untitled",
                image_url: data.image_url,
                alt_text: data.alt_text,
                uploaded_at: data.updated_at,
                image_width: data.image_width || 800,
                image_height: data.image_height || 1000,
                style: ensureArray(data.style).length > 0 ? ensureArray(data.style) : [data.public_category].filter(Boolean),
                body_part: ensureArray(data.body_part),
                gender: (data.gender === 'Unisex' ? 'Men and Women' : data.gender) || "Men and Women",
                tags: ensureArray(data.elements),
                subject: data.subject,
                public_category: data.public_category,
                gender_suitability: (data.gender_suitability === 'Unisex' ? 'Men and Women' : (data.gender_suitability || data.gender)) || "Men and Women",
                save_count: getFakeMetrics(data.id, data.save_count || 0, data.view_count || 0).save_count,
                view_count: getFakeMetrics(data.id, data.save_count || 0, data.view_count || 0).view_count,
                real_save_count: data.save_count || 0,
                real_view_count: data.view_count || 0,
                artist_name: data.artist_name || null,
                artist_instagram: data.artist_instagram || null,

                // Injecting Rich AI Metadata simulation for all live designs
                meaning: data.meaning || `This ${data.subject || "design"} captures the raw duality of modern existence. The composition symbolizes resilience and organic growth, acting as a permanent digital-to-analog memory anchor.`,
                cultural_origin: data.cultural_origin || null,
                cultural_sensitivity: data.cultural_sensitivity || null,
                artist_technical_notes: data.artist_technical_notes || "Use a 3RL needle for structural linework. Recommended to apply soft whip-shading in the lower quadrants to build volume without crowding the delicate intersections.",
                recommended_needle: data.recommended_needle || "3RL Base / 1RL Detail",
                minimum_size_cm: data.minimum_size_cm || 5.0,
                placement_recommendations: ensureArray(data.placement_recommendations),
                aging_prediction: data.aging_prediction || "Over a 5-year period, the microscopic ink particles will gently disperse in the dermis, creating a beautifully softened, charcoal-like appearance.",
                pain_level_map: data.pain_level_map || { "forearm_outer": "low", "wrist": "medium", "ribs": "high" },
                style_tags: ensureArray(data.style_tags),
                emotion_tags: ensureArray(data.emotion_tags),

                image_shaded_url: data.image_shaded_url || data.image_url,
                
                // Point to high-end AI composites for the demonstration Whale design
                image_fresh_url: data.image_fresh_url || (data.subject?.toLowerCase().includes('whale') ? "/designs/fresh-whale.png" : data.image_url),
                image_healed_url: data.image_healed_url || (data.subject?.toLowerCase().includes('whale') ? "/designs/healed-whale.png" : data.image_url),

                // New SEO Fields
                meta_title: data.meta_title || null,
                meta_description: data.meta_description || null,
                focus_keyword: data.focus_keyword || null,

                // Generative Engine Optimization (SGE) Fields
                sge_snippet: data.sge_snippet || null,
                semantic_entities: ensureArray(data.semantic_entities),
                conversational_faqs: ensureArray(data.conversational_faqs)
            } as unknown as Design;
        } catch (err) {
            return MOCK_DESIGNS.find(d => d.id === id || d.slug === id) || null;
        }
    },

    /**
     * Fetch similar designs via API.
     * Supports multi-mode recommendation: 'visual' (Aesthetic + Placement) vs 'conceptual' (Semantics + Meaning)
     */
    async getSimilarDesigns(designId: string, limit: number = 10, offset: number = 0, mode: string = 'visual'): Promise<Design[]> {
        try {
            if (typeof window === 'undefined') {
                // SERVER-SIDE SSR: Direct, lightning-fast in-memory call!
                // Zero network round-trips, zero port dependencies!
                const { getSimilarDesignsInMemory } = await import('@/lib/recommendation');
                return await getSimilarDesignsInMemory(designId, limit, offset, mode);
            }

            // CLIENT-SIDE: Public API call (perfectly inherits active port config)
            const baseUrl = window.location.origin;
            const res = await fetch(`${baseUrl}/api/similar-designs?targetId=${designId}&limit=${limit}&offset=${offset}&mode=${mode}`);
            if (res.ok) {
                const data = await res.json();
                return data as Design[];
            }
            return this.getMockWeightedSimilar(designId, limit, offset, mode);
        } catch (err) {
            console.error('Error fetching similar designs:', err);
            return this.getMockWeightedSimilar(designId, limit, offset, mode);
        }
    },

    /**
     * JS-level replica of the Mathematical SQL Engine for mock fallbacks.
     */
    getMockWeightedSimilar(designId: string, limit: number = 10, offset: number = 0, mode: string = 'visual'): Design[] {
        const target = MOCK_DESIGNS.find(d => d.id === designId);
        if (!target) return [];

        const scored = MOCK_DESIGNS
            .filter(d => d.id !== designId)
            .map(d => {
                let score = 0;

                const tStyle = target.style || [];
                const tBodyPart = target.body_part || [];
                const tArtist = target.artist_name || '';
                const tCategory = target.public_category || '';
                const tStyleTags = target.style_tags || [];
                const tEmotionTags = target.emotion_tags || [];
                const tTags = target.tags || [];

                const dStyle = d.style || [];
                const dBodyPart = d.body_part || [];
                const dStyleTags = d.style_tags || [];
                const dEmotionTags = d.emotion_tags || [];
                const dTags = d.tags || [];

                if (mode === 'conceptual') {
                    if (d.public_category && tCategory && d.public_category === tCategory) score += 15;
                    const matchEmotions = dEmotionTags.filter((t: string) => tEmotionTags.includes(t));
                    score += matchEmotions.length * 15;
                    const matchTags = dTags.filter((t: string) => tTags.includes(t));
                    score += matchTags.length * 5;
                    const matchStyleTags = dStyleTags.filter((t: string) => tStyleTags.includes(t));
                    score += matchStyleTags.length * 3;
                } else {
                    if (d.public_category && tCategory && d.public_category === tCategory) score += 15;
                    if (d.artist_name && tArtist && d.artist_name === tArtist) score += 5;
                    const matchStyles = dStyle.filter((s: string) => tStyle.includes(s));
                    score += matchStyles.length * 10;
                    const matchStyleTags = dStyleTags.filter((t: string) => tStyleTags.includes(t));
                    score += matchStyleTags.length * 8;
                    const matchBodyParts = dBodyPart.filter((b: string) => tBodyPart.includes(b));
                    score += matchBodyParts.length * 5;
                }

                return { ...d, _score: score };
            });

        return scored
            .sort((a, b) => {
                if (b._score !== a._score) return b._score - a._score;
                return new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime();
            })
            // Strip the internal _score before returning types
            .map(({ _score, ...d }) => d as Design)
            .slice(offset, offset + limit);
    },

    /**
     * Fetch user saves (Designs and Posts).
     * Returns empty arrays if the user has no saved items.
     */
    async getUserSaves(userId: string): Promise<{ designs: Design[], posts: Post[] }> {
        const empty = { designs: [] as Design[], posts: [] as Post[] };

        try {
            const { data: savedDesigns, error: dError } = await supabase
                .from('user_saves')
                .select('designs(*)')
                .eq('user_id', userId);

            const { data: savedPosts, error: pError } = await supabase
                .from('user_post_saves')
                .select('posts(*)')
                .eq('user_id', userId);

            return {
                designs: (!dError && savedDesigns?.length)
                    ? savedDesigns.map(s => s.designs) as unknown as Design[]
                    : [],
                posts: (!pError && savedPosts?.length)
                    ? savedPosts.map(s => s.posts) as unknown as Post[]
                    : [],
            };
        } catch (err) {
            console.warn('getUserSaves failed:', err);
            return empty;
        }
    },

    /**
     * Increment the native view count tracking for a specific design.
     * Fires asynchronously without awaiting backend resolution.
     */
    async incrementViewCount(designId: string, userId?: string) {
        try {
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(designId);
            if (!isUuid) return; // Only track for valid UUIDs to avoid DB errors

            // Upsert interaction log (limits spam to 1 per user per session theoretically via unique keys)
            if (userId) {
                await supabase.from('design_views').insert({
                    design_id: designId,
                    user_id: userId
                });
            }
            // Trigger native Postgres RPC to increment atomically (if built), or manual fetch-update
            const { data } = await supabase.from('designs').select('view_count').eq('id', designId).single();
            if (data) {
                await supabase.from('designs').update({ view_count: (data.view_count || 0) + 1 }).eq('id', designId);
            }
        } catch (e) {
            console.error("Failed to increment view metric:", e);
        }
    },

    /**
     * Smart Dopamine-Driven Recommendation Feed
     * Uses psychological principles of Variable Ratio Reinforcement (dopamine loops)
     * and controllable distribution patterns (Pinterest/YouTube exploration vs exploitation).
     * 
     * Uses ONLY real DB metrics (real_save_count, real_view_count, uploaded_at).
     */
    getRecommendedDesigns(designs: Design[]): Design[] {
        if (!designs || designs.length === 0) return [];

        // 1. Compute engagement scores for each design using ONLY real DB metrics
        const scoredDesigns = designs.map(d => {
            const realSaves = d.real_save_count || 0;
            const realViews = d.real_view_count || 0;

            // Recency Bonus: linear decay over 7 days (maximum 100 points)
            const uploadedDate = d.uploaded_at ? new Date(d.uploaded_at) : new Date();
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - uploadedDate.getTime());
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            const recencyBonus = Math.max(0, 100 - (diffDays / 7) * 10);

            // Engagement score: (saves * 4) + (views * 1) + recencyBonus
            const score = (realSaves * 4) + (realViews * 1) + recencyBonus;

            return { design: d, score };
        });

        // Sort scored designs by score descending
        scoredDesigns.sort((a, b) => b.score - a.score);

        // 2. Segment into pools
        // Premium Pool: Top 25% by score
        const premiumThreshold = Math.max(1, Math.ceil(scoredDesigns.length * 0.25));
        const premiumPool = scoredDesigns.slice(0, premiumThreshold).map(x => x.design);

        // Fresh/New Pool (Exploration): uploaded within the last 10 days, or real_views < 150
        const freshPool = scoredDesigns.filter(x => {
            const uploadedDate = x.design.uploaded_at ? new Date(x.design.uploaded_at) : new Date();
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - uploadedDate.getTime());
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            const realViews = x.design.real_view_count || 0;
            return diffDays <= 10 || realViews < 150;
        }).map(x => x.design);

        // Standard/Mid-Tier Pool: everything else
        const premiumIds = new Set(premiumPool.map(p => p.id));
        const standardPool = scoredDesigns
            .filter(x => !premiumIds.has(x.design.id))
            .map(x => x.design);

        // 3. Procedural Dopamine Slotting (Repeating 8-slot pattern)
        const result: Design[] = [];
        const usedIds = new Set<string>();

        // Helper to pull the next unused item from a specific pool
        const pullFromPool = (pool: Design[], preferRandom = false): Design | null => {
            const unused = pool.filter(d => !usedIds.has(d.id));
            if (unused.length === 0) return null;

            if (preferRandom) {
                const idx = Math.floor(Math.random() * unused.length);
                const item = unused[idx];
                usedIds.add(item.id);
                return item;
            } else {
                const item = unused[0]; // Takes the highest scoring unused item
                usedIds.add(item.id);
                return item;
            }
        };

        // Fallback search order: Standard -> Fresh -> Premium
        const pullFallback = (): Design | null => {
            let item = pullFromPool(standardPool);
            if (item) return item;
            item = pullFromPool(freshPool);
            if (item) return item;
            item = pullFromPool(premiumPool);
            return item;
        };

        const totalCount = designs.length;
        let index = 0;

        while (result.length < totalCount) {
            const slotType = index % 8;
            let selected: Design | null = null;

            switch (slotType) {
                case 0:
                case 1:
                case 4:
                case 7:
                    // Premium/High Quality slot
                    selected = pullFromPool(premiumPool) || pullFallback();
                    break;
                case 2:
                case 5:
                    // Fresh/Discovery slot (random)
                    selected = pullFromPool(freshPool, true) || pullFallback();
                    break;
                case 3:
                    // Standard/Reset slot
                    selected = pullFromPool(standardPool) || pullFallback();
                    break;
                case 6:
                    // Wildcard slot: epsilon-greedy exploration (random pull from all remaining designs)
                    const remainingAll = scoredDesigns
                        .map(x => x.design)
                        .filter(d => !usedIds.has(d.id));
                    if (remainingAll.length > 0) {
                        const idx = Math.floor(Math.random() * remainingAll.length);
                        selected = remainingAll[idx];
                        usedIds.add(selected.id);
                    } else {
                        selected = pullFallback();
                    }
                    break;
            }

            if (selected) {
                result.push(selected);
            } else {
                break;
            }
            index++;
        }

        return result;
    },

    /**
     * Parallelized Core Orchestrator for the Hooked Model Design Page.
     * Guaranteed minimal Round-Trip-Time via Promise.all().
     */
    async getDesignPageData(designId: string, userId?: string) {
        // Resolve the actual design first to handle both ID (UUID) and slug queries correctly.
        // This avoids Postgres uuid cast exceptions (22P02) when querying related tables.
        const designData = await this.getDesignById(designId);
        if (!designData) {
            return {
                design: null,
                similarStyles: [],
                similarEmotions: [],
                publicCollections: [],
                hasSaved: false
            };
        }

        const actualUuid = designData.id;

        // Fire & Forget View Tracker (now using actual UUID)
        this.incrementViewCount(actualUuid, userId);

        // Map parallel execution contexts using resolved UUID
        const [similarStyles, similarEmotions, collections] = await Promise.all([
            this.getSimilarDesigns(actualUuid, 5, 0), // Will upgrade to exact style matching in phase 3
            this.getSimilarDesigns(actualUuid, 5, 5), // Mocking offset for emotion until engine expands
            // Placeholder for collection aggregation via RPC
            supabase.from('collections').select('id, name, like_count, user_id, cover_design_id').contains('design_ids', [actualUuid]).limit(3)
        ]);

        return {
            design: designData,
            similarStyles: similarStyles || [],
            similarEmotions: similarEmotions || [],
            publicCollections: collections.data || [],
            hasSaved: false // Derived in client via Provider
        };
    }
};
