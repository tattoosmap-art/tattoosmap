"use client";

import React, { useState } from "react";
import { Send, CheckCircle, Mail, MessageCircle, AlertCircle } from "lucide-react";

export default function ContactPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Simulate secure network dispatch
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSuccess(true);
            setFormData({ name: "", email: "", subject: "", message: "" });
        }, 1200);
    };

    return (
        <div className="min-h-screen bg-white text-black selection:bg-brand-red selection:text-white">
            
            {/* MINIMALIST CONTACT HERO */}
            <section className="max-w-[1280px] mx-auto px-4 md:px-6 pt-16 md:pt-24 pb-16 md:pb-20 border-b border-gray-light">
                <div className="flex flex-col">
                    <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-brand-red mb-6 flex items-center gap-2 font-bold">
                        <div className="w-1.5 h-1.5 bg-brand-red" />
                        COMMUNICATIONS DIRECTORY
                    </div>
                    <h1 className="font-display text-[48px] md:text-[80px] leading-[0.9] tracking-tighter uppercase mb-8 max-w-[700px]">
                        GET IN <br/>TOUCH.
                    </h1>
                    <p className="font-sans text-[16px] md:text-[18px] text-gray-mid max-w-[500px] leading-relaxed">
                        Whether it&apos;s media inquiries, artist partnerships, or platform feedback, we reply to human communications within 24 hours.
                    </p>
                </div>
            </section>

            <main className="max-w-[1280px] mx-auto px-4 md:px-6 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-24">
                
                {/* LEFT COLUMN: INFO DETAILS */}
                <div className="lg:col-span-5 space-y-12">
                    
                    <div>
                        <h3 className="font-mono text-[10px] uppercase tracking-widest text-gray-mid mb-4 flex items-center gap-2 font-bold">
                            <Mail className="w-3 h-3" /> DIRECT EMAIL
                        </h3>
                        <a href="mailto:contact@tattoosmap.com" className="font-display text-[24px] md:text-[32px] hover:text-brand-red transition-colors border-b-2 border-black pb-1 break-all">
                            hello@tattoosmap.com
                        </a>
                    </div>

                    <div>
                        <h3 className="font-mono text-[10px] uppercase tracking-widest text-gray-mid mb-4 flex items-center gap-2 font-bold">
                            <MessageCircle className="w-3 h-3" /> SOCIAL CHANNEL
                        </h3>
                        <p className="font-sans text-[15px] text-gray-mid leading-relaxed mb-4">
                            For faster, real-time questions or design repost requests, direct message us on Instagram.
                        </p>
                        <a href="https://instagram.com" target="_blank" rel="noreferrer" className="inline-flex items-center font-mono text-[12px] uppercase tracking-widest border border-black px-6 py-3 hover:bg-black hover:text-white transition-all font-bold">
                            Visit Instagram &rarr;
                        </a>
                    </div>

                    <div className="bg-neutral-50 p-6 border border-neutral-200 flex items-start gap-4">
                        <AlertCircle className="w-5 h-5 text-black shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-mono text-[10px] uppercase tracking-widest font-bold text-black mb-1">Notice for Artists</h4>
                            <p className="font-sans text-[13px] text-gray-mid leading-relaxed">
                                We do not currently accept unsolicited portfolio submissions via direct email. Please use the dashboard to set up your secure profile.
                            </p>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: DYNAMIC FORM */}
                <div className="lg:col-span-7 bg-white border border-black p-8 md:p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative">
                    
                    {isSuccess ? (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500">
                            <div className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center mb-6">
                                <CheckCircle className="w-10 h-10" />
                            </div>
                            <h2 className="font-display text-[32px] uppercase tracking-tight mb-4">Message Dispatched</h2>
                            <p className="font-sans text-gray-mid max-w-[350px] mb-8 leading-relaxed">
                                Your communication has been logged. A human representative will review and route it to the appropriate queue shortly.
                            </p>
                            <button 
                                onClick={() => setIsSuccess(false)}
                                className="font-mono text-[11px] uppercase tracking-[0.2em] border-b-2 border-black pb-1 font-bold hover:text-brand-red hover:border-brand-red transition-colors"
                            >
                                Send Another Transmission
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                            
                            <div className="flex flex-col md:flex-row gap-8">
                                {/* Full Name */}
                                <div className="flex-1 flex flex-col gap-2">
                                    <label htmlFor="name" className="font-mono text-[10px] uppercase tracking-widest text-black font-bold">
                                        Full Identity
                                    </label>
                                    <input 
                                        type="text" 
                                        id="name" 
                                        required
                                        placeholder="First Last"
                                        className="w-full border-b border-neutral-300 focus:border-black py-3 px-1 text-[15px] font-sans transition-colors outline-none bg-transparent"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                {/* Email */}
                                <div className="flex-1 flex flex-col gap-2">
                                    <label htmlFor="email" className="font-mono text-[10px] uppercase tracking-widest text-black font-bold">
                                        Return Address
                                    </label>
                                    <input 
                                        type="email" 
                                        id="email" 
                                        required
                                        placeholder="name@domain.com"
                                        className="w-full border-b border-neutral-300 focus:border-black py-3 px-1 text-[15px] font-sans transition-colors outline-none bg-transparent"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Subject */}
                            <div className="flex flex-col gap-2">
                                <label htmlFor="subject" className="font-mono text-[10px] uppercase tracking-widest text-black font-bold">
                                    Communication Classification
                                </label>
                                <select 
                                    id="subject" 
                                    required
                                    className="w-full border-b border-neutral-300 focus:border-black py-3 px-1 text-[15px] font-sans transition-colors outline-none bg-transparent appearance-none cursor-pointer"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                >
                                    <option value="" disabled>Select category...</option>
                                    <option value="general">General Inquiry</option>
                                    <option value="press">Press & Media</option>
                                    <option value="support">Platform Technical Issue</option>
                                    <option value="partnership">Partnership Request</option>
                                </select>
                            </div>

                            {/* Message */}
                            <div className="flex flex-col gap-2">
                                <label htmlFor="message" className="font-mono text-[10px] uppercase tracking-widest text-black font-bold">
                                    Transmission Content
                                </label>
                                <textarea 
                                    id="message" 
                                    required
                                    rows={5}
                                    placeholder="Enter description of request..."
                                    className="w-full border border-neutral-200 focus:border-black p-4 text-[15px] font-sans transition-colors outline-none bg-neutral-50 resize-none"
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                />
                            </div>

                            {/* Submit */}
                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="w-full bg-black text-white font-mono text-[12px] uppercase tracking-[0.3em] font-bold py-5 px-8 flex items-center justify-center gap-3 hover:bg-brand-red transition-all duration-300 disabled:bg-neutral-400 disabled:cursor-wait group"
                            >
                                {isSubmitting ? (
                                    <>ENCIPHERING DATA...</>
                                ) : (
                                    <>
                                        EXECUTE TRANSMISSION <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </>
                                )}
                            </button>

                            <div className="text-center text-[11px] text-neutral-400 font-sans">
                                Encrypted pipeline. Zero third-party distribution.
                            </div>

                        </form>
                    )}

                </div>
            </main>

        </div>
    );
}
