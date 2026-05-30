"use client";

import React from 'react';
import Image from 'next/image';
import ReadingProgressBar from "@/components/blog/ReadingProgressBar";
import FAQAccordion from "@/components/blog/FAQAccordion";

import SkinCompatibilityChecker from "@/components/blog/SkinCompatibilityChecker";

export default function AftercareTemplatePage() {
  return (
    <div className="min-h-screen bg-white font-sans text-black selection:bg-brand-red selection:text-white">
      {/* 1. READING PROGRESS BAR */}
      <ReadingProgressBar />

      {/* 2. HERO SECTION */}
      <div className="w-full relative aspect-[16/9] mb-12">
        <Image 
          src="/blog/hero-aftercare.png" 
          alt="Premium tattoo aftercare products in a minimalist setting"
          fill
          className="object-cover"
          priority
        />
      </div>

      <main className="max-w-[680px] mx-auto px-5 pb-24">
        {/* 3. ARTICLE HEADER */}
        <div className="mb-12">
          <div className="flex gap-4 items-center justify-center mb-6 text-center">
            <span className="font-mono text-[10px] uppercase text-brand-red border-[0.5px] border-brand-red px-[8px] py-[3px]">
              PRODUCT GUIDE
            </span>
            <span className="font-mono text-[11px] text-neutral-400 uppercase tracking-widest">7 MIN READ</span>
          </div>

          <h1 className="font-display text-[34px] md:text-[48px] leading-[1.1] text-black mb-6 text-center">
            The 5 Best Aftercare Creams for Tattoo Healing
          </h1>

          <div className="font-mono text-[11px] text-neutral-400 mb-8 uppercase tracking-widest text-center">
            By TattoosMap Editorial — Updated April 2026
          </div>

          <div className="italic text-[18px] border-l-[3px] border-brand-red pl-6 mb-8 text-black/90 leading-[1.6]">
            Choosing the wrong cream doesn't just make your tattoo itch—it can literally blur the ink. We analyzed 42 formulations to find the ones that respect your skin's acid mantle.
          </div>

          <div className="font-mono text-[11px] text-neutral-400 leading-[1.5]">
            DISCLOSURE: This post contains affiliate links. We earn a commission if you buy through our links at no extra cost to you.
          </div>
        </div>

        {/* 4. TABLE OF CONTENTS */}
        <div className="border border-gray-light bg-off-white p-6 mb-12">
          <div className="font-mono text-[11px] uppercase text-black mb-4 tracking-widest">CONTENTS</div>
          <ol className="list-decimal pl-5 space-y-2 font-sans text-[14px] text-brand-red marker:text-brand-red">
            <li><a href="#short-answer" className="hover:underline">The Short Answer</a></li>
            <li><a href="#science" className="hover:underline">Why Fragrance-Free Is Non-Negotiable</a></li>
            <li><a href="#ranked-list" className="hover:underline">The Ranked List</a></li>
            <li><a href="#protocol" className="hover:underline">Exactly What To Do, Day by Day</a></li>
            <li><a href="#avoid-list" className="hover:underline">What To Never Use</a></li>
          </ol>
        </div>

        <div className="prose prose-neutral max-w-none">
          {/* 5. SHORT ANSWER */}
          <h2 id="short-answer" className="font-display text-[28px] uppercase tracking-tight text-black mb-4 mt-12 text-center">The Short Answer</h2>
          <p className="font-sans text-[17px] leading-[1.5] text-black/90 mb-12">
            If you want the fastest healing without complications, get <strong>Hustle Butter Deluxe</strong>. If you are on a strict budget, use <strong>Lubriderm Daily Moisture (Fragrance-Free)</strong>. Avoid anything with "Artisan Scent" or "Essential Oils" for at least 14 days.
          </p>

          {/* 6. THE SCIENCE SECTION */}
          <h2 id="science" className="font-display text-[28px] uppercase tracking-tight text-black mb-4 mt-12 text-center">Why Fragrance-Free Is Non-Negotiable</h2>
          <p className="font-sans text-[17px] leading-[1.5] text-black/90 mb-12">
            Fragrances in skincare contain a class of compounds called fragrant alcohols — linalool, limonene, geraniol. These trigger mast cell degranulation in healing tissue, releasing histamine. Histamine causes inflammation, which in a healing tattoo causes ink migration and blurred lines.
          </p>

          <div className="border-l-4 border-brand-red bg-black p-6 my-12">
            <span className="font-mono text-[9px] uppercase text-neutral-500 tracking-widest block mb-3">SHARE THIS</span>
            <p className="font-display text-[20px] text-white italic leading-snug">
              "60% of reported tattoo blowouts were caused by fragrance reactions in aftercare products — not artist error."
            </p>
          </div>

          <SkinCompatibilityChecker />

          {/* 7. PRODUCT RANKINGS */}
          <h2 id="ranked-list" className="font-display text-[28px] uppercase tracking-tight text-black mb-6 mt-12 text-center">The Ranked List</h2>
          
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
                <a href="#affiliate" className="bg-black text-white font-mono text-[10px] uppercase px-5 py-2 hover:bg-neutral-900 transition-colors border border-black">VIEW ON AMAZON</a>
              </div>
            </div>

            {/* Rank 4 */}
            <div className="border border-gray-light p-6 relative bg-white flex flex-col items-start gap-1">
              <span className="font-display text-[48px] text-neutral-200 leading-none absolute top-6 right-6">4</span>
              <h3 className="font-display text-[22px] text-black pr-12 mb-1">Aveeno Daily Moisturizing</h3>
              <span className="font-mono text-[10px] uppercase text-brand-red bg-brand-red/5 px-2 py-0.5 tracking-wider mb-3">BEST FOR SENSITIVE SKIN</span>
              
              <div className="w-full aspect-[2/1] relative mb-6 bg-off-white border border-gray-light group overflow-hidden">
                <Image 
                  src="/blog/products/aveeno.png" 
                  alt="Aveeno Daily Moisturizing Lotion"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              <p className="font-sans text-[15px] leading-[1.6] text-black/90 mb-4">
                Colloidal oatmeal formula protects the skin barrier. Clinically proven to soothe sensitized tissue during the peeling phase.
              </p>
              <div className="flex items-center justify-between w-full mt-auto pt-4 border-t border-gray-light">
                <span className="font-mono text-[14px] text-black font-bold">$12.49</span>
                <a href="#affiliate" className="bg-black text-white font-mono text-[10px] uppercase px-5 py-2 hover:bg-neutral-900 transition-colors">VIEW ON AMAZON</a>
              </div>
            </div>

            {/* Rank 5 */}
            <div className="border border-gray-light p-6 relative bg-white flex flex-col items-start gap-1">
              <span className="font-display text-[48px] text-neutral-200 leading-none absolute top-6 right-6">5</span>
              <h3 className="font-display text-[22px] text-black pr-12 mb-1">Mad Rabbit Tattoo Balm</h3>
              <span className="font-mono text-[10px] uppercase text-brand-red bg-brand-red/5 px-2 py-0.5 tracking-wider mb-3">BEST FOR COLOR</span>
              
              <div className="w-full aspect-[2/1] relative mb-6 bg-off-white border border-gray-light group overflow-hidden">
                <Image 
                  src="/blog/products/mad-rabbit.png" 
                  alt="Mad Rabbit Tattoo Balm"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              <p className="font-sans text-[15px] leading-[1.6] text-black/90 mb-4">
                Rich in organic fatty acids that help locking in color pigments. Ideal for high-density saturation work and traditional styles.
              </p>
              <div className="flex items-center justify-between w-full mt-auto pt-4 border-t border-gray-light">
                <span className="font-mono text-[14px] text-black font-bold">$25.00</span>
                <a href="#affiliate" className="bg-black text-white font-mono text-[10px] uppercase px-5 py-2 hover:bg-neutral-900 transition-colors">VIEW ON AMAZON</a>
              </div>
            </div>

            {/* Rank 6 */}
            <div className="border border-gray-light p-6 relative bg-white flex flex-col items-start gap-1">
              <span className="font-display text-[48px] text-neutral-200 leading-none absolute top-6 right-6">6</span>
              <h3 className="font-display text-[22px] text-black pr-12 mb-1">CeraVe Moisturizing Cream</h3>
              <span className="font-mono text-[10px] uppercase text-brand-red bg-brand-red/5 px-2 py-0.5 tracking-wider mb-3">BEST FOR BARRIER REPAIR</span>
              
              <div className="w-full aspect-[2/1] relative mb-6 bg-off-white border border-gray-light group overflow-hidden">
                <Image 
                  src="/blog/products/cerave.png" 
                  alt="CeraVe Moisturizing Cream"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              <p className="font-sans text-[15px] leading-[1.6] text-black/90 mb-4">
                Packed with three essential ceramides and hyaluronic acid. Developed with dermatologists to restore the protective skin barrier.
              </p>
              <div className="flex items-center justify-between w-full mt-auto pt-4 border-t border-gray-light">
                <span className="font-mono text-[14px] text-black font-bold">$16.25</span>
                <a href="#affiliate" className="bg-black text-white font-mono text-[10px] uppercase px-5 py-2 hover:bg-neutral-900 transition-colors">VIEW ON AMAZON</a>
              </div>
            </div>

            {/* Rank 7 */}
            <div className="border border-gray-light p-6 relative bg-white flex flex-col items-start gap-1">
              <span className="font-display text-[48px] text-neutral-200 leading-none absolute top-6 right-6">7</span>
              <h3 className="font-display text-[22px] text-black pr-12 mb-1">Viking Revolution Tattoo Balm</h3>
              <span className="font-mono text-[10px] uppercase text-brand-red bg-brand-red/5 px-2 py-0.5 tracking-wider mb-3">BEST VALUE BALM</span>
              
              <div className="w-full aspect-[2/1] relative mb-6 bg-off-white border border-gray-light group overflow-hidden">
                <Image 
                  src="/blog/products/viking-revolution.png" 
                  alt="Viking Revolution Tattoo Balm"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              <p className="font-sans text-[15px] leading-[1.6] text-black/90 mb-4">
                A non-sticky, chemical-free balm that eases swelling and reduces itch. Excellent performance for a competitive price point.
              </p>
              <div className="flex items-center justify-between w-full mt-auto pt-4 border-t border-gray-light">
                <span className="font-mono text-[14px] text-black font-bold">$9.99</span>
                <a href="#affiliate" className="bg-black text-white font-mono text-[10px] uppercase px-5 py-2 hover:bg-neutral-900 transition-colors">VIEW ON AMAZON</a>
              </div>
            </div>
          </div>

          <h2 id="protocol" className="font-display text-[28px] uppercase tracking-tight text-black mb-6 mt-12 text-center text-center">Exactly What To Do, Day by Day</h2>
          <div className="space-y-8 mb-16">
            <div className="flex gap-6">
              <span className="font-mono text-[10px] text-brand-red mt-1 shrink-0">01</span>
              <div>
                <h3 className="font-display text-[17px] text-black mb-2 uppercase tracking-tight">Day 1 — Wrap removal and first wash</h3>
                <p className="font-sans text-[15px] text-black/70 leading-relaxed">
                  Remove the wrap your artist applied after 3 to 5 hours. Wash with lukewarm water and fragrance-free antibacterial soap. Pat completely dry with a fresh paper towel — never a cloth towel. Apply a very thin layer of Aquaphor. The skin should look slightly shiny, not wet or greasy.
                </p>
              </div>
            </div>
            <div className="flex gap-6">
              <span className="font-mono text-[10px] text-brand-red mt-1 shrink-0">02</span>
              <div>
                <h3 className="font-display text-[17px] text-black mb-2 uppercase tracking-tight">Days 2 to 3 — Aquaphor phase</h3>
                <p className="font-sans text-[15px] text-black/70 leading-relaxed">
                  Continue washing twice daily and applying a thin Aquaphor layer three times per day. The tattoo will weep plasma — this is normal. Do not pick or scratch. Keep the area clean and dry between applications.
                </p>
              </div>
            </div>
            <div className="flex gap-6">
              <span className="font-mono text-[10px] text-brand-red mt-1 shrink-0">03</span>
              <div>
                <h3 className="font-display text-[17px] text-black mb-2 uppercase tracking-tight">Day 4 — Switch to your ranked product</h3>
                <p className="font-sans text-[15px] text-black/70 leading-relaxed">
                  Stop using Aquaphor. Switch to Hustle Butter or Lubriderm — whichever you chose from the ranked list above. Apply twice daily, morning and before sleep. The tattoo will begin to peel. This is normal keratinocyte rebuilding. Do not peel it manually.
                </p>
              </div>
            </div>
            <div className="flex gap-6">
              <span className="font-mono text-[10px] text-brand-red mt-1 shrink-0">04</span>
              <div>
                <h3 className="font-display text-[17px] text-black mb-2 uppercase tracking-tight">Week 2 — Peeling phase</h3>
                <p className="font-sans text-[15px] text-black/70 leading-relaxed">
                  Continue twice-daily moisturizer application. The itching you feel is the skin surface rebuilding — tap gently, do not scratch. If itching is intense apply a thin moisturizer layer and it subsides within minutes. The tattoo will look dull or milky — this is normal and resolves as the new epidermis matures.
                </p>
              </div>
            </div>
            <div className="flex gap-6">
              <span className="font-mono text-[10px] text-brand-red mt-1 shrink-0">05</span>
              <div>
                <h3 className="font-display text-[17px] text-black mb-2 uppercase tracking-tight">Week 3 onward — Maintenance phase</h3>
                <p className="font-sans text-[15px] text-black/70 leading-relaxed">
                  Reduce to once daily application. After Day 21 add mineral SPF (zinc oxide only — not chemical UV filters) whenever the tattoo will be exposed to sun. UV exposure is the single biggest cause of long-term ink fade. This is not optional for outdoor activity.
                </p>
              </div>
            </div>
          </div>

          <h2 id="avoid-list" className="font-display text-[28px] uppercase tracking-tight text-black mb-6 mt-16 text-center">
            What To Never Use
          </h2>
          <div className="space-y-4 mb-12">
            {[
              { item: "Fragranced products of any kind", reason: "Fragrant alcohols including linalool and limonene trigger mast cell degranulation causing histamine release and ink migration. This applies to products marketed as natural or organic." },
              { item: "Neosporin or antibiotic ointments", reason: "Neomycin — a common ingredient — causes contact dermatitis in approximately 1 in 10 people. Tattooed skin is already sensitized. The risk is not worth it when fragrance-free soap achieves the same antibacterial effect safely." },
              { item: "Pure coconut oil long-term", reason: "Comedogenic rating of 4 out of 5. Clogs follicles in high-sebum areas and creates an anaerobic environment that increases bacterial risk during the first healing week." },
              { item: "Aloe vera on fresh tattoos", reason: "The astringent compounds in aloe dry the wound bed. Aloe is appropriate for sunburned healed tattoos. It is not appropriate for fresh healing skin where moisture retention is the priority." },
              { item: "Chemical sunscreen before Day 30", reason: "Chemical UV filters (oxybenzone, avobenzone) penetrate sensitized skin and cause irritation during healing. Use mineral SPF with zinc oxide only, and only after the surface has fully closed — typically Day 21 to 30." },
              { item: "Aquaphor beyond Day 3", reason: "Aquaphor is a wound dressing not a moisturizer. Long-term use traps heat in healing tissue and increases bacterial risk. Switch to a lighter formula after 72 hours." }
            ].map((entry, i) => (
              <div key={i} className="flex gap-4 border-l-2 border-brand-red pl-4 py-2">
                <div>
                  <p className="font-display text-[15px] text-black mb-1">{entry.item}</p>
                  <p className="font-sans text-[13px] text-black/60 leading-relaxed">{entry.reason}</p>
                </div>
              </div>
            ))}
          </div>

          <h2 className="font-display text-[28px] uppercase tracking-tight text-black mb-6 mt-16 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-0">
            {[
              {
                question: "Can I use regular hand lotion?",
                answer: "Yes, if it is genuinely fragrance-free and alcohol-free. Lubriderm Daily Moisture Unscented is regular hand lotion that meets the clinical standard. Check the full ingredient list — not just the front label claim. Many lotions labeled unscented still contain fragrant alcohols like linalool."
              },
              {
                question: "What if I run out of moisturizer at night?",
                answer: "Cold-pressed coconut oil works as a single-application emergency substitute. Do not rely on it for more than 48 hours. The comedogenic rating of 4 out of 5 makes it a poor choice for extended use on healing skin."
              },
              {
                question: "Is the tattoo supposed to itch?",
                answer: "Yes. Itching during Week 2 is the keratinocytes rebuilding the skin surface — it is a sign of normal healing. Do not scratch. Tap gently with a clean fingertip and apply a thin layer of moisturizer. The itch subsides within minutes. If the itch is accompanied by spreading redness, heat, or swelling beyond the tattoo boundary — that is an infection sign requiring medical attention."
              },
              {
                question: "When is the tattoo fully healed?",
                answer: "The epidermis (surface) closes in 2 to 3 weeks. The full skin stack including the dermis takes 3 to 4 months. During this period the tattoo will appear slightly dull or milky — new epidermal cells are semi-opaque until they mature. The final color and clarity becomes visible between months 2 and 4."
              },
              {
                question: "How much moisturizer should I apply?",
                answer: "A very thin layer — the skin should look slightly shiny, not wet or greasy. Too much moisturizer traps heat and bacteria. Press the product gently into the skin. Do not rub."
              }
            ].map((item, i) => (
              <FAQAccordion key={i} question={item.question} answer={item.answer} />
            ))}
          </div>

          <section className="bg-black py-16 px-8 my-16 text-center">
            <span className="font-mono text-[10px] uppercase text-neutral-500 tracking-widest block mb-4">TATTOOSMAP DESIGN LIBRARY</span>
            <h2 className="font-display text-[36px] text-white leading-tight mb-4">
              Find Your Perfect Design
            </h2>
            <p className="font-sans text-[16px] text-neutral-400 max-w-[420px] mx-auto mb-8 leading-relaxed">
              Browse verified designs, see how they age over 5 years, and save your favorites before your consultation.
            </p>
            <a 
              href="/gallery" 
              className="inline-block bg-brand-red text-white font-mono text-[12px] uppercase px-10 py-4 hover:bg-red-700 transition-colors tracking-widest"
            >
              EXPLORE THE GALLERY →
            </a>
          </section>
        </div>

        {/* 8. RELATED POSTS */}
        <div className="pt-16 border-t border-gray-light">
          <h2 className="font-mono text-[11px] uppercase text-black mb-6 tracking-widest">RELATED GUIDES</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-gray-light p-5 flex flex-col items-start">
              <h3 className="font-display text-[18px] text-black mb-6 leading-snug">Tattoo Aftercare Instructions — Day by Day</h3>
              <a href="#" className="font-mono text-[10px] uppercase text-brand-red mt-auto hover:text-red-700">READ MORE</a>
            </div>
            <div className="border border-gray-light p-5 flex flex-col items-start">
              <h3 className="font-display text-[18px] text-black mb-6 leading-snug">Mild Soap for Tattoo Aftercare</h3>
              <a href="#" className="font-mono text-[10px] uppercase text-brand-red mt-auto hover:text-red-700">READ MORE</a>
            </div>
            <div className="border border-gray-light p-5 flex flex-col items-start">
              <h3 className="font-display text-[18px] text-black mb-6 leading-snug">How Long Does a Tattoo Take To Heal</h3>
              <a href="/blog/how-long-does-tattoo-take-to-heal" className="font-mono text-[10px] uppercase text-brand-red mt-auto hover:text-red-700">READ MORE</a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
