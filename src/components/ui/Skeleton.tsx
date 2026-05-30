"use client";

import { motion } from "framer-motion";

export const Skeleton = ({ className, height, width }: { className?: string; height?: string; width?: string }) => {
    return (
        <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            className={`bg-gray-light/20 rounded-none w-full ${className}`}
            style={{ height, width }}
        />
    );
};

export const GallerySkeleton = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="flex flex-col gap-4">
                    <Skeleton height={i % 2 === 0 ? "400px" : "300px"} className="w-full" />
                    <div className="flex flex-col gap-2">
                        <Skeleton height="14px" width="40%" />
                        <Skeleton height="18px" width="70%" />
                    </div>
                </div>
            ))}
        </div>
    );
};
