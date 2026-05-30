"use client";

import { useState, useRef } from "react";
import Papa from "papaparse";
import { CloudUpload, AlertCircle, CheckCircle2, XCircle, FileSpreadsheet, Loader2, Play } from "lucide-react";

type SyncLog = {
    id: string;
    timestamp: Date;
    message: string;
    type: "info" | "success" | "error" | "warning";
};

type CSVRow = Record<string, string>;

export default function CloudSyncPage() {
    const [file, setFile] = useState<File | null>(null);
    const [data, setData] = useState<CSVRow[]>([]);
    const [isSyncing, setIsSyncing] = useState(false);
    const [logs, setLogs] = useState<SyncLog[]>([]);
    const [failedSlugs, setFailedSlugs] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const addLog = (message: string, type: SyncLog["type"] = "info") => {
        setLogs(prev => [...prev, { id: Math.random().toString(), timestamp: new Date(), message, type }]);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (!selected) return;
        setFile(selected);

        Papa.parse(selected, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const parsed = results.data as CSVRow[];
                setData(parsed);
                addLog(`Loaded CSV with ${parsed.length} rows. Ready for sync.`, "success");
            },
            error: (err) => {
                addLog(`Failed to parse CSV: ${err.message}`, "error");
            }
        });
    };

    const startSync = async () => {
        if (!data.length) return;
        setIsSyncing(true);
        setLogs([]);
        setFailedSlugs([]);
        
        addLog("Starting Cloud Sync... Please do not close this window.", "info");

        let failures: string[] = [];

        // We process in batch to the server or one by one. One by one is safer for timeouts and gives real-time logs.
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const slug = row.slug || `row-${i}`;
            const statusStr = row.status?.toUpperCase() || 'UNKNOWN';

            // Filter out 'ERROR' rows per requirements
            if (statusStr === 'ERROR') {
                addLog(`[${i + 1}/${data.length}] Skipping ${slug} (Status is ERROR)`, "warning");
                continue;
            }

            addLog(`[${i + 1}/${data.length}] Syncing ${slug}...`, "info");

            try {
                const res = await fetch("/api/admin/sync", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ row })
                });

                const result = await res.json();

                if (!res.ok) {
                    throw new Error(result.error || "Unknown error");
                }

                if (result.skipped) {
                    addLog(`  -> Skipped: ${result.message}`, "warning");
                } else if (result.success) {
                    addLog(`  -> Success: inserted as ${result.dbStatus}`, "success");
                }
            } catch (error: any) {
                addLog(`  -> Failed: ${error.message}`, "error");
                failures.push(slug);
            }
        }

        // Output FAILED section if any
        if (failures.length > 0) {
            setFailedSlugs(failures);
            addLog(`\n======================================`, "warning");
            addLog(`SYNC COMPLETE WITH ${failures.length} FAILURES`, "error");
            addLog(`The following slugs must be retried:`, "error");
            failures.forEach(f => addLog(`- ${f}`, "error"));
        } else {
            addLog(`\n======================================`, "success");
            addLog(`SYNC COMPLETELY SUCCESSFUL!`, "success");
            
            addLog(`Triggering final revalidation...`, "info");
            try {
                const res = await fetch("/api/admin/sync?action=revalidate", { method: "POST" });
                if (res.ok) addLog("Site revalidated globally.", "success");
                else addLog("Site revalidation failed.", "warning");
            } catch (e: any) {
                addLog(`Site revalidation failed: ${e.message}`, "warning");
            }
        }

        setIsSyncing(false);
    };

    return (
        <div className="max-w-[1000px] mx-auto px-4 md:px-6 py-12 font-sans">
            <h1 className="text-[32px] font-black italic tracking-tight mb-2">Cloud Sync</h1>
            <p className="text-gray-mid text-[15px] mb-8">Push local Master CSV data and optimized WebP images to your production Supabase instance.</p>

            {/* Local Dev Warning */}
            <div className="bg-orange-50 border border-orange-200 p-4 mb-8 flex gap-3 text-orange-900 text-[14px]">
                <AlertCircle className="w-5 h-5 flex-shrink-0" strokeWidth={2} />
                <div>
                    <strong className="font-bold block tracking-tight">LOCAL DEVELOPMENT ONLY</strong>
                    This tool accesses local filesystem directories (`/public/designs/`) to read binary image files. It must be run locally via `npm run dev` and will NOT work if accessed from a deployed Vercel/production instance.
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Left Col: Upload & Controls */}
                <div className="flex flex-col gap-6">
                    <div className="border border-black p-6 bg-white">
                        <h2 className="text-[12px] font-mono tracking-widest uppercase mb-4 text-gray-mid">1. Select Master CSV</h2>
                        <input
                            type="file"
                            accept=".csv"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            disabled={isSyncing}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isSyncing}
                            className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-light hover:border-brand-red transition-colors min-h-[160px] bg-off-white/50"
                        >
                            {file ? (
                                <>
                                    <FileSpreadsheet className="w-8 h-8 mb-3 text-black" strokeWidth={1.5} />
                                    <span className="font-medium text-[15px]">{file.name}</span>
                                    <span className="text-[13px] text-gray-mid mt-1">{data.length} rows loaded</span>
                                </>
                            ) : (
                                <>
                                    <CloudUpload className="w-8 h-8 mb-3 text-gray-mid group-hover:text-black transition-colors" strokeWidth={1.5} />
                                    <span className="font-medium text-[15px]">Click to select CSV</span>
                                </>
                            )}
                        </button>
                    </div>

                    <div className="border border-black p-6 bg-white">
                        <h2 className="text-[12px] font-mono tracking-widest uppercase mb-4 text-gray-mid">2. Execute Sync</h2>
                        <button
                            onClick={startSync}
                            disabled={!file || isSyncing}
                            className="w-full h-14 bg-[#E1000F] text-white font-mono text-[14px] uppercase tracking-[0.1em] transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSyncing ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Play className="w-5 h-5" fill="currentColor" />
                                    Start Live Sync
                                </>
                            )}
                        </button>
                        
                        <div className="mt-4 text-[12px] text-gray-mid font-mono">
                            <span className="text-black font-semibold">Rules Enforced:</span>
                            <ul className="list-disc pl-4 mt-2 space-y-1">
                                <li>Always Upsert (overwrite conflicts on slug)</li>
                                <li>Never delete local backup images</li>
                                <li>"ERROR" rows skipped entirely</li>
                                <li>"review" or IP_FLAG=true pushed as DRAFTS</li>
                                <li>Images synced atomic-first before DB</li>
                                <li>Automated global cache revalidation</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Right Col: Live Logs Terminal */}
                <div className="border border-black flex flex-col bg-[#111] overflow-hidden min-h-[400px]">
                    <div className="h-10 border-b border-[#333] flex items-center px-4 bg-[#0a0a0a]">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-[#E1000F]/30" />
                            <div className="w-3 h-3 rounded-full bg-yellow-400/30" />
                            <div className="w-3 h-3 rounded-full bg-green-400/30" />
                        </div>
                        <span className="text-[11px] font-mono text-gray-mid ml-4 uppercase tracking-widest">Sync Terminal</span>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto font-mono text-[13px] leading-relaxed break-all">
                        {logs.length === 0 ? (
                            <div className="text-gray-mid/50 italic h-full flex items-center justify-center">
                                Awaiting system activation...
                            </div>
                        ) : (
                            logs.map((log) => (
                                <div key={log.id} className={`mb-1.5 ${
                                    log.type === 'error' ? 'text-red-400 font-bold' :
                                    log.type === 'success' ? 'text-green-400' :
                                    log.type === 'warning' ? 'text-yellow-400' :
                                    'text-gray-300'
                                }`}>
                                    <span className="text-gray-500 mr-2 opacity-50">
                                        [{log.timestamp.toLocaleTimeString([], { hour12: false })}]
                                    </span>
                                    {log.message}
                                </div>
                            ))
                        )}
                        {isSyncing && (
                            <div className="text-gray-500 animate-pulse mt-2 flex items-center gap-2">
                                <div className="w-1.5 h-3 bg-white/50" />
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
