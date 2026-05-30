"use client";

import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ToastContextType {
    showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => { } });

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toast, setToast] = useState<string | null>(null);

    const showToast = useCallback((message: string) => {
        setToast(message);
    }, []);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 2400);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        key="toast"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] bg-black text-white px-8 py-4 font-mono text-[12px] uppercase tracking-[0.15em] border border-white/10"
                    >
                        {toast}
                    </motion.div>
                )}
            </AnimatePresence>
        </ToastContext.Provider>
    );
}
