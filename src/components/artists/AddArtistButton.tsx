"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { UpsertArtistModal } from "./UpsertArtistModal";

import { useModal } from "@/context/ModalContext";

export function AddArtistButton({ isAdmin = false, isLoggedIn = false }: { isAdmin?: boolean, isLoggedIn?: boolean }) {
    const [showModal, setShowModal] = useState(false);
    const { openLoginModal } = useModal();

    const handleClick = () => {
        if (!isLoggedIn && !isAdmin) {
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
                {isAdmin ? "Add Artist" : "Join Directory"}
            </button>

            {showModal && (
                <UpsertArtistModal 
                    isAdmin={isAdmin} 
                    onClose={() => setShowModal(false)} 
                />
            )}
        </>
    );
}
