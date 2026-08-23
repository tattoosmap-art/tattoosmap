import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    // Get the image file
    const imageFile = formData.get('image') as File | null;
    const masterFile = formData.get('master') as File | null;
    const metadataRaw = formData.get('metadata') as string;
    
    if (!imageFile || !metadataRaw) {
      return NextResponse.json({ error: 'Missing image or metadata' }, { status: 400 });
    }
    
    const metadata = JSON.parse(metadataRaw);
    const slug = metadata.slug;
    
    if (!slug) {
      return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
    }
    
    // Upload main design image
    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
    const filename = `${slug}-${Date.now()}.png`;
    
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('designs')
      .upload(filename, imageBuffer, {
        contentType: 'image/png',
        upsert: true
      });
    
    if (uploadError) {
      return NextResponse.json({ error: `Image upload failed: ${uploadError.message}` }, { status: 500 });
    }
    
    const { data: urlData } = supabaseAdmin.storage
      .from('designs')
      .getPublicUrl(uploadData.path);
    
    const imageUrl = urlData.publicUrl;
    
    // Upload master if provided
    let masterUrl = imageUrl;
    if (masterFile) {
      const masterBuffer = Buffer.from(await masterFile.arrayBuffer());
      const masterFilename = `masters/${slug}-${Date.now()}-master.png`;
      
      const { data: masterUpload } = await supabaseAdmin.storage
        .from('designs')
        .upload(masterFilename, masterBuffer, {
          contentType: 'image/png',
          upsert: true
        });
      
      if (masterUpload) {
        const { data: masterUrlData } = supabaseAdmin.storage
          .from('designs')
          .getPublicUrl(masterUpload.path);
        masterUrl = masterUrlData.publicUrl;
      }
    }
    
    // Generate thumbnail
    const thumbBuffer = await sharp(imageBuffer)
      .resize(400, 400, { fit: 'inside' })
      .png({ compressionLevel: 9 })
      .toBuffer();
    
    const thumbFilename = `thumbs/${slug}-${Date.now()}-thumb.png`;
    await supabaseAdmin.storage
      .from('designs')
      .upload(thumbFilename, thumbBuffer, {
        contentType: 'image/png',
        upsert: true
      });
    
    const { data: thumbUrlData } = supabaseAdmin.storage
      .from('designs')
      .getPublicUrl(thumbFilename);
    
    // Insert into database
    const { data: dbData, error: dbError } = await supabaseAdmin
      .from('designs')
      .upsert({
        slug: metadata.slug,
        subject: metadata.subject,
        alt_text: metadata.alt_text,
        speakable_summary: metadata.speakable_summary,
        meaning: metadata.meaning,
        cultural_origin: metadata.cultural_origin,
        style_tags: metadata.style_tags || [],
        placement_recommendations: metadata.placement_recommendations || [],
        emotion_tags: metadata.emotion_tags || [],
        public_category: metadata.public_category || 'minimalist-objects',
        longevity_grade: metadata.longevity_grade,
        technical_notes: metadata.technical_notes || metadata.artist_technical_notes,
        pain_level_map: metadata.pain_level_map,
        aging_prediction: metadata.aging_prediction,
        recommended_needle: metadata.recommended_needle,
        minimum_size_cm: metadata.minimum_size_cm,
        dermographic_score: metadata.dermographic_score || null,
        dermographic_warnings: metadata.dermographic_warnings || [],
        is_tattooable: metadata.is_tattooable ?? true,
        min_size_cm: metadata.min_size_cm || null,
        image_url: imageUrl,
        thumbnail_url: thumbUrlData?.publicUrl || imageUrl,
        master_image_url: masterUrl,
        is_published: true,
        uploaded_at: new Date().toISOString(),
      }, {
        onConflict: 'slug'
      });
    
    if (dbError) {
      return NextResponse.json({ error: `Database insert failed: ${dbError.message}` }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      slug: metadata.slug,
      image_url: imageUrl
    });
    
  } catch (err: any) {
    console.error('Publish API error:', err);
    return NextResponse.json({ 
      error: err.message || 'Unknown publish error' 
    }, { status: 500 });
  }
}
