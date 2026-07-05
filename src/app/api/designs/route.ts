import { NextRequest, NextResponse } from 'next/server';
import { designService } from '@/services/designService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const style = searchParams.get('style') || undefined;
    const bodyPart = searchParams.get('body_part') || undefined;
    const gender = searchParams.get('gender') || undefined;
    const sort = searchParams.get('sort') || 'recent';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '24', 10);

    const designs = await designService.getDesigns({
      page,
      limit,
      style,
      placement: bodyPart,
      gender,
      sort,
    });

    return NextResponse.json(designs, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600',
      },
    });
  } catch (err: any) {
    console.error('[api/designs] Error fetching designs:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
