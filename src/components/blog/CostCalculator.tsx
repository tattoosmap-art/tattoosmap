"use client";

import { useState } from "react";

const BASE_RATES: Record<string, { hourly: number; note: string }> = {
  'apprentice': { hourly: 80, note: 'Apprentice artists offer lower rates — quality varies. Always review healed work.' },
  'established': { hourly: 150, note: 'Established artist with a consistent portfolio and 3+ years experience.' },
  'senior': { hourly: 250, note: 'Senior artist — expect a waiting list of 3 to 12 months.' },
  'award': { hourly: 400, note: 'Award-winning or internationally recognized artist. Waitlist may exceed 1 year.' },
};

const SIZE_HOURS: Record<string, { min: number; max: number; label: string; sessions: string }> = {
  'coin': { min: 0.5, max: 1.5, label: 'Coin-sized (under 5cm)', sessions: '1 session' },
  'palm': { min: 2, max: 4, label: 'Palm-sized (5-15cm)', sessions: '1 to 2 sessions' },
  'large': { min: 5, max: 10, label: 'Large (15-30cm)', sessions: '2 to 3 sessions' },
  'halfbody': { min: 15, max: 25, label: 'Half body (sleeve, chest)', sessions: '5 to 10 sessions' },
};

const STYLE_MULTIPLIER: Record<string, number> = {
  'blackwork': 1.0,
  'traditional': 1.0,
  'realism': 1.4,
  'fineline': 1.3,
  'watercolor': 1.2,
  'geometric': 1.1,
};

const PLACEMENT_MULTIPLIER: Record<string, number> = {
  'easy': 1.0,    // outer arm, thigh, calf
  'medium': 1.15, // inner arm, shoulder, back
  'difficult': 1.3, // ribs, spine, hands, feet, neck
};

