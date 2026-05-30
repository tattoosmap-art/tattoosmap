-- 1. Create the comments table for blog posts
CREATE TABLE IF NOT EXISTS public.blog_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    
    author_name TEXT NOT NULL,
    author_email TEXT, -- For notifications/gravatar (hidden on frontend)
    content TEXT NOT NULL,
    
    parent_id UUID REFERENCES public.blog_comments(id) ON DELETE CASCADE, -- For nesting replies
    
    is_approved BOOLEAN DEFAULT false NOT NULL,
    is_admin_reply BOOLEAN DEFAULT false NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    approved_at TIMESTAMP WITH TIME ZONE
);

-- 2. Create indexing for fast retrieval per post
CREATE INDEX IF NOT EXISTS idx_blog_comments_post_id ON public.blog_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_approved ON public.blog_comments(is_approved);

-- 3. Insert an example seed comment (Optional, for logic validation)
-- Uncomment and execute if desired manually.
