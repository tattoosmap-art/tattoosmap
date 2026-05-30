/**
 * saves.ts — Client-side save persistence using localStorage.
 * 
 * Stores saved design/post IDs per user. This works immediately
 * with mock data IDs. Can be upgraded to Supabase once the designs
 * table is populated with real rows that match the IDs.
 */

const STORAGE_KEY_PREFIX = 'tattoosmap_saves_';

function getKey(userId: string, type: 'designs' | 'posts'): string {
    return `${STORAGE_KEY_PREFIX}${type}_${userId}`;
}

/** Get array of saved design IDs for a user */
export function getSavedDesignIds(userId: string): string[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(getKey(userId, 'designs'));
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

/** Get array of saved post IDs for a user */
export function getSavedPostIds(userId: string): string[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(getKey(userId, 'posts'));
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

/** Toggle a design save. Returns true if now saved, false if removed. */
export function toggleSaveDesign(userId: string, designId: string): boolean {
    const ids = getSavedDesignIds(userId);
    const index = ids.indexOf(designId);

    if (index > -1) {
        ids.splice(index, 1);
        localStorage.setItem(getKey(userId, 'designs'), JSON.stringify(ids));
        return false;
    } else {
        ids.push(designId);
        localStorage.setItem(getKey(userId, 'designs'), JSON.stringify(ids));
        return true;
    }
}

/** Toggle a post save. Returns true if now saved, false if removed. */
export function toggleSavePost(userId: string, postId: string): boolean {
    const ids = getSavedPostIds(userId);
    const index = ids.indexOf(postId);

    if (index > -1) {
        ids.splice(index, 1);
        localStorage.setItem(getKey(userId, 'posts'), JSON.stringify(ids));
        return false;
    } else {
        ids.push(postId);
        localStorage.setItem(getKey(userId, 'posts'), JSON.stringify(ids));
        return true;
    }
}
