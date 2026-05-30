'use client';

import { useState, useCallback, useRef } from 'react';
import Papa from 'papaparse';
import { UploadCloud, FileImage, Play, AlertCircle, Download, FileDown, Trash2, Eye, Zap, Layers, Cpu, Sparkles, Loader2 } from 'lucide-react';
import { publishDesignAction, PublishDesignPayload } from '@/actions/publishDesign';

type PipelineStage = 'UPLOADED' | 'STAGE_1' | 'STAGE_2' | 'STAGE_3' | 'COMPLETE' | 'ERROR';

interface QueueItem {
    id: string;
    file: File;
    originalName: string;
    status: PipelineStage;
    isAnalyzing?: boolean;
    
    stage1Result?: {
        polished_base64?: string;
        shaded_base64?: string;
        quality_flag?: string;
        quality_notes?: string;
        original_resolution?: string;
    };
    
    stage2Result?: {
        subject?: string;
        public_category?: string;
        mood?: string;
        elements?: string;
        gender_suitability?: string;
        style_tags?: string[];
        meta_title?: string;
        focus_keyword?: string;
        confidence_score?: number;
        alt_text?: string;
        speakable_summary?: string;
        ip_flag?: boolean;
        low_confidence_flag?: boolean;
        slug?: string;
        seo_filename?: string;
        thumbnail_filename?: string;
        placement_recommendations?: string[];
    };
    
    stage3Result?: {
        meaning?: string;
        cultural_origin?: string;
        cultural_sensitivity?: string;
        artist_technical_notes?: string;
        pain_level_map?: any;
        emotion_tags?: string[];
        aging_prediction?: string;
        recommended_needle?: string;
        minimum_size_cm?: number;
        placement_recommendations?: string[];
    };
    
    errorMessage?: string;
}

