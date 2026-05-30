import { NextRequest, NextResponse } from 'next/server';
import { generateMockupsForDesign } from '@/lib/mockup-generator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { designImageUrl, bestPlacement, slug } = body;
    if (!designImageUrl || !slug) {
      return NextResponse.json({ error: 'Missing designImageUrl or slug' }, { status: 400 });
    }

    const { freshUrl, healedUrl } = await generateMockupsForDesign(designImageUrl, bestPlacement, slug);
    return NextResponse.json({ success: true, freshUrl, healedUrl });

  } catch (err: any) {
    console.error('[generate-mockup] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
