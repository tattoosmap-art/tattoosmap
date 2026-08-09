import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabaseAnon } from '@/lib/supabase-anon';
import Link from 'next/link';
import Image from 'next/image';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getMeaningPageData(slug: string) {
  const searchTerm = slug.replace(/-/g, ' ').replace(' tattoo', '').replace(' tattoos', '').trim();
  const fullTerm = slug.replace(/-/g, ' ');

  // Strategy 1: Search by subject containing the core term
  const { data: designs1 } = await supabaseAnon
    .from('designs')
    .select('id, slug, subject, style, image_url, alt_text, speakable_summary, meaning, cultural_origin, emotion_tags, style_tags')
    .eq('is_published', true)
    .ilike('subject', `%${searchTerm}%`)
    .limit(24);

  if (designs1 && designs1.length >= 5) return designs1;

  // Strategy 2: Search by style_tags array containing the term
  const { data: designs2 } = await supabaseAnon
    .from('designs')
    .select('id, slug, subject, style, image_url, alt_text, speakable_summary, meaning, cultural_origin, emotion_tags, style_tags')
    .eq('is_published', true)
    .contains('style_tags', [searchTerm])
    .limit(24);

  if (designs2 && designs2.length >= 5) return designs2;

  // Strategy 3: Search style_tags with full term
  const { data: designs3 } = await supabaseAnon
    .from('designs')
    .select('id, slug, subject, style, image_url, alt_text, speakable_summary, meaning, cultural_origin, emotion_tags, style_tags')
    .eq('is_published', true)
    .contains('style_tags', [fullTerm])
    .limit(24);

  if (designs3 && designs3.length >= 5) return designs3;

  // Strategy 4: Combine results from subject AND style search
  const subjectSlugs = new Set((designs1 || []).map((d: any) => d.slug));
  const combined = [
    ...(designs1 || []),
    ...(designs2 || []).filter((d: any) => !subjectSlugs.has(d.slug)),
    ...(designs3 || []).filter((d: any) => !subjectSlugs.has(d.slug)),
  ];

  if (combined.length > 0) return combined.slice(0, 24);

  // Strategy 5: Fallback — search full slug term in subject
  const { data: designs5 } = await supabaseAnon
    .from('designs')
    .select('id, slug, subject, style, image_url, alt_text, speakable_summary, meaning, cultural_origin, emotion_tags, style_tags')
    .eq('is_published', true)
    .ilike('subject', `%${fullTerm}%`)
    .limit(24);

  return designs5 || [];
}

