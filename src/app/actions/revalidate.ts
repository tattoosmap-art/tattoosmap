'use server';

import { revalidatePath } from 'next/cache';

/**
 * Full revalidation scope required by TattoosMap 2026 GEO Architecture.
 * Called automatically after CSV upload and Supabase insertion.
 */
export async function revalidateTattoosMap() {
    console.log('[REVALIDATE] Firing full TattoosMap revalidation sweep');
    
    // Core structural resets
    revalidatePath('/');
    revalidatePath('/designs');
    
    // Dynamic routing layouts
    revalidatePath('/category/[slug]', 'layout');
    revalidatePath('/designs/[slug]', 'layout');
    
    return { success: true, timestamp: new Date().toISOString() };
}
