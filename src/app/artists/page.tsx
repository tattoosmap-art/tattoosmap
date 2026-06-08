import { supabaseAnon } from "@/lib/supabase-anon";
import { AddArtistButton } from "@/components/artists/AddArtistButton";
import { ArtistsFeedClient } from "@/components/artists/ArtistsFeedClient";

export const metadata = {
    title: "World-Class Artists | TattoosMap",
    description: "Discover and connect with elite tattooers globally.",
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
    // Fetch approved artists from DB statically
    let dbArtists: any[] = [];
    try {
        const { data, error } = await supabaseAnon
            .from('artists')
            .select('*')
            .eq('is_approved', true)
            .order('created_at', { ascending: false });

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

            {/* Hero */}
            <section className="pt-24 pb-16 px-4 max-w-[1280px] mx-auto border-b border-gray-100">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-4">
                    <div className="text-center md:text-left">
                        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-brand-red font-bold">
                            {liveArtists.length} Artists in Directory
                        </span>
                        <h1 className="font-display text-[48px] md:text-[64px] text-black leading-tight tracking-tight mt-2">
                            World-Class Artists.
                        </h1>
                        <p className="font-sans text-[16px] md:text-[18px] text-gray-mid max-w-[500px] mx-auto md:mx-0 mt-2">
                            Discover and connect with elite tattooers globally.
                        </p>
                    </div>

                    {/* Public Submission & Admin Action Gateway */}
                    <AddArtistButton />
                </div>
            </section>

            {/* Client Interactive Search, Categories, and Grid */}
            <ArtistsFeedClient artists={liveArtists} />
        </div>
    );
}
