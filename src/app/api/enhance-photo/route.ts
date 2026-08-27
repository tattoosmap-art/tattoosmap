import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

type FilterType = 'studio' | 'blackwork' | 'colourpop' | 'dark' | 'clean';

async function applyFilter(buffer: Buffer, filter: FilterType): Promise<Buffer> {
  const base = sharp(buffer)
    .resize(1080, 1350, { fit: 'cover', position: 'center' })
    .flatten({ background: '#ffffff' });

  switch (filter) {
    case 'studio':
      return base
        .normalise()
        .modulate({ brightness: 1.05, saturation: 1.25 })
        .linear(1.3, -15)
        .sharpen({ sigma: 0.8, m1: 1.5, m2: 0.5 })
        .toColorspace('srgb')
        .jpeg({ quality: 90, progressive: true })
        .toBuffer();

    case 'blackwork':
      return base
        .grayscale()
        .normalise()
        .linear(1.8, -40)
        .sharpen({ sigma: 1.2, m1: 2.0, m2: 0.8 })
        .toColorspace('srgb')
        .jpeg({ quality: 92, progressive: true })
        .toBuffer();

    case 'colourpop':
      return base
        .normalise()
        .modulate({ brightness: 1.03, saturation: 1.7, hue: 0 })
        .linear(1.2, -10)
        .sharpen({ sigma: 0.6, m1: 1.2 })
        .toColorspace('srgb')
        .jpeg({ quality: 90, progressive: true })
        .toBuffer();

    case 'dark':
      return base
        .normalise()
        .modulate({ brightness: 0.90, saturation: 1.35 })
        .linear(1.6, -35)
        .sharpen({ sigma: 0.7, m1: 1.3 })
        .toColorspace('srgb')
        .jpeg({ quality: 90, progressive: true })
        .toBuffer();

    case 'clean':
      return base
        .normalise()
        .modulate({ brightness: 1.08, saturation: 1.05 })
        .linear(1.1, -5)
        .sharpen({ sigma: 0.5, m1: 0.8 })
        .toColorspace('srgb')
        .jpeg({ quality: 92, progressive: true })
        .toBuffer();

    default:
      return base
        .normalise()
        .toColorspace('srgb')
        .jpeg({ quality: 90 })
        .toBuffer();
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get('image') as File | null;
    const filter = (formData.get('filter') as FilterType) || 'studio';

    if (!imageFile) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
    const enhanced = await applyFilter(imageBuffer, filter);

    return NextResponse.json({
      enhanced_base64: enhanced.toString('base64'),
      success: true,
    });

  } catch (err: any) {
    console.error('Enhancement error:', err);
    return NextResponse.json({
      error: err.message || 'Enhancement failed'
    }, { status: 500 });
  }
}
