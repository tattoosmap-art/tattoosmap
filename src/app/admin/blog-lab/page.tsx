"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Plus, X, ChevronDown, ChevronUp, Image as ImageIcon, Loader2 } from "lucide-react";
import { uploadBlogImageAction, publishLabPostAction, uploadProductImageAction } from "@/actions/admin";
import rehypeRaw from "rehype-raw";

const MarkdownComponents: any = {
  p: ({...props}: any) => <p className="mb-[20px] font-sans text-[17px] leading-[1.5] text-black/90 break-words" {...props} />,
  h2: ({...props}: any) => <h2 className="text-[24px] font-display mt-12 mb-[20px] uppercase tracking-tight font-medium" {...props} />,
  h3: ({...props}: any) => <h3 className="text-[19px] font-display mt-8 mb-[20px] font-medium" {...props} />,
  blockquote: ({children, ...props}: any) => {
    const text = children?.[0]?.props?.children?.[0] || children?.[0]?.props?.children || "";
    const isPullQuote = typeof text === 'string' && text.trim().startsWith("💡");
    if (isPullQuote) {
      return (
        <div className="bg-black text-white p-[24px_32px] my-12 border-l-[4px] border-brand-red font-display italic text-[22px] leading-[1.4] relative group">
          {children}
          <div className="mt-4 font-mono text-[10px] text-neutral-400 uppercase tracking-widest">SHARE THIS</div>
        </div>
      );
    }
    return (
      <blockquote className="bg-amber-50 border-l-[4px] border-amber-500 pl-6 py-4 my-[20px] italic text-[17px] font-sans text-amber-900 leading-[1.5]" {...props}>
        {children}
      </blockquote>
    );
  },
  div: ({className, children, ...props}: any) => {
    if (className === 'invest-block') {
      return (
        <div className="border border-brand-red bg-brand-red/[0.04] p-[20px_24px] my-8 relative">
          <div className="font-mono text-[10px] text-brand-red uppercase mb-3 tracking-widest font-bold">FROM TATTOOSMAP</div>
          <div className="font-sans text-[15px] leading-relaxed text-black">
            {children}
          </div>
        </div>
      );
    }
    return <div className={className} {...props}>{children}</div>;
  },
  ul: ({...props}: any) => <ul className="list-disc pl-6 mb-[20px] space-y-2 text-[17px] leading-[1.5]" {...props} />,
  ol: ({...props}: any) => <ol className="list-decimal pl-6 mb-[20px] space-y-2 text-[17px] leading-[1.5]" {...props} />,
  li: ({node, className, ...props}: any) => {
    const isCheckbox = className?.includes('task-list-item');
    return (
      <li className={`font-sans ${isCheckbox ? 'list-none flex items-start gap-2 -ml-6' : ''}`}>
        {props.children}
      </li>
    )
  },
  input: ({type, ...props}: any) => {
    if (type === 'checkbox') return <input type="checkbox" className="mt-1.5 w-4 h-4 text-brand-red accent-brand-red rounded-none" {...props} />
    return <input {...props} />
  },
  pre: ({...props}: any) => <pre className="bg-black text-white p-6 whitespace-pre-wrap break-words mb-[20px] font-mono text-[14px] leading-relaxed" {...props} />,
  code: ({...props}: any) => {
    return <code className="font-mono text-[0.9em]" {...props} />
  },
  table: ({...props}: any) => <div className="overflow-x-auto mb-[20px]"><table className="w-full text-left border-collapse border border-gray-light font-sans text-[15px]" {...props} /></div>,
  th: ({...props}: any) => <th className="bg-off-white border border-gray-light p-3 font-medium text-black" {...props} />,
  td: ({...props}: any) => <td className="border border-gray-light p-3 text-black/80" {...props} />,
  img: ({...props}: any) => <span className="block w-screen relative left-[50%] right-[50%] -ml-[50vw] -mr-[50vw] md:w-full md:static md:mx-0 my-[20px]"><img className="w-full h-auto" {...props} /></span>
};

const POST_INTENTS = ["INFORM AND REFER", "RECOMMEND AND SELL"] as const;
type PostIntent = typeof POST_INTENTS[number];

const SUB_TYPES: Record<PostIntent, string[]> = {
  "INFORM AND REFER": [
    "COST AND PRICING",
    "HOW MANY SESSIONS",
    "PAIN GUIDE",
    "NEAR ME GUIDE",
    "SCIENCE GUIDE",
    "MEANING GUIDE",
    "FIRST TIMER"
  ],
  "RECOMMEND AND SELL": [
    "PRODUCT RANKING",
    "MYTH BUSTER",
    "BUYING GUIDE",
    "COVER-UP GUIDE"
  ]
};

const CATEGORIES = [
  "CAT-01 Meaning & Symbolism", "CAT-02 Aftercare & Healing", "CAT-03 Tattoo Removal",
  "CAT-04 Pain & Placement", "CAT-05 Body Zone Specific", "CAT-06 Design Subject Direct",
  "CAT-07 Style Guides", "CAT-08 Design Ideas", "CAT-09 Cost & Pricing",
  "CAT-10 First Timer", "CAT-11 FAQ & How-To", "CAT-12 Artist & Studio",
  "CAT-13 Products & Equipment", "CAT-14 Zodiac & Astrology", "CAT-15 Cultural & Themed",
  "CAT-16 Pop Culture", "CAT-17 Comparison & Versus", "CAT-18 Temporary & Henna"
];

type PostType = string;

