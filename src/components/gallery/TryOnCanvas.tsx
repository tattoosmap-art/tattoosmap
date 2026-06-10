"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Upload, X, Move, Maximize2, RotateCw } from "lucide-react";

interface TryOnCanvasProps {
    tattooOverlayUrl: string; // The transparent PNG of the tattoo
}

export default function TryOnCanvas({ tattooOverlayUrl }: TryOnCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Base Photo State
    const [basePhoto, setBasePhoto] = useState<HTMLImageElement | null>(null);
    const [basePhotoUrl, setBasePhotoUrl] = useState<string | null>(null);

    // Tattoo Overlay State
    const [tattooImg, setTattooImg] = useState<HTMLImageElement | null>(null);
    const [tattooState, setTattooState] = useState({
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0 // in radians
    });

    // Interaction State
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // UI Controls Mode
    const [activeMode, setActiveMode] = useState<'move' | 'scale' | 'rotate'>('move');

    // 1. Load the Tattoo Image
    useEffect(() => {
        const img = new Image();
        img.crossOrigin = 'anonymous'; // Important for downloading canvas later
        img.src = tattooOverlayUrl;
        img.onload = () => {
            setTattooImg(img);
            // Center the tattoo initially based on typical canvas dimensions
            setTattooState(prev => ({
                ...prev,
                x: 200, // Roughly center X 
                y: 200, // Roughly center Y
                scale: Math.min(1, 250 / Math.max(img.width, img.height)) // Initial scaling
            }));
        };
    }, [tattooOverlayUrl]);

    // 2. Main Render Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx || !basePhoto) return;

        // Set dimensions based on base photo ratio, bounded by container width
        const containerWidth = containerRef.current?.clientWidth || 600;
        const ratio = basePhoto.height / basePhoto.width;

        canvas.width = containerWidth;
        canvas.height = containerWidth * ratio;

        // Clear previous frame
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw Base Photo
        ctx.drawImage(basePhoto, 0, 0, canvas.width, canvas.height);

        // Draw Tattoo Overlay
        if (tattooImg) {
            ctx.save();
            // Move to anchor point
            ctx.translate(tattooState.x, tattooState.y);
            // Apply transformations
            ctx.rotate(tattooState.rotation);
            ctx.scale(tattooState.scale, tattooState.scale);

            // Draw centered around the anchor point
            const targetWidth = tattooImg.width;
            const targetHeight = tattooImg.height;
            ctx.drawImage(tattooImg, -targetWidth / 2, -targetHeight / 2, targetWidth, targetHeight);

            ctx.restore();
        }
    }, [basePhoto, tattooImg, tattooState]);

    // Handlers
    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            const img = new Image();
            img.src = url;
            img.onload = () => {
                setBasePhoto(img);
                setBasePhotoUrl(url);
            };
        }
    };

    const clearPhoto = () => {
        setBasePhoto(null);
        if (basePhotoUrl) URL.revokeObjectURL(basePhotoUrl);
        setBasePhotoUrl(null);
    };

    // Canvas Interactions
    const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setIsDragging(true);
        setDragStart({ x, y });
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isDragging) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const dx = mouseX - dragStart.x;
        const dy = mouseY - dragStart.y;

        setTattooState(prev => {
            if (activeMode === 'move') {
                return { ...prev, x: prev.x + dx, y: prev.y + dy };
            }
            else if (activeMode === 'scale') {
                // Moving right/up increases scale, left/down decreases
                const scaleModifier = (dx - dy) * 0.005;
                const newScale = Math.max(0.1, prev.scale + scaleModifier);
                return { ...prev, scale: newScale };
            }
            else if (activeMode === 'rotate') {
                // Complex rotation could use atan2 based on center, but DX is smoother for single touch
                const rotModifier = dx * 0.01;
                return { ...prev, rotation: prev.rotation + rotModifier };
            }
            return prev;
        });

        setDragStart({ x: mouseX, y: mouseY });
    };

    const handlePointerUp = () => {
        setIsDragging(false);
    };

    const downloadPreview = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.toBlob((blob) => {
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.download = `tattoosmap-preview-${Date.now()}.jpg`;
            link.href = url;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(url), 100);
        }, "image/jpeg", 0.9);
    };

    return (
        <div className="w-full max-w-2xl mx-auto bg-off-white rounded-none overflow-hidden border border-gray-light flex flex-col">

            {/* Toolbar Header */}
            <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-light">
                <h3 className="font-display text-[18px] text-black">Try it on</h3>
                {basePhoto && (
                    <button
                        onClick={clearPhoto}
                        className="text-gray-mid hover:text-brand-red transition-colors"
                        aria-label="Clear Photo"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Canvas Area */}
            <div ref={containerRef} className="relative w-full min-h-[400px] flex items-center justify-center bg-gray-50 touch-none">
                {!basePhoto ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                        <Upload className="w-12 h-12 text-gray-mid mb-4" strokeWidth={1} />
                        <p className="text-[14px] text-gray-mid mb-6 max-w-[300px]">
                            Upload a photo of your arm, leg, or body to see how this design looks on you. All processing is private and happens on your device.
                        </p>
                        <label className="cursor-pointer bg-black text-white text-[13px] font-mono tracking-wide uppercase px-8 py-3 rounded-none hover:bg-brand-red transition-colors inline-block">
                            Select Photo
                            <input
                                type="file"
                                accept="image/jpeg, image/png, image/webp"
                                className="hidden"
                                onChange={handlePhotoUpload}
                            />
                        </label>
                    </div>
                ) : (
                    <canvas
                        ref={canvasRef}
                        className="max-w-full h-auto"
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerLeave={handlePointerUp}
                        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                    />
                )}
            </div>

            {/* Controls Dashboard (Only show when editing) */}
            {basePhoto && (
                <div className="bg-white p-6 border-t border-gray-light flex flex-col gap-6">

                    {/* Mode Toggle row */}
                    <div className="flex items-center justify-center gap-2">
                        <button
                            onClick={() => setActiveMode('move')}
                            className={`flex items-center gap-2 px-6 py-2 rounded-none text-[13px] font-medium transition-colors ${activeMode === 'move' ? 'bg-black text-white' : 'bg-off-white text-gray-mid hover:text-black'}`}
                        >
                            <Move className="w-4 h-4" /> Move
                        </button>
                        <button
                            onClick={() => setActiveMode('scale')}
                            className={`flex items-center gap-2 px-6 py-2 rounded-none text-[13px] font-medium transition-colors ${activeMode === 'scale' ? 'bg-black text-white' : 'bg-off-white text-gray-mid hover:text-black'}`}
                        >
                            <Maximize2 className="w-4 h-4" /> Scale
                        </button>
                        <button
                            onClick={() => setActiveMode('rotate')}
                            className={`flex items-center gap-2 px-6 py-2 rounded-none text-[13px] font-medium transition-colors ${activeMode === 'rotate' ? 'bg-black text-white' : 'bg-off-white text-gray-mid hover:text-black'}`}
                        >
                            <RotateCw className="w-4 h-4" /> Rotate
                        </button>
                    </div>

                    <p className="text-center font-mono text-[11px] uppercase tracking-widest text-brand-red">
                        {isDragging ? 'Dragging...' : `Drag on canvas to ${activeMode}`}
                    </p>

                    <button
                        onClick={downloadPreview}
                        className="w-full flex items-center justify-center gap-2 bg-brand-red text-white py-4 rounded-none text-[14px] font-mono tracking-widest uppercase hover:bg-brand-red-dark transition-colors"
                    >
                        <Download className="w-5 h-5" /> Download Preview
                    </button>
                </div>
            )}

        </div>
    );
}
