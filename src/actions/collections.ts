"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase-server";
import { designService } from "@/services/designService";
import { Design } from "@/types/database.types";

// Helper to reliably get authenticated User ID from cookies
async function getServerAuth() {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id;
}

export async function createCollection(name: string, description: string | null, isPublic: boolean, coverDesignId: string | null) {
    const userId = await getServerAuth();
    if (!userId) return { error: "You must be logged in to create a collection." };

    try {
        const { data, error } = await supabaseAdmin.from('collections').insert({
            user_id: userId,
            name,
            description,
            is_public: isPublic,
            cover_design_id: coverDesignId,
        }).select('id').single();

        if (error) throw error;
        
        revalidatePath('/dashboard/collections');
        return { success: true, collectionId: data.id };
    } catch (err: any) {
        return { error: err.message };
    }
}

export async function getUserCollections() {
    const userId = await getServerAuth();
    if (!userId) return { data: null };

    const { data, error } = await supabaseAdmin
        .from('collections')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

    if (error) return { data: null };
    return { data };
}

export async function saveDesignToCollection(collectionId: string, designId: string) {
    const userId = await getServerAuth();
    if (!userId) return { error: "Authentication required" };

    try {
        // 1. Verify Ownership & Get Current Array
        const { data: collection, error: colError } = await supabaseAdmin
            .from('collections')
            .select('user_id, design_ids')
            .eq('id', collectionId)
            .single();

        if (colError || collection.user_id !== userId) {
            return { error: "Unauthorized or collection not found" };
        }

        const designIds = collection.design_ids || [];
        if (designIds.includes(designId)) {
            return { message: "Already in collection" };
        }

        // 2. Update Collection
        const newIds = [designId, ...designIds];
        const updatePayload: any = { design_ids: newIds, updated_at: new Date().toISOString() };
        
        // Use first design as cover if none exists
        if (newIds.length === 1) {
            updatePayload.cover_design_id = designId;
        }

        const { error: updateError } = await supabaseAdmin
            .from('collections')
            .update(updatePayload)
            .eq('id', collectionId);

        if (updateError) throw updateError;

        // 3. Increment Save Count on Design Table
        const { data: design } = await supabaseAdmin.from('designs').select('save_count').eq('id', designId).single();
        if (design) {
            await supabaseAdmin.from('designs').update({ save_count: (design.save_count || 0) + 1 }).eq('id', designId);
        }

        // Revalidate Cache
        revalidatePath(`/gallery/${designId}`);
        revalidatePath(`/dashboard/collections`);
        
        return { success: true };
    } catch (err: any) {
        return { error: err.message };
    }
}

export async function toggleCollectionLike(collectionId: string) {
    const userId = await getServerAuth();
    if (!userId) return { error: "Authentication required" };

    try {
        // Toggle logic (insert or delete from collection_likes)
        const { data: existing } = await supabaseAdmin
            .from('collection_likes')
            .select('id')
            .eq('collection_id', collectionId)
            .eq('user_id', userId)
            .single();

        if (existing) {
            // Unlike
            await supabaseAdmin.from('collection_likes').delete().eq('id', existing.id);
            // Decrement RPC or manual
            const { data } = await supabaseAdmin.from('collections').select('like_count').eq('id', collectionId).single();
            if (data && data.like_count > 0) {
                await supabaseAdmin.from('collections').update({ like_count: data.like_count - 1 }).eq('id', collectionId);
            }
            revalidatePath(`/collections/${collectionId}`);
            return { success: true, action: 'unliked' };
        } else {
            // Like
            await supabaseAdmin.from('collection_likes').insert({ collection_id: collectionId, user_id: userId });
            const { data } = await supabaseAdmin.from('collections').select('like_count').eq('id', collectionId).single();
            await supabaseAdmin.from('collections').update({ like_count: (data?.like_count || 0) + 1 }).eq('id', collectionId);
            revalidatePath(`/collections/${collectionId}`);
            return { success: true, action: 'liked' };
        }
    } catch (err: any) {
        return { error: err.message };
    }
}

