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
  const { slug } = await params;
  const subject = slug
    .split('-')
    .filter(w => w !== 'design')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return {
    title: `${subject} — Meaning, Symbolism & Designs | TattoosMap`,
    description: `Discover the meaning and symbolism behind ${subject.toLowerCase()}. Browse curated designs with cultural context, placement guides, and aging predictions.`,
    alternates: {
      canonical: `https://tattoosmap.com/meaning/${slug}`,
    },
    openGraph: {
      title: `${subject} — Meaning & Designs | TattoosMap`,
      description: `The meaning behind ${subject.toLowerCase()} — cultural origins, symbolism, and curated designs.`,
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
            What {subject} Mean
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
              {meaning || `${subject} tattoos carry deep symbolic meaning rooted in cultural tradition. Each design on TattoosMap includes a detailed meaning guide, cultural origin, and placement recommendations.`}
            </p>
          </div>
          <div>
            <h3 className="font-mono text-[11px] uppercase tracking-widest text-black mb-2">
              Where is the best placement for a {subject.toLowerCase()}?
            </h3>
            <p className="font-serif text-[16px] leading-[1.6] text-neutral-700">
              Placement depends on the size and style of your specific design. Each design on TattoosMap includes a pain map and placement recommendations based on the design's visual weight and detail level.
            </p>
          </div>
          <div>
            <h3 className="font-mono text-[11px] uppercase tracking-widest text-black mb-2">
              How long does a {subject.toLowerCase()} last?
            </h3>
            <p className="font-serif text-[16px] leading-[1.6] text-neutral-700">
              Longevity depends on placement, sun exposure, and ink colours used. Each design on TattoosMap includes a longevity prediction showing how the specific design ages over 5 years.
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
