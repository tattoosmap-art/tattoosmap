"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ProductScrollRow({ children }: { children: React.ReactNode }) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showLeft, setShowLeft] = useState(false);
    const [showRight, setShowRight] = useState(false);

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setShowLeft(scrollLeft > 20);
            // Allow a tiny buffer for floating point inaccuracies
            setShowRight(scrollLeft + clientWidth < scrollWidth - 20);
        }
    };

    useEffect(() => {
        const el = scrollRef.current;
        if (el) {
            checkScroll();
            el.addEventListener('scroll', checkScroll, { passive: true });
            window.addEventListener('resize', checkScroll);
            
            // Run again after a moment to ensure rendering completes
            const timer = setTimeout(checkScroll, 500);
            
            return () => {
                el.removeEventListener('scroll', checkScroll);
                window.removeEventListener('resize', checkScroll);
                clearTimeout(timer);
            };
        }
    }, [children]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const container = scrollRef.current;
            const scrollAmount = container.clientWidth * 0.8; // Scroll 80% of view width
            container.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="relative group/row w-full">
            {/* Left Nav Arrow - only visible on desktop when hovering row */}
            {showLeft && (
                <button 
                    onClick={() => scroll('left')}
                    className="hidden md:flex absolute left-[-20px] top-1/2 -translate-y-1/2 z-30 bg-white border border-neutral-200 hover:border-black text-black w-12 h-12 rounded-full items-center justify-center shadow-lg opacity-0 group-hover/row:opacity-100 transition-all duration-300 hover:scale-110"
                    aria-label="Scroll Left"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
            )}

            {/* Right Nav Arrow */}
            {showRight && (
                <button 
                    onClick={() => scroll('right')}
                    className="hidden md:flex absolute right-[-20px] top-1/2 -translate-y-1/2 z-30 bg-white border border-neutral-200 hover:border-black text-black w-12 h-12 rounded-full items-center justify-center shadow-lg opacity-0 group-hover/row:opacity-100 transition-all duration-300 hover:scale-110"
                    aria-label="Scroll Right"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            )}

            {/* The Scrolling Container */}
            <div 
                ref={scrollRef}
                data-lenis-prevent="true"
                className="flex overflow-x-auto gap-4 md:gap-6 lg:gap-8 pb-8 items-stretch snap-x snap-proximity scroll-smooth custom-horizontal-scrollbar overscroll-x-contain"
                style={{
                    WebkitOverflowScrolling: 'touch'
                }}
            >
                {children}
            </div>
            
            {/* Inline styles for explicit horizontal scrollbar handling if native fails */}
            <style jsx global>{`
                .custom-horizontal-scrollbar::-webkit-scrollbar {
                    height: 4px;
                    background: #F0F0F0;
                }
                .custom-horizontal-scrollbar::-webkit-scrollbar-thumb {
                    background: #D1D1D1;
                    border-radius: 4px;
                }
                .custom-horizontal-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #000000;
                }
            `}</style>
        </div>
    );
}
