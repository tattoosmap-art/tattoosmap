"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase-server";

// Helper to reliably get authenticated User ID from cookies
async function getServerAuth() {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id;
}

export async function updateUsername(newName: string) {
    const userId = await getServerAuth();
    if (!userId) return { error: "Authentication required" };

    if (!newName || newName.trim().length === 0) {
        return { error: "Username cannot be empty" };
    }

    try {
        const { error } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: userId,
                username: newName.trim(),
                updated_at: new Date().toISOString()
            });

        if (error) {
            if (error.code === '23505') return { error: "Username already taken" };
            throw error;
        }

        revalidatePath('/saved');
        return { success: true };
    } catch (err: any) {
        return { error: err.message };
    }
}

export async function getUserProfile() {
    const userId = await getServerAuth();
    if (!userId) return { data: null };

    const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) return { data: null };
    return { data };
}