const TEMPLATES: Record<PostType, { schema: string; body: string }> = {
  "MEANING GUIDE": {
    schema: "Article",
    body: `## What Does a Butterfly Tattoo Mean? — Memento Vivere

At its core, a butterfly tattoo symbolizes transformation. This stems from the biological process of metamorphosis—the transition from a grounded caterpillar into a winged creature. For many, this represents a major life shift, overcoming a period of struggle (the cocoon), or a personal rebirth. In modern tattoo culture, butterflies also symbolize hope, beauty, and the fragile nature of life itself.

> 💡 SHARE THIS: In Ancient Greek culture, the word "psyche" was used for both "soul" and "butterfly." The Greeks believed that the butterfly was the physical manifestation of the human spirit.

## Cultural Origin and History

Butterflies have a deep history in Victorian floriography and symbolic art. In 19th-century Britain, butterflies were often paired with flowers like the lavender or the lily to represent the soul's journey. Contrast this with the *Memento Mori* ("remember you must die") tradition; the butterfly is often seen as a *Memento Vivere*—a reminder to truly live.

In Japanese culture, a single butterfly often represents womanhood and grace, while two butterflies flying together are a traditional symbol of marital bliss. Conversely, in some Celtic traditions, the butterfly represents a soul passing between worlds—a messenger across the veil.

## Who Chooses This Design?

The butterfly is a popular choice for those commemorating a "coming of age" moment or a recovery journey. It is a design favored by those who value freedom and lightness. Because of its adaptability in size and style—from minimalist fine line to vibrant Neotraditional—it appeals to both first-timers and seasoned collectors looking for a filler piece with significant weight.

:::invest
**Looking for your first butterfly design?** Each design in our library includes a 5-year aging prediction and placement guide so you know exactly what to tell your artist. [Explore butterfly designs →](/gallery)
:::

## Best Placement for a Butterfly Tattoo

**The Forearm** — Ideal for symmetrical designs where you can see the results daily. This placement allows for a medium-sized piece that follows the natural curve of the arm.

**The Shoulder Blade** — A classic placement that suggests wings emerging from the body. Perfect for larger, more detailed pieces with heavy shading.

**The Sternum** — A high-impact placement that symbolizes the center of the self. Large, symmetrical butterflies are often used here to "frame" the chest anatomy.

## How a Butterfly Tattoo Ages Over Time

Because butterfly designs often involve delicate wing details, they are sensitive to sun exposure. To prevent the fine veins in the wings from blurring, we recommend "bold-will-hold" line weights if you are choosing a smaller size (under 3 inches). Larger pieces with high-density shading will maintain their clarity for 10+ years with proper SPF care. Avoid placing fine-line butterflies on the hands or fingers, where skin shedding is high and lines bleed quickly.

## Frequently Asked Questions

**What does a small butterfly tattoo on the wrist mean?**
Often chosen as a reminder of personal freedom or a tribute to a loved one's spirit. It is a small "hidden" anchor that the wearer can glance at for grounding.

**Are blue butterflies significant?**
Blue butterflies are frequently associated with luck or a change in fortune. In many cultures, seeing a blue butterfly is considered a sign that the soul is protected.

**Where is the least painful spot for a butterfly tattoo?**
The outer forearm or the top of the shoulder are generally considered low-pain areas (3/10) for first-timers. The closer you get to the bone or sensitive skin like the inner wrist or ribs, the higher the pain level (7/10+).`,
  },
  "SCIENCE GUIDE": {
    schema: "Article",
    body: `## The Biological Reality — How Your Skin Heals

When a tattoo needle enters your skin, it creates a controlled trauma that triggers a three-stage biological response. Understanding these stages is the difference between a tattoo that lasts 10 years and one that blurs in two. Your body's goal is to trap the ink in the dermis while regenerating the protective epidermis above it.

> WARNING: Never pick at a tattoo during the "onion skin" phase (Days 5 to 10). Mechanical removal of scabs pulls ink from the dermis before the healing barrier has closed, creating permanent "voids" in the saturation.

## The 14-Day Healing Pipeline

**Stage 1: The Initial Wound (Days 1 to 3)** — Your skin is in a state of inflammation. White blood cells (macrophages) attempt to "eat" the ink particles. Large particles remain trapped in the dermis, while small ones are carried away. This is why some ink fades slightly in the first week.

**Stage 2: The Proliferation Phase (Days 4 to 14)** — The epidermis begins to regenerate. This is the peeling phase. Your skin will resemble a mild sunburn. The "glaze" you see over the tattoo is new keratinocytes migrating across the wound bed.

**Stage 3: Remodeling (Month 2 to 4)** — While the surface looks healed after 14 days, the deeper dermis is still settling. The ink particles are being stabilized by fibroblasts. This is when the tattoo moves from looking "shiny" to having its final matte, settled appearance.

:::invest
**Healed but looking dull?** Most tattoos lose contrast due to dry skin and UV damage, not ink loss. Use our Aftercare Day Tracker to stay consistent with your moisturizing routine. [Open tracker →](/lab/tracker)
:::

## What To Avoid and Why — Ingredient Check

- **Petroleum Jelly (Aquaphor/Vaseline) after Day 3** — Petroleum is an occlusive. It traps heat and prevents gas exchange. While good for the first 48 hours to prevent scabbing, long-term use can lead to "drowning" the wound and increasing infection risk.
- **Fragrance (Linalool, Limonene)** — Fragrant compounds trigger mast cell degranulation. This releases histamine, causing inflammation that can lead to ink migration (blurring).
- **Alcohol (Ethanol/Isopropyl)** — Alcohol accelerates transepidermal water loss (TEWL), drying out the new keratinocytes and making them too brittle, leading to premature peeling and color loss.

## Recommended Healing Routine

For optimal results, we recommend a "Transition Protocol":
1. **Days 1 to 3:** Use a thin layer of Aquaphor to maintain a sterile wound bed.
2. **Days 4 to 14:** Switch to a fragrance-free, ceramide-rich lotion (like Lubriderm or Hustle Butter) to support the lipid barrier without trapping excess heat.
3. **Week 3 onward:** Daily mineral SPF application whenever the tattoo is exposed to sun.

## FAQ — Healing Science

**Why does my tattoo look "milky" during Week 2?**
New epidermal cells are semi-opaque. You are viewing your tattoo through a fresh layer of "frosting." It will clear as the cells mature.

**Is it normal for the tattoo to feel hot?**
Heat is normal in the first 24-48 hours. If it persists beyond Day 3 or is accompanied by spreading redness, it indicates an infection that requires medical attention.`,
  },
  "COST AND PRICING": {
    schema: "FAQPage",
    body: `## The Short Answer — What To Expect To Pay

Laser tattoo removal in the US costs between $200 and $500 per session for a standard tattoo. Most tattoos require 6 to 12 sessions spaced 6 to 8 weeks apart. A realistic total budget for an average palm-sized black ink tattoo is $1,500 to $4,000. This guide breaks down exactly what affects your specific cost — no vague ranges.

> WARNING: Be cautious of any clinic that quotes only a "package price" without disclosing the per-session cost. Reputable clinics are transparent about per-session pricing. Walk away if they refuse to give you a specific per-session number before you book.

## What Determines Your Specific Cost

**Tattoo Size** — The single biggest pricing factor. A coin-sized tattoo (under 5cm) costs $200 to $300 per session. A palm-sized piece (5 to 15cm) costs $300 to $450. A large back or chest piece costs $500 to $1,000 or more per session.

**Ink Color** — Black and grey ink responds most efficiently to standard Q-switched and picosecond lasers. Green, blue, and turquoise require a specific 755nm wavelength that not all clinics have. If your tattoo has these colors, expect 2 to 4 additional sessions and higher per-session cost.

**Skin Tone** — Fitzpatrick scale V and VI (deeper melanin levels) require more conservative laser energy settings to prevent hypopigmentation. This extends the treatment course. Always ask a clinic how they adjust settings for your specific Fitzpatrick level — if they cannot answer, find a different clinic.

**Technology** — Picosecond lasers (PicoSure, Enlighten) break ink into smaller particles than nanosecond Q-switched lasers, which typically means fewer sessions. Picosecond clinics charge more per session but the total treatment cost is often similar or lower because fewer sessions are needed.

**Location** — London and New York clinics charge 30 to 50 percent more than smaller cities for the same treatment. A clinic in Manchester or Leeds will typically charge £100 to £200 per session for a medium tattoo. London clinics charge £200 to £400 for the same piece.

:::invest
**Planning your removal?** Use the Journey Estimator tool in this guide to calculate your personalized session count, total cost, and cost-per-day breakdown. Save the result before your first consultation — you will need these numbers.
:::

## The Real Session Count — What Clinics Do Not Tell You

> 💡 SHARE THIS: Most removal clinics advertise 3 to 6 sessions in their marketing. The clinical reality for average black ink tattoos on common placements is 6 to 12 sessions. The difference is that advertising shows ideal cases — fresh professional ink on fair skin in high-circulation areas. Most real tattoos are more complex.

The reason removal takes longer than advertised comes down to biology. When a laser pulse hits ink, it shatters the pigment particles. Your lymphatic system then carries those fragments away over the following 6 to 8 weeks. This is why sessions cannot be spaced closer together — your immune system needs time to clear the debris before the next session can target the remaining ink effectively.

## Price Breakdown Table

| Tattoo Size | Est. Sessions | Per Session | Total Range |
|-------------|--------------|-------------|-------------|
| Small — coin sized (under 5cm) | 5 to 8 | $200 to $300 | $1,000 to $2,400 |
| Medium — palm sized (5 to 15cm) | 6 to 10 | $300 to $450 | $1,800 to $4,500 |
| Large (15 to 30cm) | 8 to 12 | $450 to $700 | $3,600 to $8,400 |
| Sleeve or full back | 10 to 15 | $700 to $1,500 | $7,000 to $22,500 |

## Additional Costs You Need To Budget For

Beyond the sessions themselves, factor these into your total:

- **Consultation fee** — $0 to $150. Many reputable clinics offer free first consultations. If a clinic charges for a consultation and cannot give you a written quote afterwards, that is a red flag.
- **Numbing cream** — $10 to $50 per session if the clinic provides it, or $15 to $30 once if you buy your own (Zensa or EMLA applied 45 minutes before the session).
- **Aftercare products** — $30 to $80 total across your treatment course. Silicone scar sheets, Aquaphor, fragrance-free moisturizer, and mineral SPF for the treated area.

## How To Get a Fair Quote — What To Ask Every Clinic

Before booking with any clinic, ask these four questions:

1. What laser technology do you use and is it FDA-cleared?
2. What is your per-session price for my specific tattoo size?
3. How many sessions do you estimate for my tattoo specifically?
4. Do you offer a patch test before committing to a full session?

A clinic that cannot answer all four clearly and in writing is not ready for your trust.

## Red Flags — Walk Away If You See These

- They guarantee complete removal in a specific number of sessions. No ethical clinic does this.
- They cannot name the specific laser technology they use.
- They pressure you to buy a multi-session package at the first consultation.
- They do not ask about your skin type, Fitzpatrick level, or medical history before quoting.
- The price seems dramatically lower than the market average. Under-powered sessions lead to longer treatment courses and sometimes permanent scarring.

## Frequently Asked Questions

**Is laser tattoo removal covered by insurance?**
In almost all cases, no. Tattoo removal is considered an elective cosmetic procedure. The exception is when removal is medically required due to infection or allergic reaction — in those rare cases partial coverage may be possible. Always check your specific policy.

**What is the cheapest way to get tattoo removal?**
The most cost-effective approach is to find a mid-tier clinic using genuine picosecond technology — not the cheapest option, but not the most expensive either. Underpriced treatments often use older nanosecond technology at insufficient energy levels, which extends your session count and raises the total cost. Many clinics offer payment plans — ask specifically about financing options before ruling out a clinic based on per-session price.

**How do I know if a clinic is reputable?**
Look for: FDA-cleared laser technology named specifically on their website, before-and-after photos of their own clients (not stock photos), licensed medical or clinical technicians (not beauty therapists), a patch test offered before committing to a full session, and transparent per-session pricing available without a hard sell.`,
  },
  "FAQ AND HOW-TO": {
    schema: "FAQPage",
    body: `## The Short Answer — Can I Swim After a Tattoo?

No. You should avoid swimming in any form—pools, lakes, or the ocean—for at least 2 to 4 weeks after getting a tattoo. A fresh tattoo is an open wound, and submerging it in water before the epidermis has fully closed is one of the leading causes of infection and ink loss.

> WARNING: Never submerge a fresh tattoo in "standing water" like a bath or a lake. Standing water is a breeding ground for bacteria like *Vibrio vulnificus* and *Staphylococcus*, which can enter the dermis through the needle channels and cause severe infections requiring hospitalization.

## Why You Must Wait — The Biology

When you get tattooed, the needle punctures the skin barrier approximately 50 to 3,000 times per minute. Until the surface skin (epidermis) has regenerated over the ink, your body lacks its primary defense against waterborne pathogens.

**Infection Risk** — Oceans and lakes contain naturally occurring bacteria, while public pools contain pathogens from other swimmers. A fresh tattoo is the perfect entry point for these bacteria.

**Chlorine Damage** — Chlorine is a potent oxidizing agent. It is designed to kill bacteria, but it also aggressively dries out healing tissue. Submerging a fresh tattoo in chlorine can leach the ink particles before they have settled, leading to "patchy" healing or faded colors.

**Mechanical Damage** — Soaking a fresh tattoo softens the scabs or the delicate "onion skin" that forms as it heals. If these scabs become waterlogged and fall off prematurely, they pull ink from the dermis with them.

:::invest
**Planning a beach trip?** Use our Healing Day Tracker to see exactly when your tattoo is safe for sun and water exposure. Don't risk your investment. [Open tracker →](/lab/tracker)
:::

## Common Mistakes People Make

- **Using a "Waterproof" bandage to swim** — While products like Tegaderm are waterproof, they are not designed for the mechanical stress of swimming. The movement of the skin under water can break the seal, trapping bacteria *inside* the bandage against the wound.
- **Thinking Saltwater is "Healing"** — Raw ocean water is not a sterile saline solution. It contains bacteria, parasites, and debris. Never use the ocean as a cleaning method for a fresh tattoo.
- **Swimming too soon because "it looks healed"** — The surface closes in 14 days, but the deeper dermis is still rebuilding. Submerging it at Day 10 is still high risk. Wait the full 21 days for a safety margin.

## Frequently Asked Related Questions

**What if I accidentally get my tattoo wet in the shower?**
Occasional running water is fine and necessary for cleaning. Gently pat it dry immediately. The danger is *submerging* the tattoo for extended periods.

**Can I swim if I keep my arm/leg out of the water?**
Only if you are 100% certain no splashes will hit the tattoo. The humidity of the pool area alone can soften scabs. It is better to wait.

**How do I know it's safe to swim?**
The tattoo should be completely finished peeling, with no scabs, no shine, and skin that feels identical to the surrounding area. Usually this is at Day 21.`,
  },
  "HOW MANY SESSIONS": {
    schema: "FAQPage",
    body: `## The Short Answer — How Long Does Removal Take?

The average professionally applied black ink tattoo requires 6 to 12 sessions for complete removal. If you are only looking to fade the tattoo for a cover-up, you can expect to need 3 to 5 sessions. Sessions must be spaced 6 to 8 weeks apart to allow your lymphatic system to clear the shattered ink particles.

> 💡 SHARE THIS: Patience is the most important ingredient in tattoo removal. Spacing sessions closer together does not remove ink faster—it only increases the risk of permanent skin texture changes and scarring.

## Factors That Influence Your Session Count

**The Kirby-Desai Scale** — This is the clinical standard used to predict session counts. It factors in:
1. **Skin Type** — Melanin levels (Fitzpatrick scale).
2. **Location** — Tattoos closer to the heart (chest, neck) heal faster due to higher circulation.
3. **Ink Color** — Black is easiest; green and yellow are hardest.
4. **Amount of Ink** — Professional tattoos have higher ink density than amateur "stick and poke" designs.
5. **Scarring** — If the original tattoo caused scarring, the ink is harder to reach.

## Frequently Asked Questions

**Why do I have to wait 8 weeks between sessions?**
The laser doesn't "remove" the ink; it just breaks it. Your white blood cells do the removal. They need time to transport the particles to your lymph nodes.

**Can I speed up the process?**
Exercise and hydration improve lymphatic circulation, which can marginally speed up the clearance of ink particles.`,
  },
  "PAIN GUIDE": {
    schema: "FAQPage",
    body: `## The Short Answer — How Much Does It Hurt?

Tattoo removal is widely described as feeling like "a rubber band snapping against the skin repeatedly," accompanied by intense heat. On a scale of 1 to 10, most patients rate the pain between a 6 and 8. The good news: sessions are extremely fast—a palm-sized tattoo can be treated in less than 60 seconds.

> WARNING: Never use an unknown "numbing cream" from the internet before your session. Some creams can interfere with the laser's ability to reach the ink or cause a localized skin reaction when hit by the laser's heat. Only use the anesthetic recommended by your clinic.

## Managing the Pain — Your Options

**1. Numbing Cream (Topical)** — 5% Lidocaine creams (like Zensa) applied 45 minutes before the session can reduce the "snap" sensation by 30-50%.
**2. Cryo-Cooling (Zimmer)** — Most high-end clinics use a machine that blows -30°C air on the skin before, during, and after the laser pulses. This is the most effective way to manage the heat sensation.
**3. Lidocaine Injections** — Some medical-led clinics offer local anesthetic injections that completely numb the area. This makes the procedure 100% painless but adds cost to each session.

## Pain by Placement

- **Low Pain (3-5/10):** Outer forearm, outer thigh, upper back.
- **Medium Pain (6-7/10):** Calves, shoulders, inner arm.
- **High Pain (8-10/10):** Ribs, feet, ankles, spine, and chest.`,
  },
  "PRODUCT RANKING": {
    schema: "Article",
    body: `## The Short Answer — What To Buy

For most tattoos in the first two weeks of healing, the best aftercare cream is a fragrance-free, alcohol-free lotion applied twice daily after the initial 72-hour Aquaphor phase. Hustle Butter Deluxe is the best specialist option. Lubriderm Daily Moisture Fragrance-Free is the best budget option that performs nearly identically for most skin types.

> WARNING: Check your aftercare product for these three ingredients before applying to a fresh tattoo: fragrance alcohols (linalool, limonene, geraniol), ethanol or isopropyl alcohol in any form, and petroleum derivatives (petrolatum, mineral oil) in the first 72 hours. Each of these causes measurable harm to healing tattooed skin through different biological mechanisms.

## Why This Product Category Matters — The Science

When a tattoo needle deposits ink into the dermis, the epidermis above it is damaged. For the first 14 days your skin is rebuilding this surface layer through a process called keratinocyte migration — the cells that form the outer skin layer travel horizontally to close the wound. The products you apply during this period either support this process or interfere with it.

Fragrance compounds are the most common interfering ingredient. They trigger mast cell degranulation in healing tissue — mast cells release histamine, histamine causes inflammation, and inflammation in a healing tattoo causes ink migration. The pigment moves laterally from where the needle placed it. This is the biological mechanism behind blurred lines in healed tattoos. It happens slowly over months and years, not immediately.

This is why fragrance-free is not a preference — it is a clinical requirement for optimal healing.

:::invest
**Already have your design?** Each design in our library includes the recommended aftercare protocol for its specific style and placement. Fine line work heals differently from blackwork. Browse verified designs with placement guides. [Explore designs →](/gallery)
:::

## What To Look For When Buying

> 💡 SHARE THIS: Most products labeled "unscented" still contain fragrant alcohols like linalool — they simply have no added perfume. Linalool is a naturally occurring fragrant compound in many plant-derived ingredients. Check the full ingredient list for linalool, limonene, and geraniol — not just the front label claim.

- **Fragrance-free verified** — Check the full ingredient list, not just the label claim. Linalool, limonene, and geraniol are fragrant alcohols found in many "natural" products.
- **No alcohol in any form** — Ethanol and isopropyl alcohol both accelerate transepidermal water loss, drying the wound bed and slowing keratinocyte migration.
- **pH between 4.5 and 6.5** — Matches healing skin's natural acid mantle. Products significantly outside this range disrupt the microbiome of healing skin.
- **Lightweight molecular weight** — Heavy occlusives like pure petroleum jelly trap heat in actively inflamed tissue during the first 72 hours. After Day 3 a lighter formula is more appropriate.

## What To Avoid and Why

- **Fragranced products of any kind** — Including those marketed as "natural" or "organic." The harm mechanism is specific compounds, not synthetic vs natural origin.
- **Neosporin or antibiotic ointments** — Neomycin, a common ingredient, causes contact dermatitis in approximately 1 in 10 people. Tattooed skin is already sensitized. The risk is not worth it.
- **Pure coconut oil** — Comedogenic rating of 4 out of 5. Clogs follicles in high-sebum areas and creates an anaerobic environment that increases bacterial risk in the first week.
- **Aloe vera on fresh tattoos** — The astringent compounds in aloe dry the wound bed. It is appropriate for sunburned healed tattoos. It is not appropriate for fresh healing skin.
- **Chemical sunscreen before 30 days** — Chemical UV filters (oxybenzone, avobenzone) penetrate sensitized skin and cause irritation. Use mineral SPF (zinc oxide) only, and only after the surface has fully closed — typically Day 21 to 30.

## Our Ranked Recommendations

### Rank 1 — Hustle Butter Deluxe

![Hustle Butter Deluxe tattoo aftercare balm — 5oz jar with shea butter and mango butter formula](UPLOAD_PRODUCT_IMAGE_HERE)

**Best for:** All skin types, especially dry skin, ribs, and fine line work
**Price:** $24.99 for 5oz
**Why it works:** Shea butter, mango butter, and coconut oil base with zero petroleum derivatives. The absence of petrolatum means no occlusive barrier trapping heat in the first 72 hours. Papain (from papaya extract) is a natural enzyme that gently removes dead epidermal cells without mechanical damage from peeling. The formulation is suitable across all Fitzpatrick levels without melanin interference.
**Honest limitation:** Overpriced for normal to oily skin types on low-friction placements like the outer forearm. Lubriderm performs equivalently for 70 percent of healing scenarios at one third the price.

[BUY ON AMAZON →](https://affiliate-link-here)

---

### Rank 2 — Lubriderm Daily Moisture Fragrance-Free

![Lubriderm Daily Moisture fragrance-free lotion 16oz bottle for tattoo aftercare](UPLOAD_PRODUCT_IMAGE_HERE)

**Best for:** Normal to oily skin, forearm and calf placements, budget-conscious healing
**Price:** $8.99 for 16oz
**Why it works:** Water-based formula at pH 5.5 matches healing skin's natural acid mantle precisely. The ceramide content rebuilds the lipid barrier that tattooing disrupts. Lighter molecular weight than balm-based products means it does not sit on top of the skin — it absorbs within 60 seconds. At $0.56 per ounce this is the most cost-effective genuinely effective product in this category.
**Honest limitation:** Provides less protection for very dry skin or high-friction placements like hands, elbows, or knees where a more occlusive formula performs better.

[BUY ON AMAZON →](https://affiliate-link-here)

---

### Rank 3 — Bepanthen Tattoo Aftercare

![Bepanthen tattoo aftercare ointment 50g tube with dexpanthenol formula](UPLOAD_PRODUCT_IMAGE_HERE)

**Best for:** Dry skin, large pieces with heavy shading, European markets
**Price:** £12.99 for 50g (UK) / approximately $18 US
**Why it works:** Dexpanthenol (provitamin B5) converts to pantothenic acid in skin tissue. Pantothenic acid is directly involved in keratinocyte synthesis — the process of rebuilding the skin surface. Faster keratinocyte activity means faster surface closure with less scabbing, which preserves color saturation in the healed tattoo.
**Honest limitation:** The 50g tube is insufficient for large pieces or sleeve work. Buy two tubes at the start if your tattoo covers more than a hand-sized area.

[BUY ON AMAZON →](https://affiliate-link-here)

---

### Day 1 to 3 Only — Aquaphor Healing Ointment

![Aquaphor healing ointment 7oz tube for the first 72 hours of tattoo aftercare](UPLOAD_PRODUCT_IMAGE_HERE)

**Best for:** Days 1 to 3 only — the open wound phase
**Price:** $12.99 for 7oz
**Why it works:** Semi-occlusive petrolatum base allows gas exchange (the wound can breathe) while preventing the dry crust formation that causes color loss. This is the correct choice for the first 72 hours when the skin is genuinely an open wound. Switch to a lighter formula after Day 3.
**Honest limitation:** Do not use beyond Day 3. Aquaphor long-term traps heat in healing tissue, increases bacterial risk, and creates an environment unsuitable for keratinocyte migration. It is a wound dressing. It is not a moisturizer. Most people use it too long.

[BUY ON AMAZON →](https://affiliate-link-here)

## How To Use It — Day by Day Protocol

**Days 1 to 3:** Apply Aquaphor in a very thin layer (skin should look slightly shiny, not wet or greasy) 3 times daily after gently washing with fragrance-free antibacterial soap. Pat dry with a clean paper towel. Do not rub.

**Days 4 to 7:** Switch to your ranked choice above. Apply twice daily — morning and before sleep. The tattoo will begin peeling. Do not pick or peel. Tap gently if itching is intense.

**Week 2:** Continue twice daily application. The surface looked fully healed but the deeper dermis is still rebuilding. Maintain the routine.

**Week 3 onward:** Apply once daily. Add mineral SPF after Day 21 if the tattoo will be exposed to sun. UV is the single biggest cause of long-term ink fade — SPF is not optional for outdoor activity.

## Frequently Asked Questions

**Can I use regular hand lotion?**
Yes, if it is genuinely fragrance-free and alcohol-free. Lubriderm Daily Moisture Unscented is regular hand lotion that meets the clinical standard. Check the full ingredient list — not just the front label claim.

**What if I run out at night?**
Cold-pressed coconut oil works as a single-application emergency substitute. Do not rely on it for more than 48 hours. The comedogenic rating makes it a poor choice for extended use.

**Is the tattoo supposed to itch?**
Yes. Itching during Week 2 is the keratinocytes rebuilding the skin surface — it is a sign of normal healing. Do not scratch. Tap gently with a clean fingertip and apply a thin layer of moisturizer. The itch subsides within minutes. If the itch is accompanied by spreading redness, heat, or swelling beyond the tattoo boundary — that is an infection sign requiring medical attention, not more moisturizer.

**When is the tattoo fully healed?**
The epidermis closes in 2 to 3 weeks. The full skin stack including the dermis takes 3 to 4 months. During this period the tattoo will appear slightly dull or milky — new epidermal cells are semi-opaque until they mature. The final color and clarity becomes visible between months 2 and 4.`,
  },
  "BUYING GUIDE": {
    schema: "Article",
    body: `## Choosing The Right Aftercare — The Buyer's Check

Not all tattoo balms are created equal. The market is flooded with products that claim to be "premium" but contain ingredients that actively interfere with keratinocyte migration. This guide helps you identify the clinical markers of a quality product so you can make an informed choice before your next session.

> 💡 SHARE THIS: Price is not always a proxy for quality. Many $40 balms use the same base as $8 drug-store lotions. Look for ceramides and dexpanthenol — ignore the branding.

## Essential Criteria For Any Aftercare Product

- **Lipid Barrier Support** — The product must contain ceramides or essential fatty acids (shea, mango butter) to rebuild the skin's protection.
- **Gas Permeability** — Healing skin needs to "breathe" (oxygen exchange). Pure heavy oils or 100% occlusives can trap bacteria and heat.
- **pH Optimized** — Healing skin is slightly acidic (pH 5.5). Using basic soaps or products can disrupt the microbiome and lead to irritation.

## What To Avoid and Why

- **Fragrance and Essential Oils** — These are the #1 cause of contact dermatitis in healing tattoos.
- **Petroleum Derivatives** — Avoid after Day 3 to prevent "drowning" the wound.
- **Lanolin** — While natural, it is a common allergen that can cause bumps (granulomas) on fresh tattoos.

## How To Compare Products

Always read the third ingredient on the list. If it is "Fragrance" or "Alcohol," put it back. If it is a natural nut butter or a humectant like Glycerin, you are on the right track.`,
  },
  "FIRST TIMER": {
    schema: "HowTo",
    body: `## Before You Book — Your Complete Checklist

Getting your first tattoo is a major biological commitment. Before you step into the studio, run through this verified checklist to ensure your skin and body are ready for the process. Proper preparation reduces pain and ensures the ink settles perfectly on the first pass.

- [x] **Design Collection** — Save at least 5 examples of the style you want (e.g., Fine Line, Blackwork).
- [x] **Artist Verification** — Check their healed portfolio. Fresh tattoos always look good; healed photos show their true technical skill.
- [x] **Pain Assessment** — For your first piece, we recommend the outer forearm (3/10 pain). Avoid the ribs or feet for your entry point.
- [x] **Skin Prep** — Drink 2L of water daily for 3 days before your session. Hydrated skin takes ink much more evenly.
- [x] **Meal Prep** — Eat a substantial meal 1-2 hours before your appointment. Low blood sugar is the leading cause of fainting during tattoos.

## Choosing Your First Design — "Bold Will Hold"

For a first-timer, a fine-line forearm piece is the gold standard. It allows you to watch the process, manage the pain, and easily follow the aftercare protocol. When selecting a design, remember that ink spreads slightly as it ages—if a design is too small and complex, it may blur into a gray smudge in 10 years. Ask your artist for "intentional spacing."

:::invest
**Found a design you love?** Each design in our library includes a placement guide and a 5-year aging simulation. See how it looks before it's permanent. [Explore Designs →](/gallery)
:::`,
  },
  "NEAR ME GUIDE": {
    schema: "Article",
    body: `## How To Find a Reputable Removal Clinic Near You

Tattoo removal technology has advanced rapidly in the last 5 years, but clinic standards vary wildly. Finding a "nearby" clinic is easy; finding one that won't scar your skin requires specific due diligence. This guide explains exactly what to look for and the questions to ask before you book a consultation.

> WARNING: Never choose a clinic based solely on price or distance. An under-powered laser or an untrained technician can cause permanent scarring (hypopigmentation) that even professional lasers cannot fix later.

## The Four Questions To Ask Every Clinic

Before committing to a session, call or visit and ask these exact questions:
1. **What specific laser technology do you use?** (Look for: PicoSure, Enlighten, or PicoWay. If they just say "Q-switched," ask for the brand.)
2. **Is your laser FDA-cleared for my specific skin type?** (Melanin levels affect which laser wavelength is safe.)
3. **Can I see before-and-after photos of YOUR own clients?** (Watch out for stock photos from the laser manufacturer.)
4. **What is your per-session price for a tattoo of my size?** (Avoid clinics that only quote "package deals" without a per-session baseline.)

## Red Flags — Walk Away If:
- They guarantee the tattoo will be gone in X sessions. No one can guarantee this because your lymphatic system does the actual removal.
- They do not offer a patch test. A patch test is a safety standard, not a courtesy.
- The environment looks like a nail salon rather than a clinical environment.
- They cannot explain the difference between 532nm and 1064nm wavelengths.

## Frequently Asked Questions

**Is it worth driving to a major city for removal?**
Yes. Major cities (NYC, London, LA) have higher volume clinics which usually means more experienced technicians and the latest $200k+ laser technology.

**How do I know if the reviews are real?**
Look for reviews that mention the technician's name and include specific details about the session count. Generic "it was great" reviews are often fake.`,
  },
  "MYTH BUSTER": {
    schema: "FAQPage",
    body: `## The Short Answer — Does This Work?

At-home tattoo removal creams do not remove tattoos. The ink in your tattoo sits in the dermis—the second layer of skin approximately 1 to 2mm below the surface. No topical cream can penetrate to that depth without causing severe chemical burns to the epidermis above it. Most at-home removal products use trichloroacetic acid (TCA) or similar compounds that burn the surface skin layer while leaving the ink completely untouched.

> WARNING: At-home tattoo removal products containing trichloroacetic acid, hydroquinone, or high-concentration glycolic acid can cause permanent scarring, hypopigmentation, and chemical burns. The tattoo will remain. The skin damage will not.

## Why People Try This — The Appeal Is Understandable

Laser removal is expensive. A realistic budget for an average tattoo is $1,500 to $4,000. A tube of removal cream costs $30. That price difference is why millions of people search for at-home alternatives—not because they are naive, but because the cost of the legitimate option is genuinely out of reach for many people.

This guide is written without judgment. If you are looking for a cheaper way, you deserve an honest answer about what works and what causes harm—not a lecture.

## Safe Alternatives While You Save For Laser

If laser removal is not financially accessible right now, these options are safe and effective for temporary concealment:

**Dermablend Professional Body Makeup** — The industry standard for covering tattoos for events. SPF 25, transfer-resistant, available in 40 shades. Apply with the color-correct-first technique: peach or orange corrector for dark ink, then match your skin tone on top.

**KVD Good Apple Foundation** — Buildable coverage with a satin finish. Better for smaller tattoos or areas that will not experience friction during wear.

**Setting spray** — Essential for any coverage lasting more than 2 hours or involving physical activity. Urban Decay All Nighter or NYX Matte Finish both work for body makeup.

## Frequently Asked Questions

**Are there any at-home methods that are genuinely safe?**
Fading through sun avoidance does not work—avoiding sun prevents further fading of healed tattoos but does not remove existing ink. No at-home method removes tattoo ink from the dermis safely.

**How long until I can afford laser removal?**
Most clinics offer payment plans. Ask specifically about financing options before ruling out a clinic based on per-session price. Some offer 0% financing for 6 to 12 months. A $3,000 total treatment becomes $250 per month over 12 months — which may be more manageable than the upfront cost suggests.

**What should I do while I wait?**
Protect the tattoo from sun exposure with mineral SPF — UV exposure causes ink to oxidize and spread, making future removal more difficult and expensive. For occasions requiring concealment, use the products listed in the section above. Do not apply any acidic product to the tattooed area.`,
  },
  "COVER-UP GUIDE": {
    schema: "HowTo",
    body: `## How To Hide a Fading Tattoo — The Professional Protocol

A fading tattoo or one in the middle of laser removal can often look worse than the original piece—patchy, discolored, and inconsistent. This guide explains the color-correction protocol used by makeup artists to achieve 100% concealment that won't rub off on your clothes.

## The Products That Actually Work

- **Dermablend Professional Leg and Body Makeup** — High-pigment, buildable, and smudge-resistant.
- **KVD Good Apple Skin-Perfecting Foundation Balm** — Excellent for coverage but requires more aggressive setting.
- **Peach/Orange Color Corrector** — Crushed-orange pigments neutralize the blue/green/black undertones of tattoo ink.

## Step-by-Step Application Protocol

1. **Cleanse & Dry** — Ensure the skin is free of oils and lotions.
2. **Color Correct First** — Apply a thin layer of orange or peach corrector ONLY to the ink. This "cancels" the cool tones. Wait 1 minute.
3. **Stipple Foundation** — Using a damp makeup sponge, "stipple" (dab) the foundation over the area. Do not swipe, as this moves the corrector.
4. **Set With Powder** — Use an oversized brush to apply translucent setting powder. This locks the pigment in place.
5. **Setting spray** — Use a high-end setting spray (Urban Decay All Nighter). Wait 5 minutes before dressing.

## Frequently Asked Questions

**Will it rub off on my clothes?**
If you use the Correct+Powder+Spray protocol, modern body makeup is approximately 90% transfer-resistant. Avoid light-colored silk or tight-fitting white fabrics for maximum safety.

**Can I swim with body makeup?**
Most "waterproof" claims are for light splashing. Submerging the makeup for extended periods will cause it to break down. For pool days, use a thin layer of liquid bandage over the makeup for added resistance.`,
  }
};

