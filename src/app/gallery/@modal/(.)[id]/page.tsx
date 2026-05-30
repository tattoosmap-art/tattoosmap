import { notFound } from "next/navigation";
import { designService } from "@/services/designService";

import ModalOverlay from "@/components/gallery/ModalOverlay";
import DesignDetailClient from "@/components/gallery/DesignDetailClient";
import SimilarDesignsBar from "@/components/gallery/SimilarDesignsBar";

export default async function DesignInterceptPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Load full data payload via core orchestrator
    const pageData = await designService.getDesignPageData(id);
    const design = pageData.design;

    if (!design) {
        notFound();
    }

    return (
        <ModalOverlay>
            <div className="w-full flex flex-col justify-start pb-16">
                
                {/* Renders the exact, premium Design Lab Layout structure within the modal boundaries */}
                <DesignDetailClient 
                    design={design} 
                    publicCollections={pageData.publicCollections || []}
                    hideStickyNav={true} 
                />

                {/* ========================================================= */}
                {/* PARITY SIMILARITY BAR (MATCH ENGINE)                       */}
                {/* ========================================================= */}
                <div className="w-full border-t border-neutral-200 bg-neutral-50 pt-20 pb-16 flex flex-col gap-20">
                    <section aria-label="Intercept Aesthetic Match">
                        <div className="max-w-[1280px] mx-auto px-4 md:px-8 mb-10">
                            <div className="flex items-center gap-3 text-black mb-2">
                                <span className="font-mono text-[11px] uppercase font-bold tracking-[0.3em] text-neutral-400">STYLE MATCH</span>
                            </div>
                            <h2 className="font-display text-[32px] tracking-tight uppercase leading-none">More Designs in this Style</h2>
                        </div>
                        <SimilarDesignsBar currentDesignId={design.id} mode="visual" hideHeader={true} />
                    </section>

                    <section aria-label="Intercept Conceptual Match" className="pb-16">
                        <div className="max-w-[1280px] mx-auto px-4 md:px-8 mb-10">
                            <div className="flex items-center gap-3 text-black mb-2">
                                <span className="font-mono text-[11px] uppercase font-bold tracking-[0.3em] text-neutral-400">MEANING MATCH</span>
                            </div>
                            <h2 className="font-display text-[32px] tracking-tight uppercase leading-none">More Designs with Similar Meanings</h2>
                        </div>
                        <div className="opacity-90">
                            <SimilarDesignsBar currentDesignId={design.id} mode="conceptual" hideHeader={true} />
                        </div>
                    </section>
                </div>

            </div>
        </ModalOverlay>
    );
}
