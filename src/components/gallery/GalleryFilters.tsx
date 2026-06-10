"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { X, Search, SlidersHorizontal } from "lucide-react";

const STYLES = ["Traditional", "Realism", "Blackwork", "Japanese", "Geometric", "Watercolor", "Fine Line", "Neo-Traditional", "Minimalist", "Tribal", "New School"];
const BODY_PARTS = ["Forearm", "Upper Arm", "Shoulder", "Chest", "Back", "Ribs", "Stomach", "Leg", "Thigh", "Calf", "Wrist", "Ankle", "Hand", "Neck", "Behind Ear"];
const GENDERS = [
    { label: "Men and Women", value: "men and women" },
    { label: "Male-leaning", value: "male-leaning" },
    { label: "Female-leaning", value: "female-leaning" }
];

export default function GalleryFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentStyle = searchParams.get("style") || "";
    const currentBodyPart = searchParams.get("body_part") || "";
    const currentGender = searchParams.get("gender") || "";
    const currentSearch = searchParams.get("q") || "";
    const currentSort = searchParams.get("sort") || "recommended";

    // Debounce search state for typing fluidity
    const [inputValue, setInputValue] = useState(currentSearch);
    const [isSearchExpanded, setIsSearchExpanded] = useState(!!currentSearch);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        setInputValue(currentSearch);
        if (currentSearch) setIsSearchExpanded(true);
    }, [currentSearch]);

    const handleSearchDebounce = (val: string) => {
        setInputValue(val);
        router.push(`/gallery?${createQueryString("q", val)}`, { scroll: false });
    };

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) {
                params.set(name, value);
            } else {
                params.delete(name);
            }
            return params.toString();
        },
        [searchParams]
    );

    const handleFilterChange = (key: string, value: string) => {
        router.push(`/gallery?${createQueryString(key, value)}`, { scroll: false });
    };

    const clearFilter = (key: string) => {
        router.push(`/gallery?${createQueryString(key, "")}`, { scroll: false });
    };

    const hasActiveFilters = currentStyle || currentBodyPart || currentGender || currentSearch;
    const activeFiltersCount = [currentStyle, currentBodyPart, currentGender].filter(Boolean).length;

    return (
        <div className="w-full">
            {/* Sticky Filter Bar */}
            <div className="sticky top-[64px] z-40 bg-white/90 backdrop-blur border-b border-gray-light py-4 shadow-sm">
                <div className="max-w-[1280px] mx-auto px-4 md:px-6">
                    <div className="flex items-center justify-between gap-4">

                        {/* Mobile View: Filter & Search Trigger */}
                        <div className="flex md:hidden items-center justify-between w-full gap-2">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsMobileMenuOpen(true)}
                                    className={`flex items-center gap-2 px-4 py-2 border rounded-full text-xs font-semibold tracking-wide transition-all active:scale-95 ${
                                        activeFiltersCount > 0 
                                            ? "bg-black text-white border-black" 
                                            : "bg-white text-gray-800 border-gray-300"
                                    }`}
                                >
                                    <SlidersHorizontal className="w-3.5 h-3.5" />
                                    <span>Filters</span>
                                    {activeFiltersCount > 0 && (
                                        <span className="flex items-center justify-center bg-brand-red text-white text-[9px] w-4 h-4 rounded-full font-bold">
                                            {activeFiltersCount}
                                        </span>
                                    )}
                                </button>
                                
                                <select
                                    value={currentSort}
                                    onChange={(e) => handleFilterChange("sort", e.target.value)}
                                    className="bg-transparent border border-gray-200 text-xs font-semibold text-black py-2 px-3 rounded-full outline-none cursor-pointer"
                                >
                                    <option value="latest">Latest</option>
                                    <option value="recommended">Recommended</option>
                                    <option value="saved">Most Saved</option>
                                    <option value="viewed">Most Viewed</option>
                                </select>
                            </div>

                            <div className="flex items-center min-w-[32px] justify-end overflow-hidden">
                                {!isSearchExpanded ? (
                                    <button 
                                        onClick={() => setIsSearchExpanded(true)}
                                        className="text-gray-mid hover:text-black transition-colors p-2 bg-gray-50 border border-gray-200 rounded-full"
                                        aria-label="Open Search"
                                    >
                                        <Search className="w-3.5 h-3.5 text-gray-700" strokeWidth={2} />
                                    </button>
                                ) : (
                                    <div className="flex items-center border border-black rounded-full px-3 py-1 bg-white w-[180px] animate-in slide-in-from-right-2 fade-in duration-200">
                                        <Search className="w-3.5 h-3.5 text-black mr-2 flex-shrink-0" strokeWidth={2} />
                                        <input
                                            type="text"
                                            autoFocus
                                            placeholder="Search..."
                                            value={inputValue}
                                            onChange={(e) => handleSearchDebounce(e.target.value)}
                                            className="w-full bg-transparent outline-none text-[12px] text-black placeholder-gray-mid font-mono tracking-wide"
                                        />
                                        <button 
                                            onClick={() => {
                                                setInputValue('');
                                                clearFilter('q');
                                                setIsSearchExpanded(false);
                                            }} 
                                            className="text-gray-mid hover:text-black transition-colors ml-2 flex-shrink-0"
                                            aria-label="Close Search"
                                        >
                                            <X className="w-3 h-3" strokeWidth={2} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Desktop View Filters (Hidden on Mobile) */}
                        <div className="hidden md:flex items-center gap-6 overflow-x-auto no-scrollbar w-full md:w-auto">
                            <div className="flex items-center gap-2">
                                <span className="text-[13px] font-medium text-black mr-2">Style:</span>
                                <select
                                    value={currentStyle}
                                    onChange={(e) => handleFilterChange("style", e.target.value)}
                                    className="bg-transparent text-[13px] text-gray-mid outline-none cursor-pointer hover:text-black transition-colors"
                                >
                                    <option value="">All Styles</option>
                                    {STYLES.map(s => <option key={s} value={s.toLowerCase()}>{s}</option>)}
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[13px] font-medium text-black mr-2">Body Part:</span>
                                <select
                                    value={currentBodyPart}
                                    onChange={(e) => handleFilterChange("body_part", e.target.value)}
                                    className="bg-transparent text-[13px] text-gray-mid outline-none cursor-pointer hover:text-black transition-colors"
                                >
                                    <option value="">Any</option>
                                    {BODY_PARTS.map(s => <option key={s} value={s.toLowerCase()}>{s}</option>)}
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[13px] font-medium text-black mr-2">Gender:</span>
                                <select
                                    value={currentGender}
                                    onChange={(e) => handleFilterChange("gender", e.target.value)}
                                    className="bg-transparent text-[13px] text-gray-mid outline-none cursor-pointer hover:text-black transition-colors"
                                >
                                    <option value="">Any</option>
                                    {GENDERS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Desktop View Right Area: Sort Dropdown & Collapsible Search */}
                        <div className="hidden md:flex items-center gap-4 w-full md:w-auto mt-2 md:mt-0 justify-between md:justify-end border-t border-gray-light md:border-t-0 pt-4 md:pt-0">
                            
                            {/* Sort Dropdown */}
                            <div className="flex items-center gap-2">
                                <span className="text-[13px] font-medium text-black mr-2">Sort by:</span>
                                <select
                                    value={currentSort}
                                    onChange={(e) => handleFilterChange("sort", e.target.value)}
                                    className="bg-transparent text-[13px] text-black outline-none cursor-pointer font-mono uppercase tracking-[0.05em]"
                                >
                                    <option value="latest">Latest</option>
                                    <option value="recommended">Recommended</option>
                                    <option value="saved">Most Saved</option>
                                    <option value="viewed">Most Viewed</option>
                                </select>
                            </div>

                            <div className="w-[1px] h-4 bg-gray-light hidden md:block"></div>

                            {/* Collapsible Search Bar */}
                            <div className="flex items-center min-w-[32px] justify-end overflow-hidden">
                                {!isSearchExpanded ? (
                                    <button 
                                        onClick={() => setIsSearchExpanded(true)}
                                        className="text-gray-mid hover:text-black transition-colors"
                                        aria-label="Open Search"
                                    >
                                        <Search className="w-4 h-4" strokeWidth={2} />
                                    </button>
                                ) : (
                                    <div className="flex items-center border-b border-black pb-1 w-[180px] md:w-[220px] animate-in slide-in-from-right-2 fade-in duration-200">
                                        <Search className="w-3.5 h-3.5 text-black mr-2 flex-shrink-0" strokeWidth={2} />
                                        <input
                                            type="text"
                                            autoFocus
                                            placeholder="Search tattoos..."
                                            value={inputValue}
                                            onChange={(e) => handleSearchDebounce(e.target.value)}
                                            className="w-full bg-transparent outline-none text-[13px] text-black placeholder-gray-mid font-mono tracking-wide"
                                        />
                                        <button 
                                            onClick={() => {
                                                setInputValue('');
                                                clearFilter('q');
                                                setIsSearchExpanded(false);
                                            }} 
                                            className="text-gray-mid hover:text-black transition-colors ml-2 flex-shrink-0"
                                            aria-label="Close Search"
                                        >
                                            <X className="w-3.5 h-3.5" strokeWidth={2} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Mobile Filters Side Drawer / Overlay */}
            {isMobileMenuOpen && (
                <div 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="fixed inset-0 z-50 md:hidden bg-black/40 backdrop-blur-sm flex justify-end transition-opacity"
                >
                    <div 
                        onClick={(e) => e.stopPropagation()}
                        className="w-[85vw] max-w-sm bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
                    >
                        {/* Drawer Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <h2 className="text-base font-bold text-black font-display tracking-wide uppercase">Filters</h2>
                            <button 
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-black" />
                            </button>
                        </div>
                        
                        {/* Drawer Content (Selectable Chips) */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-6">
                            
                            {/* Style (formerly Type) */}
                            <div>
                                <h3 className="text-[11px] font-bold text-black uppercase tracking-wider mb-2.5">Style</h3>
                                <div className="flex flex-wrap gap-1.5">
                                    <button
                                        onClick={() => handleFilterChange("style", "")}
                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                                            !currentStyle 
                                                ? "bg-black border-black text-white" 
                                                : "bg-gray-50 border-gray-200 text-gray-700"
                                        }`}
                                    >
                                        All Styles
                                    </button>
                                    {STYLES.map(s => {
                                        const isSelected = currentStyle === s.toLowerCase();
                                        return (
                                            <button
                                                key={s}
                                                onClick={() => handleFilterChange("style", s.toLowerCase())}
                                                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                                                    isSelected 
                                                        ? "bg-black border-black text-white" 
                                                        : "bg-gray-50 border-gray-200 text-gray-700"
                                                }`}
                                            >
                                                {s}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            
                            {/* Body Part */}
                            <div>
                                <h3 className="text-[11px] font-bold text-black uppercase tracking-wider mb-2.5">Body Part</h3>
                                <div className="flex flex-wrap gap-1.5">
                                    <button
                                        onClick={() => handleFilterChange("body_part", "")}
                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                                            !currentBodyPart 
                                                ? "bg-black border-black text-white" 
                                                : "bg-gray-50 border-gray-200 text-gray-700"
                                        }`}
                                    >
                                        Any
                                    </button>
                                    {BODY_PARTS.map(b => {
                                        const isSelected = currentBodyPart === b.toLowerCase();
                                        return (
                                            <button
                                                key={b}
                                                onClick={() => handleFilterChange("body_part", b.toLowerCase())}
                                                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                                                    isSelected 
                                                        ? "bg-black border-black text-white" 
                                                        : "bg-gray-50 border-gray-200 text-gray-700"
                                                }`}
                                            >
                                                {b}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            
                            {/* Gender */}
                            <div>
                                <h3 className="text-[11px] font-bold text-black uppercase tracking-wider mb-2.5">Gender</h3>
                                <div className="flex flex-col gap-1.5">
                                    <button
                                        onClick={() => handleFilterChange("gender", "")}
                                        className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                                            !currentGender 
                                                ? "bg-black border-black text-white" 
                                                : "bg-gray-50 border-gray-200 text-gray-700"
                                        }`}
                                    >
                                        Any Gender
                                    </button>
                                    {GENDERS.map(g => {
                                        const isSelected = currentGender === g.value;
                                        return (
                                            <button
                                                key={g.value}
                                                onClick={() => handleFilterChange("gender", g.value)}
                                                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                                                    isSelected 
                                                        ? "bg-black border-black text-white" 
                                                        : "bg-gray-50 border-gray-200 text-gray-700"
                                                }`}
                                            >
                                                {g.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                        </div>
                        
                        {/* Drawer Footer */}
                        <div className="p-5 border-t border-gray-100 flex items-center justify-between gap-4">
                            <button 
                                onClick={() => {
                                    router.push('/gallery', { scroll: false });
                                    setIsMobileMenuOpen(false);
                                }}
                                className="text-xs font-bold text-gray-400 hover:text-black uppercase tracking-wider"
                            >
                                Clear All
                            </button>
                            <button 
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex-1 bg-black hover:bg-neutral-800 text-white text-xs font-bold py-3 px-6 rounded-full tracking-wider uppercase transition-colors"
                            >
                                View Results
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Active Filter Pills Map over the search params if they exist */}
            {hasActiveFilters && (
                <div className="max-w-[1280px] mx-auto px-4 md:px-6 pt-6 pb-2">
                    <div className="flex flex-wrap items-center gap-2">
                        {currentStyle && (
                            <button onClick={() => clearFilter('style')} className="flex items-center gap-1.5 px-3 py-1 bg-brand-red text-white text-[12px] font-medium rounded-none hover:bg-brand-red-dark transition-colors">
                                {currentStyle} <X className="w-3 h-3" strokeWidth={2} />
                            </button>
                        )}
                        {currentBodyPart && (
                            <button onClick={() => clearFilter('body_part')} className="flex items-center gap-1.5 px-3 py-1 bg-brand-red text-white text-[12px] font-medium rounded-none hover:bg-brand-red-dark transition-colors">
                                {currentBodyPart} <X className="w-3 h-3" strokeWidth={2} />
                            </button>
                        )}
                        {currentGender && (
                            <button onClick={() => clearFilter('gender')} className="flex items-center gap-1.5 px-3 py-1 bg-brand-red text-white text-[12px] font-medium rounded-none hover:bg-brand-red-dark transition-colors">
                                {currentGender} <X className="w-3 h-3" strokeWidth={2} />
                            </button>
                        )}
                        {currentSearch && (
                            <button onClick={() => clearFilter('q')} className="flex items-center gap-1.5 px-3 py-1 border border-black text-black bg-transparent text-[12px] font-medium rounded-none hover:bg-black hover:text-white transition-colors">
                                "{currentSearch}" <X className="w-3 h-3" strokeWidth={2} />
                            </button>
                        )}
                        <button onClick={() => router.push('/gallery', { scroll: false })} className="text-[12px] text-gray-mid hover:text-black hover:underline underline-offset-4 ml-2 transition-colors">
                            Clear all
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
