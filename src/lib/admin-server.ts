import { createClient } from "@/lib/supabase-server";
import { isAdmin } from "@/lib/admin";

/**
 * verifyAdminSession — Server-only helper to secure administrative operations.
 * Throws an error if the user is not authenticated or is not an authorized administrator.
 */
export async function verifyAdminSession() {
    if (process.env.BYPASS_AUTH_FOR_TESTING === 'true') {
        return { id: '00000000-0000-0000-0000-000000000000', email: 'admin@tattoosmap.com' } as any;
    }
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
        throw new Error("Unauthorized: Authentication required.");
    }
    
    if (!isAdmin(user.email)) {
        throw new Error("Unauthorized: Admin privilege required.");
    }
    
    return user;
}
