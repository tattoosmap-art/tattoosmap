import Link from "next/link";
import Image from "next/image";
import { getSupabaseAnon } from "@/lib/supabase-anon";
import WaitlistForm from "@/components/ui/WaitlistForm";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "TattoosMap — Discover Tattoo Designs, Styles & Meanings",
  description: "Explore thousands of tattoo designs, read science-backed aftercare guides, and book direct with verified artists. The objective tattoo discovery platform.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "TattoosMap — Find Your Perfect Tattoo",
    description: "Explore thousands of tattoo designs, read science-backed aftercare guides, and book direct with verified artists.",
    url: "https://tattoosmap.com",
    images: ["/brand-logo.png"],
  },
};

export const revalidate = 60; // Cache landing page for 60 seconds (1 minute)

// Helper for SVG icons to keep the main file clean
const SVGIcon = ({ name }: { name: string }) => {
  switch (name) {
    case "needle": return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 20L20 4M20 4V10M20 4H14" strokeLinecap="square" />
      </svg>
    );
    case "body": return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="8" y="2" width="8" height="20" strokeLinecap="square" />
        <path d="M8 8H4M16 8H20" />
      </svg>
    );
    case "compass": return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="9" strokeLinecap="square" />
        <path d="M12 7V17M7 12H17" strokeLinecap="square" />
      </svg>
    );
    case "marker": return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 21C12 21 5 13.5 5 8.5C5 4.63401 8.13401 1.5 12 1.5C15.866 1.5 19 4.63401 19 8.5C19 13.5 12 21 12 21Z" strokeLinecap="square" />
        <circle cx="12" cy="8.5" r="2.5" strokeLinecap="square" />
      </svg>
    );
    case "ruler": return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="7" width="20" height="10" strokeLinecap="square" />
        <path d="M7 7V12M12 7V12M17 7V12" />
      </svg>
    );
    default: return null;
  }
};

