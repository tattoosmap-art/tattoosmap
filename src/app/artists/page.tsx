import { getSupabaseAnon } from "@/lib/supabase-anon";
import { createClient } from "@/lib/supabase-server";
import { ADMIN_EMAILS } from "@/lib/admin";
import { AddArtistButton } from "@/components/artists/AddArtistButton";
import { ArtistsFeedClient } from "@/components/artists/ArtistsFeedClient";

import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Tattoo Artist Website Directory | World-Class Artists | TattoosMap",
    description: "Discover the world's best tattoo artist website profiles. Browse verified artists by style and location on TattoosMap — the leading tattoo portfolio website directory.",
    alternates: { canonical: "/artists" },
    openGraph: {
        title: "Tattoo Artist Directory | TattoosMap",
        description: "Discover the world's best tattoo artist website profiles on TattoosMap.",
        url: "https://tattoosmap.com/artists",
        type: "website",
    }
};

export const revalidate = 60;

// Type aligned with DB schema + enhanced fields
type DBartist = {
    id: string;
    full_name: string;
    bio: string;
    avatar_url: string;
    location: string;
    specialty?: string | null;
    link_url?: string | null;
    portfolio_images?: string[] | null;
    instagram_handle?: string | null;
    is_elite?: boolean;
    is_approved?: boolean | null;
    contact_email?: string | null;
    contact_phone?: string | null;
};

type DBartistDisplay = {
    id: string;
    full_name: string;
    location: string;
    avatar_url: string;
    specialty?: string | null;
    bio: string;
    link_url?: string | null;
    portfolio_images?: string[] | null;
    isMock?: boolean;
    is_approved?: boolean | null;
    contact_email?: string | null;
    contact_phone?: string | null;
};

export default async function ArtistsDirectory() {
    // Admin auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const isAdmin = !!user && ADMIN_EMAILS.includes(user.email?.toLowerCase().trim() || "");

    // Fetch artists from DB with robust error handling
    let dbArtists: any[] = [];
    try {
        const supabaseAnonClient = getSupabaseAnon();
        let query = supabaseAnonClient
            .from('artists')
            .select('*')
            .order('created_at', { ascending: false });

        // 1. Enforce Public Filtering (Only Admins can see unapproved cards)
        if (!isAdmin) {
            query = query.eq('is_approved', true);
        }

        const { data, error } = await query;

        if (error) {
            console.warn("[ArtistsPage] Supabase fetch issue:", error.message);
        } else if (data) {
            dbArtists = data;
        }
    } catch (err: any) {
        console.warn("[ArtistsPage] Fatal network/fetch error:", err?.message || err);
    }

    // Use DB artists directly
    const liveArtists: DBartistDisplay[] = dbArtists.map((a: DBartist) => ({
        id: a.id,
        full_name: a.full_name,
        location: a.location,
        avatar_url: a.avatar_url,
        specialty: a.specialty,
        bio: a.bio || "",
        link_url: a.link_url,
        portfolio_images: a.portfolio_images,
        is_approved: a.is_approved,
        contact_email: a.contact_email,
        contact_phone: a.contact_phone,
    }));

    return (
        <div className="w-full bg-white min-h-screen">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "ItemList",
                        "name": "Tattoo Artist Directory",
                        "description": "World-class tattoo artists on TattoosMap",
                        "url": "https://tattoosmap.com/artists"
                    })
                }}
            />

            {/* Hero */}
            <section className="pt-24 pb-16 px-4 max-w-[1280px] mx-auto border-b border-gray-100">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-4">
                    <div className="text-center md:text-left">
                        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-brand-red font-bold">
                            {liveArtists.length} {isAdmin ? "Total Profiles Loaded" : "Artists in Directory"}
                        </span>
                        <h1 className="font-display text-[48px] md:text-[64px] text-black leading-tight tracking-tight mt-2">
                            World-Class Artists.
                        </h1>
                        <p className="font-sans text-[16px] md:text-[18px] text-gray-mid max-w-[500px] mx-auto md:mx-0 mt-2">
                            Discover and connect with elite tattooers globally.
                        </p>
                    </div>

                    {/* Public Submission & Admin Action Gateway */}
                    <AddArtistButton isAdmin={isAdmin} isLoggedIn={!!user} />
                </div>
            </section>

            {/* Client Interactive Search, Categories, and Grid */}
            <ArtistsFeedClient artists={liveArtists} isAdmin={isAdmin} />
        </div>
    );
}
