import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { getSupabaseAnon } from "@/lib/supabase-anon";
import TattooGeneratorClient from "@/components/design-lab/TattooGeneratorClient";

export const metadata: Metadata = {
  title: "AI Tattoo Generator & Virtual Try-On Studio | TattoosMap",
  description: "Design custom tattoos instantly with the TattoosMap AI Tattoo Generator. Choose from Fine Line, Blackwork, or Traditional styles, and try them on your skin virtually.",
  alternates: {
    canonical: "https://tattoosmap.com/ai-tattoo-generator",
  },
  openGraph: {
    title: "AI Tattoo Generator & Virtual Try-On Studio | TattoosMap",
    description: "Design custom tattoos instantly with the TattoosMap AI Tattoo Generator. Choose from Fine Line, Blackwork, or Traditional styles, and try them on your skin virtually.",
    url: "https://tattoosmap.com/ai-tattoo-generator",
  }
};

export const revalidate = 60; // Cache page for 60 seconds

export default async function DesignLabPage() {
  const supabase = getSupabaseAnon();

  // Fetch inspiration designs from database
  const { data: designsRes } = await supabase
    .from("designs")
    .select("thumbnail_url, image_url, subject, slug, public_category")
    .eq("is_published", true)
    .order("save_count", { ascending: false })
    .limit(12);

  const inspirationDesigns = designsRes || [];

  return (
    <div className="w-full bg-white text-black selection:bg-brand-red selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "TattoosMap AI Tattoo Generator",
            "url": "https://tattoosmap.com/ai-tattoo-generator",
            "description": "Generate unique custom tattoo designs in various styles and try them on your skin virtually.",
            "applicationCategory": "DesignApplication",
            "operatingSystem": "All",
            "browserRequirements": "Requires JavaScript. Requires HTML5.",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          })
        }}
      />

      {/* ZONE 1: Hero Header */}
      <section className="py-16 md:py-24 px-8 md:px-12 lg:px-24 border-b border-gray-light">
        <div className="max-w-[1200px] mx-auto">
          <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-brand-red font-bold block mb-4">
            AI TATTOO GENERATOR
          </span>
          <h1 className="font-display text-[48px] md:text-[64px] lg:text-[76px] leading-[0.95] mb-8 uppercase tracking-tighter">
            DESCRIBE IT.<br />
            WE DRAW IT.
          </h1>
          <p className="text-[18px] text-gray-mid max-w-[540px] leading-relaxed">
            Describe your idea, select a premium style, and let our custom generator model render a high-contrast flash design instantly.
          </p>
        </div>
      </section>

      {/* ZONE 2: Generator Panel Component */}
      <section className="py-16 md:py-24 px-8 md:px-12 lg:px-24 border-b border-gray-light bg-white">
        <div className="max-w-[1200px] mx-auto">
          <TattooGeneratorClient />
        </div>
      </section>

      {/* ZONE 3: Inspiration Grid */}
      {inspirationDesigns.length > 0 && (
        <section className="py-24 border-b border-gray-light bg-off-white">
          <div className="max-w-[1200px] mx-auto px-8">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-gray-mid mb-12 block">
              NEED INSPIRATION? BROWSE GALLERY ORIGINALS
            </span>
            <div className="w-full flex overflow-x-auto no-scrollbar gap-6 pb-12 overscroll-x-contain" data-lenis-prevent>
              {inspirationDesigns.map((design) => (
                <Link
                  key={design.slug}
                  href={`/gallery/${design.slug}`}
                  className="w-[180px] flex-shrink-0 group flex flex-col gap-3"
                >
                  <div className="relative w-full aspect-[3/4] overflow-hidden border border-gray-light bg-white transition-all duration-500 group-hover:border-brand-red group-hover:shadow-sm">
                    <Image
                      src={design.thumbnail_url || design.image_url || "/brand-logo.png"}
                      alt={design.subject || "Tattoo design preview"}
                      fill
                      sizes="180px"
                      className="object-contain p-3 transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex flex-col gap-0.5 mt-1">
                    <span className="font-mono text-[10px] text-black uppercase tracking-wide truncate group-hover:text-brand-red transition-colors">
                      {design.slug?.split("-").join(" ")}
                    </span>
                    <span className="font-mono text-[8px] text-gray-mid uppercase tracking-widest">
                      {design.public_category || "Minimalist"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="flex justify-center mt-8">
              <Link
                href="/gallery"
                className="w-full h-14 border border-brand-red text-brand-red flex items-center justify-center font-mono text-[12px] uppercase tracking-[0.15em] hover:bg-brand-red hover:text-white transition-colors"
                style={{ borderRadius: 0 }}
              >
                EXPLORE FULL ORIGINAL GALLERY →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ZONE 4: Style Guide Cards */}
      <section className="py-24 px-8 md:px-12 lg:px-24 bg-white border-b border-gray-light">
        <div className="max-w-[1200px] mx-auto">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-brand-red mb-16 block font-bold">
            UNDERSTANDING TATTOO STYLES
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Fine Line",
                desc: "Delicate, single-needle precision linework utilizing extensive negative space. Perfect for clean, elegant placements.",
                tag: "MINIMALIST / CLEAN"
              },
              {
                title: "Blackwork",
                desc: "Stark, high-contrast solid black fills and bold graphic line art. Extreme durability and high visual impact.",
                tag: "BOLD / CONTRAST"
              },
              {
                title: "Neo-Traditional",
                desc: "Modern illustrative compositions featuring bold contours, varying line weights, and decorative framing flourishes.",
                tag: "DECORATIVE / DETAILED"
              },
              {
                title: "Japanese Irezumi",
                desc: "Classical waves, wind bars, and mythological icons structured under strict layout and movement rules.",
                tag: "CLASSIC / TRADITIONAL"
              }
            ].map((styleCard, i) => (
              <div key={i} className="p-8 border border-gray-light bg-white hover:bg-off-white transition-colors flex flex-col justify-between h-[260px]">
                <div>
                  <span className="font-mono text-[8px] text-gray-mid uppercase tracking-widest mb-4 block">
                    {styleCard.tag}
                  </span>
                  <h3 className="font-display text-2xl mb-4 text-black uppercase">
                    {styleCard.title}
                  </h3>
                  <p className="text-[13px] leading-relaxed text-gray-mid">
                    {styleCard.desc}
                  </p>
                </div>
                <Link
                  href={`/gallery?style=${styleCard.title.toLowerCase().replace(" ", "-")}`}
                  className="font-mono text-[10px] uppercase tracking-[0.1em] text-brand-red hover:underline font-bold"
                >
                  View Style Gallery →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ZONE 5: FAQ & How-it-Works Section */}
      <section className="py-24 px-8 md:px-12 lg:px-24 bg-off-white">
        <div className="max-w-[800px] mx-auto">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-brand-red mb-16 block font-bold">
            FREQUENTLY ASKED QUESTIONS
          </span>
          <div className="flex flex-col gap-12">
            {[
              {
                q: "How does the AI tattoo generator work?",
                a: "Our generator utilizes advanced latent diffusion models optimized for black-ink, fine-line, and illustrative line art. When you enter a prompt, the system automatically appends style guidelines (such as stippling textures or line weight metrics) to output a clear, stencil-ready flash design."
              },
              {
                q: "Can I try the generated tattoo on my body?",
                a: "Yes. Once your custom design is generated, click the 'Try On Skin Virtually' link. This loads your image directly into our Try-On compositor studio, where you can upload a photo of your skin and preview the exact scaling, placement, and visual look."
              },
              {
                q: "Is it free to use and download?",
                a: "Yes, the AI tattoo generator and try-on compositor are 100% free to use. You can download your generated design in high-resolution WebP format directly to show your tattoo artist during your consultation."
              },
              {
                q: "How should I describe my tattoo idea for the generator?",
                a: "Be as specific as possible. Mention the main subject, surrounding symbols (e.g., 'roses', 'crescent moon'), placement flow, and style keywords like 'fine-line', 'blackwork', or 'stippling' for the highest quality outputs."
              }
            ].map((faq, i) => (
              <div key={i} className="flex flex-col gap-3 border-b border-gray-light pb-8 last:border-b-0">
                <h3 className="font-mono text-[13px] uppercase tracking-wide text-black font-bold">
                  {faq.q}
                </h3>
                <p className="text-[14px] leading-relaxed text-gray-mid">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
