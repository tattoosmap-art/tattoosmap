import { getSupabaseAnon } from "@/lib/supabase-anon";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

const CITY_DATA: Record<string, { city: string; state: string; blogSlug: string }> = {
  'charlotte-nc': { city: 'Charlotte', state: 'NC', blogSlug: 'tattoo-removal-charlotte-nc' },
  'raleigh-nc': { city: 'Raleigh', state: 'NC', blogSlug: 'tattoo-removal-raleigh-nc' },
  'phoenix-az': { city: 'Phoenix', state: 'AZ', blogSlug: 'tattoo-removal-phoenix-az' },
  'nashville-tn': { city: 'Nashville', state: 'TN', blogSlug: 'tattoo-removal-nashville-tn' },
  'orlando-fl': { city: 'Orlando', state: 'FL', blogSlug: 'tattoo-removal-orlando-fl' },
  'austin-tx': { city: 'Austin', state: 'TX', blogSlug: 'tattoo-removal-austin-tx' },
  'denver-co': { city: 'Denver', state: 'CO', blogSlug: 'tattoo-removal-denver-co' },
  'houston-tx': { city: 'Houston', state: 'TX', blogSlug: 'tattoo-removal-houston-tx' },
  'miami-fl': { city: 'Miami', state: 'FL', blogSlug: 'tattoo-removal-miami-fl' },
};

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city } = await params;
  const data = CITY_DATA[city];
  if (!data) return {};
  return {
    title: `Tattoo Removal Clinics in ${data.city} ${data.state} | TattoosMap`,
    description: `Find verified tattoo removal clinics in ${data.city} ${data.state}. Compare laser technology, session costs, and read honest pricing guides before booking.`,
    alternates: { canonical: `https://tattoosmap.com/clinics/${city}` },
  };
}

export async function generateStaticParams() {
  return Object.keys(CITY_DATA).map(city => ({ city }));
}

export const revalidate = 60;

export default async function CityClinicPage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const data = CITY_DATA[city];
  if (!data) notFound();

  const supabase = getSupabaseAnon();
  const { data: clinics } = await supabase
    .from('clinics')
    .select('*')
    .eq('city_slug', city)
    .eq('is_published', true)
    .order('is_verified', { ascending: false });

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-16">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-12">
          <Link href="/clinics" className="hover:text-black transition-colors">Clinics</Link>
          <span>/</span>
          <span className="text-black">{data.city}, {data.state}</span>
        </div>

        {/* Header */}
        <div className="mb-12">
          <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-4">
            Clinic Directory
          </p>
          <h1 className="font-display text-[38px] md:text-[52px] uppercase leading-none mb-6">
            Tattoo Removal Clinics<br />in {data.city}
          </h1>
          <p className="font-serif text-[17px] text-neutral-600 max-w-2xl leading-relaxed">
            Verified removal clinics in {data.city}, {data.state}. 
            Compare laser technology and pricing before booking your consultation.
          </p>
        </div>

        {/* Clinic List */}
        {clinics && clinics.length > 0 ? (
          <div className="space-y-6 mb-16">
            {clinics.map(clinic => (
              <div key={clinic.id} className="border border-neutral-200 p-8">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="font-mono text-[14px] uppercase tracking-wide mb-1">
                      {clinic.name}
                    </h2>
                    {clinic.address && (
                      <p className="font-mono text-[10px] text-neutral-400">
                        {clinic.address}
                      </p>
                    )}
                  </div>
                  {clinic.is_verified && (
                    <span className="font-mono text-[9px] uppercase tracking-widest border border-black px-2 py-1">
                      Verified
                    </span>
                  )}
                </div>

                {/* Laser tech tags */}
                {clinic.laser_technology && clinic.laser_technology.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {clinic.laser_technology.map((tech: string) => (
                      <span key={tech} className="font-mono text-[9px] uppercase tracking-widest border border-neutral-200 px-2 py-0.5 text-neutral-600">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                {/* Pricing */}
                {clinic.price_per_session_min && (
                  <p className="font-mono text-[11px] text-neutral-500 mb-4">
                    ${clinic.price_per_session_min}–${clinic.price_per_session_max} per session estimated
                  </p>
                )}

                {/* Description */}
                {clinic.description && (
                  <p className="font-serif text-[15px] text-neutral-600 mb-6 leading-relaxed">
                    {clinic.description}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-4">
                  {clinic.website_url && (
                    <a
                      href={clinic.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[10px] uppercase tracking-widest bg-black text-white px-5 py-2.5 hover:bg-neutral-800 transition-colors"
                    >
                      Book Consultation →
                    </a>
                  )}
                  {clinic.phone && (
                    <a
                      href={`tel:${clinic.phone}`}
                      className="font-mono text-[10px] uppercase tracking-widest border border-black px-5 py-2.5 hover:bg-black hover:text-white transition-colors"
                    >
                      Call Clinic
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-neutral-200 p-12 text-center mb-16">
            <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-2">
              Directory Being Built
            </p>
            <p className="font-serif text-[16px] text-neutral-500 mb-6">
              We are currently verifying removal clinics in {data.city}.
              Read our honest cost guide while we complete the directory.
            </p>
            <Link
              href={`/blog/${data.blogSlug}`}
              className="font-mono text-[10px] uppercase tracking-widest border border-black px-5 py-2.5 hover:bg-black hover:text-white transition-colors inline-block"
            >
              Read {data.city} Removal Guide →
            </Link>
          </div>
        )}

        {/* Questions to ask CTA */}
        <div className="border border-black p-8 text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-3">
            Before You Book
          </p>
          <h2 className="font-display text-[22px] uppercase mb-4">
            7 Questions That Expose a Bad Clinic
          </h2>
          <p className="font-serif text-[15px] text-neutral-600 mb-6">
            Ask these before booking any removal clinic in {data.city}.
          </p>
          <Link
            href="/blog/how-to-choose-a-tattoo-removal-clinic-the-7-questions-that-expose-a-bad-one"
            className="font-mono text-[10px] uppercase tracking-widest bg-black text-white px-5 py-2.5 hover:bg-neutral-800 transition-colors inline-block"
          >
            Read the Guide →
          </Link>
        </div>

      </div>
    </main>
  );
}
