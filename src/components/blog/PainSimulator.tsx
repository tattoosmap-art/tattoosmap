"use client";

import { useState } from "react";

export default function PainSimulator() {
  const [intensity, setIntensity] = useState<number>(5);

  const getDetails = (val: number) => {
    if (val <= 3) {
      return {
        label: "PICOSECOND LASER",
        desc: "A rapid snapping sensation similar to a rubber band. Modern PicoSure technology minimizes thermal damage. Most patients describe this as manageable without numbing cream."
      };
    } else if (val <= 7) {
      return {
        label: "NANOSECOND Q-SWITCHED",
        desc: "A concentrated heat sting lasting a fraction of a second per pulse. Standard clinical technology. Numbing cream is recommended for placements near bone."
      };
    } else {
      return {
        label: "LEGACY LASER TECHNOLOGY",
        desc: "High heat with longer pulse duration. Associated with higher scarring risk. If a clinic uses this technology, ask why they have not upgraded."
      };
    }
  };

  const currentDetails = getDetails(intensity);

  return (
    <div className="border border-gray-light p-8 w-full max-w-[680px] mx-auto bg-white mb-12">
      <div className="mb-6">
        <span className="font-mono text-[10px] uppercase text-brand-red mb-2 block">INTERACTIVE TOOL</span>
        <h3 className="font-display text-[20px] text-black mb-3">How Much Does Laser Removal Hurt?</h3>
        <p className="font-sans text-[17px] leading-[1.5] text-black/90">
          Laser removal is described by most patients as more painful than getting the tattoo. The sensation varies by technology and placement. Adjust the slider to understand the specific sensation at different intensity levels.
        </p>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-end mb-4">
          <label htmlFor="pain-slider" className="font-mono text-[10px] uppercase text-black">LASER TECHNOLOGY</label>
          <span className="font-mono text-[12px] text-black font-medium">{currentDetails.label}</span>
        </div>
        
        <input 
          id="pain-slider"
          type="range"
          min="1"
          max="10"
          step="1"
          value={intensity}
          onChange={(e) => setIntensity(parseInt(e.target.value))}
          className="w-full h-[4px] bg-gray-light appearance-none outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[20px] [&::-webkit-slider-thumb]:h-[20px] [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:rounded-none"
        />
        <div className="flex justify-between mt-2 font-mono text-[10px] text-neutral-400">
          <span>MILD (Pico)</span>
          <span>MODERATE (Q-Switched)</span>
          <span>SEVERE (Legacy)</span>
        </div>
      </div>

      <div className="border-l-[3px] border-brand-red pl-4 py-2 mb-8 min-h-[80px]">
        <p className="font-sans text-[15px] leading-[1.6] text-black/90 transition-all">
          {currentDetails.desc}
        </p>
      </div>

      <div className="bg-amber-50 border-l-[3px] border-amber-500 p-4">
        <p className="font-sans text-[15px] text-amber-900 leading-[1.5]">
          <span className="font-bold">NUMBING CREAM NOTE:</span> Topical lidocaine cream applied 45 minutes before treatment reduces perceived pain by 40-60%. Ask your clinic to provide EMLA or bring your own Zensa cream.{" "}
          <a href="#affiliate" rel="noopener noreferrer" target="_blank" className="underline hover:text-amber-700 font-medium">
            [Zensa Numbing Cream — Amazon]
          </a>
        </p>
      </div>
    </div>
  );
}
