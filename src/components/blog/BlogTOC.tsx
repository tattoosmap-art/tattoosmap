"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import SocialShare from "./SocialShare";

interface TOCEntry {
  id: string;
  text: string;
}

interface BlogTOCProps {
  content: string;
  isSidebar?: boolean;
}

export default function BlogTOC({ content, isSidebar = false }: BlogTOCProps) {
  const [headings, setHeadings] = useState<TOCEntry[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Basic regex to find H2 headers: ## Header Text
    const h2Matches = content.match(/^##\s+(.+)$/gm);
    if (h2Matches) {
      const extracted = h2Matches.map(match => {
        const text = match.replace(/^##\s+/, "").trim();
        const id = text.toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-");
        return { id, text };
      });

      // Explicitly Append the Community Discussion Link to the final slot
      extracted.push({ id: "discussion", text: "Community Discussion" });

      setHeadings(extracted);
    }
  }, [content]);

  useEffect(() => {
    if (!isSidebar || headings.length === 0) return;

    // Use IntersectionObserver to track active heading
    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.current?.observe(el);
    });

    return () => observer.current?.disconnect();
  }, [headings, isSidebar]);

  if (headings.length < 3) return null;

  if (isSidebar) {
    return (
      <nav className="hidden lg:block sticky top-24 w-[240px] flex-shrink-0 self-start ml-12">
        <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-6 border-b border-neutral-100 pb-2">
          Contents
        </div>
        <ul className="space-y-4">
          {headings.map((h) => (
            <li key={h.id}>
              <Link
                href={`#${h.id}`}
                className={`block font-mono text-[11px] uppercase tracking-wider transition-colors duration-200 border-l-[2px] pl-4 ${
                  activeId === h.id
                    ? "text-brand-red border-brand-red"
                    : "text-neutral-400 border-transparent hover:text-black"
                }`}
              >
                {h.text}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-12 pt-8 border-t border-neutral-100">
           <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-6">Share Article</div>
           <SocialShare title={headings.find(h => h.id === activeId)?.text || "TattoosMap Guide"} url={typeof window !== 'undefined' ? window.location.href : ""} />
        </div>
      </nav>
    );
  }

  // Mobile / Inline Version (Boxed) - Intentinally hidden on mobile as per user correction
  return null;
}
