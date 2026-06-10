'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="w-full min-h-[70vh] flex flex-col items-center justify-center bg-white px-4">
            <h2 className="text-[48px] font-display text-black mb-4">Something went wrong</h2>
            <p className="text-[16px] text-gray-mid mb-12 max-w-[500px] text-center">
                An unexpected error occurred while trying to load the content.
            </p>

            <div className="flex items-center gap-4">
                <button
                    onClick={() => reset()}
                    className="px-6 py-3 bg-black text-white text-[13px] font-medium tracking-wide uppercase font-mono hover:bg-brand-red transition-colors"
                >
                    Try again
                </button>
                <Link
                    href="/"
                    className="px-6 py-3 border border-gray-light text-black text-[13px] font-medium tracking-wide uppercase font-mono hover:border-black transition-colors"
                >
                    Return Home
                </Link>
            </div>
        </div>
    );
}
