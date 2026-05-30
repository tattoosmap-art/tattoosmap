import { ProductCard } from "@/components/products/ProductCard";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { createClient } from "@/lib/supabase-server";
import { ADMIN_EMAILS } from "@/lib/admin";
import { AdminAddProductButton } from "@/components/products/AdminAddProductButton";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
    const resolvedParams = await params;
    const categoryConfig = PRODUCT_CATEGORIES.find(c => c.slug === resolvedParams.category);
    if (!categoryConfig) return { title: "Category Not Found | TattoosMap" };
    
    return {
        title: `${categoryConfig.name} | TattoosMap Collection`,
        description: `Professional-grade ${categoryConfig.name.toLowerCase()} for tattoo artists and collectors.`
    };
}

export default async function CategoryPage({ 
    params, 
    searchParams 
}: { 
    params: Promise<{ category: string }>, 
    searchParams: Promise<{ page?: string }> 
}) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const currentPage = resolvedSearchParams.page ? parseInt(resolvedSearchParams.page, 10) : 1;
    
    const categoryConfig = PRODUCT_CATEGORIES.find(c => c.slug === resolvedParams.category);
    
    if (!categoryConfig) {
        notFound();
    }

    // Admin Auth Check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const isAdmin = !!user && ADMIN_EMAILS.includes(user.email?.toLowerCase().trim() || "");

    // Fetch all products from Database and filter in memory to handle legacy categories
    const { data: allProducts, error } = await supabaseAdmin
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Supabase Fetch Error:", error);
    }

    const mapLegacyCategory = (legacyCat: string) => {
        const catLower = legacyCat.toLowerCase();
        if (catLower.includes("aftercare") || catLower.includes("healing")) return "Healing & Aftercare";
        if (catLower.includes("ink") || catLower.includes("pigment") || catLower.includes("color")) return "Inks & Pigments";
        if (catLower.includes("machine") || catLower.includes("power") || catLower.includes("equipment")) return "Tattoo Machines & Power";
        if (catLower.includes("needle") || catLower.includes("cartridge")) return "Needles & Cartridges";
        if (catLower.includes("practice") || catLower.includes("skin") || catLower.includes("book")) return "Practice & Learning";
        if (catLower.includes("hygiene") || catLower.includes("prep") || catLower.includes("soap") || catLower.includes("numbing")) return "Hygiene & Prep";
        if (catLower.includes("removal") || catLower.includes("laser")) return "Removal & Equipment";
        return "Studio Furniture";
    };

    const catProducts = (allProducts || []).filter(p => {
        const cat = p.category || 'Other Essentials';
        // If it strictly matches, great. If not, map it and check.
        if (cat === categoryConfig.name) return true;
        return mapLegacyCategory(cat) === categoryConfig.name;
    });

    // Pagination Math
    const itemsPerPage = 9;
    const totalPages = Math.ceil(catProducts.length / itemsPerPage);
    const paginatedProducts = catProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="w-full bg-white min-h-screen">
            <div className="max-w-[1280px] mx-auto px-4 md:px-8 pt-32 pb-32">
                <Link href="/products" className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-neutral-500 hover:text-black transition-colors mb-12">
                    <ArrowLeft className="w-3 h-3" /> BACK TO ALL COLLECTIONS
                </Link>

                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16 pb-12 border-b border-neutral-100">
                    <div className="flex flex-col gap-3">
                        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-brand-red font-bold flex items-center gap-3">
                            <span className="w-1.5 h-1.5 bg-brand-red rounded-full" /> {catProducts.length} ITEMS {totalPages > 1 && `— PAGE ${currentPage}`}
                        </span>
                        <h1 className="font-display text-[48px] md:text-[64px] leading-none text-black">
                            {categoryConfig.name}
                        </h1>
                    </div>
                    {isAdmin && (
                        <AdminAddProductButton defaultCategory={categoryConfig.name} />
                    )}
                </div>

                {catProducts.length === 0 ? (
                    <div className="w-full bg-[#FAFAFA] border border-dashed border-neutral-200 py-32 flex flex-col items-center justify-center text-center">
                        <span className="text-neutral-300 text-[32px] mb-6">📦</span>
                        <h3 className="font-display text-[24px] text-black mb-2">No Products Available</h3>
                        <p className="font-sans text-[15px] text-neutral-500 max-w-[400px]">
                            We haven't added any products to the {categoryConfig.name} collection yet. Check back later or add one now if you are an admin.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                            {paginatedProducts.map(product => (
                                <ProductCard key={product.id} product={product} isAdmin={isAdmin} />
                            ))}
                        </div>

                        {/* Premium Grid Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-24 pt-8 border-t border-neutral-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                        <Link
                                            key={p}
                                            href={`/products/${categoryConfig.slug}?page=${p}`}
                                            className={`w-10 h-10 flex items-center justify-center text-[13px] font-mono border rounded-none transition-colors ${
                                                currentPage === p
                                                    ? "bg-black text-white border-black cursor-default"
                                                    : "bg-white text-black border-neutral-200 hover:border-black"
                                            }`}
                                        >
                                            {p}
                                        </Link>
                                    ))}
                                </div>

                                {currentPage < totalPages ? (
                                    <Link
                                        href={`/products/${categoryConfig.slug}?page=${currentPage + 1}`}
                                        className="flex items-center justify-center px-6 h-10 bg-black text-white text-[11px] font-mono uppercase tracking-[0.08em] rounded-none hover:bg-brand-red transition-colors"
                                    >
                                        Next &rarr;
                                    </Link>
                                ) : (
                                    <div className="w-24" />
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
