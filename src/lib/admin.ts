/**
 * admin.ts — Admin role detection.
 * 
 * Add any admin email addresses below. 
 * In production this should be handled via Supabase RLS roles or JWT claims.
 */
export const ADMIN_EMAILS: string[] = [
    "hotosevents@gmail.com",
];

export function isAdmin(email: string | undefined | null): boolean {
    if (!email) return false;
    return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}
