"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Bookmark, Menu, LogOut, X, PenLine, Sparkles, LayoutGrid, CloudUpload } from "lucide-react";
import { useModal } from "@/context/ModalContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";

export default function Header() {
    const router = useRouter();
    const { openLoginModal, closeLoginModal } = useModal();
    const { user } = useAuth();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    const navLinks = [
        { name: "Gallery", href: "/gallery" },
        { name: "Blog", href: "/blog" },
        { name: "Products", href: "/products" },
        { name: "Artists", href: "/artists" },
    ];

    // Auto-close the login modal when user signs in
    useEffect(() => {
        if (user) {
            closeLoginModal();
        }
    }, [user, closeLoginModal]);

    // Close profile dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSavedClick = () => {
        if (user) {
            router.push("/saved");
        } else {
            openLoginModal();
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        setIsProfileOpen(false);
        router.push("/");
    };

    return (
        <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-[8px] border-b border-gray-light">
            <div className="max-w-[1280px] mx-auto px-4 md:px-6 h-[72px] flex justify-between items-center md:grid md:grid-cols-3">

                {/* Left: Brand */}
                <div className="flex justify-start">
                    <Link
                        href="/"
                        className="flex-shrink-0 bg-[#E1000F] text-white font-sans font-black italic px-[6px] pt-[0px] pb-[3px] text-[22px] leading-none tracking-[-0.05em] rounded-none hover:opacity-90 transition-opacity select-none inline-flex items-center justify-center"
                    >
                        <span className="pr-[2px]">Tattoosmap</span>
                    </Link>
                </div>

                <nav className="hidden md:flex items-center justify-center gap-10">
                    {navLinks.map((link) => {
                        const isGallery = link.href === "/gallery";
                        return isGallery ? (
                            <a
                                key={link.name}
                                href={link.href}
                                className="group relative font-mono text-[12px] uppercase tracking-[0.1em] text-black hover:text-brand-red transition-colors whitespace-nowrap"
                            >
                                {link.name}
                                <span className="absolute -bottom-[4px] left-0 w-full h-[1.5px] bg-brand-red scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200"></span>
                            </a>
                        ) : (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="group relative font-mono text-[12px] uppercase tracking-[0.1em] text-black hover:text-brand-red transition-colors whitespace-nowrap"
                            >
                                {link.name}
                                <span className="absolute -bottom-[4px] left-0 w-full h-[1.5px] bg-brand-red scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200"></span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Right: Auth Actions */}
                <div className="flex items-center justify-end gap-6">
                    <button
                        aria-label="Saved Items"
                        onClick={handleSavedClick}
                        className="hidden md:flex text-black hover:text-brand-red transition-colors flex-shrink-0"
                    >
                        <Bookmark className="w-[22px] h-[22px]" strokeWidth={1.5} />
                    </button>

                    {user && user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL && (
                        <Link
                            href="/admin"
                            className="hidden md:block text-[12px] font-mono uppercase tracking-widest text-brand-red hover:text-black transition-colors"
                        >
                            Admin
                        </Link>
                    )}

                    {user ? (
                        <div ref={profileRef} className="relative hidden md:block">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="relative w-9 h-9 border border-gray-light hover:border-black transition-colors overflow-hidden rounded-none"
                                aria-label="Profile menu"
                            >
                                {user.user_metadata?.avatar_url ? (
                                    <Image
                                        src={user.user_metadata.avatar_url}
                                        alt="User profile"
                                        fill
                                        sizes="36px"
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-black flex items-center justify-center text-white text-[10px] font-mono uppercase">
                                        {user.email?.substring(0, 2)}
                                    </div>
                                )}
                            </button>

                            {/* Profile Dropdown */}
                            {isProfileOpen && (
                                <div className="absolute right-0 top-12 w-[220px] bg-white border border-gray-light rounded-none z-[60] overflow-hidden shadow-sm">
                                    <div className="px-5 py-4 border-b border-gray-light">
                                        <p className="text-[11px] font-mono uppercase text-gray-mid truncate">
                                            {user.email}
                                        </p>
                                    </div>
                                    <Link
                                        href="/saved"
                                        onClick={() => setIsProfileOpen(false)}
                                        className="flex items-center gap-3 px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-black hover:bg-off-white transition-colors"
                                    >
                                        <Bookmark className="w-4 h-4" strokeWidth={1.5} />
                                        Your Archive
                                    </Link>

                                    {/* Admin-only: Publish & Manage */}
                                    {isAdmin(user.email) && (
                                        <>
                                            <Link
                                                href="/admin/publish"
                                                onClick={() => setIsProfileOpen(false)}
                                                className="flex items-center gap-3 px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-black hover:bg-off-white transition-colors border-t border-gray-light/50"
                                            >
                                                <PenLine className="w-4 h-4" strokeWidth={1.5} />
                                                Publish
                                            </Link>
                                            <Link
                                                href="/admin/manage"
                                                onClick={() => setIsProfileOpen(false)}
                                                className="flex items-center gap-3 px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-black hover:bg-off-white transition-colors border-t border-gray-light/50"
                                            >
                                                <LayoutGrid className="w-4 h-4" strokeWidth={1.5} />
                                                Manage
                                            </Link>
                                            <Link
                                                href="/admin/seo-studio"
                                                onClick={() => setIsProfileOpen(false)}
                                                className="flex items-center gap-3 px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-black hover:bg-off-white transition-colors border-t border-gray-light/50"
                                            >
                                                <Sparkles className="w-4 h-4" strokeWidth={1.5} />
                                                Design Studio
                                            </Link>
                                        </>
                                    )}

                                    <button
                                        onClick={handleSignOut}
                                        className="w-full flex items-center gap-3 px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-brand-red hover:bg-off-white transition-colors border-t border-gray-light"
                                    >
                                        <LogOut className="w-4 h-4" strokeWidth={1.5} />
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={openLoginModal}
                            className="hidden md:block font-mono text-[12px] uppercase tracking-[0.1em] text-black hover:text-brand-red transition-colors px-6 py-2 border border-black rounded-none"
                        >
                            Login
                        </button>
                    )}

                    <button 
                        aria-label="Menu" 
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="md:hidden text-black hover:text-brand-red transition-colors flex-shrink-0"
                    >
                        <Menu className="w-6 h-6" strokeWidth={1.5} />
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[100] bg-white h-[100dvh] w-screen flex flex-col md:hidden animate-fade-in-up overflow-y-auto" data-lenis-prevent="true">
                    {/* Header in Mobile Menu */}
                    <div className="px-4 md:px-6 h-[72px] flex justify-between items-center border-b border-gray-light flex-shrink-0">
                        <Link
                            href="/"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex-shrink-0 bg-[#E1000F] text-white font-sans font-black italic px-[6px] pt-[0px] pb-[3px] text-[22px] leading-none tracking-[-0.05em] rounded-none hover:opacity-90 transition-opacity select-none inline-flex items-center justify-center"
                        >
                            <span className="pr-[2px]">Tattoosmap</span>
                        </Link>
                        <button 
                            onClick={() => setIsMobileMenuOpen(false)}
                            aria-label="Close Menu" 
                            className="text-black hover:text-brand-red transition-colors flex-shrink-0"
                        >
                            <X className="w-8 h-8" strokeWidth={1.5} />
                        </button>
                    </div>

                    {/* Mobile Links */}
                    <nav className="flex flex-col px-6 py-12 gap-6 flex-shrink-0">
                        {navLinks.map((link) => {
                            const isGallery = link.href === "/gallery";
                            return isGallery ? (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="font-mono text-[32px] uppercase tracking-tighter text-black hover:text-brand-red transition-colors"
                                >
                                    {link.name}
                                </a>
                            ) : (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="font-mono text-[32px] uppercase tracking-tighter text-black hover:text-brand-red transition-colors"
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Auth & Actions */}
                    <div className="mt-auto border-t border-gray-light bg-off-white/50 px-6 py-8 flex flex-col gap-6 pb-12 flex-shrink-0">
                        <button
                            onClick={() => {
                                setIsMobileMenuOpen(false);
                                handleSavedClick();
                            }}
                            className="flex items-center justify-between w-full text-[16px] font-mono tracking-widest text-black hover:text-brand-red uppercase"
                        >
                            <span>Your Archive</span>
                            <Bookmark className="w-5 h-5" strokeWidth={1.5} />
                        </button>

                        {user ? (
                            <>
                                <div className="text-[13px] text-gray-mid font-mono truncate pt-4 border-t border-gray-light/50">
                                    SIGNED IN AS:<br/>
                                    <span className="text-black">{user.email}</span>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        handleSignOut();
                                    }}
                                    className="flex items-center justify-between w-full text-[16px] font-mono tracking-widest text-brand-red hover:text-black uppercase mt-2"
                                >
                                    <span>Sign Out</span>
                                    <LogOut className="w-5 h-5" strokeWidth={1.5} />
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    openLoginModal();
                                }}
                                className="w-full mt-4 py-4 border border-black text-center text-[15px] font-mono tracking-widest text-black hover:text-brand-red hover:border-brand-red uppercase transition-colors"
                            >
                                Login
                            </button>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
