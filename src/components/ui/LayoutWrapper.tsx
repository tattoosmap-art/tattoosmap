"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isHomePage = pathname === '/';

    return (
        <>
            <Header />
            <main className="flex-grow">
                {children}
            </main>
            {!isHomePage && <Footer />}
        </>
    );
}
