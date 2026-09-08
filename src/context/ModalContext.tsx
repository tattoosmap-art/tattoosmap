"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface ModalContextType {
    isLoginModalOpen: boolean;
    openLoginModal: (pendingActionKey?: string) => void;
    closeLoginModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    const openLoginModal = (pendingActionKey?: string) => {
        if (pendingActionKey && typeof window !== "undefined") {
            sessionStorage.setItem("tattoosmap_pending_action", pendingActionKey);
        }
        setIsLoginModalOpen(true);
    };
    const closeLoginModal = () => setIsLoginModalOpen(false);

    return (
        <ModalContext.Provider value={{ isLoginModalOpen, openLoginModal, closeLoginModal }}>
            {children}
        </ModalContext.Provider>
    );
}

export function useModal() {
    const context = useContext(ModalContext);
    if (context === undefined) {
        throw new Error("useModal must be used within a ModalProvider");
    }
    return context;
}
