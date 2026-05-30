"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useModal } from "@/context/ModalContext";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginModal() {
    const { isLoginModalOpen, closeLoginModal } = useModal();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        if (isLoginModalOpen) {
            document.body.style.overflow = "hidden";
            setMessage(null);
            setEmail("");
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isLoginModalOpen]);

    const handleGoogleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: window.location.origin + "/auth/callback",
            },
        });
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        setMessage(null);

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: window.location.origin + "/auth/callback",
                },
            });

            if (error) {
                setMessage({ type: "error", text: error.message });
            } else {
                setMessage({
                    type: "success",
                    text: "Login link sent! Check your inbox.",
                });
                setEmail("");
            }
        } catch (err: any) {
            setMessage({ type: "error", text: "Something went wrong. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isLoginModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={closeLoginModal}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="relative w-full max-w-[440px] bg-white border border-gray-light rounded-none p-8 md:p-12"
                    >
                        <button
                            onClick={closeLoginModal}
                            className="absolute top-6 right-6 text-black hover:text-brand-red transition-colors"
                            aria-label="Close modal"
                        >
                            <X className="w-5 h-5" strokeWidth={1.5} />
                        </button>

                        <div className="flex flex-col items-center text-center">
                            <div className="mb-6 bg-[#E1000F] text-white font-sans font-black italic px-2 py-0.5 text-[24px] leading-none tracking-[-0.05em] select-none">
                                Tattoosmap
                            </div>

                            <h2 className="font-display text-[28px] leading-tight text-black mb-3">
                                Join the Community
                            </h2>
                            <p className="text-[14px] text-gray-mid mb-8 max-w-[280px]">
                                Save your favorite designs and connect with world-class artists.
                            </p>

                            <button
                                onClick={handleGoogleLogin}
                                className="w-full flex items-center justify-center gap-3 h-[56px] bg-black text-white text-[14px] font-mono uppercase tracking-[0.1em] hover:bg-brand-red transition-colors rounded-none mb-6"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                Continue with Google
                            </button>

                            <div className="w-full flex items-center justify-between gap-4 mb-6">
                                <div className="h-[1px] bg-gray-light flex-grow"></div>
                                <span className="text-[10px] text-gray-mid font-mono uppercase tracking-[0.1em]">Or continue with email</span>
                                <div className="h-[1px] bg-gray-light flex-grow"></div>
                            </div>

                            <form onSubmit={handleEmailLogin} className="w-full flex flex-col gap-3">
                                <input
                                    type="email"
                                    required
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full h-[52px] border border-gray-light hover:border-gray-mid focus:border-black focus:outline-none px-4 text-[14px] bg-white transition-colors rounded-none"
                                    disabled={loading}
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-[52px] bg-white text-black border border-black text-[13px] font-mono uppercase tracking-[0.1em] hover:bg-black hover:text-white transition-colors rounded-none disabled:opacity-50"
                                >
                                    {loading ? "Sending..." : "Send Magic Link"}
                                </button>
                            </form>

                            {message && (
                                <div className={`mt-4 text-[12px] font-mono uppercase tracking-wider text-center ${message.type === "success" ? "text-green-600" : "text-brand-red"}`}>
                                    {message.text}
                                </div>
                            )}

                            <p className="mt-8 text-[11px] text-gray-mid font-mono uppercase tracking-wider">
                                Elite Art Gallery Standards
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
