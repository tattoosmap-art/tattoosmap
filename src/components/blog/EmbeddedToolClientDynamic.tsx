"use client";

import dynamic from 'next/dynamic';

export const EmbeddedToolClientDynamic = dynamic(() => import('./EmbeddedToolClient'), {
    ssr: false,
    loading: () => <div className="h-40 w-full animate-pulse bg-gray-100 flex items-center justify-center text-gray-400 font-mono text-xs uppercase tracking-widest">Loading Tool...</div>
});
