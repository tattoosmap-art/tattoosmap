"use client";

import { useState } from "react";
import { Pencil, Trash2, AlertTriangle, CheckCircle } from "lucide-react";
import { UpsertArtistModal } from "./UpsertArtistModal";
import { deleteArtistAction, approveArtistAction } from "@/actions/admin";

type Artist = {
    id: string;
    full_name: string;
    avatar_url: string;
    location: string;
    specialty: string;
    bio: string;
    link_url: string;
    portfolio_images: string[];
    is_approved?: boolean;
    contact_email?: string;
    contact_phone?: string;
};

export function ArtistCardAdminActions({ artist }: { artist: Artist }) {
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isApproving, setIsApproving] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        await deleteArtistAction(artist.id);
        setIsDeleting(false);
        setShowDeleteConfirm(false);
    };

    const handleApprove = async () => {
        setIsApproving(true);
        try {
            await approveArtistAction(artist.id);
        } catch (err) {
            console.error("Approve error:", err);
        } finally {
            setIsApproving(false);
        }
    };

    return (
        <>
            {/* Inline admin action buttons — rendered inside the card */}
            <div className="flex items-center gap-2">
                {/* Approve CTA conditionally displayed */}
                {artist.is_approved === false && (
                    <button
                        onClick={handleApprove}
                        disabled={isApproving}
                        title="Approve Artist Entry"
                        className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest border border-green-500 hover:bg-green-500 text-green-600 hover:text-white transition-all cursor-pointer disabled:opacity-50 font-bold"
                    >
                        <CheckCircle className="w-3.5 h-3.5" /> {isApproving ? "..." : "Approve"}
                    </button>
                )}

                <button
                    onClick={() => setShowEditModal(true)}
                    title="Edit Artist"
                    className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest border border-neutral-200 hover:border-black text-neutral-500 hover:text-black transition-colors cursor-pointer"
                >
                    <Pencil className="w-3 h-3" /> Edit
                </button>
                <button
                    onClick={() => setShowDeleteConfirm(true)}
                    title="Delete Artist"
                    className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest border border-neutral-200 hover:border-brand-red text-neutral-500 hover:text-brand-red transition-colors cursor-pointer"
                >
                    <Trash2 className="w-3 h-3" /> Delete
                </button>
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <UpsertArtistModal
                    isAdmin={true}
                    existingArtist={artist}
                    onClose={() => setShowEditModal(false)}
                />
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowDeleteConfirm(false)}
                    />
                    <div className="relative bg-white w-full max-w-[420px] p-8 md:p-10 text-center shadow-2xl flex flex-col items-center">
                        <div className="w-14 h-14 rounded-full bg-red-50 text-brand-red flex items-center justify-center mb-6 border border-red-100">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-bold mb-3">
                            Administrative Action
                        </span>
                        <h2 className="font-display text-[22px] leading-tight text-black mb-4">
                            Remove <span className="text-brand-red">"{artist.full_name}"</span><br />from the directory?
                        </h2>
                        <p className="font-sans text-[13px] text-neutral-500 mb-8 leading-relaxed max-w-[300px]">
                            This will permanently delete this artist's card and all associated data from the database.
                        </p>
                        <div className="grid grid-cols-2 gap-3 w-full">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="border border-neutral-200 py-3.5 font-mono text-[11px] uppercase tracking-widest text-neutral-500 hover:text-black hover:border-black bg-white transition-all cursor-pointer font-bold"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="bg-black text-white hover:bg-brand-red py-3.5 font-mono text-[11px] uppercase tracking-widest transition-all cursor-pointer font-bold disabled:opacity-50"
                            >
                                {isDeleting ? "Deleting..." : "Delete Now"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
