"use client";

import { useState, useEffect } from "react";
import { Plus, X, Folder, Check } from "lucide-react";
import { getUserCollections, createCollection, saveDesignToCollection } from "@/actions/collections";
import { useToast } from "@/components/ui/Toast";
import Image from "next/image";

interface CollectionPickerDropdownProps {
    designId: string;
    onClose: () => void;
    onSaved: () => void;
}

export default function CollectionPickerDropdown({ designId, onClose, onSaved }: CollectionPickerDropdownProps) {
    const { showToast } = useToast();
    const [collections, setCollections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newColName, setNewColName] = useState("");
    const [isPublic, setIsPublic] = useState(false);

    useEffect(() => {
        loadCollections();
    }, []);

    const loadCollections = async () => {
        setLoading(true);
        const { data } = await getUserCollections();
        setCollections(data || []);
        setLoading(false);
    };

    const handleCreate = async () => {
        if (!newColName.trim()) return;
        const res = await createCollection(newColName, null, isPublic, designId);
        
        if (res.error) {
            showToast("Failed to create collection");
            return;
        }

        // Successfully created & saved
        const saveRes = await saveDesignToCollection(res.collectionId, designId);
        if (!saveRes.error) {
            showToast(`Saved to ${newColName}`);
            onSaved();
            onClose();
        }
    };

    const handleSaveToExisting = async (colId: string, colName: string) => {
        const res = await saveDesignToCollection(colId, designId);
        if (res.error) {
            showToast(res.error);
        } else if (res.message) {
            showToast(`Already in ${colName}`);
            onClose();
        } else {
            showToast(`Saved to ${colName}`);
            onSaved();
            onClose();
        }
    };

    return (
        <div className="absolute top-full left-0 mt-2 w-full bg-white border border-black shadow-lg z-50 flex flex-col p-4 animate-fade-in-up">
            <div className="flex justify-between items-center mb-4">
                <span className="font-mono text-[11px] uppercase text-gray-mid">Save to Collection</span>
                <button onClick={onClose} aria-label="Close" className="text-gray-mid hover:text-black">
                    <X className="w-4 h-4" />
                </button>
            </div>

            {loading ? (
                <div className="text-[12px] text-gray-mid py-4 text-center">Loading...</div>
            ) : isCreating || collections.length === 0 ? (
                <div className="flex flex-col gap-4">
                    <input 
                        type="text" 
                        placeholder="e.g. Sleeve Ideas, My First Tattoo..." 
                        value={newColName}
                        onChange={(e) => setNewColName(e.target.value)}
                        className="w-full border-b border-gray-light pb-2 text-[14px] bg-transparent focus:outline-none focus:border-black rounded-none"
                        autoFocus
                    />
                    <label className="flex items-center gap-2 cursor-pointer text-[12px] text-gray-mid">
                        <input 
                            type="checkbox" 
                            checked={isPublic} 
                            onChange={(e) => setIsPublic(e.target.checked)}
                            className="accent-black rounded-none"
                        />
                        Make this public
                    </label>
                    <button 
                        onClick={handleCreate}
                        disabled={!newColName.trim()}
                        className="w-full bg-black text-white text-[12px] font-mono uppercase py-3 hover:bg-brand-red transition-colors disabled:opacity-50"
                    >
                        Create & Save
                    </button>
                </div>
            ) : (
                <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto no-scrollbar">
                    {collections.map(col => {
                        const hasSaved = col.design_ids?.includes(designId);
                        return (
                            <button 
                                key={col.id} 
                                onClick={() => handleSaveToExisting(col.id, col.name)}
                                className="flex items-center justify-between p-3 border border-gray-light hover:border-black transition-colors text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <Folder className="w-4 h-4 text-gray-mid" />
                                    <span className="text-[13px] text-black font-medium">{col.name}</span>
                                </div>
                                {hasSaved && <Check className="w-4 h-4 text-brand-red" />}
                            </button>
                        );
                    })}
                    <button 
                        onClick={() => setIsCreating(true)}
                        className="flex items-center justify-center gap-2 mt-2 p-3 border border-dashed border-gray-light hover:border-black text-[12px] font-mono uppercase text-gray-mid hover:text-black transition-colors"
                    >
                        <Plus className="w-3 h-3" /> New Collection
                    </button>
                </div>
            )}
        </div>
    );
}
