"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { isAdmin } from "@/lib/admin";
import ProductPostTemplate from "@/components/blog/ProductPostTemplate";
import VisualStepTemplate from "@/components/blog/VisualStepTemplate";
import { ChevronDown, Loader2 } from "lucide-react";
import { publishLabPostAction, saveDraftAction, getDraftAction, deleteDraftAction, getLabPostAction, updateLabPostAction } from "@/actions/admin";

import { PRODUCT_CATEGORIES } from "@/lib/constants";

const BLOG_CATEGORIES = ["Styles", "Technique", "Culture", "History", "Ink & Equipment", "Artist Spotlight", "Aftercare", "Trends", "Meaning & Symbolism", "Tattoo Removal", "Pain & Placement", "Body Zone Specific", "Design Subject Direct", "Style Guides", "Design Ideas", "Cost & Pricing", "First Timer", "FAQ & How-To", "Artist & Studio", "Products & Equipment", "Zodiac & Astrology", "Cultural & Themed", "Pop Culture", "Comparison & Versus", "Temporary & Henna"];

const BLANK_STATE = {
    title: "",
    executiveSummary: "",
    scienceHeading: "Why This Matters — The Science",
    scienceContent: "",
    pullQuote: "",
    steps: [],
    products: [],
    honorableMentions: [],
    protocolSteps: [],
    avoidItems: [],
    infoSections: [],
    faqItems: [],
    heroImageSrc: "",
    heroImageAlt: "",
    badge: "PRODUCT GUIDE",
    readTime: "7 MIN READ",
    ctaHeading: "Find Your Perfect Design",
    ctaBody: "Browse verified designs, see how they age over 5 years, and save your favorites before your consultation.",
    ctaButtonText: "EXPLORE THE GALLERY →",
    ctaButtonHref: "/gallery",
    clinicCtaHeading: "Ready To Start?",
    clinicCtaBody: "Get a free consultation from a verified removal clinic.",
    clinicCtaButtonText: "FIND A CLINIC NEAR YOU",
    clinicCtaButtonHref: "/removal",
    shortAnswer: "",
    investContent: "",
    category: "",
    tags: [],
    selectedTool: "NONE",
    toolPosition: "",
    toolMarkers: []
};

const VISUAL_BLANK_STATE = {
    ...BLANK_STATE,
    shortAnswer: "Click to write the 1-2 sentence short answer...",
    scienceHeading: "Why This Matters — The Science",
    scienceContent: "Click to explain the biological mechanism that explains this stage or topic...",
    pullQuote: "Click to write a shareable visual quote or key takeaway...",
    investContent: "Click to fill content directly from the TattoosMap team...",
    steps: [
        { id: `step-${Date.now()}-1`, number: "01", title: "Step 1 Title", content: "Explain the detailed actions and nuances of step 1...", imageSrc: "", imageAlt: "", tip: "", tipType: "tip" },
        { id: `step-${Date.now()}-2`, number: "02", title: "Step 2 Title", content: "Explain the detailed actions and nuances of step 2...", imageSrc: "", imageAlt: "", tip: "", tipType: "tip" },
        { id: `step-${Date.now()}-3`, number: "03", title: "Step 3 Title", content: "Explain the detailed actions and nuances of step 3...", imageSrc: "", imageAlt: "", tip: "", tipType: "tip" }
    ]
};

// HELPER: Build Markdown from State for DB storage (Fix 5)
const buildMarkdownFromState = (state: any) => {
    let md = "";
    const toolMarkers = state.toolMarkers || [];

    const getToolMarkersForAnchor = (anchor: string) => {
        return toolMarkers
            .filter((tm: any) => tm.anchor === anchor)
            .map((tm: any) => `:::tool[${tm.toolId}]:::\n\n`)
            .join("");
    };
    
    // Top anchor
    md += state.executiveSummary ? `${state.executiveSummary}\n\n` : '';
    md += getToolMarkersForAnchor("top");
    
    // Short answer anchor
    md += state.shortAnswer ? `:::shortanswer\n${state.shortAnswer}\n:::\n\n` : '';
    
    // Science anchor
    md += state.scienceContent ? `## ${state.scienceHeading || "Why This Matters — The Science"}\n\n${state.scienceContent}\n\n` : '';
    md += getToolMarkersForAnchor("science");
    
    // Pull quote anchor
    md += state.pullQuote ? `:::invest\n💡 ${state.pullQuote}\n:::\n\n` : '';
    md += getToolMarkersForAnchor("pull-quote");
    
    // Invest anchor
    md += state.investContent ? `:::invest\n${state.investContent}\n:::\n\n` : '';
    md += getToolMarkersForAnchor("invest");

    // Info sections
    if (state.infoSections && state.infoSections.length > 0) {
        state.infoSections.forEach((sec: any) => {
            md += `## ${sec.heading}\n\n${sec.content}\n\n`;
            md += getToolMarkersForAnchor(`info-${sec.id}`);
        });
    }

    // Products anchor
    md += getToolMarkersForAnchor("products");

    // Protocol anchor
    md += getToolMarkersForAnchor("protocol");

    // Avoid anchor
    md += getToolMarkersForAnchor("avoid");

    // FAQ anchor
    md += getToolMarkersForAnchor("faq");

    // Inject custom headings configuration footer for dynamic extraction on front-end
    if (state.rankedListHeading || state.protocolHeading || state.avoidHeading || state.faqHeading || state.shortAnswerHeading) {
        const config = {
            headings: {
                rankedList: state.rankedListHeading,
                protocol: state.protocolHeading,
                avoid: state.avoidHeading,
                faq: state.faqHeading,
                shortAnswer: state.shortAnswerHeading
            }
        };
        md += `\n\n:::config\n${JSON.stringify(config)}\n:::`;
    }
    
    return md;
};



