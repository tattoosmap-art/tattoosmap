import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabaseAnon } from '@/lib/supabase-anon';
import Link from 'next/link';
import Image from 'next/image';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getMeaningPageData(slug: string) {
  const searchTerm = slug.replace(/-/g, ' ').replace(' tattoo', '').trim();
  const fullTerm = slug.replace(/-/g, ' ');
  
  const { data: designs1 } = await supabaseAnon
    .from('designs')
    .select('id, slug, subject, style, image_url, alt_text, speakable_summary, meaning, cultural_origin, emotion_tags')
    .eq('is_published', true)
    .ilike('subject', `%${searchTerm}%`)
    .limit(24);

  if (designs1 && designs1.length > 0) return designs1;

  const { data: designs2 } = await supabaseAnon
    .from('designs')
    .select('id, slug, subject, style, image_url, alt_text, speakable_summary, meaning, cultural_origin, emotion_tags')
    .eq('is_published', true)
    .ilike('subject', `%${fullTerm}%`)
    .limit(24);

  return designs2 || [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const subject = resolvedParams.slug
    .split('-')
    .filter(w => w !== 'design')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const designs = await getMeaningPageData(resolvedParams.slug);
  const designCount = designs.length;
  const primaryMeaning = designs[0]?.meaning || '';
  const meaningSnippet = primaryMeaning.length > 80 
    ? primaryMeaning.substring(0, 80).trim() + '...' 
    : primaryMeaning;

  return {
    title: `${subject} — Meaning, Symbolism & Designs | TattoosMap`,
    description: meaningSnippet 
      ? `${subject}: ${meaningSnippet} Explore ${designCount} curated designs with pain maps and aging predictions.`
      : `What does a ${subject.toLowerCase()} mean? Explore ${designCount} curated designs with cultural context, placement guides, pain maps, and aging predictions.`,
    alternates: {
      canonical: `https://tattoosmap.com/meaning/${resolvedParams.slug}`,
    },
    openGraph: {
      title: `${subject} — Meaning & Designs | TattoosMap`,
      description: `The symbolism behind ${subject.toLowerCase()} — cultural origins and ${designCount} curated designs with pain maps and aging predictions.`,
    },
  };
}

export default async function MeaningPage({ params }: Props) {
  const { slug } = await params;
  const designs = await getMeaningPageData(slug);
  
  if (designs.length === 0) {
    notFound();
  }

  const subject = slug
    .split('-')
    .filter(w => w !== 'design')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  // Get meaning from first matching design
  const primaryDesign = designs[0];
  const meaning = primaryDesign?.meaning || '';
  const culturalOrigin = primaryDesign?.cultural_origin || '';

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      
      {/* Header */}
      <div className="mb-10">
        <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-3">
          <Link href="/gallery" className="hover:text-black transition-colors">Gallery</Link>
          {' / '}
          <span>{subject}</span>
        </p>
        <h1 className="font-display text-[32px] md:text-[48px] uppercase tracking-tight text-black mb-4">
          {subject}
        </h1>
        <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
          {designs.length} designs — Meaning & Symbolism
        </p>
      </div>

      {/* Meaning Section */}
      {meaning && (
        <div className="mb-12 max-w-3xl">
          <h2 className="font-display text-[20px] uppercase tracking-tight text-black mb-4">
            What {subject}s Mean
          </h2>
          <p className="font-serif text-[18px] leading-[1.7] text-black mb-4">
            {meaning}
          </p>
          {culturalOrigin && (
            <p className="font-serif text-[16px] leading-[1.7] text-neutral-600">
              {culturalOrigin}
            </p>
          )}
        </div>
      )}

      {/* Design Grid */}
      <div className="mb-12">
        <h2 className="font-display text-[20px] uppercase tracking-tight text-black mb-6">
          {subject} Designs
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {designs.map((design) => (
            <Link 
              key={design.id} 
              href={`/gallery/${design.slug}`}
              className="group block"
            >
              <div className="aspect-square bg-neutral-50 overflow-hidden mb-2">
                {design.image_url && (
                  <Image
                    src={design.image_url}
                    alt={design.alt_text || design.subject || subject}
                    width={400}
                    height={400}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
              </div>
              <p className="font-mono text-[9px] uppercase tracking-widest text-neutral-500 line-clamp-2">
                {design.speakable_summary || design.subject}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mb-12 max-w-3xl">
        <h2 className="font-display text-[20px] uppercase tracking-tight text-black mb-6">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-mono text-[11px] uppercase tracking-widest text-black mb-2">
              What does a {subject.toLowerCase()} symbolize?
            </h3>
            <p className="font-serif text-[16px] leading-[1.6] text-neutral-700">
              {meaning || `${subject} tattoos carry rich symbolic meaning rooted in cultural tradition. Browse the designs below — each one includes a detailed meaning guide and cultural origin.`}
            </p>
          </div>
          <div>
            <h3 className="font-mono text-[11px] uppercase tracking-widest text-black mb-2">
              Where is the best placement for a {subject.toLowerCase()}?
            </h3>
            <p className="font-serif text-[16px] leading-[1.6] text-neutral-700">
              Placement depends on the design size and orientation. Vertical designs suit the spine, forearm, or calf. Symmetrical designs suit the chest, back, or thigh. Smaller designs work on the wrist, ankle, or behind the ear. Each design below includes a specific pain map and placement guide with anatomical detail.
            </p>
          </div>
          <div>
            <h3 className="font-mono text-[11px] uppercase tracking-widest text-black mb-2">
              How long does a {subject.toLowerCase()} tattoo last?
            </h3>
            <p className="font-serif text-[16px] leading-[1.6] text-neutral-700">
              Fine line designs soften gradually over 5 to 10 years as delicate details blend into smooth gradients. Bold blackwork holds its structure for 15 to 20 years with proper care. Apply SPF 50 daily to tattooed skin exposed to sunlight — UV exposure is the primary cause of tattoo fading regardless of style or ink quality.
            </p>
          </div>
          <div>
            <h3 className="font-mono text-[11px] uppercase tracking-widest text-black mb-2">
              Is a {subject.toLowerCase()} a good first tattoo?
            </h3>
            <p className="font-serif text-[16px] leading-[1.6] text-neutral-700">
              It depends on the specific design and placement. Simpler versions in low-pain placements like the upper arm or thigh make excellent first tattoos. More complex designs with fine detail work better once you understand how your skin heals. Each design below shows the minimum recommended size and technique complexity so you can judge what suits your experience level.
            </p>
          </div>
          <div>
            <h3 className="font-mono text-[11px] uppercase tracking-widest text-black mb-2">
              How much does a {subject.toLowerCase()} tattoo cost?
            </h3>
            <p className="font-serif text-[16px] leading-[1.6] text-neutral-700">
              Cost depends on size, complexity, and your artist's hourly rate. Simple designs under 10cm typically run $100 to $300. Larger, more detailed pieces range from $300 to $800 or more. Fine line work often costs more per hour than bold traditional styles because it requires greater technical precision and takes longer per square centimetre of coverage.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="border border-black p-8 text-center">
        <p className="font-display text-[24px] uppercase tracking-tight text-black mb-2">
          Find Your {subject} Design
        </p>
        <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-6">
          Browse {designs.length} curated designs with pain maps and aging predictions
        </p>
        <Link 
          href="/gallery"
          className="inline-block bg-black text-white font-mono text-[10px] uppercase tracking-widest px-8 py-3 hover:bg-neutral-800 transition-colors"
        >
          Browse Gallery
        </Link>
      </div>

    </main>
  );
}

export const revalidate = 3600;
