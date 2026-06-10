import Link from "next/link";

export default function Footer() {
    return (
        <footer className="w-full bg-white border-t border-gray-light pt-[96px] pb-[48px]">
            <div className="max-w-[1280px] mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">

                    {/* Brand Column */}
                    <div className="flex flex-col gap-4">
                        <Link
                            href="/"
                            className="font-display tracking-[0.05em] text-[20px] text-black"
                        >
                            TATTOOSMAP
                        </Link>
                        <p className="text-[13px] text-gray-mid leading-relaxed max-w-[280px]">
                            A curated collection of modern tattoo inspiration, culture, and technique. Find your next design.
                        </p>
                    </div>

                    {/* Navigation Column */}
                    <div className="flex flex-col gap-4">
                        <h4 className="font-mono text-[11px] uppercase tracking-[0.08em] text-black mb-2">Explore</h4>
                        <nav className="flex flex-col gap-3">
                            <Link href="/gallery" className="text-[13px] text-gray-mid hover:text-brand-red transition-colors">Gallery</Link>
                            <Link href="/blog" className="text-[13px] text-gray-mid hover:text-brand-red transition-colors">Journal</Link>
                            <Link href="/tools" className="text-[13px] text-gray-mid hover:text-brand-red transition-colors">Tools</Link>
                            <Link href="/" className="text-[13px] text-gray-mid hover:text-brand-red transition-colors">About Us</Link>
                        </nav>
                    </div>

                    {/* Social / Legal Column */}
                    <div className="flex flex-col gap-4">
                        <h4 className="font-mono text-[11px] uppercase tracking-[0.08em] text-black mb-2">Connect</h4>
                        <nav className="flex flex-col gap-3">
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-[13px] text-gray-mid hover:text-brand-red transition-colors">Instagram</a>
                            <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="text-[13px] text-gray-mid hover:text-brand-red transition-colors">Pinterest</a>
                            <Link href="/contact" className="text-[13px] text-gray-mid hover:text-brand-red transition-colors">Contact Us</Link>
                            <Link href="/" className="text-[13px] text-gray-mid hover:text-brand-red transition-colors">Privacy Policy</Link>
                        </nav>
                    </div>

                </div>

                <div className="mt-[64px] pt-[32px] border-t border-gray-light/50 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-[11px] text-gray-mid font-mono uppercase tracking-[0.08em]">
                        © 2026 TattoosMap — Be Unique
                    </p>
                </div>
            </div>
        </footer>
    );
}
