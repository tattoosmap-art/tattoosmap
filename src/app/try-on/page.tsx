"use client";

import React, { useState, useRef, useCallback, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft, Upload, Download, RotateCcw,
  Sliders, Move, Image as ImageIcon,
  CheckCircle, Loader2, X,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────
interface PlacementState {
  x: number;        // natural image pixels
  y: number;
  width: number;
  height: number;
  rotation: number;
}
interface CompositorOptions {
  opacity: number;
  featherRadius: number;
}
type Stage = "upload" | "place" | "processing" | "result";

function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }

// ─────────────────────────────────────────────────────────────
// SECTION LABEL
// ─────────────────────────────────────────────────────────────
function SectionLabel({ color = "text-brand-red", children }: { color?: string; children: React.ReactNode }) {
  return <span className={`font-mono text-[10px] uppercase tracking-[0.3em] font-bold ${color}`}>{children}</span>;
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-400">{label}</span>
      <span className="font-mono text-[13px] font-bold text-white tabular-nums">{value}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// RANGE SLIDER — smooth, instant response
// Uses a local ref to update the visual track without a React
// re-render on every tick. React state only commits on mouseup.
// ─────────────────────────────────────────────────────────────
function RangeSlider({ label, sublabel, value, min, max, step, onChange, formatValue }: {
  label: string; sublabel?: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; formatValue?: (v: number) => string;
}) {
  const fillRef   = useRef<HTMLDivElement>(null);
  const thumbRef  = useRef<HTMLDivElement>(null);
  const valueRef  = useRef<HTMLSpanElement>(null);
  const localVal  = useRef(value);

  // Sync refs when external value changes (e.g. preset buttons)
  useEffect(() => {
    localVal.current = value;
    const pct = ((value - min) / (max - min)) * 100;
    if (fillRef.current)  fillRef.current.style.width  = `${pct}%`;
    if (thumbRef.current) thumbRef.current.style.left  = `${pct}%`;
    if (valueRef.current) valueRef.current.textContent = formatValue ? formatValue(value) : String(value);
  }, [value, min, max, formatValue]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    localVal.current = v;
    const pct = ((v - min) / (max - min)) * 100;
    // Directly mutate DOM — zero React render overhead
    if (fillRef.current)  fillRef.current.style.width  = `${pct}%`;
    if (thumbRef.current) thumbRef.current.style.left  = `${pct}%`;
    if (valueRef.current) valueRef.current.textContent = formatValue ? formatValue(v) : String(v);
    onChange(v); // still call onChange for live CSS preview (fast because TattooPreview is memo'd)
  };

  const initPct = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-baseline">
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-[12px] uppercase tracking-[0.15em] text-black font-bold">{label}</span>
          {sublabel && <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">{sublabel}</span>}
        </div>
        <span ref={valueRef} className="font-mono text-[14px] font-bold text-black tabular-nums min-w-[48px] text-right">
          {formatValue ? formatValue(value) : value}
        </span>
      </div>
      <div className="relative h-[5px] bg-neutral-200 rounded-none">
        <div ref={fillRef} className="absolute h-[5px] bg-black left-0 pointer-events-none" style={{ width: `${initPct}%` }} />
        <input
          type="range" min={min} max={max} step={step} defaultValue={value}
          onInput={handleInput as unknown as React.FormEventHandler<HTMLInputElement>}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
          style={{ height: "28px", top: "-11px", position: "absolute" }}
        />
        <div
          ref={thumbRef}
          className="absolute w-5 h-5 bg-black border-2 border-white shadow-md -translate-x-1/2 -translate-y-1/2 top-1/2 pointer-events-none"
          style={{ left: `${initPct}%` }}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DROPZONE
// ─────────────────────────────────────────────────────────────
function Dropzone({ label, sublabel, accept, onFile, onClear, preview, id }: {
  label: string; sublabel: string; accept: string;
  onFile: (f: File) => void; onClear: () => void; preview: string | null; id: string;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0]; if (f) onFile(f);
  }, [onFile]);

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (inputRef.current) inputRef.current.value = "";
    onClear();
  };

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`relative border-2 transition-all duration-150 cursor-pointer group
        ${dragging ? "border-black bg-neutral-50" : "border-dashed border-neutral-300 hover:border-black"}
        ${preview ? "border-solid border-neutral-200" : ""}`}
    >
      <label htmlFor={id} className="cursor-pointer block">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt={label} className="w-full h-48 object-contain bg-neutral-50 p-2" />
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 py-10 px-6">
            <ImageIcon className="w-6 h-6 text-neutral-300 group-hover:text-black transition-colors" />
            <div className="text-center">
              <span className="block font-mono text-[11px] uppercase tracking-[0.2em] text-black font-bold">{label}</span>
              <span className="block font-mono text-[9px] uppercase tracking-wider text-neutral-400 mt-1">{sublabel}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Upload className="w-3 h-3 text-neutral-400" />
              <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-wider">Drop or click</span>
            </div>
          </div>
        )}
      </label>
      <input ref={inputRef} id={id} type="file" accept={accept} className="sr-only"
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      {/* Status + clear button */}
      {preview ? (
        <div className="absolute top-2 right-2 flex items-center gap-1.5">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          <button
            onClick={handleClear}
            title="Remove image"
            className="w-5 h-5 bg-black text-white flex items-center justify-center hover:bg-brand-red transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : null}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CSS-POWERED TATTOO PREVIEW
// ─────────────────────────────────────────────────────────────
const TattooPreview = React.memo(function TattooPreview({
  bodyPhoto, tattooDesign, placement, options, onPlacementChange,
}: {
  bodyPhoto: string; tattooDesign: string;
  placement: PlacementState; options: CompositorOptions;
  onPlacementChange: (p: PlacementState) => void;
}) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const natW          = useRef(1);
  const isDragging    = useRef(false);
  const isResizing    = useRef(false);
  const isPanning     = useRef(false);

  // ── Multi-touch refs for mobile pinch/rotate ───────────────
  const isMultiTouching = useRef(false);
  const touchStartDist  = useRef(0);
  const touchStartAngle = useRef(0);
  const touchStartPlacement = useRef({ x: 0, y: 0, width: 0, height: 0, rotation: 0 });

  // ── Scale as state so overlay re-renders on load/resize ───
  const [scale, setScale] = useState(1);

  const updateScale = useCallback(() => {
    const el = containerRef.current;
    if (!el || natW.current === 1) return;
    setScale(el.clientWidth / natW.current);
  }, []);

  const handleBodyLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    natW.current = img.naturalWidth;
    updateScale();
  };

  const handleTattooLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth && img.naturalHeight) {
      const aspect = img.naturalWidth / img.naturalHeight;
      const currentAspect = placement.width / placement.height;
      if (Math.abs(currentAspect - aspect) > 0.01) {
        onPlacementChange({
          ...placement,
          height: Math.round(placement.width / aspect),
        });
      }
    }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(updateScale);
    ro.observe(el);
    return () => ro.disconnect();
  }, [updateScale]);

  // ── Pan offset lives in state so translate re-renders ─────
  const panOffsetRef = useRef({ x: 0, y: 0 });
  const panStart     = useRef({ mx: 0, my: 0, ox: 0, oy: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [cursor, setCursor]       = useState<"grab" | "grabbing">("grab");

  // ── Drag start refs ────────────────────────────────────────
  const dragStart = useRef({ mx: 0, my: 0, px: 0, py: 0, pw: 0, ph: 0 });

  const startDrag = (e: React.PointerEvent) => {
    if (isMultiTouching.current) return;
    e.preventDefault(); e.stopPropagation();
    isDragging.current = true;
    dragStart.current = { mx: e.clientX, my: e.clientY, px: placement.x, py: placement.y, pw: placement.width, ph: placement.height };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {
      console.warn("setPointerCapture failed", err);
    }
  };
  const startResize = (e: React.PointerEvent) => {
    if (isMultiTouching.current) return;
    e.preventDefault(); e.stopPropagation();
    isResizing.current = true;
    dragStart.current = { mx: e.clientX, my: e.clientY, px: placement.x, py: placement.y, pw: placement.width, ph: placement.height };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {
      console.warn("setPointerCapture failed", err);
    }
  };

  // Pan fires on the background — NOT the tattoo box (stopPropagation above handles that)
  const startPan = (e: React.PointerEvent) => {
    if (isDragging.current || isResizing.current || isMultiTouching.current) return;
    isPanning.current = true;
    setCursor("grabbing");
    panStart.current = {
      mx: e.clientX,
      my: e.clientY,
      ox: panOffsetRef.current.x,
      oy: panOffsetRef.current.y,
    };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {
      console.warn("setPointerCapture failed", err);
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (isMultiTouching.current) return;
    if (isPanning.current) {
      const newX = panStart.current.ox + (e.clientX - panStart.current.mx);
      const newY = panStart.current.oy + (e.clientY - panStart.current.my);
      panOffsetRef.current = { x: newX, y: newY };
      setPanOffset({ x: newX, y: newY });
      return;
    }
    if (!isDragging.current && !isResizing.current) return;
    const dx = (e.clientX - dragStart.current.mx) / scale;
    const dy = (e.clientY - dragStart.current.my) / scale;
    if (isDragging.current) {
      onPlacementChange({
        ...placement,
        x: Math.round(clamp(dragStart.current.px + dx, 0, natW.current - placement.width)),
        y: Math.round(clamp(dragStart.current.py + dy, 0, (natW.current * 1.5) - placement.height)),
      });
    } else {
      const aspect = dragStart.current.pw / dragStart.current.ph;
      const newWidth = Math.round(Math.max(40, dragStart.current.pw + dx));
      const newHeight = Math.round(newWidth / aspect);
      onPlacementChange({
        ...placement,
        width:  newWidth,
        height: newHeight,
      });
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (isDragging.current || isResizing.current || isPanning.current) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (err) {
        // Safe to ignore
      }
    }
    isDragging.current = false;
    isResizing.current = false;
    isPanning.current  = false;
    setCursor("grab");
  };

  // ── Touch Gesture Handlers for Mobile ──────────────────────
  const startTouchGesture = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      isMultiTouching.current = true;
      isPanning.current = false;
      isDragging.current = false;
      isResizing.current = false;
      setCursor("grab");

      const t1 = e.touches[0];
      const t2 = e.touches[1];

      const dx = t2.clientX - t1.clientX;
      const dy = t2.clientY - t1.clientY;

      touchStartDist.current = Math.hypot(dx, dy);
      touchStartAngle.current = Math.atan2(dy, dx) * 180 / Math.PI;

      touchStartPlacement.current = {
        x: placement.x,
        y: placement.y,
        width: placement.width,
        height: placement.height,
        rotation: placement.rotation,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isMultiTouching.current && e.touches.length === 2) {
      if (e.cancelable) {
        e.preventDefault();
      }

      const t1 = e.touches[0];
      const t2 = e.touches[1];

      const dx = t2.clientX - t1.clientX;
      const dy = t2.clientY - t1.clientY;

      const currentDist = Math.hypot(dx, dy);
      const currentAngle = Math.atan2(dy, dx) * 180 / Math.PI;

      if (touchStartDist.current === 0) return;
      const scaleFactor = currentDist / touchStartDist.current;

      let deltaAngle = currentAngle - touchStartAngle.current;
      if (deltaAngle > 180) deltaAngle -= 360;
      if (deltaAngle < -180) deltaAngle += 360;

      const newRotation = touchStartPlacement.current.rotation + deltaAngle;
      let wrappedRotation = Math.round(newRotation) % 360;
      if (wrappedRotation > 180) wrappedRotation -= 360;
      if (wrappedRotation < -180) wrappedRotation += 360;

      const newWidth = Math.round(Math.max(40, touchStartPlacement.current.width * scaleFactor));
      const newHeight = Math.round(Math.max(40, touchStartPlacement.current.height * scaleFactor));

      const dw = newWidth - touchStartPlacement.current.width;
      const dh = newHeight - touchStartPlacement.current.height;

      const newX = Math.round(clamp(touchStartPlacement.current.x - dw / 2, 0, natW.current - newWidth));
      const newY = Math.round(clamp(touchStartPlacement.current.y - dh / 2, 0, (natW.current * 1.5) - newHeight));

      onPlacementChange({
        ...placement,
        width: newWidth,
        height: newHeight,
        rotation: wrappedRotation,
        x: newX,
        y: newY,
      });
    }
  };

  const endTouchGesture = (e: React.TouchEvent) => {
    if (isMultiTouching.current && e.touches.length < 2) {
      isMultiTouching.current = false;
    }
  };

  // ── CSS positions (display pixels) ────────────────────────
  const cssLeft   = placement.x      * scale;
  const cssTop    = placement.y      * scale;
  const cssWidth  = placement.width  * scale;
  const cssHeight = placement.height * scale;

  return (
    <div
      ref={containerRef}
      className="relative w-full select-none overflow-hidden"
      style={{ cursor, touchAction: 'none' }}
      onPointerDown={startPan}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerLeave={onPointerUp}
      onTouchStart={startTouchGesture}
      onTouchMove={handleTouchMove}
      onTouchEnd={endTouchGesture}
      onTouchCancel={endTouchGesture}
    >
      {/* ── Inner canvas: translate for panning ─────────────── */}
      <div style={{ transform: `translate(${panOffset.x}px, ${panOffset.y}px)`, willChange: 'transform', position: 'relative' }}>
        {/* ── Body photo ─────────────────────────────────────── */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={bodyPhoto} alt="Body photo"
          className="w-full h-auto block"
          onLoad={handleBodyLoad}
          draggable={false}
        />

        {/* ── Tattoo overlay (CSS multiply — instant, no canvas) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={tattooDesign} alt="Tattoo design"
          draggable={false}
          onLoad={handleTattooLoad}
          style={{
            position:        "absolute",
            left:            cssLeft,
            top:             cssTop,
            width:           cssWidth,
            height:          cssHeight,
            objectFit:       "contain",
            mixBlendMode:    "multiply",
            opacity:         options.opacity,
            transform:       `rotate(${placement.rotation}deg)`,
            transformOrigin: "center",
            pointerEvents:   "none",
            userSelect:      "none",
          }}
        />

        {/* ── Bounding box + drag handle ─────────────────────── */}
        <div
          className="absolute border-2 border-brand-red pointer-events-auto cursor-grab active:cursor-grabbing"
          style={{
            left:            cssLeft,
            top:             cssTop,
            width:           cssWidth,
            height:          cssHeight,
            transform:       `rotate(${placement.rotation}deg)`,
            transformOrigin: "center",
            touchAction:     "none",
          }}
          onPointerDown={startDrag}
        >
          {/* Zone label */}
          <div className="absolute -top-7 left-0 bg-brand-red text-white font-mono text-[8px] uppercase tracking-widest px-2 py-1 whitespace-nowrap pointer-events-none">
            Drag to Move
          </div>
          {/* Corner squares */}
          <div className="absolute -top-2    -left-2   w-3.5 h-3.5 bg-brand-red pointer-events-none" />
          <div className="absolute -top-2    -right-2  w-3.5 h-3.5 bg-brand-red pointer-events-none" />
          <div className="absolute -bottom-2 -left-2   w-3.5 h-3.5 bg-brand-red pointer-events-none" />
          {/* SE resize — larger hit target */}
          <div
            className="absolute -bottom-4 -right-4 w-9 h-9 bg-brand-red hover:bg-black transition-colors cursor-se-resize z-10 flex items-center justify-center border border-white shadow-md"
            onPointerDown={startResize}
            style={{ touchAction: "none" }}
            title="Drag to resize"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" className="text-white select-none pointer-events-none">
              <line x1="6" y1="6" x2="18" y2="18" />
              <path d="M6 11V6h5" />
              <path d="M18 13v5h-5" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────
// TRY-ON STUDIO CONTENT
// ─────────────────────────────────────────────────────────────
function TryOnContent() {
  const searchParams = useSearchParams();
  const [stage, setStage]               = useState<Stage>("upload");
  const [bodyPhoto, setBodyPhoto]       = useState<string | null>(null);
  const [tattooDesign, setTattooDesign] = useState<string | null>(null);
  const [bodyFile, setBodyFile]         = useState<File | null>(null);
  const [tattooFile, setTattooFile]     = useState<File | null>(null);
  const [result, setResult]             = useState<string | null>(null);
  const [error, setError]               = useState<string | null>(null);

  const [placement, setPlacement] = useState<PlacementState>({
    x: 300, y: 200, width: 250, height: 350, rotation: 0,
  });
  const [options, setOptions] = useState<CompositorOptions>({
    opacity: 0.85, featherRadius: 0.5,
  });
  const previewAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (stage === "place") {
      const timer = setTimeout(() => {
        previewAreaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  const [flipState, setFlipState] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => {
      setFlipState(prev => !prev);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleBodyPhoto = (file: File) => {
    setBodyFile(file);
    const url = URL.createObjectURL(file);
    setBodyPhoto(url);
    const img = new Image();
    img.onload = () => {
      setPlacement({
        x:        Math.round(img.naturalWidth  * 0.5),
        y:        Math.round(img.naturalHeight * 0.25),
        width:    Math.round(img.naturalWidth  * 0.28),
        height:   Math.round(img.naturalHeight * 0.5),
        rotation: 0,
      });
    };
    img.src = url;
  };

  const handleTattooDesign = (file: File) => {
    setTattooFile(file);
    setTattooDesign(URL.createObjectURL(file));
  };

  const canProceed = bodyPhoto && tattooDesign;

  const handleApply = async () => {
    if (!bodyFile || !tattooFile || !canProceed) return;
    setStage("processing"); setError(null);
    try {
      const fd = new FormData();
      fd.append("bodyPhoto",    bodyFile);
      fd.append("tattooDesign", tattooFile);
      fd.append("placement",    JSON.stringify(placement));
      fd.append("options",      JSON.stringify(options));
      const res = await fetch("/api/try-on/composite", { method: "POST", body: fd });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || "Compositor failed"); }
      setResult(URL.createObjectURL(await res.blob()));
      setStage("result");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setStage("place");
    }
  };

  const handleReset = () => {
    setStage("upload"); setBodyPhoto(null); setTattooDesign(null);
    setBodyFile(null); setTattooFile(null); setResult(null); setError(null);
  };

  // Automatically load the design from the URL parameter if present
  useEffect(() => {
    const designUrl = searchParams.get('design');
    if (designUrl && !tattooDesign && !tattooFile) {
      setTattooDesign(designUrl);
      fetch(designUrl)
        .then(res => res.blob())
        .then(blob => {
          const mimeType = blob.type || "image/png";
          const file = new File([blob], "design.png", { type: mimeType });
          setTattooFile(file);
        })
        .catch(err => console.error("Could not fetch preset design:", err));
    }
  }, [searchParams, tattooDesign, tattooFile]);

  useEffect(() => {
    if (bodyPhoto && tattooDesign && stage === "upload") setStage("place");
  }, [bodyPhoto, tattooDesign, stage]);

  return (
    <div className="w-full min-h-screen bg-white">

      {/* ── STATUS BAR ─────────────────────────────────────── */}
      <div className="w-full bg-black text-white py-3 px-6 relative flex items-center justify-center min-h-[40px] border-b border-neutral-900 overflow-hidden">
        
        {/* Center segment: Perfectly Centered sliding ticker (MD and up) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block">
          <div className="relative h-5 w-[360px] overflow-hidden">
            {/* Slide 1 */}
            <div 
              className="absolute inset-0 flex items-center justify-center font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-400 transition-all duration-700 ease-in-out whitespace-nowrap"
              style={{
                opacity: flipState ? 0 : 1,
                transform: flipState ? 'translateY(100%)' : 'translateY(0%)',
                pointerEvents: flipState ? 'none' : 'auto'
              }}
            >
              TATTOO TRY-ON — 100% FREE & INSTANT
            </div>
            {/* Slide 2 */}
            <div 
              className="absolute inset-0 flex items-center justify-center font-mono text-[10px] tracking-[0.3em] text-neutral-400 transition-all duration-700 ease-in-out whitespace-nowrap"
              style={{
                opacity: flipState ? 1 : 0,
                transform: flipState ? 'translateY(0%)' : 'translateY(-100%)',
                pointerEvents: flipState ? 'auto' : 'none'
              }}
            >
              𝕿𝖆𝖙𝖙𝖔𝖔𝖘𝖒𝖆𝖕 - 𝓑𝓮 𝓾𝓷𝓲𝓺𝓾𝓮
            </div>
          </div>
        </div>

        {/* Center segment: Perfectly Centered sliding ticker (Mobile) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:hidden">
          <div className="relative h-5 w-[200px] overflow-hidden">
            {/* Slide 1 */}
            <div 
              className="absolute inset-0 flex items-center justify-center font-mono text-[8px] uppercase tracking-[0.2em] text-neutral-400 transition-all duration-700 ease-in-out whitespace-nowrap"
              style={{
                opacity: flipState ? 0 : 1,
                transform: flipState ? 'translateY(100%)' : 'translateY(0%)',
                pointerEvents: flipState ? 'none' : 'auto'
              }}
            >
              100% FREE & INSTANT
            </div>
            {/* Slide 2 */}
            <div 
              className="absolute inset-0 flex items-center justify-center font-mono text-[8px] tracking-[0.2em] text-neutral-400 transition-all duration-700 ease-in-out whitespace-nowrap"
              style={{
                opacity: flipState ? 1 : 0,
                transform: flipState ? 'translateY(0%)' : 'translateY(-100%)',
                pointerEvents: flipState ? 'auto' : 'none'
              }}
            >
              𝕿𝖆𝖙𝖙𝖔𝖔𝖘𝖒𝖆𝖕 - 𝓑𝓮 𝓾𝓷𝓲𝓺𝓾𝓮
            </div>
          </div>
        </div>

      </div>

      {/* ── STICKY NAV ─────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200 px-4 md:px-8 py-4 flex items-center gap-4">
        <Link href="/gallery" className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-200 text-[11px] font-mono uppercase tracking-widest text-black hover:bg-black hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Gallery
        </Link>
        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-neutral-400">/ Try-On Studio</span>
        {stage !== "upload" && (
          <button onClick={handleReset} className="ml-auto inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-neutral-500 hover:text-black transition-colors">
            <RotateCcw className="w-3 h-3" /> Start Over
          </button>
        )}
      </div>

      <main className={`max-w-[1400px] mx-auto px-4 md:px-8 flex flex-col ${stage === 'upload' ? 'py-12 gap-12' : 'py-6 gap-6'}`}>

        {/* ── HERO — only shown on upload stage ─────────────── */}
        {stage === "upload" && (
          <div className="flex flex-col gap-4 border-b-[6px] border-black pb-10">
            <SectionLabel>TattoosMap · Try-On Studio</SectionLabel>
            <h1 className="font-display text-[52px] md:text-[72px] leading-none text-black">See It<br />On Skin.</h1>
            <p className="font-mono text-[13px] text-neutral-500 max-w-[500px] leading-relaxed">
              Upload your photo and a tattoo design. Our Stencil Compositor places the exact design
              onto your skin — no AI hallucination, 100% design fidelity.
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {["Multiply Blend Ink", "White BG Removal", "Gaussian Feathering", "Pixel Integrity Check", "Instant Preview"].map(t => (
                <span key={t} className="font-mono text-[9px] uppercase tracking-tight border border-neutral-200 text-neutral-400 px-2.5 py-1">{t}</span>
              ))}
            </div>
          </div>
        )}

        {/* ── STAGE: UPLOAD ──────────────────────────────────── */}
        {stage === "upload" && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4">
              <SectionLabel>Step 01</SectionLabel>
              <h2 className="font-display text-[40px] leading-none text-black mt-2 mb-4">Upload<br />Assets</h2>
              <p className="font-mono text-[12px] text-neutral-500 leading-relaxed">
                Upload the body photo and a tattoo design PNG. White backgrounds are removed automatically.
                Both files stay in your browser until you click Apply.
              </p>
            </div>
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold">Body Photo</span>
                <Dropzone id="body-upload" label="Upload Photo" sublabel="JPG · PNG · WEBP"
                  accept="image/jpeg,image/png,image/webp" onFile={handleBodyPhoto}
                  onClear={() => { setBodyPhoto(null); setBodyFile(null); }}
                  preview={bodyPhoto} />
              </div>
              <div className="flex flex-col gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold">Tattoo Design</span>
                <Dropzone id="tattoo-upload" label="Upload Design" sublabel="PNG preferred · White BG ok"
                  accept="image/png,image/jpeg,image/webp" onFile={handleTattooDesign}
                  onClear={() => { setTattooDesign(null); setTattooFile(null); }}
                  preview={tattooDesign} />
              </div>
              {bodyPhoto && !tattooDesign && (
                <div className="md:col-span-2 flex items-center gap-3 bg-neutral-50 border border-neutral-200 px-4 py-3">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span className="font-mono text-[11px] text-neutral-600">Photo loaded. Now upload a tattoo design to proceed.</span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── STAGE: PLACE / PROCESSING / RESULT ─────────────── */}
        {(stage === "place" || stage === "processing" || stage === "result") && bodyPhoto && tattooDesign && (
          <section className="flex flex-col lg:flex-row gap-8 items-start relative">

            {/* ── LEFT: PREVIEW AREA (Flexible) ──────────────── */}
            <div ref={previewAreaRef} className="flex-1 w-full min-w-0 scroll-mt-20">
              <div className="flex flex-col shadow-sm border border-neutral-200 bg-neutral-50 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 bg-white">
                  <div className="flex flex-col gap-0.5">
                    <SectionLabel>{stage === "result" ? "Step 03 — Processed Result" : "Step 02 — Live Preview"}</SectionLabel>
                    <p className="font-mono text-[9px] text-neutral-400">
                      {stage === "result"
                        ? "Stencil Compositor · Multiply blend · Feathering"
                        : "Drag to move · Bottom‑right ↘ corner to resize"}
                    </p>
                  </div>
                  {stage === "place" && (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-neutral-950 rounded text-white">
                      <div className="w-1.5 h-1.5 bg-brand-red rounded-full animate-pulse" />
                      <span className="font-mono text-[8px] uppercase tracking-widest">Live Engine</span>
                    </div>
                  )}
                </div>

                {/* THE PREVIEW CONTAINER */}
                <div className="relative overflow-hidden flex items-center justify-center p-4 bg-[radial-gradient(#e5e5e5_1px,transparent_1px)] [background-size:16px_16px]" style={{ minHeight: '520px', maxHeight: '70vh' }}>
                  <div className="w-full max-w-2xl bg-white shadow-2xl border border-neutral-200">
                    {stage === "result" && result ? (
                      /* Render at full native resolution — no CSS downscaling to preserve sharpness */
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={result} alt="Tattoo try-on result" className="w-full h-auto block" style={{ imageRendering: 'auto' }} />
                    ) : (
                      <TattooPreview
                        bodyPhoto={bodyPhoto}
                        tattooDesign={tattooDesign}
                        placement={placement}
                        options={options}
                        onPlacementChange={setPlacement}
                      />
                    )}
                  </div>
                </div>

                {/* Footer stats */}
                {stage === "place" && (
                  <div className="grid grid-cols-4 divide-x divide-neutral-800 bg-neutral-950 px-4 py-2">
                    <Stat label="X" value={`${placement.x}px`} />
                    <Stat label="Y" value={`${placement.y}px`} />
                    <Stat label="Size" value={`${placement.width}×${placement.height}`} />
                    <Stat label="Rotate" value={`${placement.rotation}°`} />
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-3 bg-red-50 border-l-4 border-brand-red px-4 py-3 mt-4">
                  <X className="w-4 h-4 text-brand-red flex-shrink-0 mt-0.5" />
                  <p className="font-mono text-[11px] text-red-900">{error}</p>
                </div>
              )}

              {/* Result actions */}
              {stage === "result" && result && (
                <div className="flex flex-col gap-3 mt-4">
                  <div className="flex gap-3">
                    <button 
                      onClick={() => {
                        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                        if (isMobile) {
                          // Mobile download action fallback
                          const newTab = window.open();
                          if (newTab) {
                            newTab.document.write(`
                              <html>
                                <body style="margin:0;background:#000;display:flex;flex-direction:column;align-items:center;justify-center;height:100vh;font-family:sans-serif;color:#fff;text-align:center;padding:20px;">
                                  <p style="margin:20px 0;font-size:14px;letter-spacing:1px;text-transform:uppercase;">Hold down the image below to save it</p>
                                  <img src="${result}" style="max-width:100%;max-height:80vh;object-fit:contain;" />
                                  <button onclick="window.close()" style="margin-top:20px;background:#e24b4a;color:#fff;border:none;padding:12px 24px;font-size:12px;text-transform:uppercase;letter-spacing:1px;cursor:pointer;">Go Back</button>
                                </body>
                              </html>
                            `);
                          } else {
                            window.location.href = result;
                          }
                        } else {
                          const link = document.createElement("a");
                          link.href = result;
                          link.download = "tattoo-tryOn.jpg";
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }
                      }}
                      className="flex-1 py-4 font-mono text-[12px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 bg-black text-white hover:bg-neutral-800 transition-colors shadow-lg"
                    >
                      <Download className="w-4 h-4" /> Download Result
                    </button>
                    <button onClick={() => setStage("place")}
                      className="px-8 py-4 font-mono text-[11px] uppercase tracking-[0.15em] border-2 border-black text-black hover:bg-black hover:text-white transition-colors">
                      Adjust
                    </button>
                  </div>
                  <p className="font-mono text-[9px] text-neutral-400 text-center uppercase tracking-widest leading-relaxed">
                    Tip: On phone, click "Download" and press & hold the image to save directly to photos.
                  </p>
                </div>
              )}
            </div>

            {/* ── RIGHT: SIDEBAR CONTROLS (Sticky) ───────────── */}
            <div className="w-full lg:w-[380px] shrink-0 sticky top-[80px] flex flex-col gap-4">
              
              {/* Placement Sidebar Card */}
              {stage === "place" && (
                <div className="flex flex-col gap-5 bg-white border border-neutral-200 p-5 shadow-sm">
                  <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
                    <Move className="w-3.5 h-3.5 text-brand-red" />
                    <SectionLabel>Placement</SectionLabel>
                  </div>
                  
                  <RangeSlider label="Rotation" 
                    value={placement.rotation} min={-180} max={180} step={1}
                    onChange={v => setPlacement(p => ({ ...p, rotation: v }))}
                    formatValue={v => `${v}°`} />
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <RangeSlider label="Width"
                      value={placement.width} min={40} max={2500} step={5}
                      onChange={v => setPlacement(p => {
                        const aspect = p.width / p.height;
                        return { ...p, width: v, height: Math.round(v / aspect) };
                      })}
                      formatValue={v => `${v}px`} />
                    <RangeSlider label="Height"
                      value={placement.height} min={40} max={2500} step={5}
                      onChange={v => setPlacement(p => {
                        const aspect = p.width / p.height;
                        return { ...p, height: v, width: Math.round(v * aspect) };
                      })}
                      formatValue={v => `${v}px`} />
                  </div>
                </div>
              )}

              {/* Ink Settings Sidebar Card */}
              {stage === "place" && (
                <div className="flex flex-col gap-5 bg-white border border-neutral-200 p-5 shadow-sm">
                  <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
                    <Sliders className="w-3.5 h-3.5 text-brand-red" />
                    <SectionLabel>Ink Intensity</SectionLabel>
                  </div>
                  <RangeSlider label="Opacity"
                    value={options.opacity} min={0.3} max={1.0} step={0.01}
                    onChange={v => setOptions(o => ({ ...o, opacity: v }))}
                    formatValue={v => `${Math.round(v * 100)}%`} />
                  
                  <div className="flex gap-1.5">
                    {[{ label: "Fresh", value: 0.92 }, { label: "Healed", value: 0.82 }, { label: "Faded", value: 0.65 }].map(p => (
                      <button key={p.label}
                        onClick={() => setOptions(o => ({ ...o, opacity: p.value }))}
                        className={`flex-1 py-1.5 font-mono text-[9px] uppercase tracking-wider transition-all ${
                          Math.abs(options.opacity - p.value) < 0.03
                            ? "bg-black text-white"
                            : "bg-neutral-50 border border-neutral-200 text-neutral-500 hover:border-black hover:text-black"}`}>
                        {p.label}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-dotted border-neutral-200">
                    <RangeSlider label="Feathering" sublabel="Softens edges for realism"
                      value={options.featherRadius} min={0} max={8} step={0.1}
                      onChange={v => setOptions(o => ({ ...o, featherRadius: v }))}
                      formatValue={v => `${v}px`} />
                  </div>
                </div>
              )}

              {/* Apply Button */}
              {stage === "place" && (
                <button onClick={handleApply} disabled={!canProceed}
                  className="w-full py-5 bg-black text-white font-mono text-[13px] uppercase tracking-[0.25em] flex items-center justify-center gap-3 hover:bg-neutral-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed border-b-4 border-brand-red shadow-lg active:translate-y-0.5">
                  Generate Composite →
                </button>
              )}

              {/* Processing state */}
              {stage === "processing" && (
                <div className="flex flex-col gap-4 bg-white border border-neutral-200 p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-brand-red" />
                    <SectionLabel>Computing Stencil</SectionLabel>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {["Extracting Alpha","Applying Multiply Blend","Gaussian Smoothing","Verifying Pixels"].map(step => (
                      <div key={step} className="flex items-center gap-2">
                        <Loader2 className="w-2.5 h-2.5 animate-spin text-neutral-200 flex-shrink-0" />
                        <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-widest">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Side Guarantees */}
              <div className="flex flex-col gap-3 border border-neutral-100 p-4 bg-neutral-50/50">
                <SectionLabel color="text-neutral-400">Security & Integrity</SectionLabel>
                <div className="flex flex-col gap-2">
                  {["100% Design Fidelity", "No AI Hallucination", "Local Pixel Verification"].map(g => (
                    <div key={g} className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                      <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider">{g}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={handleReset}
                className="inline-flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-widest text-neutral-400 hover:text-black transition-colors py-2 border border-neutral-100 hover:border-neutral-200">
                <Upload className="w-3 h-3" /> Change Assets
              </button>
            </div>
          </section>
        )}

        {/* ── HOW IT WORKS ───────────────────────────────────── */}
        {stage === "upload" && (
          <section className="border-t-[6px] border-neutral-100 pt-12 grid grid-cols-1 md:grid-cols-3 gap-0">
            {[
              { step: "01", title: "Exact Design", desc: "Your tattoo design is composited pixel-for-pixel. We never regenerate it with AI.", accent: "text-brand-red" },
              { step: "02", title: "Multiply Ink",  desc: "Skin pores, shadows, and hair show through the tattoo — just like real ink in the epidermis.", accent: "text-black" },
              { step: "03", title: "Integrity Check", desc: "Every pixel outside the zone is verified unchanged. Your photo is safe.", accent: "text-emerald-600" },
            ].map((item, i) => (
              <div key={item.step} className={`p-8 flex flex-col gap-4 ${i < 2 ? "md:border-r border-neutral-100" : ""} border-t border-neutral-100 md:border-t-0`}>
                <span className={`font-mono text-[52px] font-bold leading-none ${item.accent} opacity-20`}>{item.step}</span>
                <div>
                  <h3 className="font-display text-[24px] text-black leading-none mb-2">{item.title}</h3>
                  <p className="font-mono text-[12px] text-neutral-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE (Wrapped in Suspense for useSearchParams)
// ─────────────────────────────────────────────────────────────
export default function TryOnPage() {
  return (
    <Suspense fallback={<div className="w-full h-screen flex items-center justify-center font-mono text-[11px] uppercase tracking-widest text-neutral-400">Loading Studio...</div>}>
      <TryOnContent />
    </Suspense>
  );
}