// Real content for templates (Fix 6)
const TEMPLATES = {
  // GROUP 1: VISUAL STEP GUIDES
  "BLANK VISUAL GUIDE": { 
    ...VISUAL_BLANK_STATE,
    postType: "VISUAL STEP GUIDE"
  },

  "HEALING TIMELINE": {
    ...BLANK_STATE,
    postType: "VISUAL STEP GUIDE",
    title: "Tattoo Healing Process — Day by Day What To Expect 2026",
    executiveSummary: "The peeling in Week 2 is not your tattoo falling off. The itching is not an infection. The dull cloudy appearance in Week 3 is not permanent color loss.",
    shortAnswer: "A tattoo takes 2 to 3 weeks for the surface to close and 3 to 4 months for full dermal healing. The color returns between months 2 and 4.",
    scienceHeading: "The Biology of Tattoo Healing",
    scienceContent: "When a tattoo needle deposits ink into the dermis the epidermis above it is damaged. For the first 14 days the skin rebuilds through keratinocyte migration...",
    pullQuote: "The dull cloudy appearance in weeks 3 and 4 is not color loss. It is semi-opaque new epidermal cells. The color returns between months 2 and 4.",
    steps: [
      { id: "s1", number: "01", title: "Day 1 — Wrap Removal and First Wash", content: "Remove the wrap after 3 to 5 hours. Wash with lukewarm water and fragrance-free antibacterial soap. Pat completely dry with a fresh paper towel — never a cloth towel. Apply a very thin layer of Aquaphor.", imageSrc: "", imageAlt: "Day 1 tattoo aftercare first wash", tip: "Never use a cloth towel — it harbors bacteria and the texture disrupts the forming epidermis.", tipType: "warning" },
      { id: "s2", number: "02", title: "Days 2 to 3 — Open Wound Phase", content: "The tattoo weeps plasma and excess ink. This is normal. Continue washing twice daily and applying Aquaphor thinly. Do not pick any forming scabs or plasma crust.", imageSrc: "", imageAlt: "Days 2 to 3 tattoo healing plasma weeping", tip: "Plasma weeping that increases after Day 2 is a warning sign. Normal weeping reduces steadily from Day 1.", tipType: "tip" },
      { id: "s3", number: "03", title: "Day 4 — Switch to Lightweight Moisturizer", content: "Stop Aquaphor today. Switch to Lubriderm or Hustle Butter. Apply twice daily morning and before sleep. The skin begins to tighten — the epidermis is beginning to close.", imageSrc: "", imageAlt: "Day 4 switch from Aquaphor to moisturizer", tip: "This is the most critical transition in the healing process. Continuing Aquaphor after Day 3 traps heat and increases bacterial risk.", tipType: "warning" },
      { id: "s4", number: "04", title: "Week 2 — Peeling Phase", content: "The tattoo peels like a sunburn. Completely normal — dead epidermal cells shedding as new ones form beneath. Do not peel manually. Tap gently if itching is intense.", imageSrc: "", imageAlt: "Week 2 tattoo peeling phase normal healing", tip: "The ink is in the dermis below the peeling layer. It does not come off with the peeling skin.", tipType: "tip" },
      { id: "s5", number: "05", title: "Weeks 3 to 4 — Cloudy Phase", content: "The surface looks healed but the tattoo appears dull or milky. New epidermal cells maturing. The color is still there. Continue once-daily moisturizer. Add mineral SPF after Day 21.", imageSrc: "", imageAlt: "Weeks 3 to 4 tattoo cloudy milky appearance normal", tip: "", tipType: "tip" },
      { id: "s6", number: "06", title: "Months 2 to 4 — Full Color Reveal", content: "New epidermal cells mature and become transparent. Full color and line clarity of your tattoo becomes visible. Continue mineral SPF on sun-exposed placement permanently.", imageSrc: "", imageAlt: "Months 2 to 4 tattoo full color reveal healed", tip: "UV exposure after healing is the single biggest cause of long-term ink fade. Mineral SPF is not optional for outdoor placements.", tipType: "warning" }
    ],
    faqItems: [
      { question: "How long does a tattoo take to heal?", answer: "The epidermis closes in 2 to 3 weeks. Full dermal healing takes 3 to 4 months. Final color clarity appears between months 2 and 4." },
      { question: "Is peeling normal for a healing tattoo?", answer: "Yes completely normal. Peeling is dead epidermal cells shedding. The ink is in the dermis below — it does not peel away." },
      { question: "Why does my tattoo look dull and cloudy?", answer: "New epidermal cells are semi-opaque when they first form. They become transparent between months 2 and 4 and full color returns." },
      { question: "How long after a tattoo can you swim?", answer: "4 weeks minimum for pools and natural water. Showers are safe throughout healing." },
      { question: "What does an infected tattoo look like?", answer: "Spreading redness beyond the tattoo boundary, increasing heat, swelling growing after Day 3, green or yellow discharge, and fever are infection signs." }
    ]
  },

  "PAIN BY PLACEMENT": {
    ...BLANK_STATE,
    postType: "VISUAL STEP GUIDE",
    title: "Tattoo Pain By Placement — Complete 2026 Guide",
    executiveSummary: "Pain during tattooing is determined almost entirely by placement. The outer forearm and thigh are least painful. The ribs, spine, and inner elbow ditch are most painful.",
    shortAnswer: "Least painful: outer forearm, outer thigh, shoulder, upper arm. Most painful: ribs, spine, inner elbow ditch, armpit, sternum, hands. Check your placement below before booking.",
    scienceHeading: "Why Placement Determines Pain More Than Anything Else",
    scienceContent: "Pain is determined by skin thickness, nerve density, and bone proximity. Thin skin over bone transmits needle vibration directly to the periosteum. The inner elbow ditch contains the median and ulnar nerve bundles — a different category of sensation from any other placement.",
    pullQuote: "The outer thigh has the highest pain tolerance of any placement. The inner elbow ditch contains the median nerve bundle — a different category of sensation entirely.",
    steps: [
      { id: "p1", number: "01", title: "LOW PAIN — Outer Forearm and Thigh", content: "The outer forearm and outer thigh are the least painful placements on the body. Thick muscle layer between skin and bone, relatively low nerve density in the superficial skin, no bone proximity. Ideal for first tattoos and long sessions.", imageSrc: "", imageAlt: "Outer forearm tattoo placement low pain", tip: "The outer thigh is the highest pain tolerance area on the body. Large surface area allows for long sessions without fatigue.", tipType: "tip" },
      { id: "p2", number: "02", title: "LOW PAIN — Upper Arm and Shoulder", content: "The upper arm and shoulder offer good muscle padding and relatively low nerve density. The outer shoulder is particularly forgiving. Inner upper arm begins to increase in sensitivity due to proximity to nerves serving the forearm.", imageSrc: "", imageAlt: "Upper arm shoulder tattoo placement pain level", tip: "", tipType: "tip" },
      { id: "p3", number: "03", title: "MEDIUM PAIN — Inner Forearm and Wrist", content: "The inner forearm has thinner skin and more nerve endings than the outer forearm. The wrist has thin skin over tendons and ligaments. Both are manageable for most people but noticeably more intense than the outer forearm.", imageSrc: "", imageAlt: "Inner forearm wrist tattoo pain placement", tip: "The wrist is often underestimated. Thin skin over the tendons plus constant movement creates a sharp sensation.", tipType: "tip" },
      { id: "p4", number: "04", title: "MEDIUM PAIN — Shoulder Blade and Stomach", content: "The shoulder blade area involves some bone proximity but is generally well-tolerated. The stomach is fleshy but the skin moves with breathing which creates an inconsistent surface and adds to discomfort during longer sessions.", imageSrc: "", imageAlt: "Shoulder blade stomach tattoo placement pain", tip: "", tipType: "tip" },
      { id: "p5", number: "05", title: "HIGH PAIN — Ribs and Spine", content: "The ribs are consistently ranked among the most painful placements. Thin skin directly over bone, breathing movement during the session, and high nerve density combine to create intense sensation. The spine involves vertebrae proximity and a highly innervated area.", imageSrc: "", imageAlt: "Ribs spine tattoo high pain placement", tip: "Rib tattoos are not recommended as first tattoos. The session length required for a meaningful design exceeds what most first-timers can tolerate.", tipType: "warning" },
      { id: "p6", number: "06", title: "HIGH PAIN — Inner Elbow and Armpit", content: "The inner elbow ditch contains the median and ulnar nerve bundles that serve the entire forearm and hand. This creates a radiating sensation rather than localized pain — a different category from any other placement. The armpit has extremely dense nerve endings.", imageSrc: "", imageAlt: "Inner elbow ditch armpit tattoo extreme pain", tip: "Numbing cream applied 45 minutes before under plastic wrap occlusion reduces perceived pain by 40 to 60% on these placements.", tipType: "tip" },
      { id: "p7", number: "07", title: "HIGH PAIN — Hands, Feet, and Sternum", content: "Hands and feet have thin skin over bone and joints with extremely high nerve density. The sternum produces intense bone vibration that resonates through the chest. All three are experienced artists-only placements for extended sessions.", imageSrc: "", imageAlt: "Hands feet sternum tattoo high pain placements", tip: "Hand and foot tattoos also have the highest touch-up rate — the skin in these areas does not hold ink as well as other placements.", tipType: "warning" }
    ],
    faqItems: [
      { question: "What is the least painful tattoo placement?", answer: "The outer forearm and outer thigh consistently rate as least painful. Thick muscle, low nerve density, no bone proximity." },
      { question: "What is the most painful tattoo placement?", answer: "The inner elbow ditch, ribs, and spine are consistently most painful. Thin skin over bone or concentrated nerve bundles creates the most intense sensation." },
      { question: "Does tattoo style affect pain?", answer: "Yes. Fine line requires multiple passes in the same area. Solid blackwork covers large areas with fewer passes. Fine line on a painful placement compounds the difficulty significantly." },
      { question: "How do I prepare for a painful placement?", answer: "Eat a full meal within 2 hours. Stay hydrated. Apply numbing cream 45 minutes before under plastic wrap. Wear loose clothing for easy access." },
      { question: "Does pain get worse during a long session?", answer: "Yes. The skin becomes increasingly sensitized over time. Most artists recommend breaks every 90 minutes for placements rated medium or above." }
    ]
  },

  "TATTOO SESSION STEPS": {
    ...BLANK_STATE,
    postType: "VISUAL STEP GUIDE",
    title: "What To Expect At Your Tattoo Appointment — Step-by-Step",
    executiveSummary: "Walk into your first tattoo appointment with absolute confidence. Knowing exactly what is happening behind the counter and on the table reduces anxiety and ensures you know how to cooperate with your artist for the best result.",
    shortAnswer: "The process follows a specific biological sequence: stencil verification, architecture (line work), depth (shading), and stabilization (bandaging). Here is exactly what happens.",
    scienceHeading: "Why The Sequence Follows Critical Biological Logic",
    scienceContent: "Tattooing is iterative insertion. Lines act as a perimeter. Wider magnum needle groups follow to deposit ink saturation without crossing structural boundaries. Finally, immediate compression and isolation traps vital wound plasma, which speeds keratinocyte generation.",
    pullQuote: "A tattoo is a collaborative surgical procedure. Knowing the sequence empowers you to manage your stamina correctly across the session phases.",
    steps: [
      { id: "ts1", number: "01", title: "Stencil Placement and Verification", content: "Your artist applies the transfer carbon to your skin. Stand in your natural posture — do not flex or pose. Check symmetry in the mirror before approving.", imageSrc: "", imageAlt: "Tattoo stencil placement and review", tip: "If the stencil position feels off, ask to move it. Re-applying the stencil takes 30 seconds. Living with a crooked tattoo lasts forever.", tipType: "tip" },
      { id: "ts2", number: "02", title: "Building The Architecture (Outline)", content: "The artist uses smaller round needle groups to establish the permanent skeleton of the design. Sensation is generally a tighter, sharper stinging feel.", imageSrc: "", imageAlt: "Tattoo linework phase outline", tip: "Focus on consistent diaphragmatic breathing. Holding breath tightens muscles and compounds pain receptors.", tipType: "tip" },
      { id: "ts3", number: "03", title: "Saturation and Contrast (Shading)", content: "Wider flat needle groups traverse established areas to inject gradient depths. The feel transforms from a line into a broader burning scratch.", imageSrc: "", imageAlt: "Tattoo shading and color saturation phase", tip: "The skin becomes sensitized now. This is the common interval for requestable 5-minute breaks.", tipType: "tip" },
      { id: "ts4", number: "04", title: "Validation Wash and Final Reveal", content: "Witch hazel or pH-adjusted green soap is used to flush excess ink and surface plasma, confirming ink saturation levels.", imageSrc: "", imageAlt: "Cleaning excess ink at the end of tattoo", tip: "", tipType: "tip" },
      { id: "ts5", number: "05", title: "Dermal Lock (Protective Bandage)", content: "A sterile medical-grade dermal lock film (e.g., Saniderm) or breathable wrap is locked over the field to contain plasma weeping and block airborne bacteria.", imageSrc: "", imageAlt: "Applying protective dermal film after tattoo", tip: "Never pull a dry film bandage directly off. Dissolve the adhesive under warm running water to protect your epidermis.", tipType: "warning" }
    ]
  },

  // GROUP 2: RECOMMEND & SELL
  "BEST NUMBING CREAMS": {
    ...BLANK_STATE,
    postType: "RECOMMEND AND SELL",
    title: "Best Numbing Cream for Tattoos — Ranked 2026",
    executiveSummary: "Most people apply numbing cream 10 minutes before their session and get 20% of the effect. The 45-minute window is pharmacology not packaging advice. We ranked the top 4 by lidocaine concentration, skin compatibility, and honest failure modes.",
    scienceHeading: "Why Timing Matters More Than Brand",
    scienceContent: "Lidocaine works by diffusing through the epidermis and blocking voltage-gated sodium channels in the nerve fibers beneath — preventing pain signals from reaching the brain. This diffusion takes 45 minutes minimum. Applied 10 minutes before your session you get approximately 20% of the maximum effect. Most people blame the product. The real cause is timing.",
    pullQuote: "Lidocaine applied 10 minutes before a tattoo delivers 20% of its maximum effect. The 45-minute window is pharmacology — not packaging advice.",
    badge: "PRODUCT GUIDE",
    readTime: "6 MIN READ",
    products: [
      { rank: 1, name: "Zensa Numbing Cream", badge: "BEST OVERALL", imageSrc: "", imageAlt: "Zensa Numbing Cream tube", description: "5% lidocaine in a fragrance-free, vasoconstrictor-free base with vitamin E. Artists prefer it because the absence of epinephrine preserves natural bleeding rate — vasoconstriction causes a rebound bleed after the session that pushes ink out of the dermis.", honest_limitation: "Costs roughly 3x more than EMLA for identical lidocaine concentration. Only justified for sensitive skin or artists who require vasoconstrictor-free products.", price: "$35.00", buttonLabel: "VIEW ON ZENSA", affiliateUrl: "#affiliate" },
      { rank: 2, name: "EMLA Cream", badge: "BEST PHARMACY OPTION", imageSrc: "", imageAlt: "EMLA cream tube", description: "Eutectic mixture of lidocaine 2.5% and prilocaine 2.5% produces combined anesthetic depth equivalent to straight 5% lidocaine. Available same-day from most pharmacies without waiting for shipping.", honest_limitation: "Contains prilocaine — contraindicated for people with G6PD deficiency. Not suitable if you have this condition.", price: "$14.00", buttonLabel: "VIEW ON AMAZON", affiliateUrl: "#affiliate" },
      { rank: 3, name: "Hush Anesthetic Gel", badge: "BEST MID-SESSION", imageSrc: "", imageAlt: "Hush Gel jar", description: "Formulated specifically for application to already-worked skin during long sessions. Standard creams must not be applied to open wounds — the absorption rate through broken skin is unpredictable. Hush is calibrated for this specific use case.", honest_limitation: "Nearly ineffective as a pre-session treatment on intact skin. Do not purchase this as your primary numbing product.", price: "$26.00", buttonLabel: "VIEW ON AMAZON", affiliateUrl: "#affiliate" },
      { rank: 4, name: "Uber Numb 5% Lidocaine", badge: "BEST BUDGET", imageSrc: "", imageAlt: "Uber Numb cream tube", description: "Delivers the maximum OTC lidocaine concentration (5%) at a significantly lower price. The pharmacological mechanism is identical to Zensa — sodium channel blockade at the same active concentration.", honest_limitation: "Contains fragrant alcohols that trigger mast cell degranulation in healing tissue causing histamine release and ink migration. Do not use on sensitive skin.", price: "$14.00", buttonLabel: "VIEW ON AMAZON", affiliateUrl: "#affiliate" }
    ],
    protocolSteps: [
      { number: "01", title: "Clean the skin 60 minutes before", content: "Wash the area with fragrance-free soap and pat dry. Remove any lotion or oil — residue creates a barrier that reduces lidocaine absorption significantly." },
      { number: "02", title: "Apply a thick layer and cover", content: "Apply a generous layer and cover immediately with plastic wrap. The occlusion creates a moist environment that accelerates diffusion. Do not rub it in." },
      { number: "03", title: "Wait the full 45 minutes", content: "Set a timer. Do not remove the wrap early. At 10 minutes you have 20% of the effect. At 45 minutes you have the maximum." },
      { number: "04", title: "Remove and wipe before the session", content: "Remove the wrap and gently wipe away the cream with a clean cloth immediately before the artist begins." },
      { number: "05", title: "Mid-session reapplication for long pieces", content: "For sessions over 2 hours ask your artist about mid-session Hush Gel application to already-worked skin. Never apply standard cream to open wounds." }
    ],
    avoidItems: [
      { item: "TKTX or unregulated imports", reason: "Batch quality varies significantly. Some batches contain undisclosed compounds above safe concentrations. No clinical validation." },
      { item: "Numbing cream on the face without medical guidance", reason: "Facial skin has higher vascularity and absorption rates. Systemic lidocaine toxicity risk is meaningfully higher." },
      { item: "Expired products", reason: "Lidocaine degrades over time. An expired cream delivers unpredictable concentration." },
      { item: "Applying over freshly moisturized skin", reason: "Lotion and oil create a lipid barrier that reduces absorption significantly. Always clean the skin first." }
    ],
    faqItems: [
      { question: "Does numbing cream actually work for tattoos?", answer: "Yes, reliably — but only with the correct 45-minute application window covered with plastic wrap. Applied correctly the burning sting disappears for most people. The pressure and vibration remains." },
      { question: "What is the best painless tattoo numbing cream?", answer: "No cream produces a completely painless tattoo. That is a marketing claim. What 5% lidocaine products deliver is substantially less burning pain when applied with the 45-minute protocol." },
      { question: "How does numbing cream for tattoos work?", answer: "Lidocaine diffuses through the intact epidermis and temporarily blocks voltage-gated sodium channels in sensory nerve fibers. No sodium channel activity means nerve cells cannot transmit pain signals to the brain." },
      { question: "Is tattoo numbing spray as effective as cream?", answer: "Sprays use the same active compounds but deliver less consistent dermal saturation than cream under plastic wrap occlusion. Cream outperforms spray as a pre-session treatment." },
      { question: "Is Zensa worth the extra cost compared to EMLA?", answer: "Only for sensitive skin or if your artist requires vasoconstrictor-free products. For non-sensitive skin EMLA delivers clinically identical numbing at roughly one third the price." }
    ],
    relatedPosts: [
      { title: "Best Tattoo Aftercare Cream — Ranked 2026", href: "/blog/best-tattoo-aftercare-cream" },
      { title: "Does Tattoo Removal Hurt — Pain Guide", href: "/blog/does-tattoo-removal-hurt" },
      { title: "Tattoo Healing Process — Day by Day", href: "/blog/tattoo-healing-process" }
    ],
    tocItems: []
  },

  "BEST AFTERCARE LOTIONS": {
    ...BLANK_STATE,
    postType: "RECOMMEND AND SELL",
    title: "Best Tattoo Aftercare Cream — What Dermatologists Recommend 2026",
    executiveSummary: "Choosing the wrong aftercare cream does not just make your tattoo itch — it can blur the ink permanently. Fragrant alcohols trigger mast cell degranulation causing histamine release and lateral ink migration. We analyzed 42 formulations to find the ones that respect your skin's acid mantle.",
    scienceHeading: "Why Fragrance-Free Is Non-Negotiable",
    scienceContent: "Fragrant alcohols — linalool, limonene, geraniol — trigger mast cell degranulation in healing tissue. Mast cells release histamine. Histamine causes localized inflammation. Inflammation in a healing tattoo causes lateral ink migration — the biological mechanism behind blurred lines over time. This applies to products labeled natural or organic. The harm comes from specific compounds not synthetic versus natural origin.",
    pullQuote: "60% of reported tattoo blowouts were caused by fragrance reactions in aftercare products — not artist error.",
    badge: "PRODUCT GUIDE",
    readTime: "7 MIN READ",
    products: [
      { rank: 1, name: "Hustle Butter Deluxe", badge: "BEST OVERALL", imageSrc: "", imageAlt: "Hustle Butter Deluxe jar", description: "Shea butter, mango butter, coconut oil, rice bran. Zero petroleum derivatives means zero occlusive barrier in the inflammatory phase. Artists prefer it because the clean base does not interfere with ink settling.", honest_limitation: "Costs roughly 3x more than Lubriderm for normal skin on standard placements. The premium is only justified for very dry skin or high-friction placements like ribs.", price: "$24.99", buttonLabel: "VIEW ON AMAZON", affiliateUrl: "#affiliate" },
      { rank: 2, name: "Lubriderm Daily Moisture Fragrance-Free", badge: "BEST BUDGET", imageSrc: "", imageAlt: "Lubriderm bottle", description: "Water-based formula at pH 5.5 matches healing skin's natural acid mantle precisely. The ceramide content rebuilds the lipid barrier that tattooing disrupts. At $0.56 per ounce this is the most cost-effective genuinely effective product in this category.", honest_limitation: "Provides less protection for very dry skin or high-friction placements like hands, elbows, or knees where a more occlusive formula performs better.", price: "$8.99", buttonLabel: "VIEW ON AMAZON", affiliateUrl: "#affiliate" },
      { rank: 3, name: "Bepanthen Tattoo Aftercare", badge: "BEST FOR DRY SKIN", imageSrc: "", imageAlt: "Bepanthen tube", description: "Dexpanthenol (provitamin B5) converts to pantothenic acid in skin tissue. Pantothenic acid is directly involved in keratinocyte synthesis — the process of rebuilding the skin surface. Faster keratinocyte activity means faster surface closure with less scabbing.", honest_limitation: "The 50g tube is insufficient for large pieces or sleeve work. Buy two tubes at the start if your tattoo covers more than a hand-sized area.", price: "$14.90", buttonLabel: "VIEW ON AMAZON", affiliateUrl: "#affiliate" },
      { rank: 4, name: "Aquaphor Healing Ointment", badge: "DAYS 1-3 ONLY", imageSrc: "", imageAlt: "Aquaphor tube", description: "Semi-occlusive petrolatum base allows gas exchange while preventing moisture loss. This is correct for Days 1-3 when the skin is genuinely an open wound. Switch to a lighter formula after Day 3.", honest_limitation: "Do not use beyond Day 3. Aquaphor long-term traps heat in healing tissue and increases bacterial risk. It is a wound dressing not a moisturizer.", price: "$12.99", buttonLabel: "VIEW ON AMAZON", affiliateUrl: "#affiliate" }
    ],
    protocolSteps: [
      { number: "01", title: "Days 1 to 3 — Aquaphor phase", content: "Apply Aquaphor in a very thin layer 3 times daily after gently washing with fragrance-free antibacterial soap. Pat dry with a clean paper towel. Skin should look slightly shiny not wet or greasy." },
      { number: "02", title: "Day 4 — Switch to your ranked product", content: "Stop using Aquaphor. Switch to Hustle Butter or Lubriderm. Apply twice daily morning and before sleep. The tattoo will begin peeling — this is normal keratinocyte rebuilding. Do not pick." },
      { number: "03", title: "Week 2 — Peeling phase", content: "Continue twice-daily moisturizer. Itching is the keratinocytes rebuilding — tap gently with a clean fingertip. Apply a thin layer of moisturizer and the itch subsides within minutes." },
      { number: "04", title: "Week 3 onward — Maintenance phase", content: "Reduce to once daily application. Add mineral SPF (zinc oxide only) after Day 21 whenever the tattoo will be exposed to sun." },
      { number: "05", title: "Month 2 to 4 — Full healing", content: "The epidermis closes in 2-3 weeks. The dermis takes 3-4 months. The tattoo looks dull or milky during this period — this is normal. Final color clarity appears between months 2 and 4." }
    ],
    avoidItems: [
      { item: "Fragranced products of any kind", reason: "Fragrant alcohols including linalool and limonene trigger mast cell degranulation causing histamine release and ink migration. Applies to natural and organic products too." },
      { item: "Neosporin or antibiotic ointments", reason: "Neomycin causes contact dermatitis in approximately 1 in 10 people. Tattooed skin is already sensitized. The risk is not worth it." },
      { item: "Pure coconut oil long-term", reason: "Comedogenic rating of 4 out of 5. Clogs follicles and creates an anaerobic environment that increases bacterial risk during the first healing week." },
      { item: "Chemical sunscreen before Day 30", reason: "Chemical UV filters penetrate sensitized skin and cause irritation during healing. Use mineral SPF with zinc oxide only after Day 21." },
      { item: "Aquaphor beyond Day 3", reason: "Aquaphor is a wound dressing not a moisturizer. Long-term use traps heat in healing tissue and increases bacterial risk." }
    ],
    faqItems: [
      { question: "Can I use regular hand lotion?", answer: "Yes if it is genuinely fragrance-free and alcohol-free. Lubriderm Daily Moisture Unscented meets the clinical standard. Check the full ingredient list — not just the front label claim." },
      { question: "What if I run out of moisturizer at night?", answer: "Cold-pressed coconut oil works as a single-application emergency substitute. Do not rely on it for more than 48 hours." },
      { question: "Is the tattoo supposed to itch?", answer: "Yes. Itching during Week 2 is the keratinocytes rebuilding the skin surface — a sign of normal healing. Tap gently, do not scratch." },
      { question: "When is the tattoo fully healed?", answer: "The epidermis closes in 2 to 3 weeks. The full skin stack takes 3 to 4 months. Final color clarity becomes visible between months 2 and 4." },
      { question: "How much moisturizer should I apply?", answer: "A very thin layer — the skin should look slightly shiny not wet or greasy. Press gently into the skin. Do not rub." }
    ],
    relatedPosts: [
      { title: "Best Soap for Tattoo Aftercare", href: "/blog/best-soap-tattoo-aftercare" },
      { title: "Tattoo Healing Process — Day by Day", href: "/blog/tattoo-healing-process" },
      { title: "Tattoo Aftercare Instructions", href: "/blog/tattoo-aftercare-instructions" }
    ],
    tocItems: []
  },

  "BEST TATTOO SOAPS": {
    ...BLANK_STATE,
    postType: "RECOMMEND AND SELL",
    title: "Best Soap for Tattoo Aftercare — Fragrance-Free Options Ranked 2026",
    executiveSummary: "Most tattoo soaps are just regular soaps with tattoo branding. The only things that matter are fragrance-free, alcohol-free, and pH-matched to healing skin. We ranked the options by these three criteria — nothing else.",
    scienceHeading: "What Your Soap Actually Does To Healing Skin",
    scienceContent: "When a tattoo needle deposits ink into the dermis the epidermis above it is damaged. For the first 14 days the skin rebuilds this surface layer through keratinocyte migration. Soap applied during this period must not disrupt this process. Fragrant compounds trigger histamine release. Alcohol dries the wound bed. High pH disrupts the acid mantle that protects healing tissue. A good tattoo soap does one thing — clean without interfering.",
    pullQuote: "There is no such thing as a tattoo soap. There is only fragrance-free, alcohol-free soap at the right pH. The tattoo branding is marketing.",
    badge: "PRODUCT GUIDE",
    readTime: "5 MIN READ",
    products: [
      { rank: 1, name: "Dove Sensitive Skin Unscented Bar", badge: "BEST OVERALL", imageSrc: "", imageAlt: "Dove Sensitive Skin bar", description: "Fragrance-free, alcohol-free, pH 6.5. One of the most clinically validated gentle cleansers available. Dermatologist recommended for sensitive and post-procedure skin for decades.", honest_limitation: "Bar soap can harbor bacteria if left wet in a dish. Use a soap dish with drainage or switch to the liquid version for hygiene.", price: "$5.00", buttonLabel: "VIEW ON AMAZON", affiliateUrl: "#affiliate" },
      { rank: 2, name: "Dr Bronner's Baby Unscented Castile", badge: "BEST LIQUID OPTION", imageSrc: "", imageAlt: "Dr Bronner's bottle", description: "Liquid castile soap with no synthetic fragrance compounds. Dilute 1 part soap to 3 parts water before applying to healing tattoos — undiluted castile is too alkaline for fresh skin.", honest_limitation: "Must be diluted before use on healing skin. Undiluted pH is around 9 which is too alkaline for the acid mantle of healing tissue.", price: "$10.00", buttonLabel: "VIEW ON AMAZON", affiliateUrl: "#affiliate" },
      { rank: 3, name: "Cetaphil Gentle Skin Cleanser", badge: "BEST FOR SENSITIVE SKIN", imageSrc: "", imageAlt: "Cetaphil bottle", description: "Dermatologist-developed formula for highly sensitive and compromised skin. Non-comedogenic, fragrance-free, and tested for skin tolerance. Used clinically in post-procedure care.", honest_limitation: "More expensive than Dove for equivalent clinical performance on most skin types. The premium is justified only for clinically sensitive or reactive skin.", price: "$12.00", buttonLabel: "VIEW ON AMAZON", affiliateUrl: "#affiliate" }
    ],
    protocolSteps: [
      { number: "01", title: "Wash twice daily — morning and night", content: "Use lukewarm water. Hot water increases inflammation in healing tissue. Cold water does not clean effectively." },
      { number: "02", title: "Lather gently with clean hands", content: "Never use a washcloth, loofah, or sponge on a healing tattoo. Friction disrupts the forming epidermal layer." },
      { number: "03", title: "Rinse completely", content: "Soap residue left on healing skin disrupts the pH balance of the acid mantle. Rinse until the skin feels clean with no slippery film." },
      { number: "04", title: "Pat dry with a fresh paper towel", content: "Never use a cloth towel on a fresh tattoo. Cloth towels harbor bacteria and the texture causes friction. Single-use paper towels only." },
      { number: "05", title: "Apply moisturizer immediately after drying", content: "Do not let the skin dry out completely after washing. Apply your chosen moisturizer within 60 seconds of patting dry." }
    ],
    avoidItems: [
      { item: "Any soap with fragrance or perfume", reason: "Fragrant alcohols trigger histamine release in healing tissue causing inflammation and ink migration." },
      { item: "Antibacterial soaps with triclosan", reason: "Triclosan disrupts the skin microbiome. Healing tattoos need a healthy bacterial environment — not a sterile one." },
      { item: "Exfoliating or scrub soaps", reason: "Physical exfoliants remove the forming epidermal layer that is being rebuilt by keratinocyte migration." },
      { item: "Dish soap or hand sanitizer", reason: "Both are far too alkaline and drying for healing skin. The pH mismatch damages the acid mantle." }
    ],
    faqItems: [
      { question: "What is the best antibacterial soap for tattoo aftercare?", answer: "Plain fragrance-free soap like Dove Sensitive Skin is sufficient. Your immune system handles bacterial defense. You need a gentle cleanser not an antibacterial agent." },
      { question: "Can I use Dial soap on a new tattoo?", answer: "Dial Original has fragrance. Dial Basics is fragrance-free and acceptable. Always check the specific variant — the Dial range includes both fragrance and fragrance-free options." },
      { question: "How long should I wash my tattoo?", answer: "20 to 30 seconds of gentle lathering twice daily. Long enough to remove plasma, excess ink, and environmental debris — not so long that you strip the skin barrier." },
      { question: "Can I shower normally with a new tattoo?", answer: "Yes — but keep the tattoo out of direct water pressure and limit shower time to under 10 minutes for the first two weeks. Prolonged water exposure softens the forming epidermal layer." },
      { question: "When can I stop washing the tattoo specially?", answer: "After 4 weeks you can wash normally. Until then — fragrance-free soap, twice daily, gentle lather, pat dry with paper towel." }
    ],
    relatedPosts: [
      { title: "Best Tattoo Aftercare Cream — Ranked 2026", href: "/blog/best-tattoo-aftercare-cream" },
      { title: "Tattoo Aftercare Instructions", href: "/blog/tattoo-aftercare-instructions" },
      { title: "Tattoo Healing Process — Day by Day", href: "/blog/tattoo-healing-process" }
    ],
    tocItems: []
  },

  "HONEST REMOVAL COST GUIDE": {
    ...BLANK_STATE,
    postType: "RECOMMEND AND SELL",
    title: "How Much Does Laser Tattoo Removal Cost in 2026 — The Honest Guide",
    executiveSummary: "Laser tattoo removal costs between $200 and $500 per session in the US and UK. Most tattoos require 6 to 12 sessions. This guide gives you the real numbers, the real timeline, and the real factors that determine your specific cost — with no vague price ranges.",
    shortAnswer: "A standard black ink tattoo the size of a palm costs $1,200 to $3,500 total for complete removal in the US. In the UK expect £800 to £2,500. Per session prices range from $150 to $500 depending on size, location, and technology used.",
    scienceHeading: "Why Laser Removal Costs What It Does",
    scienceContent: "Removal cost is driven by capital equipment depreciation and session time. An FDA-cleared PicoSure laser costs over $100,000. This cost must be distributed across treatments, resulting in the base session rate regardless of tattoo size. Larger tattoos increase optical time, further scaling the cost.",
    badge: "COST AND PRICING",
    readTime: "12 MIN READ",
    products: [],
    infoSections: [
      {
        id: "what-affects-cost",
        heading: "What Affects Your Cost",
        content: "### Size and Complexity\nThe square inch area dictates the per-session cost. Layered complexity requires more passes.\n\n### Ink Color\nBlack responds best. Blues and greens require specialized 755nm wavelengths and extra sessions.\n\n### Technology Used\nPicoSure clears ink faster but costs more per session than traditional Q-Switched nanosecond lasers."
      },
      {
        id: "healing-window",
        heading: "The 8-Week Healing Window",
        content: "Your body's lymphatic system does the actual removal. The laser simply breaks the ink into manageable particles. Rushing sessions before the macrophages clear the debris risks permanent hypopigmentation and waste of financial resources."
      },
      {
        id: "session-by-session",
        heading: "What To Expect: Session by Session",
        content: "### Session 1\nFrosting occurs instantly as water vaporizes in the skin, turning the tattoo white. This subsides within 20 minutes.\n\n### Sessions 2-4\nThe tattoo will look patchy as superficial ink sheds and the immune system begins to clear heavier deposits."
      },
      {
        id: "cover-up",
        heading: "Cover-Up While You Wait",
        content: "Removal takes 12-24 months. During that time your tattoo looks faded and patchy. These are the products people actually use for weddings, job interviews, and beach days.\n\n**Dermablend Body Makeup** — $38.00\nSpecifically formulated with high pigment load to conceal hyperpigmentation without transferring to clothes.\n\n**KVD Good Apple Foundation** — $42.50\nUltra-high coverage balm that masks even fresh tattoo pigment.\n\n**Waterproof Setting Spray** — $24.00\nSeals the body makeup against sweat, humidity, and friction."
      }
    ],
    faqItems: [
      { question: "Does laser tattoo removal leave scars?", answer: "No, when performed correctly by a qualified technician. Scarring occurs from: too-short intervals between sessions, incorrect laser settings for skin tone, or at-home devices." },
      { question: "Can tattoos be completely removed?", answer: "Black ink: yes, in 95% of cases. Colored ink (especially green and blue): 80-90% clearance is the realistic expectation." },
      { question: "What about at-home tattoo removal creams?", answer: "Honest answer: they do not work. Most contain trichloroacetic acid which burns the top skin layer but leaves the ink particles in the dermis untouched." },
      { question: "How many sessions do I actually need?", answer: "Industry advertising says 3-6 sessions. Clinical reality is 6-12 for most tattoos." },
      { question: "Is there a way to speed up the process?", answer: "Yes: maintain excellent skin health, avoid UV exposure on the treated area, stay well hydrated, and do not smoke." }
    ],
    toolMarkers: [
      { toolId: "COST_CALCULATOR", anchor: "top" },
      { toolId: "PAIN_SIMULATOR", anchor: "info-what-affects-cost" }
    ]
  },

  // GROUP 3: INFORM AND REFER
  "REMOVAL COST ANALYSIS": {
    ...BLANK_STATE,
    postType: "INFORM AND REFER",
    title: "Tattoo Removal Cost — The Honest 2026 Price Breakdown",
    executiveSummary: "Most clinics advertise 3 to 6 sessions. The clinical reality for average black ink tattoos is 6 to 12 sessions. The difference is that advertising shows ideal cases. This guide gives you the real numbers by size, ink color, and skin tone — no vague ranges.",
    scienceHeading: "Why Removal Takes Longer Than Clinics Advertise",
    scienceContent: "When a laser pulse hits ink it shatters the pigment particles. The lymphatic system then carries those fragments away over the following 6 to 8 weeks. This is why sessions cannot be spaced closer together — macrophages need time to migrate the shattered pigment to lymph nodes before the next session targets remaining ink. Rushing this window does not accelerate removal. It increases scarring risk and reduces clearance efficiency.",
    pullQuote: "Most removal clinics advertise 3 to 6 sessions. The clinical reality for average black ink tattoos is 6 to 12. The difference is that advertising shows ideal cases — not typical ones.",
    badge: "REMOVAL GUIDE",
    readTime: "9 MIN READ",
    products: [],
    protocolSteps: [
      { number: "01", title: "Get a patch test before committing", content: "A reputable clinic always offers a patch test before a full session. This confirms your skin responds predictably to the laser and lets the technician calibrate the settings for your Fitzpatrick level." },
      { number: "02", title: "Space sessions 6 to 8 weeks apart", content: "The lymphatic system needs this window to clear fragmented ink particles. Shorter intervals reduce clearance efficiency and increase the risk of hypopigmentation and scarring." },
      { number: "03", title: "Protect the area from sun between sessions", content: "UV exposure on treated skin causes hyperpigmentation and increases the risk of permanent skin tone changes. Mineral SPF 50 on any sun-exposed treated area." },
      { number: "04", title: "Apply Aquaphor for the first 3 days after each session", content: "Post-session skin is an open wound. Aquaphor semi-occlusive barrier prevents infection and moisture loss during the initial healing window." },
      { number: "05", title: "Avoid picking blisters", content: "Blistering after a laser session is normal and indicates the treatment is working. Picking blisters introduces infection risk and causes scarring." }
    ],
    avoidItems: [
      { item: "Clinics that guarantee removal in a specific number of sessions", reason: "No ethical clinic does this. Session count depends on ink depth, color, skin tone, and immune response — all variables outside the clinic's control." },
      { item: "Clinics that will not name their laser technology", reason: "A reputable clinic names the specific FDA-cleared device they use. If they cannot answer this question find a different clinic." },
      { item: "Multi-session packages at the first consultation", reason: "Pressure to commit to a package before a patch test is a red flag. Reputable clinics let you pay per session." },
      { item: "At-home removal creams", reason: "Tattoo ink sits in the dermis — 1 to 2mm below the skin surface. Topical creams cannot reach this depth without destroying the epidermis first. Most contain acids that burn the surface skin while leaving the ink completely untouched." }
    ],
    faqItems: [
      { question: "How much does tattoo removal cost?", answer: "Between $200 and $500 per session for standard tattoos in the US. Most tattoos require 6 to 12 sessions. A realistic total budget for an average palm-sized black ink tattoo is $1,500 to $4,000." },
      { question: "How many sessions does tattoo removal take?", answer: "6 to 12 sessions for most black ink tattoos on fair to medium skin. Green, blue, and turquoise ink requires a specific 755nm wavelength and adds 2 to 4 sessions. Fitzpatrick V and VI skin tones require more conservative settings which extends the course." },
      { question: "Does tattoo removal hurt?", answer: "Most people describe it as a rubber band snapping repeatedly against the skin. The sensation is sharper than getting the tattoo because the laser energy is more concentrated. Numbing cream applied 45 minutes before reduces the discomfort significantly." },
      { question: "Does tattoo removal leave scars?", answer: "Not when performed correctly by a trained technician using appropriate laser settings for your skin tone. Scarring typically results from incorrect settings, insufficient spacing between sessions, or post-treatment infection from picking blisters." },
      { question: "Is there a cheaper alternative to laser removal?", answer: "Laser removal is the only method with documented clinical evidence for effective tattoo removal. At-home creams, dermabrasion, and saline removal either do not work or cause significant skin damage. Payment plans from reputable clinics make laser more accessible than the per-session price suggests." }
    ],
    relatedPosts: [
      { title: "Does Tattoo Removal Hurt — Pain Guide", href: "/blog/does-tattoo-removal-hurt" },
      { title: "How Many Sessions Does Tattoo Removal Take", href: "/blog/tattoo-removal-sessions" },
      { title: "Tattoo Removal Near Me — How To Find The Best Clinic", href: "/blog/tattoo-removal-near-me" }
    ],
    tocItems: []
  },

  "GENERAL HEALING PROTOCOL": {
    ...BLANK_STATE,
    postType: "INFORM AND REFER",
    title: "Tattoo Healing Process — Day by Day What To Expect 2026",
    executiveSummary: "The peeling you see in Week 2 is not your tattoo falling off. The itching is not an infection. The dull cloudy appearance in Week 3 is not permanent color loss. This guide explains the biology of every healing stage so you stop panicking and start healing correctly.",
    scienceHeading: "The Biology of Tattoo Healing",
    scienceContent: "When a tattoo needle deposits ink into the dermis the epidermis above it is damaged. For the first 14 days the skin rebuilds this surface layer through keratinocyte migration — the cells that form the outer skin layer travel horizontally to close the wound. The dermis takes 3 to 4 months to fully stabilize. During this period the tattoo looks milky or dull because new epidermal cells are semi-opaque until they mature. The final color and clarity of your tattoo becomes visible between months 2 and 4.",
    pullQuote: "The dull cloudy appearance of a healing tattoo in weeks 3 and 4 is not color loss. It is semi-opaque new epidermal cells. The color returns between months 2 and 4.",
    badge: "HEALING GUIDE",
    readTime: "8 MIN READ",
    products: [],
    protocolSteps: [
      { number: "01", title: "Day 1 — Wrap removal and first wash", content: "Remove the wrap your artist applied after 3 to 5 hours. Wash with lukewarm water and fragrance-free antibacterial soap. Pat completely dry with a fresh paper towel. Apply a very thin layer of Aquaphor." },
      { number: "02", title: "Days 2 to 3 — Open wound phase", content: "The tattoo weeps plasma and excess ink. This is normal. Continue washing twice daily and applying Aquaphor thinly. Do not pick or scratch. Keep clean and dry between applications." },
      { number: "03", title: "Day 4 — Switch to lightweight moisturizer", content: "Stop Aquaphor. Switch to Lubriderm or Hustle Butter. Apply twice daily. The skin begins to tighten and feel dry — this is the epidermis beginning to close." },
      { number: "04", title: "Week 2 — Peeling phase", content: "The tattoo peels like a sunburn. This is completely normal — dead epidermal cells shedding as new ones form beneath. Do not peel manually. Tap gently if itching is intense. Continue twice-daily moisturizer." },
      { number: "05", title: "Weeks 3 to 4 — Cloudy phase", content: "The surface looks healed but the tattoo appears dull or milky. This is new epidermal cells maturing. The color is still there beneath them. Continue once-daily moisturizer. Add mineral SPF after Day 21." },
      { number: "06", title: "Months 2 to 4 — Full color reveal", content: "The new epidermal cells mature and become transparent. The full color and line clarity of your tattoo becomes visible. Continue SPF on any sun-exposed placement permanently." }
    ],
    avoidItems: [
      { item: "Swimming or submerging for 4 weeks", reason: "Pool chlorine and natural water bacteria penetrate the compromised epidermis and cause infection. Showers are fine — submersion is not." },
      { item: "Direct sun exposure for 30 days", reason: "UV on healing skin causes permanent color fade and increases scarring risk. After 30 days mineral SPF is mandatory for outdoor activity." },
      { item: "Picking or peeling", reason: "Manually removing peeling skin disrupts keratinocyte migration and can pull ink from the dermis causing permanent patchiness." },
      { item: "Tight clothing over the tattoo", reason: "Friction from clothing removes the protective plasma layer and disrupts the forming epidermis. Loose breathable fabric only." }
    ],
    faqItems: [
      { question: "How long does it take for a tattoo to heal?", answer: "The epidermis closes in 2 to 3 weeks. The full skin stack including the dermis takes 3 to 4 months. The tattoo looks fully healed on the surface at Week 3 but the deeper layers are still stabilizing." },
      { question: "Is peeling normal for a healing tattoo?", answer: "Yes completely normal. Peeling in Week 2 is dead epidermal cells shedding as new ones form beneath. The ink is in the dermis below — it does not peel away." },
      { question: "Why does my tattoo look dull and cloudy?", answer: "New epidermal cells are semi-opaque when they first form. As they mature between months 2 and 4 they become transparent and the full color clarity returns." },
      { question: "How long after a tattoo can you swim?", answer: "4 weeks minimum for chlorinated pools and natural bodies of water. Showers are safe throughout healing. The risk is waterborne bacteria penetrating the compromised epidermal barrier." },
      { question: "What does an infected tattoo look like?", answer: "Spreading redness beyond the tattoo boundary, increasing heat, swelling that grows after Day 3, green or yellow discharge, and fever are infection signs. Normal healing involves some redness and swelling that peaks at Day 2 and reduces steadily after." }
    ],
    relatedPosts: [
      { title: "Best Tattoo Aftercare Cream — Ranked 2026", href: "/blog/best-tattoo-aftercare-cream" },
      { title: "Tattoo Aftercare Instructions", href: "/blog/tattoo-aftercare-instructions" },
      { title: "Best Soap for Tattoo Aftercare", href: "/blog/best-soap-tattoo-aftercare" }
    ],
    tocItems: []
  },

  "BLANK REFERENCE ARTICLE": { 
    ...BLANK_STATE,
    postType: "INFORM AND REFER" 
  }
};

