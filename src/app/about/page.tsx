import Link from 'next/link';
import Image from 'next/image';
import { User } from 'lucide-react';

export const metadata = {
  title: 'About TattoosMap — The Team Behind the Platform',
  description: 'TattoosMap was built by Ezzaki Diaa, founder and CEO, to create the first objective tattoo discovery platform. Meet the team behind the brand.',
  alternates: {
    canonical: 'https://tattoosmap.com/about'
  },
  openGraph: {
    title: 'About TattoosMap — Founder and Team',
    description: 'The story behind TattoosMap and the team building the future of tattoo discovery.',
    type: 'profile'
  }
};

export const revalidate = 86400;

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Ezzaki Diaa',
    jobTitle: 'Founder & CEO',
    worksFor: {
      '@type': 'Organization',
      name: 'TattoosMap',
      url: 'https://tattoosmap.com'
    },
    url: 'https://tattoosmap.com/about',
    sameAs: [
      'https://instagram.com/ezzakidiaa',
      'https://linkedin.com/in/ezzakidiaa',
    ],
    description: 'Founder and CEO of TattoosMap, the tattoo discovery platform built on editorial standards and interactive tools.'
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'TattoosMap',
    url: 'https://tattoosmap.com',
    foundingDate: '2024',
    founder: {
      '@type': 'Person',
      name: 'Ezzaki Diaa'
    },
    description: 'TattoosMap is the first objective tattoo discovery platform combining a curated design gallery, verified artist directory, and interactive tools for tattoo planning.',
    sameAs: [
      'https://instagram.com/tattoosmap',
    ]
  }
];

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-white">

        {/* HERO */}
        <section className="border-b border-gray-light">
          <div className="max-w-[1200px] mx-auto px-6 py-20 md:py-28">
            <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-8">
              TattoosMap / About
            </p>
            <div className="max-w-[680px]">
              <span className="inline-block font-mono text-[10px] uppercase tracking-widest text-brand-red border border-brand-red px-3 py-1.5 mb-8">
                The Company
              </span>
              <h1 className="font-display text-[44px] md:text-[60px] uppercase tracking-tight leading-none text-black mb-6">
                Built for the<br/>work. Not<br/>the noise.
              </h1>
              <p className="font-sans text-[18px] text-neutral-500 leading-relaxed">
                TattoosMap exists because every other tattoo platform optimizes for volume. We optimize for quality. Every design is reviewed. Every artist is verified. Every tool is built on real clinical data.
              </p>
            </div>
          </div>
        </section>

        {/* MISSION NUMBERS */}
        <section className="border-b border-gray-light bg-off-white">
          <div className="max-w-[1200px] mx-auto px-6 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-light border border-gray-light">
              {[
                { number: '2024', label: 'Founded' },
                { number: '6', label: 'Interactive tools' },
                { number: '3', label: 'Blog templates' },
                { number: '5', label: 'Languages planned' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white px-8 py-8">
                  <p className="font-display text-[36px] uppercase text-black leading-none mb-2">{stat.number}</p>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FOUNDER SECTION */}
        <section className="border-b border-gray-light">
          <div className="max-w-[1200px] mx-auto px-6 py-16">
            <p className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-10">
              The founder
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">

              {/* Founder photo */}
              <div>
                <div className="relative w-full aspect-[4/5] bg-[#FAFAFA] overflow-hidden mb-4 border border-neutral-100 flex items-center justify-center">
                  <User className="w-32 h-32 text-neutral-300 stroke-[1.0]" />
                </div>
                <div className="flex gap-4">
                  <a
                    href="https://instagram.com/ezzakidiaa"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 hover:text-brand-red transition-colors"
                  >
                    Instagram →
                  </a>
                  <a
                    href="https://linkedin.com/in/ezzakidiaa"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 hover:text-brand-red transition-colors"
                  >
                    LinkedIn →
                  </a>
                </div>
              </div>

              {/* Founder bio */}
              <div className="pt-2">
                <h2 className="font-display text-[36px] uppercase tracking-tight text-black mb-1">
                  Ezzaki Diaa
                </h2>
                <p className="font-mono text-[10px] uppercase tracking-widest text-brand-red mb-8">
                  Founder & CEO
                </p>

                <div className="space-y-5 font-sans text-[15px] text-neutral-600 leading-relaxed">
                  <p>
                    Ezzaki Diaa built TattoosMap from scratch — design system, publishing infrastructure, gallery engine, and six interactive tools. He started in the tattoo industry in 2018 when he was just a student.
                  </p>
                  <p>
                    The premise was simple: build the platform that treats tattoo decisions the way a serious buyer treats any significant aesthetic investment. Editorial standards. Real clinical data. Tools that actually help instead of tools that just look good.
                  </p>
                  <p>
                    Before the TattoosMap website, he built an audience around tattoo content on Instagram @tattoosmap, which gave him a direct view into what the community actually needed versus what the industry was offering. The gap was obvious. The platform followed.
                  </p>
                </div>

                {/* Quote */}
                <div className="border-l-2 border-brand-red pl-6 py-4 mt-10 bg-brand-red/5">
                  <p className="font-sans text-[16px] text-black italic leading-relaxed">
                    "Every other platform optimizes for volume. We optimize for the decision. One good tattoo is worth a hundred bad ones."
                  </p>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-brand-red mt-3">
                    — Ezzaki Diaa, Founder
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TEAM SECTION */}
        <section className="border-b border-gray-light">
          <div className="max-w-[1200px] mx-auto px-6 py-16">
            <p className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-10">
              The team
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-light border border-gray-light">
              {[
                {
                  name: 'Sarah Chen',
                  role: 'Head of Content',
                  bio: 'Responsible for editorial standards, blog publishing pipeline, and content accuracy across all post types.',
                },
                {
                  name: 'Marcus Kaelen',
                  role: 'Artist Relations',
                  bio: 'Manages artist verification, portfolio review, and the growing network of studios represented on the platform.',
                },
                {
                  name: 'Elena Rostova',
                  role: 'Design & Brand',
                  bio: 'Maintains the visual system, design library, and ensures every new feature matches the editorial standard of the platform.',
                },
              ].map((member) => (
                <div key={member.role} className="bg-white p-8">
                  <div className="w-12 h-12 bg-neutral-100 mb-6" />
                  <h3 className="font-display text-[18px] uppercase tracking-tight text-black mb-1">
                    {member.name}
                  </h3>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-brand-red mb-4">
                    {member.role}
                  </p>
                  <p className="font-sans text-[13px] text-neutral-500 leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHAT WE BELIEVE */}
        <section className="border-b border-gray-light bg-off-white">
          <div className="max-w-[1200px] mx-auto px-6 py-16">
            <p className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-10">
              What we stand for
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-light border border-gray-light">
              {[
                {
                  title: 'Honest limitations',
                  body: 'Every product we recommend includes its real downside. If a numbing cream costs three times more than a pharmacy equivalent with identical active ingredients, we say so.'
                },
                {
                  title: 'Clinical accuracy',
                  body: 'Every tool on the platform is built on verified data — lidocaine pharmacology, Kirby-Desai removal scoring, keratinocyte healing timelines. Not marketing copy.'
                },
                {
                  title: 'No sponsored rankings',
                  body: 'Products are ranked by clinical merit and user value. No brand has paid to appear higher on a TattoosMap list. No advertiser has influenced editorial content.'
                },
                {
                  title: 'Built for the decision',
                  body: 'A tattoo is permanent. The information that informs that decision should be held to a higher standard than a listicle optimized for affiliate clicks.'
                },
              ].map((item) => (
                <div key={item.title} className="bg-white p-8">
                  <div className="w-6 h-[2px] bg-brand-red mb-5" />
                  <h3 className="font-display text-[18px] uppercase tracking-tight text-black mb-3">
                    {item.title}
                  </h3>
                  <p className="font-sans text-[14px] text-neutral-500 leading-relaxed">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CONTACT / PRESS */}
        <section className="border-b border-gray-light">
          <div className="max-w-[1200px] mx-auto px-6 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-4">
                  Press and media
                </p>
                <h2 className="font-display text-[28px] uppercase tracking-tight text-black mb-4">
                  Press Enquiries
                </h2>
                <p className="font-sans text-[15px] text-neutral-500 leading-relaxed mb-6">
                  For media coverage, partnership enquiries, or interview requests contact us directly. We respond within 48 hours.
                </p>
                <a
                  href="mailto:press@tattoosmap.com"
                  className="font-mono text-[10px] uppercase tracking-widest text-brand-red hover:underline"
                >
                  press@tattoosmap.com →
                </a>
              </div>
              <div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-4">
                  Artist and studio partnerships
                </p>
                <h2 className="font-display text-[28px] uppercase tracking-tight text-black mb-4">
                  Get Listed
                </h2>
                <p className="font-sans text-[15px] text-neutral-500 leading-relaxed mb-6">
                  Artists and studios looking to be featured on TattoosMap can apply for a verified profile. We review every application manually.
                </p>
                <Link
                  href="/contact"
                  className="font-mono text-[10px] uppercase tracking-widest text-brand-red hover:underline"
                >
                  Apply for a profile →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="border-t border-gray-light">
          <div className="max-w-[1200px] mx-auto px-6 py-16 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <p className="font-display text-[28px] uppercase tracking-tight text-black mb-2">
                See what we built
              </p>
              <p className="font-sans text-[15px] text-neutral-500">
                The gallery, the tools, the blog — all of it is live and free to use.
              </p>
            </div>
            <Link
              href="/gallery"
              className="shrink-0 inline-flex items-center gap-3 bg-black text-white font-mono text-[11px] uppercase tracking-widest px-8 py-4 hover:bg-brand-red transition-colors"
            >
              Explore TattoosMap →
            </Link>
          </div>
        </section>

      </main>
    </>
  );
}
