import Link from "next/link";

export default function Footer() {
    return (
        <footer className="w-full bg-white border-t border-gray-light pt-[96px] pb-[48px]">
            <div className="max-w-[1280px] mx-auto px-4 md:px-6">
                
                {/* BRAND HEADER */}
                <div className="mb-12">
                    <Link
                        href="/"
                        className="font-display tracking-[0.05em] text-[20px] text-black block mb-4"
                    >
                        TATTOOSMAP
                    </Link>
                    <p className="text-[13px] text-gray-mid leading-relaxed max-w-[280px]">
                        A curated collection of modern tattoo inspiration, culture, and technique. Find your next design.
                    </p>
                </div>

                {/* SEO SILO GRID */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                    
                    {/* Column 1: Popular Meanings */}
                    <div className="flex flex-col gap-4">
                        <h4 className="font-mono text-[11px] uppercase tracking-[0.08em] text-black mb-2">Popular Meanings</h4>
                        <nav className="flex flex-col gap-3">
                            <Link href="/meaning/medusa" className="text-[13px] text-gray-mid hover:text-brand-red transition-colors">Medusa Tattoo Meaning</Link>
                            <Link href="/meaning/snake" className="text-[13px] text-gray-mid hover:text-brand-red transition-colors">Snake Tattoo Meaning</Link>
                            <Link href="/meaning/dragon" className="text-[13px] text-gray-mid hover:text-brand-red transition-colors">Dragon Tattoo Meaning</Link>
                            <Link href="/meaning/butterfly" className="text-[13px] text-gray-mid hover:text-brand-red transition-colors">Butterfly Tattoo Meaning</Link>
                            <Link href="/meaning/phoenix" className="text-[13px] text-gray-mid hover:text-brand-red transition-colors">Phoenix Tattoo Meaning</Link>
                            <Link href="/meaning/wolf" className="text-[13px] text-gray-mid hover:text-brand-red transition-colors">Wolf Tattoo Meaning</Link>
                        </nav>
                    </div>

                    {/* Column 2: Trending Styles */}
                    <div className="flex flex-col gap-4">
                        <h4 className="font-mono text-[11px] uppercase tracking-[0.08em] text-black mb-2">Trending Styles</h4>
                        <nav className="flex flex-col gap-3">
                            <Link href="/style/fine-line" className="text-[13px] text-gray-mid hover:text-brand-red transition-colors">Fine Line Tattoos</Link>
                            <Link href="/style/micro-realism" className="text-[13px] text-gray-mid hover:text-brand-red transition-colors">Micro Realism Tattoos</Link>
                            <Link href="/style/blackwork" className="text-[13px] text-gray-mid hover:text-brand-red transition-colors">Blackwork Tattoos</Link>
                            <Link href="/style/traditional" className="text-[13px] text-gray-mid hover:text-brand-red transition-colors">Traditional Tattoos</Link>
                            <Link href="/style/japanese" className="text-[13px] text-gray-mid hover:text-brand-red transition-colors">Japanese Tattoos</Link>
                            <Link href="/style/cyber-sigilism" className="text-[13px] text-gray-mid hover:text-brand-red transition-colors">Cyber Sigilism Tattoos</Link>
                            <Link href="/style/watercolor" className="text-[13px] text-gray-mid hover:text-brand-red transition-colors">Watercolor Tattoos</Link>
                        </nav>
                    </div>

                    {/* Column 3: Placements */}
                    <div className="flex flex-col gap-4">
                        <h4 className="font-mono text-[11px] uppercase tracking-[0.08em] text-black mb-2">Placements</h4>
                        <nav className="flex flex-col gap-3">
                            <Link href="/placement/forearm" className="text-[13px] text-gray-mid hover:text-brand-red transition-colors">Forearm Tattoos</Link>
                            <Link href="/placement/neck" className="text-[13px] text-gray-mid hover:text-brand-red transition-colors">Neck Tattoos</Link>
                            <Link href="/placement/back" className="text-[13px] text-gray-mid hover:text-brand-red transition-colors">Back Tattoos</Link>
                            <Link href="/placement/chest" className="text-[13px] text-gray-mid hover:text-brand-red transition-colors">Chest Tattoos</Link>
                            <Link href="/placement/sleeve" className="text-[13px] text-gray-mid hover:text-brand-red transition-colors">Sleeve Tattoos</Link>
                            <Link href="/placement/ankle" className="text-[13px] text-gray-mid hover:text-brand-red transition-colors">Ankle Tattoos</Link>
                            <Link href="/placement/hand" className="text-[13px] text-gray-mid hover:text-brand-red transition-colors">Hand Tattoos</Link>
                            <Link href="/placement/wrist" className="text-[13px] text-gray-mid hover:text-brand-red transition-colors">Wrist Tattoos</Link>
                        </nav>
                    </div>

                    {/* Column 4: Explore Platform */}
                    <div className="flex flex-col gap-4">
                        <h4 className="font-mono text-[11px] uppercase tracking-[0.08em] text-black mb-2">Explore Platform</h4>
                        <nav className="flex flex-col gap-3">
                            <Link href="/gallery" className="text-[13px] text-gray-mid hover:text-brand-red transition-colors">Gallery</Link>
                            <Link href="/blog" className="text-[13px] text-gray-mid hover:text-brand-red transition-colors">Journal</Link>
                            <Link href="/tools" className="text-[13px] text-gray-mid hover:text-brand-red transition-colors">Tools</Link>
                            <Link href="/clinics" className="text-[13px] text-gray-mid hover:text-brand-red transition-colors">Clinics</Link>
                            <Link href="/about" className="text-[13px] text-gray-mid hover:text-brand-red transition-colors">About</Link>
                            <a href="https://instagram.com/tattoosmap" target="_blank" rel="noopener noreferrer" className="text-[13px] text-gray-mid hover:text-brand-red transition-colors mt-2">Instagram</a>
                            <a href="https://pinterest.com/tattoosmap" target="_blank" rel="noopener noreferrer" className="text-[13px] text-gray-mid hover:text-brand-red transition-colors">Pinterest</a>
                        </nav>
                    </div>

                </div>

                <div className="mt-[64px] pt-[32px] border-t border-gray-light/50 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-[11px] text-gray-mid font-mono uppercase tracking-[0.08em]">
                        © 2026 TattoosMap — Be Unique
                    </p>
                    <nav className="flex gap-4">
                        <Link href="/contact" className="text-[11px] text-gray-mid uppercase tracking-[0.08em] hover:text-brand-red transition-colors">Privacy Policy</Link>
                    </nav>
                </div>
            </div>
        </footer>
    );
}