const CUSTOM_TITLES: Record<string, { title: string; h1: string; answer: string }> = {
  'medusa-tattoo': {
    title: 'Medusa Tattoo Meaning — What She Really Represents',
    h1: 'Medusa Tattoo — Meaning, Symbolism & Designs',
    answer: 'The Medusa tattoo represents survival, protection, and reclaiming power after trauma. In contemporary culture it has become a widely recognised symbol among survivors of assault — transforming a figure of ancient punishment into a modern emblem of resilience and personal strength.'
  },
  'semicolon-tattoo': {
    title: 'Semicolon Tattoo — The Meaning Behind the Mark',
    h1: 'Semicolon Tattoo — Meaning & Designs',
    answer: 'The semicolon tattoo represents the choice to continue — a punctuation mark used when an author could have ended a sentence but chose not to. Adopted by the mental health community, it marks survival of depression, anxiety, addiction, and suicidal ideation. A small mark that carries an enormous weight.'
  },
  'butterfly-tattoo': {
    title: 'Butterfly Tattoo Meaning — More Than You Think',
    h1: 'Butterfly Tattoo — Meaning, Symbolism & Designs',
    answer: 'The butterfly tattoo represents transformation, rebirth, and the passage through difficulty into a new version of yourself. Across cultures it marks metamorphosis — the Japanese see it as the soul, the Aztecs as the spirit of fallen warriors, and contemporary wearers as a marker of personal reinvention after hardship.'
  },
  'lotus-tattoo': {
    title: 'Lotus Tattoo Meaning — The Full Cultural Story',
    h1: 'Lotus Flower Tattoo — Meaning & Designs',
    answer: 'The lotus tattoo represents purity, spiritual awakening, and beauty emerging from darkness — the flower grows from muddy water yet blooms clean above the surface. In Buddhism it marks enlightenment and the journey from suffering to clarity. In Hinduism it symbolises divine beauty and the unfolding of the soul.'
  },
  'snake-tattoo': {
    title: 'Snake Tattoo Meaning — Why Every Culture Uses It',
    h1: 'Snake Tattoo — Meaning, Symbolism & Designs',
    answer: 'The snake tattoo is one of the most universally used symbols in human history — appearing across every major culture with meanings that span duality itself. In ancient Greece it represented healing and medicine. In Japan it symbolised protection and good fortune. In Western tradition it carries danger and temptation. The same image, radically different meanings.'
  },
  'dragon-tattoo': {
    title: 'Dragon Tattoo Meaning — East vs West Explained',
    h1: 'Dragon Tattoo — Meaning, Symbolism & Designs',
    answer: 'The dragon tattoo means something fundamentally different depending on its origin. Eastern dragons represent wisdom, protection, and divine power — benevolent forces that bring rain and prosperity. Western dragons represent danger, greed, and chaos — forces to be conquered. Which dragon you choose tells the story you want to carry.'
  },
  'skull-tattoo': {
    title: 'Skull Tattoo Meaning — Not What Most People Think',
    h1: 'Skull Tattoo — Meaning, Symbolism & Designs',
    answer: 'The skull tattoo rarely means what outsiders assume. Most wearers do not choose it for shock value — they choose it as a memento mori, a reminder that life is finite and therefore worth living fully. Across cultures the skull marks mortality, transformation, and the refusal to live in fear of death.'
  },
  'watercolor-tattoo': {
    title: 'Watercolor Tattoo — Do They Age Well? Full Guide',
    h1: 'Watercolor Tattoo — Designs & Style Guide',
    answer: 'Watercolor tattoos age faster than traditional styles because they rely on soft gradients and minimal outlines — the elements that give them their distinctive look are also what cause them to blur and fade first. Done well with deliberate linework as a foundation, they can hold for a decade. Done without structure, they soften significantly within three to five years.'
  },
  'memento-mori-tattoo': {
    title: 'Memento Mori Tattoo — What It Actually Means',
    h1: 'Memento Mori Tattoo — Meaning & Designs',
    answer: 'Memento mori is Latin for "remember you will die." The tattoo is not a morbid statement — it is a philosophical one rooted in Stoic tradition, used as a daily reminder that mortality gives life its urgency and meaning. The skull, the hourglass, the wilting flower — all say the same thing: time is finite, use it deliberately.'
  },
  'hand-tattoos': {
    title: 'Hand Tattoos — Pain Level, Designs & What to Know',
    h1: 'Hand Tattoos — Designs, Pain Map & Placement Guide',
    answer: 'Hand tattoos are among the most visible placements and among the most demanding to heal. The skin over knuckles and fingers fades faster than almost anywhere else on the body — thin skin over bone, constant movement, and frequent washing all accelerate ink breakdown. What you gain in visibility, you give back in longevity and maintenance.'
  },
  'forearm-tattoos': {
    title: 'Forearm Tattoos — Inner vs Outer Arm Explained',
    h1: 'Forearm Tattoos — Designs & Placement Guide',
    answer: 'The forearm offers two distinct canvases with different pain profiles and visibility. The outer forearm has thicker skin over muscle — lower pain, better ink retention, always visible. The inner forearm has thinner skin over veins — higher sensitivity, excellent for fine detail, visible only when you choose to show it. Most artists recommend starting outer.'
  },
  'sternum-tattoo': {
    title: 'Sternum Tattoo — How Much Does It Hurt, Really?',
    h1: 'Sternum Tattoo — Designs & Pain Guide',
    answer: 'The sternum is genuinely one of the most painful tattoo placements — thin skin directly over bone with no muscle buffer, combined with vibration that resonates through the chest cavity. Most people rate it 7 to 8 out of 10. The pain is intense but manageable in shorter sessions. The placement rewards the commitment with some of the most striking tattoos possible.'
  },
  'spine-tattoos': {
    title: 'Spine Tattoos — Pain, Placement & Design Guide',
    h1: 'Spine Tattoos — Designs & Placement Guide',
    answer: 'The spine tattoos run along one of the most sensitive columns in the body — the vertebrae sit close to the surface with minimal tissue buffer, and the needle vibration conducts directly through bone. Most describe it as 7 to 9 out of 10. The visual payoff is significant: vertical designs here have a natural flow that no other placement replicates.'
  },
  'neck-tattoos': {
    title: 'Neck Tattoos — What to Know Before You Commit',
    h1: 'Neck Tattoos — Designs, Pain Map & Ideas',
    answer: 'Neck tattoos are considered a commitment tattoo — visible in almost every professional setting and difficult to conceal. The back of the neck is the most popular placement and the least painful. The sides of the neck are significantly more sensitive. The throat is the highest pain placement on the neck and the most visible. Understand the permanence before proceeding.'
  },
  'virgin-mary-tattoo': {
    title: 'Virgin Mary Tattoo — Meaning & Symbolism',
    h1: 'Virgin Mary Tattoo — Meaning, Designs & Symbolism',
    answer: 'The Virgin Mary tattoo represents protection, maternal love, grace, and divine intercession. Rooted in Catholic and Latin American tradition, she appears as a guardian figure — the Mater Dolorosa who understands suffering, the Our Lady of Guadalupe who protects, and the Immaculate Conception who represents purity and hope.'
  },
};

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

  const custom = CUSTOM_TITLES[resolvedParams.slug];
  const title = custom?.title 
    ? `${custom.title} | TattoosMap`
    : `${subject} — Meaning, Symbolism & Designs | TattoosMap`;

  return {
    title,
    description: meaningSnippet 
      ? `${subject}: ${meaningSnippet} Explore ${designCount} curated designs with pain maps and aging predictions.`
      : `What does a ${subject.toLowerCase()} mean? Explore ${designCount} curated designs with cultural context, placement guides, pain maps, and aging predictions.`,
    alternates: {
      canonical: `https://tattoosmap.com/meaning/${resolvedParams.slug}`,
    },
    openGraph: {
      title,
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

  const custom = CUSTOM_TITLES[slug];
  const displayH1 = custom?.h1 || `${subject} — Meaning, Symbolism & Designs`;
  const directAnswer = custom?.answer || '';

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
          {displayH1}
        </h1>

        {directAnswer && (
          <p className="font-serif text-[18px] leading-[1.7] text-neutral-700 max-w-3xl mb-8 mt-4">
            {directAnswer}
          </p>
        )}

        <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
          {designs.length} designs — Meaning & Symbolism
        </p>
      </div>

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
