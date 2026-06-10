"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Edit, X, Check, ArrowRight, Loader2, Plus } from "lucide-react";
import { useModal } from "@/context/ModalContext";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getSavedDesignsForUser, unsaveDesign } from "@/actions/collections";
import { getUserProfile, updateUsername } from "@/actions/profiles";
import { useToast } from "@/components/ui/Toast";
import MasonryGrid from "@/components/gallery/MasonryGrid";
import { Design } from "@/types/database.types";

export default function SavedPage() {
    const [designs, setDesigns] = useState<Design[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { openLoginModal } = useModal();
    const { showToast } = useToast();
    const router = useRouter();
    const { user, loading } = useAuth();
    
    // Editing States for Profile Username
    const [editingUsername, setEditingUsername] = useState(false);
    const [tempUsername, setTempUsername] = useState("");

    useEffect(() => {
        if (loading) return;

        if (user) {
            loadInitialData();
        } else {
            openLoginModal();
            router.push("/");
        }
    }, [user, loading, openLoginModal, router]);

    const loadInitialData = async () => {
        setIsLoading(true);
        const [savedRes, profRes] = await Promise.all([
            getSavedDesignsForUser(),
            getUserProfile()
        ]);
        setDesigns(savedRes.data || []);
        setProfile(profRes.data);
        setTempUsername(profRes.data?.username || "Anonymous Archiver");
        setIsLoading(false);
    };

    const handleUpdateUsername = async () => {
        if (!tempUsername.trim()) return;
        const res = await updateUsername(tempUsername);
        if (res.error) {
            showToast(res.error);
        } else {
            setProfile({ ...profile, username: tempUsername });
            setEditingUsername(false);
            showToast("Username updated");
        }
    };

    const handleRemoveDesign = async (designId: string) => {
        // Optimistic Update
        const previousDesigns = [...designs];
        setDesigns(designs.filter(d => d.id !== designId));

        const res = await unsaveDesign(designId);
        if (res.error) {
            showToast(res.error);
            setDesigns(previousDesigns); // Rollback
        } else {
            showToast("Design removed from saved archive");
        }
    };

    return (
        <div className="w-full bg-white min-h-screen pb-32">
            {/* Header Section */}
            <div className="max-w-[1280px] mx-auto px-4 md:px-6 pt-24 pb-16 border-b border-gray-light">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                    <div className="flex flex-col gap-4">
                        <h1 className="font-display text-[48px] md:text-[64px] leading-none text-black tracking-tight">
                            Your Archive
                        </h1>
                        
                        {/* Profile Edit Block */}
                        <div className="flex items-center gap-3">
                            {editingUsername ? (
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="text" 
                                        value={tempUsername}
                                        onChange={(e) => setTempUsername(e.target.value)}
                                        className="border-b border-black text-[16px] focus:outline-none py-1 bg-transparent text-black font-medium"
                                        autoFocus
                                    />
                                    <button onClick={handleUpdateUsername} className="text-black hover:text-brand-red"><Check className="w-4 h-4"/></button>
                                    <button onClick={() => setEditingUsername(false)} className="text-gray-mid hover:text-black"><X className="w-4 h-4"/></button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 group">
                                    <p className="text-[16px] text-gray-mid">
                                        Curated by <span className="text-black font-medium">{profile?.username || "Anonymous Archiver"}</span>
                                    </p>
                                    <button 
                                        onClick={() => setEditingUsername(true)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-mid hover:text-black"
                                    >
                                        <Edit className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats Dashboard */}
                    <div className="flex gap-8 border border-gray-light bg-off-white p-6">
                        <div className="flex flex-col">
                            <span className="font-mono text-[10px] uppercase text-gray-mid tracking-widest">Total Items</span>
                            <span className="font-display text-[24px] text-black font-bold">{designs.length}</span>
                        </div>
                        <div className="flex flex-col border-l border-gray-light pl-8 justify-center">
                            <span className="font-mono text-[10px] uppercase text-gray-mid tracking-widest mb-1 block">Status</span>
                            <span className="font-mono text-[12px] uppercase tracking-wider text-brand-red font-semibold">Synchronized</span>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-[1280px] mx-auto px-4 md:px-6 py-16">
                {isLoading ? (
                    <div className="py-24 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="w-6 h-6 animate-spin text-brand-red" />
                        <span className="font-mono text-[12px] uppercase text-gray-mid tracking-widest animate-pulse">Accessing secure files...</span>
                    </div>
                ) : designs.length > 0 ? (
                    <div className="space-y-8 animate-fade-in-up">
                        <div className="mb-8 flex justify-between items-center border-b border-black pb-4">
                            <h2 className="font-mono text-[14px] uppercase tracking-widest text-black font-bold">
                                Curated Blueprints ({designs.length})
                            </h2>
                            <Link 
                                href="/gallery" 
                                className="text-[11px] font-mono uppercase tracking-widest text-gray-mid hover:text-black flex items-center gap-1.5 group transition-colors"
                            >
                                Add designs <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                        </div>

                        <MasonryGrid 
                            designs={designs} 
                            onRemove={handleRemoveDesign}
                        />
                    </div>
                ) : (
                    <div className="py-24 flex flex-col items-center justify-center text-center border border-gray-light bg-off-white">
                        <p className="text-[12px] font-mono uppercase tracking-widest text-black mb-6 px-4">
                            YOUR SAVED ARCHIVE IS CURRENTLY EMPTY.
                        </p>
                        <Link
                            href="/gallery"
                            className="inline-flex items-center gap-2 px-8 py-3.5 bg-black text-white font-mono text-[12px] uppercase tracking-widest hover:bg-brand-red transition-colors active:scale-[0.98]"
                        >
                            <Plus className="w-4 h-4" /> Explore Gallery Catalog
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}
