"use server";

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function getMasterDownloadUrlAction(designSlug: string) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    );
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'hotosevents@gmail.com';
    const isAdmin = user.email === adminEmail;

    if (!isAdmin) {
        return { error: 'Only admins can download master copies for now.' };
    }

    // Get the design to find the seo_filename
    const { data: design } = await supabase
        .from('designs')
        .select('seo_filename')
        .eq('slug', designSlug)
        .single();

    if (!design || !design.seo_filename) {
        return { error: 'Design master file not found.' };
    }

    // Create a signed URL for the private bucket (expires in 1 minute) using supabaseAdmin
    const { data, error } = await supabaseAdmin.storage
        .from('masters')
        .createSignedUrl(design.seo_filename, 60, {
            download: true
        });

    if (error) {
        console.error("Signed URL error:", error.message);
        return { error: 'Failed to generate download link.' };
    }

    return { url: data.signedUrl };
}
