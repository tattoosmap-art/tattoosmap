"use client";

import { useState } from "react";
import { upsertArtistAction } from "@/actions/admin";
import { X, Plus, Trash2, Upload, ImageIcon } from "lucide-react";

type Artist = {
    id?: string;
    full_name: string;
    avatar_url: string;
    location: string;
    specialty: string;
    bio: string;
    link_url: string;
    portfolio_images: string[];
    contact_email?: string;
    contact_phone?: string;
};

type Props = {
    onClose: () => void;
    existingArtist?: Artist | null;
    isAdmin?: boolean;
};

async function compressImageClientSide(file: File, maxWidth: number, quality: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
        // Bypass client compression entirely for tiny files (< 120 KB)
        if (file.size < 120 * 1024) {
            return resolve(file);
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            const srcStr = event.target?.result as string;
            if (!srcStr) return reject(new Error("Empty target loaded"));
            
            img.src = srcStr;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) return reject(new Error("Canvas 2D unavailable"));

                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) resolve(blob);
                        else reject(new Error("Client-side encoding fault"));
                    },
                    'image/jpeg',
                    quality
                );
            };
            img.onerror = () => reject(new Error("Bitmap parsing fail"));
        };
        reader.onerror = () => reject(new Error("File I/O buffer failure"));
    });
}

