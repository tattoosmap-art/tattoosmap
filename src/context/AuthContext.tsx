"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

interface AuthContextType {
    user: User | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // 1. Check session on mount
        supabase.auth.getSession().then(({ data: { session } }) => {
            console.log("[AUTH CONTEXT] Initial session check:", session?.user?.email ?? "NO SESSION");
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // 2. Listen for auth state changes in real-time
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log("[AUTH CONTEXT] Auth event:", event, "User:", session?.user?.email ?? "none");
            setUser(session?.user ?? null);
            setLoading(false);

            // Force Next.js to re-render server components when auth changes
            if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "TOKEN_REFRESHED") {
                router.refresh();
            }
        });

        return () => subscription.unsubscribe();
    }, [router]);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
}
