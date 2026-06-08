"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { UpsertArtistModal } from "./UpsertArtistModal";

import { useModal } from "@/context/ModalContext";
import { createClient } from "@/lib/supabase-browser";
import { isAdmin as checkIsAdmin } from "@/lib/admin";
import { useEffect } from "react";

export function AddArtistButton() {
    const [showModal, setShowModal] = useState(false);
    const { openLoginModal } = useModal();
    const [isUserAdmin, setIsUserAdmin] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setIsLoggedIn(true);
                if (checkIsAdmin(user.email)) {
                    setIsUserAdmin(true);
                }
            }
        };
        checkAuth();
    }, []);

    const handleClick = () => {
        if (!isLoggedIn && !isUserAdmin) {
            openLoginModal();
        } else {
            setShowModal(true);
        }
    };

    return (
        <>
            <button
                onClick={handleClick}
                className="flex items-center gap-2 px-6 py-3.5 bg-black text-white font-mono text-[11px] uppercase tracking-[0.15em] font-bold hover:bg-brand-red transition-colors duration-300 cursor-pointer shadow-lg shadow-black/10 shrink-0"
            >
                <Plus className="w-4 h-4" />
                {isUserAdmin ? "Add Artist" : "Join Directory"}
            </button>

            {showModal && (
                <UpsertArtistModal 
                    isAdmin={isUserAdmin} 
                    onClose={() => setShowModal(false)} 
                />
            )}
        </>
    );
}
