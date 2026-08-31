'use client';

import React, { Component, ReactNode } from 'react';
import dynamic from 'next/dynamic';

class ToolErrorBoundary extends Component<{children: ReactNode, toolName: string}, {hasError: boolean}> {
  constructor(props: {children: ReactNode, toolName: string}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[ToolErrorBoundary] Crashed in tool ${this.props.toolName}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="border border-red-200 bg-red-50 p-6 text-center text-red-500 font-mono text-[10px] uppercase tracking-widest my-12">
          Interactive tool "{this.props.toolName.replace(/_/g, ' ')}" is temporarily unavailable.
        </div>
      );
    }
    return this.props.children;
  }
}

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
  return (
    <ToolErrorBoundary toolName={toolName}>
      <Tool data={null} />
    </ToolErrorBoundary>
  );
}
