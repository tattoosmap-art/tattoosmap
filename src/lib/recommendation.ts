import { Design } from '@/types/database.types';
import { supabaseAnon as supabase } from '@/lib/supabase-anon';
import { MOCK_DESIGNS } from '@/lib/mock-data';

const isUUID = (str: string) => 
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

/**
 * Safely normalizes dirty database array types (Strings, JSON representations, raw arrays, Postgres formats).
 */
const ensureArray = (val: any): string[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(String);
  if (typeof val === 'string') {
    const trimmed = val.trim();
    // Handle JSON stringified arrays
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? parsed.map(String) : [];
      } catch (e) {}
    }
    // Handle Postgres string-formatted arrays if they slip through
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      return trimmed.slice(1, -1).split(',').map(s => s.trim().replace(/^"|"$/g, ''));
    }
    return [trimmed];
  }
  return [];
};

/**
 * Highly optimized, SQL-safe in-memory Tattoo Recommendation Engine.
 * Runs 100% locally on the server during SSR or API requests.
 * Prevents invalid Postgres UUID type exceptions by parsing both IDs and Slugs safely.
 */
export async function getSimilarDesignsInMemory(
  targetId: string,
  limit: number = 10,
  offset: number = 0,
  mode: string = 'visual'
): Promise<Design[]> {
  try {
    let target: Design | null = null;

    // 1. Fetch the target design safely (UUID vs Slug)
    if (isUUID(targetId)) {
      const { data } = await supabase
        .from('designs')
        .select('*')
        .eq('id', targetId)
        .single();
      target = data as Design | null;
    } else {
      const { data } = await supabase
        .from('designs')
        .select('*')
        .eq('slug', targetId)
        .single();
      target = data as Design | null;
    }

    // Mock ID fallback check (only for local dev mockup parity if database lookup fails)
    if (!target) {
      target = MOCK_DESIGNS.find(d => d.id === targetId || d.slug === targetId) || null;
    }

    if (!target) return [];

    // 2. Fetch candidates pool from the database
    let candidates: Design[] = [];
    let query = supabase
      .from('designs')
      .select('*')
      .eq('is_published', true)
      .is('deleted_at', null);

    // SQL Safety: Only apply the UUID exclusion check if target has a valid UUID
    if (isUUID(target.id)) {
      query = query.neq('id', target.id);
    }

    const { data: dbCandidates } = await query;

    if (dbCandidates && dbCandidates.length > 0) {
      candidates = dbCandidates as Design[];
    } else {
      // Last-resort fallback to mock data only if database is completely empty
      candidates = MOCK_DESIGNS.filter(d => d.id !== target?.id && d.is_published);
    }

    const tStyle = ensureArray(target.style);
    const tBodyPart = ensureArray(target.body_part);
    const tArtist = target.artist_name || '';
    const tCategory = target.public_category || '';
    const tStyleTags = ensureArray(target.style_tags);
    const tEmotionTags = ensureArray(target.emotion_tags);
    const tTags = ensureArray(target.tags || (target as any).elements);

    // 3. Score candidates mathematically
    const scored = candidates.map((d) => {
      let score = 0;

      const dStyle = ensureArray(d.style);
      const dBodyPart = ensureArray(d.body_part);
      const dStyleTags = ensureArray(d.style_tags);
      const dEmotionTags = ensureArray(d.emotion_tags);
      const dTags = ensureArray(d.tags || (d as any).elements);

      if (mode === 'conceptual') {
        if (d.public_category && tCategory && d.public_category === tCategory) score += 15;
        const matchEmotions = dEmotionTags.filter(t => tEmotionTags.includes(t));
        score += matchEmotions.length * 15;
        const matchTags = dTags.filter(t => tTags.includes(t));
        score += matchTags.length * 5;
        const matchStyleTags = dStyleTags.filter(t => tStyleTags.includes(t));
        score += matchStyleTags.length * 3;
      } else {
        if (d.public_category && tCategory && d.public_category === tCategory) score += 15;
        if (d.artist_name && tArtist && d.artist_name === tArtist) score += 5;
        const matchStyles = dStyle.filter(s => tStyle.includes(s));
        score += matchStyles.length * 10;
        const matchStyleTags = dStyleTags.filter(t => tStyleTags.includes(t));
        score += matchStyleTags.length * 8;
        const matchBodyParts = dBodyPart.filter(b => tBodyPart.includes(b));
        score += matchBodyParts.length * 5;
      }

      return { ...d, _score: score };
    });

    // 4. Sort and paginate
    const sorted = scored
      .sort((a, b) => {
        if (b._score !== a._score) return b._score - a._score;
        return new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime();
      })
      .map(({ _score, ...d }) => {
        return {
          ...d,
          style: ensureArray(d.style).length > 0 ? ensureArray(d.style) : [d.public_category].filter(Boolean),
          body_part: ensureArray(d.body_part),
          tags: ensureArray(d.tags || (d as any).elements),
          style_tags: ensureArray(d.style_tags),
          emotion_tags: ensureArray(d.emotion_tags),
        } as Design;
      });

    return sorted.slice(offset, offset + limit);

  } catch (err) {
    console.error('[getSimilarDesignsInMemory] Error:', err);
    // Ultimate local mock fallback
    return MOCK_DESIGNS
      .filter(d => d.id !== targetId)
      .slice(offset, offset + limit);
  }
}
