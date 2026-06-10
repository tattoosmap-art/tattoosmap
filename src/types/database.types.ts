export interface Author {
    id: string;
    name: string;
    avatar_url: string;
    bio: string;
}

export interface Post {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    body_content: string;
    cover_image_url: string;
    cover_image_alt: string;
    author_id: string;
    author?: Author;
    category: string;
    tags: string[];
    published_at: string;
    is_published: boolean;
    read_time_minutes: number;
    created_at: string;
    deleted_at: string | null;
    
    // New SEO Fields
    focus_keyword?: string | null;
    meta_title?: string | null;
    meta_description?: string | null;
    schema_type?: 'Article' | 'HowTo' | 'FAQPage';
    related_designs?: any[]; // JSONB array of designs
    related_products?: any[]; // JSONB array of products
    post_intent?: 'RECOMMEND AND SELL' | 'INFORM AND REFER' | null;
    protocol_steps?: any[];
    avoid_items?: any[];
    faq_items?: any[];
    pull_quote?: string | null;
    science_heading?: string | null;
    science_content?: string | null;
    selected_tool?: string | null;
    tool_position?: string | null;
    tool_markers?: any[] | null;
    visual_steps?: any[] | null;
    post_template_type?: 'STANDARD' | 'VISUAL STEP GUIDE' | null;
}

export interface Design {
    id: string;
    slug: string;
    title: string | null;
    image_url: string;
    image_blurhash: string;
    image_width: number;
    image_height: number;
    alt_text: string;
    style: string[];
    body_part: string[];
    gender_suitability: string | null;
    gender?: string | null;
    artist_name: string;
    artist_instagram: string;
    tags: string[];
    
    // New Hooked Model Metadata
    subject?: string | null;
    public_category?: string | null;
    meaning?: string | null;
    cultural_origin?: string | null;
    cultural_sensitivity?: string | null;
    artist_technical_notes?: string | null;
    recommended_needle?: string | null;
    minimum_size_cm?: number | null;
    placement_recommendations?: string[];
    aging_prediction?: string | null;
    pain_level_map?: any | null; // JSONB
    style_tags?: string[];
    emotion_tags?: string[];
    speakable_summary?: string | null;

    // New SEO Fields
    meta_title?: string | null;
    meta_description?: string | null;
    focus_keyword?: string | null;

    // Dual-AI Pipeline Images
    image_shaded_url?: string | null;
    image_fresh_url?: string | null;
    image_healed_url?: string | null;

    // Generative Engine Optimization (SGE) Fields
    sge_snippet?: string | null;
    semantic_entities?: any[] | null;
    conversational_faqs?: any[] | null;

    save_count: number;
    view_count: number;
    real_save_count?: number;
    real_view_count?: number;
    is_published: boolean;
    uploaded_at: string;
    deleted_at: string | null;
}

export interface Profile {
    id: string;
    username: string | null;
    avatar_url: string | null;
    collection_count: number;
    total_collection_likes: number;
    updated_at: string;
}

export interface Collection {
    id: string;
    user_id: string;
    name: string;
    description: string | null;
    is_public: boolean;
    like_count: number;
    design_ids: string[];
    cover_design_id: string | null;
    created_at: string;
    updated_at: string;
}

export interface DesignView {
    id: string;
    design_id: string;
    user_id: string | null;
    viewed_at: string;
}
