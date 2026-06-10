"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface FAQAccordionProps {
  question: React.ReactNode;
  answer: React.ReactNode;
}

export default function FAQAccordion({ question, answer }: FAQAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [maxHeight, setMaxHeight] = useState<string>("0px");
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (contentRef.current) {
        setMaxHeight(`${contentRef.current.scrollHeight}px`);
      }
    } else {
      setMaxHeight("0px");
    }
  }, [isOpen]);

  return (
    <div className="bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 px-6 flex items-center justify-between text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red rounded-none hover:bg-neutral-50 transition-colors"
        aria-expanded={isOpen}
      >
        <span className="font-display text-[17px] text-black pr-4">{question}</span>
        <ChevronDown 
          className={`shrink-0 w-5 h-5 text-black transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} 
        />
      </button>
      <div 
        ref={contentRef}
        style={{ maxHeight }}
        className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
      >
        <div className="px-6 pb-6 font-sans text-[15px] leading-relaxed text-black/90">
          {answer}
        </div>
      </div>
    </div>
  );
}
