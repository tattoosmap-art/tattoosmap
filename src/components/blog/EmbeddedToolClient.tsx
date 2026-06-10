'use client';

import dynamic from 'next/dynamic';

const PainSimulator = dynamic(
  () => import('@/components/blog/PainSimulator'),
  { ssr: false, loading: () => (
    <div className="border border-gray-light p-8 text-center font-mono text-[11px] uppercase text-neutral-300 tracking-widest my-12">
      Loading tool...
    </div>
  )}
);

const RemovalJourneyEstimator = dynamic(
  () => import('@/components/blog/RemovalJourneyEstimator'),
  { ssr: false, loading: () => (
    <div className="border border-gray-light p-8 text-center font-mono text-[11px] uppercase text-neutral-300 tracking-widest my-12">
      Loading tool...
    </div>
  )}
);

const SkinCompatibilityChecker = dynamic(
  () => import('@/components/blog/SkinCompatibilityChecker'),
  { ssr: false, loading: () => (
    <div className="border border-gray-light p-8 text-center font-mono text-[11px] uppercase text-neutral-300 tracking-widest my-12">
      Loading tool...
    </div>
  )}
);

const PainMap = dynamic(
  () => import('@/components/gallery/PainMap'),
  { ssr: false, loading: () => (
    <div className="border border-gray-light p-8 text-center font-mono text-[11px] uppercase text-neutral-300 tracking-widest my-12">
      Loading tool...
    </div>
  )}
);

const HealingTracker = dynamic(
  () => import('@/components/blog/HealingTracker'),
  { ssr: false, loading: () => (
    <div className="border border-gray-light p-8 text-center font-mono text-[11px] uppercase text-neutral-300 tracking-widest my-12">
      Loading tool...
    </div>
  )}
);

const CostCalculator = dynamic(
  () => import('@/components/blog/CostCalculator'),
  { ssr: false, loading: () => (
    <div className="border border-gray-light p-8 text-center font-mono text-[11px] uppercase text-neutral-300 tracking-widest my-12">
      Loading tool...
    </div>
  )}
);

const TOOL_MAP: Record<string, any> = {
  'SKIN_COMPATIBILITY': SkinCompatibilityChecker,
  'PAIN_SIMULATOR': PainSimulator,
  'HEALING_TRACKER': HealingTracker,
  'JOURNEY_ESTIMATOR': RemovalJourneyEstimator,
  'PAIN_MAP': PainMap,
  'COST_CALCULATOR': CostCalculator,
};

export default function EmbeddedToolClient({ toolName }: { toolName: string }) {
  const Tool = TOOL_MAP[toolName];
  if (!Tool) return null;
  return <Tool data={null} />;
}
