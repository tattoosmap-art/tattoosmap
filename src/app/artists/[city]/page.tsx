import { getSupabaseAnon } from "@/lib/supabase-anon";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

const CITY_DATA: Record<string, {
  city: string;
  state: string;
  slug: string;
  description: string;
  priceRange: string;
  popularStyles: string[];
  clinicSlug: string;
}> = {
  'charlotte-nc': {
    city: 'Charlotte', state: 'NC', slug: 'charlotte-nc',
    description: 'Charlotte has a growing tattoo scene concentrated in NoDa, Plaza Midwood, and South End. The city has seen significant growth in fine line and blackwork studios over the last five years.',
    priceRange: '$100-200/hour',
    popularStyles: ['Fine Line', 'Blackwork', 'Traditional', 'Neo-Traditional'],
    clinicSlug: 'charlotte-nc'
  },
  'raleigh-nc': {
    city: 'Raleigh', state: 'NC', slug: 'raleigh-nc',
    description: 'Raleigh and the Research Triangle have a strong university-driven tattoo culture with competitive pricing and a wide range of styles available.',
    priceRange: '$100-180/hour',
    popularStyles: ['Fine Line', 'Illustrative', 'Watercolor', 'Geometric'],
    clinicSlug: 'raleigh-nc'
  },
  'phoenix-az': {
    city: 'Phoenix', state: 'AZ', slug: 'phoenix-az',
    description: 'Phoenix has a large and diverse tattoo community spanning traditional American, Chicano, and Japanese styles. Heat and sun mean aftercare is especially important here.',
    priceRange: '$120-200/hour',
    popularStyles: ['Traditional', 'Chicano', 'Japanese', 'Blackwork'],
    clinicSlug: 'phoenix-az'
  },
  'nashville-tn': {
    city: 'Nashville', state: 'TN', slug: 'nashville-tn',
    description: 'Nashville has exploded as a tattoo destination alongside its music and creative economy growth. East Nashville in particular has a dense concentration of independent studios.',
    priceRange: '$100-200/hour',
    popularStyles: ['Neo-Traditional', 'Fine Line', 'Illustrative', 'Blackwork'],
    clinicSlug: 'nashville-tn'
  },
  'orlando-fl': {
    city: 'Orlando', state: 'FL', slug: 'orlando-fl',
    description: 'Orlando has a large and varied tattoo market serving both residents and visitors. Verify studio credentials carefully in a tourist-heavy market.',
    priceRange: '$120-220/hour',
    popularStyles: ['Realism', 'Color', 'Traditional', 'Fine Line'],
    clinicSlug: 'orlando-fl'
  },
  'austin-tx': {
    city: 'Austin', state: 'TX', slug: 'austin-tx',
    description: 'Austin has one of the strongest tattoo cultures in the country. The East Austin corridor has a high concentration of independent artists across every style.',
    priceRange: '$150-250/hour',
    popularStyles: ['Illustrative', 'Fine Line', 'Blackwork', 'Neo-Traditional'],
    clinicSlug: 'austin-tx'
  },
  'denver-co': {
    city: 'Denver', state: 'CO', slug: 'denver-co',
    description: 'Denver has a strong outdoor and creative culture that drives a healthy tattoo market. High altitude and dry air mean extra attention to healing aftercare is essential.',
    priceRange: '$120-200/hour',
    popularStyles: ['Geometric', 'Blackwork', 'Fine Line', 'Watercolor'],
    clinicSlug: 'denver-co'
  },
  'houston-tx': {
    city: 'Houston', state: 'TX', slug: 'houston-tx',
    description: 'Houston is one of the largest tattoo markets in the US with enormous diversity in styles, pricing, and studio quality. Get multiple consultations before committing.',
    priceRange: '$100-220/hour',
    popularStyles: ['Realism', 'Traditional', 'Chicano', 'Blackwork'],
    clinicSlug: 'houston-tx'
  },
  'miami-fl': {
    city: 'Miami', state: 'FL', slug: 'miami-fl',
    description: 'Miami has a premium tattoo market reflecting the city cost of living. Wynwood and the Design District have the highest concentration of quality independent studios.',
    priceRange: '$150-300/hour',
    popularStyles: ['Realism', 'Fine Line', 'Color', 'Illustrative'],
    clinicSlug: 'miami-fl'
  },
};

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city } = await params;
  const data = CITY_DATA[city];
  if (!data) return {};
  return {
    title: `Tattoo Artists in ${data.city} ${data.state} — Find Verified Artists | TattoosMap`,
    description: `Find tattoo artists in ${data.city} ${data.state}. Browse by style, compare portfolios, and read honest guides before booking your consultation.`,
    alternates: { canonical: `https://tattoosmap.com/artists/${city}` },
  };
}

