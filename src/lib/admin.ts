/**
 * admin.ts — Admin role detection.
 * 
 * Add any admin email addresses below. 
 * In production this should be handled via Supabase RLS roles or JWT claims.
 */
export const ADMIN_EMAILS: string[] = [
    "hotosevents@gmail.com",
];

/**
 * STUDIO_EMAILS — restricted access users.
 * These users can ONLY access the SEO Studio (Design Studio) page.
 * They see: Your Archive, Design Studio, Sign Out — nothing else.
 */
export const STUDIO_EMAILS: string[] = [
    "itaffati224@gmail.com",
];

export function isAdmin(email: string | undefined | null): boolean {
    if (!email) return false;
    return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

export function isStudio(email: string | undefined | null): boolean {
    if (!email) return false;
    return STUDIO_EMAILS.includes(email.toLowerCase().trim());
}

export function hasStudioAccess(email: string | undefined | null): boolean {
    return isAdmin(email) || isStudio(email);
}