export default async function LandingPage() {
  const supabase = getSupabaseAnon();

  // Parallel Data Fetching for all sections
  const [heroRes, previewRes, meaningRes] = await Promise.all([
    supabase.from('designs').select('thumbnail_url, image_url, subject, slug').eq('is_published', true).order('save_count', { ascending: false }).limit(6),
    supabase.from('designs').select('thumbnail_url, image_url, slug, public_category').eq('is_published', true).limit(20),
    supabase.from('designs').select('thumbnail_url, image_url, subject, slug, meaning, cultural_origin').eq('is_published', true).not('meaning', 'is', null).order('save_count', { ascending: false }).limit(3)
  ]);

  if (heroRes.error) {
    console.error('[DATABASE ERROR] Failed to fetch hero designs from Supabase:', {
      message: heroRes.error.message,
      details: heroRes.error.details,
      code: heroRes.error.code
    });
  }
  if (previewRes.error) {
    console.error('[DATABASE ERROR] Failed to fetch preview designs from Supabase:', {
      message: previewRes.error.message,
      details: previewRes.error.details,
      code: previewRes.error.code
    });
  }
  if (meaningRes.error) {
    console.error('[DATABASE ERROR] Failed to fetch meaning designs from Supabase:', {
      message: meaningRes.error.message,
      details: meaningRes.error.details,
      code: meaningRes.error.code
    });
  }

  const heroDesigns = heroRes.data || [];
  const previewDesigns = previewRes.data || [];
  const meaningDesigns = meaningRes.data || [];

  return (
    <main className="w-full bg-white text-black selection:bg-brand-red selection:text-white">
      

      {/* SECTION 2 — The Hero */}
      <section className="min-h-[calc(100vh-56px)] grid grid-cols-1 lg:grid-cols-[55%_45%] border-b border-gray-light">
        <div className="flex flex-col justify-center p-8 md:p-12 lg:px-20 lg:py-20 border-b lg:border-b-0 lg:border-r border-gray-light">
          <h1 className="font-display text-[48px] md:text-[60px] lg:text-[72px] leading-[0.95] mb-8 uppercase tracking-tighter">
            FIND YOUR<br />
            <span className="text-brand-red">PERFECT TATTOO.</span><br />
            TRUST THE PROCESS.
          </h1>
          <p className="text-[18px] text-gray-mid max-w-[520px] mb-12 leading-relaxed">
            The world&apos;s first objective tattoo discovery platform. Design inspiration, verified artists, and science-backed aftercare — in one place.
          </p>
          
          <div className="flex flex-wrap gap-4 mb-16">
            <span className="px-3 py-1.5 border border-gray-light text-[10px] uppercase font-mono tracking-widest text-gray-mid">For first-timers: Pain guides & aftercare science</span>
            <span className="px-3 py-1.5 border border-gray-light text-[10px] uppercase font-mono tracking-widest text-gray-mid">For collectors: Verified artist portfolios</span>
            <span className="px-3 py-1.5 border border-gray-light text-[10px] uppercase font-mono tracking-widest text-gray-mid">For artists: Technical reference library</span>
          </div>

          <div className="flex flex-col space-y-4 max-w-[400px]">
            <Link href="/gallery" className="h-14 bg-brand-red text-white font-mono text-[14px] uppercase tracking-[0.15em] flex items-center justify-center hover:bg-black transition-colors rounded-none">
              Explore All Designs
            </Link>
            <Link href="/artists" className="h-14 border border-brand-red text-brand-red font-mono text-[14px] uppercase tracking-[0.15em] flex items-center justify-center hover:bg-brand-red hover:text-white transition-colors rounded-none">
              Find a Verified Artist
            </Link>
          </div>
          
          <div className="mt-8 font-mono text-[11px] uppercase tracking-[0.2em] text-gray-mid">
            HIGH-QUALITY DESIGNS & TECHNICAL INFORMATION FOUND NOWHERE ELSE
          </div>
        </div>

        <div className="flex flex-col bg-white h-full min-h-[500px]">
          {/* Top Main Featured Card */}
          {heroDesigns[0] && (
            <div className="relative flex-grow h-[60%] min-h-[320px] group overflow-hidden border-b border-gray-light bg-white">
              <Link href={`/gallery/${heroDesigns[0].slug}`} className="block w-full h-full relative overflow-hidden p-8">
                <Image 
                  src={heroDesigns[0].thumbnail_url || heroDesigns[0].image_url || "/brand-logo.png"} 
                  alt={heroDesigns[0].subject || 'Featured design'} 
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-contain p-8 transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]"
                  priority={true}
                />
                <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-2 bg-white/80 backdrop-blur-sm p-4 border border-gray-light/30">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand-red font-bold animate-pulse">
                    Featured Original / 01
                  </span>
                  <h3 className="font-display text-[28px] md:text-[36px] uppercase leading-none tracking-tight text-black">
                    {heroDesigns[0].subject}
                  </h3>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-gray-mid mt-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    [ Click to explore technical details ]
                  </span>
                </div>
              </Link>
            </div>
          )}

          {/* Bottom Grid of Next 4 Designs (Perfectly uniform frames) */}
          <div className="grid grid-cols-4 h-[40%] min-h-[180px] bg-white">
            {heroDesigns.slice(1, 5).map((design, index) => {
              const cardNumber = `0${index + 2}`;
              return (
                <div key={design.slug} className={`relative flex flex-col h-full group border-r border-gray-light last:border-r-0`}>
                  <Link href={`/gallery/${design.slug}`} className="flex flex-col h-full justify-between p-3 hover:bg-off-white transition-colors">
                    {/* Uniform Image Wrapper */}
                    <div className="relative w-full aspect-[4/5] overflow-hidden border border-gray-light bg-white transition-all group-hover:border-brand-red">
                      <Image 
                        src={design.thumbnail_url || design.image_url || "/brand-logo.png"} 
                        alt={design.subject || 'Tattoo design preview'} 
                        fill
                        sizes="120px"
                        className="object-contain p-2 transition-transform duration-700 ease-out group-hover:scale-[1.08]"
                        priority={true}
                      />
                    </div>
                    {/* Editorial Label */}
                    <div className="mt-2 flex flex-col gap-0.5">
                      <span className="font-mono text-[9px] text-gray-mid font-semibold">
                        {cardNumber}
                      </span>
                      <span className="font-mono text-[8px] text-gray-light uppercase tracking-wider truncate">
                        {design.subject?.split(' ')[0] || 'Design'}
                      </span>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 4 — The Five Persona Entry Points */}
      <section className="py-24 px-8 border-b border-gray-light">
        <h2 className="font-mono text-[13px] uppercase tracking-[0.2em] text-brand-red mb-16 px-4">WHAT BRINGS YOU HERE?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-0 border-t border-l border-gray-light">
          {[
            { id: 1, name: "The First-Timer", icon: "needle", head: "Getting Your First Tattoo", body: "Pain guides, placement science, aftercare protocols. Everything your artist should tell you but probably won't.", link: "/blog/category/care-guides", cta: "Start Here →" },
            { id: 2, name: "The Planner", icon: "body", head: "Planning Your Next Piece", body: "Browse designs by meaning, style, and placement. Build your consultation collection.", link: "/gallery", cta: "Browse Designs →" },
            { id: 3, name: "The Enthusiast", icon: "compass", head: "Understanding the Meaning", body: "The symbolism, cultural origin, and significance behind every design. Meaning documented for every design in our library.", link: "/gallery", cta: "Explore Meaning →" },
            { id: 4, name: "The Collector", icon: "marker", head: "Finding the Right Artist", body: "Browse our artist directory — each artist has a dedicated profile card with their portfolio, location, specialty.", link: "/artists", cta: "Find Artists →" },
            { id: 5, name: "The Pro", icon: "ruler", head: "Technical Reference", body: "Needle configurations, minimum size guidelines, and aging predictions are mapped directly on each design page.", link: "/gallery", cta: "Artist Resources →" },
          ].map((persona) => (
            <div key={persona.id} className="p-10 border-r border-b border-gray-light bg-white hover:bg-off-white transition-colors flex flex-col justify-between">
              <div>
                <div className="text-brand-red mb-8"><SVGIcon name={persona.icon} /></div>
                <h3 className="font-display text-2xl mb-4 leading-tight">{persona.head}</h3>
                <p className="text-[14px] text-gray-mid leading-relaxed mb-12">{persona.body}</p>
              </div>
              <Link href={persona.link} className="font-mono text-[12px] uppercase tracking-[0.15em] text-brand-red border-b border-transparent hover:border-brand-red transition-all pb-1 w-fit">
                {persona.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5 — The Blue Ocean Proof Section */}
      <section className="py-24 px-8 md:px-12 lg:px-24 grid grid-cols-1 lg:grid-cols-2 gap-24 border-b border-gray-light">
        <div>
          <h2 className="font-display text-[48px] md:text-[64px] uppercase leading-[0.95] mb-12 tracking-tighter">
            ELEVATE YOUR<br />NEXT TATTOO<br />EXPERIENCE.<br /><span className="text-brand-red">INTELLIGENT &<br />SEAMLESS.</span>
          </h2>
          <p className="text-[18px] text-gray-mid leading-relaxed max-w-[480px]">
            TattoosMap simplifies how you find, preview, and plan your next piece. Explore a curated library with technical specifications, test placements virtually with our try-on studio, and connect directly with verified artists.
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full font-mono text-[12px] border-collapse border border-gray-light">
            <thead>
              <tr>
                <th className="p-6 text-left font-mono font-normal uppercase tracking-[0.1em] border-b border-gray-light">Features</th>
                <th className="p-6 text-center font-mono font-normal uppercase tracking-[0.1em] border-b border-gray-light border-l border-gray-light text-brand-red">TattoosMap</th>
                <th className="p-6 text-center font-mono font-normal uppercase tracking-[0.1em] border-b border-gray-light border-l border-gray-light opacity-40">Pinterest</th>
                <th className="p-6 text-center font-mono font-normal uppercase tracking-[0.1em] border-b border-gray-light border-l border-gray-light opacity-40">Instagram</th>
              </tr>
            </thead>
            <tbody>
              {[
                "Verified Artists", "Science Aftercare", "Tattoo Products", "Design Meaning", "Free Tattoo Try On", "Artist Technical Data"
              ].map((row, i) => (
                <tr key={i}>
                  <td className="p-6 border-b border-gray-light">{row}</td>
                  <td className="p-6 text-center border-b border-gray-light border-l border-gray-light text-brand-red text-[16px]">
                    ✓
                  </td>
                  <td className="p-6 text-center border-b border-gray-light border-l border-gray-light text-gray-mid opacity-40">✗</td>
                  <td className="p-6 text-center border-b border-gray-light border-l border-gray-light text-gray-mid opacity-40">✗</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 6 — The Design Library Preview */}
      <section className="py-24 border-b border-gray-light bg-off-white">
        <h2 className="font-mono text-[13px] uppercase tracking-[0.2em] text-gray-mid mb-12 px-8 lg:px-24">ORIGINAL TATTOO DESIGNS</h2>
        <div className="w-full flex overflow-x-auto no-scrollbar gap-6 px-8 lg:px-24 pb-12 overscroll-x-contain" data-lenis-prevent>
          {previewDesigns.map((design) => (
            <Link key={design.slug} href={`/gallery/${design.slug}`} className="w-[160px] flex-shrink-0 group flex flex-col gap-3">
              {/* Perfectly Uniform Frame Aspect Ratio Container */}
              <div className="relative w-full aspect-[3/4] overflow-hidden border border-gray-light bg-white transition-all duration-500 group-hover:border-brand-red group-hover:shadow-sm">
                <Image 
                  src={design.thumbnail_url || design.image_url || "/brand-logo.png"} 
                  alt={design.slug || 'Tattoo design preview'} 
                  fill
                  sizes="160px"
                  className="object-contain p-3 transition-transform duration-700 ease-out group-hover:scale-105" 
                  loading="lazy" 
                />
              </div>
              {/* Editorial Catalog Typography */}
              <div className="flex flex-col gap-0.5 mt-1">
                <span className="font-mono text-[10px] text-black uppercase tracking-wide truncate group-hover:text-brand-red transition-colors">
                  {design.slug?.split('-').join(' ')}
                </span>
                <span className="font-mono text-[8px] text-gray-mid uppercase tracking-widest">
                  {design.public_category || 'Minimalist'}
                </span>
              </div>
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 px-8 my-16">
          {['Traditional', 'Realism', 'Blackwork', 'Japanese', 'Geometric', 'Fine Line', 'Minimalist'].map((style) => (
            <Link key={style} href={`/gallery?style=${style.toLowerCase()}`} className="px-6 py-3 border border-gray-light hover:border-brand-red transition-all font-mono text-[11px] uppercase tracking-widest bg-white">
              {style}
            </Link>
          ))}
        </div>

        <div className="px-8 lg:px-24 flex justify-center">
          <Link href="/gallery" className="w-full max-w-[1200px] h-14 bg-brand-red text-white flex items-center justify-center font-mono text-[14px] uppercase tracking-[0.1em] hover:bg-black transition-colors rounded-none">
            BROWSE ALL DESIGNS
          </Link>
        </div>
      </section>

      {/* SECTION 7 — The Meaning Section */}
      <section id="meaning-section" className="py-24 px-8 lg:px-24 border-b border-gray-light bg-off-white scroll-mt-24">
        <h2 className="font-mono text-[13px] uppercase tracking-[0.2em] text-gray-mid mb-16">EVERY DESIGN HAS A STORY</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          {meaningDesigns.map((design) => (
            <div key={design.slug} className="flex flex-col bg-white border border-gray-light">
              <Image 
                src={design.thumbnail_url || design.image_url || "/brand-logo.png"} 
                alt={design.subject || 'Tattoo meaning illustration'} 
                width={400}
                height={533}
                sizes="(max-width: 768px) 100vw, 400px"
                className="w-full aspect-[3/4] object-contain p-4 bg-white border-b border-gray-light" 
                loading="lazy" 
              />
              <div className="p-8">
                <h3 className="font-display text-2xl mb-4 uppercase">{design.subject}</h3>
                <p className="text-[14px] text-gray-mid leading-relaxed mb-6 line-clamp-3">
                  {design.meaning}
                </p>
                <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-brand-red mb-6">{design.cultural_origin}</div>
                <Link href={`/gallery/${design.slug}`} className="font-mono text-[12px] uppercase tracking-[0.1em] border-b border-black pb-1 hover:text-brand-red hover:border-brand-red transition-all">
                  Read Full Story
                </Link>
              </div>
            </div>
          ))}
        </div>
        <div className="w-full text-center font-mono text-[11px] uppercase tracking-[0.2em] text-gray-mid">
          MEANING DOCUMENTED FOR EVERY DESIGN IN OUR LIBRARY
        </div>
      </section>

      {/* SECTION 8 — The Try-On Studio Teaser */}
      <section className="py-24 px-8 lg:px-24 grid grid-cols-1 lg:grid-cols-2 gap-24 border-b border-gray-light items-center">
        <div>
          <span className="font-mono text-[12px] text-brand-red uppercase tracking-[0.3em] block mb-6">FEATURE</span>
          <h2 className="font-display text-[48px] md:text-[60px] leading-[1] mb-8 uppercase tracking-tighter">SEE IT ON YOUR SKIN<br /><span className="text-gray-mid">BEFORE THE NEEDLE</span></h2>
          <p className="text-[18px] text-gray-mid leading-relaxed max-w-[480px] mb-12">
            Upload your photo. Select any design from our library. Our compositor places the exact design on your exact body — no AI hallucinations, no altered photos, just precise placement.
          </p>
          <ul className="space-y-6 mb-12">
            <li className="flex items-center space-x-4 font-mono text-[13px] uppercase tracking-wide">
              <span className="text-brand-red text-xl">✓</span>
              <span>100% free to use — no credit card or account required</span>
            </li>
            <li className="flex items-center space-x-4 font-mono text-[13px] uppercase tracking-wide">
              <span className="text-brand-red text-xl">✓</span>
              <span>Fast & easy — preview any design on your body in seconds</span>
            </li>
          </ul>
          <Link href="/try-on" className="inline-flex h-14 px-12 bg-brand-red text-white items-center font-mono text-[14px] uppercase tracking-[0.15em] hover:bg-black transition-colors rounded-none">
            TRY THE STUDIO
          </Link>
        </div>
        <div className="relative group overflow-hidden border border-gray-light bg-off-white aspect-square">
          <div className="absolute inset-y-0 left-1/2 w-0.5 bg-brand-red z-10" />
          <div className="absolute inset-0 grid grid-cols-2 h-full">
            <div className="h-full bg-[url('/lab/samurai-cat-design.webp')] bg-contain bg-center bg-no-repeat bg-white" />
            <div className="h-full bg-[url('/lab/samurai-cat-fresh.webp')] bg-cover bg-center" />
          </div>
          <div className="absolute bottom-6 left-6 font-mono text-[10px] uppercase text-white bg-black px-4 py-2 z-20">TATTOO DESIGN</div>
          <div className="absolute bottom-6 right-6 font-mono text-[10px] uppercase text-white bg-brand-red px-4 py-2 z-20">COMPOSITOR OUTPUT</div>
        </div>
      </section>

      {/* SECTION 9 — The Aftercare Science Strip */}
      <section className="py-24 px-8 lg:px-24 bg-off-white border-b border-gray-light">
        <h2 className="font-mono text-[13px] uppercase tracking-[0.3em] text-brand-red mb-16 px-4">THE SCIENCE YOUR ARTIST SKIPPED</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-gray-light">
          {[
            { tag: "14", label: "CRITICAL DAYS", body: "The first 14 days determine whether your tattoo design holds its precision for decades or fades within a year." },
            { tag: "60%", label: "OF LOTIONS", body: "Contain compounds that accelerate ink migration in the dermis during the healing phase. Most artists never mention this." },
            { tag: "5×", label: "FASTER FADE", body: "Tattoos on high-friction placements fade 5× faster than the same design on optimal placements." },
          ].map((card, i) => (
            <div key={i} className="p-12 bg-white border-r last:border-r-0 border-gray-light">
              <div className="font-display text-5xl md:text-6xl mb-4 text-black">{card.tag}</div>
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-brand-red mb-8">{card.label}</div>
              <p className="text-[14px] leading-relaxed text-gray-mid">{card.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-16 flex justify-center">
          <Link href="/blog/dermatologists-guide-aftercare" className="font-mono text-[12px] uppercase tracking-[0.1em] border-b border-black pb-1 hover:text-brand-red hover:border-brand-red transition-all">
            READ THE COMPLETE AFTERCARE SCIENCE GUIDE
          </Link>
        </div>
      </section>

      {/* SECTION 10 — Vetted Tattoo Artists & Direct Booking */}
      <section className="py-24 px-8 lg:px-24 grid grid-cols-1 lg:grid-cols-2 gap-24 border-b border-gray-light bg-white">
        <div>
          <span className="font-mono text-[12px] text-brand-red uppercase tracking-[0.3em] mb-6 block font-bold">DIRECT ARTIST BOOKING</span>
          <h2 className="font-display text-[48px] md:text-[60px] leading-[1] mb-8 uppercase tracking-tighter">VERIFIED ARTISTS.<br /><span className="text-gray-mid">DIRECT BOOKING.</span></h2>
          <p className="text-[18px] text-gray-mid leading-relaxed max-w-[480px] mb-12">
            Discover verified tattoo artists on TattoosMap. Browse our vetted catalog of elite creators, find the perfect design style, and connect directly to book your next session with no middleman fees.
          </p>
          <ul className="space-y-6">
            {["Direct booking — connect with verified artists instantly", "Explore portfolios — review the unique work of each artist", "Vetted directory — only elite, proven creators"].map((txt, i)=>(
              <li key={i} className="flex items-center space-x-4 font-mono text-[13px] uppercase tracking-wide">
                <span className="text-brand-red text-xl">/</span>
                <span>{txt}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="p-10 bg-off-white border border-gray-light flex flex-col justify-center">
          <span className="font-mono text-[10px] text-brand-red uppercase tracking-[0.2em] mb-2 block font-bold">
            Artist Registration
          </span>
          <h3 className="font-display text-2xl uppercase mb-6 leading-tight">
            Claim Your Vetted Artist Profile
          </h3>
          <p className="text-[14px] text-gray-mid leading-relaxed mb-8">
            Are you a professional tattoo artist? Join our vetted directory to showcase your original artwork, get discovered by premium collectors, and receive structured direct bookings through your profile.
          </p>
          <div className="flex flex-col gap-4">
            <Link 
              href="/artists" 
              className="h-14 bg-black text-white font-mono text-[11px] uppercase tracking-[0.15em] flex items-center justify-center hover:bg-brand-red transition-all shadow-md font-bold"
            >
              Join Directory As Artist
            </Link>
            <Link 
              href="/artists" 
              className="h-14 border border-black text-black font-mono text-[11px] uppercase tracking-[0.15em] flex items-center justify-center hover:bg-black hover:text-white transition-all font-bold"
            >
              Explore Vetted Artists
            </Link>
          </div>
        </div>
      </section>


      {/* SECTION 12 — The Footer */}
      <footer className="py-24 px-8 lg:px-24 bg-black text-white">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          <div>
            <h2 className="font-display text-3xl mb-4 tracking-tighter">TattoosMap</h2>
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-brand-red mb-6">THE CARTOGRAPHER OF INK</div>
            <p className="text-[14px] text-gray-mid leading-relaxed">A global tattoo discovery and trust platform. Precision designs, science-backed care.</p>
          </div>
          <div>
            <h4 className="font-mono text-[12px] uppercase tracking-[0.1em] mb-8 text-white">Explore</h4>
            <ul className="space-y-4 font-mono text-[12px] text-gray-mid uppercase tracking-wide">
              <li><Link href="/gallery" className="hover:text-white transition-colors">Gallery</Link></li>
              <li><Link href="/gallery" className="hover:text-white transition-colors">Meaning Search</Link></li>
              <li><Link href="/try-on" className="hover:text-white transition-colors">Try-On Studio</Link></li>
              <li><Link href="/design-lab" className="hover:text-white transition-colors">Design Lab</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-mono text-[12px] uppercase tracking-[0.1em] mb-8 text-white">Learn</h4>
            <ul className="space-y-4 font-mono text-[12px] text-gray-mid uppercase tracking-wide">
              <li><Link href="/blog" className="hover:text-white transition-colors">Aftercare Science</Link></li>
              <li><Link href="/gallery" className="hover:text-white transition-colors">Style Guides</Link></li>
              <li><Link href="/artists" className="hover:text-white transition-colors">Artist Spotlights</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-mono text-[12px] uppercase tracking-[0.1em] mb-8 text-white">Trust</h4>
            <ul className="space-y-4 font-mono text-[12px] text-gray-mid uppercase tracking-wide">
              <li><Link href="/artists" className="hover:text-white transition-colors">Artist Verification</Link></li>
              <li><Link href="/products" className="hover:text-white transition-colors">Tattoo Products</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="pt-12 border-t border-white/10 font-mono text-[10px] text-gray-mid uppercase tracking-widest flex items-center justify-between">
          <span>© 2026 TATTOOSMAP — Be Unique</span>
        </div>
      </footer>
    </main>
  );
}