export async function generateStaticParams() {
  return Object.keys(CITY_DATA).map(city => ({ city }));
}

export const revalidate = 3600;

export default async function CityArtistPage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const data = CITY_DATA[city];
  if (!data) notFound();

  const supabase = getSupabaseAnon();
  const { data: artists } = await supabase
    .from('artists')
    .select('*')
    .ilike('location', `%${data.city}%`)
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(12);

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-16">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-12">
          <Link href="/artists" className="hover:text-black transition-colors">Artists</Link>
          <span>/</span>
          <span className="text-black">{data.city}, {data.state}</span>
        </div>

        {/* Header */}
        <div className="mb-12">
          <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-4">
            Artist Directory
          </p>
          <h1 className="font-display text-[38px] md:text-[52px] uppercase leading-none mb-6">
            Tattoo Artists<br />in {data.city}
          </h1>
          <p className="font-serif text-[17px] text-neutral-600 max-w-2xl leading-relaxed mb-6">
            {data.description}
          </p>

          {/* Price and styles */}
          <div className="flex flex-wrap gap-6 mb-8">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-1">
                Typical Rate
              </p>
              <p className="font-mono text-[13px]">{data.priceRange}</p>
            </div>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-1">
                Popular Styles
              </p>
              <div className="flex flex-wrap gap-1">
                {data.popularStyles.map(style => (
                  <span key={style} className="font-mono text-[9px] uppercase tracking-widest border border-neutral-300 px-2 py-0.5">
                    {style}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Artist listings */}
        {artists && artists.length > 0 ? (
          <div className="space-y-6 mb-16">
            {artists.map((artist: any) => (
              <div key={artist.id} className="border border-neutral-200 p-6">
                <div className="flex items-start gap-4">
                  {artist.avatar_url && (
                    <img
                      src={artist.avatar_url}
                      alt={artist.full_name}
                      className="w-16 h-16 object-cover border border-neutral-200"
                    />
                  )}
                  <div className="flex-1">
                    <h2 className="font-mono text-[14px] uppercase tracking-wide mb-1">
                      {artist.full_name}
                    </h2>
                    {artist.specialty && (
                      <p className="font-mono text-[10px] text-neutral-500 mb-2">
                        {artist.specialty}
                      </p>
                    )}
                    {artist.bio && (
                      <p className="font-serif text-[14px] text-neutral-600 leading-relaxed mb-4">
                        {artist.bio.substring(0, 200)}{artist.bio.length > 200 ? '...' : ''}
                      </p>
                    )}
                    {artist.link_url && (
                      <a
                        href={artist.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-[10px] uppercase tracking-widest border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors inline-block"
                      >
                        View Portfolio →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-neutral-200 p-12 text-center mb-16">
            <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-3">
              Directory Being Built
            </p>
            <p className="font-serif text-[16px] text-neutral-500 mb-6">
              We are currently verifying tattoo artists in {data.city}.
              Browse our full artist directory while we expand.
            </p>
            <Link
              href="/artists"
              className="font-mono text-[10px] uppercase tracking-widest border border-black px-5 py-2.5 hover:bg-black hover:text-white transition-colors inline-block"
            >
              Browse All Artists →
            </Link>
          </div>
        )}

        {/* Cross-link to clinic page */}
        <div className="border border-neutral-200 p-6 mb-8">
          <p className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-2">
            Also In {data.city}
          </p>
          <p className="font-serif text-[15px] text-neutral-600 mb-4">
            Looking for tattoo removal in {data.city}? We also maintain a directory of verified removal clinics.
          </p>
          <Link
            href={`/clinics/${data.clinicSlug}`}
            className="font-mono text-[10px] uppercase tracking-widest text-black hover:underline"
          >
            → Find removal clinics in {data.city}
          </Link>
        </div>

        {/* Bottom CTA */}
        <div className="border border-black p-8 text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-3">
            Before You Book
          </p>
          <h2 className="font-display text-[22px] uppercase mb-4">
            How to Choose the Right Artist
          </h2>
          <p className="font-serif text-[15px] text-neutral-600 mb-6">
            Style match matters more than proximity.
            Read our guide before booking any consultation.
          </p>
          <Link
            href="/first-tattoo"
            className="font-mono text-[10px] uppercase tracking-widest bg-black text-white px-5 py-2.5 hover:bg-neutral-800 transition-colors inline-block"
          >
            First Tattoo Guide →
          </Link>
        </div>

      </div>
    </main>
  );
}
