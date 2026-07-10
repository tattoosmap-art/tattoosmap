import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="w-full min-h-[70vh] flex flex-col items-center justify-center bg-white px-4">
      <h2 className="text-[48px] font-display text-black mb-4">404 — Page Not Found</h2>
      <p className="text-[16px] text-gray-mid mb-12 max-w-[500px] text-center font-sans">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-black text-white text-[13px] font-medium tracking-wide uppercase font-mono hover:bg-brand-red transition-colors"
      >
        Return Home
      </Link>
    </div>
  );
}
