'use client';
import { useState, useRef } from 'react';

type FilterType = 'studio' | 'blackwork' | 'colourpop' | 'dark' | 'clean';

const FILTERS: { id: FilterType; label: string; desc: string }[] = [
  { id: 'studio',    label: '◈ Studio',      desc: 'Professional quality. Deepens ink, boosts clarity.' },
  { id: 'blackwork', label: '◈ Blackwork',   desc: 'Maximum ink depth. Black and white. Sharp lines.' },
  { id: 'colourpop', label: '◈ Colour Pop',  desc: 'Vivid colour boost. Best for coloured tattoos.' },
  { id: 'dark',      label: '◈ Dark Moody',  desc: 'Dark contrast. Rich shadows. Instagram style.' },
  { id: 'clean',     label: '◈ Clean',       desc: 'Balanced and accurate. Best for directories.' },
];

export default function EnhancePhotoPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [enhanced, setEnhanced] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('studio');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setEnhanced(null);
    setError(null);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const handleEnhance = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setEnhanced(null);
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('filter', filter);
      const res = await fetch('/api/enhance-photo', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok || !data.enhanced_base64) throw new Error(data.error || 'Failed');
      setEnhanced(`data:image/jpeg;base64,${data.enhanced_base64}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!enhanced) return;
    const a = document.createElement('a');
    a.href = enhanced;
    a.download = `tattoosmap-${filter}-${Date.now()}.jpg`;
    a.click();
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setEnhanced(null);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-6 py-16">

        <div className="mb-12">
          <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-3">
            Photo Enhancement Studio
          </p>
          <h1 className="font-display text-[36px] uppercase mb-3">
            Enhance Tattoo Photos
          </h1>
          <p className="font-mono text-[11px] text-neutral-500">
            Professional filters — instant — zero API cost
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* LEFT */}
          <div className="space-y-5">

            {/* Upload zone */}
            <div
              onClick={() => inputRef.current?.click()}
              className="border border-dashed border-neutral-700 p-6 cursor-pointer hover:border-neutral-500 transition-colors min-h-[200px] flex items-center justify-center"
            >
              {preview ? (
                <img src={preview} alt="Original" className="max-h-64 w-full object-contain" />
              ) : (
                <div className="text-center">
                  <p className="font-mono text-[11px] uppercase tracking-widest text-neutral-500 mb-1">
                    Upload Photo
                  </p>
                  <p className="font-mono text-[9px] text-neutral-700">
                    JPEG or PNG — max 20MB
                  </p>
                </div>
              )}
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFile}
                className="hidden"
              />
            </div>

            {/* Filter buttons */}
            <div className="space-y-2">
              <p className="font-mono text-[9px] uppercase tracking-widest text-neutral-600 mb-2">
                Filter
              </p>
              {FILTERS.map(f => (
                <button
                  key={f.id}
                  onClick={() => { setFilter(f.id); setEnhanced(null); }}
                  className={`w-full text-left px-4 py-3 border transition-colors ${
                    filter === f.id
                      ? 'border-white bg-neutral-900'
                      : 'border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <p className="font-mono text-[10px] uppercase tracking-widest mb-0.5">
                    {f.label}
                  </p>
                  <p className="font-mono text-[9px] text-neutral-600">
                    {f.desc}
                  </p>
                </button>
              ))}
            </div>

            {/* Enhance */}
            <button
              onClick={handleEnhance}
              disabled={!file || isProcessing}
              className="w-full py-4 bg-white text-black font-mono text-[11px] uppercase tracking-widest hover:bg-neutral-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isProcessing ? '⟳ Processing...' : '✦ Apply Filter'}
            </button>

            {error && (
              <p className="font-mono text-[10px] text-red-400 mt-2">{error}</p>
            )}
          </div>

          {/* RIGHT — Result */}
          <div>
            <p className="font-mono text-[9px] uppercase tracking-widest text-neutral-600 mb-3">
              Result
            </p>
            {enhanced ? (
              <div className="space-y-4">
                <img
                  src={enhanced}
                  alt="Enhanced"
                  className="w-full object-contain border border-neutral-800"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleDownload}
                    className="flex-1 py-3 border border-white font-mono text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
                  >
                    ↓ Download
                  </button>
                  <button
                    onClick={reset}
                    className="px-4 py-3 border border-neutral-800 font-mono text-[10px] uppercase tracking-widest hover:border-neutral-600 transition-colors"
                  >
                    Reset
                  </button>
                </div>
                <p className="font-mono text-[9px] text-neutral-700">
                  1080×1350px · sRGB · Instagram 4:5 ready
                </p>
              </div>
            ) : (
              <div className="border border-dashed border-neutral-800 min-h-[400px] flex items-center justify-center">
                <p className="font-mono text-[9px] uppercase tracking-widest text-neutral-800">
                  Result appears here
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Before/After comparison when both exist */}
        {preview && enhanced && (
          <div className="mt-12">
            <p className="font-mono text-[9px] uppercase tracking-widest text-neutral-600 mb-4">
              Before / After
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-mono text-[9px] text-neutral-700 mb-2">Original</p>
                <img src={preview} alt="Before" className="w-full object-contain" />
              </div>
              <div>
                <p className="font-mono text-[9px] text-neutral-700 mb-2">Enhanced</p>
                <img src={enhanced} alt="After" className="w-full object-contain" />
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