export function UpsertArtistModal({ onClose, existingArtist, isAdmin = false }: Props) {
    const isEditing = !!existingArtist?.id;

    // 1. Text Inputs State
    const [form, setForm] = useState({
        full_name: existingArtist?.full_name || "",
        location: existingArtist?.location || "",
        specialty: existingArtist?.specialty || "",
        bio: existingArtist?.bio || "",
        link_url: existingArtist?.link_url || "",
        contact_email: existingArtist?.contact_email || "",
        contact_phone: existingArtist?.contact_phone || "",
    });

    // 2. Avatar File States
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string>(existingArtist?.avatar_url || "");

    // 3. Portfolio Image Array File States
    const [portfolioFiles, setPortfolioFiles] = useState<(File | null)[]>(() => 
        existingArtist?.portfolio_images?.length 
            ? existingArtist.portfolio_images.map(() => null) 
            : [null, null, null]
    );
    const [portfolioPreviews, setPortfolioPreviews] = useState<string[]>(() => 
        existingArtist?.portfolio_images?.length 
            ? [...existingArtist.portfolio_images] 
            : ["", "", ""]
    );

    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState<{ message: string; isError: boolean } | null>(null);

    // Handlers for files
    const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handlePortfolioSelect = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const updatedFiles = [...portfolioFiles];
            updatedFiles[index] = file;
            setPortfolioFiles(updatedFiles);

            const updatedPreviews = [...portfolioPreviews];
            updatedPreviews[index] = URL.createObjectURL(file);
            setPortfolioPreviews(updatedPreviews);
        }
    };

    const addPortfolioSlot = () => {
        setPortfolioFiles([...portfolioFiles, null]);
        setPortfolioPreviews([...portfolioPreviews, ""]);
    };

    const removePortfolioSlot = (index: number) => {
        setPortfolioFiles(portfolioFiles.filter((_, i) => i !== index));
        setPortfolioPreviews(portfolioPreviews.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setToast(null);

        try {
            // Construct multi-part form data
            const formData = new FormData();
            
            if (existingArtist?.id) {
                formData.append("id", existingArtist.id);
            }
            
            formData.append("full_name", form.full_name);
            formData.append("location", form.location);
            formData.append("specialty", form.specialty);
            formData.append("bio", form.bio);
            formData.append("link_url", form.link_url);
            formData.append("contact_email", form.contact_email);
            formData.append("contact_phone", form.contact_phone);

            // 1. Avatar Upload (Compress to 400px max client-side)
            if (avatarFile) {
                try {
                    const compressedBlob = await compressImageClientSide(avatarFile, 400, 0.8);
                    formData.append("avatar_file", compressedBlob, avatarFile.name);
                } catch (err) {
                    console.warn("Client-side avatar optimization failed, fallback to original:", err);
                    formData.append("avatar_file", avatarFile);
                }
            }
            formData.append("existing_avatar_url", existingArtist?.avatar_url || "");

            // 2. Portfolios Upload (Compress to 1000px max client-side)
            formData.append("portfolio_count", portfolioPreviews.length.toString());
            
            for (let i = 0; i < portfolioPreviews.length; i++) {
                const previewUrl = portfolioPreviews[i];
                const file = portfolioFiles[i];

                if (file) {
                    try {
                        const compressedBlob = await compressImageClientSide(file, 1000, 0.82);
                        formData.append(`portfolio_file_${i}`, compressedBlob, file.name);
                    } catch (err) {
                        console.warn(`Client-side portfolio image ${i} optimization failed, fallback to original:`, err);
                        formData.append(`portfolio_file_${i}`, file);
                    }
                }
                
                // Propagate server path reference if reusing old files
                const isServerUrl = previewUrl.startsWith("http") && !previewUrl.includes("blob:");
                formData.append(`existing_portfolio_url_${i}`, isServerUrl ? previewUrl : "");
            }

            const res = await upsertArtistAction(formData);

            if (res.success) {
                const successMsg = isAdmin
                    ? (isEditing ? "Artist profile updated!" : "Artist successfully registered!")
                    : "Application submitted! Awaiting verification.";
                setToast({ message: successMsg, isError: false });
                setTimeout(() => onClose(), 2000);
            } else {
                throw new Error(res.error || "Server failed during upload stream.");
            }
        } catch (err: any) {
            setToast({ message: err.message || "Internal system exception during upload", isError: true });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Form Wrapper with Viewport Boundaries */}
            <form 
                onSubmit={handleSubmit} 
                className="relative bg-white w-full max-w-[560px] max-h-[90vh] md:max-h-[85vh] flex flex-col shadow-2xl shadow-black/25 z-10 overflow-hidden"
            >
                {/* Fixed Header */}
                <div className="flex-shrink-0 flex items-center justify-between px-8 py-5 border-b border-neutral-100 bg-white">
                    <div>
                        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-brand-red font-bold">
                            {isEditing ? "Edit Profile" : (isAdmin ? "Registration" : "Apply for Listing")}
                        </span>
                        <h2 className="font-display text-[22px] text-black mt-0.5 leading-tight">
                            {isEditing ? `Editing Profile` : (isAdmin ? "Add to Directory" : "Directory Application")}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-9 h-9 flex items-center justify-center text-neutral-400 hover:text-black border border-neutral-200 hover:border-black transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Scrollable Central Form Body */}
                <div className="flex-grow overflow-y-auto px-8 py-6 space-y-6">

                    {/* Identity Section */}
                    <div className="space-y-4">
                        <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-neutral-400 font-bold pb-2 border-b border-neutral-100">1. Identity Details</p>
                        <div>
                            <label className="block font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-1.5">Full Name *</label>
                            <input
                                required
                                type="text"
                                value={form.full_name}
                                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                                className="w-full border border-neutral-200 px-4 py-3 font-sans text-[14px] outline-none focus:border-black transition-colors bg-neutral-50/50"
                                placeholder="e.g. Sophie Laurent"
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-1.5">Location *</label>
                                <input
                                    required
                                    type="text"
                                    value={form.location}
                                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                                    className="w-full border border-neutral-200 px-4 py-3 font-sans text-[14px] outline-none focus:border-black transition-colors bg-neutral-50/50"
                                    placeholder="Paris, FR"
                                />
                            </div>
                            <div>
                                <label className="block font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-1.5">Style Specialty *</label>
                                <input
                                    required
                                    type="text"
                                    value={form.specialty}
                                    onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                                    className="w-full border border-neutral-200 px-4 py-3 font-sans text-[14px] outline-none focus:border-black transition-colors bg-neutral-50/50"
                                    placeholder="Fine Line & Botanical"
                                />
                            </div>
                        </div>

                        {/* Avatar Upload Block */}
                        <div>
                            <label className="block font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-1.5">Avatar Picture *</label>
                            <div className="flex items-center gap-4 border border-neutral-200 p-3.5 bg-neutral-50">
                                <div className="relative w-14 h-14 rounded-full bg-neutral-100 border border-neutral-200 flex-shrink-0 overflow-hidden flex items-center justify-center shadow-sm">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <ImageIcon className="w-5 h-5 text-neutral-300" />
                                    )}
                                </div>
                                <div className="flex flex-col gap-1">
                                    <input
                                        id="avatar-input"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarSelect}
                                        className="hidden"
                                        required={!isEditing}
                                    />
                                    <label
                                        htmlFor="avatar-input"
                                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-neutral-300 font-mono text-[9px] uppercase tracking-widest font-bold text-neutral-600 hover:border-black hover:text-black cursor-pointer transition-all shadow-sm"
                                    >
                                        <Upload className="w-3 h-3" />
                                        {avatarPreview ? "Replace Photo" : "Choose File"}
                                    </label>
                                    {avatarFile && <span className="text-[9px] font-mono text-neutral-400">File: {avatarFile.name.substring(0, 20)}...</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* About Section */}
                    <div className="space-y-4">
                        <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-neutral-400 font-bold pb-2 border-b border-neutral-100">2. Contact & Bios</p>
                        <div>
                            <label className="block font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-1.5">Short Bio *</label>
                            <textarea
                                required
                                rows={3}
                                value={form.bio}
                                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                                className="w-full border border-neutral-200 px-4 py-3 font-sans text-[14px] outline-none focus:border-black transition-colors resize-none bg-neutral-50/50"
                                placeholder="Pioneering geometric balance and pointillism..."
                            />
                        </div>
                        <div>
                            <label className="block font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-1.5">Connect Link (IG or Shop URL) *</label>
                            <input
                                required
                                type="url"
                                value={form.link_url}
                                onChange={(e) => setForm({ ...form, link_url: e.target.value })}
                                className="w-full border border-neutral-200 px-4 py-3 font-sans text-[14px] outline-none focus:border-black transition-colors bg-neutral-50/50"
                                placeholder="https://instagram.com/artisthandle"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-1.5">Contact Email *</label>
                                <input
                                    required
                                    type="email"
                                    value={form.contact_email}
                                    onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                                    className="w-full border border-neutral-200 px-4 py-3 font-sans text-[14px] outline-none focus:border-black transition-colors bg-neutral-50/50"
                                    placeholder="artist@email.com"
                                />
                            </div>
                            <div>
                                <label className="block font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-1.5">Contact Phone</label>
                                <input
                                    type="tel"
                                    value={form.contact_phone}
                                    onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                                    className="w-full border border-neutral-200 px-4 py-3 font-sans text-[14px] outline-none focus:border-black transition-colors bg-neutral-50/50"
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Portfolio Images Section */}
                    <div className="space-y-3 pb-2">
                        <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-neutral-400 font-bold pb-2 border-b border-neutral-100">3. Portfolio Uploads (3 images recommended)</p>
                        
                        <div className="grid grid-cols-1 gap-3">
                            {portfolioPreviews.map((previewUrl, i) => (
                                <div key={i} className="flex items-center gap-4 border border-neutral-100 p-3 bg-white shadow-sm group">
                                    <div className="font-mono text-[10px] text-neutral-400 w-4 text-center font-bold">{i + 1}</div>
                                    
                                    <div className="relative w-16 h-16 bg-neutral-100 border border-neutral-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
                                        {previewUrl ? (
                                            <img src={previewUrl} alt={`Portfolio Preview ${i}`} className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon className="w-5 h-5 text-neutral-300" />
                                        )}
                                    </div>

                                    <div className="flex-grow flex flex-col gap-1">
                                        <input
                                            id={`portfolio-input-${i}`}
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handlePortfolioSelect(i, e)}
                                            className="hidden"
                                            required={!isEditing && i < 3}
                                        />
                                        <div className="flex items-center gap-2">
                                            <label
                                                htmlFor={`portfolio-input-${i}`}
                                                className="inline-flex items-center gap-1.5 px-3 py-2 bg-neutral-50 border border-neutral-200 font-mono text-[9px] uppercase tracking-widest font-bold text-neutral-600 hover:border-black hover:text-black hover:bg-white cursor-pointer transition-all"
                                            >
                                                <Upload className="w-3 h-3" />
                                                {previewUrl ? "Replace Image" : "Choose Image"}
                                            </label>

                                            {portfolioPreviews.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removePortfolioSlot(i)}
                                                    className="w-8 h-8 flex items-center justify-center text-neutral-300 hover:text-brand-red transition-colors cursor-pointer shrink-0"
                                                    title="Remove image slot"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                        {portfolioFiles[i] && (
                                            <span className="text-[9px] font-mono text-neutral-400 truncate max-w-[180px]">
                                                File: {portfolioFiles[i]?.name}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={addPortfolioSlot}
                            className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-neutral-400 hover:text-black transition-colors cursor-pointer mt-3 bg-neutral-50 px-4 py-2.5 border border-dashed border-neutral-200 w-full justify-center font-bold"
                        >
                            <Plus className="w-3 h-3" /> Add new image slot
                        </button>
                    </div>
                </div>

                {/* Fixed Form Control Footer */}
                <div className="flex-shrink-0 border-t border-neutral-100 bg-neutral-50 px-8 py-5">
                    {/* Toast Messaging Inline */}
                    {toast && (
                        <div className={`px-4 py-3 mb-4 font-mono text-[11px] uppercase tracking-widest border ${toast.isError ? "bg-red-50 text-red-600 border-red-100" : "bg-green-50 text-green-700 border-green-100"}`}>
                            {toast.message}
                        </div>
                    )}

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 bg-white font-mono text-[11px] uppercase tracking-widest border border-neutral-200 hover:border-black text-neutral-500 hover:text-black transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-8 py-3 font-mono text-[11px] uppercase tracking-widest bg-black text-white hover:bg-brand-red transition-colors disabled:opacity-50 cursor-pointer font-bold shadow-sm hover:shadow-md flex items-center gap-2"
                        >
                            {isSaving ? "Uploading & Saving..." : isEditing ? "Save Changes" : "Complete Upload"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