export async function updateCollection(id: string, name: string) {
    const userId = await getServerAuth();
    if (!userId) return { error: "Authentication required" };

    try {
        const { error } = await supabaseAdmin
            .from('collections')
            .update({ name: name.trim(), updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('user_id', userId);

        if (error) throw error;
        revalidatePath('/saved');
        return { success: true };
    } catch (err: any) {
        return { error: err.message };
    }
}

export async function deleteCollection(id: string) {
    const userId = await getServerAuth();
    if (!userId) return { error: "Authentication required" };

    try {
        const { error } = await supabaseAdmin
            .from('collections')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) throw error;
        revalidatePath('/saved');
        return { success: true };
    } catch (err: any) {
        return { error: err.message };
    }
}

export async function removeDesignFromCollection(collectionId: string, designId: string) {
    const userId = await getServerAuth();
    if (!userId) return { error: "Authentication required" };

    try {
        // 1. Verify Ownership & Get Current Array
        const { data: collection, error: colError } = await supabaseAdmin
            .from('collections')
            .select('user_id, design_ids')
            .eq('id', collectionId)
            .single();

        if (colError || collection.user_id !== userId) {
            return { error: "Unauthorized or collection not found" };
        }

        const designIds = collection.design_ids || [];
        const newIds = designIds.filter((dId: string) => dId !== designId);

        // 2. Update Collection
        const { error: updateError } = await supabaseAdmin
            .from('collections')
            .update({ design_ids: newIds, updated_at: new Date().toISOString() })
            .eq('id', collectionId);

        if (updateError) throw updateError;

        // 3. Decrement Save Count on Design Table
        const { data: design } = await supabaseAdmin.from('designs').select('save_count').eq('id', designId).single();
        if (design && (design.save_count || 0) > 0) {
            await supabaseAdmin.from('designs').update({ save_count: (design.save_count || 0) - 1 }).eq('id', designId);
        }

        revalidatePath(`/collections/${collectionId}`);
        revalidatePath('/saved');
        return { success: true };
    } catch (err: any) {
        return { error: err.message };
    }
}

export async function checkIsSaved(designId: string) {
    const userId = await getServerAuth();
    if (!userId) return { isSaved: false };

    try {
        const { data: defaultCol } = await supabaseAdmin
            .from('collections')
            .select('design_ids')
            .eq('user_id', userId)
            .eq('name', 'Saved Designs')
            .single();

        if (!defaultCol) return { isSaved: false };
        return { isSaved: (defaultCol.design_ids || []).includes(designId) };
    } catch (e) {
        return { isSaved: false };
    }
}

export async function toggleDefaultSave(designId: string) {
    const userId = await getServerAuth();
    if (!userId) return { error: "Authentication required" };

    try {
        let { data: defaultCol } = await supabaseAdmin
            .from('collections')
            .select('id, design_ids')
            .eq('user_id', userId)
            .eq('name', 'Saved Designs')
            .single();

        if (!defaultCol) {
            const { data: newCol, error: createError } = await supabaseAdmin.from('collections').insert({
                user_id: userId,
                name: 'Saved Designs',
                description: 'Your automatically saved designs.',
                is_public: false,
                cover_design_id: designId,
                design_ids: []
            }).select('id, design_ids').single();

            if (createError) throw createError;
            defaultCol = newCol;
        }

        const designIds = defaultCol.design_ids || [];
        const isSaved = designIds.includes(designId);

        let newIds;
        let saveCountModifier = 0;
        
        if (isSaved) {
            newIds = designIds.filter((id: string) => id !== designId);
            saveCountModifier = -1;
        } else {
            newIds = [designId, ...designIds];
            saveCountModifier = 1;
        }

        const updatePayload: any = { design_ids: newIds, updated_at: new Date().toISOString() };
        if (newIds.length > 0 && !isSaved) {
            updatePayload.cover_design_id = designId;
        } else if (newIds.length === 0) {
            updatePayload.cover_design_id = null;
        }

        await supabaseAdmin.from('collections').update(updatePayload).eq('id', defaultCol.id);

        if (saveCountModifier !== 0) {
            const { data: design } = await supabaseAdmin.from('designs').select('save_count').eq('id', designId).single();
            if (design) {
                await supabaseAdmin.from('designs').update({ save_count: Math.max(0, (design.save_count || 0) + saveCountModifier) }).eq('id', designId);
            }
        }

        revalidatePath(`/gallery/${designId}`);
        revalidatePath('/saved');
        
        return { success: true, isSaved: !isSaved };
    } catch (err: any) {
        return { error: err.message };
    }
}

export async function getSavedDesignsForUser() {
    const userId = await getServerAuth();
    if (!userId) return { data: [] };

    try {
        // 1. Get all collections for this user
        const { data: collections, error } = await supabaseAdmin
            .from('collections')
            .select('design_ids')
            .eq('user_id', userId);

        if (error || !collections) return { data: [] };

        // 2. Combine all design_ids uniquely
        const allIds = new Set<string>();
        collections.forEach(col => {
            if (col.design_ids && Array.isArray(col.design_ids)) {
                col.design_ids.forEach((id: string) => {
                    if (id) allIds.add(id);
                });
            }
        });

        const uniqueIds = Array.from(allIds);
        if (uniqueIds.length === 0) return { data: [] };

        // 3. Resolve to design objects
        const designPromises = uniqueIds.map((dId: string) => designService.getDesignById(dId));
        const resolved = await Promise.all(designPromises);
        const designs = resolved.filter(Boolean) as Design[];

        return { data: designs };
    } catch (err) {
        console.error("Error getting saved designs:", err);
        return { data: [] };
    }
}

export async function unsaveDesign(designId: string) {
    const userId = await getServerAuth();
    if (!userId) return { error: "Authentication required" };

    try {
        // 1. Get all collections for this user
        const { data: collections, error } = await supabaseAdmin
            .from('collections')
            .select('id, design_ids')
            .eq('user_id', userId);

        if (error || !collections) return { error: "Could not fetch collections" };

        let anyUpdated = false;

        // 2. Filter designId from each collection
        for (const col of collections) {
            const designIds = col.design_ids || [];
            if (designIds.includes(designId)) {
                const newIds = designIds.filter((id: string) => id !== designId);
                
                const updatePayload: any = { design_ids: newIds, updated_at: new Date().toISOString() };
                // Update cover design if needed
                if (newIds.length === 0) {
                    updatePayload.cover_design_id = null;
                }
                
                await supabaseAdmin
                    .from('collections')
                    .update(updatePayload)
                    .eq('id', col.id);
                
                anyUpdated = true;
            }
        }

        // 3. Decrement save count if we removed it
        if (anyUpdated) {
            const { data: design } = await supabaseAdmin.from('designs').select('save_count').eq('id', designId).single();
            if (design) {
                await supabaseAdmin.from('designs').update({ save_count: Math.max(0, (design.save_count || 0) - 1) }).eq('id', designId);
            }
        }

        revalidatePath(`/gallery/${designId}`);
        revalidatePath('/saved');

        return { success: true };
    } catch (err: any) {
        return { error: err.message };
    }
}
