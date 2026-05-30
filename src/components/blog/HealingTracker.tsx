"use client";

import { useState } from "react";

const HEALING_DATA: Record<number, {
  label: string;
  title: string;
  whatToExpect: string;
  whatToDo: string[];
  warningSigns: string[];
  product: string;
  productNote: string;
}> = {
  1: {
    label: "Day 1",
    title: "Fresh Tattoo — Open Wound Phase",
    whatToExpect: "Redness, swelling, and plasma weeping from the tattoo. The area will feel warm and tender. Some ink may appear to be coming off — this is excess ink being pushed out, not your tattoo fading.",
    whatToDo: [
      "Remove the wrap your artist applied after 3 to 5 hours",
      "Wash gently with fragrance-free antibacterial soap and lukewarm water",
      "Pat completely dry with a fresh paper towel — never a cloth towel",
      "Apply a very thin layer of Aquaphor — skin should look slightly shiny not wet",
      "Re-wrap only if your artist specifically instructed you to"
    ],
    warningSigns: [
      "Spreading redness beyond the tattoo boundary",
      "Increasing swelling after the first few hours",
      "Green or yellow discharge"
    ],
    product: "Aquaphor Healing Ointment",
    productNote: "Days 1-3 only — switch after 72 hours"
  },
  3: {
    label: "Day 3",
    title: "Still Weeping — Stay The Course",
    whatToExpect: "Plasma weeping continues but should be reducing. The tattoo may look slightly raised. Colors may appear duller than they did fresh — this is normal.",
    whatToDo: [
      "Continue washing twice daily with fragrance-free soap",
      "Continue thin Aquaphor applications 3 times daily",
      "Do not pick at any forming scabs or plasma crust",
      "Wear loose breathable clothing over the tattoo"
    ],
    warningSigns: [
      "Weeping that is increasing not decreasing",
      "Fever or chills",
      "Red streaks extending from the tattoo"
    ],
    product: "Aquaphor Healing Ointment",
    productNote: "Last day of Aquaphor — switch tomorrow"
  },
  4: {
    label: "Day 4",
    title: "Switch To Lightweight Moisturizer",
    whatToExpect: "Weeping stops. The skin begins to tighten and feel dry. The tattoo may start to look slightly faded — the epidermis is beginning to close over the ink.",
    whatToDo: [
      "Stop using Aquaphor today — switch to Lubriderm or Hustle Butter",
      "Apply moisturizer twice daily — morning and before sleep",
      "The skin will feel tight — this is normal keratinocyte rebuilding",
      "Continue fragrance-free soap washing twice daily"
    ],
    warningSigns: [
      "Continued heavy weeping beyond Day 4",
      "Blistering that appears infected rather than healing",
      "Unusual odor from the tattoo area"
    ],
    product: "Lubriderm Daily Moisture or Hustle Butter",
    productNote: "Use for the remainder of healing"
  },
  7: {
    label: "Day 7",
    title: "Peeling Begins — Do Not Pick",
    whatToExpect: "The tattoo begins to peel like a sunburn. This is completely normal — dead epidermal cells shedding as new ones form beneath. The ink is in the dermis below the peeling layer — it is not coming off.",
    whatToDo: [
      "Continue twice-daily moisturizer application",
      "Do NOT peel the skin manually — let it fall off naturally",
      "If itching is intense tap gently with a clean fingertip — do not scratch",
      "Apply a thin moisturizer layer when itching occurs — it subsides within minutes"
    ],
    warningSigns: [
      "Peeling that reveals raw bleeding skin beneath",
      "Itching accompanied by spreading rash",
      "Swelling that returns after it had reduced"
    ],
    product: "Lubriderm Daily Moisture or Hustle Butter",
    productNote: "Twice daily application"
  },
  14: {
    label: "Week 2",
    title: "Peeling Complete — Cloudy Phase Begins",
    whatToExpect: "Surface peeling is complete. The tattoo looks fully healed on the surface but appears dull or milky. This is semi-opaque new epidermal cells. The color is still there — it will reveal itself between months 2 and 4.",
    whatToDo: [
      "Reduce to once-daily moisturizer application",
      "Add mineral SPF (zinc oxide only) if the tattoo will be exposed to sun",
      "You can now shower normally — keep sessions under 10 minutes",
      "Avoid swimming for 2 more weeks"
    ],
    warningSigns: [
      "New redness or swelling appearing after it had resolved",
      "Raised bumps or hives around the tattoo",
      "Color loss in patches rather than uniform dulling"
    ],
    product: "Mineral SPF 50 (zinc oxide)",
    productNote: "Add now for any sun-exposed placement"
  },
  30: {
    label: "Month 1",
    title: "Surface Healed — Dermis Still Stabilizing",
    whatToExpect: "The tattoo looks healed and colors are beginning to clarify. The dermis is still stabilizing — avoid aggressive exfoliation or chemical treatments on or around the tattoo.",
    whatToDo: [
      "Once-daily moisturizer for at least another month",
      "Mineral SPF every time the tattoo is exposed to sun — permanently",
      "You can now swim — pat the tattoo dry immediately after",
      "Avoid laser treatments, chemical peels, or microneedling on the area"
    ],
    warningSigns: [
      "Patchy color loss that does not resolve",
      "Raised scarring texture",
      "Persistent itching beyond Month 1"
    ],
    product: "Mineral SPF 50 — permanent ongoing",
    productNote: "UV is the biggest cause of long-term ink fade"
  }
};

