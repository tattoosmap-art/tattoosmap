import React from "react";
import Image from "next/image";
import ReadingProgressBar from "@/components/blog/ReadingProgressBar";
import FAQAccordion from "@/components/blog/FAQAccordion";
import PainSimulator from "@/components/blog/PainSimulator";
import RemovalJourneyEstimator from "@/components/blog/RemovalJourneyEstimator";

export const metadata = {
  title: "How Much Does Laser Tattoo Removal Cost in 2026 — The Honest Guide",
  description: "Laser tattoo removal costs between $200 and $500 per session in the US and UK. Most tattoos require 6 to 12 sessions. This guide gives you the real numbers, the real timeline, and the real factors."
};

export default function RemovalPricingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* 1. READING PROGRESS BAR */}
      <ReadingProgressBar />

      {/* 3. HERO SECTION */}
      <div className="w-full relative aspect-[16/9] mb-12">
        <Image 
          src="/blog/hero-removal.jpg" 
          alt="Laser tattoo removal treatment session"
          fill
          className="object-cover"
          priority
        />
      </div>

      <main className="max-w-[680px] mx-auto px-5 pb-24">
        {/* 4. ARTICLE HEADER */}
        <div className="mb-12">
          <div className="flex gap-4 items-center mb-6">
            <span className="font-mono text-[10px] uppercase text-brand-red border-[0.5px] border-brand-red px-[8px] py-[3px]">
              COST AND PRICING
            </span>
            <span className="font-mono text-[11px] text-neutral-400">12 MIN READ</span>
          </div>

          <h1 className="font-display text-[34px] md:text-[48px] leading-[1.1] text-black mb-6">
            How Much Does Laser Tattoo Removal Cost in 2026 — The Honest Guide
          </h1>

          <div className="font-mono text-[11px] text-neutral-400 mb-8">
            By TattoosMap Editorial — Updated April 2026
          </div>

          <div className="italic text-[18px] border-l-[3px] border-brand-red pl-6 mb-8 text-black/90 leading-[1.6]">
            Laser tattoo removal costs between $200 and $500 per session in the US and UK. Most tattoos require 6 to 12 sessions. This guide gives you the real numbers, the real timeline, and the real factors that determine your specific cost — with no vague price ranges.
          </div>

          <div className="font-mono text-[11px] text-neutral-400 leading-[1.5]">
            DISCLOSURE: This guide contains referral links to verified removal clinics. We earn a small fee if you book a consultation — at no cost to you.
          </div>
        </div>

        {/* 5. TABLE OF CONTENTS */}
        <div className="border border-gray-light bg-off-white p-6 mb-12">
          <div className="font-mono text-[11px] uppercase text-black mb-4">CONTENTS</div>
          <ol className="list-decimal pl-5 space-y-2 font-sans text-[14px] text-brand-red marker:text-brand-red">
            <li><a href="#short-answer" className="hover:underline">The Short Answer</a></li>
            <li><a href="#what-affects-cost" className="hover:underline">What Affects Your Cost</a></li>
            <li><a href="#healing-window" className="hover:underline">The 8-Week Healing Window</a></li>
            <li><a href="#what-to-expect" className="hover:underline">What To Expect: Session by Session</a></li>
            <li><a href="#cover-up" className="hover:underline">Cover-Up While You Wait</a></li>
            <li><a href="#faq" className="hover:underline">Frequently Asked Questions</a></li>
          </ol>
        </div>

        {/* 6. BODY CONTENT SECTION 1 */}
        <h2 id="short-answer" className="font-display text-[28px] uppercase tracking-tight text-black mb-4 mt-12">The Short Answer</h2>
        <p className="font-sans text-[17px] leading-[1.5] text-black/90 mb-12">
          A standard black ink tattoo the size of a palm costs $1,200 to $3,500 total for complete removal in the US. In the UK expect £800 to £2,500. Per session prices range from $150 to $500 depending on size, location, and technology used.
        </p>

        {/* 7. INTERACTIVE TOOL */}
        <div id="estimator">
          <RemovalJourneyEstimator />
        </div>

        {/* 8. BODY CONTENT SECTION 2 */}
        <h2 id="what-affects-cost" className="font-display text-[28px] uppercase tracking-tight text-black mb-6 mt-12">What Affects Your Cost</h2>
        <div className="space-y-8 mb-12">
          <div>
            <h3 className="font-display text-[20px] text-black mb-2">Size and Complexity</h3>
            <p className="font-sans text-[17px] leading-[1.5] text-black/90">The square inch area dictates the per-session cost. Layered complexity requires more passes.</p>
          </div>
          <div>
            <h3 className="font-display text-[20px] text-black mb-2">Ink Color</h3>
            <p className="font-sans text-[17px] leading-[1.5] text-black/90">Black responds best. Blues and greens require specialized 755nm wavelengths and extra sessions.</p>
          </div>
          <div>
            <h3 className="font-display text-[20px] text-black mb-2">Technology Used</h3>
            <p className="font-sans text-[17px] leading-[1.5] text-black/90">PicoSure clears ink faster but costs more per session than traditional Q-Switched nanosecond lasers.</p>
          </div>
        </div>

        {/* 9. INTERACTIVE TOOL */}
        <PainSimulator />

        {/* 10. BODY CONTENT SECTION 3 */}
        <h2 id="healing-window" className="font-display text-[28px] uppercase tracking-tight text-black mb-4 mt-12">The 8-Week Healing Window</h2>
        <p className="font-sans text-[17px] leading-[1.5] text-black/90 mb-12">
          Your body's lymphatic system does the actual removal. The laser simply breaks the ink into manageable particles. Rushing sessions before the macrophages clear the debris risks permanent hypopigmentation.
        </p>

        {/* 11. BODY CONTENT SECTION 4 */}
        <h2 id="what-to-expect" className="font-display text-[28px] uppercase tracking-tight text-black mb-6 mt-12">What To Expect: Session by Session</h2>
        <div className="space-y-8 mb-12">
          <div>
            <h3 className="font-display text-[20px] text-black mb-2">Session 1</h3>
            <p className="font-sans text-[17px] leading-[1.5] text-black/90 mb-4">Frosting occurs instantly as water vaporizes in the skin, turning the tattoo white.</p>
            <div className="border border-gray-light aspect-video flex items-center justify-center bg-off-white">
              <span className="font-mono text-[11px] text-neutral-400">IMAGE: DAY 1 FROSTING</span>
            </div>
          </div>
        </div>

        {/* 12. BODY CONTENT SECTION 5 */}
        <h2 id="cover-up" className="font-display text-[28px] uppercase tracking-tight text-black mb-4 mt-12">Cover-Up While You Wait</h2>
        <p className="font-sans text-[17px] leading-[1.5] text-black/90 mb-6">
          Removal takes 12-24 months. During that time your tattoo looks faded and patchy. These are the products people actually use for weddings, job interviews, and beach days.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
          <div className="border border-gray-light p-4 flex flex-col items-start gap-3">
            <h4 className="font-display text-[16px] m-0 leading-tight">Dermablend Body Makeup</h4>
            <span className="font-mono text-[12px] text-black">$38.00</span>
            <a href="#affiliate" className="bg-black text-white font-mono text-[10px] uppercase px-3 py-2 w-full text-center mt-auto hover:bg-neutral-900 transition-colors">VIEW ON AMAZON</a>
          </div>
          <div className="border border-gray-light p-4 flex flex-col items-start gap-3">
            <h4 className="font-display text-[16px] m-0 leading-tight">KVD Good Apple Foundation</h4>
            <span className="font-mono text-[12px] text-black">$42.50</span>
            <a href="#affiliate" className="bg-black text-white font-mono text-[10px] uppercase px-3 py-2 w-full text-center mt-auto hover:bg-neutral-900 transition-colors">VIEW ON AMAZON</a>
          </div>
          <div className="border border-gray-light p-4 flex flex-col items-start gap-3">
            <h4 className="font-display text-[16px] m-0 leading-tight">Waterproof Setting Spray</h4>
            <span className="font-mono text-[12px] text-black">$24.00</span>
            <a href="#affiliate" className="bg-black text-white font-mono text-[10px] uppercase px-3 py-2 w-full text-center mt-auto hover:bg-neutral-900 transition-colors">VIEW ON AMAZON</a>
          </div>
        </div>
        
        {/* 13. FAQ SECTION */}
        <h2 id="faq" className="font-display text-[28px] uppercase tracking-tight text-black mb-6 mt-12">Frequently Asked Questions</h2>
        <div className="mb-16">
          <FAQAccordion 
            question="Does laser tattoo removal leave scars?" 
            answer="No, when performed correctly by a qualified technician. Scarring occurs from: too-short intervals between sessions, incorrect laser settings for skin tone, or at-home devices. Clinics using FDA-cleared technology and 6-8 week intervals have less than 2% scarring rates."
          />
          <FAQAccordion 
            question="Can tattoos be completely removed?" 
            answer="Black ink: yes, in 95% of cases. Colored ink (especially green and blue): 80-90% clearance is the realistic expectation."
          />
          <FAQAccordion 
            question="What about at-home tattoo removal creams?" 
            answer="Honest answer: they do not work. Most contain trichloroacetic acid which burns the top skin layer but leaves the ink particles in the dermis untouched. The tattoo remains. The burn does not."
          />
          <FAQAccordion 
            question="How many sessions do I actually need?" 
            answer="Industry advertising says 3-6 sessions. Clinical reality is 6-12 for most tattoos. The difference: advertising shows ideal cases. Reality includes amateur ink, dense packing, and difficult colors."
          />
          <FAQAccordion 
            question="Is there a way to speed up the process?" 
            answer="Yes: maintain excellent skin health, avoid UV exposure on the treated area, stay well hydrated (lymphatic system efficiency), and do not smoke (smoking slows lymphatic clearance by 30%)."
          />
          <FAQAccordion 
            question="How do I find a reputable clinic?" 
            answer="Look for: FDA-cleared PicoSure or Revlite technology, trained technicians not beauty therapists, patch test offered, no guaranteed-removal promises, transparent per-session pricing."
          />
        </div>

      </main>

      {/* 14. LEAD GENERATION CTA SECTION */}
      <div className="w-full bg-black py-16 px-5 text-center">
        <h2 className="font-display text-[40px] text-white leading-tight mb-4 max-w-[680px] mx-auto">Ready to Start?</h2>
        <p className="font-sans text-[17px] text-neutral-400 max-w-[680px] mx-auto mb-8">
          Get a free consultation quote from a verified removal clinic. No commitment, just a real price for your specific tattoo.
        </p>
        <a href="#affiliate" className="inline-block bg-brand-red text-white font-mono text-[13px] uppercase px-10 py-5 transition-colors hover:bg-red-600 mb-4">
          FIND A CLINIC NEAR YOU
        </a>
        <div className="font-mono text-[11px] text-neutral-400">
          TattoosMap earns a referral fee if you book. This does not affect the price you pay.
        </div>
      </div>

      {/* 15. RELATED POSTS */}
      <div className="max-w-[680px] mx-auto px-5 py-16 border-t border-gray-light mt-16">
        <h2 className="font-mono text-[11px] uppercase text-black mb-6">RELATED GUIDES</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-gray-light p-5 flex flex-col items-start">
            <h3 className="font-display text-[18px] text-black mb-6 leading-snug">5 Best Numbing Creams for Laser Removal</h3>
            <a href="#" className="font-mono text-[10px] uppercase text-brand-red mt-auto hover:text-red-700">READ MORE</a>
          </div>
          <div className="border border-gray-light p-5 flex flex-col items-start">
            <h3 className="font-display text-[18px] text-black mb-6 leading-snug">How To Hide a Fading Tattoo</h3>
            <a href="#" className="font-mono text-[10px] uppercase text-brand-red mt-auto hover:text-red-700">READ MORE</a>
          </div>
          <div className="border border-gray-light p-5 flex flex-col items-start">
            <h3 className="font-display text-[18px] text-black mb-6 leading-snug">PicoSure vs Q-Switched — Which Removes Tattoos Faster</h3>
            <a href="#" className="font-mono text-[10px] uppercase text-brand-red mt-auto hover:text-red-700">READ MORE</a>
          </div>
        </div>
      </div>
    </div>
  );
}
