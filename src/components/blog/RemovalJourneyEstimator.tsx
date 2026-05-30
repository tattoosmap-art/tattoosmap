"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";

const Line = dynamic(() => import("react-chartjs-2").then(mod => mod.Line), { ssr: false });
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Tooltip, 
  Filler,
  ChartOptions
} from 'chart.js';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Tooltip, 
  Filler
);

const SKIN_TONES = [
  { id: 1, hex: '#F5DEB4', label: 'I' },
  { id: 2, hex: '#E8C89A', label: 'II' },
  { id: 3, hex: '#C8956C', label: 'III' },
  { id: 4, hex: '#A0714F', label: 'IV' },
  { id: 5, hex: '#7B4F2E', label: 'V' },
  { id: 6, hex: '#4A2912', label: 'VI' },
];

export default function RemovalJourneyEstimator() {
  const [size, setSize] = useState<number>(15);
  const [colors, setColors] = useState<Set<string>>(new Set(["black"]));
  const [skinToneId, setSkinToneId] = useState<number>(2);
  const [chartDataState, setChartDataState] = useState<number[]>([]);

  const toggleColor = (id: string) => {
    setColors(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const { sessions, perSessionCost, totalCost, costPerDay } = useMemo(() => {
    let baseSessions = 6;
    if (size > 20 && size <= 50) baseSessions = 8;
    else if (size > 50 && size <= 80) baseSessions = 10;
    else if (size > 80) baseSessions = 12;

    let extraSessions = 0;
    if (colors.has('red')) extraSessions += 2;
    if (colors.has('green')) extraSessions += 4;
    
    if (skinToneId >= 5) extraSessions += 2;

    const totalSessions = baseSessions + extraSessions;

    const perSession = 150 + (size * 2.5);
    const totalAmount = totalSessions * perSession;
    
    const healDays = Math.max(1, (totalSessions - 1) * 56);
    const perDay = totalAmount / healDays;

    return {
      sessions: totalSessions,
      perSessionCost: perSession,
      totalCost: totalAmount,
      costPerDay: perDay,
      days: healDays
    };
  }, [size, colors, skinToneId]);

  // Generate chart data strictly when sessions change
  useEffect(() => {
    const data = [100];
    let currentVisibility = 100;
    for (let i = 1; i <= sessions; i++) {
        // Exponential decay: removes 30-40% of REMAINING ink.
        const reductionRatio = 0.3 + (Math.random() * 0.1); 
        currentVisibility = currentVisibility * (1 - reductionRatio);
        // Force the last session to hit near 0
        if (i === sessions) currentVisibility = 0;
        data.push(Math.max(0, currentVisibility));
    }
    setChartDataState(data);
  }, [sessions]);

  const chartData = {
    labels: Array.from({ length: sessions + 1 }, (_, i) => i === 0 ? "Start" : `S${i}`),
    datasets: [
      {
        fill: true,
        data: chartDataState,
        borderColor: 'black',
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderWidth: 2,
        pointBackgroundColor: 'white',
        pointBorderColor: 'black',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointStyle: 'rect' as const,
        tension: 0.2 // slight curve
      }
    ]
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: { color: '#e5e7eb' },
        ticks: { callback: (val) => `${val}%` }
      },
      x: {
        grid: { display: false }
      }
    },
    plugins: {
      tooltip: {
        displayColors: false,
        callbacks: {
          title: (items) => `Session ${items[0].label}`,
          label: (item) => `Est. ${item.raw ? Math.round(Number(item.raw)) : 0}% visibility remaining`
        }
      }
    }
  };

  return (
    <div className="border border-gray-light bg-white mb-12 w-full">
      <div className="p-6 border-b border-gray-light">
        <span className="font-mono text-[10px] uppercase text-brand-red block mb-1">INTERACTIVE TOOL</span>
        <h3 className="font-display text-[22px] m-0">THE REMOVAL JOURNEY ESTIMATOR</h3>
      </div>
      
      <div className="flex flex-col md:flex-row">
        {/* LEFT COLUMN: INPUTS */}
        <div className="w-full md:w-1/2 p-6 md:p-8 border-b md:border-b-0 md:border-r border-gray-light space-y-8">
          
          {/* Size Slider */}
          <div>
            <label className="font-mono text-[10px] uppercase block mb-4">TATTOO SIZE</label>
            <div className="flex items-end gap-2 mb-4">
              <span className="font-display text-[32px] leading-none">{size}</span>
              <span className="font-mono text-[12px] text-neutral-400 mb-1">CM&sup2;</span>
            </div>
            <input 
              type="range"
              min="5" max="100" step="5"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full h-[4px] bg-gray-light appearance-none outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[20px] [&::-webkit-slider-thumb]:h-[20px] [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:rounded-none"
            />
            <div className="flex justify-between mt-3 font-mono text-[10px] uppercase text-neutral-400">
              <span>COIN SIZE</span>
              <span>PALM SIZE</span>
              <span>HALF SLEEVE</span>
            </div>
          </div>

          {/* Color Selector */}
          <div>
            <label className="font-mono text-[10px] uppercase block mb-4">INK COLORS PRESENT</label>
            <div className="flex gap-2">
              <button 
                onClick={() => toggleColor('black')}
                className={`flex-1 border p-3 text-left transition-colors rounded-none ${colors.has('black') ? 'border-black bg-off-white' : 'border-gray-light bg-white'}`}
              >
                <div className="font-display text-[15px] mb-1 leading-tight">BLACK / GREY</div>
                <div className="font-mono text-[10px] text-neutral-400 mb-2">Base standard</div>
                <div className="font-mono text-[9px] text-brand-red">NO EXTRA SESSIONS</div>
              </button>
              <button 
                onClick={() => toggleColor('red')}
                className={`flex-1 border p-3 text-left transition-colors rounded-none ${colors.has('red') ? 'border-black bg-off-white' : 'border-gray-light bg-white'}`}
              >
                <div className="font-display text-[15px] mb-1 leading-tight">RED / WARM</div>
                <div className="font-mono text-[10px] text-neutral-400 mb-2">&nbsp;</div>
                <div className="font-mono text-[9px] text-amber-600">+2 SESSIONS</div>
              </button>
              <button 
                onClick={() => toggleColor('green')}
                className={`flex-1 border p-3 text-left transition-colors rounded-none ${colors.has('green') ? 'border-black bg-off-white' : 'border-gray-light bg-white'}`}
              >
                <div className="font-display text-[15px] mb-1 leading-tight">GREEN / BLUE</div>
                <div className="font-mono text-[10px] text-neutral-400 mb-2">&nbsp;</div>
                <div className="font-mono text-[9px] text-amber-600">+4 SESSIONS <br/><span className="text-[8px]">Requires 755nm laser</span></div>
              </button>
            </div>
          </div>

          {/* Skin Tone Selector */}
          <div>
            <label className="font-mono text-[10px] uppercase block mb-4">SKIN TONE</label>
            <div className="flex gap-3 mb-3">
              {SKIN_TONES.map(tone => (
                <button
                  key={tone.id}
                  onClick={() => setSkinToneId(tone.id)}
                  style={{ backgroundColor: tone.hex }}
                  className={`w-[28px] h-[28px] rounded-none focus:outline-none flex-shrink-0 ${skinToneId === tone.id ? 'ring-2 ring-black ring-offset-2' : ''}`}
                  aria-label={`Fitzpatrick Skin Type ${tone.label}`}
                />
              ))}
            </div>
            <p className="font-mono text-[10px] text-neutral-400 max-w-[250px]">
              Darker skin tones require more conservative settings — this affects session spacing.
            </p>
          </div>

        </div>

        {/* RIGHT COLUMN: OUTPUTS */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col pt-8 md:pt-8 bg-off-white/30">
          
          <div className="mb-6">
            <div className="font-display text-[64px] leading-none mb-1 text-black">{sessions}</div>
            <div className="font-mono text-[10px] uppercase text-neutral-400 mb-2">ESTIMATED SESSIONS</div>
            <div className="font-mono text-[12px] text-black">TOTAL TIMELINE: {Math.ceil(sessions * 56 / 30)} MONTHS</div>
          </div>

          <div className="h-[200px] w-full mb-8 relative border border-gray-light bg-white">
            <Line data={chartData} options={chartOptions} />
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <div className="font-mono text-[10px] text-neutral-400 mb-1">PER SESSION</div>
              <div className="font-display text-[24px] text-black">${Math.round(perSessionCost)}</div>
            </div>
            <div>
              <div className="font-mono text-[10px] text-neutral-400 mb-1">TOTAL INVESTMENT</div>
              <div className="font-display text-[24px] text-black">${Math.round(totalCost)}</div>
            </div>
            <div>
              <div className="font-mono text-[10px] text-brand-red mb-1">COST PER DAY</div>
              <div className="font-display text-[24px] text-brand-red">${costPerDay.toFixed(2)}</div>
            </div>
          </div>
          <div className="font-mono text-[10px] text-neutral-400 mb-4 ml-auto text-right w-full block">
              Over {Math.max(1, (sessions - 1) * 56)} days of healing
          </div>

          <p className="font-mono text-[11px] text-neutral-400 mt-auto pt-4 border-t border-gray-light">
            Prices are estimates for US and UK markets. Get a precise quote from a verified clinic.
          </p>

        </div>
      </div>

      {/* CTA Button */}
      <a 
        href="#affiliate"
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full text-center bg-black hover:bg-neutral-900 text-white font-mono text-[12px] uppercase py-[16px] transition-colors rounded-none"
      >
        FIND A VERIFIED REMOVAL CLINIC NEAR YOU
      </a>
    </div>
  );
}
