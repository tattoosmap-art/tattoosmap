import React from "react";

interface StyleOption {
  id: string;
  name: string;
}

const STYLE_OPTIONS: StyleOption[] = [
  { id: "fine-line", name: "Fine Line" },
  { id: "blackwork", name: "Blackwork" },
  { id: "neo-traditional", name: "Neo-Traditional" },
  { id: "japanese", name: "Japanese" },
  { id: "geometric", name: "Geometric" },
  { id: "dotwork", name: "Dotwork" },
  { id: "realism", name: "Realism" },
  { id: "watercolor", name: "Watercolor" },
  { id: "tribal", name: "Tribal" }
];

interface StyleSelectorRowProps {
  selectedStyle: string;
  onSelectStyle: (styleId: string) => void;
}

export default function StyleSelectorRow({
  selectedStyle,
  onSelectStyle
}: StyleSelectorRowProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-[10px] uppercase font-bold tracking-[0.2em] text-brand-red">
        SELECT TATTOO STYLE
      </span>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 overscroll-x-contain">
        {STYLE_OPTIONS.map((style) => {
          const isActive = selectedStyle === style.id;
          return (
            <button
              key={style.id}
              type="button"
              onClick={() => onSelectStyle(style.id)}
              className={`flex-shrink-0 px-4 py-2 text-[11px] font-mono uppercase tracking-widest transition-all duration-300 ${
                isActive
                  ? "bg-brand-red text-white border-2 border-brand-red"
                  : "bg-white text-gray-mid border-2 border-gray-light hover:border-black hover:text-black"
              }`}
              style={{ borderRadius: 0 }}
            >
              {style.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
