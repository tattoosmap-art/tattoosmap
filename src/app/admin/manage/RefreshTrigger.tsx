"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * A lightweight client component that provides a global event listener
 * to refresh the server component data when an admin action is performed.
 */
export function RefreshTrigger() {
    const router = useRouter();

    useEffect(() => {
        const handleRefresh = () => {
            router.refresh();
        };

        window.addEventListener("content-updated", handleRefresh);
        return () => window.removeEventListener("content-updated", handleRefresh);
    }, [router]);

    return null;
}
