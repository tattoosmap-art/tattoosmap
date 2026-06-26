"use client";

import { useState } from "react";

type SkinType = "Normal" | "Oily" | "Dry" | "Sensitive";
type StyleType = "Fine Line" | "Blackwork" | "Traditional" | "Color";
type PlacementType = "Forearm" | "Ribs" | "Hand" | "Back";
type HealingDayType = "Day 1-3" | "Day 4-7" | "Week 2" | "Week 3+";

export default function SkinCompatibilityChecker() {
  const [skin, setSkin] = useState<SkinType>("Normal");
  const [style, setStyle] = useState<StyleType>("Traditional");
  const [placement, setPlacement] = useState<PlacementType>("Forearm");
  const [healingDay, setHealingDay] = useState<HealingDayType>("Week 2");

  const getRecommendation = () => {
    let product = "After Inked Tattoo Aftercare Lotion";
    let desc = "The lightweight champion. Completely fragrance-free, non-greasy, and absorbs in seconds. Formulated with grape seed oil to provide clean hydration without clogging pores.";
    let link = "https://www.amazon.com/After-Inked-Tattoo-Moisturizer-Aftercare/dp/B005I4R75O/ref=sr_1_6?dib=eyJ2IjoiMSJ9.1nSz4dyKOPosqiNptdLQaWj9kavmz5-jRriik1Sg2qh8JuSsEtUsHzNz0pm6x3vGDjMnLyRJ_qn7aCpx6xaCA-ydksdZMEkKagbXMrYrESsaZHQ7PkgC6sauu0iP4psQUgr0NJb3yRlCKRy3KACWiZkdDAIbelUdW5agVjXdo5Nzzjvs4S-9zn_b5lN8mMmx6a-VxYcrnDI9q8u5aUDRtKvPDiL5Qjrxozzw7UPI_58u5g0YylpSqTbcHD6fhTH-M7h-QoAQoeBcC_s4UtfZjuOVqp_iK8ddTldhvco5y.sOCk0X90cVgvIAy8p4ufhfrZhNyiUiImI1FgXaZ8I4s&dib_tag=se&keywords=best+tattoo+aftercare+cream&qid=1782474087&sr=8-6&th=1";

    if (skin === "Dry" || style === "Traditional" || style === "Blackwork") {
      product = "Hustle Butter Tattoo Aftercare Balm";
      desc = "A rich, petroleum-free balm made of organic shea, mango, and coco butters. Excellent for keeping heavily-worked or dry skin pliable, soft, and deeply hydrated during healing.";
      link = "https://www.amazon.com/Tattoo-Aftercare-Balm-Heals-Recovers/dp/B00AEVIIYK/ref=sr_1_5?dib=eyJ2IjoiMSJ9.1nSz4dyKOPosqiNptdLQaWj9kavmz5-jRriik1Sg2qh8JuSsEtUsHzNz0pm6x3vGDjMnLyRJ_qn7aCpx6xaCA-ydksdZMEkKagbXMrYrESsaZHQ7PkgC6sauu0iP4psQUgr0NJb3yRlCKRy3KACWiZkdDAIbelUdW5agVjXdo5Nzzjvs4S-9zn_b5lN8mMmx6a-VxYcrnDI9q8u5aUDRtKvPDiL5Qjrxozzw7UPI_58u5g0YylpSqTbcHD6fhTH-M7h-QoAQoeBcC_s4UtfZjuOVqp_iK8ddTldhvco5y.sOCk0X90cVgvIAy8p4ufhfrZhNyiUiImI1FgXaZ8I4s&dib_tag=se&keywords=best+tattoo+aftercare+cream&qid=1782474087&sr=8-5&th=1";
    }

    if (healingDay === "Day 1-3") {
      desc += "\n\nCRITICAL (Days 1-3): Wash with lukewarm water and mild fragrance-free soap, pat dry with a clean paper towel, and apply only a very thin, pea-sized layer of the balm or lotion. Never slather or drown the fresh tattoo.";
    }

    const warning = (placement === "Ribs" || placement === "Hand") 
      ? "\n\nWARNING: High-friction placements (Ribs, Hands) require more careful monitoring and thin, frequent applications (3x daily) to prevent rubbing and premature peeling."
      : "";

    return { product, desc: desc + warning, link };
  };

  const rec = getRecommendation();

  const renderGroup = <T extends string>(label: string, options: T[], state: T, setter: (val: T) => void) => (
    <div className="mb-6">
      <h4 className="font-mono text-[10px] uppercase text-black mb-3">{label}</h4>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => setter(opt)}
            className={`px-4 py-2 font-sans text-[14px] transition-colors rounded-none ${
              state === opt 
                ? "border border-black bg-off-white text-black" 
                : "border border-gray-light bg-white text-black/70 hover:border-black/50"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="border border-gray-light p-8 w-full max-w-[680px] mx-auto bg-white my-12">
      <div className="mb-8">
        <span className="font-mono text-[10px] uppercase text-brand-red mb-2 block">INTERACTIVE TOOL</span>
        <h3 className="font-display text-[22px] text-black mb-3">Find Your Skin Type's Best Match</h3>
        <p className="font-sans text-[17px] leading-[1.5] text-black/90">
          Different skin types react differently to aftercare products. Select your skin characteristics and we will filter the recommendations to what actually works for you.
        </p>
      </div>

      <div className="mb-8">
        {renderGroup("SKIN TYPE", ["Normal", "Oily", "Dry", "Sensitive"], skin, setSkin)}
        {renderGroup("TATTOO STYLE", ["Fine Line", "Blackwork", "Traditional", "Color"], style, setStyle)}
        {renderGroup("PLACEMENT", ["Forearm", "Ribs", "Hand", "Back"], placement, setPlacement)}
        {renderGroup("HEALING DAY", ["Day 1-3", "Day 4-7", "Week 2", "Week 3+"], healingDay, setHealingDay)}
      </div>

      <div className="border border-black p-6 bg-off-white/20">
        <div className="font-mono text-[10px] uppercase text-brand-red mb-2">FOR YOUR PROFILE:</div>
        <div className="font-display text-[20px] text-black mb-3">{rec.product}</div>
        <div className="font-sans text-[15px] leading-[1.6] text-black/90 whitespace-pre-wrap mb-6">
          {rec.desc}
        </div>
        <a 
          href={rec.link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block bg-black text-white font-mono text-[10px] uppercase px-5 py-3 hover:bg-neutral-900 transition-colors rounded-none"
        >
          VIEW ON AMAZON
        </a>
      </div>
    </div>
  );
}
