export default function Loading() {
    return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-white space-y-4">
            <div className="w-8 h-8 rounded-none border-[3px] border-gray-light border-t-brand-red animate-spin"></div>
            <p className="font-mono text-[11px] text-gray-mid tracking-widest uppercase animate-pulse">Loading</p>
        </div>
    );
}