const remarkPluginsList = [remarkGfm];

export default function BlogPostLab() {
  const [selectedType, setSelectedType] = useState<PostType | null>(null);
  const [postIntent, setPostIntent] = useState<PostIntent | "">("");
  const [title, setTitle] = useState("");
  const [executiveSummary, setExecutiveSummary] = useState("");
  const [bodyContent, setBodyContent] = useState("");
  const [debouncedBodyContent, setDebouncedBodyContent] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedBodyContent(bodyContent);
    }, 300);
    return () => clearTimeout(timer);
  }, [bodyContent]);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [focusKeyword, setFocusKeyword] = useState("");
  const [schemaType, setSchemaType] = useState("Article");
  
  const [selectedTool, setSelectedTool] = useState("NONE");
  const [toolPosition, setToolPosition] = useState("");
  const [selectedAudience, setSelectedAudience] = useState("");
  const [internalLinks, setInternalLinks] = useState<{url: string, anchor: string}[]>([]);
  const [keywordCategory, setKeywordCategory] = useState("");

  const [isPublishing, setIsPublishing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishState, setPublishState] = useState<"idle" | "publishing" | "success" | "error">("idle");
  const [publishErrorMsg, setPublishErrorMsg] = useState("");
  const [publishedSlug, setPublishedSlug] = useState("");

  const [products, setProducts] = useState<{name: string, url: string, price: string, image_url: string, button_label: string, tag: string, description: string}[]>([]);

  const [hookChecks, setHookChecks] = useState<boolean[]>(new Array(6).fill(false));
  const [isHookModelOpen, setIsHookModelOpen] = useState(false);
  const [isSchemaPreviewOpen, setIsSchemaPreviewOpen] = useState(false);
  const [isPsychologySidebarOpen, setIsPsychologySidebarOpen] = useState(false);
  const [mobileMode, setMobileMode] = useState<"EDITOR" | "PREVIEW">("EDITOR");
  const [readProgress, setReadProgress] = useState(0);

  // New Image States
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [isHeroUploading, setIsHeroUploading] = useState(false);
  const [inlineAltText, setInlineAltText] = useState("");
  const [isInlineUploading, setIsInlineUploading] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);
  const inlineInputRef = useRef<HTMLInputElement>(null);

  // Safety prompt
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (title || bodyContent) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [title, bodyContent]);

  // Read Progress Tracker
  const scrollThrottleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (scrollThrottleRef.current) return;
    const target = e.currentTarget;
    scrollThrottleRef.current = setTimeout(() => {
      const scrollHeight = target.scrollHeight - target.clientHeight;
      if (scrollHeight > 0) {
        setReadProgress(Math.round((target.scrollTop / scrollHeight) * 100));
      }
      scrollThrottleRef.current = null;
    }, 50);
  };

  const handleSelectType = (t: PostType) => {
    setSelectedType(t);
    setBodyContent(TEMPLATES[t].body);
    setSchemaType(TEMPLATES[t].schema);
  };

  const { wordCount, readTime } = useMemo(() => {
    const wordCount = bodyContent.split(/\s+/).filter(Boolean).length;
    return {
      wordCount,
      readTime: Math.max(1, Math.ceil(wordCount / 225))
    };
  }, [bodyContent]);

  const addProduct = () => {
    if (products.length < 6) {
      setProducts([...products, { name: "", url: "", price: "", image_url: "", button_label: "BUY ON AMAZON", tag: "", description: "" }]);
    }
  };

  const removeProduct = (idx: number) => {
    setProducts(products.filter((_, i) => i !== idx));
  };

  const updateProduct = (idx: number, field: string, value: string) => {
    const newProducts = [...products];
    (newProducts[idx] as any)[field] = value;
    setProducts(newProducts);
  };

  const handleProductImageUpload = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadProductImageAction(formData);
    if (result.success && result.url) {
      updateProduct(idx, 'image_url', result.url);
    } else {
      alert(result.error || "Upload failed");
    }
  };

  const preprocessMarkdown = (content: string) => {
    return content.replace(/:::invest\n([\s\S]*?)\n:::/g, (match, innerContent) => {
      return `<div class="invest-block">${innerContent}</div>`;
    });
  };

  const processedBody = useMemo(() => {
    return preprocessMarkdown(debouncedBodyContent);
  }, [debouncedBodyContent]);

  const copyMarkdown = () => {
    navigator.clipboard.writeText(bodyContent);
    alert("Markdown copied to clipboard!");
  };

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsHeroUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("prefix", "hero");

    const result = await uploadBlogImageAction(formData);
    setIsHeroUploading(false);

    if (result.success && result.url) {
      setHeroImageUrl(result.url);
    } else {
      alert(result.error || "Upload failed");
    }
  };

  const handleInlineUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsInlineUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("prefix", "inline");

    const result = await uploadBlogImageAction(formData);
    setIsInlineUploading(false);

    if (result.success && result.url) {
      const alt = inlineAltText || "Tattoo design image";
      const markdown = `\n![${alt}](${result.url})\n`;
      
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newContent = bodyContent.substring(0, start) + markdown + bodyContent.substring(end);
        setBodyContent(newContent);
        setInlineAltText("");
        
        // Return focus and move cursor
        setTimeout(() => {
          textarea.focus();
          const newPos = start + markdown.length;
          textarea.setSelectionRange(newPos, newPos);
        }, 0);
      }
    } else {
      alert(result.error || "Upload failed");
    }
    
    // Reset input so same file can be uploaded again if needed
    e.target.value = "";
  };

  const copyAsJson = () => {
    const data = {
      title,
      executive_summary: executiveSummary,
      body_content: bodyContent,
      meta_title: metaTitle,
      meta_description: metaDescription,
      focus_keyword: focusKeyword,
      schema_type: schemaType,
      keyword_category: keywordCategory,
      selected_audience: selectedAudience,
      postIntent,
      embedded_tool: { name: selectedTool !== "NONE" ? selectedTool : "", position: selectedTool !== "NONE" ? toolPosition : "" },
      related_products: products,
      internal_links: internalLinks,
      cover_image_url: heroImageUrl
    };
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    alert("JSON Data copied to clipboard!");
  };

  // TOC Generation
  const headings = useMemo(() => 
    debouncedBodyContent.match(/^##\s+(.+)$/gm) || [],
    [debouncedBodyContent]
  );
  const showTOC = headings.length >= 3;

  const handlePublishClick = () => {
    const errors: Record<string, string> = {};
    if (!title.trim()) errors.title = "Title is required";
    if (!executiveSummary.trim()) errors.executiveSummary = "Executive summary is required";
    if (wordCount < 300) errors.bodyContent = `Minimum 300 words required — current: ${wordCount} words`;
    if (!focusKeyword.trim()) errors.focusKeyword = "Focus keyword is required";
    if (!metaTitle.trim()) errors.metaTitle = "Meta title is required — this is what appears in Google search results";

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      const firstErrorKey = Object.keys(errors)[0];
      const element = document.getElementById(`field-${firstErrorKey}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setShowPublishModal(true);
    setPublishState("idle");
  };

  const confirmAndPublish = async () => {
    setIsPublishing(true);
    setPublishState("publishing");

    const baseSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 100);

    const finalSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;
    setPublishedSlug(finalSlug);

    const postData = {
      title: title,
      slug: finalSlug,
      excerpt: executiveSummary,
      body_content: bodyContent,
      meta_title: metaTitle || title,
      meta_description: metaDescription || executiveSummary,
      focus_keyword: focusKeyword,
      schema_type: schemaType,
      post_intent: postIntent || undefined,
      related_designs: [],
      related_products: products,
      cover_image_url: heroImageUrl || null,
      cover_image_alt: title || "Blog post cover image",
      category: keywordCategory || "Uncategorized",
      read_time_minutes: readTime,
      selected_tool: selectedTool,
      tool_position: toolPosition,
      is_published: true,
      published_at: new Date().toISOString(),
    };

    try {
      const result = await publishLabPostAction(postData);

      if (result.success) {
        setPublishState("success");
      } else {
        setPublishState("error");
        setPublishErrorMsg(result.error || "Unknown error occurred");
      }
    } catch (err: any) {
      setPublishState("error");
      setPublishErrorMsg(err.message || "A runtime error occurred during publishing.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-off-white flex flex-col font-sans">
      {/* HEADER */}
      <header className="h-16 bg-white border-b border-gray-light flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">
        <div className="flex items-center gap-4">
          <h1 className="font-display text-2xl uppercase tracking-widest text-black">BLOG POST LAB</h1>
          <span className="font-mono text-[10px] text-neutral-400 border border-neutral-200 px-2 py-1 hidden md:inline">
            TEST ENVIRONMENT — NOT CONNECTED TO DATABASE
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsPsychologySidebarOpen(!isPsychologySidebarOpen)}
            className="font-mono text-[11px] text-brand-red border border-brand-red px-3 py-1 hover:bg-brand-red/5 transition-colors uppercase"
          >
            PSYCHOLOGY
          </button>
        </div>
      </header>

      {/* MOBILE TOGGLE */}
      <div className="md:hidden flex border-b border-gray-light bg-white shrink-0">
        <button 
          className={`flex-1 py-3 font-mono text-[11px] ${mobileMode === "EDITOR" ? "bg-black text-white" : "bg-white text-black"}`}
          onClick={() => setMobileMode("EDITOR")}
        >
          EDITOR
        </button>
        <button 
          className={`flex-1 py-3 font-mono text-[11px] ${mobileMode === "PREVIEW" ? "bg-black text-white" : "bg-white text-black"}`}
          onClick={() => setMobileMode("PREVIEW")}
        >
          PREVIEW
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* EDITOR Left Side */}
        <div className={`${mobileMode === "EDITOR" ? "block" : "hidden"} md:block w-full md:w-[40%] bg-white border-r border-border-tertiary ${isPsychologySidebarOpen ? 'overflow-hidden' : 'overflow-y-auto'} flex flex-col`}>
          <div className="p-6 space-y-8 flex-1">
            
            {/* Field 1: POST TYPE SELECTOR */}
            <div className="space-y-3">
              <label className="font-mono text-[10px] uppercase tracking-widest text-gray-mid">1. Post Type Selector</label>
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => { setPostIntent("INFORM AND REFER"); setSelectedType(null); }}
                    className={`px-6 py-3 font-mono text-[11px] uppercase transition-colors rounded-none border ${postIntent === "INFORM AND REFER" ? 'bg-black text-white border-black' : 'bg-transparent text-gray-mid border-gray-light hover:border-gray-mid'}`}
                  >
                    INFORM AND REFER
                  </button>
                  <button
                    onClick={() => { setPostIntent("RECOMMEND AND SELL"); setSelectedType(null); }}
                    className={`px-6 py-3 font-mono text-[11px] uppercase transition-colors rounded-none border ${postIntent === "RECOMMEND AND SELL" ? 'bg-brand-red text-white border-brand-red' : 'bg-transparent text-gray-mid border-gray-light hover:border-gray-mid'}`}
                  >
                    RECOMMEND AND SELL
                  </button>
                </div>
                {postIntent && (
                  <div className="flex flex-wrap gap-2">
                    {SUB_TYPES[postIntent as PostIntent].map((t: string) => (
                      <button
                        key={t}
                        onClick={() => handleSelectType(t)}
                        className={`px-3 py-1.5 font-mono text-[10px] uppercase transition-colors rounded-none border ${selectedType === t ? 'bg-black text-white border-black' : 'bg-transparent text-gray-mid border-gray-light hover:border-gray-mid'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Field 2: TITLE */}
            <div className="space-y-3" id="field-title">
              <label className="font-mono text-[10px] uppercase tracking-widest text-gray-mid">2. Title</label>
              <input 
                type="text" 
                value={title}
                onChange={e => { setTitle(e.target.value); setValidationErrors(p => ({ ...p, title: "" })); }}
                placeholder="Your post title here"
                className="w-full text-[32px] font-display text-black border-b border-gray-light focus:border-black outline-none pb-2 bg-transparent leading-tight"
              />
              {validationErrors.title && <p className="font-mono text-[11px] text-brand-red">{validationErrors.title}</p>}
            </div>

            {/* Field 3: EXEC SUMMARY */}
            <div className="space-y-3" id="field-executiveSummary">
              <div className="flex justify-between items-center">
                <label className="font-mono text-[10px] uppercase tracking-widest text-gray-mid">3. Executive Summary</label>
                <span className={`font-mono text-[10px] ${executiveSummary.length > 250 ? 'text-brand-red' : executiveSummary.length > 200 ? 'text-amber-500' : 'text-gray-mid'}`}>
                  {executiveSummary.length} / 250
                </span>
              </div>
              <textarea 
                value={executiveSummary}
                onChange={e => { setExecutiveSummary(e.target.value); setValidationErrors(p => ({ ...p, executiveSummary: "" })); }}
                placeholder="Write your 2-sentence hook here. This appears in blog post cards and in Google search results."
                className="w-full h-24 p-3 border border-gray-light focus:border-black outline-none font-sans text-sm resize-none bg-off-white"
              />
              {validationErrors.executiveSummary && <p className="font-mono text-[11px] text-brand-red">{validationErrors.executiveSummary}</p>}
            </div>

            {/* Field 3.5: TARGET AUDIENCE */}
            <div className="space-y-3">
              <label className="font-mono text-[10px] uppercase tracking-widest text-gray-mid">TARGET AUDIENCE</label>
              <div className="flex flex-wrap gap-2">
                {["FIRST-TIMER", "PLANNER", "ENTHUSIAST", "ARTIST", "REMOVAL SEEKER"].map(aud => (
                  <button
                    key={aud}
                    onClick={() => setSelectedAudience(aud)}
                    className={`px-3 py-1.5 font-mono text-[10px] uppercase transition-colors rounded-none border ${selectedAudience === aud ? 'bg-black text-white border-black' : 'bg-transparent text-neutral-400 border-neutral-300'}`}
                  >
                    {aud}
                  </button>
                ))}
              </div>
            </div>

            {/* Field 4: READING TIME */}
            <div className="space-y-3">
              <label className="font-mono text-[10px] uppercase tracking-widest text-gray-mid">4. Reading Time</label>
              <div className="font-mono text-[12px] text-black bg-off-white inline-block px-3 py-1 border border-gray-light">
                {readTime} MIN READ
              </div>
            </div>

            {/* Field 5: BODY CONTENT */}
            <div className="space-y-3 flex flex-col flex-1" id="field-bodyContent">
              <div className="flex justify-between items-center">
                <label className="font-mono text-[10px] uppercase tracking-widest text-gray-mid">5. Body Content (Markdown)</label>
                
                {/* INLINE IMAGE TOOLBAR */}
                <div className="flex items-center gap-4">
                  <input 
                    type="text"
                    value={inlineAltText}
                    onChange={e => setInlineAltText(e.target.value)}
                    placeholder="Describe this image for SEO (e.g. fine line snake forearm tattoo)"
                    className="font-mono text-[11px] border-b border-gray-light bg-transparent focus:border-black outline-none w-[260px] pb-0.5"
                  />
                  <input 
                    type="file"
                    ref={inlineInputRef}
                    onChange={handleInlineUpload}
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.webp,.avif"
                  />
                  <button 
                    onClick={() => inlineInputRef.current?.click()}
                    disabled={isInlineUploading}
                    className="font-mono text-[10px] uppercase tracking-widest border border-neutral-300 px-3 py-1 hover:bg-neutral-50 transition-colors disabled:opacity-50"
                  >
                    {isInlineUploading ? "UPLOADING..." : "INSERT IMAGE"}
                  </button>
                </div>
              </div>
              <textarea 
                ref={textareaRef}
                value={bodyContent}
                onChange={e => { setBodyContent(e.target.value); setValidationErrors(p => ({ ...p, bodyContent: "" })); }}
                className="w-full flex-1 min-h-[400px] p-4 border border-gray-light focus:border-black outline-none font-mono text-sm resize-y bg-off-white leading-relaxed"
              />
              {validationErrors.bodyContent && <p className="font-mono text-[11px] text-brand-red">{validationErrors.bodyContent}</p>}
            </div>

            {/* Field 6: SEO PANEL */}
            <div className="space-y-4 pt-6 border-t border-gray-light">
              <label className="font-mono text-[10px] uppercase tracking-widest text-black font-bold">6. SEO Panel</label>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2" id="field-metaTitle">
                  <div className="flex justify-between">
                    <label className="font-mono text-[9px] uppercase tracking-widest text-gray-mid">Meta Title</label>
                    <span className={`font-mono text-[9px] ${metaTitle.length > 60 ? 'text-brand-red' : metaTitle.length > 55 ? 'text-amber-500' : 'text-gray-mid'}`}>
                      {metaTitle.length} / 60
                    </span>
                  </div>
                  <input type="text" value={metaTitle} onChange={e => { setMetaTitle(e.target.value); setValidationErrors(p => ({ ...p, metaTitle: "" })); }} className="w-full border-b border-gray-light focus:border-black outline-none pb-1 font-sans text-sm bg-transparent" />
                  {validationErrors.metaTitle && <p className="font-mono text-[11px] text-brand-red">{validationErrors.metaTitle}</p>}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="font-mono text-[9px] uppercase tracking-widest text-gray-mid">Meta Description</label>
                    <span className={`font-mono text-[9px] ${metaDescription.length > 160 ? 'text-brand-red' : metaDescription.length > 150 ? 'text-amber-500' : 'text-gray-mid'}`}>
                      {metaDescription.length} / 160
                    </span>
                  </div>
                  <textarea 
                    value={metaDescription} 
                    onChange={e => setMetaDescription(e.target.value)} 
                    placeholder="Short SEO snippet (150-160 chars)"
                    className="w-full h-16 p-2 border border-gray-light focus:border-black outline-none font-sans text-sm resize-none bg-transparent" 
                  />
                </div>
                <div className="space-y-2" id="field-focusKeyword">
                  <label className="font-mono text-[9px] uppercase tracking-widest text-gray-mid">Focus Keyword</label>
                  <input type="text" value={focusKeyword} onChange={e => { setFocusKeyword(e.target.value); setValidationErrors(p => ({ ...p, focusKeyword: "" })); }} placeholder="e.g. tattoo aftercare cream" className="w-full border-b border-gray-light focus:border-black outline-none pb-1 font-sans text-sm bg-transparent" />
                  {validationErrors.focusKeyword && <p className="font-mono text-[11px] text-brand-red">{validationErrors.focusKeyword}</p>}
                </div>
                <div className="space-y-2">
                  <label className="font-mono text-[9px] uppercase tracking-widest text-gray-mid">Schema Type</label>
                  <select value={schemaType} onChange={e => setSchemaType(e.target.value)} className="w-full border-b border-gray-light focus:border-black outline-none pb-1 font-mono text-sm bg-transparent">
                    <option value="Article">Article</option>
                    <option value="HowTo">HowTo</option>
                    <option value="FAQPage">FAQPage</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="font-mono text-[9px] uppercase tracking-widest text-gray-mid">KEYWORD CATEGORY</label>
                  <select value={keywordCategory} onChange={e => setKeywordCategory(e.target.value)} className="w-full border-b border-gray-light focus:border-black outline-none pb-1 font-mono text-sm bg-transparent">
                    <option value="">-- SELECT CATEGORY --</option>
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* ADDITION 1: EMBEDDED TOOL */}
            <div className="space-y-4 pt-6 border-t border-gray-light">
              <label className="font-mono text-[10px] uppercase tracking-widest text-black font-bold">EMBEDDED TOOL</label>
              <div className="flex flex-wrap gap-2">
                {["NONE", "DESIGN FINDER", "PAIN MAP", "SIZE + COST CALCULATOR", "AGING SIMULATOR", "HEALING DAY TRACKER"].map(tool => (
                  <button
                    key={tool}
                    onClick={() => setSelectedTool(tool)}
                    className={`px-3 py-1.5 font-mono text-[10px] uppercase transition-colors rounded-none border ${selectedTool === tool ? 'bg-black text-white border-black' : 'bg-transparent text-neutral-400 border-neutral-300'}`}
                  >
                    {tool}
                  </button>
                ))}
              </div>
              {selectedTool !== "NONE" && (
                <div className="space-y-2 mt-4">
                  <label className="font-mono text-[9px] uppercase tracking-widest text-gray-mid">WHERE TO PLACE IT</label>
                  <div className="flex flex-wrap gap-2">
                    {["After Introduction", "After Section 2", "After Section 3", "Before FAQ", "Before CTA"].map(pos => (
                      <button
                        key={pos}
                        onClick={() => setToolPosition(pos)}
                        className={`px-3 py-1 font-mono text-[9px] uppercase transition-colors rounded-none border ${toolPosition === pos ? 'bg-brand-red text-white border-brand-red' : 'bg-transparent text-neutral-400 border-neutral-300'}`}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Field 7: AFFILIATE LINKS PANEL */}
            <div className="space-y-4 pt-6 border-t border-gray-light">
              <div className="flex justify-between items-center">
                <label className="font-mono text-[10px] uppercase tracking-widest text-black font-bold">7. Affiliate Links</label>
                <button onClick={addProduct} disabled={products.length >= 6} className="text-gray-mid hover:text-black disabled:opacity-50"><Plus className="w-4 h-4" /></button>
              </div>
              <div className="space-y-3">
                {products.map((p, idx) => (
                  <div key={idx} className="bg-off-white p-4 border border-gray-light space-y-4 relative">
                    <button onClick={() => removeProduct(idx)} className="absolute top-2 right-2 text-brand-red p-1 hover:bg-red-50"><X className="w-4 h-4" /></button>
                    
                    <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="font-mono text-[9px] uppercase tracking-widest text-gray-mid">Product Name</label>
                        <input type="text" value={p.name} onChange={e => updateProduct(idx, 'name', e.target.value)} className="w-full bg-transparent border-b border-gray-light text-sm outline-none font-sans font-bold" />
                      </div>
                      <div className="space-y-2">
                        <label className="font-mono text-[9px] uppercase tracking-widest text-gray-mid">Price</label>
                        <input type="text" value={p.price} onChange={e => updateProduct(idx, 'price', e.target.value)} className="w-full bg-transparent border-b border-gray-light text-sm outline-none font-mono" />
                      </div>
                    </div>

                    <div className="space-y-2">
                       <label className="font-mono text-[9px] uppercase tracking-widest text-gray-mid">Affiliate URL</label>
                       <input type="text" value={p.url} onChange={e => updateProduct(idx, 'url', e.target.value)} className="w-full bg-transparent border-b border-gray-light text-sm outline-none font-mono" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="font-mono text-[9px] uppercase tracking-widest text-gray-mid">Tag (e.g. BEST BUDGET)</label>
                        <input type="text" value={p.tag} onChange={e => updateProduct(idx, 'tag', e.target.value)} className="w-full bg-transparent border-b border-gray-light text-sm outline-none font-mono text-brand-red uppercase" />
                      </div>
                      <div className="space-y-2">
                        <label className="font-mono text-[9px] uppercase tracking-widest text-gray-mid">Button Label</label>
                        <input type="text" value={p.button_label} onChange={e => updateProduct(idx, 'button_label', e.target.value)} className="w-full bg-transparent border-b border-gray-light text-sm outline-none font-mono" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="font-mono text-[9px] uppercase tracking-widest text-gray-mid text-black font-bold">Product Description</label>
                      <textarea 
                        value={p.description} 
                        onChange={e => updateProduct(idx, 'description', e.target.value)} 
                        placeholder="Brief summary of why this product is recommended..."
                        className="w-full bg-transparent border border-gray-light p-2 text-sm outline-none font-sans min-h-[60px] resize-none" 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="font-mono text-[9px] uppercase tracking-widest text-gray-mid text-black font-bold">Product Image</label>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-10 bg-white border border-gray-light flex-shrink-0 overflow-hidden relative">
                          {p.image_url ? (
                            <img src={p.image_url} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-neutral-50">
                               <ImageIcon className="w-4 h-4 text-neutral-300" />
                            </div>
                          )}
                        </div>
                        <input 
                          type="file" 
                          id={`prod-img-upload-${idx}`}
                          className="hidden" 
                          onChange={(e) => handleProductImageUpload(idx, e)}
                          accept=".jpg,.jpeg,.png,.webp"
                        />
                        <label 
                          htmlFor={`prod-img-upload-${idx}`}
                          className="font-mono text-[10px] uppercase border border-neutral-300 px-3 py-1 cursor-pointer hover:bg-neutral-50 transition-colors"
                        >
                          {p.image_url ? "Change Image" : "Upload Image"}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
                {products.length === 0 && <p className="font-mono text-[10px] text-gray-mid italic">No products added.</p>}
              </div>
            </div>

            {/* ADDITION 3: INTERNAL LINKS TRACKER */}
            <div className="space-y-4 pt-6 border-t border-gray-light">
              <div className="flex justify-between items-center">
                <label className="font-mono text-[10px] uppercase tracking-widest text-black font-bold">INTERNAL LINKS</label>
                <button 
                  onClick={() => setInternalLinks([...internalLinks, {url: "", anchor: ""}])} 
                  disabled={internalLinks.length >= 6} 
                  className="text-gray-mid hover:text-black disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                {internalLinks.map((l, idx) => (
                  <div key={idx} className="flex gap-2 items-start bg-off-white p-3 border border-gray-light">
                    <div className="flex-1 space-y-2">
                      <input 
                        type="text" 
                        placeholder="/meaning/butterfly or /blog/aftercare-instructions" 
                        value={l.url} 
                        onChange={e => {
                          const newLinks = [...internalLinks];
                          newLinks[idx].url = e.target.value;
                          setInternalLinks(newLinks);
                        }} 
                        className="w-full bg-transparent border-b border-gray-light text-sm outline-none font-mono" 
                      />
                      <input 
                        type="text" 
                        placeholder="Anchor text" 
                        value={l.anchor} 
                        onChange={e => {
                          const newLinks = [...internalLinks];
                          newLinks[idx].anchor = e.target.value;
                          setInternalLinks(newLinks);
                        }} 
                        className="w-full bg-transparent border-b border-gray-light text-sm outline-none font-sans" 
                      />
                    </div>
                    <button onClick={() => setInternalLinks(internalLinks.filter((_, i) => i !== idx))} className="text-brand-red p-1"><X className="w-4 h-4" /></button>
                  </div>
                ))}
                {internalLinks.length === 0 && <p className="font-mono text-[10px] text-gray-mid italic">No internal links added.</p>}
              </div>
              <div className={`font-mono text-[10px] font-bold ${internalLinks.length >= 3 ? 'text-green-600' : 'text-amber-500'}`}>
                {internalLinks.length} OF 3 MINIMUM
              </div>
            </div>

            {/* Field 8: HOOK MODEL CHECKLIST */}
            <div className="pt-6 border-t border-gray-light">
              <button 
                onClick={() => setIsHookModelOpen(!isHookModelOpen)}
                className="flex items-center justify-between w-full font-mono text-[11px] text-brand-red font-bold uppercase tracking-widest"
              >
                8. Hook Model Check
                {isHookModelOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {isHookModelOpen && (
                <div className="mt-4 space-y-3 bg-red-50 p-4 border border-brand-red/20">
                  { [
                    (postIntent === "INFORM AND REFER" && selectedAudience === "REMOVAL SEEKER") ? "TRIGGER — Does the title match the regret or embarrassment that drives someone to search for removal at 11pm?" :
                    postIntent === "RECOMMEND AND SELL" ? "TRIGGER — Does the title match what someone searches for when they are ready to buy and just need to know which product?" :
                    selectedAudience === "FIRST-TIMER" ? "TRIGGER — Does the title match the anxiety of someone getting their first tattoo?" :
                    selectedAudience === "ARTIST" ? "TRIGGER — Does the title match a professional problem the artist is trying to solve?" :
                    "TRIGGER — Does the title match what someone searches for when they feel the pain this post solves?",
                    "ACTION — Can the reader get the core value within 30 seconds of arriving (the short answer is above the fold)?",
                    "VARIABLE REWARD — Is there something surprising, specific, or unexpected that the reader did not already know?",
                    "SOCIAL CURRENCY — Is there a shareable insight, statistic, or quote that makes the reader look smart if they share it?",
                    "INVESTMENT — Does the post ask the reader to save a design, join the waitlist, or link to the TattoosMap gallery?",
                    "PRACTICAL VALUE — Does this post actually help the reader make a decision or take an action today?"
                  ].map((label, i) => (
                    <label key={i} className="flex flex-start gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={hookChecks[i]} 
                        onChange={() => {
                          const newChecks = [...hookChecks];
                          newChecks[i] = !newChecks[i];
                          setHookChecks(newChecks);
                        }}
                        className="mt-1"
                      />
                      <span className="font-sans text-[12px] leading-tight text-brand-red-dark group-hover:text-brand-red transition-colors">{label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* EXPORT BUTTONS */}
            <div className="pt-10 space-y-3">
              <button type="button" onClick={copyMarkdown} className="w-full bg-white border border-black text-black font-mono text-[11px] uppercase tracking-widest py-3 flex items-center justify-center gap-2 hover:bg-neutral-50 transition-colors">
                <Copy className="w-4 h-4" /> Copy Markdown
              </button>
              <button type="button" onClick={copyAsJson} className="w-full bg-black border border-black text-white font-mono text-[11px] uppercase tracking-widest py-3 flex items-center justify-center gap-2 hover:bg-neutral-800 transition-colors">
                <Copy className="w-4 h-4" /> Copy As Blog Post Data
              </button>
              <button 
                type="button"
                onClick={handlePublishClick} 
                disabled={isPublishing}
                className="w-full bg-brand-red text-white font-mono text-[11px] uppercase tracking-widest p-[16px] hover:bg-brand-red/90 transition-colors border-none rounded-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPublishing ? "PUBLISHING..." : "PUBLISH POST →"}
              </button>
            </div>

          </div>
        </div>

        {/* PREVIEW Right Side */}
        <div className={`${mobileMode === "PREVIEW" ? "block" : "hidden"} md:block w-full md:w-[60%] bg-off-white ${isPsychologySidebarOpen ? 'overflow-hidden' : 'overflow-y-auto'} relative`} onScroll={handleScroll}>
          {/* 1. PROGRESS BAR */}
          <div className="sticky top-0 left-0 w-full h-[2px] bg-transparent z-50 pointer-events-none">
            <div className="h-full bg-brand-red" style={{ width: `${readProgress}%` }} />
          </div>

          <div className="bg-white min-h-full pb-32 max-w-[100vw] overflow-x-hidden">
            
            {/* Mobile order vs Desktop order logic for Hero */}
            <div className="md:hidden pt-8 px-[16px] mb-6">
              {/* 3. POST TYPE BADGE */}
              {selectedType && (
                 <span className="inline-block font-mono text-[10px] uppercase tracking-[0.08em] text-brand-red mb-4 bg-red-50 border border-brand-red/10 px-2 py-0.5 rounded-none">
                    {selectedType}
                 </span>
              )}
              {/* 4 & 5. TITLE AND TIME */}
              <h1 className="font-display text-[34px] font-medium leading-[1.1] text-black mb-4">
                  {title || "Your post title here"}
              </h1>
              <p className="font-mono text-[11px] text-gray-mid uppercase tracking-widest mb-6 border-b border-gray-light pb-6">
                  {readTime} MIN READ
              </p>
            </div>

            {/* 2. HERO IMAGE */}
            <div className="relative w-full aspect-video bg-neutral-200 border-b border-border-tertiary overflow-hidden group">
              <input 
                type="file"
                ref={heroInputRef}
                onChange={handleHeroUpload}
                className="hidden"
                accept=".jpg,.jpeg,.png,.webp,.avif"
              />
              
              {heroImageUrl ? (
                <img src={heroImageUrl} alt="Hero" className="w-full h-full object-cover" />
              ) : (
                <button 
                  onClick={() => heroInputRef.current?.click()}
                  disabled={isHeroUploading}
                  className={`w-full h-full flex flex-col items-center justify-center p-4 text-center transition-all ${isHeroUploading ? "animate-pulse" : ""}`}
                >
                  <ImageIcon className="w-8 h-8 text-neutral-400 mb-2" />
                  <span className="font-mono text-[10px] md:text-[12px] text-gray-mid uppercase tracking-widest">
                    {isHeroUploading ? "UPLOADING..." : "HERO IMAGE — 1600x900px recommended, AVIF or WebP, under 400KB"}
                  </span>
                  {!isHeroUploading && (
                    <span className="font-mono text-[10px] text-brand-red mt-2 uppercase">CLICK TO UPLOAD HERO IMAGE</span>
                  )}
                </button>
              )}

              {heroImageUrl && !isHeroUploading && (
                <button 
                  onClick={() => heroInputRef.current?.click()}
                  className="absolute bottom-4 right-4 bg-white/90 backdrop-blur border border-black px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest shadow-sm hover:bg-white transition-colors"
                >
                  REPLACE
                </button>
              )}
              
              {isHeroUploading && !heroImageUrl && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/20">
                  <Loader2 className="w-8 h-8 text-brand-red animate-spin" />
                </div>
              )}
            </div>

            <div className="max-w-[680px] mx-auto px-[16px] md:px-[20px] pt-12 md:pt-20">
              {/* Desktop order for Title/Meta */}
              <div className="hidden md:block mb-12 border-b border-gray-light pb-12">
                 {selectedType && (
                    <span className="inline-block font-mono text-[10px] uppercase tracking-[0.08em] text-brand-red mb-6 bg-red-50 border border-brand-red/10 px-3 py-1 rounded-none">
                        {selectedType}
                    </span>
                 )}
                 <h1 className="font-display text-[48px] font-medium leading-[1.1] text-black max-w-[800px] mb-6">
                     {title || "Your post title here"}
                 </h1>
                 <p className="font-mono text-[12px] text-gray-mid uppercase tracking-widest">
                     {readTime} MIN READ
                 </p>
              </div>

              {/* 6. EXECUTIVE SUMMARY */}
              {executiveSummary && (
                <p className="text-[18px] italic leading-[1.6] text-gray-mid font-medium border-l-[3px] border-brand-red pl-6 mb-12 font-sans">
                  {executiveSummary}
                </p>
              )}

              {/* 7. TABLE OF CONTENTS */}
              {showTOC && (
                <div className="bg-off-white border border-gray-light p-6 mb-[20px]">
                  <p className="font-mono text-[11px] uppercase tracking-widest text-black mb-4 border-b border-gray-light pb-2">Contents</p>
                  <ul className="space-y-2">
                    {headings.map((h, i) => (
                      <li key={i} className="font-sans text-[14px] text-brand-red underline decoration-brand-red/30 underline-offset-4">
                        {i+1}. {h.replace(/^##\s+/, '')}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 8. BODY CONTENT (Markdown) */}
              <div className="prose max-w-[680px] break-words text-black 
                            prose-headings:text-black prose-headings:font-display prose-headings:font-medium
                            prose-strong:font-medium prose-strong:text-black">
                {(() => {
                  // Split only the raw content before processing to handle tool insertion
                  const rawParts = [debouncedBodyContent];
                  if (selectedTool !== "NONE" && toolPosition) {
                    const headingRegex = /(?=\n## )/g;
                    const splitByHeading = debouncedBodyContent.split(headingRegex);

                    if (toolPosition === "After Introduction") {
                       rawParts[0] = splitByHeading[0] || "";
                       rawParts[1] = splitByHeading.slice(1).join("");
                    } else if (toolPosition === "After Section 2") {
                       rawParts[0] = splitByHeading.slice(0, 3).join('');
                       rawParts[1] = splitByHeading.slice(3).join('');
                    } else if (toolPosition === "After Section 3") {
                       rawParts[0] = splitByHeading.slice(0, 4).join('');
                       rawParts[1] = splitByHeading.slice(4).join('');
                    } else if (toolPosition === "Before FAQ") {
                       const faqSplit = debouncedBodyContent.split(/(?=\n## Frequently)/i);
                       if (faqSplit.length > 1) {
                          rawParts[0] = faqSplit[0];
                          rawParts[1] = faqSplit[1];
                       } else {
                          rawParts[0] = debouncedBodyContent;
                          rawParts[1] = "";
                       }
                    } else if (toolPosition === "Before CTA") {
                        rawParts[0] = debouncedBodyContent;
                        rawParts[1] = "";
                    }
                  }

                  const renderPlaceholder = () => (
                    <div className="border border-gray-light p-8 bg-off-white my-8 text-center text-black">
                      <div className="font-mono text-[10px] uppercase text-black mb-3">{selectedTool}</div>
                      <h2 className="font-display text-[24px] text-black m-0 mb-2">INTERACTIVE TOOL WILL APPEAR HERE</h2>
                      <p className="font-sans text-[15px] text-gray-mid m-0">This tool handles its own logic and will securely render on the client side.</p>
                    </div>
                  );

                  return (
                    <>
                      <ReactMarkdown 
                        remarkPlugins={remarkPluginsList} 
                        rehypePlugins={[rehypeRaw]}
                        components={MarkdownComponents}
                      >
                        {preprocessMarkdown(rawParts[0] || "")}
                      </ReactMarkdown>
                      {rawParts.length > 1 && renderPlaceholder()}
                      {rawParts.length > 1 && rawParts[1] && (
                        <ReactMarkdown 
                          remarkPlugins={remarkPluginsList} 
                          rehypePlugins={[rehypeRaw]}
                          components={MarkdownComponents}
                        >
                          {preprocessMarkdown(rawParts[1])}
                        </ReactMarkdown>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* 9. AFFILIATE DISCLAIMER */}
              {products.length > 0 && (
                <p className="font-mono text-[11px] text-neutral-400 mt-16 mb-[20px] pt-8 border-t border-gray-light uppercase tracking-widest">
                  DISCLOSURE: This post contains affiliate links. If you purchase through our links we may earn a small commission at no extra cost to you.
                </p>
              )}
            </div>

            {/* 10. UPDATED PRODUCT RECOMMENDATIONS (Area 1 Specs) */}
            {products.length > 0 && (
              <div className="max-w-[720px] mx-auto px-5 mb-24">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                  {products.map((product, idx) => (
                    <div key={idx} className="border-[0.5px] border-gray-light flex flex-col bg-white">
                       <div className="aspect-[16/9] w-full bg-neutral-50 relative overflow-hidden shrink-0">
                          {product.image_url ? (
                            <img src={product.image_url} className="w-full h-full object-cover" alt={product.name} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-neutral-100 italic font-mono text-[10px] text-neutral-400">[PRODUCT IMAGE]</div>
                          )}
                       </div>
                       <div className="p-6 flex flex-col flex-1">
                          <div className="text-neutral-200 font-display text-[48px] leading-none mb-3 tabular-nums">0{idx + 1}</div>
                          <h4 className="font-display text-[20px] leading-tight text-black mb-1">{product.name || "Product Name"}</h4>
                          <p className="font-mono text-[12px] text-neutral-400 mb-4 uppercase tracking-widest">{product.price || "$0.00"}</p>
                          
                          <p className="font-sans text-[15px] leading-relaxed text-black/80 mb-4 flex-1">
                            {idx === 0 ? "Ranked #1 for its rapid absorption and clinical efficacy in protecting the skin barrier during the critical first 72 hours." : 
                             idx === 1 ? "Our secondary pick for sensitive skin, focusing on hydration without petroleum derivatives or clogging ingredients." :
                             "Formulated for long-term daily use, balancing affordability with clean ingredients for consistent skin health."}
                          </p>
                          
                          <p className="font-mono text-[11px] italic text-neutral-400 mb-8 leading-relaxed">
                            Honest limitation: This formulation requires 2-3 thin applications daily rather than one thick layer.
                          </p>

                          <button className="w-full bg-black text-white py-4 font-mono text-[11px] uppercase tracking-widest hover:bg-brand-red transition-colors border-none rounded-none">
                             {product.button_label || "BUY ON AMAZON"} →
                          </button>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 11. DYNAMIC PRIMARY CTA BASED ON INTENT (FIX 3.3) */}
            <div className="mt-8 bg-black text-center py-20 px-6">
              {postIntent === "INFORM AND REFER" ? (
                <div className="max-w-[540px] mx-auto">
                    <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest block mb-4 border border-neutral-800 inline-block px-3 py-1">TATTOOSMAP VERIFIED CLINICS</span>
                    <h2 className="font-display text-[32px] md:text-[40px] text-white leading-tight mb-4 uppercase tracking-tighter">Ready To Start?</h2>
                    <p className="font-sans text-[17px] text-neutral-400 mb-10 leading-relaxed">Get a free consultation quote from a verified removal clinic. No commitment, just a real price for your specific tattoo.</p>
                    <button className="bg-brand-red text-white py-5 px-10 font-mono text-[12px] uppercase tracking-widest font-bold border-none rounded-none hover:brightness-110 transition-all">
                      FIND A CLINIC NEAR YOU
                    </button>
                    <p className="mt-10 font-mono text-[11px] text-neutral-500 max-w-[360px] mx-auto leading-relaxed">
                      TattoosMap earns a referral fee if you book. This does not affect the price you pay.
                    </p>
                </div>
              ) : (
                <div className="max-w-[540px] mx-auto">
                    <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest block mb-4 border border-neutral-800 inline-block px-3 py-1">TATTOOSMAP DESIGN LIBRARY</span>
                    <h2 className="font-display text-[32px] md:text-[40px] text-white leading-tight mb-4 uppercase tracking-tighter">Find Your Perfect Design</h2>
                    <p className="font-sans text-[17px] text-neutral-400 mb-10 leading-relaxed">Browse verified designs, see how they age over 5 years, and save your favorites.</p>
                    <button className="bg-brand-red text-white py-5 px-10 font-mono text-[12px] uppercase tracking-widest font-bold border-none rounded-none hover:brightness-110 transition-all">
                      EXPLORE THE GALLERY →
                    </button>
                </div>
              )}
            </div>

            <div className="max-w-[680px] mx-auto px-[16px] md:px-[20px] mt-16 space-y-8">
              {/* 12. SCHEMA PREVIEW */}
              <div className="border border-gray-light bg-white">
                <button 
                  onClick={() => setIsSchemaPreviewOpen(!isSchemaPreviewOpen)}
                  className="w-full flex justify-between items-center p-4 font-mono text-[11px] uppercase tracking-widest text-black bg-off-white hover:bg-neutral-200 transition-colors"
                >
                  SCHEMA MARKUP PREVIEW
                  {isSchemaPreviewOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {isSchemaPreviewOpen && (
                  <div className="p-4 bg-black text-green-400 font-mono text-[10px] md:text-[12px] overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify({
                      "@context": "https://schema.org",
                      "@type": schemaType,
                      "headline": title || "Untitled post",
                      "description": executiveSummary || "No description provided."
                    }, null, 2)}
                  </div>
                )}
              </div>

              {/* 13. SEO PREVIEW CARD */}
              <div className="border border-gray-light p-6 bg-white">
                <p className="font-mono text-[10px] text-gray-mid uppercase tracking-widest mb-4 border-b border-gray-light pb-2">Google Search Preview</p>
                <div className="max-w-[600px] font-sans">
                  <div className="flex gap-2 items-center mb-1">
                    <div className="w-6 h-6 bg-neutral-200 rounded-full flex-shrink-0" />
                    <div>
                      <p className="text-[14px] text-[#202124] leading-tight">TattoosMap</p>
                      <p className="text-[12px] text-[#4d5156] leading-tight">https://tattoosmap.com/blog/{(title || "untitled-post").toLowerCase().replace(/\\s+/g, '-')}</p>
                    </div>
                  </div>
                  <h3 className="text-[20px] text-[#1a0dab] group-hover:underline cursor-pointer leading-[1.3] mb-1">
                    {metaTitle || title || "Your post title here"}
                  </h3>
                  <p className="text-[14px] text-[#4d5156] leading-[1.58] line-clamp-2">
                    {executiveSummary || "Your executive summary will appear here to hook searchers."}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* PSYCHOLOGY SIDEBAR */}
      <div 
        className={`fixed top-0 right-0 h-full w-[320px] bg-white border-l border-brand-red z-[100] transform transition-transform duration-300 ease-in-out ${isPsychologySidebarOpen ? "translate-x-0" : "translate-x-full"} shadow-2xl flex flex-col`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-light bg-off-white shrink-0">
          <h2 className="font-mono text-[12px] text-brand-red font-bold tracking-widest uppercase">Psychology Library</h2>
          <button onClick={() => setIsPsychologySidebarOpen(false)} className="text-gray-mid hover:text-black"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-4 overflow-y-auto space-y-6 flex-1 text-black overscroll-contain scrollbar-gutter-stable">
          
          <div className="border border-gray-light p-4 bg-off-white">
            <h3 className="font-mono text-[10px] uppercase font-bold tracking-widest mb-3 border-b border-gray-light pb-2">Card 1 — THE HOOK MODEL (Nir Eyal)</h3>
            <pre className="font-sans text-[12px] whitespace-pre-wrap break-words leading-relaxed">
{`TRIGGER: Does the title match an internal pain?
         Bored? Scared? Uncertain? → They search.

ACTION: Get them the value in under 30 seconds.
        Fogg Model: High motivation + Low friction.

VARIABLE REWARD: Surprise them.
                 Unexpected fact, specific number,
                 or counterintuitive insight.

INVESTMENT: Ask for one small thing.
            Save a design. Join the waitlist.
            Select a style preference.`}
            </pre>
          </div>

          <div className="border border-gray-light p-4 bg-off-white">
            <h3 className="font-mono text-[10px] uppercase font-bold tracking-widest mb-3 border-b border-gray-light pb-2">Card 2 — VIRALITY (Contagious, Jonah Berger)</h3>
            <pre className="font-sans text-[12px] whitespace-pre-wrap break-words leading-relaxed">
{`SOCIAL CURRENCY: Does sharing this make them
                 look smart or "in the know"?

PRACTICAL VALUE: Is this actually useful enough
                 that they want to help others
                 by sharing it?

EMOTION: High-arousal emotion drives sharing.
         Awe, surprise, and excitement work.
         Sadness does not.

STORIES: Wrap facts in a narrative people
         want to retell.`}
            </pre>
          </div>

          <div className="border border-gray-light p-4 bg-off-white">
            <h3 className="font-mono text-[10px] uppercase font-bold tracking-widest mb-3 border-b border-gray-light pb-2">Card 3 — UX FLOW (Don't Make Me Think, Krug)</h3>
            <pre className="font-sans text-[12px] whitespace-pre-wrap break-words leading-relaxed">
{`RULE 1: The user should never wonder
        "where do I click next?"

RULE 2: Every extra click loses ~20%
        of conversion.

RULE 3: Use conventions. Don't reinvent
        the back button.

RULE 4: The short answer goes first.
        Always. No exceptions.`}
            </pre>
          </div>

          <div className="border border-gray-light p-4 bg-off-white">
            <h3 className="font-mono text-[10px] uppercase font-bold tracking-widest mb-3 border-b border-gray-light pb-2">Card 4 — CONTENT PERFORMANCE SPECS</h3>
            <pre className="font-sans text-[12px] whitespace-pre-wrap break-words leading-relaxed">
{`WORD COUNT TARGET: 1,500 — 2,500 words
HEADING FREQUENCY: Every 3-5 paragraphs
IMAGE FREQUENCY: 1 per 350-500 words
READING TIME DISPLAY: Mandatory (+40% engagement)
TABLE OF CONTENTS: Mandatory for 1,500+ words
PROGRESS BAR: 2px at top of page
SHORT ANSWER: Must be above the fold
AFFILIATE DISCLOSURE: First paragraph`}
            </pre>
          </div>

        </div>
      </div>

      {showPublishModal && (
        <div className="fixed inset-0 bg-black/70 z-[999] flex items-center justify-center p-4">
          <div className="bg-white max-w-[540px] w-full border border-gray-light">
            
            {publishState === "idle" || publishState === "publishing" ? (
              <>
                <div className="p-6 md:p-8">
                  <h2 className="font-display text-[28px] uppercase text-black leading-none mb-1">READY TO PUBLISH</h2>
                  <p className="font-mono text-[11px] text-neutral-400 mb-8">Review your post before it goes live.</p>

                  <div className="border border-gray-light">
                     <div className="flex justify-between items-center p-3 border-b border-gray-light bg-off-white">
                       <span className="font-mono text-[10px] uppercase text-neutral-400">TITLE:</span>
                       <span className="font-mono text-[12px] text-black text-right max-w-[70%] truncate">{title}</span>
                     </div>
                     <div className="flex justify-between items-center p-3 border-b border-gray-light bg-off-white">
                       <span className="font-mono text-[10px] uppercase text-neutral-400">FOCUS KEYWORD:</span>
                       <span className="font-mono text-[12px] text-black text-right max-w-[70%] truncate">{focusKeyword}</span>
                     </div>
                     <div className="flex justify-between items-center p-3 border-b border-gray-light bg-off-white">
                       <span className="font-mono text-[10px] uppercase text-neutral-400">META TITLE:</span>
                       <span className="font-mono text-[12px] text-black text-right max-w-[70%] truncate">{metaTitle.substring(0, 60)}</span>
                     </div>
                     <div className="flex justify-between items-center p-3 border-b border-gray-light bg-off-white">
                       <span className="font-mono text-[10px] uppercase text-neutral-400">META DESC:</span>
                       <span className="font-mono text-[12px] text-black text-right max-w-[70%] truncate">{metaDescription.substring(0, 60)}...</span>
                     </div>
                     <div className="flex justify-between items-center p-3 border-b border-gray-light bg-off-white">
                       <span className="font-mono text-[10px] uppercase text-neutral-400">SCHEMA TYPE:</span>
                       <span className="font-mono text-[12px] text-black text-right max-w-[70%] truncate">{schemaType}</span>
                     </div>
                     <div className="flex justify-between items-center p-3 border-b border-gray-light bg-off-white">
                       <span className="font-mono text-[10px] uppercase text-neutral-400">WORD COUNT:</span>
                       <span className="font-mono text-[12px] text-black text-right max-w-[70%] truncate">{wordCount} words</span>
                     </div>
                     <div className="flex justify-between items-center p-3 border-b border-gray-light bg-off-white">
                       <span className="font-mono text-[10px] uppercase text-neutral-400">READING TIME:</span>
                       <span className="font-mono text-[12px] text-black text-right max-w-[70%] truncate">{readTime} MIN READ</span>
                     </div>
                     <div className="flex justify-between items-center p-3 border-b border-gray-light bg-off-white">
                       <span className="font-mono text-[10px] uppercase text-neutral-400">IMAGES:</span>
                       <span className="font-mono text-[12px] text-black text-right max-w-[70%] truncate">{bodyContent.match(/!\[.*?\]\(.*?\)/g)?.length || 0} inline + {heroImageUrl ? "1 hero" : "no hero"}</span>
                     </div>
                     <div className="flex justify-between items-center p-3 border-b border-gray-light bg-off-white">
                       <span className="font-mono text-[10px] uppercase text-neutral-400">PRODUCTS:</span>
                       <span className="font-mono text-[12px] text-black text-right max-w-[70%] truncate">{products.length} products linked</span>
                     </div>
                     <div className="flex justify-between items-center p-3 bg-off-white">
                       <span className="font-mono text-[10px] uppercase text-neutral-400">POST TYPE:</span>
                       <span className="font-mono text-[12px] text-black text-right max-w-[70%] truncate">{selectedType || "No template selected"}</span>
                     </div>
                  </div>

                  <div className="mt-8">
                    <div className="flex items-center gap-2 mb-2">
                      {hookChecks.map((checked, idx) => (
                        <div key={idx} className={`w-4 h-4 border border-black ${checked ? 'bg-black' : 'bg-transparent'}`} />
                      ))}
                    </div>
                    <p className="font-mono text-[10px] text-black mb-1 font-bold">HOOK MODEL: {hookChecks.filter(Boolean).length} / 6 CHECKS</p>
                    {hookChecks.filter(Boolean).length < 4 ? (
                      <p className="font-mono text-[10px] text-amber-500">Consider completing more checks before publishing</p>
                    ) : (
                      <p className="font-mono text-[10px] text-green-600">Good to go</p>
                    )}
                  </div>

                </div>
                <div className="flex border-t border-gray-light">
                  <button 
                     type="button"
                     onClick={() => setShowPublishModal(false)} 
                     disabled={isPublishing}
                     className="flex-1 p-4 bg-transparent border-t-0 border-b-0 border-l-0 text-black font-mono text-[11px] uppercase border-r border-gray-light hover:bg-neutral-50 transition-colors disabled:opacity-50"
                  >
                    CANCEL
                  </button>
                  <button 
                     type="button"
                     onClick={confirmAndPublish}
                     disabled={isPublishing}
                     className="flex-1 p-4 bg-black border-t-0 border-b-0 border-r-0 border-l border-black text-white font-mono text-[11px] uppercase hover:bg-neutral-900 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isPublishing ? <><Loader2 className="w-4 h-4 animate-spin"/> PUBLISHING...</> : "CONFIRM AND PUBLISH"}
                  </button>
                </div>
              </>
            ) : publishState === "success" ? (
              <div className="p-8 pb-12 text-center flex flex-col items-center">
                <h2 className="font-display text-[48px] uppercase text-black leading-none mb-4 tracking-tighter">PUBLISHED</h2>
                <div className="w-16 h-[2px] bg-brand-red mb-6" />
                <p className="font-mono text-[14px] text-neutral-400 mb-12">{title}</p>
                <div className="flex flex-col w-full gap-3">
                   <a 
                     href={`/blog/${publishedSlug}`}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="w-full bg-black block border-none text-white font-mono text-[11px] uppercase py-4 transition-colors hover:bg-neutral-900"
                   >
                     VIEW LIVE POST
                   </a>
                   <button 
                     onClick={() => {
                       setTitle("");
                       setExecutiveSummary("");
                       setBodyContent("");
                       setMetaTitle("");
                       setMetaDescription("");
                       setFocusKeyword("");
                       setSelectedType(null);
                       setProducts([]);
                       setHookChecks(new Array(6).fill(false));
                       setHeroImageUrl("");
                       setShowPublishModal(false);
                       setPublishState("idle");
                       
                       setSelectedTool("NONE");
                       setToolPosition("");
                       setSelectedAudience("");
                       setInternalLinks([]);
                       setKeywordCategory("");

                       const scrollContainer = document.querySelector('.overflow-y-auto');
                       if (scrollContainer) scrollContainer.scrollTo(0,0);
                     }}
                     className="w-full bg-transparent border border-black text-black font-mono text-[11px] uppercase py-4 transition-colors hover:bg-neutral-50"
                   >
                     WRITE ANOTHER POST
                   </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center flex flex-col items-center">
                <h2 className="font-display text-[24px] uppercase text-brand-red leading-none mb-4">PUBLISH FAILED</h2>
                <p className="font-mono text-[12px] text-neutral-600 mb-8 max-w-[300px] break-words">{publishErrorMsg}</p>
                <button 
                  onClick={() => {
                     setPublishState("idle");
                     setIsPublishing(false);
                  }}
                  className="w-full border-none bg-black text-white font-mono text-[11px] uppercase py-4 transition-colors hover:bg-neutral-900 mb-4"
                >
                  TRY AGAIN
                </button>
                <p className="font-mono text-[11px] text-neutral-400">Your post content is safe — nothing was lost.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
