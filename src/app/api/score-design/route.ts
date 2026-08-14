import { NextResponse } from 'next/server';
import { analyzeDermographicScore } from '@/lib/dermographic-scorer';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const base64Image = formData.get('base64Image') as string | null;
        let file = formData.get('file') as File | null;

        let buffer: Buffer;
        if (base64Image) {
            buffer = Buffer.from(base64Image, 'base64');
        } else if (file) {
            buffer = Buffer.from(await file.arrayBuffer());
        } else {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 });
        }

        const report = await analyzeDermographicScore(buffer);

        return NextResponse.json(report);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
