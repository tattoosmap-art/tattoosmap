"use client";

import { useState } from "react";
import { AddProductModal } from "./AddProductModal";

export function AdminAddProductButton({ defaultCategory, className }: { defaultCategory?: string, className?: string }) {
    const [isOpen, setIsOpen] = useState(false);

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
