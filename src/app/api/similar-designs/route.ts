import { NextRequest, NextResponse } from 'next/server';
import { getSimilarDesignsInMemory } from '@/lib/recommendation';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const targetId = searchParams.get('targetId');
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const mode = searchParams.get('mode') || 'visual'; // 'visual' | 'conceptual'

    if (!targetId) {
      return NextResponse.json({ error: 'Missing targetId parameter' }, { status: 400 });
    }

    const paginated = await getSimilarDesignsInMemory(targetId, limit, offset, mode);
    return NextResponse.json(paginated);

  } catch (err: any) {
    console.error('[similar-designs] API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
