import Link from 'next/link';

export const metadata = {
  title: 'Getting Your First Tattoo — The Complete Guide | TattoosMap',
  description: 'Pain guides, placement science, aftercare protocols and everything your artist should tell you but probably won\'t. The complete first tattoo guide from TattoosMap.',
  alternates: {
    canonical: 'https://tattoosmap.com/first-tattoo'
  },
  openGraph: {
    title: 'Getting Your First Tattoo — The Complete Guide',
    description: 'Everything your artist should tell you but probably won\'t.',
    type: 'website'
  }
}

export const revalidate = 3600;

export default function FirstTattooPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Getting Your First Tattoo — Complete Guide',
    description: 'Pain guides, placement science, aftercare protocols. Everything your artist should tell you but probably won\'t.',
    step: [
      { '@type': 'HowToStep', name: 'Choose your design', text: 'Browse designs by meaning and understand how style affects placement before booking.' },
      { '@type': 'HowToStep', name: 'Understand placement', text: 'Placement determines pain, healing time, and how the tattoo ages over 10 years.' },
      { '@type': 'HowToStep', name: 'Manage the pain', text: 'Apply numbing cream 45 minutes before under plastic wrap for maximum effect.' },
      { '@type': 'HowToStep', name: 'Prepare for your session', text: 'Eat a full meal, hydrate well, avoid alcohol for 24 hours, wear appropriate clothing.' },
      { '@type': 'HowToStep', name: 'Follow the aftercare protocol', text: 'Aquaphor for 3 days, switch to lightweight moisturizer on Day 4, avoid picking during peeling.' },
      { '@type': 'HowToStep', name: 'Understand the healing timeline', text: 'Surface closes in 2-3 weeks. Full healing and color clarity returns between months 2 and 4.' },
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-white">

        {/* HERO SECTION */}
        <section className="border-b border-gray-light">
          <div className="max-w-[1200px] mx-auto px-6 py-20 md:py-28">
            
            {/* Breadcrumb */}
            <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-8">
              TattoosMap / First Tattoo Guide
            </p>

            <div className="max-w-[720px]">
              {/* Tag */}
              <span className="inline-block font-mono text-[10px] uppercase tracking-widest text-brand-red border border-brand-red px-3 py-1.5 mb-8">
                Complete Guide
              </span>

              {/* H1 */}
              <h1 className="font-display text-[44px] md:text-[64px] uppercase tracking-tight leading-none text-black mb-6">
                Getting Your<br/>First Tattoo
              </h1>

              {/* Subtitle */}
              <p className="font-sans text-[18px] md:text-[20px] text-neutral-500 leading-relaxed max-w-[540px] mb-10">
                Pain guides, placement science, aftercare protocols. Everything your artist should tell you but probably won't.
              </p>

              {/* Stats row */}
              <div className="flex gap-10 border-t border-gray-light pt-8">
                {[
                  { number: '6', label: 'Core Topics' },
                  { number: '12', label: 'Min Read' },
                  { number: '5', label: 'Interactive Tools' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="font-display text-[32px] uppercase text-black leading-none">{stat.number}</p>
                    <p className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* PROGRESS PATH — visual step indicator */}
        <section className="border-b border-gray-light bg-off-white">
          <div className="max-w-[1200px] mx-auto px-6 py-10">
            <p className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-6">
              Your path — in order
            </p>
            <div className="flex flex-wrap gap-0">
              {[
                '01 — Design',
                '02 — Placement',
                '03 — Pain',
                '04 — Prep',
                '05 — Aftercare',
                '06 — Healing',
              ].map((step, i) => (
                <div key={step} className="flex items-center">
                  <span className="font-mono text-[11px] uppercase tracking-widest text-black px-4 py-2 border border-gray-light bg-white">
                    {step}
                  </span>
                  {i < 5 && (
                    <span className="font-mono text-[10px] text-neutral-300 px-1">→</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MAIN CONTENT SECTIONS */}
        <section className="max-w-[1200px] mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-light border border-gray-light">

            {/* SECTION 1 — CHOOSING YOUR DESIGN */}
            <div className="bg-white p-10">
              <span className="font-mono text-[9px] uppercase tracking-widest text-brand-red block mb-4">01</span>
              <h2 className="font-display text-[26px] uppercase tracking-tight text-black mb-4 leading-tight">
                Choosing Your Design
              </h2>
              <p className="font-sans text-[15px] text-neutral-600 leading-relaxed mb-6">
                The biggest mistake first-timers make is picking a design before they understand their placement options. Your design and your placement are the same decision. A fine line rose that works on a forearm looks completely different on a rib.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Browse the gallery by meaning, not just by style',
                  'Understand what each style demands from your skin',
                  'Ask your artist how the design ages — not just how it looks now',
                  'Give the idea at least 2 weeks before booking',
                ].map((item) => (
                  <li key={item} className="flex gap-3 items-start">
                    <span className="text-brand-red font-mono text-[11px] mt-1 shrink-0">—</span>
                    <span className="font-sans text-[14px] text-neutral-600">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/gallery"
                className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-brand-red hover:gap-3 transition-all"
              >
                Browse the gallery →
              </Link>
            </div>

            {/* SECTION 2 — PLACEMENT SCIENCE */}
            <div className="bg-white p-10">
              <span className="font-mono text-[9px] uppercase tracking-widest text-brand-red block mb-4">02</span>
              <h2 className="font-display text-[26px] uppercase tracking-tight text-black mb-4 leading-tight">
                Placement Science
              </h2>
              <p className="font-sans text-[15px] text-neutral-600 leading-relaxed mb-6">
                Placement determines pain, healing time, ink longevity, and how the design looks in 10 years. Your artist will have preferences. Know the science before you sit down so you can have a real conversation instead of just agreeing to whatever they suggest.
              </p>

              {/* Pain level quick reference */}
              <div className="space-y-2 mb-8">
                {[
                  { zone: 'Outer forearm, thigh', level: 'LOW', width: '25%' },
                  { zone: 'Inner arm, wrist', level: 'MEDIUM', width: '55%' },
                  { zone: 'Ribs, spine, inner elbow', level: 'HIGH', width: '90%' },
                ].map((row) => (
                  <div key={row.zone} className="flex items-center gap-4">
                    <span className="font-mono text-[9px] uppercase text-neutral-500 w-[160px] shrink-0">{row.zone}</span>
                    <div className="flex-1 h-[3px] bg-neutral-100">
                      <div
                        className="h-full bg-brand-red"
                        style={{ width: row.width }}
                      />
                    </div>
                    <span className="font-mono text-[9px] uppercase text-neutral-400 w-[44px] text-right">{row.level}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/tools/pain-map"
                className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-brand-red hover:gap-3 transition-all"
              >
                Check your placement →
              </Link>
            </div>

            {/* SECTION 3 — MANAGING THE PAIN */}
            <div className="bg-white p-10">
              <span className="font-mono text-[9px] uppercase tracking-widest text-brand-red block mb-4">03</span>
              <h2 className="font-display text-[26px] uppercase tracking-tight text-black mb-4 leading-tight">
                Managing the Pain
              </h2>
              <p className="font-sans text-[15px] text-neutral-600 leading-relaxed mb-6">
                The pain is real but it is manageable. Most people rate the experience as uncomfortable rather than unbearable — especially on low-pain placements. The two things that make the biggest difference are preparation and numbing cream applied correctly.
              </p>

              {/* Key callout */}
              <div className="border-l-2 border-brand-red pl-4 py-2 bg-brand-red/5 mb-8">
                <p className="font-mono text-[9px] uppercase tracking-widest text-brand-red mb-1">Critical fact</p>
                <p className="font-sans text-[14px] text-black">
                  Numbing cream applied 10 minutes before works at 20% capacity. Applied 45 minutes before under plastic wrap it works at full capacity. The timing is pharmacology — not a suggestion.
                </p>
              </div>

              <Link
                href="/blog/best-numbing-cream"
                className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-brand-red hover:gap-3 transition-all"
              >
                Numbing cream guide →
              </Link>
            </div>

            {/* SECTION 4 — BEFORE YOUR SESSION */}
            <div className="bg-white p-10">
              <span className="font-mono text-[9px] uppercase tracking-widest text-brand-red block mb-4">04</span>
              <h2 className="font-display text-[26px] uppercase tracking-tight text-black mb-4 leading-tight">
                Before Your Session
              </h2>
              <p className="font-sans text-[15px] text-neutral-600 leading-relaxed mb-6">
                What you do in the 24 hours before your appointment changes how your session goes more than most people realize. Hydration, food, sleep, and alcohol avoidance are not optional wellness advice — they directly affect how your skin takes ink and how long you can sit.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Eat a full meal within 2 hours of your appointment — blood sugar drops during long sessions',
                  'Hydrate well the day before — dehydrated skin is harder to tattoo',
                  'No alcohol for 24 hours — thins blood and amplifies pain sensitivity',
                  'Wear loose clothing that gives your artist easy access to the placement',
                  'Moisturize the area for 3 to 5 days before — well-hydrated skin holds ink better',
                ].map((item) => (
                  <li key={item} className="flex gap-3 items-start">
                    <span className="text-brand-red font-mono text-[11px] mt-1 shrink-0">—</span>
                    <span className="font-sans text-[14px] text-neutral-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* SECTION 5 — AFTERCARE */}
            <div className="bg-white p-10">
              <span className="font-mono text-[9px] uppercase tracking-widest text-brand-red block mb-4">05</span>
              <h2 className="font-display text-[26px] uppercase tracking-tight text-black mb-4 leading-tight">
                Aftercare Protocol
              </h2>
              <p className="font-sans text-[15px] text-neutral-600 leading-relaxed mb-6">
                The tattoo you leave the studio with is not the tattoo you will have in 4 months. How you care for it in the first 14 days determines how it looks for the next 10 years. Most artists hand you a generic aftercare sheet. This is the actual protocol.
              </p>

              {/* Protocol steps */}
              <div className="space-y-4 mb-8">
                {[
                  { day: 'Day 1', instruction: 'Remove wrap after 3-5 hours. Wash with fragrance-free soap. Pat dry with paper towel. Apply thin Aquaphor layer.' },
                  { day: 'Day 4', instruction: 'Stop Aquaphor. Switch to Lubriderm or Hustle Butter. Apply twice daily.' },
                  { day: 'Week 2', instruction: 'Peeling begins. Do not pick. Tap gently for itch. Continue moisturizing twice daily.' },
                  { day: 'Month 2-4', instruction: 'Full color clarity returns. Add mineral SPF permanently for sun-exposed placements.' },
                ].map((step) => (
                  <div key={step.day} className="flex gap-4 items-start">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-brand-red w-[60px] shrink-0 mt-1">{step.day}</span>
                    <p className="font-sans text-[14px] text-neutral-600">{step.instruction}</p>
                  </div>
                ))}
              </div>

              <Link
                href="/tools/healing-tracker"
                className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-brand-red hover:gap-3 transition-all"
              >
                Track your healing day by day →
              </Link>
            </div>

            {/* SECTION 6 — HEALING TIMELINE */}
            <div className="bg-white p-10">
              <span className="font-mono text-[9px] uppercase tracking-widest text-brand-red block mb-4">06</span>
              <h2 className="font-display text-[26px] uppercase tracking-tight text-black mb-4 leading-tight">
                What Normal Looks Like
              </h2>
              <p className="font-sans text-[15px] text-neutral-600 leading-relaxed mb-6">
                First-timers panic at every stage of healing because nobody told them what to expect. The redness is normal. The peeling is normal. The milky cloudy look in week 3 is normal. Here is what each stage actually means.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  { stage: 'Days 1-3', label: 'Open wound phase', note: 'Redness, swelling, plasma weeping — all normal. Reduces daily.' },
                  { stage: 'Week 2', label: 'Peeling phase', note: 'Skin sheds like a sunburn. Ink is in the dermis — it does not come off.' },
                  { stage: 'Weeks 3-4', label: 'Cloudy phase', note: 'Looks dull and milky. New skin cells haven\'t matured yet. Color is still there.' },
                  { stage: 'Month 2-4', label: 'Full reveal', note: 'Cells mature and become transparent. Final color and line clarity appears.' },
                ].map((item) => (
                  <div key={item.stage} className="border-l border-gray-light pl-4">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">{item.stage}</span>
                      <span className="font-mono text-[9px] uppercase tracking-widest text-black">{item.label}</span>
                    </div>
                    <p className="font-sans text-[13px] text-neutral-500">{item.note}</p>
                  </div>
                ))}
              </div>
              <Link
                href="/blog/tattoo-healing-process"
                className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-brand-red hover:gap-3 transition-all"
              >
                Full healing guide →
              </Link>
            </div>

          </div>
        </section>

        {/* TOOLS STRIP */}
        <section className="border-t border-b border-gray-light bg-off-white">
          <div className="max-w-[1200px] mx-auto px-6 py-12">
            <p className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-8">
              Tools built for first-timers
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-light border border-gray-light">
              {[
                { name: 'Pain Map', desc: 'Check pain level for your placement before booking', href: '/tools/pain-map' },
                { name: 'Cost Calculator', desc: 'Estimate total cost by size, style and placement', href: '/tools/cost-estimator' },
                { name: 'Healing Tracker', desc: 'Track every stage from Day 1 to Month 4', href: '/tools/healing-tracker' },
                { name: 'Skin Checker', desc: 'Find the right aftercare product for your skin type', href: '/tools/skin-compatibility' },
              ].map((tool) => (
                <Link
                  key={tool.name}
                  href={tool.href}
                  className="bg-white p-6 group hover:bg-neutral-50 transition-colors"
                >
                  <p className="font-display text-[16px] uppercase text-black mb-2 group-hover:text-brand-red transition-colors">
                    {tool.name}
                  </p>
                  <p className="font-sans text-[13px] text-neutral-500 leading-relaxed mb-4">
                    {tool.desc}
                  </p>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-brand-red">
                    Open tool →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-[1200px] mx-auto px-6 py-16">
          <h2 className="font-display text-[28px] uppercase tracking-tight text-black mb-10">
            Questions Everyone Has
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[900px]">
            {[
              {
                q: 'How much does a first tattoo cost?',
                a: 'Most shops have a minimum charge of $80 to $150 for anything small. A meaningful piece — palm-sized, decent detail — runs $150 to $400 depending on the artist and the city. Do not choose your first artist based on price.'
              },
              {
                q: 'How much does it actually hurt?',
                a: 'Less than most people fear. Placement matters more than anything else. The outer forearm and thigh are very manageable. The ribs and spine are genuinely intense. Most people describe the experience as uncomfortable rather than unbearable.'
              },
              {
                q: 'How long does a tattoo take to heal?',
                a: 'The surface closes in 2 to 3 weeks. The full skin stack takes 3 to 4 months. The final color and clarity of your tattoo appears between months 2 and 4 — not at the end of Week 2 when it looks fully healed on the surface.'
              },
              {
                q: 'Can I work out after getting a tattoo?',
                a: 'Not for at least 48 hours. Sweat introduces bacteria to an open wound. Friction from clothing or equipment disrupts the forming epidermis. Light walking is fine. Weights, swimming, and contact sports wait at minimum 2 weeks.'
              },
              {
                q: 'How do I find the right artist?',
                a: 'Find an artist whose existing portfolio already contains work similar to what you want — in the same style, at roughly the same scale. Do not ask a traditional artist for fine line. Do not ask a realism artist for bold geometric. The portfolio tells you everything.'
              },
              {
                q: 'What should I avoid before my appointment?',
                a: 'Alcohol for 24 hours. Sun exposure on the placement area for 2 weeks prior. Blood thinners like aspirin unless medically prescribed. Anything that dehydrates you. Eat a proper meal within 2 hours of your appointment — blood sugar drops affect your session significantly.'
              },
            ].map((faq) => (
              <div key={faq.q} className="border-t border-gray-light pt-6">
                <h3 className="font-display text-[16px] uppercase tracking-tight text-black mb-3">
                  {faq.q}
                </h3>
                <p className="font-sans text-[14px] text-neutral-600 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="border-t border-gray-light">
          <div className="max-w-[1200px] mx-auto px-6 py-16 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <p className="font-display text-[28px] uppercase tracking-tight text-black mb-2">
                Ready to find your design?
              </p>
              <p className="font-sans text-[15px] text-neutral-500">
                Browse thousands of curated designs sorted by meaning, style, and placement.
              </p>
            </div>
            <Link
              href="/gallery"
              className="shrink-0 inline-flex items-center gap-3 bg-black text-white font-mono text-[11px] uppercase tracking-widest px-8 py-4 hover:bg-brand-red transition-colors"
            >
              Explore the gallery →
            </Link>
          </div>
        </section>

      </main>
    </>
  );
}