function PublishPostContent() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get("edit");

    const [isEditMode, setIsEditMode] = useState(false);
    const [loadedPostId, setLoadedPostId] = useState<string | null>(null);
    const [loadedPostSlug, setLoadedPostSlug] = useState<string | null>(null);
    const [isLoadingPost, setIsLoadingPost] = useState(false);

    const [postType, setPostType] = useState<"RECOMMEND AND SELL" | "INFORM AND REFER" | "VISUAL STEP GUIDE" | null>(null);
    const [editorState, setEditorState] = useState<any>(BLANK_STATE);
    const [seoState, setSeoState] = useState({ focusKeyword: "", schemaType: "Article", metaTitle: "", metaDescription: "" });
    const [isSeoExpanded, setIsSeoExpanded] = useState(false);
    const [isTemplateExpanded, setIsTemplateExpanded] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState<{message: string, isError: boolean} | null>(null);
    const [templateKey, setTemplateKey] = useState(Date.now());
    const [confirmTemplate, setConfirmTemplate] = useState<string | null>(null);
    const [publishState, setPublishState] = useState<"idle" | "success">("idle");
    const [publishedSlug, setPublishedSlug] = useState("");
    
    // Auto-fill disconnect flags
    const [metaTitleManuallyEdited, setMetaTitleManuallyEdited] = useState(false);
    const [metaDescManuallyEdited, setMetaDescManuallyEdited] = useState(false);
    const [syncProducts, setSyncProducts] = useState(true);

    // 1. Load post for editing if editId present in URL
    useEffect(() => {
        if (editId) {
            setIsEditMode(true);
            setIsLoadingPost(true);
            getLabPostAction(editId).then((res) => {
                if (res.success && res.post) {
                    const p = res.post;
                    setLoadedPostId(p.id);
                    setLoadedPostSlug(p.slug);
                    setPostType(p.post_intent);
                    setEditorState({
                        title: p.title || "",
                        executiveSummary: p.excerpt || "",
                        scienceHeading: p.science_heading || "Why This Matters — The Science",
                        scienceContent: p.science_content || "",
                        pullQuote: p.pull_quote || "",
                        steps: p.visual_steps || [],
                        products: p.related_products || [],
                        protocolSteps: p.protocol_steps || [],
                        avoidItems: p.avoid_items || [],
                        faqItems: p.faq_items || [],
                        heroImageSrc: p.cover_image_url || "",
                        heroImageAlt: p.cover_image_alt || "",
                        badge: p.post_intent === "RECOMMEND AND SELL" ? "PRODUCT GUIDE" : "HEALING GUIDE",
                        category: p.category || "",
                        selectedTool: p.selected_tool || "NONE",
                        toolPosition: p.tool_position || "",
                        toolMarkers: p.tool_markers || []
                    });
                    setSeoState({
                        focusKeyword: p.focus_keyword || "",
                        schemaType: p.schema_type || "Article",
                        metaTitle: p.meta_title || "",
                        metaDescription: p.meta_description || ""
                    });
                    setMetaTitleManuallyEdited(p.meta_title !== p.title);
                    setMetaDescManuallyEdited(p.meta_description !== p.excerpt);
                    setTemplateKey(Date.now());
                } else {
                    setToast({ message: "Failed to fetch post from database.", isError: true });
                }
                setIsLoadingPost(false);
            });
        }
    }, [editId]);

    const [draftFound, setDraftFound] = useState<any>(null);
    const [showDraftBanner, setShowDraftBanner] = useState(false);
    const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
    const [lastSavedState, setLastSavedState] = useState<any>(BLANK_STATE);
    const lastSavedStateRef = useRef<any>(BLANK_STATE);
    const editorStateRef = useRef<any>(editorState);
    editorStateRef.current = editorState;
    const [tick, setTick] = useState(0);
    const [hasBeenAdmin, setHasBeenAdmin] = useState(false);

    useEffect(() => {
        if (user && isAdmin(user.email)) {
            setHasBeenAdmin(true);
        }
    }, [user]);

    // Force real-time updates for "last saved [time ago]" indicator
    useEffect(() => {
        const timer = setInterval(() => setTick((t) => t + 1), 10000);
        return () => clearInterval(timer);
    }, []);

    // Check for existing draft on load
    useEffect(() => {
        if (user && user.id) {
            getDraftAction(user.id).then((res) => {
                if (res.success && res.data) {
                    setDraftFound(res.data);
                    setShowDraftBanner(true);
                }
            });
        }
    }, [user]);

    const saveDraft = async (stateToSave: any) => {
        if (!user || !user.id) return;
        // Don't save completely blank states
        if (!stateToSave.title?.trim() && !stateToSave.executiveSummary?.trim() && (!stateToSave.products || stateToSave.products.length === 0)) {
            return;
        }
        
        const res = await saveDraftAction(user.id, {
            editorState: stateToSave,
            seoState,
            postType,
            metaTitleManuallyEdited,
            metaDescManuallyEdited
        });
        
        if (res.success) {
            const now = new Date();
            setLastSavedTime(now);
            lastSavedStateRef.current = stateToSave;
            setLastSavedState(stateToSave);
        }
    };

    // Save on significant field change (title/executiveSummary blur, products length change)
    useEffect(() => {
        if (!user || !user.id) return;
        
        const prev = lastSavedStateRef.current;
        const current = editorState;
        
        const titleChanged = current.title !== prev.title;
        const summaryChanged = current.executiveSummary !== prev.executiveSummary;
        const productsLengthChanged = (current.products?.length ?? 0) !== (prev.products?.length ?? 0);
        
        if (titleChanged || summaryChanged || productsLengthChanged) {
            saveDraft(current);
        }
    }, [editorState, user]);

    // Save every 60 seconds if any content exists and has changed
    useEffect(() => {
        if (!user || !user.id) return;
        
        const interval = setInterval(() => {
            const current = editorState;
            const hasContent = current.title?.trim() || current.executiveSummary?.trim() || (current.products?.length ?? 0) > 0;
            
            const prev = lastSavedStateRef.current;
            const hasChanges = JSON.stringify(current) !== JSON.stringify(prev);
            
            if (hasContent && hasChanges) {
                saveDraft(current);
            }
        }, 60000);
        
        return () => clearInterval(interval);
    }, [editorState, seoState, postType, metaTitleManuallyEdited, metaDescManuallyEdited, user]);

    const handleRestoreDraft = () => {
        if (draftFound && draftFound.draft_data) {
            const { editorState: savedEditor, seoState: savedSeo, postType: savedType, metaTitleManuallyEdited: mTitle, metaDescManuallyEdited: mDesc } = draftFound.draft_data;
            if (savedEditor) setEditorState(savedEditor);
            if (savedSeo) setSeoState(savedSeo);
            if (savedType) setPostType(savedType);
            setMetaTitleManuallyEdited(!!mTitle);
            setMetaDescManuallyEdited(!!mDesc);
            setTemplateKey(Date.now());
            
            const savedAt = new Date(draftFound.updated_at);
            setLastSavedTime(savedAt);
            lastSavedStateRef.current = savedEditor;
            setLastSavedState(savedEditor);
            
            setShowDraftBanner(false);
            setToast({ message: "Draft restored successfully", isError: false });
        }
    };

    const handleStartFresh = async () => {
        if (user && user.id) {
            await deleteDraftAction(user.id);
            setEditorState(BLANK_STATE);
            setSeoState({ focusKeyword: "", schemaType: "Article", metaTitle: "", metaDescription: "" });
            setPostType(null);
            setMetaTitleManuallyEdited(false);
            setMetaDescManuallyEdited(false);
            setTemplateKey(Date.now());
            setLastSavedTime(null);
            lastSavedStateRef.current = BLANK_STATE;
            setLastSavedState(BLANK_STATE);
            setDraftFound(null);
            setShowDraftBanner(false);
            setToast({ message: "Draft cleared", isError: false });
        }
    };

    const getDraftSavedStatus = () => {
        if (!lastSavedTime) return "";
        const diffMs = Date.now() - lastSavedTime.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const prefix = isEditMode ? "POST" : "DRAFT";
        if (diffMins < 1) return `${prefix} SAVED JUST NOW`;
        if (diffMins === 1) return `${prefix} SAVED 1 MIN AGO`;
        return `${prefix} SAVED ${diffMins} MIN AGO`;
    };
    
    // Auto-calculate read time
    const wordCount = [
        editorState.title, editorState.executiveSummary, editorState.scienceContent, 
        ...(editorState.products || []).map((p: any) => p.name + ' ' + p.description),
        ...(editorState.protocolSteps || []).map((p: any) => p.title + ' ' + p.content),
        ...(editorState.steps || []).map((s: any) => s.title + ' ' + s.content)
    ].join(" ").split(/\s+/).filter(Boolean).length;
    const calculatedReadTime = Math.max(1, Math.ceil(wordCount / 225));

    useEffect(() => {
        if (!loading && (!user || !isAdmin(user.email))) {
            if (!hasBeenAdmin) {
                router.replace("/");
                return;
            }
            const gracePeriod = setTimeout(() => {
                if (!user || !isAdmin(user?.email)) {
                    router.replace("/");
                }
            }, 30000); // 30 second grace period for token refresh
            return () => clearTimeout(gracePeriod);
        }
    }, [user, loading, router, hasBeenAdmin]);

    // Toast auto-dismiss (Fix 2)
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    if (loading || (!hasBeenAdmin && (!user || !isAdmin(user?.email)))) return null;

    if (isLoadingPost) {
        return (
            <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[500]">
                <Loader2 className="w-12 h-12 animate-spin text-neutral-400 mb-4" />
                <span className="font-mono text-[11px] text-neutral-400 tracking-widest uppercase">HYDRATING PUBLISHER CANVAS...</span>
            </div>
        );
    }

    const handleCreatePost = async () => {
        // Capture the ABSOLUTE LATEST state synchronously from the shared reference.
        // This captures typed keystrokes up to the exact millisecond of the click event.
        const current = editorStateRef.current;

        // Validation
        if (!current.title?.trim()) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setToast({ message: "Add a title before publishing", isError: true });
            return;
        }
        if (!current.category) {
            setIsSeoExpanded(true);
            setTimeout(() => {
                const select = document.getElementById('seo-category-select') as HTMLSelectElement;
                if (select) select.focus();
                document.getElementById('seo-panel')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
            setToast({ message: "Select a category before publishing", isError: true });
            return;
        }
        if (!current.executiveSummary?.trim()) {
            window.scrollTo({ top: 100, behavior: 'smooth' });
            setToast({ message: "Add an executive summary before publishing", isError: true });
            return;
        }
        if (postType === "RECOMMEND AND SELL" && (!current.products || current.products.length === 0)) {
            setToast({ message: "Add at least one product before publishing", isError: true });
            return;
        }

        setIsSaving(true);
        try {
            let finalSlug = loadedPostSlug;
            
            if (!isEditMode) {
                const baseSlug = current.title.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').substring(0, 80);
                finalSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
            }

            const postData = {
                title: current.title,
                slug: finalSlug,
                excerpt: current.executiveSummary,
                body_content: buildMarkdownFromState(current),
                meta_title: metaTitleManuallyEdited ? seoState.metaTitle : current.title,
                meta_description: metaDescManuallyEdited ? seoState.metaDescription : current.executiveSummary,
                focus_keyword: seoState.focusKeyword,
                schema_type: seoState.schemaType,
                category: current.category,
                post_intent: postType,
                cover_image_url: current.heroImageSrc && !current.heroImageSrc.includes('placeholder') 
                    ? current.heroImageSrc 
                    : "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop",
                cover_image_alt: current.title,
                related_products: current.products || [],
                protocol_steps: current.protocolSteps || [],
                avoid_items: current.avoidItems || [],
                faq_items: current.faqItems || [],
                pull_quote: current.pullQuote || '',
                science_heading: current.scienceHeading || '',
                science_content: current.scienceContent || '',
                selected_tool: current.selectedTool || "NONE",
                tool_position: current.toolPosition || null,
                read_time_minutes: calculatedReadTime,
                is_published: true,
                author_id: user?.id || "",
                visual_steps: current.steps || [],
                post_template_type: postType === "VISUAL STEP GUIDE" ? "VISUAL STEP GUIDE" : "STANDARD",
                sync_products: syncProducts
            };

            const res = isEditMode && loadedPostId 
                ? await updateLabPostAction(loadedPostId, postData)
                : await publishLabPostAction(postData);

            if (res.success) {
                if (isEditMode) {
                    setLastSavedTime(new Date());
                    router.refresh(); // Force client-side cache flush
                    setToast({ message: "Post saved successfully", isError: false });
                } else {
                    if (user && user.id) {
                        await deleteDraftAction(user.id);
                    }
                    setPublishedSlug(finalSlug || "");
                    setPublishState("success");
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            } else {
                throw new Error(res.error || `Failed to ${isEditMode ? 'save' : 'create'} post`);
            }
        } catch (err: any) {
            setToast({ message: `Failed to ${isEditMode ? 'save' : 'create'} post — your changes are safe.`, isError: true });
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const loadTemplate = (templateName: keyof typeof TEMPLATES) => {
        const tpl = TEMPLATES[templateName] as any;
        setEditorState(tpl);
        if (tpl && tpl.postType) {
            setPostType(tpl.postType);
        }
        setTemplateKey(Date.now()); // Force re-mount of ProductPostTemplate
    };

    return (
        <div className="bg-white min-h-screen pb-32 pt-[52px]">
            {/* SUCCESS OVERLAY */}
            {publishState === "success" && (
                <div className="fixed inset-0 bg-white z-[400] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
                    <h2 className="font-display text-[48px] md:text-[72px] uppercase text-black leading-none mb-4 tracking-tighter">{isEditMode ? "SAVED" : "PUBLISHED"}</h2>
                    <div className="w-24 h-[2px] bg-brand-red mb-8" />
                    <p className="font-mono text-[14px] text-neutral-400 mb-12 max-w-[400px] uppercase tracking-widest">{editorState.title}</p>
                    
                    <div className="flex flex-col w-full max-w-[400px] gap-4">
                        <a 
                            href={`/blog/${publishedSlug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-black block border-none text-white font-mono text-[12px] uppercase py-5 tracking-widest transition-all hover:bg-neutral-900 hover:tracking-[0.2em]"
                        >
                            {isEditMode ? "VIEW LIVE UPDATE" : "VIEW LIVE POST"}
                        </a>
                        <button 
                            onClick={() => {
                                if (isEditMode) {
                                    window.close();
                                } else {
                                    window.location.reload();
                                }
                            }}
                            className="w-full bg-transparent border border-black text-black font-mono text-[12px] uppercase py-5 tracking-widest transition-all hover:bg-neutral-50"
                        >
                            {isEditMode ? "CLOSE TAB" : "PUBLISH ANOTHER"}
                        </button>
                    </div>
                </div>
            )}

            {/* OVERLAY */}
            {!postType && (
                <div className="fixed inset-0 bg-white z-[300] flex flex-col items-center justify-center p-6">
                    <h1 className="font-display text-[32px] uppercase text-black mb-12 text-center">WHAT TYPE OF POST ARE YOU CREATING?</h1>
                    <div className="flex flex-col md:flex-row gap-6 max-w-[1000px] w-full">
                        <div 
                            onClick={() => {
                                setPostType("RECOMMEND AND SELL");
                                const tpl = TEMPLATES["BEST NUMBING CREAMS"] as any;
                                if (tpl) {
                                    setEditorState({ ...tpl });
                                    setTemplateKey(prev => prev + 1);
                                }
                            }}
                            className="flex-1 border border-black p-8 cursor-pointer hover:border-brand-red transition-colors group flex flex-col items-start"
                        >
                            <h2 className="font-display text-[24px] uppercase text-black mb-4">RECOMMEND<br/>AND SELL</h2>
                            <p className="font-sans text-[15px] text-neutral-600 mb-8 flex-grow">Product rankings, buying guides, comparisons</p>
                            <button className="bg-black text-white font-mono text-[11px] uppercase px-6 py-3 tracking-widest group-hover:bg-brand-red transition-colors">SELECT →</button>
                        </div>
                        <div 
                            onClick={() => {
                                setPostType("INFORM AND REFER");
                                const tpl = TEMPLATES["GENERAL HEALING PROTOCOL"] as any;
                                if (tpl) {
                                    setEditorState({ ...tpl });
                                    setTemplateKey(prev => prev + 1);
                                }
                            }}
                            className="flex-1 border border-black p-8 cursor-pointer hover:border-brand-red transition-all group flex flex-col items-start"
                        >
                            <h2 className="font-display text-[24px] uppercase text-black mb-4">INFORM<br/>AND REFER</h2>
                            <p className="font-sans text-[15px] text-neutral-600 mb-8 flex-grow">Guides, how-tos, cost breakdowns, removal guides</p>
                            <button className="bg-black text-white font-mono text-[11px] uppercase px-6 py-3 tracking-widest group-hover:bg-brand-red transition-colors">SELECT →</button>
                        </div>
                        <div
                            onClick={() => {
                                setPostType("VISUAL STEP GUIDE");
                                const tpl = TEMPLATES["HEALING TIMELINE"] as any;
                                if (tpl) {
                                    setEditorState({ ...tpl });
                                    setTemplateKey(prev => prev + 1);
                                }
                            }}
                            className="flex-1 border border-black p-8 cursor-pointer hover:border-brand-red transition-colors group flex flex-col items-start"
                        >
                            <h2 className="font-display text-[24px] uppercase text-black mb-4">
                                VISUAL STEP<br/>GUIDE
                            </h2>
                            <p className="font-sans text-[15px] text-neutral-600 mb-8 flex-grow">
                                Day-by-day guides, healing stages, pain maps, placement guides —
                                steps with images, no affiliate links
                            </p>
                            <button className="bg-black text-white font-mono text-[11px] uppercase px-6 py-3 tracking-widest group-hover:bg-brand-red transition-colors">
                                SELECT →
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CREATION TOOLBAR */}
            {postType && (
                <div className="fixed top-0 left-0 right-0 h-[52px] bg-black px-6 flex items-center justify-between z-[200]">
                    <div className="flex items-center gap-4">
                        <span className="font-display text-[16px] text-white">{isEditMode ? "EDIT POST" : "NEW POST"}</span>
                        <span className="font-mono text-[10px] uppercase bg-brand-red text-white px-3 py-1 tracking-widest">{postType}</span>
                        {lastSavedTime && (
                            <span className="font-mono text-[10px] text-neutral-400 ml-2 tracking-wider">
                                {getDraftSavedStatus()}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        {!isEditMode && (
                            <button 
                                onClick={handleStartFresh}
                                className="font-mono text-[11px] text-neutral-400 border border-neutral-600 px-4 py-2 hover:text-white hover:border-white transition-colors"
                            >
                                CLEAR CANVAS
                            </button>
                        )}
                        
                        {postType === "RECOMMEND AND SELL" && (
                            <label className="flex items-center gap-2 cursor-pointer select-none border border-neutral-700 px-3 py-2 hover:border-neutral-500 transition-colors bg-neutral-900/30">
                                <input 
                                    type="checkbox" 
                                    checked={syncProducts} 
                                    onChange={(e) => setSyncProducts(e.target.checked)} 
                                    className="w-3.5 h-3.5 accent-brand-red opacity-70 hover:opacity-100 cursor-pointer" 
                                />
                                <span className="font-mono text-[10px] text-white uppercase tracking-widest whitespace-nowrap">Add items to Product Page</span>
                            </label>
                        )}
                        <button 
                            onClick={handleCreatePost}
                            disabled={!editorState.title || !editorState.category || isSaving}
                            className={`font-mono text-[11px] uppercase px-6 py-2 transition-colors flex items-center gap-2 ${editorState.title && editorState.category ? 'bg-brand-red text-white hover:bg-red-700' : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'}`}
                        >
                            {isSaving && <Loader2 className="w-3 h-3 animate-spin" />}
                            {(!editorState.title || !editorState.category) ? 'FILL REQUIRED FIELDS' : (isEditMode ? 'SAVE CHANGES →' : 'CREATE POST →')}
                        </button>
                    </div>
                </div>
            )}



            {/* TOAST */}
            {toast && (
                <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[400] font-mono text-[11px] uppercase tracking-widest px-6 py-4 shadow-2xl ${toast.isError ? 'bg-brand-red text-white' : 'bg-black text-white'}`}>
                    {toast.message}
                </div>
            )}

            {/* CANVAS */}
            {postType && (
                <div className="relative pt-0">
                    {/* Template Loader Component removed per user request */}


                    {postType === "VISUAL STEP GUIDE" ? (
                        <VisualStepTemplate 
                            key={templateKey}
                            isAdmin={true}
                            mode="create"
                            postType={postType}
                            sharedStateRef={editorStateRef}
                            onChange={(state) => setEditorState((prev: any) => ({ ...prev, ...state }))}
                            {...editorState}
                        />
                    ) : (
                        <ProductPostTemplate 
                            key={templateKey}
                            isAdmin={true}
                            mode="create"
                            postType={postType}
                            sharedStateRef={editorStateRef}
                            onChange={(state) => setEditorState((prev: any) => ({ ...prev, ...state }))}
                            {...editorState}
                        />
                    )}
                </div>
            )}

            {/* SEO & TEMPLATE BOTTOM PANELS */}
            {postType && (
                <div className="max-w-[800px] mx-auto px-6 mt-16 space-y-4">
                    {/* SEO Panel */}
                    <div className="border border-neutral-200" id="seo-panel">
                        <button onClick={() => setIsSeoExpanded(!isSeoExpanded)} className="w-full flex items-center gap-2 p-4 font-mono text-[11px] uppercase tracking-widest bg-neutral-50 text-black hover:bg-neutral-100 transition-colors">
                            <ChevronDown className={`w-4 h-4 transition-transform ${isSeoExpanded ? 'rotate-180' : ''}`} /> SEO AND METADATA
                        </button>
                        
                        {isSeoExpanded && (
                            <div className="p-6 space-y-6">
                                <div>
                                    <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">Focus Keyword</label>
                                    <input type="text" placeholder="e.g. best numbing cream..." value={seoState.focusKeyword} onChange={(e) => setSeoState(s => ({...s, focusKeyword: e.target.value}))} className="w-full border border-neutral-300 p-3 font-mono text-[12px] outline-none focus:border-black" />
                                </div>
                                
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Meta Title</label>
                                        <span className={`font-mono text-[10px] ${(metaTitleManuallyEdited ? seoState.metaTitle : editorState.title)?.length > 60 ? 'text-brand-red' : 'text-neutral-400'}`}>{(metaTitleManuallyEdited ? seoState.metaTitle : editorState.title)?.length || 0}/60</span>
                                    </div>
                                    <input type="text" value={metaTitleManuallyEdited ? seoState.metaTitle : editorState.title} onChange={(e) => { setMetaTitleManuallyEdited(true); setSeoState(s => ({...s, metaTitle: e.target.value})); }} className="w-full border border-neutral-300 p-3 font-sans text-[15px] outline-none focus:border-black" />
                                </div>

                                <div>
                                    <div className="flex justify-between mb-2">
                                        <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Meta Description</label>
                                        <span className={`font-mono text-[10px] ${(metaDescManuallyEdited ? seoState.metaDescription : editorState.executiveSummary)?.length > 160 ? 'text-brand-red' : 'text-neutral-400'}`}>{(metaDescManuallyEdited ? seoState.metaDescription : editorState.executiveSummary)?.length || 0}/160</span>
                                    </div>
                                    <textarea value={metaDescManuallyEdited ? seoState.metaDescription : editorState.executiveSummary} onChange={(e) => { setMetaDescManuallyEdited(true); setSeoState(s => ({...s, metaDescription: e.target.value})); }} rows={3} className="w-full border border-neutral-300 p-3 font-sans text-[15px] outline-none focus:border-black resize-none" />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">Schema Type</label>
                                        <select value={seoState.schemaType} onChange={(e) => setSeoState(s => ({...s, schemaType: e.target.value}))} className="w-full border border-neutral-300 p-3 font-mono text-[12px] outline-none focus:border-black bg-white">
                                            <option value="Article">Article</option>
                                            <option value="FAQPage">FAQPage</option>
                                            <option value="HowTo">HowTo</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">Category *</label>
                                        <select id="seo-category-select" value={editorState.category} onChange={(e) => setEditorState((s: any) => ({...s, category: e.target.value}))} className={`w-full border p-3 font-mono text-[12px] outline-none bg-white ${!editorState.category ? 'border-brand-red' : 'border-neutral-300 focus:border-black'}`}>
                                            <option value="" disabled>Select Category...</option>
                                            {postType === "RECOMMEND AND SELL" 
                                                ? PRODUCT_CATEGORIES.map(c => <option key={c.slug} value={c.name}>{c.name}</option>)
                                                : BLOG_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)
                                            }
                                        </select>
                                        {!editorState.category && <p className="font-mono text-[10px] text-brand-red mt-2">Category is required</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-neutral-100">
                                    <div>
                                        <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">Post Intent</label>
                                        <div className="font-mono text-[12px] text-neutral-400 bg-neutral-50 p-3 border border-neutral-200">{postType}</div>
                                    </div>
                                    <div>
                                        <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">Read Time</label>
                                        <div className="font-mono text-[12px] text-neutral-400 bg-neutral-50 p-3 border border-neutral-200">{calculatedReadTime} MIN READ</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function PublishPostPage() {
    return (
        <Suspense fallback={
            <div className="fixed inset-0 bg-white flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-neutral-300 mb-4" />
                <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest">BOOTING EDITOR...</span>
            </div>
        }>
            <PublishPostContent />
        </Suspense>
    );
}
