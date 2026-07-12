import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center">
      <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-4">
        404
      </p>
      <h1 className="font-display text-[40px] uppercase tracking-tight text-black mb-4">
        Page Not Found
      </h1>
      <p className="font-sans text-[16px] text-neutral-500 mb-8">
        This page does not exist or has been moved.
      </p>
      <Link
        href="/gallery"
        className="bg-black text-white font-mono text-[11px] uppercase tracking-widest px-8 py-4 hover:bg-brand-red transition-colors"
      >
        Browse Gallery →
      </Link>
    </main>
  );
}
