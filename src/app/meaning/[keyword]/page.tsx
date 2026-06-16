import { Metadata } from 'next';
import Link from 'next/link';
import { getSupabaseAnon } from '@/lib/supabase-anon';
import GalleryGrid from '@/components/gallery/GalleryGrid';
import { MEANING_FAQS } from '@/lib/meaning-faqs';

export const revalidate = 3600;

const KEYWORDS = [
  "dragon-tattoo", "lotus-tattoo", "snake-tattoo", "rose-tattoo",
  "butterfly-tattoo", "skull-tattoo", "koi-fish-tattoo", "wolf-tattoo",
  "lion-tattoo", "tiger-tattoo", "phoenix-tattoo", "anchor-tattoo",
  "compass-tattoo", "owl-tattoo", "bear-tattoo", "eagle-tattoo",
  "medusa-tattoo", "moon-tattoo", "sun-tattoo", "arrow-tattoo",
  "feather-tattoo", "tree-tattoo", "clock-tattoo", "heart-tattoo",
  "cross-tattoo", "semicolon-tattoo", "infinity-tattoo", "mandala-tattoo"
];

export async function generateStaticParams() {
  return KEYWORDS.map(keyword => ({ keyword }));
}

export async function generateMetadata(props: { params: Promise<{ keyword: string }> }): Promise<Metadata> {
  const { keyword } = await props.params;
  const subject = keyword.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return {
    title: `${subject} Meaning, Symbolism & Designs | TattoosMap`,
    description: `Discover the meaning behind ${subject.toLowerCase()}s. Explore curated ${subject.toLowerCase()} designs, symbolism, placement ideas, and style guides on TattoosMap.`,
    alternates: { canonical: `/meaning/${keyword}` },
    openGraph: {
      title: `${subject} Meaning & Designs`,
      description: `What does a ${subject.toLowerCase()} mean? Explore symbolism, designs, and placement ideas.`,
      type: 'website',
    }
  };
}

export default async function MeaningPage(props: { params: Promise<{ keyword: string }> }) {
  const { keyword } = await props.params;
  const subject = keyword.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  
  const supabase = getSupabaseAnon();
  
  const searchSubject = subject.replace(' Tattoo', '');
  const { data: designs } = await supabase
    .from('designs')
    .select('*')
    .eq('is_published', true)
    .ilike('subject', `%${searchSubject}%`)
    .limit(30);

  const faqs = MEANING_FAQS[keyword] || [
    { q: `What does a ${subject.toLowerCase()} mean?`, a: `The meaning of a ${subject.toLowerCase()} varies by culture and style, but it typically represents unique personal symbolism chosen by the wearer.` },
    { q: `Where is the best placement for a ${subject.toLowerCase()}?`, a: `Popular placements depend on the size and detail of the design. We recommend discussing placement options with a professional artist.` },
    { q: `What style works best for a ${subject.toLowerCase()}?`, a: `Many styles work beautifully, including fine line, traditional, and realism. Browse our gallery to find the style that resonates with you.` }
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };

  return (
    <div className="w-full bg-white pb-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <main className="max-w-[1280px] mx-auto px-4 md:px-6 pt-24">
        <div className="text-center mb-16">
          <h1 className="font-display text-[48px] md:text-[64px] text-black leading-tight tracking-tight mb-6 uppercase">
            {subject} Meaning, Symbolism & Designs
          </h1>
          <p className="text-[18px] text-gray-mid max-w-[800px] mx-auto leading-relaxed">
            Discover the profound symbolism behind {subject.toLowerCase()}s and explore curated design inspiration.
          </p>
        </div>

        {designs && designs.length > 0 ? (
          <div className="mb-24">
            <h2 className="font-mono text-[13px] uppercase tracking-[0.2em] text-brand-red mb-8 border-b border-gray-light pb-4">
              Featured Designs
            </h2>
            <GalleryGrid initialDesigns={designs} />
          </div>
        ) : (
          <div className="mb-24 text-center py-12 border border-gray-light bg-off-white">
            <p className="text-[16px] text-gray-mid mb-4">We are still curating {subject.toLowerCase()} designs for this category.</p>
          </div>
        )}

        <div className="max-w-[800px] mx-auto">
          <h2 className="font-display text-[32px] md:text-[40px] uppercase mb-12 text-center border-b border-gray-light pb-4">
            Frequently Asked Questions
          </h2>
          <div className="space-y-8">
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-gray-light pb-6 last:border-0">
                <h3 className="font-mono text-[14px] uppercase tracking-wide text-black mb-3">
                  {faq.q}
                </h3>
                <p className="text-[16px] text-gray-mid leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-24 text-center">
          <Link href="/gallery" className="inline-flex h-14 px-12 bg-black text-white items-center font-mono text-[14px] uppercase tracking-[0.15em] hover:bg-brand-red transition-colors rounded-none">
            Browse Full Gallery
          </Link>
        </div>
      </main>
    </div>
  );
}
