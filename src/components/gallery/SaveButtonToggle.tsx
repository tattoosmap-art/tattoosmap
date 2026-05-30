"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useModal } from "@/context/ModalContext";
import { useAuth } from "@/context/AuthContext";
import CollectionPickerDropdown from "./CollectionPickerDropdown";

interface SaveButtonToggleProps {
    designId: string;
    saveCount?: number;
    viewCount?: number;
}

export default function SaveButtonToggle({ designId, saveCount = 0, viewCount = 0 }: SaveButtonToggleProps) {
    const { openLoginModal } = useModal();
    const { user } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleAction = () => {
        if (!user) {
            openLoginModal();
            return;
        }
        setIsDropdownOpen(prev => !prev);
    };

    const handleSavedSuccessfully = () => {
        setSaved(true);
    };

    return (
        <div className="relative w-full">
            <button
                onClick={handleAction}
                className={`w-full py-4 font-mono text-[12px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 border-2 transition-all ${
                    saved
                        ? "bg-black text-white border-black"
                        : "bg-white text-black border-black hover:bg-black hover:text-white"
                }`}
            >
                <Heart className={`w-4 h-4 ${saved ? "fill-white" : ""}`} />
                {saved ? "Saved to Collection" : "Save Design"}
            </button>
            
            {/* Conditional Dropdown for User Collections */}
            {isDropdownOpen && user && (
                <CollectionPickerDropdown 
                    designId={designId} 
                    onClose={() => setIsDropdownOpen(false)} 
                    onSaved={handleSavedSuccessfully}
                />
            )}
        </div>
    );
}
