"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Download, Sparkles, Heart, ChevronDown, ChevronUp } from "lucide-react";
import StyleSelectorRow from "./StyleSelectorRow";
import GeneratorPlaceholder from "./GeneratorPlaceholder";

export default function TattooGeneratorClient() {
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("fine-line");
  const [aspectRatio, setAspectRatio] = useState("square");
  const [complexity, setComplexity] = useState("moderate");
  const [mood, setMood] = useState("delicate");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const charLimit = 300;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);
    setResultUrl(null);
    setSaved(false);

    try {
      const res = await fetch("/api/generate-tattoo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          style: selectedStyle,
          aspectRatio,
          complexity,
          mood
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate design");
      }

      setResultUrl(data.imageUrl);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!resultUrl) return;
    try {
      const response = await fetch(resultUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `tattoosmap-ai-${selectedStyle}-${Date.now()}.webp`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Failed to download image", err);
      window.open(resultUrl, "_blank");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-12 items-start">
      {/* LEFT COLUMN: Controls */}
      <form onSubmit={handleGenerate} className="flex flex-col gap-8 border border-gray-light p-8 bg-white">
        {/* Prompt Input */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label htmlFor="promptInput" className="font-mono text-[10px] uppercase font-bold tracking-[0.2em] text-brand-red">
              DESCRIBE YOUR TATTOO IDEA
            </label>
            <span className="font-mono text-[9px] text-gray-mid">
              {prompt.length}/{charLimit}
            </span>
          </div>
          <textarea
            id="promptInput"
            rows={4}
            maxLength={charLimit}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. A roaring lion head wearing a crown of wild thorns, intricate shading details..."
            className="w-full p-4 border-2 border-gray-light text-sm focus:border-black focus:outline-none placeholder:text-gray-mid/70 resize-none font-sans"
            style={{ borderRadius: 0 }}
          />
        </div>

        {/* Style Selector */}
        <StyleSelectorRow
          selectedStyle={selectedStyle}
          onSelectStyle={setSelectedStyle}
        />

        {/* Advanced Accordion */}
        <div className="border-t border-gray-light pt-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.15em] text-black font-bold pb-2"
          >
            <span>Advanced Configurations</span>
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showAdvanced && (
            <div className="flex flex-col gap-6 pt-4 animate-fade-in-up">
              {/* Aspect Ratio */}
              <div className="flex flex-col gap-2">
                <span className="font-mono text-[9px] uppercase tracking-wider text-gray-mid">
                  Aspect Ratio / Composition
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {["square", "portrait", "landscape"].map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setAspectRatio(ratio)}
                      className={`py-2 text-[10px] font-mono uppercase tracking-widest border transition-all ${
                        aspectRatio === ratio
                          ? "border-black bg-black text-white"
                          : "border-gray-light text-gray-mid hover:border-black hover:text-black"
                      }`}
                      style={{ borderRadius: 0 }}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              {/* Complexity */}
              <div className="flex flex-col gap-2">
                <span className="font-mono text-[9px] uppercase tracking-wider text-gray-mid">
                  Complexity & Detail Level
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {["simple", "moderate", "complex"].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setComplexity(level)}
                      className={`py-2 text-[10px] font-mono uppercase tracking-widest border transition-all ${
                        complexity === level
                          ? "border-black bg-black text-white"
                          : "border-gray-light text-gray-mid hover:border-black hover:text-black"
                      }`}
                      style={{ borderRadius: 0 }}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mood */}
              <div className="flex flex-col gap-2">
                <span className="font-mono text-[9px] uppercase tracking-wider text-gray-mid">
                  Design Tone / Mood
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "delicate", name: "Light & Delicate" },
                    { id: "bold", name: "Dark & Bold" }
                  ].map((moodItem) => (
                    <button
                      key={moodItem.id}
                      type="button"
                      onClick={() => setMood(moodItem.id)}
                      className={`py-2 text-[10px] font-mono uppercase tracking-widest border transition-all ${
                        mood === moodItem.id
                          ? "border-black bg-black text-white"
                          : "border-gray-light text-gray-mid hover:border-black hover:text-black"
                      }`}
                      style={{ borderRadius: 0 }}
                    >
                      {moodItem.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={isGenerating || !prompt.trim()}
          className="w-full h-14 bg-brand-red text-white flex items-center justify-center gap-3 font-mono text-[13px] uppercase tracking-[0.2em] hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ borderRadius: 0 }}
        >
          <Sparkles className="w-4 h-4" />
          {isGenerating ? "GENERATING DESIGN..." : "GENERATE TATTOO →"}
        </button>

        {error && (
          <div className="p-4 border-l-4 border-brand-red bg-red-50 text-[12px] font-mono uppercase text-brand-red">
            {error}
          </div>
        )}
      </form>

      {/* RIGHT COLUMN: Results Preview */}
      <div className="flex flex-col gap-6">
        {isGenerating ? (
          <div className="w-full aspect-[4/5] min-h-[400px] border border-gray-light bg-off-white flex flex-col items-center justify-center p-8">
            <div className="flex flex-col items-center gap-4">
              {/* Pulsing loading spinner */}
              <div className="w-12 h-12 border-2 border-gray-light border-t-brand-red rounded-full animate-spin" />
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-black font-bold">
                Drawing Custom Design...
              </span>
              <p className="text-[11px] text-gray-mid max-w-[200px] text-center leading-relaxed">
                Fal.ai is formulating your unique stencil illustration.
              </p>
            </div>
          </div>
        ) : resultUrl ? (
          <div className="flex flex-col gap-6 bg-white border border-gray-light p-6 animate-fade-in-up">
            {/* Image Box */}
            <div className="relative w-full aspect-[4/5] border border-gray-light bg-white overflow-hidden group">
              <Image
                src={resultUrl}
                alt="AI Generated custom tattoo design"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-contain p-4 transition-transform duration-700 ease-out group-hover:scale-105"
                unoptimized // Since URL is external Fal blob
              />
            </div>

            {/* Label and Info */}
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand-red font-bold">
                AI DESIGN GENERATED SUCCESFULLY
              </span>
              <p className="text-[12px] text-gray-mid font-mono uppercase truncate">
                Prompt: &quot;{prompt}&quot;
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleDownload}
                className="w-full py-4 font-mono text-[12px] uppercase tracking-[0.15em] border-2 border-black text-black hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2"
                style={{ borderRadius: 0 }}
              >
                <Download className="w-4 h-4" /> Download webp image
              </button>

              <button
                type="button"
                onClick={() => setSaved(!saved)}
                className={`w-full py-4 font-mono text-[12px] uppercase tracking-[0.15em] border-2 transition-all flex items-center justify-center gap-2 ${
                  saved
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-mid border-gray-light hover:border-black hover:text-black"
                }`}
                style={{ borderRadius: 0 }}
              >
                <Heart className={`w-4 h-4 ${saved ? "fill-white" : ""}`} />
                {saved ? "SAVED TO COLLECTION" : "SAVE TO COLLECTION"}
              </button>
            </div>

            {/* Link to try on */}
            <div className="border-t border-gray-light pt-4 mt-2 flex justify-between items-center">
              <Link
                href={`/try-on?design=${encodeURIComponent(resultUrl)}`}
                className="font-mono text-[11px] uppercase tracking-[0.1em] text-brand-red border-b border-transparent hover:border-brand-red transition-all font-bold"
              >
                TRY ON SKIN VIRTUALLY →
              </Link>
              <span className="font-mono text-[8px] text-gray-light uppercase">
                COMPOSED ON DEMAND
              </span>
            </div>
          </div>
        ) : (
          <GeneratorPlaceholder />
        )}
      </div>
    </div>
  );
}
