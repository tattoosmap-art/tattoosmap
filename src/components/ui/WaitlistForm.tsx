"use client";

import { useState } from "react";
import { joinWaitlist } from "@/actions/waitlist";

export default function WaitlistForm() {
    const [email, setEmail] = useState("");
    const [userType, setUserType] = useState<"artist" | "client" | "both">("client");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        
        try {
            const res = await joinWaitlist(email, userType);
            if (res.error) {
                setStatus("error");
                setMessage(res.error);
            } else {
                setStatus("success");
                setMessage(res.message || "YOU ARE ON THE LIST.");
                setEmail("");
            }
        } catch (err) {
            setStatus("error");
            setMessage("Something went wrong. Please try again.");
        }
    };

    if (status === "success") {
        return (
            <div className="p-8 border border-brand-red bg-off-white flex flex-col items-center justify-center min-h-[240px]">
                <p className="font-mono text-[14px] text-brand-red text-center tracking-tight leading-relaxed">
                    {message}
                </p>
                <button 
                  onClick={() => setStatus("idle")}
                  className="mt-6 font-mono text-[11px] uppercase tracking-[0.08em] border-b border-brand-red text-brand-red hover:text-black hover:border-black transition-colors"
                >
                    Add another email
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <div>
                <input 
                    type="email" 
                    required 
                    placeholder="EMAIL ADDRESS"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-14 px-4 bg-white border border-gray-light text-black placeholder:text-gray-mid font-mono text-[14px] focus:outline-none focus:border-brand-red transition-colors rounded-none"
                    disabled={status === "loading"}
                />
            </div>
            <div>
                <select 
                    value={userType}
                    onChange={(e) => setUserType(e.target.value as any)}
                    className="w-full h-14 px-4 bg-white border border-gray-light text-black font-mono text-[14px] focus:outline-none focus:border-brand-red transition-colors rounded-none appearance-none cursor-pointer"
                    disabled={status === "loading"}
                >
                    <option value="client">I AM A TATTOO CLIENT</option>
                    <option value="artist">I AM A TATTOO ARTIST</option>
                    <option value="both">I AM BOTH</option>
                </select>
            </div>
            <button 
                type="submit"
                disabled={status === "loading"}
                className="w-full h-14 bg-brand-red text-white font-mono text-[14px] uppercase tracking-[0.1em] hover:bg-brand-red-dark transition-colors rounded-none disabled:opacity-50"
            >
                {status === "loading" ? "SUBMITTING..." : "JOIN THE WAITLIST"}
            </button>
            {status === "error" && (
                <p className="font-mono text-[11px] text-brand-red uppercase text-center mt-2">{message}</p>
            )}
            <p className="font-mono text-[10px] text-gray-mid text-center uppercase mt-4 tracking-wider">
                NO SPAM. ONE EMAIL WHEN WE LAUNCH.
            </p>
        </form>
    );
}
