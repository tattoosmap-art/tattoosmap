import React from "react";

export default function GeneratorPlaceholder() {
  return (
    <div className="w-full h-full min-h-[400px] border-2 border-dashed border-gray-light flex flex-col items-center justify-center p-8 bg-off-white text-center">
      <div className="flex flex-col gap-4 items-center">
        <span className="text-4xl text-gray-mid">🎨</span>
        <span className="font-mono text-[12px] uppercase tracking-[0.2em] text-gray-mid font-bold">
          YOUR DESIGN WILL APPEAR HERE
        </span>
        <p className="text-[12px] text-gray-mid max-w-[280px] leading-relaxed">
          Fill in the prompt, select a style, and click Generate to see the AI generate a custom tattoo.
        </p>
        <span className="inline-block mt-4 px-3 py-1 bg-white border border-gray-light text-[9px] font-mono text-gray-mid tracking-widest uppercase">
          AI-GENERATED / ORIGINAL DESIGNS
        </span>
      </div>
    </div>
  );
}
