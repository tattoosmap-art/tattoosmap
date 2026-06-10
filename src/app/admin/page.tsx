"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Upload, X, CheckCircle2, AlertCircle, LogOut } from "lucide-react";

interface UploadTask {
    file: File;
    id: string;
    progress: number;
    status: 'pending' | 'uploading' | 'success' | 'error';
    error?: string;
}

export default function AdminPage() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);
    const [loginEmail, setLoginEmail] = useState("");

    const [tasks, setTasks] = useState<UploadTask[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    const TARGET_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "";

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user?.email === TARGET_EMAIL) {
                setIsAuthenticated(true);
            } else if (session?.user) {
                // Logged in but wrong email
                await supabase.auth.signOut();
                router.push('/');
            }
            setIsLoadingAuth(false);
        };

        checkUser();

        // Listen for auth changes
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN') {
                if (session?.user?.email === TARGET_EMAIL) {
                    setIsAuthenticated(true);
                } else {
                    await supabase.auth.signOut();
                    router.push('/');
                }
            } else if (event === 'SIGNED_OUT') {
                setIsAuthenticated(false);
                router.push('/');
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [router]);

    const handleMockLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        // Note: For this mock demonstration environment where Supabase might not be fully configured,
        // we simulate a successful login if they type the correct master email, bypassing OTP.
        if (loginEmail === TARGET_EMAIL) {
            // Mock authentication success
            setIsAuthenticated(true);
        } else {
            alert("Unauthorized. Only the master admin email can access this portal.");
            router.push('/');
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setIsAuthenticated(false);
        router.push('/');
    };

    // --- Drag and Drop Logic ---
    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(Array.from(e.dataTransfer.files));
        }
    }, []);

    const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(Array.from(e.target.files));
        }
    };

    const handleFiles = (files: File[]) => {
        const newTasks = files.map(file => ({
            file,
            id: Math.random().toString(36).substring(7),
            progress: 0,
            status: 'pending' as const
        }));
        setTasks(prev => [...prev, ...newTasks]);
    };

    // --- Upload Logic ---
    const startUpload = async () => {
        const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'error');
        if (pendingTasks.length === 0) return;

        // Process sequentially to not override localhost network limits, but in real app use Promise.all limiters
        for (const task of pendingTasks) {
            // Update to uploading
            setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'uploading', progress: 10 } : t));

            const formData = new FormData();
            formData.append('type', 'internal');
            formData.append('image', task.file);

            try {
                // Simulate progress
                setTasks(prev => prev.map(t => t.id === task.id ? { ...t, progress: 50 } : t));

                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'success', progress: 100 } : t));
                } else {
                    const data = await response.json();
                    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'error', error: data.error || 'Upload failed', progress: 0 } : t));
                }
            } catch (error) {
                setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'error', error: 'Network error', progress: 0 } : t));
            }
        }
    };

    const clearCompleted = () => {
        setTasks(prev => prev.filter(t => t.status !== 'success'));
    };

    const removeTask = (id: string) => {
        setTasks(prev => prev.filter(t => t.id !== id));
    };

    if (isLoadingAuth) {
        return <div className="w-full h-screen flex items-center justify-center bg-white"><div className="animate-pulse font-mono tracking-widest text-brand-red uppercase text-[12px]">Verifying Identity...</div></div>;
    }

    if (!isAuthenticated) {
        return (
            <div className="w-full min-h-screen bg-off-white flex justify-center items-center px-4">
                <div className="w-full max-w-md bg-white p-8 border border-gray-light rounded-none text-center">
                    <h1 className="font-display text-[32px] text-black mb-2">Admin Portal</h1>
                    <p className="text-[14px] text-gray-mid mb-8">Secure area. Please authenticate to continue.</p>

                    <form onSubmit={handleMockLogin} className="flex flex-col gap-4">
                        <input
                            type="email"
                            placeholder="Enter master email"
                            required
                            value={loginEmail}
                            onChange={e => setLoginEmail(e.target.value)}
                            className="w-full h-12 px-4 border border-gray-light rounded-none text-[14px] focus:outline-none focus:border-black transition-colors"
                        />
                        <button type="submit" className="w-full h-12 bg-black text-white text-[13px] uppercase font-mono tracking-widest rounded-none hover:bg-brand-red transition-colors">
                            Authenticate
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-off-white">
            <header className="bg-white border-b border-gray-light px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <h1 className="font-display text-[24px] text-black">TattoosMap Admin</h1>
                    <span className="bg-green-100 text-green-700 font-mono text-[10px] uppercase tracking-widest px-2 py-1 rounded-none">Secure Session</span>
                </div>
                <button onClick={handleLogout} className="text-gray-mid hover:text-brand-red transition-colors flex items-center gap-2 text-[13px]">
                    <LogOut className="w-4 h-4" /> Exit Portal
                </button>
            </header>

            <main className="max-w-[1000px] mx-auto px-4 md:px-6 py-12">
                <div className="mb-8 flex justify-between items-end">
                    <div>
                        <h2 className="font-display text-[32px] text-black mb-2">Bulk Image Importer</h2>
                        <p className="text-[14px] text-gray-mid">Drag and drop high-res designs. They will be watermarked, resized, and hashed automatically.</p>
                    </div>
                </div>

                {/* Dropzone */}
                <div
                    className={`w-full p-12 mb-8 border-2 border-dashed rounded-none flex flex-col items-center justify-center transition-colors duration-200 ${isDragging ? 'border-brand-red bg-brand-red/5' : 'border-gray-light bg-white hover:border-gray-mid'}`}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                >
                    <Upload className={`w-12 h-12 mb-4 ${isDragging ? 'text-brand-red' : 'text-gray-mid'}`} strokeWidth={1} />
                    <p className="text-[16px] text-black font-medium mb-2">Drag 20+ images here</p>
                    <p className="text-[13px] text-gray-mid mb-6 max-w-sm text-center">Supports WEBP, JPEG, and PNG up to 5MB each. Processing will execute sequentially to protect server loads.</p>

                    <label className="cursor-pointer bg-off-white text-black hover:bg-black hover:text-white transition-colors duration-200 border border-gray-light text-[13px] uppercase font-mono tracking-widest px-8 py-3 rounded-none inline-block">
                        Browse Files
                        <input type="file" multiple className="hidden" accept="image/jpeg, image/png, image/webp" onChange={onFileInput} />
                    </label>
                </div>

                {/* Task List */}
                {tasks.length > 0 && (
                    <div className="bg-white border border-gray-light rounded-none overflow-hidden">
                        <div className="bg-off-white px-6 py-4 flex justify-between items-center border-b border-gray-light">
                            <h3 className="font-display text-[18px] text-black">Upload Queue ({tasks.length})</h3>
                            <div className="flex gap-4">
                                <button onClick={clearCompleted} className="text-[12px] text-gray-mid hover:text-black transition-colors uppercase font-mono tracking-widest">
                                    Clear Done
                                </button>
                                <button onClick={startUpload} className="bg-brand-red text-white text-[12px] uppercase font-mono tracking-widest px-6 py-2 rounded-none hover:bg-brand-red-dark transition-colors">
                                    Start Processing
                                </button>
                            </div>
                        </div>

                        <ul className="divide-y divide-gray-light max-h-[500px] overflow-y-auto w-full">
                            {tasks.map(task => (
                                <li key={task.id} className="p-4 flex items-center justify-between hover:bg-off-white/50 transition-colors">
                                    <div className="flex items-center gap-4 w-[40%]">
                                        <div className="w-10 h-10 bg-off-white rounded-none border border-gray-light overflow-hidden flex-shrink-0 relative flex items-center justify-center text-[10px] text-gray-mid font-mono">
                                            {task.file.type.split('/')[1] || 'img'}
                                        </div>
                                        <div className="truncate text-[13px] text-black font-medium" title={task.file.name}>
                                            {task.file.name}
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-[40%] px-4">
                                        <div className="h-2 w-full bg-off-white rounded-none overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-300 ${task.status === 'error' ? 'bg-brand-red' : task.status === 'success' ? 'bg-green-500' : 'bg-black'}`}
                                                style={{ width: `${task.progress}%` }}
                                            />
                                        </div>
                                        {task.error && <p className="text-[11px] text-brand-red mt-1">{task.error}</p>}
                                    </div>

                                    {/* Status Icon & Delete */}
                                    <div className="w-[20%] flex items-center justify-end gap-4">
                                        {task.status === 'success' && <CheckCircle2 className="w-5 h-5 text-green-500" strokeWidth={1.5} />}
                                        {task.status === 'error' && <AlertCircle className="w-5 h-5 text-brand-red" strokeWidth={1.5} />}
                                        {(task.status === 'pending' || task.status === 'error') && (
                                            <button onClick={() => removeTask(task.id)} className="text-gray-mid hover:text-brand-red transition-colors p-1" aria-label="Remove task">
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </main>
        </div>
    );
}
