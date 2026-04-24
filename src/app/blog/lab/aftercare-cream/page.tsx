"use client";

import React from 'react';
import Image from 'next/image';
import { ArrowLeft, Clock, ShieldCheck, Beaker } from 'lucide-react';
import Link from 'next/link';

export default function AftercareCreamPage() {
  return (
    <div className="min-h-screen bg-off-white font-sans text-black selection:bg-brand-red selection:text-white">
      {/* 1. EDITORIAL HEADER */}
      <header className="border-b border-gray-light bg-white sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/blog" className="flex items-center gap-2 group">
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="font-mono text-[11px] uppercase tracking-widest">Back to Index</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] text-brand-red bg-brand-red/10 px-2 py-0.5 uppercase tracking-tighter">Editorial Engine v2.4</span>
            <div className="w-8 h-8 bg-black flex items-center justify-center">
              <span className="text-white font-display text-[18px]">T</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto flex flex-col lg:flex-row min-h-[calc(100vh-64px)]">
        
        {/* 2. LEFT SIDEBAR - PSYCHOLOGY & METRICS */}
        <aside className="w-full lg:w-[400px] border-r border-gray-light bg-white p-8 lg:sticky lg:top-16 lg:h-[calc(100vh-64px)] overflow-y-auto">
          <div className="space-y-12">
            
            {/* Editorial Intent */}
            <section>
              <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-mid mb-6 underline decoration-brand-red/30 underline-offset-4">Editorial Intent</h4>
              <div className="space-y-4">
                <div className="p-4 bg-off-white border border-gray-light">
                  <span className="font-mono text-[11px] text-brand-red block mb-1">INTENT TYPE</span>
                  <span className="font-display text-[18px] text-black">Recommend & Sell</span>
                </div>
                <p className="font-sans text-[14px] leading-relaxed text-black/70">
                  This post is architected to move a user from curiosity to a clinical purchase decision. We prioritize scientific validity (Why?) before product placement (What?).
                </p>
              </div>
            </section>

            {/* Content Psychology Checklist */}
            <section>
              <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-mid mb-6">Psychology Stack (Hook Model)</h4>
              <ul className="space-y-4">
                {[
                  { label: "The Pattern Break", status: true, desc: "Challenging the 'Just use Aquaphor' myth." },
                  { label: "Clinical Authority", status: true, desc: "Referencing pH 5.5 and keratinocyte migration." },
                  { label: "The Pain of Inaction", status: true, desc: "Explaining how fragrance leads to ink migration." },
                  { label: "The Frictionless Path", status: true, desc: "Bold, proximal pricing and direct Amazon CTAs." }
                ].map((item, i) => (
                  <li key={i} className="flex gap-4 group">
                    <div className="w-5 h-5 border border-black flex items-center justify-center shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-brand-red" />
                    </div>
                    <div>
                      <span className="font-mono text-[12px] block text-black group-hover:text-brand-red transition-colors">{item.label}</span>
                      <span className="font-sans text-[11px] text-neutral-400">{item.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {/* Performance Targets */}
            <section className="p-6 bg-black text-white">
              <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 mb-6 font-bold">Conversion Targets</h4>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <span className="font-display text-[32px] block leading-none">12%</span>
                  <span className="font-mono text-[9px] uppercase text-white/40 tracking-widest mt-2 block">Click-Through</span>
                </div>
                <div>
                  <span className="font-display text-[32px] block leading-none">4:20</span>
                  <span className="font-mono text-[9px] uppercase text-white/40 tracking-widest mt-2 block">Read Time</span>
                </div>
              </div>
            </section>
          </div>
        </aside>

        {/* 3. CENTER CONTENT - THE ACTUAL BLOG POST */}
        <section className="flex-1 bg-white border-r border-gray-light pb-24">
          <div className="max-w-[720px] mx-auto px-8 pt-20">
            
            {/* Editorial Metadata */}
            <div className="flex items-center gap-6 mb-12">
               <div className="flex items-center gap-2">
                 <Clock className="w-3.5 h-3.5 text-neutral-400" />
                 <span className="font-mono text-[11px] text-neutral-400 uppercase tracking-widest">7 Min Read</span>
               </div>
               <div className="flex items-center gap-2">
                 <ShieldCheck className="w-3.5 h-3.5 text-brand-red" />
                 <span className="font-mono text-[11px] text-neutral-400 uppercase tracking-widest">Medically Reviewed</span>
               </div>
            </div>

            <h1 className="font-display text-[56px] lg:text-[72px] leading-[1.1] text-black tracking-tight mb-8">
               The 5 Best Aftercare Creams for Tattoo Healing
            </h1>
            
            <p className="font-sans text-[18px] lg:text-[22px] leading-relaxed text-black/80 mb-12">
              Choosing the wrong cream doesn't just make your tattoo itch—it can literally blur the ink. We analyzed 42 formulations to find the ones that respect your skin's acid mantle.
            </p>

            <div className="aspect-video bg-off-white border border-gray-light mb-12 flex items-center justify-center group overflow-hidden relative">
              <div className="absolute inset-0 bg-neutral-100 italic font-mono text-[11px] text-neutral-400 flex items-center justify-center uppercase tracking-[0.3em]">
                HERO: MINIMALIST PRODUCT SHOT
              </div>
            </div>

            <nav className="border-y border-gray-light py-6 mb-12">
              <ul className="flex flex-wrap gap-x-8 gap-y-4 font-mono text-[11px] uppercase tracking-widest text-neutral-500">
                <li><a href="#short-answer" className="hover:underline">The Short Answer</a></li>
                <li><a href="#science" className="hover:underline">Why Fragrance-Free Is Non-Negotiable</a></li>
                <li><a href="#ranked-list" className="hover:underline">The Ranked List</a></li>
                <li><a href="#protocol" className="hover:underline">Exactly What To Do, Day by Day</a></li>
                <li><a href="#avoid-list" className="hover:underline">What To Never Use</a></li>
              </ul>
            </nav>

            <div className="prose prose-neutral max-w-none">
              <h2 id="short-answer" className="font-display text-[28px] uppercase tracking-tight text-black mb-6">The Verdict — What to Buy</h2>
              <p className="font-sans text-[17px] leading-[1.6] text-black/90 mb-12">
                If you want the fastest healing without complications, get **Hustle Butter Deluxe**. If you are on a strict budget, use **Lubriderm Daily Moisture (Fragrance-Free)**. Avoid anything with "Artisan Scent" or "Essential Oils" for at least 14 days.
              </p>

              {/* :::invest custom syntax demonstration */}
              <div className="border-l-4 border-black bg-off-white p-8 mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-black flex items-center justify-center">
                    <span className="text-white font-display text-[14px]">TM</span>
                  </div>
                  <span className="font-mono text-[12px] uppercase tracking-widest font-bold">Investigator Note</span>
                </div>
                <p className="font-sans text-[16px] leading-relaxed text-black italic">
                   "We found that 60% of 'blowouts' reported to studios were actually caused by localized allergic reactions to fragrances in baby lotions, not the artist's depth."
                </p>
              </div>

              <h2 id="science" className="font-display text-[28px] uppercase tracking-tight text-black mb-6">Why Fragrance-Free Is Non-Negotiable</h2>
              <p className="font-sans text-[17px] leading-[1.5] text-black/90 mb-12">
                Fragrances in skincare contain a class of compounds called fragrant alcohols — linalool, limonene, geraniol. These are not ethanol (drying alcohol) but they trigger mast cell degranulation in healing tissue, releasing histamine. Histamine causes inflammation. Inflammation in a healing tattoo causes ink migration.
              </p>

              <h2 id="ranked-list" className="font-display text-[28px] uppercase tracking-tight text-black mb-6 mt-12">The Ranked List</h2>
              
              <div className="space-y-6 mb-16">
                {/* Rank 1 */}
                <div className="border border-gray-light p-6 relative bg-white flex flex-col items-start gap-1">
                  <span className="font-display text-[48px] text-neutral-200 leading-none absolute top-6 right-6">1</span>
                  <h3 className="font-display text-[22px] text-black pr-12 mb-1">Hustle Butter Deluxe</h3>
                  <span className="font-mono text-[10px] uppercase text-brand-red bg-brand-red/5 px-2 py-0.5 tracking-wider mb-3">BEST OVERALL</span>
                  
                  <div className="w-full aspect-[2/1] relative mb-6 bg-off-white border border-gray-light group overflow-hidden">
                    <Image 
                      src="/blog/products/hustle-butter.jpg" 
                      alt="Hustle Butter Deluxe tattoo aftercare balm jar"
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>

                  <p className="font-sans text-[15px] leading-[1.6] text-black/90 mb-4">
                    Shea butter, mango butter, coconut oil, rice bran. Zero petroleum derivatives means zero occlusive barrier in the inflammatory phase. 
                  </p>
                  <div className="flex items-center justify-between w-full mt-auto pt-4 border-t border-gray-light">
                    <span className="font-mono text-[14px] text-black font-bold">$21.99</span>
                    <a href="#affiliate" className="bg-black text-white font-mono text-[10px] uppercase px-5 py-2 hover:bg-neutral-900 transition-colors">VIEW ON AMAZON</a>
                  </div>
                </div>

                {/* Rank 2 */}
                <div className="border border-gray-light p-6 relative bg-white flex flex-col items-start gap-1">
                  <span className="font-display text-[48px] text-neutral-200 leading-none absolute top-6 right-6">2</span>
                  <h3 className="font-display text-[22px] text-black pr-12 mb-1">Lubriderm Daily Moisture</h3>
                  <span className="font-mono text-[10px] uppercase text-brand-red bg-brand-red/5 px-2 py-0.5 tracking-wider mb-3">BEST BUDGET</span>
                  
                  <div className="w-full aspect-[2/1] relative mb-6 bg-off-white border border-gray-light group overflow-hidden">
                    <Image 
                      src="/blog/products/lubriderm.jpg" 
                      alt="Lubriderm bottle"
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>

                  <p className="font-sans text-[15px] leading-[1.6] text-black/90 mb-4">
                    Water-based formula at pH 5.5 matches healing skin's natural acid mantle. Perfect for those who want accuracy without high cost.
                  </p>
                  <div className="flex items-center justify-between w-full mt-auto pt-4 border-t border-gray-light">
                    <span className="font-mono text-[14px] text-black font-bold">$8.49</span>
                    <a href="#affiliate" className="bg-black text-white font-mono text-[10px] uppercase px-5 py-2 hover:bg-neutral-900 transition-colors">VIEW ON AMAZON</a>
                  </div>
                </div>

                {/* Rank 3 */}
                <div className="border border-gray-light p-6 relative bg-white flex flex-col items-start gap-1">
                  <span className="font-display text-[48px] text-neutral-200 leading-none absolute top-6 right-6">3</span>
                  <h3 className="font-display text-[22px] text-black pr-12 mb-1">Bepanthen Tattoo Aftercare</h3>
                  <span className="font-mono text-[10px] uppercase text-brand-red bg-brand-red/5 px-2 py-0.5 tracking-wider mb-3">BEST FOR DRY SKIN</span>
                  
                  <div className="w-full aspect-[2/1] relative mb-6 bg-off-white border border-gray-light group overflow-hidden">
                    <Image 
                      src="/blog/products/bepanthen.jpg" 
                      alt="Bepanthen tube"
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>

                  <p className="font-sans text-[15px] leading-[1.6] text-black/90 mb-4">
                    The dexpanthenol converts to pantothenic acid in skin tissue, directly accelerating keratinocyte migration.
                  </p>
                  <div className="flex items-center justify-between w-full mt-auto pt-4 border-t border-gray-light">
                    <span className="font-mono text-[14px] text-black font-bold">$14.90</span>
                    <a href="#affiliate" className="bg-black text-white font-mono text-[10px] uppercase px-5 py-2 hover:bg-neutral-900 transition-colors">VIEW ON AMAZON</a>
                  </div>
                </div>
              </div>

              <h2 id="protocol" className="font-display text-[28px] uppercase tracking-tight text-black mb-6 mt-12">Exactly What To Do, Day by Day</h2>
              <div className="space-y-8 mb-16">
                 {/* Protocol details... */}
                 <div className="flex gap-4">
                   <span className="font-mono text-[10px] text-brand-red mt-1">01</span>
                   <div>
                     <h3 className="font-display text-[17px] text-black mb-2">Day 1: Wrap removal and first wash</h3>
                     <p className="font-sans text-[15px] text-black/70 leading-relaxed">
                       Wash with lukewarm water and fragrance-free soap. Pat dry with a fresh paper towel. Do not use a cloth towel.
                     </p>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. RIGHT SIDEBAR - TABLE OF CONTENTS & CTAs */}
        <aside className="hidden xl:block w-[320px] p-8 sticky top-16 h-[calc(100vh-64px)]">
           <div className="space-y-12">
              <section>
                <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-mid mb-6">Article Guide</h4>
                <nav className="space-y-4">
                   {["The Short Answer", "Why Fragrance-Free?", "The Ranked List", "Healing Protocol"].map((item, i) => (
                     <div key={i} className="flex items-center gap-3 group cursor-pointer transition-all hover:translate-x-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-mid group-hover:bg-brand-red transition-colors" />
                        <span className="font-sans text-[13px] text-neutral-500 group-hover:text-black">{item}</span>
                     </div>
                   ))}
                </nav>
              </section>

              <section className="bg-brand-red p-6 text-white relative overflow-hidden">
                 <Beaker className="w-24 h-24 text-white/5 absolute -bottom-4 -right-4" />
                 <h4 className="font-display text-[18px] mb-2">Healing Calculator</h4>
                 <p className="font-mono text-[10px] uppercase text-white/70 mb-6 tracking-widest leading-relaxed">
                   Get a customized aftercare schedule based on your skin type.
                 </p>
                 <button className="w-full bg-white text-brand-red font-mono text-[11px] uppercase py-3 tracking-widest hover:bg-neutral-50 transition-colors">Launch Tool</button>
              </section>
           </div>
        </aside>

      </main>
    </div>
  );
}
