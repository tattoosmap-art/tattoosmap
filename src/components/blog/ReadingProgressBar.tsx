"use client";

import { useEffect, useState } from "react";

/**
 * A minimalist, 2px high sticky progress bar that transitions from 0% to 100%
 * based on the user's scroll depth within an article.
 * 
 * Compliance: Section 4 — Progress Bar (Gamification effect)
 */
export default function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const currentScroll = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      if (scrollHeight > 0) {
        const newProgress = Math.min(100, Math.max(0, Math.round((currentScroll / scrollHeight) * 100)));
        setProgress(prev => prev !== newProgress ? newProgress : prev);
      }
    };

    window.addEventListener("scroll", updateProgress);
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  return (
    <div 
      className="fixed top-0 left-0 w-full h-[2px] bg-transparent z-[50] pointer-events-none"
    >
      <div 
        className="h-full bg-brand-red transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