export default function HealingTracker() {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  return (
    <div className="max-w-[680px] mx-auto border border-gray-light bg-off-white p-6 my-12 rounded-none">
      <div className="mb-6">
        <span className="font-mono text-[9px] uppercase text-brand-red tracking-widest block mb-2">
          TATTOOSMAP HEALING TRACKER
        </span>
        <h3 className="font-display text-[24px] uppercase tracking-tight text-black">
          Where Are You In Your Healing?
        </h3>
        <p className="font-sans text-[14px] text-neutral-500 mt-2">
          Select your current day to see exactly what to expect and what to do.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {Object.entries(HEALING_DATA).map(([day, data]) => (
          <button
            key={day}
            onClick={() => setSelectedDay(Number(day))}
            className={`font-mono text-[10px] uppercase tracking-widest px-4 py-2 border rounded-none transition-colors ${
              selectedDay === Number(day)
                ? 'bg-black text-white border-black'
                : 'bg-white text-neutral-500 border-neutral-300 hover:border-black hover:text-black'
            }`}
          >
            {data.label}
          </button>
        ))}
      </div>

      {selectedDay && HEALING_DATA[selectedDay] && (
        <div className="space-y-6">
          <div>
            <h4 className="font-display text-[20px] uppercase tracking-tight text-black mb-2">
              {HEALING_DATA[selectedDay].title}
            </h4>
            <p className="font-sans text-[15px] text-black/80 leading-relaxed">
              {HEALING_DATA[selectedDay].whatToExpect}
            </p>
          </div>

          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-black font-bold block mb-3">
              What To Do Today
            </span>
            <ul className="space-y-2">
              {HEALING_DATA[selectedDay].whatToDo.map((item, i) => (
                <li key={i} className="flex gap-3 font-sans text-[14px] text-black/80">
                  <span className="font-mono text-[10px] text-brand-red mt-1 shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="border-l-2 border-brand-red pl-4">
            <span className="font-mono text-[10px] uppercase tracking-widest text-brand-red font-bold block mb-3">
              Warning Signs — See A Doctor If You Notice
            </span>
            <ul className="space-y-1">
              {HEALING_DATA[selectedDay].warningSigns.map((sign, i) => (
                <li key={i} className="font-sans text-[13px] text-black/70">
                  — {sign}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white border border-gray-light p-4 flex justify-between items-center rounded-none">
            <div>
              <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 block mb-1">
                Recommended Product
              </span>
              <span className="font-sans text-[14px] font-medium text-black">
                {HEALING_DATA[selectedDay].product}
              </span>
              <span className="font-mono text-[10px] text-neutral-400 block mt-1">
                {HEALING_DATA[selectedDay].productNote}
              </span>
            </div>
            <a
              href="/blog/best-tattoo-aftercare-cream"
              className="font-mono text-[10px] uppercase tracking-widest text-brand-red hover:underline shrink-0 ml-4"
            >
              View Guide →
            </a>
          </div>
        </div>
      )}

      {!selectedDay && (
        <div className="text-center py-8 border-2 border-dashed border-neutral-200 rounded-none">
          <p className="font-mono text-[11px] uppercase text-neutral-300 tracking-widest">
            Select a day above to see your healing guide
          </p>
        </div>
      )}
    </div>
  );
}