export default function SEOStudio() {
    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [showClearModal, setShowClearModal] = useState(false);
    const [processMode, setProcessMode] = useState<'LINE_ART' | 'COLOR'>('LINE_ART');
    const [previewImage, setPreviewImage] = useState<{src: string, name: string} | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isPublishing, setIsPublishing] = useState(false);
    const [publishResults, setPublishResults] = useState<Map<string, 'PUBLISHING' | 'LIVE' | 'DRAFT' | 'ERROR'>>(new Map());

    const isGlobalProcessing = queue.some(q => q.isAnalyzing) || isPublishing;

    const handleFiles = (files: File[]) => {
        const newItems: QueueItem[] = files.map(file => ({
            id: crypto.randomUUID(),
            file,
            originalName: file.name,
            status: 'UPLOADED'
        }));
        setQueue(q => [...q, ...newItems]);
    };

    const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        if (!files.length) return;
        handleFiles(files);
    }, []);

    const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []).filter(f => f.type.startsWith('image/'));
        if (!files.length) return;
        handleFiles(files);
    };

    const setItemAnalyzing = (id: string, isAnalyzing: boolean) => {
        setQueue(q => q.map(i => i.id === id ? { ...i, isAnalyzing } : i));
    };

    const runBulkStage1 = async () => {
        const targets = queue.filter(q => q.status === 'UPLOADED');
        if (!targets.length) return;

        for (const item of targets) {
            setItemAnalyzing(item.id, true);
            const formData = new FormData();
            formData.append('file', item.file);
            formData.append('stage', '1');
            formData.append('processMode', processMode);

            try {
                const res = await fetch('/api/process-design', { method: 'POST', body: formData });
                const data = await res.json();
                
                setQueue(q => q.map(i => i.id === item.id ? {
                    ...i,
                    status: data.error_abort ? 'ERROR' : 'STAGE_1',
                    stage1Result: data,
                    errorMessage: data.error || data.quality_notes,
                    isAnalyzing: false
                } : i));
            } catch (err: any) {
                setQueue(q => q.map(i => i.id === item.id ? { ...i, status: 'ERROR', errorMessage: err.message, isAnalyzing: false } : i));
            }
        }
    };

    const applyAIShading = async (item: QueueItem) => {
        setItemAnalyzing(item.id, true);
        const formData = new FormData();
        formData.append('file', item.file); // The API route will convert to base64 and use the prompt

        try {
            const res = await fetch('/api/shade-design', { method: 'POST', body: formData });
            const data = await res.json();
            
            if (data.error) throw new Error(data.error);

            setQueue(q => q.map(i => i.id === item.id ? {
                ...i,
                stage1Result: { ...i.stage1Result, shaded_base64: data.shaded_base64 },
                isAnalyzing: false
            } : i));
        } catch (err: any) {
            setQueue(q => q.map(i => i.id === item.id ? { ...i, errorMessage: 'Shading failed: ' + err.message, isAnalyzing: false } : i));
        }
    };

    const runStage2 = async (item: QueueItem) => {
        setItemAnalyzing(item.id, true);
        const imageBase64 = item.stage1Result?.shaded_base64 || item.stage1Result?.polished_base64;
        
        const formData = new FormData();
        formData.append('base64Image', imageBase64!);
        formData.append('stage', '2');

        try {
            const res = await fetch('/api/process-design', { method: 'POST', body: formData });
            const data = await res.json();
            
            if (data.error) throw new Error(data.error);

            setQueue(q => q.map(i => i.id === item.id ? {
                ...i,
                status: 'STAGE_2',
                stage2Result: data,
                isAnalyzing: false
            } : i));
            
            // Auto select if it looks good
            if (item.stage1Result?.quality_flag === 'GOOD' && !data.ip_flag && !data.cultural_sensitivity) {
                setSelectedIds(prev => {
                    const next = new Set(prev);
                    next.add(item.id);
                    return next;
                });
            }
        } catch (err: any) {
            setQueue(q => q.map(i => i.id === item.id ? { ...i, errorMessage: 'Stage 2 failed: ' + err.message, isAnalyzing: false } : i));
        }
    };

    const runStage3 = async (item: QueueItem) => {
        setItemAnalyzing(item.id, true);
        const imageBase64 = item.stage1Result?.shaded_base64 || item.stage1Result?.polished_base64;
        
        const formData = new FormData();
        formData.append('base64Image', imageBase64!);
        formData.append('stage', '3');

        try {
            const res = await fetch('/api/process-design', { method: 'POST', body: formData });
            const data = await res.json();
            
            if (data.error) throw new Error(data.error);

            setQueue(q => q.map(i => i.id === item.id ? {
                ...i,
                status: 'STAGE_3',
                stage3Result: data,
                isAnalyzing: false
            } : i));
        } catch (err: any) {
            setQueue(q => q.map(i => i.id === item.id ? { ...i, errorMessage: 'Stage 3 failed: ' + err.message, isAnalyzing: false } : i));
        }
    };

    const removeItem = (id: string) => {
        if (isGlobalProcessing) return;
        setQueue(q => q.filter(item => item.id !== id));
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    };

    const clearQueue = () => {
        if (isGlobalProcessing) return;
        setQueue([]);
        setSelectedIds(new Set());
        setPublishResults(new Map());
        setShowClearModal(false);
    };

    const toggleSelection = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const selectAll = () => {
        const publishableIds = queue
            .filter(item => ['STAGE_2', 'STAGE_3', 'COMPLETE'].includes(item.status))
            .map(item => item.id);
            
        if (selectedIds.size === publishableIds.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(publishableIds));
        }
    };

    const publishSelected = async () => {
        if (selectedIds.size === 0) return;
        setIsPublishing(true);

        const newResults = new Map(publishResults);
        selectedIds.forEach(id => newResults.set(id, 'PUBLISHING'));
        setPublishResults(newResults);

        for (const id of Array.from(selectedIds)) {
            const item = queue.find(q => q.id === id);
            if (!item || !item.stage1Result || !item.stage2Result) continue;

            // Convert original file to base64 for master archiving
            const getMasterBase64 = async (file: File): Promise<string> => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const base64String = (reader.result as string).split(',')[1];
                        resolve(base64String);
                    };
                    reader.readAsDataURL(file);
                });
            };

            const masterBase64 = await getMasterBase64(item.file);

            const payload: PublishDesignPayload = {
                // Core Identification
                seo_filename: item.stage2Result.seo_filename!,
                thumbnail_filename: item.stage2Result.thumbnail_filename!,
                slug: item.stage2Result.slug!,
                base64Image: item.stage1Result.shaded_base64 || item.stage1Result.polished_base64!,
                masterBase64: masterBase64,
                status: 'published',
                
                // Stage 2 Taxonomy
                subject: item.stage2Result.subject || 'Unknown Subject',
                public_category: item.stage2Result.public_category || 'minimalist-objects',
                mood: item.stage2Result.mood,
                elements: item.stage2Result.elements,
                alt_text: item.stage2Result.alt_text,
                speakable_summary: item.stage2Result.speakable_summary,
                gender_suitability: item.stage2Result.gender_suitability,
                style_tags: item.stage2Result.style_tags,
                placement_recommendations: item.stage2Result.placement_recommendations,
                meta_title: item.stage2Result.meta_title,
                focus_keyword: item.stage2Result.focus_keyword,
                confidence_score: item.stage2Result.confidence_score,
                ip_flag: item.stage2Result.ip_flag,
                
                // Stage 3 Content (Optional but merged if present)
                meaning: item.stage3Result?.meaning,
                cultural_origin: item.stage3Result?.cultural_origin,
                cultural_sensitivity: item.stage3Result?.cultural_sensitivity,
                artist_technical_notes: item.stage3Result?.artist_technical_notes,
                recommended_needle: item.stage3Result?.recommended_needle,
                minimum_size_cm: item.stage3Result?.minimum_size_cm,
                aging_prediction: item.stage3Result?.aging_prediction,
                pain_level_map: item.stage3Result?.pain_level_map,
                emotion_tags: item.stage3Result?.emotion_tags,
            };

            const result = await publishDesignAction(payload);

            setPublishResults(prev => {
                const updated = new Map(prev);
                updated.set(id, result.success ? (result.isPublished ? 'LIVE' : 'DRAFT') : 'ERROR');
                return updated;
            });

            if (!result.success) {
                setQueue(q => q.map(i => i.id === id ? { ...i, errorMessage: "Atomic DB Ingestion failed: " + result.error } : i));
            }
            if (result.success) {
                setSelectedIds(prev => {
                    const next = new Set(prev);
                    next.delete(id);
                    return next;
                });
            }
        }

        setIsPublishing(false);
    };

    const getPipelineDots = (status: PipelineStage) => {
        const isS1 = ['STAGE_1', 'STAGE_2', 'STAGE_3', 'COMPLETE'].includes(status);
        const isS2 = ['STAGE_2', 'STAGE_3', 'COMPLETE'].includes(status);
        const isS3 = ['STAGE_3', 'COMPLETE'].includes(status);

        return (
            <div className="flex gap-1 items-center bg-black/40 px-2 py-1 border border-white/5">
                <div className={`w-2 h-2 ${isS1 ? 'bg-neutral-400' : 'bg-neutral-800 border border-neutral-700'}`} />
                <div className={`w-2 h-2 ${isS2 ? 'bg-neutral-600' : 'bg-neutral-800 border border-neutral-700'}`} />
                <div className={`w-2 h-2 ${isS3 ? 'bg-green-600' : 'bg-neutral-800 border border-neutral-700'}`} />
            </div>
        );
    };

    return (
        <div className="p-8 max-w-7xl mx-auto font-sans bg-black min-h-screen text-neutral-200">
            <header className="mb-10 border-b border-neutral-800 pb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
                            <Zap className="w-8 h-8 text-yellow-400" />
                            Ingestion Command Center <span className="text-neutral-600 font-medium text-lg">v3.0</span>
                        </h1>
                        <p className="text-neutral-500 mt-2 text-sm max-w-xl">
                            The 3-stage visual intelligence pipeline. Transform raw line art into high-fidelity SEO artifacts with Gemini 2.5 Flash.
                        </p>
                    </div>
                    
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setShowClearModal(true)} 
                            disabled={isGlobalProcessing || queue.length === 0}
                            className="px-4 py-3 bg-brand-red text-white font-mono text-[11px] uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" /> Clear All
                        </button>
                        
                        <button 
                            onClick={runBulkStage1} 
                            disabled={isGlobalProcessing || !queue.some(q => q.status === 'UPLOADED')}
                            className="px-6 py-3 bg-black text-white font-mono text-[11px] uppercase tracking-widest border border-black hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <Layers className="w-4 h-4" /> Bulk Polish (Stage 1)
                        </button>

                        <button 
                            onClick={publishSelected} 
                            disabled={isPublishing || selectedIds.size === 0}
                            className="px-6 py-3 bg-black text-white font-mono text-[11px] uppercase tracking-widest border border-black hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isPublishing ? <span className="animate-pulse">PUBLISHING...</span> : <>⚡ Publish Selected ({selectedIds.size})</>}
                        </button>
                    </div>
                </div>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div className="flex gap-2 bg-neutral-900 border border-neutral-800 p-1 mb-6 w-full">
                        <button 
                            onClick={() => setProcessMode('LINE_ART')} 
                            className={`flex-1 py-2 font-mono text-[11px] uppercase tracking-widest transition-all ${processMode === 'LINE_ART' ? 'bg-white text-black shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
                        >
                            ⚫️ Line Art Mode
                        </button>
                        <button 
                            onClick={() => setProcessMode('COLOR')} 
                            className={`flex-1 py-2 font-mono text-[11px] uppercase tracking-widest transition-all ${processMode === 'COLOR' ? 'bg-white text-black shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
                        >
                            🎨 Color Mode
                        </button>
                    </div>

                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={onFileSelect} 
                        multiple 
                        accept="image/*" 
                        className="hidden" 
                    />
                    <div 
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={onDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-neutral-800 hover:border-neutral-600 hover:bg-neutral-800/40 p-12 flex flex-col items-center justify-center text-center transition-all bg-neutral-900/50 cursor-pointer h-[300px] group"
                    >
                        <UploadCloud className="w-12 h-12 text-neutral-600 mb-4 group-hover:text-white transition-colors" />
                        <h3 className="text-lg font-medium text-white mb-2">Click or Drop designs here</h3>
                        <p className="text-sm text-neutral-500 max-w-[200px]">Supports batch ingestion. Upload raw scans to begin Stage 1.</p>
                    </div>

                    <div className="mt-8 bg-neutral-900/50 border border-neutral-800 p-6">
                        <h4 className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-6 flex items-center gap-2">
                            <Sparkles className="w-3 h-3" />
                            Pipeline Journey
                        </h4>
                        
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div className="w-8 h-8 bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 shrink-0">
                                        <Layers className="w-4 h-4" />
                                    </div>
                                    <div className="w-px h-8 bg-neutral-800 my-1" />
                                </div>
                                <div>
                                    <h5 className="font-mono text-[10px] uppercase tracking-widest text-white mb-1">STAGE 1: Quality & Style</h5>
                                    <p className="text-[10px] text-neutral-500 leading-relaxed">Contrast snaps, edge smoothing, and optional AI Stipple Shading.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div className="w-8 h-8 bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 shrink-0">
                                        <Cpu className="w-4 h-4" />
                                    </div>
                                    <div className="w-px h-8 bg-neutral-800 my-1" />
                                </div>
                                <div>
                                    <h5 className="font-mono text-[10px] uppercase tracking-widest text-white mb-1">STAGE 2: Semantic</h5>
                                    <p className="text-[10px] text-neutral-500 leading-relaxed">Taxonomy lock, gender assignments, and SEO meta-titles.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div className="w-8 h-8 bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 shrink-0">
                                        <Zap className="w-4 h-4" />
                                    </div>
                                </div>
                                <div>
                                    <h5 className="font-mono text-[10px] uppercase tracking-widest text-white mb-1">STAGE 3: Contents</h5>
                                    <p className="text-[10px] text-neutral-500 leading-relaxed">Cultural meaning, pain matrix, and artist technical specs.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-neutral-900/30 border border-neutral-800 p-6">
                        <div className="flex justify-between items-center mb-6 border-b border-neutral-800 pb-4">
                            <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-widest">
                                Command Queue ({queue.length})
                            </h2>
                            <div className="flex gap-4 font-mono text-[10px] uppercase tracking-widest">
                                <label className="flex items-center gap-2 cursor-pointer text-white hover:text-emerald-400">
                                    <input 
                                        type="checkbox" 
                                        onChange={selectAll}
                                        checked={queue.length > 0 && selectedIds.size === queue.filter(item => ['STAGE_2', 'STAGE_3', 'COMPLETE'].includes(item.status)).length}
                                        className="w-4 h-4 border border-neutral-700 bg-neutral-800 text-emerald-500 focus:ring-emerald-500"
                                    />
                                    Select Processed
                                </label>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {queue.map(item => {
                                const isSelected = selectedIds.has(item.id);
                                const pubStatus = publishResults.get(item.id);
                                const canSelect = ['STAGE_2', 'STAGE_3', 'COMPLETE'].includes(item.status);
                                const previewSrc = item.stage1Result?.shaded_base64 
                                    ? `data:image/webp;base64,${item.stage1Result.shaded_base64}` 
                                    : item.stage1Result?.polished_base64
                                        ? `data:image/webp;base64,${item.stage1Result.polished_base64}`
                                        : URL.createObjectURL(item.file);

                                return (
                                <div 
                                    key={item.id} 
                                    className={`group flex items-center gap-4 bg-neutral-900 border ${isSelected ? 'border-brand-red' : 'border-neutral-800'} p-3 hover:bg-neutral-800/50 transition-all`}
                                >
                                    <div className="w-8 flex justify-center shrink-0">
                                        {canSelect && (
                                            <input 
                                                type="checkbox" 
                                                checked={isSelected}
                                                onChange={() => toggleSelection(item.id)}
                                                disabled={isPublishing || pubStatus === 'PUBLISHING'}
                                                className="w-4 h-4 border border-neutral-700 bg-neutral-800 focus:ring-emerald-500 focus:ring-offset-neutral-900 text-emerald-500 cursor-pointer"
                                            />
                                        )}
                                    </div>

                                    <div className="h-20 w-20 bg-neutral-800 flex items-center justify-center overflow-hidden shrink-0 relative border border-neutral-700 group-hover:border-neutral-500 transition-colors">
                                        {item.isAnalyzing && (
                                            <div className="absolute inset-0 bg-black/60 z-20 flex items-center justify-center backdrop-blur-sm">
                                                <Loader2 className="w-6 h-6 text-white animate-spin" />
                                            </div>
                                        )}
                                        <img src={previewSrc} className="h-full w-full object-cover relative z-10" alt="Thumbnail" />
                                        
                                        <button 
                                            onClick={() => setPreviewImage({ src: previewSrc, name: item.originalName })}
                                            className="absolute bottom-1 right-1 z-30 bg-black/80 hover:bg-black text-white p-1.5 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md border border-white/10"
                                            title="Enlarge Image"
                                        >
                                            <Eye className="w-3 h-3" />
                                        </button>
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="flex items-center gap-2">
                                                {getPipelineDots(item.status)}
                                                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 truncate max-w-[120px]">{item.originalName}</span>
                                            </div>
                                            {pubStatus && (
                                                <span className={`px-2 py-1 bg-transparent ${
                                                    pubStatus === 'LIVE' ? 'font-mono text-[9px] uppercase tracking-widest text-green-700 border border-green-700' : 
                                                    pubStatus === 'DRAFT' ? 'font-mono text-[9px] uppercase tracking-widest text-neutral-400 border border-neutral-300' : 
                                                    pubStatus === 'PUBLISHING' ? 'font-mono text-[9px] uppercase tracking-widest text-neutral-400 border border-neutral-200 animate-pulse' : 
                                                    'font-mono text-[9px] uppercase tracking-widest text-brand-red border border-brand-red'
                                                }`}>
                                                    {pubStatus}
                                                </span>
                                            )}
                                        </div>

                                        <div className="text-sm text-white mb-2 h-5 truncate">
                                            {item.errorMessage && !item.errorMessage.includes('Upscaled') ? (
                                                <span className="text-brand-red font-mono text-[10px] uppercase tracking-widest" title={item.errorMessage}>❌ {item.errorMessage}</span>
                                            ) : item.errorMessage && item.errorMessage.includes('Upscaled') ? (
                                                <span className="text-amber-600 font-mono text-[10px] uppercase tracking-widest italic">⚠️ {item.errorMessage}</span>
                                            ) : item.stage2Result?.seo_filename ? (
                                                <span className="text-neutral-400 font-mono text-[10px] uppercase tracking-widest">/{item.stage2Result.seo_filename}</span>
                                            ) : item.status === 'STAGE_1' ? (
                                                <span className="text-neutral-400 font-mono text-[10px] uppercase tracking-widest">Ready for Semantic Analysis</span>
                                            ) : item.status === 'UPLOADED' ? (
                                                <span className="text-neutral-500 font-mono text-[10px] uppercase tracking-widest">Awaiting Bulk Polish</span>
                                            ) : (
                                                <span className="text-neutral-400 font-mono text-[10px] uppercase tracking-widest">Processing...</span>
                                            )}
                                        </div>

                                        {/* Action Buttons Row */}
                                        <div className="flex gap-2">
                                            {item.status === 'STAGE_1' && processMode === 'LINE_ART' && (
                                                <button onClick={() => applyAIShading(item)} disabled={item.isAnalyzing} className="px-2.5 py-1.5 border border-neutral-700 bg-transparent text-neutral-300 hover:bg-neutral-800 font-mono text-[11px] uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1">
                                                    ✨ Apply AI Shading
                                                </button>
                                            )}
                                            
                                            {['STAGE_1', 'STAGE_2'].includes(item.status) && (
                                                <button onClick={() => runStage2(item)} disabled={item.isAnalyzing} className="px-2.5 py-1.5 border border-neutral-700 bg-transparent text-neutral-300 hover:bg-neutral-800 font-mono text-[11px] uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1">
                                                    🧠 Run Stage 2
                                                </button>
                                            )}

                                            {['STAGE_2', 'STAGE_3', 'COMPLETE'].includes(item.status) && (
                                                <button onClick={() => runStage3(item)} disabled={item.isAnalyzing || item.status === 'STAGE_3'} className="px-2.5 py-1.5 border border-neutral-700 bg-transparent text-neutral-300 hover:bg-neutral-800 font-mono text-[11px] uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1">
                                                    📝 Run Stage 3
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {!isGlobalProcessing && (
                                        <button 
                                            onClick={() => removeItem(item.id)}
                                            className="p-2 hover:bg-red-900/30 text-neutral-600 hover:text-brand-red transition-colors shrink-0"
                                            title="Remove from queue"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            )})}
                            {queue.length === 0 && (
                                <div className="text-center py-12 text-sm text-neutral-600">
                                    No designs in queue.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* --- CUSTOM CLEAR CONFIRMATION MODAL --- */}
            {showClearModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={() => setShowClearModal(false)} />
                    <div className="relative bg-neutral-900 border border-neutral-800 p-8 max-w-sm w-full shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)]">
                        <div className="bg-red-500/20 w-12 h-12 flex items-center justify-center mb-6">
                            <AlertCircle className="w-6 h-6 text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Clear entire queue?</h3>
                        <p className="text-neutral-400 text-sm mb-8 leading-relaxed">
                            This will instantly remove all designs from your current session. This action cannot be undone.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button onClick={clearQueue} className="w-full bg-brand-red text-white font-mono text-[11px] uppercase tracking-widest py-3 hover:bg-red-700 transition-colors">Clear Everything</button>
                            <button onClick={() => setShowClearModal(false)} className="w-full bg-neutral-800 text-neutral-300 font-mono text-[11px] uppercase tracking-widest py-3 hover:bg-neutral-700 transition-colors">Keep Designs</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- CUSTOM LIVE QUALITY PREVIEW MODAL --- */}
            {previewImage && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl cursor-pointer" onClick={() => setPreviewImage(null)} />
                    <div className="relative bg-white p-2 max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center">
                        <img src={previewImage.src} alt={previewImage.name} className="w-full h-auto max-h-[85vh] object-contain" />
                        <button onClick={() => setPreviewImage(null)} className="absolute -top-4 -right-4 bg-brand-red hover:bg-red-700 text-white p-2 transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
