"use client";

import { useState } from "react";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { createProductAction } from "@/actions/admin";

export function AddProductModal({ onClose, defaultCategory }: { onClose: () => void, defaultCategory?: string }) {
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        price: "",
        affiliate_url: "",
        image_url: "",
        category: defaultCategory || PRODUCT_CATEGORIES[0].name,
        button_label: "BUY NOW",
    });
    
    const [toast, setToast] = useState<{message: string, isError: boolean} | null>(null);

    const handleAutoSlug = (name: string) => {
        return name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').substring(0, 80);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setToast(null);

        try {
            const finalData = {
                ...formData,
                slug: formData.slug || handleAutoSlug(formData.name)
            };

            const res = await createProductAction(finalData);
            
            if (res.success) {
                setToast({ message: "Product added successfully", isError: false });
                setTimeout(() => {
                    onClose();
                }, 1000);
            } else {
                throw new Error(res.error || "Failed to create product");
            }
        } catch (err: any) {
            setToast({ message: err.message || "Failed to create product", isError: true });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[500] bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white max-w-lg w-full p-8 shadow-2xl relative">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-neutral-400 hover:text-black"
                >
                    ✕
                </button>
                
                <h2 className="font-display text-[24px] mb-6">Add New Product</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Product Name *</label>
                        <input 
                            required
                            type="text" 
                            value={formData.name}
                            onChange={(e) => {
                                setFormData({...formData, name: e.target.value, slug: handleAutoSlug(e.target.value)});
                            }}
                            className="w-full border border-neutral-300 p-3 font-sans outline-none focus:border-black"
                            placeholder="e.g. Cheyenne Sol Nova Unlimited"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Price</label>
                            <input 
                                type="text" 
                                value={formData.price}
                                onChange={(e) => setFormData({...formData, price: e.target.value})}
                                className="w-full border border-neutral-300 p-3 font-sans outline-none focus:border-black"
                                placeholder="e.g. $1,299"
                            />
                        </div>
                        <div>
                            <label className="block font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Button Label</label>
                            <input 
                                type="text" 
                                value={formData.button_label}
                                onChange={(e) => setFormData({...formData, button_label: e.target.value})}
                                className="w-full border border-neutral-300 p-3 font-sans outline-none focus:border-black"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Category *</label>
                        <select 
                            value={formData.category}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                            className="w-full border border-neutral-300 p-3 font-sans outline-none focus:border-black bg-white"
                        >
                            {PRODUCT_CATEGORIES.map(cat => (
                                <option key={cat.slug} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Affiliate Link URL *</label>
                        <input 
                            required
                            type="url" 
                            value={formData.affiliate_url}
                            onChange={(e) => setFormData({...formData, affiliate_url: e.target.value})}
                            className="w-full border border-neutral-300 p-3 font-sans outline-none focus:border-black"
                            placeholder="https://..."
                        />
                    </div>

                    <div>
                        <label className="block font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Image URL</label>
                        <input 
                            type="url" 
                            value={formData.image_url}
                            onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                            className="w-full border border-neutral-300 p-3 font-sans outline-none focus:border-black"
                            placeholder="https://..."
                        />
                    </div>

                    {toast && (
                        <div className={`p-3 font-mono text-[11px] uppercase tracking-widest ${toast.isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {toast.message}
                        </div>
                    )}

                    <div className="pt-4 flex justify-end gap-3">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-6 py-3 font-mono text-[11px] uppercase tracking-widest border border-neutral-300 hover:bg-neutral-50"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={isSaving}
                            className="px-6 py-3 font-mono text-[11px] uppercase tracking-widest bg-black text-white hover:bg-neutral-800 disabled:opacity-50"
                        >
                            {isSaving ? "Saving..." : "Add Product"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
