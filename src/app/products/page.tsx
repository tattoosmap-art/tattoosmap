import { ProductCard } from "@/components/products/ProductCard";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { createClient } from "@/lib/supabase-server";
import { ADMIN_EMAILS } from "@/lib/admin";
import { AdminAddProductButton } from "@/components/products/AdminAddProductButton";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ProductScrollRow } from "@/components/products/ProductScrollRow";

export const metadata = {
    title: "Curated Equipment & Boutique | TattoosMap",
    description: "Professional-grade tools and aftercare, categorized for artists and collectors."
};

// Force dynamic content on fetch
export const revalidate = 60; 

export default async function ProductsPage() {
    // 1. Admin Auth Check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const isAdmin = !!user && ADMIN_EMAILS.includes(user.email?.toLowerCase().trim() || "");

    // 2. Fetch real products from Database
    const { data: products, error } = await supabaseAdmin
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Supabase Fetch Error details:", error.message, error.code, error.details);
    }

    // 3. Group products by category dynamically
    const groupedProducts: Record<string, any[]> = {};
    PRODUCT_CATEGORIES.forEach(cat => {
        groupedProducts[cat.name] = [];
    });
    
    const mapLegacyCategory = (legacyCat: string) => {
        const catLower = legacyCat.toLowerCase();
        if (catLower.includes("aftercare") || catLower.includes("healing")) return "Healing & Aftercare";
        if (catLower.includes("ink") || catLower.includes("pigment") || catLower.includes("color")) return "Inks & Pigments";
        if (catLower.includes("machine") || catLower.includes("power") || catLower.includes("equipment")) return "Tattoo Machines & Power";
        if (catLower.includes("needle") || catLower.includes("cartridge")) return "Needles & Cartridges";
        if (catLower.includes("practice") || catLower.includes("skin") || catLower.includes("book")) return "Practice & Learning";
        if (catLower.includes("hygiene") || catLower.includes("prep") || catLower.includes("soap") || catLower.includes("numbing")) return "Hygiene & Prep";
        if (catLower.includes("removal") || catLower.includes("laser")) return "Removal & Equipment";
        return "Studio Furniture"; // Default fallback bucket for unknown products
    };
    
    (products || []).forEach(p => {
        let cat = p.category || 'Other Essentials';
        
        // If the category doesn't exactly match a Master Category, try to map it
        if (!groupedProducts[cat]) {
            cat = mapLegacyCategory(cat);
        }
        
        if (groupedProducts[cat]) {
            groupedProducts[cat].push(p);
        }
    });

    return (
        <div className="w-full bg-white min-h-screen">

            {/* Editorial Hero */}
            <section className="relative pt-32 md:pt-40 pb-20 border-b border-neutral-100">
                <div className="max-w-[1280px] mx-auto px-4 md:px-8">
                    <div className="flex flex-col items-start text-left max-w-[800px]">
                        <span className="font-mono text-[10px] md:text-[11px] uppercase tracking-[0.3em] text-brand-red font-bold mb-6 flex items-center gap-3">
                            <span className="w-1.5 h-1.5 bg-brand-red rounded-full" /> SHOP & DISCOVER
                        </span>
                        <h1 className="font-display text-[44px] md:text-[72px] lg:text-[84px] text-black leading-[0.9] tracking-tighter mb-8">
                            The Selected <br/> Collection<span className="text-brand-red">.</span>
                        </h1>
                        <div className="h-[1px] w-full bg-neutral-100 mb-8" />
                        <p className="font-sans text-[16px] md:text-[19px] text-neutral-600 leading-relaxed max-w-[560px]">
                            A strictly vetted directory of professional equipment, clinical aftercare, and studio tools automatically gathered from our expert reviews.
                        </p>
                    </div>
                </div>
            </section>

            {/* Sticky Category Nav */}
            <nav className="sticky top-[64px] z-40 bg-white/90 backdrop-blur border-b border-neutral-100">
                <div className="max-w-[1280px] mx-auto px-4 md:px-8 overflow-x-auto no-scrollbar">
                    <ul className="flex items-center h-16 gap-10 min-w-max">
                        {PRODUCT_CATEGORIES.map(cat => (
                            <li key={cat.slug}>
                                <a
                                    href={`#${cat.slug}`}
                                    className="font-mono text-[12px] uppercase tracking-[0.08em] text-neutral-500 hover:text-black transition-colors"
                                >
                                    {cat.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>

            {/* Product Sections */}
            <div className="max-w-[1280px] mx-auto px-4 md:px-8 pb-32">
                {PRODUCT_CATEGORIES.map((category, index) => {
                    const catProducts = groupedProducts[category.name] || [];
                    // UP TO 6 PRODUCTS PER ROW AS REQUESTED
                    const displayProducts = catProducts.slice(0, 6);

                    return (
                        <section
                            key={category.slug}
                            id={category.slug}
                            className={`py-16 md:py-20 ${index !== 0 ? 'border-t border-neutral-100' : ''} scroll-mt-24`}
                        >
                            <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="font-mono text-[11px] text-brand-red font-bold">0{index + 1}</span>
                                        <div className="h-[1px] w-8 bg-brand-red/30" />
                                        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                                            {catProducts.length} {catProducts.length === 1 ? 'ITEM' : 'ITEMS'}
                                        </span>
                                    </div>
                                    <h2 className="font-display text-[36px] md:text-[48px] leading-none text-black">
                                        {category.name}
                                    </h2>
                                </div>
                                <div className="flex items-center gap-4">
                                    {isAdmin && (
                                        <AdminAddProductButton defaultCategory={category.name} />
                                    )}
                                    <Link href={`/products/${category.slug}`} className="font-mono text-[11px] uppercase tracking-widest text-neutral-500 hover:text-black hover:underline underline-offset-4 flex items-center gap-2">
                                        VIEW CATEGORY <ArrowRight className="w-3 h-3" />
                                    </Link>
                                </div>
                            </div>

                            {catProducts.length === 0 ? (
                                <div className="w-full bg-[#FAFAFA] border border-dashed border-neutral-200 py-24 flex flex-col items-center justify-center text-center">
                                    <span className="text-neutral-300 text-[24px] mb-4">📦</span>
                                    <h3 className="font-mono text-[12px] uppercase tracking-widest text-neutral-500 mb-2">No Products Yet</h3>
                                    {isAdmin ? (
                                        <AdminAddProductButton defaultCategory={category.name} className="mt-4 border-solid" />
                                    ) : (
                                        <p className="font-sans text-[14px] text-neutral-400">Items will be added soon.</p>
                                    )}
                                </div>
                            ) : (
                                <ProductScrollRow>
                                    {displayProducts.map((product) => (
                                        <div key={product.id} className="shrink-0 snap-start w-[85vw] md:w-[calc(45%-12px)] lg:w-[calc(33.333%-22px)] h-full">
                                            <ProductCard product={product} isAdmin={isAdmin} />
                                        </div>
                                    ))}
                                    
                                    {/* View All Card - appears after products */}
                                    {catProducts.length > 0 && (
                                        <div className="shrink-0 snap-start w-[85vw] md:w-[calc(45%-12px)] lg:w-[calc(33.333%-22px)] h-full min-h-[350px]">
                                            <Link href={`/products/${category.slug}`} className="group flex flex-col h-full bg-[#FAFAFA] border border-[#F0F0F0] hover:border-neutral-300 transition-colors items-center justify-center p-8 text-center min-h-[350px]">
                                                <div className="w-16 h-16 rounded-full border border-neutral-300 flex items-center justify-center mb-6 group-hover:bg-black group-hover:text-white transition-colors">
                                                    <ArrowRight className="w-6 h-6" />
                                                </div>
                                                <h3 className="font-display text-[24px] text-black mb-2">See All</h3>
                                                <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 group-hover:text-black transition-colors">
                                                    {catProducts.length} {catProducts.length === 1 ? 'Product' : 'Products'} in {category.name}
                                                </p>
                                            </Link>
                                        </div>
                                    )}
                                </ProductScrollRow>
                            )}
                        </section>
                    );
                })}
            </div>
        </div>
    );
}

