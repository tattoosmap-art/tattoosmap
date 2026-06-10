"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// Create privileged admin client using the service role for trusted moderation operations.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAdminKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseAdminKey);

export type CommentFormState = {
    success: boolean;
    message: string;
};

/**
 * Submit a new comment from a post page.
 * Starts as is_approved = false automatically.
 */
export async function submitCommentAction(prevState: any, formData: FormData): Promise<CommentFormState> {
    const postId = formData.get("post_id") as string;
    const name = formData.get("author_name") as string;
    const email = formData.get("author_email") as string;
    const content = formData.get("content") as string;
    const parentId = formData.get("parent_id") as string; // Can be empty string

    if (!postId || !name || !content) {
        return { success: false, message: "Name and message are required fields." };
    }

    let finalImageUrl = null;
    const imageFile = formData.get("comment_image") as File | null;

    try {
        // Handle binary stream persistence if attachment detected
        if (imageFile && imageFile.size > 0 && imageFile.name) {
            // Validation checks
            if (imageFile.size > 5 * 1024 * 1024) {
                return { success: false, message: "Attachment too large. Limit 5MB." };
            }

            const fileExt = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg';
            if (!['jpg', 'jpeg', 'png', 'webp', 'heic'].includes(fileExt)) {
                return { success: false, message: "Invalid file type. Upload an image (JPG/PNG/WEBP)." };
            }

            const filePath = `${postId}/${Date.now()}-${Math.random().toString(36).slice(-5)}.${fileExt}`;
            
            const { error: uploadError } = await supabaseAdmin
                .storage
                .from("comment-images")
                .upload(filePath, imageFile, {
                    contentType: imageFile.type,
                    cacheControl: '3600'
                });

            if (uploadError) throw new Error(`Upload Fail: ${uploadError.message}`);

            const { data: { publicUrl } } = supabaseAdmin
                .storage
                .from("comment-images")
                .getPublicUrl(filePath);

            finalImageUrl = publicUrl;
        }

        const { error } = await supabaseAdmin
            .from("blog_comments")
            .insert({
                post_id: postId,
                author_name: name.substring(0, 100),
                author_email: email?.substring(0, 100) || null,
                content: content.substring(0, 2000),
                parent_id: parentId || null,
                image_url: finalImageUrl,
                is_approved: false // MODERATION ENABLED BY DEFAULT
            });

        if (error) throw error;

        return { 
            success: true, 
            message: "Thank you! Your comment has been submitted and is awaiting moderation review." 
        };
    } catch (err: any) {
        console.error("SUBMIT_COMMENT_ERROR:", err.message);
        return { success: false, message: "Failed to submit comment. Please try again later." };
    }
}

/**
 * Admin Action: Approve a specific comment.
 */
export async function approveCommentAction(commentId: string) {
    try {
        const { error } = await supabaseAdmin
            .from("blog_comments")
            .update({ 
                is_approved: true,
                approved_at: new Date().toISOString()
            })
            .eq("id", commentId);
            
        if (error) throw error;
        revalidatePath("/admin/comments");
        revalidatePath("/", "layout");
        return { success: true };
    } catch (err: any) {
        console.error("APPROVE_COMMENT_ERROR:", err);
        return { success: false };
    }
}

/**
 * Admin Action: Delete a specific comment.
 */
export async function deleteCommentAction(commentId: string) {
    try {
        const { error } = await supabaseAdmin
            .from("blog_comments")
            .delete()
            .eq("id", commentId);
            
        if (error) throw error;
        revalidatePath("/admin/comments");
        revalidatePath("/", "layout");
        return { success: true };
    } catch (err: any) {
        console.error("DELETE_COMMENT_ERROR:", err);
        return { success: false };
    }
}

export async function fetchAdminCommentsAction() {
    try {
        const { data, error } = await supabaseAdmin
            .from("blog_comments")
            .select(`
                *,
                posts (
                    title,
                    slug
                )
            `)
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        return data || [];
    } catch (err: any) {
        console.error("FETCH_COMMENTS_ERROR:", err);
        return [];
    }
}
