"use client";

import { useState, useEffect } from "react";
import { AddProductModal } from "./AddProductModal";
import { createClient } from "@/lib/supabase-browser";
import { isAdmin } from "@/lib/admin";

export function AdminAddProductButton({ defaultCategory, className }: { defaultCategory?: string, className?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isUserAdmin, setIsUserAdmin] = useState(false);

    useEffect(() => {
        const checkAdmin = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user && isAdmin(user.email)) {
                setIsUserAdmin(true);
            }
        };
        checkAdmin();
    }, []);

    if (!isUserAdmin) return null;

    return (
        <>
            <button 
                onClick={() => setIsOpen(true)}
                className={`font-mono text-[10px] uppercase tracking-widest border border-dashed border-neutral-300 text-neutral-500 hover:border-black hover:text-black transition-colors px-4 py-2 ${className || ""}`}
            >
                + Add Product
            </button>
            {isOpen && (
                <AddProductModal 
                    defaultCategory={defaultCategory} 
                    onClose={() => setIsOpen(false)} 
                />
            )}
        </>
    );
}