export default function CostCalculator() {
  const [size, setSize] = useState<string>('');
  const [style, setStyle] = useState<string>('');
  const [placement, setPlacement] = useState<string>('');
  const [artistLevel, setArtistLevel] = useState<string>('');
  const [result, setResult] = useState<{
    low: number;
    high: number;
    sessions: string;
    hours: string;
    note: string;
  } | null>(null);

  const calculateCost = () => {
    if (!size || !style || !placement || !artistLevel) return;
    
    const hours = SIZE_HOURS[size];
    const rate = BASE_RATES[artistLevel];
    const styleMult = STYLE_MULTIPLIER[style];
    const placeMult = PLACEMENT_MULTIPLIER[placement];
    
    const low = Math.round(hours.min * rate.hourly * styleMult * placeMult / 50) * 50;
    const high = Math.round(hours.max * rate.hourly * styleMult * placeMult / 50) * 50;
    
    setResult({
      low,
      high,
      sessions: hours.sessions,
      hours: `${hours.min} to ${hours.max} hours`,
      note: rate.note
    });
  };

  return (
    <div className="max-w-[680px] mx-auto border border-gray-light bg-off-white p-6 my-12 rounded-none">
      <div className="mb-6">
        <span className="font-mono text-[9px] uppercase text-brand-red tracking-widest block mb-2">
          TATTOOSMAP COST CALCULATOR
        </span>
        <h3 className="font-display text-[24px] uppercase tracking-tight text-black">
          Estimate Your Tattoo Cost
        </h3>
        <p className="font-sans text-[14px] text-neutral-500 mt-2">
          Based on size, style, placement, and artist level.
          Estimates only — always get a quote from your artist directly.
        </p>
      </div>

      {/* Tattoo Size Select */}
      <div className="mb-6">
        <label className="font-mono text-[10px] uppercase tracking-widest text-black font-bold block mb-3">
          Tattoo Size
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.entries(SIZE_HOURS).map(([key, data]) => (
            <button
              key={key}
              onClick={() => { setSize(key); setResult(null); }}
              className={`p-3 text-left border rounded-none transition-colors ${
                size === key
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-neutral-700 border-neutral-300 hover:border-black'
              }`}
            >
              <span className="font-mono text-[10px] uppercase tracking-widest block">
                {data.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Style Select */}
      <div className="mb-6">
        <label className="font-mono text-[10px] uppercase tracking-widest text-black font-bold block mb-3">
          Tattoo Style
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Object.keys(STYLE_MULTIPLIER).map((key) => (
            <button
              key={key}
              onClick={() => { setStyle(key); setResult(null); }}
              className={`p-3 text-left border rounded-none transition-colors ${
                style === key
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-neutral-700 border-neutral-300 hover:border-black'
              }`}
            >
              <span className="font-mono text-[10px] uppercase tracking-widest block">
                {key.replace(/_/g, ' ')}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Placement Select */}
      <div className="mb-6">
        <label className="font-mono text-[10px] uppercase tracking-widest text-black font-bold block mb-3">
          Placement Area
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {Object.keys(PLACEMENT_MULTIPLIER).map((key) => (
            <button
              key={key}
              onClick={() => { setPlacement(key); setResult(null); }}
              className={`p-3 text-left border rounded-none transition-colors ${
                placement === key
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-neutral-700 border-neutral-300 hover:border-black'
              }`}
            >
              <span className="font-mono text-[10px] uppercase tracking-widest block">
                {key === 'easy' && 'Easy (Arm, Thigh)'}
                {key === 'medium' && 'Medium (Shoulder, Back)'}
                {key === 'difficult' && 'Difficult (Ribs, Spine)'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Artist Level Select */}
      <div className="mb-6">
        <label className="font-mono text-[10px] uppercase tracking-widest text-black font-bold block mb-3">
          Artist Experience Level
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.keys(BASE_RATES).map((key) => (
            <button
              key={key}
              onClick={() => { setArtistLevel(key); setResult(null); }}
              className={`p-3 text-left border rounded-none transition-colors ${
                artistLevel === key
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-neutral-700 border-neutral-300 hover:border-black'
              }`}
            >
              <span className="font-mono text-[10px] uppercase tracking-widest block font-bold mb-1">
                {key}
              </span>
              <span className="font-mono text-[9px] text-neutral-400 block">
                ${BASE_RATES[key].hourly}/hour avg
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Calculate Button */}
      <button
        onClick={calculateCost}
        disabled={!size || !style || !placement || !artistLevel}
        className={`w-full py-4 font-mono text-[11px] uppercase tracking-widest transition-colors rounded-none mt-4 ${
          size && style && placement && artistLevel
            ? 'bg-black text-white hover:bg-brand-red'
            : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
        }`}
      >
        Calculate My Estimate →
      </button>

      {/* Results Section */}
      {result && (
        <div className="mt-8 border border-black p-6 bg-white rounded-none">
          <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 block mb-4">
            Your Estimate
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div>
              <span className="font-mono text-[10px] uppercase text-neutral-400 block mb-1">
                Cost Range
              </span>
              <span className="font-display text-[32px] text-black leading-none font-bold">
                ${result.low}–${result.high}
              </span>
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase text-neutral-400 block mb-1">
                Session Count
              </span>
              <span className="font-display text-[24px] text-black leading-none font-bold">
                {result.sessions}
              </span>
            </div>
          </div>
          <div className="border-t border-gray-light pt-4 mb-4">
            <span className="font-mono text-[10px] uppercase text-neutral-400 block mb-1">
              Estimated Time In Chair
            </span>
            <span className="font-sans text-[15px] text-black">{result.hours}</span>
          </div>
          <div className="border-l-2 border-brand-red pl-4 mt-4">
            <p className="font-sans text-[13px] text-black/70 italic">{result.note}</p>
          </div>
          <p className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest mt-4 leading-relaxed">
            This is an estimate only. Always get a written quote from your artist before booking.
          </p>
        </div>
      )}
    </div>
  );
}
