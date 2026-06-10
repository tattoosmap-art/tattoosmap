"use server";

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export type DownloadResult = {
    success: boolean;
    reason?: 'unauthorized' | 'limit_reached' | 'error';
    remaining?: number;
};

export async function trackDownloadAction(designSlug: string): Promise<DownloadResult> {
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

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, reason: 'unauthorized' };
    }

    // Admin bypass (assuming admin email is configured)
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'hotosevents@gmail.com';
    const isAdmin = user.email === adminEmail;

    if (isAdmin) {
        return { success: true, remaining: 999 };
    }

    // 2. Check today's download count
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const { count, error: countError } = await supabase
        .from('user_downloads')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('downloaded_at', startOfToday.toISOString());

    if (countError) {
        console.error("Error checking download count:", countError);
        return { success: false, reason: 'error' };
    }

    const currentCount = count || 0;
    const LIMIT = 5;

    if (currentCount >= LIMIT) {
        return { success: false, reason: 'limit_reached', remaining: 0 };
    }

    // 3. Log the download
    const { error: logError } = await supabase
        .from('user_downloads')
        .insert({
            user_id: user.id,
            design_id: designSlug
        });

    if (logError) {
        console.error("Error logging download:", logError);
        return { success: false, reason: 'error' };
    }

    return { success: true, remaining: LIMIT - currentCount - 1 };
}
