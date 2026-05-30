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
    let product = "Lubriderm Daily Moisture";
    let desc = "The dermatologist standard. Fragrance-free, no petroleum derivatives, pH 5.5. Works for 80% of skin types and tattoo styles.";

    if (healingDay === "Day 1-3") {
      product = "Aquaphor Healing Ointment";
      desc = "Aquaphor is the only recommendation for Days 1-3. It is a semi-occlusive that allows the wound to breathe while preventing the dry crust formation that causes color loss.";
    } else if (skin === "Sensitive") {
      product = "Hustle Butter Deluxe";
      desc = "Zero petroleum, zero lanolin, food-grade ingredients. Sensitive skin requires a gentle product that does not create an occlusive barrier that traps heat in the first 48 hours.";
    } else if (skin === "Oily") {
      product = "Lubriderm Daily Moisture";
      desc = "Water-based formula will not clog pores. The lighter molecular weight penetrates without sitting on top of skin — important for high-sebum zones.";
    } else if (skin === "Dry" && (style === "Traditional" || style === "Blackwork")) {
      product = "Bepanthen Tattoo Aftercare";
      desc = "Higher occlusive factor maintains moisture in heavily-worked skin. The dexpanthenol compound (provitamin B5) accelerates epidermal regeneration.";
    }

    const warning = (placement === "Ribs" || placement === "Hand") 
      ? "\n\nWARNING: High-friction placements require more frequent application (3x daily) and a more protective formula. Avoid anything water-based for the first 7 days."
      : "";

    return { product, desc: desc + warning };
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
          href="#affiliate" 
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
