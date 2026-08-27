'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

type Clinic = {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  city_slug: string;
  address?: string | null;
  phone?: string | null;
  website_url?: string | null;
  google_maps_url?: string | null;
  rating?: number | null;
  review_count?: number;
  laser_technology?: string[] | null;
  price_per_session_min?: number | null;
  price_per_session_max?: number | null;
  is_verified?: boolean;
  is_published?: boolean;
  description?: string | null;
};

type CityData = {
  city: string;
  state: string;
  slug: string;
  vol: number;
  kd: number;
  clinics: Clinic[];
};

interface ClinicsClientProps {
  clinicsByCity: CityData[];
}

export function ClinicsClient({ clinicsByCity }: ClinicsClientProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter cities based on search
  const filteredCities = useMemo(() => {
    if (!searchQuery.trim()) return clinicsByCity;
    const query = searchQuery.toLowerCase();
    return clinicsByCity.filter(c =>
      c.city.toLowerCase().includes(query) ||
      c.state.toLowerCase().includes(query) ||
      c.slug.toLowerCase().includes(query)
    );
  }, [searchQuery, clinicsByCity]);

  return (
    <div>
      {/* Search Input */}
      <div className="mb-12">
        <input
          type="text"
          placeholder="Search by city or state..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md border border-black px-4 py-3 font-mono text-[13px] outline-none focus:border-neutral-500 placeholder:text-neutral-400"
        />
        {searchQuery && filteredCities.length === 0 && (
          <div className="mt-8 border border-dashed border-neutral-200 p-8 text-center">
            <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-3">
              City not yet listed
            </p>
            <p className="font-serif text-[15px] text-neutral-500 mb-4">
              We are expanding to more cities soon.
              In the meantime our removal guide applies everywhere.
            </p>
            <Link
              href="/blog/how-to-choose-a-tattoo-removal-clinic-the-7-questions-that-expose-a-bad-one"
              className="font-mono text-[10px] uppercase tracking-widest border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors inline-block"
            >
              How To Choose Any Removal Clinic →
            </Link>
          </div>
        )}
      </div>

      {/* City Grid */}
      <div className="space-y-12">
        {filteredCities.map(({ city, state, slug, clinics: cityClinics }) => (
          <div key={slug} className="border-t border-neutral-200 pt-8">
            <div className="flex items-baseline justify-between mb-6">
              <h2 className="font-display text-[24px] uppercase">
                {city}, {state}
              </h2>
              <Link
                href={`/clinics/${slug}`}
                className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 hover:text-black transition-colors"
              >
                {cityClinics.length > 1 ? 'View All →' : 'City Guide →'}
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
    </div>
  );
}
