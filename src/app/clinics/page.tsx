import { getSupabaseAnon } from "@/lib/supabase-anon";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: 'Tattoo Removal Clinics — Find Verified Clinics Near You | TattoosMap',
  description: 'Find verified tattoo removal clinics near you. Compare laser technology, pricing, and read honest guides before booking your consultation.',
  alternates: { canonical: "https://tattoosmap.com/clinics" },
};

export const revalidate = 60;

const TARGET_CITIES = [
  { city: 'Charlotte', state: 'NC', slug: 'charlotte-nc', vol: 480, kd: 1 },
  { city: 'Raleigh', state: 'NC', slug: 'raleigh-nc', vol: 390, kd: 5 },
  { city: 'Phoenix', state: 'AZ', slug: 'phoenix-az', vol: 390, kd: 5 },
  { city: 'Nashville', state: 'TN', slug: 'nashville-tn', vol: 210, kd: 6 },
  { city: 'Orlando', state: 'FL', slug: 'orlando-fl', vol: 480, kd: 8 },
  { city: 'Austin', state: 'TX', slug: 'austin-tx', vol: 260, kd: 8 },
  { city: 'Denver', state: 'CO', slug: 'denver-co', vol: 320, kd: 9 },
  { city: 'Houston', state: 'TX', slug: 'houston-tx', vol: 720, kd: 10 },
  { city: 'Miami', state: 'FL', slug: 'miami-fl', vol: 390, kd: 12 },
];

export default async function ClinicsPage() {
  const supabase = getSupabaseAnon();
  const { data: clinics } = await supabase
    .from('clinics')
    .select('*')
    .eq('is_published', true)
    .order('city');

  const clinicsByCity = TARGET_CITIES.map(cityData => ({
    ...cityData,
    clinics: clinics?.filter(c => c.city_slug === cityData.slug) || []
  }));

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* Header */}
        <div className="mb-16">
          <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-4">
            Clinic Directory
          </p>
          <h1 className="font-display text-[42px] md:text-[56px] uppercase leading-none mb-6">
            Tattoo Removal Clinics
          </h1>
          <p className="font-serif text-[18px] text-neutral-600 max-w-2xl leading-relaxed">
            Find verified tattoo removal clinics in your city. 
            Compare laser technology and pricing before you book.
          </p>
        </div>

        {/* City Grid */}
        <div className="space-y-12">
          {clinicsByCity.map(({ city, state, slug, clinics: cityClinics }) => (
            <div key={slug} className="border-t border-neutral-200 pt-8">
              <div className="flex items-baseline justify-between mb-6">
                <h2 className="font-display text-[24px] uppercase">
                  {city}, {state}
                </h2>
                <Link
                  href={`/clinics/${slug}`}
                  className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 hover:text-black transition-colors"
                >
                  View All →
                </Link>
              </div>

              {cityClinics.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cityClinics.slice(0, 2).map(clinic => (
                    <div key={clinic.id} className="border border-neutral-200 p-6">
                      <h3 className="font-mono text-[13px] uppercase tracking-wide mb-2">
                        {clinic.name}
                      </h3>
                      {clinic.laser_technology && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {clinic.laser_technology.map((tech: string) => (
                            <span key={tech} className="font-mono text-[9px] uppercase tracking-widest border border-neutral-300 px-2 py-0.5">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                      {clinic.price_per_session_min && (
                        <p className="font-mono text-[10px] text-neutral-500 mb-4">
                          ${clinic.price_per_session_min}–${clinic.price_per_session_max} per session
                        </p>
                      )}
                      {clinic.website_url && (
                        <a
                          href={clinic.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[10px] uppercase tracking-widest border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors"
                        >
                          Book Consultation →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-neutral-200 p-8 text-center">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-4">
                    Clinics being verified
                  </p>
                  <Link
                    href={`/clinics/${slug}`}
                    className="font-mono text-[10px] uppercase tracking-widest text-black underline"
                  >
                    Read our {city} removal guide →
                  </Link>
                </div>
              )}

              {/* Link to city guide */}
              <div className="mt-4">
                <Link
                  href={`/blog/tattoo-removal-${slug}`}
                  className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 hover:text-black transition-colors"
                >
                  → Read the honest {city} removal cost guide
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="border border-black p-8 mt-16 text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-3">
            Not sure what to ask?
          </p>
          <h2 className="font-display text-[24px] uppercase mb-4">
            Before You Book Any Clinic
          </h2>
          <p className="font-serif text-[16px] text-neutral-600 mb-6 max-w-lg mx-auto">
            Read our guide on the 7 questions that expose a bad removal clinic.
          </p>
          <Link
            href="/blog/how-to-choose-a-tattoo-removal-clinic-the-7-questions-that-expose-a-bad-one"
            className="font-mono text-[11px] uppercase tracking-widest px-6 py-3 bg-black text-white hover:bg-neutral-800 transition-colors inline-block"
          >
            Read the Guide →
          </Link>
        </div>

      </div>
    </main>
  );
}
